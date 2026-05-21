"""
Authentication Utilities
=========================
Wraps Firebase Auth (via pyrebase4) for login/signup.
Falls back to Demo Mode if Firebase is not configured.
Wraps Firestore (via firebase-admin) for prediction history.
"""

import streamlit as st
from datetime import datetime
from firebase.firebase_config import init_firebase_auth, init_firestore


# ---------------------------------------------------------------------------
# LOGIN
# ---------------------------------------------------------------------------
def login_user(email: str, password: str) -> tuple[bool, str]:
    """
    Log in a user with email and password.
    Returns (success: bool, message: str).
    """
    _, auth = init_firebase_auth()

    # --- Demo mode (Firebase not configured) ---
    if auth is None:
        if email and len(password) >= 6:
            st.session_state.logged_in = True
            st.session_state.user_email = email
            st.session_state.user_id = f"demo_{email.replace('@','_')}"
            return True, "Logged in successfully! (Demo Mode — Firebase not configured)"
        return False, "Enter a valid email and a password of at least 6 characters."

    # --- Real Firebase Auth ---
    try:
        user = auth.sign_in_with_email_and_password(email, password)
        st.session_state.logged_in = True
        st.session_state.user_email = email
        st.session_state.user_id = user["localId"]
        st.session_state.id_token = user["idToken"]
        return True, "Login successful! Welcome back 👋"

    except Exception as e:
        error_str = str(e)
        if "INVALID_PASSWORD" in error_str or "INVALID_LOGIN_CREDENTIALS" in error_str:
            return False, "❌ Incorrect email or password."
        if "EMAIL_NOT_FOUND" in error_str:
            return False, "❌ No account found with this email. Please sign up."
        if "TOO_MANY_ATTEMPTS_TRY_LATER" in error_str:
            return False, "❌ Too many failed attempts. Try again later."
        if "USER_DISABLED" in error_str:
            return False, "❌ This account has been disabled."
        return False, "❌ Login failed. Please check your credentials."


# ---------------------------------------------------------------------------
# SIGNUP
# ---------------------------------------------------------------------------
def signup_user(email: str, password: str) -> tuple[bool, str]:
    """
    Register a new user with email and password.
    Returns (success: bool, message: str).
    """
    _, auth = init_firebase_auth()

    # --- Demo mode ---
    if auth is None:
        if email and len(password) >= 6:
            st.session_state.logged_in = True
            st.session_state.user_email = email
            st.session_state.user_id = f"demo_{email.replace('@','_')}"
            return True, "Account created! (Demo Mode — Firebase not configured)"
        return False, "Password must be at least 6 characters."

    # --- Real Firebase Auth ---
    try:
        user = auth.create_user_with_email_and_password(email, password)
        st.session_state.logged_in = True
        st.session_state.user_email = email
        st.session_state.user_id = user["localId"]
        st.session_state.id_token = user["idToken"]
        return True, "Account created successfully! Welcome 🎓"

    except Exception as e:
        error_str = str(e)
        if "EMAIL_EXISTS" in error_str:
            return False, "❌ An account with this email already exists. Please log in."
        if "WEAK_PASSWORD" in error_str:
            return False, "❌ Password is too weak. Use at least 6 characters."
        if "INVALID_EMAIL" in error_str:
            return False, "❌ Invalid email format."
        return False, "❌ Signup failed. Please try again."


# ---------------------------------------------------------------------------
# SAVE PREDICTION TO FIRESTORE (or session state fallback)
# ---------------------------------------------------------------------------
def save_prediction(
    user_id: str,
    user_email: str,
    inputs: dict,
    predicted_score: float,
    category: str,
) -> bool:
    """Save a prediction record. Uses Firestore if available, otherwise session state."""
    record = {
        "user_id": user_id,
        "email": user_email,
        "inputs": inputs,
        "predicted_score": round(predicted_score, 2),
        "category": category,
        "timestamp": datetime.now().isoformat(),
    }

    # Always save to session state for immediate UI access
    if "prediction_history" not in st.session_state:
        st.session_state.prediction_history = []
    st.session_state.prediction_history.insert(0, record)

    # Also try Firestore
    db = init_firestore()
    if db is not None:
        try:
            from datetime import datetime as dt
            firestore_record = {**record, "timestamp": dt.now()}
            db.collection("predictions").add(firestore_record)
        except Exception:
            pass  # Fallback to session state only

    return True


# ---------------------------------------------------------------------------
# GET PREDICTION HISTORY
# ---------------------------------------------------------------------------
def get_user_predictions(user_id: str) -> list:
    """
    Retrieve prediction history for a user.
    Tries Firestore first, falls back to session state.
    """
    db = init_firestore()

    if db is not None:
        try:
            docs = (
                db.collection("predictions")
                .where("user_id", "==", user_id)
                .stream()
            )
            records = [d.to_dict() for d in docs]
            # Sort by timestamp descending in Python (avoids needing a composite index)
            records.sort(key=lambda x: str(x.get("timestamp", "")), reverse=True)
            return records[:10]
        except Exception:
            pass

    # Session state fallback
    return st.session_state.get("prediction_history", [])
