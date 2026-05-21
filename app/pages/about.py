"""
About Page
===========
Project overview, tech stack, ML workflow, and team info.
"""

import streamlit as st
from app.components.cards import glass_header_html


def show():
    """Render the About page."""

    st.markdown(
        glass_header_html(
            "About This Project",
            "Student Performance & Lifestyle Predictor — Built with Python & ML",
            "ℹ️",
        ),
        unsafe_allow_html=True,
    )

    col_main, col_side = st.columns([2, 1])

    # ---------------------------------------------------------------
    # MAIN COLUMN
    # ---------------------------------------------------------------
    with col_main:

        # Project overview card
        st.markdown(
            """
            <div style="
                background:    rgba(255,255,255,0.04);
                border:        1px solid rgba(255,255,255,0.08);
                border-radius: 20px;
                padding:       28px;
                margin-bottom: 20px;
            ">
                <h3 style="color:#6C63FF; margin-top:0;">📖 Project Overview</h3>
                <p style="color:#C0C0D0; line-height:1.75; margin:0;">
                    The <strong style="color:#6C63FF;">Student Performance & Lifestyle Predictor</strong>
                    is an AI-powered web application that uses Machine Learning to predict a student's
                    exam score based on their daily lifestyle and study habits.
                </p>
                <p style="color:#C0C0D0; line-height:1.75; margin:14px 0 0;">
                    By analysing 13 key factors — including study hours, attendance, sleep, screen time,
                    motivation level, and family support — the model provides personalised insights and
                    actionable recommendations to help every student reach their potential.
                </p>
            </div>
            """,
            unsafe_allow_html=True,
        )

        # ML Workflow
        st.markdown(
            """
            <div style="
                background:    rgba(255,255,255,0.04);
                border:        1px solid rgba(255,255,255,0.08);
                border-radius: 20px;
                padding:       28px;
                margin-bottom: 20px;
            ">
                <h3 style="color:#00D4FF; margin-top:0;">🤖 ML Workflow</h3>
            """,
            unsafe_allow_html=True,
        )

        ml_steps = [
            ("Data Generation",      "Synthetic dataset with 2 000 students and 13 lifestyle/academic features."),
            ("Data Preprocessing",   "Missing value imputation, outlier clipping, one-hot encoding, StandardScaler."),
            ("Model Training",       "Three regression models trained inside sklearn Pipelines."),
            ("Evaluation",           "MAE, RMSE, and R² Score on a held-out 20 % test set."),
            ("Best Model Selection", "Highest R² model is automatically selected and saved via joblib."),
            ("Prediction",           "Real-time inference with confidence meter and personalised recommendations."),
        ]

        for step, detail in ml_steps:
            st.markdown(
                f"""
                <div style="display:flex; align-items:flex-start; gap:12px; margin-bottom:12px;">
                    <div style="width:8px; height:8px; background:#00D4FF; border-radius:50%;
                                margin-top:6px; flex-shrink:0;"></div>
                    <div>
                        <span style="color:#E0E0E0; font-weight:600;">{step}:</span>
                        <span style="color:#A0A0B0;"> {detail}</span>
                    </div>
                </div>
                """,
                unsafe_allow_html=True,
            )

        st.markdown("</div>", unsafe_allow_html=True)

        # Input features table
        st.markdown("### 📐 Input Features")
        import pandas as pd
        feat_df = pd.DataFrame({
            "Feature": [
                "Study Hours", "Attendance %", "Sleep Hours", "Previous Scores",
                "Physical Activity", "Screen Time", "Tutoring Sessions",
                "Internet Access", "Motivation Level", "Family Support",
                "Extracurricular Activities", "Teacher Quality", "Parental Education",
            ],
            "Type": [
                "Numerical", "Numerical", "Numerical", "Numerical",
                "Numerical", "Numerical", "Numerical",
                "Categorical", "Categorical", "Categorical",
                "Categorical", "Categorical", "Categorical",
            ],
            "Range / Values": [
                "0 – 12 hrs/day", "50 – 100 %", "3 – 10 hrs", "30 – 100",
                "0 – 14 hrs/week", "0 – 10 hrs/day", "0 – 5 / week",
                "Yes / No", "Low / Medium / High", "Low / Medium / High",
                "Yes / No", "Low / Medium / High", "High School / College / Postgraduate",
            ],
        })
        st.dataframe(feat_df, use_container_width=True, hide_index=True)

    # ---------------------------------------------------------------
    # SIDE COLUMN
    # ---------------------------------------------------------------
    with col_side:

        # Tech stack
        st.markdown(
            """
            <div style="
                background:    rgba(108,99,255,0.08);
                border:        1px solid rgba(108,99,255,0.25);
                border-radius: 20px;
                padding:       24px;
                margin-bottom: 18px;
            ">
                <h3 style="color:#6C63FF; margin-top:0; font-size:1rem;">🛠️ Tech Stack</h3>
            """,
            unsafe_allow_html=True,
        )

        tech_items = [
            ("Frontend",      "Streamlit + Custom CSS"),
            ("Styling",       "Glassmorphism / Dark Theme"),
            ("Backend",       "Python 3.10+"),
            ("ML Framework",  "Scikit-learn"),
            ("Models",        "Lin. Reg · Dec. Tree · R. Forest"),
            ("Data",          "Pandas · NumPy"),
            ("Visualisation", "Matplotlib · Seaborn"),
            ("Auth",          "Firebase Auth (pyrebase4)"),
            ("Database",      "Firebase Firestore"),
            ("Deployment",    "Streamlit Cloud"),
        ]

        for tech, detail in tech_items:
            st.markdown(
                f"""
                <div style="margin-bottom:10px; padding-bottom:8px;
                             border-bottom:1px solid rgba(255,255,255,0.06);">
                    <div style="color:#6C63FF; font-size:0.75rem; font-weight:600;
                                 text-transform:uppercase; letter-spacing:0.5px;">{tech}</div>
                    <div style="color:#C0C0D0; font-size:0.83rem; margin-top:2px;">{detail}</div>
                </div>
                """,
                unsafe_allow_html=True,
            )

        st.markdown("</div>", unsafe_allow_html=True)

        # Key features checklist
        st.markdown(
            """
            <div style="
                background:    rgba(0,212,255,0.05);
                border:        1px solid rgba(0,212,255,0.20);
                border-radius: 20px;
                padding:       24px;
            ">
                <h3 style="color:#00D4FF; margin-top:0; font-size:1rem;">✨ Key Features</h3>
            """,
            unsafe_allow_html=True,
        )

        features = [
            "Firebase Authentication",
            "Auto model training on startup",
            "Real-time ML prediction",
            "Confidence meter",
            "Personalised recommendations",
            "Prediction history (Firestore)",
            "Downloadable report",
            "Analytics & heatmaps",
            "Step-by-step model insights",
            "Glassmorphism dark UI",
            "Mobile responsive layout",
            "Demo mode (no Firebase needed)",
        ]

        for feat in features:
            st.markdown(
                f"""
                <div style="display:flex; align-items:center; gap:8px;
                             margin-bottom:7px; color:#C0C0D0; font-size:0.82rem;">
                    <span style="color:#00E676; font-weight:700;">✓</span> {feat}
                </div>
                """,
                unsafe_allow_html=True,
            )

        st.markdown("</div>", unsafe_allow_html=True)

    # ---------------------------------------------------------------
    # FOOTER
    # ---------------------------------------------------------------
    st.markdown("<br>", unsafe_allow_html=True)
    st.markdown(
        """
        <div style="
            text-align:    center;
            padding:       20px;
            background:    rgba(255,255,255,0.02);
            border:        1px solid rgba(255,255,255,0.06);
            border-radius: 14px;
            color:         #666;
            font-size:     0.80rem;
        ">
            Built with ❤️ using <strong style="color:#6C63FF;">Python</strong> ·
            <strong style="color:#00D4FF;">Streamlit</strong> ·
            <strong style="color:#00E676;">Scikit-learn</strong> ·
            <strong style="color:#FFD740;">Firebase</strong>
            <br><br>
            <span style="color:#555;">
                Student Performance &amp; Lifestyle Predictor — MIT License
            </span>
        </div>
        """,
        unsafe_allow_html=True,
    )
