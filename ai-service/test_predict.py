from fastapi.testclient import TestClient
from main import app

def test_health_check():
    """Test health check endpoint"""
    with TestClient(app) as client:
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"


def test_metrics_endpoint():
    """Test metrics endpoint to ensure model info is loaded"""
    with TestClient(app) as client:
        response = client.get("/metrics")
        assert response.status_code == 200
        data = response.json()
        assert "selected_model" in data
        assert "feature_importance" in data
        assert "confusion_matrix" in data


def test_predict_endpoint_high_risk():
    """Test prediction endpoint with high-risk vitals"""
    with TestClient(app) as client:
        payload = {
        "temperature": 39.5,
        "heart_rate": 120,
        "systolic": 160,
        "diastolic": 100,
        "symptom": "Chest Pain",
        "lang": "en"
    }
def test_predict_endpoint_low_risk():
    """Test prediction endpoint with healthy vitals"""
    with TestClient(app) as client:
        payload = {
            "temperature": 37.0,
            "heart_rate": 75,
            "systolic": 115,
            "diastolic": 75,
            "symptom": "None",
            "lang": "th"
        }
        response = client.post("/predict", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        assert data["risk_level"] == "low"
        assert "shap_contributions" in data
        assert len(data["shap_contributions"]) == 5  # 5 features
        assert data["health_score"] >= 70  # Should be a high health score


def test_predict_validation_error():
    """Test validation error for missing fields"""
    with TestClient(app) as client:
        payload = {
            "temperature": 37.0,
            # missing heart_rate
            "systolic": 120,
            "diastolic": 80,
            "symptom": "None"
        }
        response = client.post("/predict", json=payload)
        assert response.status_code == 422  # Unprocessable Entity
