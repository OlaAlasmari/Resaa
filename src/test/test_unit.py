import pytest
import sys
import os
import math
import numpy as np
import pandas as pd
 
# ─────────────────────────────────────────────────────────
# Import real functions directly from App.py
# Run tests from project root: pytest src/test/test_unit.py -v -s
# ─────────────────────────────────────────────────────────
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
 
 
# =========================================================
# Unit Test 1 — build_features (Real Function)
# Objective: Verify the real build_features() correctly
# constructs model-ready features from raw property input.
# =========================================================
class TestBuildFeatures:
 
    # ── Constants ──────────────────────────────────────────
    PROPERTY_AREA_SQM    = 300
    KNOWN_NEIGHBORHOOD   = "الروضة"
    STANDARD_MONTH       = 6
    STANDARD_PROPERTY = {
        "area_sqm":       300,
        "neighborhood":   "الروضة",
        "property_type":  "أرض",
        "classification": "سكني",
        "year":           2025,
        "month":          6,
    }
 
    def test_feature_construction_for_standard_property(self):
        
        # Arrange
        data         = self.STANDARD_PROPERTY
        expected_log = np.log1p(self.PROPERTY_AREA_SQM)
        nbhd_median  = nbhd_medians.get(self.KNOWN_NEIGHBORHOOD, self.PROPERTY_AREA_SQM)
        expected_ratio = self.PROPERTY_AREA_SQM / (nbhd_median + 1)
 
        # Act — calling the REAL build_features from App.py
        result = build_features(data)
 
        # Assert
        assert "area_sqm"     in result.columns, "Missing column: area_sqm"
        assert "log_area"     in result.columns, "Missing column: log_area"
        assert "area_vs_nbhd" in result.columns, "Missing column: area_vs_nbhd"
        assert "sin_month"    in result.columns, "Missing column: sin_month"
        assert "cos_month"    in result.columns, "Missing column: cos_month"
        assert abs(result["log_area"].iloc[0]     - expected_log)   < 0.0001, \
            f"log_area must be {expected_log:.4f}, got {result['log_area'].iloc[0]:.4f}"
        assert abs(result["area_vs_nbhd"].iloc[0] - expected_ratio) < 0.0001, \
            f"area_vs_nbhd must be {expected_ratio:.4f}, got {result['area_vs_nbhd'].iloc[0]:.4f}"
        assert -1 <= result["sin_month"].iloc[0] <= 1,                      "sin_month out of range"
        assert -1 <= result["cos_month"].iloc[0] <= 1,                      "cos_month out of range"
        assert result["classification"].iloc[0]  == "سكني",                "classification must be 'سكني'"
        assert result["property_type"].iloc[0]   == "أرض",                 "property_type must be 'أرض'"
 
        print(f"\nTest 1 Passed: Real build_features() for 300sqm property in الروضة.")
        print(f"   log_area        = {result['log_area'].iloc[0]:.4f}")
        print(f"   area_vs_nbhd    = {result['area_vs_nbhd'].iloc[0]:.4f} (using real CSV median)")
        print(f"   neighborhood median from CSV = {nbhd_median:.1f} sqm")
        print(f"   sin_month       = {result['sin_month'].iloc[0]:.4f}")
        print(f"   cos_month       = {result['cos_month'].iloc[0]:.4f}")
 
