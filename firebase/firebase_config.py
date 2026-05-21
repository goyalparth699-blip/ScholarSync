"""
Firebase Configuration
=======================
Initializes Firebase Authentication (via pyrebase4) and
Firebase Admin SDK (for Firestore). Supports both local .env
and Streamlit Cloud secrets.toml for credentials.
"""

import os
import json


def _get_secret(key: str, default: str = "") -> str:
    """Get a secret from Streamlit secrets or environment variables."""
    try:
        import streamlit as st
        val = st.secrets.get(key, None)
        if val:
            return val
    except Exception:
        pass
    return os.getenv(key, default)


def get_firebase_web_config() -> dict:
    """Build the Firebase web app config dictionary."""
    return {
        "apiKey": _get_secret("FIREBASE_API_KEY"),
        "authDomain": _get_secret("FIREBASE_AUTH_DOMAIN"),
        "projectId": _get_secret("FIREBASE_PROJECT_ID"),
        "storageBucket": _get_secret("FIREBASE_STORAGE_BUCKET"),
        "messagingSenderId": _get_secret("FIREBASE_MESSAGING_SENDER_ID"),
        "appId": _get_secret("FIREBASE_APP_ID"),
        "databaseURL": "",
    }


def init_firebase_auth():
    """
    Initialize pyrebase4 for client-side Firebase Authentication.
    Returns (firebase_app, auth_object) or (None, None) if not configured.
    """
    try:
        import pyrebase
        config = get_firebase_web_config()

        # Check that at least the API key is present
        if not config.get("apiKey"):
            return None, None

        firebase_app = pyrebase.initialize_app(config)
        return firebase_app, firebase_app.auth()

    except ImportError:
        return None, None
    except Exception:
        return None, None


def init_firestore():
    """
    Initialize Firebase Admin SDK for Firestore access.
    Returns a Firestore client or None if not configured.
    """
    try:
        import firebase_admin
        from firebase_admin import credentials, firestore

        # Avoid re-initializing if already done
        if firebase_admin._apps:
            return firestore.client()

        cred_source = _get_secret("FIREBASE_ADMIN_CREDENTIALS")
        if not cred_source:
            return None

        # cred_source can be a file path or a JSON string
        if os.path.isfile(cred_source):
            cred = credentials.Certificate(cred_source)
        else:
            cred_dict = json.loads(cred_source)
            cred = credentials.Certificate(cred_dict)

        firebase_admin.initialize_app(cred)
        return firestore.client()

    except Exception:
        return None
