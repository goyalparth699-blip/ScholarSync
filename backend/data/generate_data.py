"""
Synthetic Student Dataset Generator
=====================================
Creates a realistic student performance dataset with 2 000 rows
and 13 feature columns that mirror the Kaggle
"Student Performance Factors" dataset structure.

The exam score is derived from a weighted combination of the features
plus Gaussian noise, so the learned correlations are realistic.
"""

import os
import numpy as np
import pandas as pd


# ---------------------------------------------------------------------------
# GENERATOR
# ---------------------------------------------------------------------------
def generate_student_data(n: int = 2000, seed: int = 42) -> pd.DataFrame:
    """
    Generate a synthetic student performance dataset.

    Parameters
    ----------
    n    : Number of student records to generate.
    seed : Random seed for reproducibility.

    Returns
    -------
    pd.DataFrame with 13 feature columns + 1 target column (Exam_Score).
    """
    rng = np.random.default_rng(seed)

    # ---- Numerical features ----
    study_hours       = rng.uniform(1,  10, n)
    attendance        = rng.uniform(50, 100, n)
    sleep_hours       = rng.uniform(4,  10, n)
    previous_scores   = rng.uniform(40, 100, n)
    physical_activity = rng.uniform(0,  10, n)
    screen_time       = rng.uniform(1,  8,  n)
    tutoring_sessions = rng.integers(0, 6, n).astype(float)

    # ---- Categorical features ----
    internet_access    = rng.choice(["Yes", "No"],                            n, p=[0.72, 0.28])
    motivation_level   = rng.choice(["Low", "Medium", "High"],                n, p=[0.20, 0.40, 0.40])
    family_support     = rng.choice(["Low", "Medium", "High"],                n, p=[0.20, 0.40, 0.40])
    extracurricular    = rng.choice(["Yes", "No"],                            n, p=[0.48, 0.52])
    teacher_quality    = rng.choice(["Low", "Medium", "High"],                n, p=[0.20, 0.45, 0.35])
    parental_education = rng.choice(["High School", "College", "Postgraduate"], n, p=[0.40, 0.40, 0.20])

    # ---- Numeric encodings for score calculation ----
    def ord3(arr, low, mid, high):
        return np.where(arr == low, 0, np.where(arr == mid, 1, 2))

    mot_enc  = ord3(motivation_level,   "Low", "Medium", "High")
    fam_enc  = ord3(family_support,      "Low", "Medium", "High")
    tq_enc   = ord3(teacher_quality,     "Low", "Medium", "High")
    pe_enc   = np.where(parental_education == "High School", 0,
               np.where(parental_education == "College",     1, 2))
    inet_enc = np.where(internet_access == "Yes", 1, 0)
    ext_enc  = np.where(extracurricular  == "Yes", 1, 0)

    # ---- Sleep has a quadratic benefit (optimal ≈ 7.5 h) ----
    sleep_benefit = -0.45 * (sleep_hours - 7.5) ** 2 + 3.0

    # ---- Weighted score formula ----
    base = (
        study_hours       * 4.0  +
        (attendance - 50) * 0.35 +
        sleep_benefit            +
        previous_scores   * 0.30 +
        physical_activity * 0.40 +
        mot_enc           * 4.0  +
        fam_enc           * 2.5  +
        inet_enc          * 2.0  +
        ext_enc           * 1.5  +
        tutoring_sessions * 2.0  +
        tq_enc            * 2.0  +
        pe_enc            * 1.0  -
        screen_time       * 0.80 +
        rng.normal(0, 4, n)          # realistic noise
    )

    # ---- Normalise to the 40–100 range ----
    lo, hi   = base.min(), base.max()
    exam_score = np.clip(40 + (base - lo) / (hi - lo) * 60, 40, 100)

    # ---- Assemble DataFrame ----
    df = pd.DataFrame({
        "Study_Hours":               np.round(study_hours,       1),
        "Attendance":                np.round(attendance,        1),
        "Sleep_Hours":               np.round(sleep_hours,       1),
        "Previous_Scores":           np.round(previous_scores,   1),
        "Physical_Activity":         np.round(physical_activity, 1),
        "Screen_Time":               np.round(screen_time,       1),
        "Tutoring_Sessions":         tutoring_sessions.astype(int),
        "Internet_Access":           internet_access,
        "Motivation_Level":          motivation_level,
        "Family_Support":            family_support,
        "Extracurricular_Activities":extracurricular,
        "Teacher_Quality":           teacher_quality,
        "Parental_Education":        parental_education,
        "Exam_Score":                np.round(exam_score,        1),
    })

    return df


# ---------------------------------------------------------------------------
# SAVE HELPER
# ---------------------------------------------------------------------------
def save_dataset(output_dir: str = "backend/data") -> str:
    """Generate and save the dataset as a CSV file. Returns the file path."""
    os.makedirs(output_dir, exist_ok=True)
    df   = generate_student_data()
    path = os.path.join(output_dir, "student_data.csv")
    df.to_csv(path, index=False)
    print(f"[Data] Dataset saved: {path}  ({len(df)} rows × {len(df.columns)} columns)")
    return path


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    save_dataset()
