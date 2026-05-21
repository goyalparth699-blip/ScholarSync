"""
Model Utilities
================
Convenience functions for loading the saved model and
making single-record predictions from a raw input dict.
"""

import os
import numpy as np
import pandas as pd
import joblib

MODEL_PATH    = os.path.join("backend", "saved_models", "best_model.pkl")
METADATA_PATH = os.path.join("backend", "saved_models", "model_metadata.pkl")


def load_model():
    """
    Load and return the saved sklearn Pipeline.
    Returns None if the model file does not exist.
    """
    if os.path.exists(MODEL_PATH):
        return joblib.load(MODEL_PATH)
    return None


def load_metadata() -> dict:
    """
    Load and return the training metadata dictionary.
    Returns an empty dict if the file does not exist.
    """
    if os.path.exists(METADATA_PATH):
        return joblib.load(METADATA_PATH)
    return {}


def predict(inputs: dict) -> float:
    """
    Make a single prediction from a raw input dictionary.

    Parameters
    ----------
    inputs : dict with the following keys (all optional — defaults are provided):
        study_hours, attendance, sleep_hours, previous_scores,
        physical_activity, screen_time, tutoring_sessions,
        internet_access, motivation_level, family_support,
        extracurricular_activities, teacher_quality, parental_education

    Returns
    -------
    Predicted exam score clipped to [0, 100].

    Raises
    ------
    ValueError if no trained model is found.
    """
    model = load_model()
    if model is None:
        raise ValueError(
            "No trained model found at backend/saved_models/best_model.pkl. "
            "Please run: python backend/training/train.py"
        )

    input_df = pd.DataFrame([{
        "Study_Hours":               inputs.get("study_hours",           4.0),
        "Attendance":                inputs.get("attendance",            75),
        "Sleep_Hours":               inputs.get("sleep_hours",           7.0),
        "Previous_Scores":           inputs.get("previous_scores",       65),
        "Physical_Activity":         inputs.get("physical_activity",     3.0),
        "Screen_Time":               inputs.get("screen_time",           3.0),
        "Tutoring_Sessions":         inputs.get("tutoring_sessions",     0),
        "Internet_Access":           inputs.get("internet_access",       "Yes"),
        "Motivation_Level":          inputs.get("motivation_level",      "Medium"),
        "Family_Support":            inputs.get("family_support",        "Medium"),
        "Extracurricular_Activities":inputs.get("extracurricular_activities", "No"),
        "Teacher_Quality":           inputs.get("teacher_quality",       "Medium"),
        "Parental_Education":        inputs.get("parental_education",    "College"),
    }])

    raw = model.predict(input_df)[0]
    return float(np.clip(raw, 0, 100))
