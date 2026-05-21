"""
Prediction Page
================
Input form for student lifestyle data → ML prediction output
with confidence meter, performance category, and recommendations.
"""

import os
import pandas as pd
import numpy as np
import streamlit as st
import joblib

from app.components.cards import (
    glass_header_html,
    prediction_result_html,
    recommendation_card_html,
)
from app.utils.helpers import (
    get_performance_category,
    get_recommendations,
    get_confidence_level,
)
from app.utils.auth import save_prediction

MODEL_PATH    = os.path.join("backend", "saved_models", "best_model.pkl")
METADATA_PATH = os.path.join("backend", "saved_models", "model_metadata.pkl")


@st.cache_resource
def load_model():
    """Load the saved model pipeline and metadata (cached for performance)."""
    model    = joblib.load(MODEL_PATH)    if os.path.exists(MODEL_PATH)    else None
    metadata = joblib.load(METADATA_PATH) if os.path.exists(METADATA_PATH) else {}
    return model, metadata


def _build_input_df(values: dict) -> pd.DataFrame:
    """Convert the raw input dict into a DataFrame matching the training schema."""
    return pd.DataFrame([{
        "Study_Hours":              values["study_hours"],
        "Attendance":               values["attendance"],
        "Sleep_Hours":              values["sleep_hours"],
        "Previous_Scores":          values["previous_scores"],
        "Physical_Activity":        values["physical_activity"],
        "Screen_Time":              values["screen_time"],
        "Tutoring_Sessions":        values["tutoring_sessions"],
        "Internet_Access":          values["internet_access"],
        "Motivation_Level":         values["motivation_level"],
        "Family_Support":           values["family_support"],
        "Extracurricular_Activities": values["extracurricular"],
        "Teacher_Quality":          values["teacher_quality"],
        "Parental_Education":       values["parental_education"],
    }])


def show():
    """Render the prediction page."""

    st.markdown(
        glass_header_html(
            "Performance Predictor",
            "Fill in your study profile and get an instant ML-powered prediction",
            "🔮",
        ),
        unsafe_allow_html=True,
    )

    # --- Ensure model is available ---
    if not os.path.exists(MODEL_PATH):
        st.warning("⚠️ The ML model has not been trained yet.")
        if st.button("🚀 Train Model Now", type="primary", use_container_width=True):
            with st.spinner("Training model — this takes about 10–30 seconds…"):
                from backend.training.train import train_and_save
                ok, msg = train_and_save()
            if ok:
                st.success(msg)
                st.cache_resource.clear()
                st.rerun()
            else:
                st.error(msg)
        return

    model, metadata = load_model()

    # ---------------------------------------------------------------
    # TWO-COLUMN LAYOUT: Input | Result
    # ---------------------------------------------------------------
    col_form, col_result = st.columns([1, 1], gap="large")

    # ==========================
    # LEFT — INPUT FORM
    # ==========================
    with col_form:
        st.markdown("#### 📝 Your Study Profile")

        with st.form("prediction_form"):

            # Numerical sliders
            study_hours      = st.slider("📚 Daily Study Hours",           0.0, 12.0, 4.0, 0.5)
            attendance       = st.slider("🏫 Attendance (%)",              50,  100,  75)
            sleep_hours      = st.slider("😴 Sleep Hours / Night",         3.0, 10.0, 7.0, 0.5)
            previous_scores  = st.slider("📋 Previous Exam Score",         30,  100,  65)
            physical_activity= st.slider("🏃 Physical Activity (hrs/week)",0.0, 14.0, 3.0, 0.5)
            screen_time      = st.slider("📱 Daily Screen Time (hrs)",     0.0, 10.0, 3.0, 0.5)
            tutoring_sessions= st.slider("👨‍🏫 Tutoring Sessions / Week",   0,   5,    0)

            st.markdown("---")

            # Categorical selects (2 columns)
            ca, cb = st.columns(2)
            with ca:
                internet_access  = st.selectbox("🌐 Internet Access",       ["Yes", "No"])
                motivation_level = st.selectbox("🎯 Motivation Level",       ["Low", "Medium", "High"])
                family_support   = st.selectbox("👨‍👩‍👧 Family Support",         ["Low", "Medium", "High"])
            with cb:
                extracurricular  = st.selectbox("🎭 Extracurricular Activities", ["Yes", "No"])
                teacher_quality  = st.selectbox("👩‍🏫 Teacher Quality",       ["Low", "Medium", "High"])
                parental_education = st.selectbox(
                    "🎓 Parent Education",
                    ["High School", "College", "Postgraduate"],
                )

            predict_btn = st.form_submit_button(
                "🔮  Predict My Performance", use_container_width=True, type="primary"
            )

    # ==========================
    # RIGHT — RESULT PANEL
    # ==========================
    with col_result:

        if predict_btn:
            inputs = {
                "study_hours":       study_hours,
                "attendance":        attendance,
                "sleep_hours":       sleep_hours,
                "previous_scores":   previous_scores,
                "physical_activity": physical_activity,
                "screen_time":       screen_time,
                "tutoring_sessions": tutoring_sessions,
                "internet_access":   internet_access,
                "motivation_level":  motivation_level,
                "family_support":    family_support,
                "extracurricular":   extracurricular,
                "teacher_quality":   teacher_quality,
                "parental_education":parental_education,
            }

            input_df = _build_input_df(inputs)

            with st.spinner("Calculating your performance score…"):
                raw_pred = model.predict(input_df)[0]
                score    = float(np.clip(raw_pred, 0, 100))

            perf = get_performance_category(score)

            # ---- Result card ----
            st.markdown("#### 🎯 Your Result")
            st.markdown(
                prediction_result_html(
                    score, perf["category"], perf["color"], perf["emoji"], perf["message"]
                ),
                unsafe_allow_html=True,
            )

            # ---- Confidence meter ----
            r2         = metadata.get("best_r2", 0.75)
            conf       = get_confidence_level(r2)
            best_model = metadata.get("best_model", "ML Model")

            st.markdown(
                f"""
                <div style="
                    background:    rgba(255,255,255,0.04);
                    border:        1px solid rgba(255,255,255,0.08);
                    border-radius: 14px;
                    padding:       14px 18px;
                    margin:        8px 0;
                ">
                    <div style="display:flex; justify-content:space-between; margin-bottom:7px;">
                        <span style="color:#C0C0D0; font-size:0.82rem;">
                            🤖 {best_model} · Model Confidence
                        </span>
                        <span style="color:{conf['color']}; font-weight:700; font-size:0.82rem;">
                            {conf['level']} ({conf['percent']}%)
                        </span>
                    </div>
                    <div style="background:rgba(255,255,255,0.08); border-radius:8px; height:7px;">
                        <div style="
                            background:    linear-gradient(90deg, {conf['color']}, {conf['color']}99);
                            width:         {conf['percent']}%;
                            height:        100%;
                            border-radius: 8px;
                        "></div>
                    </div>
                </div>
                """,
                unsafe_allow_html=True,
            )

            # ---- Save prediction ----
            save_prediction(
                st.session_state.get("user_id", ""),
                st.session_state.get("user_email", ""),
                inputs,
                score,
                perf["category"],
            )

            # ---- Recommendations ----
            st.markdown("#### 💡 Personalised Recommendations")
            recs = get_recommendations(inputs, score)
            colors = ["#6C63FF", "#00D4FF", "#00E676", "#FFD740", "#FF6D00"]
            for i, rec in enumerate(recs):
                st.markdown(
                    recommendation_card_html(rec["icon"], rec["title"], rec["detail"], colors[i % len(colors)]),
                    unsafe_allow_html=True,
                )

            # ---- Download report ----
            report_lines = [
                "STUDENT PERFORMANCE PREDICTION REPORT",
                "=" * 42,
                f"Date    : {pd.Timestamp.now().strftime('%Y-%m-%d %H:%M')}",
                f"User    : {st.session_state.get('user_email', 'N/A')}",
                "",
                f"PREDICTED SCORE    : {score:.1f} / 100",
                f"PERFORMANCE GRADE  : {perf['category']}",
                f"MODEL USED         : {best_model}  (R² = {r2:.4f})",
                "",
                "INPUT PROFILE",
                "-" * 30,
                f"  Study Hours/day        : {study_hours} h",
                f"  Attendance             : {attendance} %",
                f"  Sleep Hours/night      : {sleep_hours} h",
                f"  Previous Score         : {previous_scores}",
                f"  Physical Activity      : {physical_activity} h/week",
                f"  Screen Time            : {screen_time} h/day",
                f"  Tutoring Sessions/week : {tutoring_sessions}",
                f"  Internet Access        : {internet_access}",
                f"  Motivation Level       : {motivation_level}",
                f"  Family Support         : {family_support}",
                f"  Extracurricular        : {extracurricular}",
                f"  Teacher Quality        : {teacher_quality}",
                f"  Parental Education     : {parental_education}",
                "",
                "RECOMMENDATIONS",
                "-" * 30,
            ]
            for rec in recs:
                report_lines.append(f"  • {rec['title']}: {rec['detail']}")

            st.download_button(
                "📥  Download Report (.txt)",
                "\n".join(report_lines),
                file_name="prediction_report.txt",
                mime="text/plain",
                use_container_width=True,
            )

        else:
            # Placeholder before first prediction
            st.markdown(
                """
                <div style="
                    text-align:    center;
                    padding:       70px 30px;
                    background:    rgba(255,255,255,0.02);
                    border:        1px dashed rgba(108,99,255,0.35);
                    border-radius: 22px;
                    margin-top:    50px;
                ">
                    <div style="font-size:3.5rem; margin-bottom:14px;">🔮</div>
                    <h3 style="color:#6C63FF; margin-bottom:8px;">Ready to Predict</h3>
                    <p style="color:#888; margin:0; font-size:0.88rem;">
                        Fill in your study profile on the left<br>
                        and click <strong>Predict My Performance</strong>.
                    </p>
                </div>
                """,
                unsafe_allow_html=True,
            )
