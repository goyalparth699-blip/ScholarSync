"""
Data Preprocessing Pipeline
=============================
Provides:
  - Column name constants
  - clean_data()   — impute missing values & clip outliers
  - build_preprocessor() — sklearn ColumnTransformer (scale + encode)
  - prepare_features()   — extract X and y from a DataFrame
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer


# ---------------------------------------------------------------------------
# COLUMN DEFINITIONS
# ---------------------------------------------------------------------------
NUMERICAL_FEATURES = [
    "Study_Hours",
    "Attendance",
    "Sleep_Hours",
    "Previous_Scores",
    "Physical_Activity",
    "Screen_Time",
    "Tutoring_Sessions",
]

CATEGORICAL_FEATURES = [
    "Internet_Access",
    "Motivation_Level",
    "Family_Support",
    "Extracurricular_Activities",
    "Teacher_Quality",
    "Parental_Education",
]

TARGET = "Exam_Score"

# Valid numerical ranges for clipping
NUMERICAL_RANGES = {
    "Study_Hours":       (0, 24),
    "Attendance":        (0, 100),
    "Sleep_Hours":       (0, 24),
    "Previous_Scores":   (0, 100),
    "Physical_Activity": (0, 24),
    "Screen_Time":       (0, 24),
    "Tutoring_Sessions": (0, 10),
}


# ---------------------------------------------------------------------------
# CLEANING
# ---------------------------------------------------------------------------
def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Clean a student dataset:
      1. Remove exact duplicate rows.
      2. Impute missing numerical values with column median.
      3. Impute missing categorical values with column mode.
      4. Clip numerical columns to their expected ranges.

    Parameters
    ----------
    df : Raw DataFrame.

    Returns
    -------
    Cleaned DataFrame (copy).
    """
    df = df.copy()

    # Drop duplicates
    before = len(df)
    df.drop_duplicates(inplace=True)
    removed = before - len(df)
    if removed:
        print(f"[Preprocess] Removed {removed} duplicate rows.")

    # Impute numerical
    for col in NUMERICAL_FEATURES:
        if col in df.columns and df[col].isnull().any():
            median_val = df[col].median()
            df[col].fillna(median_val, inplace=True)
            print(f"[Preprocess] Imputed '{col}' with median={median_val:.2f}")

    # Impute categorical
    for col in CATEGORICAL_FEATURES:
        if col in df.columns and df[col].isnull().any():
            mode_val = df[col].mode()[0]
            df[col].fillna(mode_val, inplace=True)
            print(f"[Preprocess] Imputed '{col}' with mode='{mode_val}'")

    # Clip numerical ranges
    for col, (lo, hi) in NUMERICAL_RANGES.items():
        if col in df.columns:
            df[col] = df[col].clip(lo, hi)

    return df


# ---------------------------------------------------------------------------
# PREPROCESSING PIPELINE
# ---------------------------------------------------------------------------
def build_preprocessor() -> ColumnTransformer:
    """
    Build a sklearn ColumnTransformer that:
      - Applies StandardScaler to numerical features
      - Applies OneHotEncoder (drop='first') to categorical features

    Returns
    -------
    ColumnTransformer (unfitted).
    """
    numerical_transformer   = StandardScaler()
    categorical_transformer = OneHotEncoder(
        drop="first",
        sparse_output=False,
        handle_unknown="ignore",
    )

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numerical_transformer,   NUMERICAL_FEATURES),
            ("cat", categorical_transformer, CATEGORICAL_FEATURES),
        ],
        remainder="drop",
    )

    return preprocessor


# ---------------------------------------------------------------------------
# FEATURE EXTRACTION
# ---------------------------------------------------------------------------
def prepare_features(df: pd.DataFrame):
    """
    Clean the DataFrame and extract the feature matrix X and target y.

    Parameters
    ----------
    df : Raw DataFrame.

    Returns
    -------
    X : pd.DataFrame with only feature columns.
    y : pd.Series with the target column, or None if not present.
    """
    df = clean_data(df)

    feature_cols = NUMERICAL_FEATURES + CATEGORICAL_FEATURES
    X = df[[c for c in feature_cols if c in df.columns]]
    y = df[TARGET] if TARGET in df.columns else None

    return X, y
