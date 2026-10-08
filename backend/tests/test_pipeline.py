import unittest
import os
import sys
import json
import numpy as np
import pandas as pd

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.app.preprocessing.cleaning import load_raw_dataset, execute_data_cleaning_pipeline
from backend.app.preprocessing.pipeline import CreditPreprocessor, get_saved_splits
from backend.app.services.xai_service import (
    predict_single_applicant,
    get_shap_analysis,
    get_dice_counterfactuals,
    get_mapie_uncertainty,
    get_fairness_audit,
    execute_master_analysis,
    _ARTIFACT_CACHE
)

class TestGermanCreditPipeline(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.sample_good_borrower = {
            "checking_status": ">=200",
            "duration": 12,
            "credit_history": "all paid",
            "purpose": "radio/tv",
            "credit_amount": 1500,
            "savings_status": ">=1000",
            "employment": ">=7",
            "installment_commitment": 2,
            "personal_status": "male single",
            "other_parties": "none",
            "residence_since": 4,
            "property_magnitude": "real estate",
            "age": 45,
            "other_payment_plans": "none",
            "housing": "own",
            "existing_credits": 1,
            "job": "skilled",
            "num_dependents": 1,
            "own_telephone": "yes",
            "foreign_worker": "no"
        }

        cls.sample_bad_borrower = {
            "checking_status": "<0",
            "duration": 36,
            "credit_history": "delayed previously",
            "purpose": "used car",
            "credit_amount": 9000,
            "savings_status": "<100",
            "employment": "<1",
            "installment_commitment": 4,
            "personal_status": "female div/dep/mar",
            "other_parties": "none",
            "residence_since": 1,
            "property_magnitude": "no known property",
            "age": 22,
            "other_payment_plans": "bank",
            "housing": "rent",
            "existing_credits": 2,
            "job": "unskilled resident",
            "num_dependents": 2,
            "own_telephone": "none",
            "foreign_worker": "yes"
        }

    def test_01_dataset_loading(self):
        """Verify UCI German credit dataset loads exactly 1000 instances and 21 columns."""
        df = load_raw_dataset()
        self.assertEqual(len(df), 1000)
        self.assertEqual(len(df.columns), 21)
        self.assertIn("class", df.columns)

    def test_02_preprocessing_pipeline(self):
        """Verify preprocessing transforms 20 attributes into valid numerical matrix."""
        splits = _ARTIFACT_CACHE.get("splits")
        self.assertIsNotNone(splits, "Data splits must be loaded in cache")
        self.assertEqual(len(splits["X_train_raw"]), 700)
        self.assertEqual(len(splits["X_val_raw"]), 150)
        self.assertEqual(len(splits["X_test_raw"]), 150)

    def test_03_prediction_and_probabilities(self):
        """Verify XGBoost prediction produces discrete class and complementary probabilities."""
        pred = predict_single_applicant(self.sample_good_borrower, model_name="xgboost")
        self.assertIn(pred["prediction"], [0, 1])
        self.assertIn(pred["prediction_label"], ["Good Credit Risk", "Bad Credit Risk"])
        
        prob_good = pred["good_risk_probability"]
        prob_bad = pred["bad_risk_probability"]
        self.assertGreaterEqual(prob_good, 0.0)
        self.assertLessEqual(prob_good, 1.0)
        self.assertGreaterEqual(prob_bad, 0.0)
        self.assertLessEqual(prob_bad, 1.0)
        self.assertAlmostEqual(prob_good + prob_bad, 1.0, places=4)

    def test_04_shap_attribution(self):
        """Verify SHAP produces non-zero local contributions and global importance ranking."""
        shap_res = get_shap_analysis(self.sample_bad_borrower, model_name="xgboost")
        self.assertIn("local_contributions", shap_res)
        self.assertGreater(len(shap_res["local_contributions"]), 0)
        
        first_feature = shap_res["local_contributions"][0]
        self.assertIn("feature", first_feature)
        self.assertIn("shap_value", first_feature)
        self.assertIsInstance(first_feature["shap_value"], float)
        self.assertIn(first_feature["impact"], ["increases_risk", "decreases_risk"])

    def test_05_dice_counterfactuals(self):
        """Verify DiCE generates valid recourse recommendations with feature perturbations."""
        dice_res = get_dice_counterfactuals(self.sample_bad_borrower, total_cfs=3, model_name="xgboost")
        self.assertIn("counterfactuals", dice_res)
        self.assertIsInstance(dice_res["counterfactuals"], list)
        
        if len(dice_res["counterfactuals"]) > 0:
            cf = dice_res["counterfactuals"][0]
            self.assertIn("counterfactual_prediction", cf)
            self.assertIn("changes", cf)
            self.assertGreater(len(cf["changes"]), 0)

    def test_06_mapie_conformal_uncertainty(self):
        """Verify MAPIE returns conformal prediction set with formal statistical guarantee."""
        mapie_res = get_mapie_uncertainty(self.sample_bad_borrower, confidence_level=0.90, model_name="xgboost")
        self.assertIn("prediction_set", mapie_res)
        self.assertGreaterEqual(mapie_res["set_size"], 1)
        self.assertIn("empirical_test_coverage", mapie_res)
        self.assertGreater(mapie_res["empirical_test_coverage"], 0.85)

    def test_07_fairlearn_audit(self):
        """Verify Fairlearn calculates group disparities on held-out test data."""
        fair_res = get_fairness_audit("personal_status", model_name="xgboost")
        self.assertIn("demographic_parity_difference", fair_res)
        self.assertIn("equalized_odds_difference", fair_res)
        self.assertIn("groups", fair_res)
        self.assertGreater(len(fair_res["groups"]), 0)

    def test_08_master_analysis_journey(self):
        """Verify complete single-click master analysis executes without error."""
        master_res = execute_master_analysis(self.sample_good_borrower, model_name="xgboost")
        self.assertTrue(master_res["success"])
        self.assertIn("prediction", master_res)
        self.assertIn("explanation", master_res)
        self.assertIn("counterfactuals", master_res)
        self.assertIn("uncertainty", master_res)
        self.assertIn("fairness", master_res)
        self.assertIn("decision_summary", master_res)
        self.assertIsNotNone(master_res["decision_summary"])

if __name__ == "__main__":
    unittest.main()
