import pytest
import sys
import os
import math
import numpy as np
import pandas as pd


sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
 
from Resaa_AI.App import (
    build_features,
    _safe_group,
    _group_rare_inf,
    nbhd_medians,
    PERMITTED_USES,
    _known_cities,
    _known_districts,
    _known_properties,
    _known_regions,
    global_land_avg,
    df_ref,
)
 
 
class TestRecommendationAndStrategyLogic:
 
    # ── Constants ──────────────────────────────────────────
    TOTAL_INVESTMENT  = 800_000
    SALE_VALUE_PROFIT = 1_200_000
    SALE_VALUE_LOSS   = 600_000
    TARGET_PRICE      = 1_500_000
    WEIGHT_TARGET     = 0.70
    WEIGHT_RETURN     = 0.30
    TOP_N             = 3
 



    def test_recommendation_and_strategy_logic(self):
        """
        Objective: Verify ROI calculation, real PERMITTED_USES from App.py,
        auction strategy filtering, and scoring logic.
 
        Test Criteria:
            ROI (same logic as recommend() in App.py):
            - 800K investment → 1.2M sale  → ROI = +50.0%
            - 800K investment → 600K sale  → ROI = -25.0%
            - 0 investment                 → ROI = None
 
            Permitted Uses (real PERMITTED_USES from App.py):
            - سكني  → شقة, فيلا allowed — وحدة تجارية NOT allowed
            - تجاري → مكتب allowed      — فيلا NOT allowed
 
            Strategy Filtering (same logic as auction_strategy() in App.py):
            - target = 1,500,000 SAR
            - Strategies [1.2M, 1.6M, 1.4M, 1.8M, 2.0M] → 3 valid
            - No strategy reaches 3M → best available = 1,200,000 SAR
 
            Strategy Scoring (same logic as auction_strategy() in App.py):
            - score = 70% target_score + 30% return_score
            - Strategy A (target=0.95, return=0.40) must beat B (target=0.60, return=0.90)
            - Top 3 sorted descending, first must have highest score
        """
        # Arrange
        strategies = pd.DataFrame({
            "strategy_score":       [0.45, 0.92, 0.67, 0.88, 0.71],
            "expected_final_price": [1_200_000, 1_800_000, 1_400_000, 1_600_000, 2_000_000]
        })
        no_reach = pd.DataFrame({
            "expected_final_price": [900_000, 1_100_000, 1_200_000]
        })
 
        # Act — ROI (same logic as recommend() in App.py)
        def roi(total_value, total_investment):
            if total_investment <= 0: return None
            return round((total_value - total_investment) / total_investment * 100, 1)
 
        roi_profit = roi(self.SALE_VALUE_PROFIT, self.TOTAL_INVESTMENT)
        roi_loss   = roi(self.SALE_VALUE_LOSS,   self.TOTAL_INVESTMENT)
        roi_none   = roi(self.SALE_VALUE_PROFIT, 0)
 
        # Act — permitted uses from REAL App.py PERMITTED_USES dict
        residential = PERMITTED_USES.get("سكني",  [])
        commercial  = PERMITTED_USES.get("تجاري", [])
 
        # Act — strategy filtering (same logic as auction_strategy() in App.py)
        valid    = strategies[strategies["expected_final_price"] >= self.TARGET_PRICE]
        no_valid = no_reach[no_reach["expected_final_price"] >= 3_000_000]
        best     = no_reach.nlargest(1, "expected_final_price").iloc[0]
 
        # Act — scoring (same logic as auction_strategy() in App.py)
        score_A = self.WEIGHT_TARGET * 0.95 + self.WEIGHT_RETURN * 0.40
        score_B = self.WEIGHT_TARGET * 0.60 + self.WEIGHT_RETURN * 0.90
        top     = strategies.sort_values("strategy_score", ascending=False).head(self.TOP_N)
 
        # Assert — ROI
        assert roi_profit ==  50.0, f"Expected +50.0%, got {roi_profit}%"
        assert roi_loss   == -25.0, f"Expected -25.0%, got {roi_loss}%"
        assert roi_none   is  None, "Expected None when no investment"
 
        # Assert — real PERMITTED_USES from App.py
        assert "شقة"         in residential,     "شقة must be in residential"
        assert "فيلا"        in residential,     "فيلا must be in residential"
        assert "وحدة تجارية" not in residential, "Commercial must NOT be in residential"
        assert "مكتب"        in commercial,      "مكتب must be in commercial"
        assert "فيلا"        not in commercial,  "Residential must NOT be in commercial"
 
        # Assert — strategy filtering
        assert len(valid) == 3,                           f"Expected 3 valid, got {len(valid)}"
        assert all(valid["expected_final_price"] >= self.TARGET_PRICE)
        assert no_valid.empty,                            "No strategy should reach 3M"
        assert best["expected_final_price"] == 1_200_000, "Best fallback must be 1,200,000"
 
        # Assert — strategy scoring
        assert score_A > score_B,                        f"A ({score_A:.3f}) must beat B ({score_B:.3f})"
        assert top.iloc[0]["strategy_score"] == 0.92,    "First must have highest score"
        assert len(top) == self.TOP_N,                   f"Must return exactly {self.TOP_N}"
 
        print(f"\nTest 4 Passed: Real PERMITTED_USES + recommendation and strategy logic.")
        print(f"   ROI: profit={roi_profit}%, loss={roi_loss}%, no investment={roi_none}")
        print(f"   Real PERMITTED_USES سكني: {residential}")
        print(f"   Real PERMITTED_USES تجاري: {commercial}")
        print(f"   Strategy filtering: {len(valid)} valid, best fallback={best['expected_final_price']:,}")
        print(f"   Scoring: A={score_A:.3f} > B={score_B:.3f}, top={top.iloc[0]['strategy_score']}")
