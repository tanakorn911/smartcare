# 🏥 SmartCare – AI-Powered Patient Health Monitoring & Risk Assessment

> **Frostbyte Hackathon 2026** · Healthcare & BioTech Theme · Explainable AI

A full-stack web application that helps patients record daily health data and caregivers monitor and prioritize patients using **SHAP-powered Explainable AI** risk assessment.

> **Note**: This is a decision support system. It does **not** perform medical assessments or provide care recommendations.

---

## 🎯 Problem Statement

Healthcare caregivers managing multiple patients need an efficient way to monitor health data and identify patients who may require closer attention. Patients need a simple way to record daily vitals and understand their health status.

## 💡 Solution Overview

SmartCare provides a complete ecosystem for remote patient monitoring:

- **For Patients**: Easy daily health data recording with immediate risk level feedback, **SHAP-based Explainable AI** insights explaining *why* they are at risk, and a **Health Score** (0-100).
- **For Caregivers**: A **Command Center** dashboard featuring analytics summary cards, risk distribution charts, critical alerts, and patient management tools.
- **Real-World Utility**: Caregivers can generate and download **PDF Medical Reports** to share with doctors.
- **Bilingual & Accessible**: Beautifully animated UI (Framer Motion) fully localized in **English and Thai** (��/��).
- **Real-time Monitoring**: Automatic polling with toast notifications when new health data arrives.

---

## 🏗️ System Architecture

<<<<<<< HEAD
```mermaid
graph TB
    subgraph "Next.js Application"
        UI["React UI<br/>(Framer Motion)"]
        API["API Routes<br/>/api/auth, /api/records<br/>/api/patients, /api/predict"]
        MW["Middleware<br/>(JWT Auth)"]
    end
    
    subgraph "Python AI Service"
        FA["FastAPI Server"]
        ML["Random Forest<br/>Classifier"]
        SH["SHAP<br/>TreeExplainer"]
    end
    
    DB[(PostgreSQL<br/>Prisma ORM)]
    
    UI --> API
    API --> MW
    API --> DB
    API -->|"POST /predict"| FA
    FA --> ML
    FA --> SH
=======
```
┌──────────────────────────────────────────┐
│           Next.js Application            │
│  ┌──────────┐   ┌─────────────────────┐  │
│  │    UI    │   │  API Route Handlers │  │
│  │ (React)  │   │  /api/auth          │  │
│  │          │──▶│  /api/records       │  │
│  │          │   │  /api/patients      │  │
│  │          │   │  /api/predict ──────│──┼──▶  Python FastAPI
│  └──────────┘   └─────────┬───────────┘  │      AI Service
│                           │              │      POST /predict
│                           ▼              │
│                      PostgreSQL          │
│                     (Prisma ORM)         │
└──────────────────────────────────────────┘
>>>>>>> 8a99134b4827efed6000099f1b45008b27f51373
```

---

## 🧠 AI Model (Explainable AI with SHAP)

| Property | Details |
|----------|---------|
| **Type** | Multi-class Classification (low, medium, high) |
| **Algorithm** | Random Forest Classifier (100 estimators) |
| **Explainability** | SHAP TreeExplainer (SHapley Additive exPlanations) |
| **Features** | temperature, heart_rate, systolic, diastolic, symptom |
| **Dataset** | 2,000 synthetically generated samples |

### Model Performance Comparison

We compared **3 algorithms** and selected Random Forest for its excellent balance of accuracy and SHAP explainability:

| Model | Accuracy | F1-Score | CV Mean (5-fold) |
|-------|----------|----------|-------------------|
| **Random Forest** ✅ | **97.75%** | **0.978** | 0.969 ± 0.009 |
| XGBoost | 97.25% | 0.973 | 0.972 ± 0.009 |
| Logistic Regression | 96.75% | 0.968 | 0.964 ± 0.018 |

### Feature Importance

```
  temperature: 0.3935 ███████████████████
     systolic: 0.2155 ██████████
   heart_rate: 0.1913 █████████
    diastolic: 0.1294 ██████
      symptom: 0.0704 ███
```

### Confusion Matrix

|  | Predicted Low | Predicted Medium | Predicted High |
|--|:---:|:---:|:---:|
| **Actual Low** | 205 | 3 | 0 |
| **Actual Medium** | 3 | 113 | 0 |
| **Actual High** | 0 | 3 | 73 |

### SHAP Explanation

Every prediction comes with:
- **SHAP contribution values** for each health feature
- **Visual bar chart** showing which factors increase or decrease risk
- **Human-readable explanation** in both English and Thai
- **Health Score** (0-100) based on risk level and model confidence

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), React 19 |
| UI/UX | Tailwind CSS, Framer Motion |
| Backend | Next.js Route Handlers |
| Database | PostgreSQL, Prisma ORM |
| AI Service | Python, FastAPI, scikit-learn |
| Explainability | SHAP (TreeExplainer) |
| Model Comparison | XGBoost, Logistic Regression |
| PDF Export | react-to-print |
| Auth | JWT (jose), bcryptjs |

---

## 📊 Key Features

### Patient Side
- ✅ Daily health data recording (temperature, heart rate, BP, symptoms)
- ✅ AI risk assessment with SHAP explanation bar chart
- ✅ Health Score gauge (0-100)
- ✅ Health trend charts (last 14 records)
- ✅ Paginated health record history

### Caregiver Side
- ✅ **Analytics Dashboard** with summary cards (Total / High / Medium / Low)
- ✅ **Risk Distribution** pie chart
- ✅ **Critical Alerts** section with pulsing indicators for high-risk patients
- ✅ Patient management (add, edit, delete)
- ✅ Caregiver observation notes
- ✅ **PDF Medical Report** export
- ✅ **Real-time polling** (30s) with toast notifications

### General
- ✅ Bilingual UI (English / Thai) with AI explanations in both languages
- ✅ JWT authentication with role-based access
- ✅ Responsive design (mobile & desktop)
- ✅ Framer Motion animations throughout

---

## 📁 Database Design

```
User ──── Patient ──── HealthRecord ──── Prediction
             │
             └── Note (Caregiver observations)

   HealthRecord Fields:
   - temperature, heartRate, systolic, diastolic, symptom
```

**Models**: User, Patient, HealthRecord, Prediction, Note
**Roles**: PATIENT, CAREGIVER

---

## 🔌 API Documentation

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/login | Login with email/password | Public |
| POST | /api/auth/logout | Clear session | Public |
| POST | /api/records | Create health record | Patient |
| GET | /api/patients | List all patients with latest risk | Caregiver |
| POST | /api/patients | Create new patient | Caregiver |
| GET | /api/patients/[id] | Patient detail with records and notes | Both |
| PATCH | /api/patients/[id] | Edit patient details | Caregiver |
| POST | .../[id]/notes | Add caregiver note | Caregiver |
| DELETE | .../[id]/notes | Delete caregiver note | Caregiver |
| POST | /api/predict | Get AI risk assessment + SHAP | Patient |

**Python AI Service:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /predict | ML risk prediction + SHAP contributions + health score |
| GET | /metrics | Model training metrics and comparison results |
| GET | /health | Service health check |

---

## 🚀 How to Run

### Prerequisites

- Node.js 18+
- PostgreSQL
- Python 3.9+

### 1. Clone and Install

```bash
cd smartcare
npm install
```

### 2. Database Setup

```bash
# Update DATABASE_URL in .env with your PostgreSQL credentials
# Example: postgresql://user:password@localhost:5432/smartcare

createdb smartcare
npx prisma migrate dev --name init
npm run seed
```

### 3. Start Next.js App

```bash
npm run dev
# Opens at http://localhost:3000
```

### 4. AI Service Setup

```bash

cd ai-service

# Create virtual environment
python3 -m venv venv

# Activate virtual environment  
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Train the model (generates SHAP explainer + metrics)
python train_model.py

# Start the service
uvicorn main:app --reload --port 8000
```

### Demo Accounts

| Role      | Email              | Password    |
|-----------|--------------------|-------------|
| Patient   | patient1@demo.com  | password123 |
| Patient   | patient2@demo.com  | password123 |
| Patient   | patient3@demo.com  | password123 |
| Caregiver | caregiver@demo.com | password123 |

---

## 🎬 Demo Flow

1. **Landing Page** → Modern landing with stats, how-it-works, and tech stack
2. **Login** → Sign in as `patient1@demo.com`
3. **Dashboard** → See current health status, health score, and risk level
4. **Record Health Data** → Fill vitals, submit, see AI assessment
5. **SHAP Analysis** → View contributing factors bar chart with explanations
6. **Switch to Caregiver** → Login as `caregiver@demo.com`
7. **Command Center** → Analytics cards, pie chart, critical alerts
8. **Patient Detail** → Full history, charts, notes, PDF export
9. **Switch Language** → Toggle EN/TH in navbar

---

## 📂 Project Structure

```
smartcare/
├── src/
│   ├── app/
│   │   ├── login/              # Login page
│   │   ├── patient/
│   │   │   ├── dashboard/      # Patient dashboard + health score
│   │   │   └── new-record/     # Health data form + SHAP chart
│   │   ├── caregiver/
│   │   │   ├── dashboard/      # Analytics command center
│   │   │   └── patients/[id]/  # Patient detail + PDF export
│   │   └── api/
│   │       ├── auth/           # Login/logout
│   │       ├── records/        # Health records
│   │       ├── patients/       # Patient data
│   │       └── predict/        # AI prediction proxy
│   ├── components/
│   │   ├── Navbar.tsx          # Navigation + language toggle
│   │   ├── RiskBadge.tsx       # Risk level indicator
│   │   ├── HealthForm.tsx      # Health data form + SHAP display
│   │   ├── ChartPanel.tsx      # Recharts health trends
│   │   ├── LandingClient.tsx   # Landing page
│   │   └── LanguageProvider.tsx # i18n context
│   ├── lib/
│   │   ├── auth.ts             # JWT utilities
│   │   ├── db.ts               # Prisma client
│   │   └── translations.ts     # EN/TH translations
│   └── middleware.ts           # Route protection
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── ai-service/
│   ├── main.py                 # FastAPI app + SHAP
│   ├── train_model.py          # Model training + comparison
│   ├── requirements.txt
│   ├── model.pkl               # Trained model
│   ├── shap_explainer.pkl      # SHAP TreeExplainer
│   └── model_metrics.json      # Training metrics
└── README.md
```

---

## 🏆 Frostbyte Hackathon Submission Details

- **Project Title:** SmartCare
- **Theme:** Healthcare & BioTech
- **Team Member:**
  1. Tanakorn Kaewmai - Solo Developer / Full Stack & AI
- **Originality Statement:** *All work in this repository is original and created specifically for the Frostbyte Hackathon.*
- **Datasets Used:** Synthetically generated clinical data using `train_model.py` based on domain-informed distributions for vital signs and symptom patterns.
- **External Libraries & Citations:**
  - **Frontend:** Next.js, React 19, Tailwind CSS, Framer Motion (UI animations)
  - **Backend/Database:** Prisma ORM, PostgreSQL, JSON Web Tokens (`jose`)
  - **AI & Data Science:** Python, FastAPI, scikit-learn (Random Forest), XGBoost, SHAP
  - **PDF Export:** `react-to-print`

---

## 🗺️ Future Roadmap

- [ ] Real-time WebSocket notifications (upgrade from polling)
- [ ] Wearable device integration (Apple Watch, Fitbit)
- [ ] Time-series forecasting for health trends
- [ ] Multi-hospital deployment with admin panel
- [ ] Doctor role with treatment recommendations
- [ ] HIPAA compliance features
