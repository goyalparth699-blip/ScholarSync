"""
Login / Signup Page
====================
Handles user authentication via Firebase (or Demo Mode).
"""

import streamlit as st
from app.utils.auth import login_user, signup_user


def show():
    """Render the login and signup interface."""

    # Override main container padding for a centered login feel
    st.markdown(
        """
        <style>
        .block-container { padding-top: 3rem !important; }
        </style>
        """,
        unsafe_allow_html=True,
    )

    # --- App logo & branding ---
    left, center, right = st.columns([1, 2, 1])
    with center:

        st.markdown(
            """
            <div style="text-align:center; padding: 30px 0 24px; animation: fadeInUp 0.6s ease both;">
                <div style="font-size:4.5rem; line-height:1;">🎓</div>
                <h1 style="
                    color: #6C63FF;
                    font-size: 2rem;
                    font-weight: 800;
                    margin: 12px 0 4px;
                    letter-spacing: -0.5px;
                ">Student Performance</h1>
                <h2 style="
                    color: #00D4FF;
                    font-size: 1.1rem;
                    font-weight: 400;
                    margin: 0 0 8px;
                ">& Lifestyle Predictor</h2>
                <p style="color:#888; font-size:0.85rem; margin:0;">
                    AI-powered academic performance prediction
                </p>
            </div>
            """,
            unsafe_allow_html=True,
        )

        # --- Tabs for Login / Sign Up ---
        tab_login, tab_signup = st.tabs(["🔐  Login", "📝  Sign Up"])

        # ==========================
        #  LOGIN TAB
        # ==========================
        with tab_login:
            st.markdown("<br>", unsafe_allow_html=True)
            with st.form("login_form", clear_on_submit=False):
                email = st.text_input(
                    "Email address",
                    placeholder="student@example.com",
                    key="login_email",
                )
                password = st.text_input(
                    "Password",
                    type="password",
                    placeholder="Enter your password",
                    key="login_password",
                )
                submitted = st.form_submit_button(
                    "Login  →", use_container_width=True
                )

            if submitted:
                if not email.strip() or not password:
                    st.error("Please enter both email and password.")
                else:
                    with st.spinner("Logging in..."):
                        ok, msg = login_user(email.strip(), password)
                    if ok:
                        st.success(msg)
                        st.rerun()
                    else:
                        st.error(msg)

        # ==========================
        #  SIGN UP TAB
        # ==========================
        with tab_signup:
            st.markdown("<br>", unsafe_allow_html=True)
            with st.form("signup_form", clear_on_submit=False):
                su_email = st.text_input(
                    "Email address",
                    placeholder="student@example.com",
                    key="signup_email",
                )
                su_pass = st.text_input(
                    "Password",
                    type="password",
                    placeholder="Minimum 6 characters",
                    key="signup_pass",
                )
                su_confirm = st.text_input(
                    "Confirm password",
                    type="password",
                    placeholder="Repeat your password",
                    key="signup_confirm",
                )
                su_submit = st.form_submit_button(
                    "Create Account  →", use_container_width=True
                )

            if su_submit:
                if not su_email.strip() or not su_pass or not su_confirm:
                    st.error("Please fill in all fields.")
                elif len(su_pass) < 6:
                    st.error("Password must be at least 6 characters.")
                elif su_pass != su_confirm:
                    st.error("Passwords do not match.")
                else:
                    with st.spinner("Creating your account..."):
                        ok, msg = signup_user(su_email.strip(), su_pass)
                    if ok:
                        st.success(msg)
                        st.rerun()
                    else:
                        st.error(msg)

        # --- Info note about Demo Mode ---
        st.markdown(
            """
            <div style="
                text-align:  center;
                padding:     14px 18px;
                background:  rgba(108,99,255,0.08);
                border:      1px solid rgba(108,99,255,0.20);
                border-radius: 12px;
                margin-top:  20px;
            ">
                <p style="color:#999; font-size:0.78rem; margin:0; line-height:1.6;">
                    💡 If Firebase is not configured, the app runs in
                    <strong style="color:#6C63FF;">Demo Mode</strong>
                    with local session storage — no setup required for testing.
                </p>
            </div>
            """,
            unsafe_allow_html=True,
        )
