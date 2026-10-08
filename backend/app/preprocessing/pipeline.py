import os
import joblib
import pandas as pd
import numpy as np
from typing import Tuple, Dict, Any, List
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer

import re

from backend.app.preprocessing.cleaning import (
    load_raw_dataset,
    execute_data_cleaning_pipeline,
    get_feature_types
)

MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "..", "models")
PREPROCESSOR_PATH = os.path.join(MODELS_DIR, "preprocessor.joblib")
DATA_SPLITS_PATH = os.path.join(MODELS_DIR, "data_splits.joblib")

class CreditPreprocessor:
    def __init__(self, target_col: str = "class"):
        self.target_col = target_col
        self.numerical_cols: List[str] = []
        self.categorical_cols: List[str] = []
        self.feature_names_in: List[str] = []
        self.transformed_feature_names: List[str] = []
        self.column_transformer: ColumnTransformer = None
        self.is_fitted: bool = False

    def build_transformer(self):
        """Builds a scikit-learn ColumnTransformer with scaling and one-hot encoding."""
        num_transformer = StandardScaler()
        cat_transformer = OneHotEncoder(handle_unknown="ignore", sparse_output=False)

        self.column_transformer = ColumnTransformer(
            transformers=[
                ("num", num_transformer, self.numerical_cols),
                ("cat", cat_transformer, self.categorical_cols),
            ],
            remainder="drop",
            verbose_feature_names_out=False
        )

    def fit(self, X: pd.DataFrame):
        """Fits the preprocessor strictly on training data to prevent data leakage."""
        self.feature_names_in = list(X.columns)
        self.numerical_cols, self.categorical_cols = get_feature_types(X, target_col="")
        self.build_transformer()
        self.column_transformer.fit(X)
        raw_names = list(self.column_transformer.get_feature_names_out())
        # Sanitize feature names for XGBoost / LightGBM compliance (cannot contain [, ] or <)
        self.transformed_feature_names = [
            re.sub(r'[\[\]<>]', '_', name).replace('__', '_').strip('_') for name in raw_names
        ]
        self.is_fitted = True
        return self

    def transform(self, X: pd.DataFrame) -> pd.DataFrame:
        """Transforms input DataFrame into encoded & scaled DataFrame with named columns."""
        if not self.is_fitted:
            raise RuntimeError("Preprocessor has not been fitted yet.")
        # Ensure all expected columns are present
        X_copy = X.copy()
        for col in self.feature_names_in:
            if col not in X_copy.columns:
                raise ValueError(f"Missing required feature: {col}")
        
        X_subset = X_copy[self.feature_names_in]
        array_trans = self.column_transformer.transform(X_subset)
        return pd.DataFrame(array_trans, columns=self.transformed_feature_names, index=X.index)

    def fit_transform(self, X: pd.DataFrame) -> pd.DataFrame:
        self.fit(X)
        return self.transform(X)

    def save(self, file_path: str = PREPROCESSOR_PATH):
        os.makedirs(os.path.dirname(os.path.abspath(file_path)), exist_ok=True)
        joblib.dump(self, file_path)

    @classmethod
    def load(cls, file_path: str = PREPROCESSOR_PATH) -> "CreditPreprocessor":
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Preprocessor file not found at {file_path}. Please run preprocessing first.")
        return joblib.load(file_path)

def perform_70_15_15_split(
    df: pd.DataFrame, 
    target_col: str = "class", 
    random_state: int = 42
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, pd.Series, pd.Series, pd.Series]:
    """
    Performs a strict stratified 70% Train, 15% Validation, 15% Test split.
    Validation data: Used for model tuning and MAPIE conformal calibration.
    Test data: Held-out exclusively for final model evaluation & fairness audit.
    """
    X = df.drop(columns=[target_col])
    y = df[target_col]

    # First split: 70% Train, 30% Temp (Val + Test)
    X_train, X_temp, y_train, y_temp = train_test_split(
        X, y, 
        test_size=0.30, 
        random_state=random_state, 
        stratify=y
    )

    # Second split: 15% Val, 15% Test (equal split of the 30% temp data)
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, 
        test_size=0.50, 
        random_state=random_state, 
        stratify=y_temp
    )

    return X_train, X_val, X_test, y_train, y_val, y_test

def execute_preprocessing_pipeline() -> Dict[str, Any]:
    """
    Executes the full preprocessing pipeline:
    1. Loads dataset
    2. Runs data cleaning
    3. Performs stratified 70/15/15 split
    4. Fits CreditPreprocessor on training data only
    5. Transforms Train, Validation, and Test sets
    6. Persists preprocessor and data splits to disk
    """
    raw_df = load_raw_dataset()
    cleaned_df, cleaning_steps, cleaning_summary = execute_data_cleaning_pipeline(raw_df)

    X_train, X_val, X_test, y_train, y_val, y_test = perform_70_15_15_split(cleaned_df)

    preprocessor = CreditPreprocessor()
    preprocessor.fit(X_train)

    X_train_trans = preprocessor.transform(X_train)
    X_val_trans = preprocessor.transform(X_val)
    X_test_trans = preprocessor.transform(X_test)

    # Save preprocessor
    preprocessor.save(PREPROCESSOR_PATH)

    # Save splits
    splits_bundle = {
        "X_train_raw": X_train,
        "X_val_raw": X_val,
        "X_test_raw": X_test,
        "X_train_trans": X_train_trans,
        "X_val_trans": X_val_trans,
        "X_test_trans": X_test_trans,
        "y_train": y_train,
        "y_val": y_val,
        "y_test": y_test,
        "cleaned_df": cleaned_df,
        "raw_df": raw_df
    }
    os.makedirs(os.path.dirname(os.path.abspath(DATA_SPLITS_PATH)), exist_ok=True)
    joblib.dump(splits_bundle, DATA_SPLITS_PATH)

    train_target_dist = {str(k): int(v) for k, v in y_train.value_counts().items()}
    val_target_dist = {str(k): int(v) for k, v in y_val.value_counts().items()}
    test_target_dist = {str(k): int(v) for k, v in y_test.value_counts().items()}

    split_summary = {
        "train_size": len(X_train),
        "train_percentage": round(len(X_train) / len(cleaned_df) * 100, 1),
        "val_size": len(X_val),
        "val_percentage": round(len(X_val) / len(cleaned_df) * 100, 1),
        "test_size": len(X_test),
        "test_percentage": round(len(X_test) / len(cleaned_df) * 100, 1),
        "train_target_distribution": train_target_dist,
        "val_target_distribution": val_target_dist,
        "test_target_distribution": test_target_dist
    }

    return {
        "status": "success",
        "message": "Preprocessing pipeline completed and persisted. 70/15/15 stratified split created.",
        "original_feature_count": len(preprocessor.feature_names_in),
        "transformed_feature_count": len(preprocessor.transformed_feature_names),
        "transformed_feature_names": preprocessor.transformed_feature_names,
        "categorical_features": preprocessor.categorical_cols,
        "numerical_features": preprocessor.numerical_cols,
        "split_summary": split_summary
    }

def get_saved_splits() -> Dict[str, Any]:
    """Retrieves saved data splits bundle, or runs preprocessing if not already saved."""
    if not os.path.exists(DATA_SPLITS_PATH):
        execute_preprocessing_pipeline()
    return joblib.load(DATA_SPLITS_PATH)
