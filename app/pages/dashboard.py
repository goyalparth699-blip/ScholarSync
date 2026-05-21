"""
Dashboard Page
===============
Welcome screen showing quick stats, navigation cards,
and recent prediction history for the logged-in user.
"""

import streamlit as st
import pandas as pd
from datetime import datetime

from app.components.cards import glass_header_html, metric_card_html, feature_card_html
from app.utils.auth import get_user_predictions


def show():
    """Render the dashboard page."""

    # Page header
    st.markdown(
        glass_header_html(
            f"Welcome back! 👋",
            f"Signed in as  {st.session_state.get('user_email', 'Student')}",
            "🏠",
        ),
        unsafe_allow_html=True,
    )

    # ---------------------------------------------------------------
    # QUICK STATS
    # ---------------------------------------------------------------
    predictions = get_user_predictions(st.session_state.get("user_id", ""))
    total   = len(predictions)
    avg     = (sum(p.get("predicted_score", 0) for p in predictions) / total) if total else 0
    best    = max((p.get("predicted_score", 0) for p in predictions), default=0)
    today   = datetime.now()

    st.markdown("### 📊 Quick Stats")
    c1, c2, c3, c4 = st.columns(4)
    with c1:
        st.markdown(
            metric_card_html("Predictions Made", str(total), "Total analyses", "#6C63FF", "🔮"),
            unsafe_allow_html=True,
        )
    with c2:
        st.markdown(
            metric_card_html("Average Score", f"{avg:.1f}", "Across all runs", "#00D4FF", "📈"),
            unsafe_allow_html=True,
        )
    with c3:
        st.markdown(
            metric_card_html("Best Score", f"{best:.1f}", "Highest predicted", "#00E676", "🌟"),
            unsafe_allow_html=True,
        )
    with c4:
        st.markdown(
            metric_card_html("Today", today.strftime("%b %d"), today.strftime("%Y"), "#FFD740", "📅"),
            unsafe_allow_html=True,
        )

    st.markdown("<br>", unsafe_allow_html=True)

    # ---------------------------------------------------------------
    # NAVIGATION FEATURE CARDS
    # ---------------------------------------------------------------
    st.markdown("### 🚀 Explore the App")
    fc1, fc2, fc3 = st.columns(3)

    nav_items = [
        ("🔮 Make a Prediction",
         "Enter your study habits & lifestyle inputs to get an instant ML-powered performance prediction.",
         "#6C63FF"),
        ("📊 Analytics Dashboard",
         "Explore dataset statistics, correlation heatmaps, feature importance, and study pattern charts.",
         "#00D4FF"),
        ("🤖 Model Training Insights",
         "Walk through the complete ML training pipeline — perfect for understanding or explaining in a viva.",
         "#00E676"),
    ]
    for col, (title, desc, color) in zip([fc1, fc2, fc3], nav_items):
        with col:
            st.markdown(feature_card_html(title, desc, color), unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)

    # ---------------------------------------------------------------
    # RECENT PREDICTIONS TABLE
    # ---------------------------------------------------------------
    st.markdown("### 📜 Recent Predictions")

    if predictions:
        rows = []
        for p in predictions[:8]:
            ts = p.get("timestamp", "")
            # Handle both ISO string and Firestore Timestamp objects
            if hasattr(ts, "strftime"):
                ts_str = ts.strftime("%Y-%m-%d %H:%M")
            else:
                ts_str = str(ts)[:16].replace("T", " ")

            rows.append({
                "Timestamp":       ts_str,
                "Predicted Score": p.get("predicted_score", "—"),
                "Category":        p.get("category", "—"),
                "Study Hrs":       p.get("inputs", {}).get("study_hours", "—"),
                "Attendance %":    p.get("inputs", {}).get("attendance",   "—"),
                "Motivation":      p.get("inputs", {}).get("motivation_level", "—"),
            })

        df_hist = pd.DataFrame(rows)
        st.dataframe(df_hist, use_container_width=True, hide_index=True)

    else:
        st.markdown(
            """
            <div style="
                text-align:    center;
                padding:       50px 30px;
                background:    rgba(255,255,255,0.02);
                border:        1px dashed rgba(108,99,255,0.30);
                border-radius: 18px;
                color:         #666;
            ">
                <div style="font-size:3rem; margin-bottom:12px;">🔮</div>
                <p style="color:#888; margin:0;">No predictions yet.</p>
                <p style="color:#666; font-size:0.82rem; margin:4px 0 0;">
                    Head to <strong style="color:#6C63FF;">Prediction</strong> to get started!
                </p>
            </div>
            """,
            unsafe_allow_html=True,
        )

    # ---------------------------------------------------------------
    # HOW IT WORKS (brief explainer)
    # ---------------------------------------------------------------
    st.markdown("<br>", unsafe_allow_html=True)
    st.markdown("### ℹ️ How It Works")

    steps = [
        ("1️⃣ Input Your Data",   "Enter study hours, attendance, sleep, screen time and other lifestyle factors."),
        ("2️⃣ ML Prediction",     "A trained Random Forest model predicts your expected exam score (0–100)."),
        ("3️⃣ Performance Grade", "The score is mapped to a category: Excellent / Good / Average / Below Average."),
        ("4️⃣ Smart Tips",        "Get personalised recommendations to improve your weakest areas."),
        ("5️⃣ Save & Track",      "Every prediction is saved so you can monitor your progress over time."),
    ]

    col_a, col_b = st.columns(2)
    for i, (step, detail) in enumerate(steps):
        col = col_a if i % 2 == 0 else col_b
        with col:
            st.markdown(
                f"""
                <div style="
                    background:    rgba(255,255,255,0.03);
                    border:        1px solid rgba(255,255,255,0.07);
                    border-left:   3px solid #6C63FF;
                    border-radius: 12px;
                    padding:       12px 16px;
                    margin-bottom: 10px;
                ">
                    <span style="color:#E0E0E0; font-weight:600; font-size:0.88rem;">{step}</span>
                    <br>
                    <span style="color:#A0A0B0; font-size:0.80rem;">{detail}</span>
                </div>
                """,
                unsafe_allow_html=True,
            )
