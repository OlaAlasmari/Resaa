from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
from catboost import CatBoostRegressor, CatBoostClassifier, Pool
from datetime import datetime
import math
import json

app = Flask(__name__)
CORS(app)

model = CatBoostRegressor()
model.load_model("src/Resaa_AI/models/price_model.cbm")

df_ref = pd.read_csv("src/Resaa_AI/data/cleaned/Jeddah_preprocessed.csv")
nbhd_medians = df_ref.groupby("neighborhood")["area_sqm"].median().to_dict()
global_land_avg = df_ref[df_ref["property_type"] == "قطعة أرض"]["price_per_sqm"].mean()

CAT_COLS = ["classification", "property_type", "neighborhood", "plan_no", "parcel_no"]
MIN_TX = 10

PERMITTED_USES = {
    "سكني":  ["شقة", "فيلا", "مبنى سكني"],
    "تجاري": ["وحدة تجارية", "محل تجاري", "مكتب"],
    "زراعي": ["أرض زراعية"],
    "أخرى":  ["شقة", "فيلا"],
}

auction_model = CatBoostRegressor()
auction_model.load_model("src/Resaa_AI/models/starting_price_model.cbm")

with open("src/Resaa_AI/models/auction_model_meta.json", "r", encoding="utf-8") as f:
    _meta = json.load(f)

_AUCTION_FEATURES        = _meta["features"]
_AUCTION_CAT_COLS        = _meta["cat_cols"]
_area_bucket_mode        = _meta["area_bucket_mode"]
_start_price_bucket_mode = _meta["start_price_bucket_mode"]
_global_ratio            = _meta["global_ratio"]
_time_period_map         = _meta["time_period_map"]
_day_group_map           = _meta["day_group_map"]
_month_part_map          = _meta["month_part_map"]
_season_map              = _meta["season_map"]
_ptype_map               = _meta["ptype_map"]
_region_map              = _meta["region_map"]
_ptype_season_map        = _meta["ptype_season_map"]
_known_cities            = set(_meta["known_cities"])
_known_districts         = set(_meta["known_districts"])
_known_properties        = set(_meta["known_properties"])
_known_regions           = set(_meta["known_regions"])

df_auction = pd.read_csv("src/Resaa_AI/data/cleaned/soum_base_cleaned.csv")
df_auction["start_time"] = pd.to_datetime(df_auction["start_time"], errors="coerce")
df_auction = df_auction[df_auction["start_time"].notna()].copy()
df_auction = df_auction[df_auction["start_price"].notna() & (df_auction["start_price"] > 0)].copy()
df_auction = df_auction[df_auction["area"].notna() & (df_auction["area"] > 0)].copy()
df_auction = df_auction.sort_values("start_time").reset_index(drop=True)

def _group_rare_inf(series, min_count=8):
    series = series.fillna("Unknown").astype(str).str.strip()
    vc = series.value_counts()
    keep = vc[vc >= min_count].index
    return series.where(series.isin(keep), "Other")

df_auction["property_grouped"] = _group_rare_inf(df_auction["property_type"], min_count=6)
_split_idx = int(len(df_auction) * 0.80)
_train_ref = df_auction.iloc[:_split_idx].copy()


def build_features(data):
    area         = float(data["area_sqm"])
    neighborhood = str(data.get("neighborhood", "")).strip()
    month        = int(data.get("month", 1))
    row = {
        "classification": str(data.get("classification", "سكني")),
        "property_type":  str(data.get("property_type", "قطعة أرض")),
        "neighborhood":   neighborhood,
        "plan_no":        str(data.get("plan_no", "0")),
        "parcel_no":      str(data.get("parcel_no", "0")),
        "area_sqm":       area,
        "year":           int(data.get("year", 2025)),
        "month":          month,
        "log_area":       np.log1p(area),
        "area_vs_nbhd":   area / (nbhd_medians.get(neighborhood, area) + 1),
        "sin_month":      np.sin(2 * np.pi * month / 12),
        "cos_month":      np.cos(2 * np.pi * month / 12),
    }
    X = pd.DataFrame([row])
    for col in CAT_COLS:
        X[col] = X[col].astype(str)
    return X


def _safe_group(value, known_set):
    value = str(value).strip()
    return value if value in known_set else "Other"


def _apply_auction_history(data):
    data = data.copy()
    data["_ptype_season_key"]        = data["property_grouped"] + "__" + data["season_group"]
    data["time_period_ratio_hist"]   = data["time_period"].map(_time_period_map).fillna(_global_ratio)
    data["day_group_ratio_hist"]     = data["day_group"].map(_day_group_map).fillna(_global_ratio)
    data["month_part_ratio_hist"]    = data["month_part"].map(_month_part_map).fillna(_global_ratio)
    data["season_ratio_hist"]        = data["season_group"].map(_season_map).fillna(_global_ratio)
    data["ptype_ratio_hist"]         = data["property_grouped"].map(_ptype_map).fillna(_global_ratio)
    data["region_ratio_hist"]        = data["region_grouped"].map(_region_map).fillna(_global_ratio)
    data["ptype_season_ratio_hist"]  = data["_ptype_season_key"].map(_ptype_season_map).fillna(_global_ratio)
    return data


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data          = request.get_json()
        X             = build_features(data)
        cat_idx       = [X.columns.get_loc(c) for c in CAT_COLS]
        pool          = Pool(X, cat_features=cat_idx)
        log_pred      = model.predict(pool)[0]
        price_per_sqm = np.expm1(log_pred)
        area          = float(data["area_sqm"])
        total_price   = price_per_sqm * area
        low           = round(total_price * 0.92 / 1000) * 1000
        high          = round(total_price * 1.08 / 1000) * 1000
        nbhd          = data.get("neighborhood", "").strip()
        count         = df_ref[df_ref["neighborhood"] == nbhd].shape[0]
        nbhd_avg      = df_ref[df_ref["neighborhood"] == nbhd]["price_per_sqm"].median()

        if count >= 100:  demand = "عالي جداً"
        elif count >= 50: demand = "عالي"
        elif count >= 20: demand = "متوسط"
        else:             demand = "منخفض"

        raw_pct          = (1 - price_per_sqm / nbhd_avg) * 100 if nbhd_avg else 0
        below_market_pct = 0 if math.isnan(raw_pct) else round(raw_pct, 1)

        return jsonify({
            "price_per_sqm":    round(price_per_sqm),
            "total_price":      round(total_price),
            "price_range":      {"low": low, "high": high},
            "demand_indicator": demand,
            "demand_basis":     f"بناءً على {count} صفقة مشابهة",
            "below_market_pct": below_market_pct,
            "max_bid":          high,
            "annual_growth":    12,
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/recommend", methods=["POST"])
def recommend():
    try:
        data               = request.get_json()
        area               = float(data["area_sqm"])
        neighborhood       = str(data.get("neighborhood",   "")).strip()
        classification     = str(data.get("classification", "سكني")).strip()
        current_type       = str(data.get("property_type",  "")).strip()
        land_price         = float(data.get("land_price",         0))
        development_budget = float(data.get("development_budget", 0))
        total_investment   = land_price + development_budget
        has_roi            = total_investment > 0
        permitted          = PERMITTED_USES.get(classification, ["شقة", "فيلا", "قطعة أرض"])
        results            = []

        for ptype in permitted:
            if ptype == current_type:
                continue
            mask     = (df_ref["neighborhood"] == neighborhood) & (df_ref["property_type"] == ptype)
            tx_count = df_ref[mask].shape[0]
            if tx_count < MIN_TX:
                continue

            X             = build_features({**data, "property_type": ptype})
            cat_idx       = [X.columns.get_loc(c) for c in CAT_COLS]
            log_pred      = model.predict(Pool(X, cat_features=cat_idx))[0]
            price_sqm     = np.expm1(log_pred)
            total_val     = price_sqm * area
            value_multiplier = price_sqm / global_land_avg if global_land_avg > 0 else 1.0
            value_multiplier = 0 if math.isnan(value_multiplier) else round(value_multiplier, 2)
            value_increase   = round((value_multiplier - 1) * 100, 1)

            if tx_count >= 100: confidence = "عالي"
            elif tx_count >= 30: confidence = "متوسط"
            else:                confidence = "منخفض"

            total_in_nbhd = df_ref[df_ref["neighborhood"] == neighborhood].shape[0]
            market_share  = round(tx_count / total_in_nbhd * 100, 1) if total_in_nbhd > 0 else 0
            real_avg_raw  = df_ref[mask]["price_per_sqm"].mean()
            real_avg      = None if math.isnan(real_avg_raw) else round(real_avg_raw)
            profit        = round(total_val - total_investment) if has_roi else None
            roi           = round((total_val - total_investment) / total_investment * 100, 1) if has_roi else None

            results.append({
                "property_type":      ptype,
                "price_per_sqm":      round(price_sqm),
                "total_value":        round(total_val),
                "real_avg_sqm":       real_avg,
                "tx_count":           tx_count,
                "confidence":         confidence,
                "market_share":       market_share,
                "value_multiplier":   value_multiplier,
                "value_increase_pct": value_increase,
                "profit":             profit,
                "roi":                roi,
                "has_roi":            has_roi,
            })

        if has_roi:
            results.sort(key=lambda x: x["roi"] if x["roi"] is not None else -999, reverse=True)
        else:
            results.sort(key=lambda x: x["value_multiplier"], reverse=True)

        for i, r in enumerate(results):
            r["rank"] = i + 1

        if not results:
            return jsonify({"error": "لا توجد بيانات كافية لهذا الحي والتصنيف"}), 404

        return jsonify({
            "area":               area,
            "neighborhood":       neighborhood,
            "classification":     classification,
            "current_type":       current_type,
            "global_land_avg":    round(global_land_avg),
            "has_roi":            has_roi,
            "land_price":         round(land_price),
            "development_budget": round(development_budget),
            "total_investment":   round(total_investment) if has_roi else None,
            "recommendations":    results,
            "best_use":           results[0]["property_type"],
            "best_value":         results[0]["total_value"],
            "best_multiplier":    results[0]["value_multiplier"],
            "best_roi":           results[0]["roi"] if has_roi else None,
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/auction-strategy", methods=["POST"])
def auction_strategy():
    try:
        data          = request.get_json()
        area          = float(data["area"])
        target_price  = float(data["target_price"])
        n_price_steps = int(data.get("n_price_steps", 12))
        durations     = data.get("durations", [24, 48, 72])
        return_top_n  = int(data.get("return_top_n", 5))

        city_grouped     = _safe_group(data.get("city",          "Unknown"), _known_cities)
        district_grouped = _safe_group(data.get("district",      "Unknown"), _known_districts)
        property_grouped = _safe_group(data.get("property_type", "Unknown"), _known_properties)
        region_grouped   = _safe_group(data.get("region",        "Unknown"), _known_regions)

        subset      = _train_ref.copy()
        prop_subset = subset[subset["property_grouped"] == property_grouped]
        if len(prop_subset) >= 10:
            subset = prop_subset

        sp_min = max(1000, min(subset["start_price"].quantile(0.15), 0.15 * target_price))
        sp_max = min(max(subset["start_price"].quantile(0.85), 0.75 * target_price), 0.95 * target_price)
        if sp_max <= sp_min:
            sp_max = sp_min * 2

        start_prices  = np.linspace(sp_min, sp_max, n_price_steps)
        _time_options = {
            "morning":   {"hour": 9,  "range": "9:00 AM - 11:00 AM"},
            "afternoon": {"hour": 14, "range": "1:00 PM - 4:00 PM"},
            "evening":   {"hour": 18, "range": "5:00 PM - 9:00 PM"},
        }
        _day_groups  = ["weekday", "weekend"]
        _month_parts = ["beginning_month", "middle_month", "end_month"]
        _rep_day     = {"weekday": 1, "weekend": 4}
        _rep_month   = {"Q1": 2, "Q2": 5, "Q3": 8, "Q4": 11}

        now             = datetime.now()
        current_year    = now.year
        current_quarter = (now.month - 1) // 3 + 1
        season_groups   = [f"Q{q}" for q in range(current_quarter, 5)]

        rows = []
        for sp in start_prices:
            for tp, tp_info in _time_options.items():
                for dg in _day_groups:
                    for mp in _month_parts:
                        for sg in season_groups:
                            for dur in durations:
                                start_hour      = tp_info["hour"]
                                start_dayofweek = _rep_day[dg]
                                start_month     = _rep_month[sg]
                                start_quarter   = int(sg.replace("Q", ""))
                                rows.append({
                                    "city_grouped":        city_grouped,
                                    "district_grouped":    district_grouped,
                                    "property_grouped":    property_grouped,
                                    "region_grouped":      region_grouped,
                                    "start_price":         float(sp),
                                    "area":                float(area),
                                    "duration_hours":      float(dur),
                                    "start_hour":          int(start_hour),
                                    "start_dayofweek":     int(start_dayofweek),
                                    "start_month":         int(start_month),
                                    "start_quarter":       int(start_quarter),
                                    "start_year":          int(current_year),
                                    "time_period":         tp,
                                    "recommended_time_range": tp_info["range"],
                                    "day_group":           dg,
                                    "month_part":          mp,
                                    "season_group":        sg,
                                    "is_weekend":          int(dg == "weekend"),
                                    "is_morning":          int(tp == "morning"),
                                    "is_evening":          int(tp == "evening"),
                                    "start_price_log":     np.log1p(sp),
                                    "area_log":            np.log1p(area),
                                    "duration_log":        np.log1p(dur),
                                    "start_price_per_sqm": sp / (area + 1),
                                    "area_x_price":        area * sp,
                                    "hour_sin":            np.sin(2 * np.pi * start_hour  / 24),
                                    "hour_cos":            np.cos(2 * np.pi * start_hour  / 24),
                                    "month_sin":           np.sin(2 * np.pi * start_month / 12),
                                    "month_cos":           np.cos(2 * np.pi * start_month / 12),
                                    "area_bucket":         _area_bucket_mode,
                                    "start_price_bucket":  _start_price_bucket_mode,
                                })

        grid_df = pd.DataFrame(rows)
        grid_df = _apply_auction_history(grid_df)

        for col in _AUCTION_FEATURES:
            if col not in grid_df.columns:
                grid_df[col] = "Unknown" if col in _AUCTION_CAT_COLS else 0
        for col in _AUCTION_CAT_COLS:
            grid_df[col] = grid_df[col].fillna("Unknown").astype(str)

        model_input     = grid_df[_AUCTION_FEATURES].copy()
        cat_idx_auction = [model_input.columns.get_loc(c) for c in _AUCTION_CAT_COLS]
        pool_auction    = Pool(model_input, cat_features=cat_idx_auction)
        pred_ratio      = np.expm1(auction_model.predict(pool_auction)).clip(min=1.0)
        expected_final  = model_input["start_price"].values * pred_ratio

        results = pd.DataFrame({
            "recommended_start_price": model_input["start_price"].values,
            "duration_hours":          model_input["duration_hours"].values,
            "time_period":             grid_df["time_period"].values,
            "recommended_time_range":  grid_df["recommended_time_range"].values,
            "day_group":               grid_df["day_group"].values,
            "month_part":              grid_df["month_part"].values,
            "season_group":            grid_df["season_group"].values,
            "predicted_sale_ratio":    pred_ratio,
            "expected_final_price":    expected_final,
        })

        results["target_gap"]      = results["expected_final_price"] - target_price
        results["expected_return"] = results["expected_final_price"] - results["recommended_start_price"]
        valid = results[results["expected_final_price"] >= target_price].copy()

        if valid.empty:
            closest = results.nlargest(1, "expected_final_price").iloc[0]
            return jsonify({
                "status":        "below_target",
                "message":       "لم تصل أي استراتيجية للسعر المستهدف. يُعرض أفضل سيناريو متاح.",
                "target_price":  round(target_price),
                "best_strategy": {
                    "recommended_start_price":   round(closest["recommended_start_price"]),
                    "expected_final_price":       round(closest["expected_final_price"]),
                    "expected_return":            round(closest["expected_return"]),
                    "recommended_time_range":     closest["recommended_time_range"],
                    "recommended_duration_hours": int(closest["duration_hours"]),
                    "best_quarter":               closest["season_group"],
                    "day_group":                  closest["day_group"],
                    "month_part":                 closest["month_part"],
                },
                "top_strategies": [],
            }), 200

        valid["target_score"]   = 1 / (1 + (valid["target_gap"] / target_price))
        valid["return_score"]   = valid["expected_return"] / (valid["expected_return"].max() + 1e-6)
        valid["strategy_score"] = 0.70 * valid["target_score"] + 0.30 * valid["return_score"]

        top  = valid.sort_values(by=["strategy_score", "target_score", "expected_return"], ascending=False).head(return_top_n).reset_index(drop=True)
        best = top.iloc[0]

        top_list = [
            {
                "rank":                    int(i + 1),
                "recommended_start_price": round(float(r["recommended_start_price"])),
                "expected_final_price":    round(float(r["expected_final_price"])),
                "expected_return":         round(float(r["expected_return"])),
                "predicted_sale_ratio":    round(float(r["predicted_sale_ratio"]), 2),
                "recommended_time_range":  r["recommended_time_range"],
                "day_group":               r["day_group"],
                "month_part":              r["month_part"],
                "season_group":            r["season_group"],
                "duration_hours":          int(r["duration_hours"]),
                "strategy_score":          round(float(r["strategy_score"]), 4),
            }
            for i, r in top.iterrows()
        ]

        return jsonify({
            "status":       "success",
            "target_price": round(target_price),
            "area":         area,
            "best_strategy": {
                "recommended_start_price":    round(float(best["recommended_start_price"])),
                "expected_final_price":       round(float(best["expected_final_price"])),
                "expected_return":            round(float(best["expected_return"])),
                "recommended_time_range":     best["recommended_time_range"],
                "recommended_duration_hours": int(best["duration_hours"]),
                "best_quarter":               best["season_group"],
                "day_group":                  best["day_group"],
                "month_part":                 best["month_part"],
            },
            "top_strategies": top_list,
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/neighborhoods", methods=["GET"])
def neighborhoods():
    return jsonify(sorted(df_ref["neighborhood"].dropna().unique().tolist()))


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

# ── Fraud Detection Model ─────────────────────────────────────────────────────
fraud_model = CatBoostClassifier()
fraud_model.load_model("src/Resaa_AI/models/fraud_model.cbm")

with open("src/Resaa_AI/models/fraud_model_meta.json", "r", encoding="utf-8") as f:
    fraud_meta = json.load(f)

FRAUD_FEATURES      = fraud_meta["features"]
FRAUD_EXPLANATIONS  = fraud_meta["feature_explanations"]

@app.route("/detect-fraud", methods=["POST"])
def detect_fraud():
    try:
        data = request.get_json()
        row  = {f: float(data.get(f, 0)) for f in FRAUD_FEATURES}
        X    = pd.DataFrame([row])

        proba      = fraud_model.predict_proba(X)[0][1]
        confidence = round(float(proba) * 100, 1)

        if confidence < 40:
            return jsonify({"fraud": False, "confidence": confidence})

        risk_level = "HIGH" if confidence >= 70 else "MEDIUM"

        reasons = [explanation for feat, explanation in FRAUD_EXPLANATIONS.items() if feat in data]

        return jsonify({
            "fraud":      True,
            "confidence": confidence,
            "risk_level": risk_level,
            "reasons":    " | ".join(reasons[:4]),
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)

if __name__ == "__main__":
    app.run(debug=True, port=5000)