# 🎓 Student Performance & Lifestyle Predictor

An AI-powered Streamlit web application that predicts student academic performance based on lifestyle habits and study patterns using Machine Learning — with Firebase Authentication and a modern Glassmorphism dark UI.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 Firebase Auth | Secure login/signup with email & password |
| 🔮 ML Prediction | Predict exam score from 13 lifestyle features |
| 📊 Analytics | Correlation heatmap, feature importance, visualizations |
| 🤖 Model Insights | Step-by-step training walkthrough (great for viva!) |
| 💡 Recommendations | Personalized tips based on your inputs |
| 📜 History | Prediction history stored in Firestore |
| 📥 Download | Export prediction report as text file |
| 🎨 Premium UI | Glassmorphism cards, gradients, animations |

---

## 🚀 Quick Start

### 1. Clone & enter project
```bash
git clone https://github.com/yourusername/student-performance-predictor.git
cd student-performance-predictor
```

### 2. Create virtual environment
```bash
python -m venv venv
source venv/bin/activate       # macOS/Linux
venv\Scripts\activate          # Windows
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure environment
```bash
cp .env.example .env
# Open .env and fill in your Firebase credentials
```

### 5. Train the ML model
```bash
python backend/training/train.py
```

### 6. Launch the app
```bash
streamlit run streamlit_app.py
```

> **Demo Mode**: If Firebase is not configured, the app runs in local demo mode — no Firebase setup needed for testing!

---

## 🔥 Firebase Setup Guide

### Step 1 — Create Firebase Project
1. Go to [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Click **Add Project** → enter a name → Continue

### Step 2 — Enable Authentication
1. In your project, go to **Build > Authentication**
2. Click **Get Started**
3. Enable **Email/Password** provider

### Step 3 — Enable Firestore
1. Go to **Build > Firestore Database**
2. Click **Create Database**
3. Choose **Start in test mode** (for development)
4. Select a region → Done

### Step 4 — Get Web App Config
1. Go to **Project Settings** (gear icon)
2. Scroll to **Your apps** → click **Web** icon
3. Register app, copy the `firebaseConfig` object
4. Fill in your `.env` file with those values

### Step 5 — Get Admin SDK Credentials (for Firestore from Python)
1. Go to **Project Settings > Service Accounts**
2. Click **Generate new private key**
3. Download the JSON file → save it in the project root (it's gitignored)
4. Set `FIREBASE_ADMIN_CREDENTIALS=path/to/downloaded-key.json` in `.env`

---

## 🌐 Streamlit Cloud Deployment

1. Push your code to a **GitHub repository**
2. Go to [https://share.streamlit.io](https://share.streamlit.io)
3. Click **New app** → connect your GitHub repo
4. Set **Main file path** to `streamlit_app.py`
5. Under **Advanced settings > Secrets**, add all your `.env` keys in TOML format:
```toml
FIREBASE_API_KEY = "your_key"
FIREBASE_AUTH_DOMAIN = "your_domain"
...
```
6. Click **Deploy**

---

## 📁 Project Structure

```
student-performance-predictor/
│
├── app/
│   ├── pages/
│   │   ├── login.py          # Login & Signup page
│   │   ├── dashboard.py      # Welcome dashboard
│   │   ├── prediction.py     # ML prediction form
│   │   ├── analytics.py      # Data visualizations
│   │   ├── model_insights.py # Training walkthrough
│   │   └── about.py          # Project info
│   │
│   ├── components/
│   │   └── cards.py          # Reusable HTML card components
│   │
│   ├── utils/
│   │   ├── auth.py           # Firebase auth wrapper
│   │   └── helpers.py        # Performance categories, recommendations
│   │
│   └── styles/
│       └── main.css          # Glassmorphism dark theme
│
├── backend/
│   ├── data/
│   │   └── generate_data.py  # Synthetic dataset generator
│   │
│   ├── preprocessing/
│   │   └── preprocess.py     # Cleaning, encoding, scaling
│   │
│   ├── training/
│   │   └── train.py          # Train & save best ML model
│   │
│   ├── models/
│   │   └── model_utils.py    # Load model, predict
│   │
│   └── saved_models/         # .pkl files saved here
│
├── firebase/
│   └── firebase_config.py    # Firebase initialization
│
├── notebooks/
│   └── exploration.ipynb     # EDA notebook
│
├── streamlit_app.py           # Main app entry point
├── requirements.txt
├── .env.example
├── .gitignore
└── README.md
```

---

## 🤖 Machine Learning Models

| Model | Typical MAE | Typical RMSE | Typical R² |
|-------|-------------|--------------|------------|
| Linear Regression | ~3.5 | ~4.5 | ~0.72 |
| Decision Tree | ~3.2 | ~4.2 | ~0.76 |
| **Random Forest** | **~2.8** | **~3.6** | **~0.83** |

> Best model is **automatically selected** based on highest R² score.

---

## 🛠 Tech Stack

- **UI**: Streamlit + Custom CSS (Glassmorphism)
- **ML**: Scikit-learn (Linear Regression, Decision Tree, Random Forest)
- **Data**: Pandas, NumPy
- **Visualization**: Matplotlib, Seaborn
- **Auth**: Firebase Authentication via pyrebase4
- **Database**: Firebase Firestore via firebase-admin
- **Deployment**: Streamlit Cloud

---

## 📝 License

MIT License — free to use, modify, and distribute.
