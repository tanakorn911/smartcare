"""
SmartCare AI Service - FastAPI

Serves risk assessment predictions for patient health data.
This is a decision support system - not for medical use.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
import pandas as pd
import os

app = FastAPI(
    title="SmartCare AI Service",
    description="Health risk assessment decision support API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pkl")
model = None

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

def generate_explanation(input_data: "HealthInput", risk_level: str, lang: str) -> str:
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
            # Just translating the symptom literally in Thai output usually needs a mapping, but we leave symptom english if mapping is complex, or we can use generic:
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


class HealthInput(BaseModel):
    temperature: float
    heart_rate: int
    systolic: int
    diastolic: int
    symptom: str
    lang: str = "en"


class PredictionOutput(BaseModel):
    risk_level: str
    probability: float
    explanation: str


@app.on_event("startup")
def load_model():
    global model
    if os.path.exists(MODEL_PATH):
        model = joblib.load(MODEL_PATH)
        print(f"Model loaded from {MODEL_PATH}")
    else:
        print(f"WARNING: Model file not found at {MODEL_PATH}")
        print("Run 'python train_model.py' to train the model first.")


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "model_loaded": model is not None,
    }


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
    ]], columns=["temperature", "heart_rate", "systolic", "diastolic", "symptom"])

    prediction = model.predict(features)[0]
    probabilities = model.predict_proba(features)[0]

    class_index = list(model.classes_).index(prediction)
    probability = round(float(probabilities[class_index]), 4)

    lang = input_data.lang if input_data.lang in ["en", "th"] else "en"
    explanation = generate_explanation(input_data, prediction, lang)

    return PredictionOutput(
        risk_level=prediction,
        probability=probability,
        explanation=explanation,
    )
