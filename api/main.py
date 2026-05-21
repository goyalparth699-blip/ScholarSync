import os, sys
import numpy as np
import pandas as pd
import joblib
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

ROOT          = os.path.dirname(os.path.dirname(__file__))
MODEL_PATH    = os.path.join(ROOT, "backend", "saved_models", "best_model.pkl")
METADATA_PATH = os.path.join(ROOT, "backend", "saved_models", "model_metadata.pkl")
DATA_PATH     = os.path.join(ROOT, "backend", "data",         "student_data.csv")

sys.path.insert(0, ROOT)

# ── load model ──────────────────────────────────────────────────────────────
if not os.path.exists(MODEL_PATH):
    from backend.training.train import train_and_save
    train_and_save()

model    = joblib.load(MODEL_PATH)
metadata = joblib.load(METADATA_PATH)

# ── app ──────────────────────────────────────────────────────────────────────
app = FastAPI(title="Student Performance API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── schema ────────────────────────────────────────────────────────────────────
class PredInput(BaseModel):
    study_hours:                float = 4.0
    attendance:                 float = 75.0
    sleep_hours:                float = 7.0
    previous_scores:            float = 65.0
    physical_activity:          float = 3.0
    screen_time:                float = 3.0
    tutoring_sessions:          int   = 0
    internet_access:            str   = "Yes"
    motivation_level:           str   = "Medium"
    family_support:             str   = "Medium"
    extracurricular_activities: str   = "No"
    teacher_quality:            str   = "Medium"
    parental_education:         str   = "College"

# ── routes ────────────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "ok", "model": metadata.get("best_model")}


@app.post("/predict")
def predict(b: PredInput):
    try:
        row = {
            "Study_Hours":               b.study_hours,
            "Attendance":                b.attendance,
            "Sleep_Hours":               b.sleep_hours,
            "Previous_Scores":           b.previous_scores,
            "Physical_Activity":         b.physical_activity,
            "Screen_Time":               b.screen_time,
            "Tutoring_Sessions":         b.tutoring_sessions,
            "Internet_Access":           b.internet_access,
            "Motivation_Level":          b.motivation_level,
            "Family_Support":            b.family_support,
            "Extracurricular_Activities":b.extracurricular_activities,
            "Teacher_Quality":           b.teacher_quality,
            "Parental_Education":        b.parental_education,
        }
        score = float(np.clip(model.predict(pd.DataFrame([row]))[0], 0, 100))
        return {
            "score":      round(score, 2),
            "model_name": metadata.get("best_model", "ML Model"),
            "r2":         round(float(metadata.get("best_r2",  0)), 4),
            "mae":        round(float(metadata.get("best_mae", 0)), 4),
        }
    except Exception as e:
        raise HTTPException(500, str(e))


@app.get("/model-metadata")
def get_metadata():
    return {k: v for k, v in metadata.items() if k != "feature_importance"}


@app.get("/analytics")
def analytics():
    try:
        if not os.path.exists(DATA_PATH):
            from backend.data.generate_data import save_dataset
            save_dataset(os.path.join(ROOT, "backend", "data"))

        df = pd.read_csv(DATA_PATH)
        s  = df["Exam_Score"]

        hist, edges = np.histogram(s, bins=20)
        distribution = [
            {"range": f"{int(edges[i])}-{int(edges[i+1])}", "count": int(hist[i])}
            for i in range(len(hist))
        ]

        categories = [
            {"name": "Excellent", "range": "85-100", "color": "#10B981", "value": int((s >= 85).sum())},
            {"name": "Good",      "range": "70-84",  "color": "#7C6CFF", "value": int(((s >= 70) & (s < 85)).sum())},
            {"name": "Average",   "range": "55-69",  "color": "#4DA3FF", "value": int(((s >= 55) & (s < 70)).sum())},
            {"name": "Below Avg", "range": "40-54",  "color": "#F59E0B", "value": int(((s >= 40) & (s < 55)).sum())},
            {"name": "Poor",      "range": "<40",    "color": "#EF4444", "value": int((s < 40).sum())},
        ]

        corr = df.select_dtypes(include=[np.number]).corr()["Exam_Score"].drop("Exam_Score")
        correlations = [
            {"feature": k.replace("_", " "), "correlation": round(float(v), 4)}
            for k, v in sorted(corr.items(), key=lambda x: abs(x[1]), reverse=True)
        ]

        stats = {
            "count":  int(len(df)),
            "mean":   round(float(s.mean()),   2),
            "std":    round(float(s.std()),    2),
            "min":    round(float(s.min()),    2),
            "max":    round(float(s.max()),    2),
            "median": round(float(s.median()), 2),
        }

        scatter_sample = (
            df[["Study_Hours", "Attendance", "Sleep_Hours", "Screen_Time", "Exam_Score"]]
            .sample(min(300, len(df)), random_state=42)
            .round(1)
            .to_dict("records")
        )

        fi = metadata.get("feature_importance", {})
        feature_importance = [
            {"feature": k.replace("num__","").replace("cat__","").replace("_"," "), "importance": round(float(v), 5)}
            for k, v in sorted(fi.items(), key=lambda x: x[1], reverse=True)[:12]
        ] if fi else []

        return {
            "distribution":       distribution,
            "categories":         categories,
            "correlations":       correlations,
            "stats":              stats,
            "scatter_sample":     scatter_sample,
            "feature_importance": feature_importance,
        }
    except Exception as e:
        raise HTTPException(500, str(e))
