# SmartCare – Patient Health Monitoring & Risk Assessment

A web-based decision support system that helps patients record daily health data and caregivers monitor and prioritize patients using AI-based risk assessment.

> **Note**: This is a decision support system. It does **not** perform medical assessments or provide care recommendations.

---

## Problem Statement

Healthcare caregivers managing multiple patients need an efficient way to monitor health data and identify patients who may require closer attention. Patients need a simple way to record daily vitals and understand their health status.

## Solution Overview
SmartCare provides a complete ecosystem for remote patient monitoring, designed directly to solve real-world healthcare challenges and win the **Frostbyte Hackathon**:

- **For Patients**: Easy daily health data recording with immediate risk level feedback and **dynamic Explainable AI (XAI)** insights explaining exactly *why* they are at risk.
- **For Caregivers**: A centralized monitoring dashboard featuring a **Critical Alerts** system to instantly identify High-Risk patients, alongside tools to add new patients, edit patient info, and write observation notes.
- **Real-World Utility**: Caregivers can generate and download **PDF Medical Reports** to share with doctors.
- **Bilingual & Accessible**: Beautifully animated UI (Framer Motion) fully localized in English and Thai (🇹🇭/🇬🇧).

---

## System Architecture

```
┌─────────────────────────────────────────┐
│           Next.js Application           │
│  ┌──────────┐  ┌─────────────────────┐  │
│  │    UI     │  │  API Route Handlers │  │
│  │ (React)   │  │  /api/auth          │  │
│  │          │──▶│  /api/records        │  │
│  │          │  │  /api/patients        │  │
│  │          │  │  /api/predict ────────│──┼──▶  Python FastAPI
│  └──────────┘  └─────────┬───────────┘  │      AI Service
│                          │              │      POST /predict
│                          ▼              │
│                    PostgreSQL           │
│                    (Prisma ORM)         │
└─────────────────────────────────────────┘
```

---

## UI Design Concept

The interface is designed for **simplicity and clarity**:

- One screen = one main task
- One primary action button per screen
- Large, clear buttons with visual guidance
- Color-coded risk badges (🟢 Low, 🟡 Medium, 🔴 High)
- No complex menus or technical jargon
- Designed for non-technical users

---

## Tech Stack

| Layer      | Technology                        |
| ---------- | --------------------------------- |
| Frontend   | Next.js (App Router), React 19    |
| UI/UX      | Tailwind CSS, Framer Motion       |
| Backend    | Next.js Route Handlers            |
| Database   | PostgreSQL, Prisma ORM            |
| AI Service | Python, FastAPI, scikit-learn     |
| PDF Export | react-to-print                    |
| Auth       | JWT (jose), bcryptjs              |

---

## Database Design

```
User ──── Patient ──── HealthRecord ──── Prediction
             │
             └── Note (Caregiver observations)

   HealthRecord Fields:
   - temperature
   - heartRate
   - systolic
   - diastolic
   - symptom
```

**Models**: User, Patient, HealthRecord, Prediction, Note
**Roles**: PATIENT, CAREGIVER

---

## API Documentation

| Method | Endpoint            | Description                            | Auth     |
| ------ | ------------------- | -------------------------------------- | -------- |
| POST   | /api/auth/login     | Login with email/password              | Public   |
| POST   | /api/auth/logout    | Clear session                          | Public   |
| POST   | /api/records        | Create health record                   | Patient  |
| GET    | /api/patients       | List all patients with latest risk     | Caregiver|
| POST   | /api/patients       | Create new patient                     | Caregiver|
| GET    | /api/patients/[id]  | Patient detail with records and notes  | Both     |
| PATCH  | /api/patients/[id]  | Edit patient details                   | Caregiver|
| POST   | .../[id]/notes      | Add caregiver note to patient          | Caregiver|
| DELETE | .../[id]/notes      | Delete caregiver note                  | Caregiver|
| POST   | /api/predict        | Get AI risk assessment                 | Patient  |

**Python AI Service:**

| Method | Endpoint  | Description              |
| ------ | --------- | ------------------------ |
| POST   | /predict  | ML risk prediction & XAI |
| GET    | /health   | Service health check     |

---

## AI Model Description (Explainable AI)

- **Type**: Classification (3 classes: low, medium, high)
- **Algorithm**: Random Forest Classifier (100 estimators)
- **Features**: temperature, heart_rate, systolic, diastolic, symptom
- **Explainability (XAI)**: The Python service includes a dynamic rule-based engine that parses the vitals to generate human-readable, actionable medical insights (in EN and TH) explaining *why* a specific risk level was assigned.
- **Dataset**: Synthetically generated using domain-informed distributions for vital signs and symptom patterns. The `train_model.py` script generates 2,000 samples.

---

## How to Run

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

# Create database
createdb smartcare

# Run migration and seed
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
pip install -r requirements.txt

# Train the model
python train_model.py

# Start the service
uvicorn main:app --reload --port 8000
```

### Demo Accounts

| Role      | Email              | Password    |
| --------- | ------------------ | ----------- |
| Patient   | patient1@demo.com  | password123 |
| Patient   | patient2@demo.com  | password123 |
| Patient   | patient3@demo.com  | password123 |
| Caregiver | caregiver@demo.com | password123 |

---

## Demo Flow

1. **Login** → Sign in as `patient1@demo.com`
2. **Dashboard** → See current health status and risk level
3. **Record Health Data** → Click primary button, fill vitals, submit
4. **AI Assessment** → Instantly see risk level result
5. **Switch to Caregiver** → Login as `caregiver@demo.com`
6. **Patient Monitoring** → View all patients sorted by risk
7. **Patient Detail** → Click "View Detail" to see trends and history

---

## Project Structure

```
smartcare/
├── src/
│   ├── app/
│   │   ├── login/              # Login page
│   │   ├── patient/
│   │   │   ├── dashboard/      # Patient dashboard
│   │   │   └── new-record/     # Health data form
│   │   ├── caregiver/
│   │   │   ├── dashboard/      # Patient list
│   │   │   └── patients/[id]/  # Patient detail
│   │   └── api/
│   │       ├── auth/           # Login/logout
│   │       ├── records/        # Health records
│   │       ├── patients/       # Patient data
│   │       └── predict/        # AI prediction proxy
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── RiskBadge.tsx
│   │   ├── HealthForm.tsx
│   │   └── ChartPanel.tsx
│   ├── lib/
│   │   ├── auth.ts             # JWT utilities
│   │   └── db.ts               # Prisma client
│   └── middleware.ts           # Route protection
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── ai-service/
│   ├── main.py                 # FastAPI app
│   ├── train_model.py          # Model training
│   └── requirements.txt
└── README.md
```

---

## Frostbyte Hackathon Submission Details

- **Project Title:** SmartCare
- **Team Member:**
  1. Tanakorn Kaewmai - Solo Developer / Full Stack & AI
- **Originality Statement:** *All work in this repository is original and created specifically for the Frostbyte Hackathon.*
- **Datasets Used:** Synthetically generated clinical data using `train_model.py` based on domain-informed distributions for vital signs and symptom patterns.
- **External Libraries & Citations:**
  - **Frontend:** Next.js, React 19, Tailwind CSS, Framer Motion (for UI animations)
  - **Backend/Database:** Prisma ORM, PostgreSQL, JSON Web Tokens (`jose`)
  - **AI & Data Science:** Python, FastAPI, scikit-learn (Random Forest Classifier)
  - **PDF Export:** `react-to-print`
