"""
Model Training Script
======================
Trains Linear Regression, Decision Tree, and Random Forest models,
compares their performance on a held-out test set, and saves the
best model (highest R²) along with training metadata.

Run directly:
    python backend/training/train.py
"""

import os
import sys
import numpy as np
import pandas as pd
import joblib

from sklearn.linear_model      import LinearRegression
from sklearn.tree               import DecisionTreeRegressor
from sklearn.ensemble           import RandomForestRegressor
from sklearn.pipeline           import Pipeline
from sklearn.model_selection    import train_test_split
from sklearn.metrics            import mean_absolute_error, mean_squared_error, r2_score

# ---- Ensure project root is on the Python path when run as a script ----
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from backend.data.generate_data       import save_dataset
from backend.preprocessing.preprocess import build_preprocessor, prepare_features


# ---------------------------------------------------------------------------
# PATHS
# ---------------------------------------------------------------------------
SAVED_MODELS_DIR = os.path.join(ROOT, "backend", "saved_models")
MODEL_PATH        = os.path.join(SAVED_MODELS_DIR, "best_model.pkl")
METADATA_PATH     = os.path.join(SAVED_MODELS_DIR, "model_metadata.pkl")
DATA_PATH         = os.path.join(ROOT, "backend", "data", "student_data.csv")


# ---------------------------------------------------------------------------
# MODEL REGISTRY
# ---------------------------------------------------------------------------
def get_models() -> dict:
    """Return a dictionary of model name → unfitted regressor."""
    return {
        "Linear Regression": LinearRegression(),
        "Decision Tree":     DecisionTreeRegressor(max_depth=8, random_state=42),
        "Random Forest":     RandomForestRegressor(
                                 n_estimators=100,
                                 max_depth=10,
                                 random_state=42,
                                 n_jobs=-1,
                             ),
    }


# ---------------------------------------------------------------------------
# TRAINING PIPELINE
# ---------------------------------------------------------------------------
def train_and_save() -> tuple[bool, str]:
    """
    End-to-end training pipeline:
      1. Load or generate dataset
      2. Clean & prepare features
      3. Train/test split (80/20)
      4. Build preprocessing + model pipeline for each algorithm
      5. Evaluate on test set
      6. Save best model and metadata

    Returns
    -------
    (success: bool, message: str)
    """
    try:
        os.makedirs(SAVED_MODELS_DIR, exist_ok=True)

        # ---- Step 1: Data ----
        if not os.path.exists(DATA_PATH):
            print("[Train] Dataset not found — generating...")
            save_dataset(os.path.join(ROOT, "backend", "data"))

        df = pd.read_csv(DATA_PATH)
        print(f"[Train] Loaded dataset: {len(df)} rows × {len(df.columns)} columns")

        # ---- Step 2: Features ----
        X, y = prepare_features(df)
        print(f"[Train] Features: {X.shape[1]} columns after cleaning")

        # ---- Step 3: Split ----
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.20, random_state=42
        )
        print(f"[Train] Train: {len(X_train)} | Test: {len(X_test)}")

        # ---- Step 4 & 5: Train & evaluate ----
        preprocessor = build_preprocessor()
        models       = get_models()
        results      = {}

        for name, model in models.items():
            print(f"[Train] Training: {name}...")
            pipeline = Pipeline([
                ("preprocessor", preprocessor),
                ("model",        model),
            ])
            pipeline.fit(X_train, y_train)
            y_pred = pipeline.predict(X_test)

            mae  = mean_absolute_error(y_test, y_pred)
            rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
            r2   = r2_score(y_test, y_pred)

            results[name] = {
                "mae":      mae,
                "rmse":     rmse,
                "r2":       r2,
                "pipeline": pipeline,
            }
            print(f"  → MAE={mae:.4f}  RMSE={rmse:.4f}  R²={r2:.4f}")

        # ---- Step 6: Select best ----
        best_name = max(results, key=lambda k: results[k]["r2"])
        best      = results[best_name]
        print(f"[Train] Best model: {best_name}  (R²={best['r2']:.4f})")

        # Save the pipeline
        joblib.dump(best["pipeline"], MODEL_PATH)

        # Extract feature importance if available
        feature_importance = {}
        if best_name == "Random Forest":
            try:
                model_step = best["pipeline"].named_steps["model"]
                prep_step  = best["pipeline"].named_steps["preprocessor"]
                feat_names = list(prep_step.get_feature_names_out())
                importances = model_step.feature_importances_.tolist()
                feature_importance = dict(zip(feat_names, importances))
            except Exception:
                pass

        # Save metadata
        metadata = {
            "best_model":        best_name,
            "best_r2":           best["r2"],
            "best_rmse":         best["rmse"],
            "best_mae":          best["mae"],
            "n_samples":         len(df),
            "n_features":        X.shape[1],
            "feature_importance": feature_importance,
            "results": {
                name: {
                    "mae":  data["mae"],
                    "rmse": data["rmse"],
                    "r2":   data["r2"],
                }
                for name, data in results.items()
            },
        }
        joblib.dump(metadata, METADATA_PATH)

        msg = (
            f"✅ Training complete!  Best model: {best_name}  "
            f"(R²={best['r2']:.4f}, RMSE={best['rmse']:.4f})"
        )
        print(f"[Train] {msg}")
        return True, msg

    except Exception as exc:
        import traceback
        traceback.print_exc()
        return False, f"❌ Training failed: {exc}"


# ---------------------------------------------------------------------------
# CLI ENTRY POINT
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    ok, msg = train_and_save()
    print(msg)
    sys.exit(0 if ok else 1)
