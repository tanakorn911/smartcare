"""
SmartCare AI Model Training Script

Generates synthetic health data and trains a RandomForest classifier
to predict patient risk levels (low, medium, high).

This is a decision support tool - not for medical use.
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib
import os

np.random.seed(42)

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

def generate_synthetic_data(n_samples=2000):
    """Generate synthetic health records with risk labels."""
    data = []

    for _ in range(n_samples):
        risk = np.random.choice(["low", "medium", "high"], p=[0.5, 0.3, 0.2])

        if risk == "low":
            temp = np.random.normal(36.6, 0.3)
            hr = np.random.normal(72, 8)
            sys = np.random.normal(118, 8)
            dia = np.random.normal(76, 6)
            symptom = np.random.choice(
                ["None", "Headache", "Fatigue", "Cough", "Body Aches"],
                p=[0.5, 0.15, 0.15, 0.1, 0.1],
            )
        elif risk == "medium":
            temp = np.random.normal(37.5, 0.5)
            hr = np.random.normal(88, 10)
            sys = np.random.normal(135, 10)
            dia = np.random.normal(87, 7)
            symptom = np.random.choice(
                ["Headache", "Fatigue", "Dizziness", "Nausea", "Fever", "Cough"],
                p=[0.2, 0.2, 0.15, 0.15, 0.15, 0.15],
            )
        else:  # high
            temp = np.random.normal(38.8, 0.6)
            hr = np.random.normal(105, 12)
            sys = np.random.normal(155, 15)
            dia = np.random.normal(98, 8)
            symptom = np.random.choice(
                ["Chest Pain", "Shortness of Breath", "Dizziness", "Fever", "Nausea"],
                p=[0.3, 0.3, 0.15, 0.15, 0.1],
            )

        temp = np.clip(temp, 35.0, 42.0)
        hr = int(np.clip(hr, 40, 200))
        sys = int(np.clip(sys, 70, 250))
        dia = int(np.clip(dia, 40, 150))

        data.append({
            "temperature": round(temp, 1),
            "heart_rate": hr,
            "systolic": sys,
            "diastolic": dia,
            "symptom": SYMPTOM_MAP[symptom],
            "risk_level": risk,
        })

    return pd.DataFrame(data)


def train_model():
    """Train and save the risk assessment model."""
    print("Generating synthetic health data...")
    df = generate_synthetic_data(2000)

    print(f"Dataset shape: {df.shape}")
    print(f"\nRisk distribution:\n{df['risk_level'].value_counts()}\n")

    features = ["temperature", "heart_rate", "systolic", "diastolic", "symptom"]
    X = df[features]
    y = df["risk_level"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print("Training RandomForest classifier...")
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))

    # Feature importance
    importance = dict(zip(features, model.feature_importances_))
    print("Feature Importance:")
    for feat, imp in sorted(importance.items(), key=lambda x: -x[1]):
        print(f"  {feat}: {imp:.4f}")

    # Save model
    model_path = os.path.join(os.path.dirname(__file__), "model.pkl")
    joblib.dump(model, model_path)
    print(f"\nModel saved to {model_path}")

    # Save dataset for reference
    csv_path = os.path.join(os.path.dirname(__file__), "training_data.csv")
    df.to_csv(csv_path, index=False)
    print(f"Training data saved to {csv_path}")

    return model


if __name__ == "__main__":
    train_model()
