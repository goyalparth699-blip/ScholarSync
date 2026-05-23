import os
import sys
import traceback
import numpy as np
import pandas as pd
import joblib

from sklearn.linear_model   import LinearRegression
from sklearn.tree            import DecisionTreeRegressor
from sklearn.ensemble        import RandomForestRegressor
from sklearn.pipeline        import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics         import mean_absolute_error, mean_squared_error, r2_score

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from backend.data.generate_data       import save_dataset
from backend.preprocessing.preprocess import build_preprocessor, prepare_features

SAVED_MODELS_DIR = os.path.join(ROOT, "backend", "saved_models")
MODEL_PATH       = os.path.join(SAVED_MODELS_DIR, "best_model.pkl")
METADATA_PATH    = os.path.join(SAVED_MODELS_DIR, "model_metadata.pkl")
DATA_PATH        = os.path.join(ROOT, "backend", "data", "student_data.csv")


def get_models() -> dict:
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


def train_and_save() -> tuple[bool, str]:
    try:
        os.makedirs(SAVED_MODELS_DIR, exist_ok=True)

        if not os.path.exists(DATA_PATH):
            print("[Train] Dataset not found — generating...")
            save_dataset(os.path.join(ROOT, "backend", "data"))

        df = pd.read_csv(DATA_PATH)
        print(f"[Train] Loaded {len(df)} rows × {len(df.columns)} columns")

        X, y = prepare_features(df)
        print(f"[Train] {X.shape[1]} features after cleaning")

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.20, random_state=42
        )
        print(f"[Train] Train: {len(X_train)} | Test: {len(X_test)}")

        preprocessor = build_preprocessor()
        results = {}

        for name, model in get_models().items():
            print(f"[Train] Training: {name}...")
            pipeline = Pipeline([("preprocessor", preprocessor), ("model", model)])
            pipeline.fit(X_train, y_train)
            y_pred = pipeline.predict(X_test)

            results[name] = {
                "mae":      mean_absolute_error(y_test, y_pred),
                "rmse":     float(np.sqrt(mean_squared_error(y_test, y_pred))),
                "r2":       r2_score(y_test, y_pred),
                "pipeline": pipeline,
            }
            r = results[name]
            print(f"  → MAE={r['mae']:.4f}  RMSE={r['rmse']:.4f}  R²={r['r2']:.4f}")

        best_name = max(results, key=lambda k: results[k]["r2"])
        best      = results[best_name]
        print(f"[Train] Best model: {best_name}  (R²={best['r2']:.4f})")

        joblib.dump(best["pipeline"], MODEL_PATH)

        feature_importance = {}
        if best_name == "Random Forest":
            try:
                m = best["pipeline"].named_steps["model"]
                p = best["pipeline"].named_steps["preprocessor"]
                feature_importance = dict(zip(p.get_feature_names_out(), m.feature_importances_))
            except Exception:
                pass

        metadata = {
            "best_model":         best_name,
            "best_r2":            best["r2"],
            "best_rmse":          best["rmse"],
            "best_mae":           best["mae"],
            "n_samples":          len(df),
            "n_features":         X.shape[1],
            "feature_importance": feature_importance,
            "results": {
                name: {"mae": d["mae"], "rmse": d["rmse"], "r2": d["r2"]}
                for name, d in results.items()
            },
        }
        joblib.dump(metadata, METADATA_PATH)

        msg = f"✅ Training complete! Best model: {best_name} (R²={best['r2']:.4f}, RMSE={best['rmse']:.4f})"
        print(f"[Train] {msg}")
        return True, msg

    except Exception as exc:
        traceback.print_exc()
        return False, f"❌ Training failed: {exc}"


if __name__ == "__main__":
    ok, msg = train_and_save()
    print(msg)
    sys.exit(0 if ok else 1)
