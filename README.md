# 🎓 ScholarSync — AI Student Performance Platform

> An AI-powered web app that predicts your exam score from daily habits, tracks study sessions, and gives personalized insights to help you improve.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 Firebase Auth | Secure email/password login — works without Firebase in demo mode |
| 🔮 ML Prediction | Predict exam score from 13 lifestyle factors via trained Random Forest |
| ⚡ Live Estimate | Score updates instantly as you drag sliders (client-side formula) |
| 📊 Influencing Factors | See which habits help or hurt your score the most |
| 📅 Study Log | Log daily sessions — study hours, sleep, mood, focus, screen time |
| 📈 Analytics | 14-day trend charts, sleep vs productivity, subject breakdown |
| 🤖 AI Insights | Auto-generated observations: burnout risk, sleep deficit, focus trends |
| 🏆 Achievements | Unlock badges for streaks, sleep quality, focus, and consistency |
| 🔮 AI Forecast | Projected score range based on current habits and streak |
| 🧪 Demo Mode | Sample data pre-loaded so the app never feels empty |
| 📥 Download | Export ML prediction as a text report |

---

## 🏗 Architecture

```
┌─────────────────────────────┐     HTTPS      ┌─────────────────────────────┐
│   Frontend (Next.js 14)     │ ─────────────▶ │   Backend API (FastAPI)     │
│   Vercel                    │ ◀───────────── │   Render.com                │
│                             │   JSON score   │                             │
│  • Firebase Auth            │                │  • /predict  (ML inference) │
│  • localStorage data        │                │  • /analytics (dataset stats│
│  • Recharts + Framer Motion │                │  • /health   (status check) │
│  • AI insights (client)     │                │  • Auto-trains on cold start│
└─────────────────────────────┘                └─────────────────────────────┘
                                                          │
                                                          ▼
                                               ┌─────────────────────┐
                                               │  ML Pipeline        │
                                               │  scikit-learn       │
                                               │  Random Forest 🌲  │
                                               │  auto-saved .pkl    │
                                               └─────────────────────┘
```

---

## 📁 Project Structure

```
student-performance-predictor/
│
├── frontend/                   ← Next.js 14 app (deploy to Vercel)
│   ├── app/
│   │   ├── (auth)/             # Login & signup pages
│   │   └── (app)/              # Protected pages
│   │       ├── dashboard/      # Overview, streaks, goals
│   │       ├── prediction/     # ML prediction form
│   │       ├── study-log/      # Daily session logger
│   │       ├── analytics/      # Charts and trends
│   │       ├── insights/       # AI insight cards
│   │       └── profile/        # Goals and settings
│   ├── lib/
│   │   ├── api.ts              # FastAPI client
│   │   ├── storage.ts          # localStorage + AI insights engine
│   │   ├── utils.ts            # localEstimate, influencing factors
│   │   ├── firebase.ts         # Firebase Auth setup
│   │   ├── demo.ts             # Demo data seed
│   │   └── types.ts            # TypeScript interfaces
│   ├── vercel.json             # Vercel deployment config
│   └── .env.local.example      # Copy → .env.local
│
├── api/                        ← FastAPI backend (deploy to Render)
│   ├── main.py                 # Routes: /predict /analytics /health
│   └── requirements.txt        # Python dependencies
│
├── backend/                    ← ML pipeline (imported by api/)
│   ├── data/
│   │   └── generate_data.py    # Synthetic dataset generator
│   ├── preprocessing/
│   │   └── preprocess.py       # Clean, scale, encode
│   ├── training/
│   │   └── train.py            # Train 3 models, save best
│   └── saved_models/           # best_model.pkl (auto-generated, gitignored)
│
├── render.yaml                 # Render.com backend deploy config
├── .gitignore
└── README.md
```

---

## 🚀 Local Development

### 1. Clone the repo
```bash
git clone https://github.com/goyalparth699-blip/ScholarSync.git
cd ScholarSync
```

### 2. Start the backend API
```bash
# Create a Python virtual environment
python -m venv venv
source venv/bin/activate        # macOS/Linux
venv\Scripts\activate           # Windows

# Install API dependencies
pip install -r api/requirements.txt

# Start the API (auto-trains the model on first run)
cd api
uvicorn main:app --reload --port 8000
```
> API will be live at `http://localhost:8000`
> Swagger docs at `http://localhost:8000/docs`

### 3. Start the frontend
```bash
cd frontend

# Copy env example and fill in values
cp .env.local.example .env.local

# Install dependencies
npm install

# Start dev server
npm run dev
```
> App will be live at `http://localhost:3000`

---

## 🔥 Firebase Setup (Optional)

Firebase is **not required** — the app works in demo mode without it.
Set it up if you want real user accounts.

1. Go to [Firebase Console](https://console.firebase.google.com/) → **Add Project**
2. **Build → Authentication** → Get Started → Enable **Email/Password**
3. **Project Settings → Your Apps** → click **Web** icon → copy `firebaseConfig`
4. Paste values into `frontend/.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123:web:abc
```

---

## 🌐 Deployment Guide

### Backend → Render.com (Free tier)

1. Go to [render.com](https://render.com) → **New → Web Service**
2. Connect your GitHub repo
3. Set these values:

| Setting | Value |
|---|---|
| **Runtime** | Python |
| **Build Command** | `pip install -r api/requirements.txt` |
| **Start Command** | `cd api && uvicorn main:app --host 0.0.0.0 --port $PORT` |

4. Click **Deploy** — the model will auto-train on first cold start (~2 min)
5. Copy your Render URL (e.g. `https://scholarsync-api.onrender.com`)

> The `render.yaml` in the repo root auto-configures this.

---

### Frontend → Vercel (Free tier)

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo
3. **IMPORTANT:** Set **Root Directory** to `frontend`
4. Add Environment Variables:

| Key | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://your-render-url.onrender.com` |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | *(from Firebase, or leave blank for demo mode)* |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | *(from Firebase)* |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | *(from Firebase)* |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | *(from Firebase)* |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | *(from Firebase)* |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | *(from Firebase)* |

5. Click **Deploy** — done! 🎉

---

## 🤖 Machine Learning Details

**Input Features (13 total):**

| Type | Features |
|---|---|
| Numerical | Study Hours, Attendance, Sleep Hours, Previous Scores, Physical Activity, Screen Time, Tutoring Sessions |
| Categorical | Internet Access, Motivation Level, Family Support, Extracurriculars, Teacher Quality, Parental Education |

**Models Trained & Compared:**

| Model | Typical MAE | Typical R² |
|---|---|---|
| Linear Regression | ~3.5 | ~0.72 |
| Decision Tree | ~3.2 | ~0.76 |
| **Random Forest ✓** | **~2.8** | **~0.83** |

> The model with the highest R² is **automatically selected and saved**. The API auto-retrains if no saved model exists.

**Preprocessing:**
- Duplicate removal → Median/mode imputation → Range clipping
- `StandardScaler` on numerical features
- `OneHotEncoder` (drop=first) on categorical features
- All wrapped in a scikit-learn `Pipeline`

---

## 🛠 Tech Stack

**Frontend**
- Next.js 14 (App Router) + TypeScript
- TailwindCSS + Framer Motion
- Recharts (data visualization)
- Firebase Auth (email/password)
- localStorage (user data — no database needed)

**Backend**
- FastAPI + Uvicorn
- scikit-learn (Linear Regression, Decision Tree, Random Forest)
- Pandas + NumPy + joblib

**Deployment**
- Frontend → **Vercel**
- Backend API → **Render.com**

---

## 📝 License

MIT License — free to use, modify, and distribute.
