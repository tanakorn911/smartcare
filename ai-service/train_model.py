"""
SmartCare AI Model Training Script

Generates synthetic health data, compares multiple classifiers
(Random Forest, XGBoost, Logistic Regression),
and trains a RandomForest model with SHAP explainability.

This is a decision support tool - not for medical use.
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, f1_score
from sklearn.preprocessing import LabelEncoder
import shap
import joblib
import os
import json

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

FEATURE_NAMES = ["temperature", "heart_rate", "systolic", "diastolic", "symptom"]


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


def compare_models(X_train, X_test, y_train, y_test):
    """Compare multiple classifiers and return results."""
    # XGBoost requires integer labels
    le = LabelEncoder()
    le.fit(y_train)
    y_train_encoded = le.transform(y_train)
    y_test_encoded = le.transform(y_test)

    models = {
        "Random Forest": {
            "model": RandomForestClassifier(
                n_estimators=100, max_depth=10, random_state=42, n_jobs=-1
            ),
            "needs_encoding": False,
        },
        "XGBoost": {
            "model": XGBClassifier(
                n_estimators=100, max_depth=6, random_state=42,
                eval_metric="mlogloss"
            ),
            "needs_encoding": True,
        },
        "Logistic Regression": {
            "model": LogisticRegression(
                max_iter=5000, random_state=42
            ),
            "needs_encoding": False,
        },
    }

    results = {}
    for name, config in models.items():
        model = config["model"]
        if config["needs_encoding"]:
            model.fit(X_train, y_train_encoded)
            y_pred_raw = model.predict(X_test)
            y_pred = le.inverse_transform(y_pred_raw)
            cv_scores = cross_val_score(model, X_train, y_train_encoded, cv=5, scoring="accuracy")
        else:
            model.fit(X_train, y_train)
            y_pred = model.predict(X_test)
            cv_scores = cross_val_score(model, X_train, y_train, cv=5, scoring="accuracy")

        accuracy = accuracy_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred, average="weighted")

        results[name] = {
            "model": model,
            "accuracy": round(accuracy, 4),
            "f1_score": round(f1, 4),
            "cv_mean": round(cv_scores.mean(), 4),
            "cv_std": round(cv_scores.std(), 4),
            "y_pred": y_pred,
        }

        print(f"\n{'='*50}")
        print(f"Model: {name}")
        print(f"{'='*50}")
        print(f"Accuracy: {accuracy:.4f}")
        print(f"F1-Score (weighted): {f1:.4f}")
        print(f"Cross-Validation: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")
        print(f"\nClassification Report:\n{classification_report(y_test, y_pred)}")

    return results


def train_model():
    """Train, compare models, and save the best with SHAP explainer."""
    print("=" * 60)
    print("  SmartCare AI Model Training Pipeline")
    print("=" * 60)

    print("\n📊 Generating synthetic health data...")
    df = generate_synthetic_data(2000)

    print(f"Dataset shape: {df.shape}")
    print(f"\nRisk distribution:\n{df['risk_level'].value_counts()}\n")

    X = df[FEATURE_NAMES]
    y = df["risk_level"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # ── Compare multiple models ──
    print("\n🔬 Comparing multiple classifiers...")
    results = compare_models(X_train, X_test, y_train, y_test)

    # ── Select best model (Random Forest for interpretability + SHAP) ──
    best_name = "Random Forest"
    best_model = results[best_name]["model"]
    best_y_pred = results[best_name]["y_pred"]

    print(f"\n✅ Selected model: {best_name}")
    print(f"   Reason: Best balance of accuracy and SHAP explainability")

    # ── Feature importance ──
    importance = dict(zip(FEATURE_NAMES, best_model.feature_importances_))
    print("\n📈 Feature Importance:")
    for feat, imp in sorted(importance.items(), key=lambda x: -x[1]):
        bar = "█" * int(imp * 50)
        print(f"  {feat:>15}: {imp:.4f} {bar}")

    # ── SHAP Explainer ──
    print("\n🧠 Computing SHAP explainer (TreeExplainer)...")
    explainer = shap.TreeExplainer(best_model)

    # Test SHAP on a sample to validate
    sample = X_test.iloc[:5]
    shap_values = explainer.shap_values(sample)
    print(f"   SHAP values computed successfully for {len(sample)} test samples")

    # ── Confusion Matrix ──
    cm = confusion_matrix(y_test, best_y_pred, labels=["low", "medium", "high"])
    print(f"\n📋 Confusion Matrix (low/medium/high):\n{cm}")

    # ── Save model & explainer ──
    base_dir = os.path.dirname(__file__)

    model_path = os.path.join(base_dir, "model.pkl")
    joblib.dump(best_model, model_path)
    print(f"\n💾 Model saved to {model_path}")

    explainer_path = os.path.join(base_dir, "shap_explainer.pkl")
    joblib.dump(explainer, explainer_path)
    print(f"💾 SHAP explainer saved to {explainer_path}")

    # ── Save metrics summary ──
    metrics = {
        "selected_model": best_name,
        "dataset_size": len(df),
        "test_size": len(y_test),
        "feature_names": FEATURE_NAMES,
        "feature_importance": importance,
        "model_comparison": {
            name: {
                "accuracy": r["accuracy"],
                "f1_score": r["f1_score"],
                "cv_mean": r["cv_mean"],
                "cv_std": r["cv_std"],
            }
            for name, r in results.items()
        },
        "confusion_matrix": cm.tolist(),
        "classes": ["low", "medium", "high"],
    }
    metrics_path = os.path.join(base_dir, "model_metrics.json")
    with open(metrics_path, "w") as f:
        json.dump(metrics, f, indent=2)
    print(f"💾 Metrics saved to {metrics_path}")

    # ── Save dataset for reference ──
    csv_path = os.path.join(base_dir, "training_data.csv")
    df.to_csv(csv_path, index=False)
    print(f"💾 Training data saved to {csv_path}")

    print(f"\n{'='*60}")
    print("  Training complete! ✅")
    print(f"{'='*60}")

    return best_model


if __name__ == "__main__":
    train_model()
