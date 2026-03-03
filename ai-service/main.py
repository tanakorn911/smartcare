"""
SmartCare AI Service - FastAPI

Serves risk assessment predictions with SHAP-based
Explainable AI for patient health data.
This is a decision support system - not for medical use.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
import pandas as pd
import shap
import os
import json
from typing import Optional

app = FastAPI(
    title="SmartCare AI Service",
    description="Health risk assessment with SHAP Explainable AI",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Globals ──
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pkl")
EXPLAINER_PATH = os.path.join(os.path.dirname(__file__), "shap_explainer.pkl")
METRICS_PATH = os.path.join(os.path.dirname(__file__), "model_metrics.json")

model = None
explainer = None
model_metrics = None

FEATURE_NAMES = ["temperature", "heart_rate", "systolic", "diastolic", "symptom"]

SYMPTOM_MAP = {
    "None": 0,
    "Headache": 1,
    "Fatigue": 2,
    "Dizziness": 3,
    "Chest Pain": 4,
    "Shortness of Breath": 5,
    "Nausea": 6,
    "Fever": 7,
    "Cough": 8,
    "Body Aches": 9,
}

# ── Human-readable feature names for SHAP display ──
FEATURE_DISPLAY = {
    "en": {
        "temperature": "Temperature",
        "heart_rate": "Heart Rate",
        "systolic": "Systolic BP",
        "diastolic": "Diastolic BP",
        "symptom": "Symptom",
    },
    "th": {
        "temperature": "อุณหภูมิ",
        "heart_rate": "อัตราการเต้นหัวใจ",
        "systolic": "ความดันตัวบน",
        "diastolic": "ความดันตัวล่าง",
        "symptom": "อาการ",
    },
}


def generate_shap_explanation(shap_values_for_class, feature_values, lang: str) -> str:
    """Generate a human-readable explanation from SHAP values."""
    display = FEATURE_DISPLAY.get(lang, FEATURE_DISPLAY["en"])

    # Pair each feature with its SHAP contribution
    contributions = []
    for i, fname in enumerate(FEATURE_NAMES):
        contributions.append({
            "feature": display[fname],
            "value": float(feature_values[i]),
            "shap": float(shap_values_for_class[i]),
        })

    # Sort by absolute SHAP contribution (most impactful first)
    contributions.sort(key=lambda x: abs(x["shap"]), reverse=True)

    # Get top contributing factors
    top = contributions[:3]  # Top 3 factors

    if lang == "th":
        parts = []
        for c in top:
            direction = "เพิ่มความเสี่ยง" if c["shap"] > 0 else "ลดความเสี่ยง"
            parts.append(f"{c['feature']} ({c['value']}) {direction}")
        return "ปัจจัยที่ส่งผลมากที่สุด: " + ", ".join(parts)
    else:
        parts = []
        for c in top:
            direction = "increases risk" if c["shap"] > 0 else "decreases risk"
            parts.append(f"{c['feature']} ({c['value']}) {direction}")
        return "Top contributing factors: " + ", ".join(parts)


def generate_explanation(input_data, risk_level: str, lang: str) -> str:
    """Fallback rule-based explanation when SHAP is unavailable."""
    issues = []

    if lang == "th":
        if input_data.systolic >= 140 or input_data.diastolic >= 90:
            issues.append(f"ความดันโลหิตสูง ({input_data.systolic}/{input_data.diastolic})")
        elif input_data.systolic <= 90 or input_data.diastolic <= 60:
            issues.append(f"ความดันโลหิตต่ำ ({input_data.systolic}/{input_data.diastolic})")
        if input_data.temperature >= 38.0:
            issues.append(f"มีไข้สูง ({input_data.temperature}°C)")
        if input_data.heart_rate >= 100:
            issues.append(f"หัวใจเต้นเร็วผิดปกติ ({input_data.heart_rate} bpm)")
        elif input_data.heart_rate <= 50:
            issues.append(f"หัวใจเต้นช้า ({input_data.heart_rate} bpm)")
        if input_data.symptom != "None":
            issues.append(f"มีอาการแทรกซ้อน: {input_data.symptom}")

        if risk_level == "low":
            if issues:
                return "ความเสี่ยงต่ำ แต่พบค่าบางส่วนผิดปกติ: " + " ".join(issues) + " แนะนำให้คอยสังเกตอาการ"
            return "สัญญาณชีพทั้งหมดอยู่ในเกณฑ์ปกติ สมบูรณ์ดี แนะนำให้ดูแลสุขภาพต่อไป"
        elif risk_level == "medium":
            base = "ความเสี่ยงระดับปานกลาง ปัจจัยหลักเกิดจาก: " + ", ".join(issues)
            return base + " แนะนำให้ดื่มน้ำ พักผ่อนให้เพียงพอ และวัดค่าซ้ำอีกครั้งในภายหลัง"
        else:
            base = "ความเสี่ยงระดับสูง! ปัจจัยวิกฤต: " + ", ".join(issues)
            return base + " โปรดพบแพทย์หรือติดต่อผู้ดูแลระบบทันที!"
    else:
        if input_data.systolic >= 140 or input_data.diastolic >= 90:
            issues.append(f"high blood pressure ({input_data.systolic}/{input_data.diastolic})")
        elif input_data.systolic <= 90 or input_data.diastolic <= 60:
            issues.append(f"low blood pressure ({input_data.systolic}/{input_data.diastolic})")
        if input_data.temperature >= 38.0:
            issues.append(f"high temperature ({input_data.temperature}°C)")
        if input_data.heart_rate >= 100:
            issues.append(f"rapid heart rate ({input_data.heart_rate} bpm)")
        elif input_data.heart_rate <= 50:
            issues.append(f"slow heart rate ({input_data.heart_rate} bpm)")
        if input_data.symptom != "None":
            issues.append(f"symptom: {input_data.symptom}")

        if risk_level == "low":
            if issues:
                return "Low risk, but minor variations detected: " + ", ".join(issues) + ". Keep monitoring."
            return "All vital signs are within healthy normal ranges. Keep up the good work!"
        elif risk_level == "medium":
            base = "Medium risk primarily driven by: " + ", ".join(issues) + "."
            return base + " Recommended: Rest, hydrate, and re-assess later."
        else:
            base = "HIGH RISK detected due to: " + ", ".join(issues) + "."
            return base + " Immediate medical consultation or caregiver attention is strongly advised."


# ── Pydantic Models ──

class HealthInput(BaseModel):
    temperature: float
    heart_rate: int
    systolic: int
    diastolic: int
    symptom: str
    lang: str = "en"


class ShapContribution(BaseModel):
    feature: str
    feature_display: str
    value: float
    shap_value: float


class PredictionOutput(BaseModel):
    risk_level: str
    probability: float
    explanation: str
    shap_contributions: Optional[list[ShapContribution]] = None
    health_score: Optional[int] = None


# ── Startup ──

@app.on_event("startup")
def load_model():
    global model, explainer, model_metrics
    if os.path.exists(MODEL_PATH):
        model = joblib.load(MODEL_PATH)
        print(f"✅ Model loaded from {MODEL_PATH}")
    else:
        print(f"⚠️ Model file not found at {MODEL_PATH}")
        print("Run 'python train_model.py' to train the model first.")

    if os.path.exists(EXPLAINER_PATH):
        explainer = joblib.load(EXPLAINER_PATH)
        print(f"✅ SHAP explainer loaded from {EXPLAINER_PATH}")
    else:
        print(f"⚠️ SHAP explainer not found. SHAP explanations will be unavailable.")

    if os.path.exists(METRICS_PATH):
        with open(METRICS_PATH) as f:
            model_metrics = json.load(f)
        print(f"✅ Model metrics loaded from {METRICS_PATH}")


def compute_health_score(risk_level: str, probability: float) -> int:
    """Compute a 0-100 health score based on risk and probability."""
    if risk_level == "low":
        return min(100, int(70 + probability * 30))
    elif risk_level == "medium":
        return max(30, int(60 - probability * 20))
    else:
        return max(5, int(30 - probability * 25))


# ── Endpoints ──

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "shap_available": explainer is not None,
        "version": "2.0.0",
    }


@app.get("/metrics")
def get_metrics():
    """Return model training metrics for display."""
    if model_metrics is None:
        raise HTTPException(status_code=404, detail="Model metrics not available")
    return model_metrics


@app.post("/predict", response_model=PredictionOutput)
def predict(input_data: HealthInput):
    if model is None:
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Run train_model.py first.",
        )

    symptom_encoded = SYMPTOM_MAP.get(input_data.symptom, 0)

    features = pd.DataFrame([[
        input_data.temperature,
        input_data.heart_rate,
        input_data.systolic,
        input_data.diastolic,
        symptom_encoded,
    ]], columns=FEATURE_NAMES)

    prediction = model.predict(features)[0]
    probabilities = model.predict_proba(features)[0]

    class_index = list(model.classes_).index(prediction)
    probability = round(float(probabilities[class_index]), 4)

    lang = input_data.lang if input_data.lang in ["en", "th"] else "en"
    display = FEATURE_DISPLAY.get(lang, FEATURE_DISPLAY["en"])

    # ── SHAP Explanation ──
    shap_contributions = None
    explanation = ""

    if explainer is not None:
        try:
            shap_values = explainer.shap_values(features)

            # Handle different SHAP output formats:
            # Format 1 (older): list of arrays [class0_array, class1_array, ...]
            #   each array shape: (n_samples, n_features)
            # Format 2 (newer): single 3D ndarray (n_samples, n_features, n_classes)
            import numpy as np
            if isinstance(shap_values, list):
                # List of arrays — index by class first, then sample
                shap_for_class = shap_values[class_index][0]
            elif isinstance(shap_values, np.ndarray) and shap_values.ndim == 3:
                # 3D array — index by sample first, then class
                shap_for_class = shap_values[0, :, class_index]
            else:
                # 2D array (binary or single output) — just take first sample
                shap_for_class = shap_values[0]

            shap_contributions = []
            for i, fname in enumerate(FEATURE_NAMES):
                shap_contributions.append(ShapContribution(
                    feature=fname,
                    feature_display=display[fname],
                    value=float(features.iloc[0, i]),
                    shap_value=round(float(shap_for_class[i]), 4),
                ))

            # Sort by absolute contribution
            shap_contributions.sort(key=lambda x: abs(x.shap_value), reverse=True)

            # Generate SHAP-based explanation
            explanation = generate_shap_explanation(
                shap_for_class,
                features.iloc[0].values,
                lang,
            )
        except Exception as e:
            print(f"⚠️ SHAP explanation failed: {e}")
            import traceback
            traceback.print_exc()
            explanation = generate_explanation(input_data, prediction, lang)
    else:
        explanation = generate_explanation(input_data, prediction, lang)

    health_score = compute_health_score(prediction, probability)

    return PredictionOutput(
        risk_level=prediction,
        probability=probability,
        explanation=explanation,
        shap_contributions=shap_contributions,
        health_score=health_score,
    )
