"""
Student Performance & Lifestyle Predictor
==========================================
Main entry point for the Streamlit application.
Handles page routing and session management.
"""

import os
import streamlit as st
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# --- Page Configuration (must be first Streamlit call) ---
st.set_page_config(
    page_title="Student Performance Predictor",
    page_icon="🎓",
    layout="wide",
    initial_sidebar_state="expanded",
)


def load_css():
    """Load custom CSS styles for the glassmorphism dark theme."""
    css_path = os.path.join("app", "styles", "main.css")
    if os.path.exists(css_path):
        with open(css_path) as f:
            st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)


load_css()

# --- Initialize Session State ---
if "logged_in" not in st.session_state:
    st.session_state.logged_in = False
if "user_email" not in st.session_state:
    st.session_state.user_email = None
if "user_id" not in st.session_state:
    st.session_state.user_id = None
if "prediction_history" not in st.session_state:
    st.session_state.prediction_history = []

# --- Auto-train model if not already trained ---
MODEL_PATH = os.path.join("backend", "saved_models", "best_model.pkl")
if not os.path.exists(MODEL_PATH):
    with st.spinner("⚙️ Setting up ML model for first run... Please wait."):
        from backend.training.train import train_and_save
        success, msg = train_and_save()
        if success:
            st.toast(msg, icon="✅")

# --- Router ---
if not st.session_state.logged_in:
    # Show login/signup page
    from app.pages import login
    login.show()

else:
    # Show authenticated app with sidebar navigation
    from streamlit_option_menu import option_menu
    from app.pages import dashboard, prediction, analytics, model_insights, about

    with st.sidebar:
        # User info header
        st.markdown(
            f"""
            <div style='text-align:center; padding: 15px 0 10px;'>
                <div style='font-size:2.5rem;'>🎓</div>
                <h3 style='color:#6C63FF; margin:5px 0 2px; font-size:1rem;'>SP Predictor</h3>
                <p style='color:#888; font-size:0.75rem; margin:0; word-break:break-all;'>
                    {st.session_state.user_email or "Student"}
                </p>
            </div>
            <hr style='border:none; border-top:1px solid rgba(255,255,255,0.1); margin:10px 0;'>
            """,
            unsafe_allow_html=True,
        )

        # Navigation menu
        selected = option_menu(
            menu_title=None,
            options=["Dashboard", "Prediction", "Analytics", "Model Insights", "About"],
            icons=[
                "speedometer2",
                "graph-up-arrow",
                "bar-chart-line",
                "cpu",
                "info-circle",
            ],
            menu_icon="cast",
            default_index=0,
            styles={
                "container": {
                    "padding": "0!important",
                    "background-color": "transparent",
                },
                "icon": {"color": "#6C63FF", "font-size": "15px"},
                "nav-link": {
                    "font-size": "13px",
                    "text-align": "left",
                    "margin": "2px 0",
                    "color": "#C0C0D0",
                    "background-color": "transparent",
                    "border-radius": "10px",
                    "padding": "10px 15px",
                },
                "nav-link-selected": {
                    "background-color": "rgba(108,99,255,0.25)",
                    "color": "#E0E0E0",
                    "font-weight": "600",
                },
            },
        )

        st.markdown(
            "<hr style='border:none; border-top:1px solid rgba(255,255,255,0.1); margin:10px 0;'>",
            unsafe_allow_html=True,
        )

        # Logout button
        if st.button("🚪  Logout", use_container_width=True):
            st.session_state.logged_in = False
            st.session_state.user_email = None
            st.session_state.user_id = None
            st.session_state.prediction_history = []
            st.rerun()

    # Route to selected page
    if selected == "Dashboard":
        dashboard.show()
    elif selected == "Prediction":
        prediction.show()
    elif selected == "Analytics":
        analytics.show()
    elif selected == "Model Insights":
        model_insights.show()
    elif selected == "About":
        about.show()
