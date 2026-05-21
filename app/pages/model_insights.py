"""
Model Training Insights Page
==============================
Step-by-step walkthrough of the ML pipeline:
data → preprocessing → training → evaluation → best model selection.
Great for understanding or explaining the project in a viva.
"""

import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import streamlit as st
import joblib

from app.components.cards import glass_header_html, metric_card_html, step_card_html

DATA_PATH     = os.path.join("backend", "data", "student_data.csv")
METADATA_PATH = os.path.join("backend", "saved_models", "model_metadata.pkl")


@st.cache_data
def load_metadata() -> dict:
    return joblib.load(METADATA_PATH) if os.path.exists(METADATA_PATH) else None


@st.cache_data
def load_data() -> pd.DataFrame:
    if os.path.exists(DATA_PATH):
        return pd.read_csv(DATA_PATH)
    from backend.data.generate_data import generate_student_data
    return generate_student_data()


def _dark_fig(w: int = 10, h: int = 4):
    fig, axes = plt.subplots(1, 3, figsize=(w, h))
    fig.patch.set_alpha(0)
    return fig, axes


def show():
    st.markdown(
        glass_header_html(
            "Model Training Insights",
            "A complete walkthrough of the ML pipeline — from raw data to predictions",
            "🤖",
        ),
        unsafe_allow_html=True,
    )

    metadata = load_metadata()

    # ---------------------------------------------------------------
    # TRAIN BUTTON (if model not yet trained)
    # ---------------------------------------------------------------
    if metadata is None:
        st.warning("⚠️ The model has not been trained yet.")
        if st.button("🚀 Train Model Now", type="primary", use_container_width=True):
            with st.spinner("Training — please wait (10–30 seconds)…"):
                from backend.training.train import train_and_save
                ok, msg = train_and_save()
            if ok:
                st.success(msg)
                st.cache_data.clear()
                st.rerun()
            else:
                st.error(msg)

        # Still show the conceptual pipeline even without a trained model
        st.markdown("---")
        st.markdown("### 📋 Training Pipeline (Overview)")
        for step, detail in [
            ("1️⃣ Data Generation",    "A synthetic dataset of 2 000 students is created with realistic feature-score correlations."),
            ("2️⃣ Data Cleaning",      "Missing values are imputed with median / mode. Duplicates are removed."),
            ("3️⃣ Encoding",           "6 categorical features are one-hot encoded (Internet Access, Motivation, Family Support, etc.)."),
            ("4️⃣ Feature Scaling",    "7 numerical features are standardized using StandardScaler (mean=0, std=1)."),
            ("5️⃣ Train / Test Split", "Data is randomly split: 80 % training, 20 % test (random_state=42)."),
            ("6️⃣ Model Training",     "Three regressors are trained inside sklearn Pipelines: Linear Regression, Decision Tree, Random Forest."),
            ("7️⃣ Evaluation",         "Each model is scored on the test set: MAE, RMSE, and R² Score."),
            ("8️⃣ Best Model Saved",   "The model with the highest R² is saved to backend/saved_models/best_model.pkl via joblib."),
        ]:
            with st.expander(step):
                st.write(detail)
        return

    # ---------------------------------------------------------------
    # TABS
    # ---------------------------------------------------------------
    t1, t2, t3, t4, t5 = st.tabs([
        "📋 Pipeline Steps",
        "🏆 Model Comparison",
        "🥇 Best Model",
        "🔍 Feature Importance",
        "📄 Dataset Preview",
    ])

    # =============================================
    # TAB 1 — PIPELINE STEPS
    # =============================================
    with t1:
        st.markdown("### 📋 ML Training Pipeline")

        steps = [
            ("1️⃣ Data Generation",
             f"Synthetic dataset: {metadata.get('n_samples', 2000):,} students, "
             f"{metadata.get('n_features', 13)} features",
             "#6C63FF"),
            ("2️⃣ Data Cleaning",
             "Checked for missing values (none found). Clipped numerical values to valid ranges.",
             "#00D4FF"),
            ("3️⃣ Categorical Encoding",
             "OneHotEncoder (drop='first') applied to 6 categorical columns → expanded feature matrix.",
             "#00E676"),
            ("4️⃣ Numerical Scaling",
             "StandardScaler applied to 7 numerical columns inside a ColumnTransformer.",
             "#FFD740"),
            ("5️⃣ Train / Test Split",
             "80 % training  |  20 % test  |  random_state=42 for reproducibility.",
             "#FF6D00"),
            ("6️⃣ Pipeline Construction",
             "Each model wrapped in an sklearn Pipeline: Preprocessor → Regressor.",
             "#FF5252"),
            ("7️⃣ Model Training",
             "3 models trained: Linear Regression, Decision Tree (max_depth=8), Random Forest (100 trees).",
             "#6C63FF"),
            ("8️⃣ Evaluation",
             "MAE, RMSE, R² computed on held-out test set for fair comparison.",
             "#00D4FF"),
            ("9️⃣ Best Model Selection",
             f"Highest R² model auto-selected: '{metadata.get('best_model','—')}' — saved via joblib.",
             "#00E676"),
        ]

        col_a, col_b = st.columns(2)
        for i, (step, detail, color) in enumerate(steps):
            col = col_a if i % 2 == 0 else col_b
            with col:
                st.markdown(step_card_html(step, detail, color), unsafe_allow_html=True)

    # =============================================
    # TAB 2 — MODEL COMPARISON
    # =============================================
    with t2:
        st.markdown("### 🏆 Performance Comparison")

        results = metadata.get("results", {})
        if not results:
            st.info("No results stored in metadata.")
        else:
            # Summary table
            rows = []
            best = metadata.get("best_model", "")
            for name, data in results.items():
                rows.append({
                    "Model":    name,
                    "MAE ↓":   round(data["mae"],  4),
                    "RMSE ↓":  round(data["rmse"], 4),
                    "R² ↑":    round(data["r2"],   4),
                    "Status":  "✅ Best" if name == best else "—",
                })
            df_res = pd.DataFrame(rows)
            st.dataframe(df_res, use_container_width=True, hide_index=True)

            # Bar chart comparison
            st.markdown("**Visual Comparison**")
            model_names = list(results.keys())
            pal = ["#6C63FF", "#00D4FF", "#00E676"]

            fig, axes = plt.subplots(1, 3, figsize=(13, 4))
            fig.patch.set_alpha(0)

            for ax, (metric_key, label, note) in zip(
                axes,
                [("mae", "MAE", "lower = better"),
                 ("rmse","RMSE","lower = better"),
                 ("r2",  "R² Score","higher = better")],
            ):
                vals  = [results[m][metric_key] for m in model_names]
                bars  = ax.bar(model_names, vals, color=pal, alpha=0.85)
                ax.set_title(f"{label}\n({note})", color="white", fontsize=9)
                ax.tick_params(colors="#C0C0D0", labelsize=7)
                ax.set_facecolor("none")
                for spine in ax.spines.values():
                    spine.set_edgecolor("rgba(255,255,255,0.10)")
                for bar, v in zip(bars, vals):
                    ax.text(
                        bar.get_x() + bar.get_width()/2,
                        bar.get_height() + 0.001,
                        f"{v:.3f}", ha="center", color="white", fontsize=7.5,
                    )
            plt.tight_layout()
            st.pyplot(fig)
            plt.close()

    # =============================================
    # TAB 3 — BEST MODEL
    # =============================================
    with t3:
        st.markdown("### 🥇 Best Model Details")

        c1, c2, c3, c4 = st.columns(4)
        with c1:
            st.markdown(
                metric_card_html("Best Model", metadata.get("best_model","—"), "Algorithm", "#00E676", "🤖"),
                unsafe_allow_html=True,
            )
        with c2:
            st.markdown(
                metric_card_html("R² Score", f"{metadata.get('best_r2',0):.4f}", "Explained variance", "#6C63FF", "📈"),
                unsafe_allow_html=True,
            )
        with c3:
            st.markdown(
                metric_card_html("RMSE", f"{metadata.get('best_rmse',0):.4f}", "Root mean sq error", "#00D4FF", "🎯"),
                unsafe_allow_html=True,
            )
        with c4:
            st.markdown(
                metric_card_html("MAE", f"{metadata.get('best_mae',0):.4f}", "Mean absolute error", "#FFD740", "📏"),
                unsafe_allow_html=True,
            )

        st.markdown("<br>", unsafe_allow_html=True)

        # Metric explanations for viva
        with st.expander("ℹ️ What do these metrics mean? (Click to expand)"):
            st.markdown("""
| Metric | Full Name | Meaning |
|--------|-----------|---------|
| **MAE** | Mean Absolute Error | Average absolute difference between predicted and actual scores. Lower = better. |
| **RMSE** | Root Mean Squared Error | Similar to MAE but penalises large errors more. Lower = better. |
| **R²** | R-Squared (Coefficient of Determination) | Proportion of variance explained by the model. Range: 0–1. Higher = better. |
            """)

        with st.expander("ℹ️ Why Random Forest usually wins?"):
            st.markdown("""
**Random Forest** is an ensemble method that:
- Trains **100 decision trees** on different random subsets of data
- Combines their predictions by **averaging** (reduces overfitting)
- Handles **non-linear relationships** that Linear Regression misses
- Robust to **outliers** compared to a single Decision Tree

This makes it consistently outperform the other two models on tabular data.
            """)

    # =============================================
    # TAB 4 — FEATURE IMPORTANCE
    # =============================================
    with t4:
        fi = metadata.get("feature_importance", {})
        if not fi:
            st.info(
                "Feature importance is only available when **Random Forest** is the best model. "
                "It uses built-in Gini impurity reduction scores."
            )
        else:
            st.markdown("### 🔍 Feature Importance (Random Forest)")
            st.caption("Higher bar = feature explains more of the variance in exam scores.")

            fi_df = (
                pd.DataFrame(list(fi.items()), columns=["Feature", "Importance"])
                .sort_values("Importance", ascending=True)
                .tail(15)
            )

            fig, ax = plt.subplots(figsize=(10, 6))
            fig.patch.set_alpha(0)
            ax.set_facecolor("none")

            cmap   = plt.cm.get_cmap("plasma", len(fi_df))
            colors = [cmap(i / len(fi_df)) for i in range(len(fi_df))]
            bars   = ax.barh(fi_df["Feature"], fi_df["Importance"], color=colors, alpha=0.88)

            for bar, val in zip(bars, fi_df["Importance"]):
                ax.text(val + 0.001, bar.get_y() + bar.get_height()/2,
                        f"{val:.4f}", va="center", color="white", fontsize=8)

            ax.tick_params(colors="#C0C0D0", labelsize=8)
            ax.set_xlabel("Importance Score", color="#C0C0D0", fontsize=9)
            for spine in ax.spines.values():
                spine.set_edgecolor("rgba(255,255,255,0.10)")

            plt.tight_layout()
            st.pyplot(fig)
            plt.close()

    # =============================================
    # TAB 5 — DATASET PREVIEW
    # =============================================
    with t5:
        df = load_data()

        col1, col2 = st.columns(2)
        with col1:
            st.markdown("**Sample Data (first 10 rows)**")
            st.dataframe(df.head(10), use_container_width=True, hide_index=True)

        with col2:
            st.markdown("**Descriptive Statistics**")
            st.dataframe(
                df.select_dtypes(include=[np.number]).describe().round(2),
                use_container_width=True,
            )

        # Value counts for categoricals
        st.markdown("**Categorical Feature Distributions**")
        cat_cols = ["Motivation_Level", "Family_Support", "Internet_Access",
                    "Extracurricular_Activities", "Teacher_Quality"]
        cc1, cc2, cc3 = st.columns(3)
        for i, col_name in enumerate(cat_cols):
            col = [cc1, cc2, cc3][i % 3]
            with col:
                vc = df[col_name].value_counts().reset_index()
                vc.columns = [col_name, "Count"]
                st.dataframe(vc, use_container_width=True, hide_index=True)
