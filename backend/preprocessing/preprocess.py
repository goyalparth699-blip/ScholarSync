import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer


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

NUMERICAL_RANGES = {
    "Study_Hours":       (0, 24),
    "Attendance":        (0, 100),
    "Sleep_Hours":       (0, 24),
    "Previous_Scores":   (0, 100),
    "Physical_Activity": (0, 24),
    "Screen_Time":       (0, 24),
    "Tutoring_Sessions": (0, 10),
}


def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()

    before = len(df)
    df.drop_duplicates(inplace=True)
    removed = before - len(df)
    if removed:
        print(f"[Preprocess] Removed {removed} duplicate rows.")

    for col in NUMERICAL_FEATURES:
        if col in df.columns and df[col].isnull().any():
            median_val = df[col].median()
            df[col].fillna(median_val, inplace=True)
            print(f"[Preprocess] Imputed '{col}' with median={median_val:.2f}")

    for col in CATEGORICAL_FEATURES:
        if col in df.columns and df[col].isnull().any():
            mode_val = df[col].mode()[0]
            df[col].fillna(mode_val, inplace=True)
            print(f"[Preprocess] Imputed '{col}' with mode='{mode_val}'")

    for col, (lo, hi) in NUMERICAL_RANGES.items():
        if col in df.columns:
            df[col] = df[col].clip(lo, hi)

    return df


def build_preprocessor() -> ColumnTransformer:
    return ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), NUMERICAL_FEATURES),
            ("cat", OneHotEncoder(drop="first", sparse_output=False, handle_unknown="ignore"), CATEGORICAL_FEATURES),
        ],
        remainder="drop",
    )


def prepare_features(df: pd.DataFrame):
    df = clean_data(df)
    feature_cols = NUMERICAL_FEATURES + CATEGORICAL_FEATURES
    X = df[[c for c in feature_cols if c in df.columns]]
    y = df[TARGET] if TARGET in df.columns else None
    return X, y
