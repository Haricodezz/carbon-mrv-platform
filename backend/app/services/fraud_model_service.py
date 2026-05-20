import logging
from pathlib import Path
from typing import Dict, Any
import numpy as np

# Logging
logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parents[2]
MODEL_PATH = BASE_DIR / "ml" / "models" / "fraud_model.pkl"

_model = None
_model_loaded = False

def _get_model():
    """Lazily load the Fraud classification model on first use."""
    global _model, _model_loaded
    if _model_loaded:
        return _model

    _model_loaded = True
    if MODEL_PATH.exists():
        try:
            import joblib
            _model = joblib.load(MODEL_PATH)
            logger.info(f"Fraud classification model loaded successfully from {MODEL_PATH}")
        except Exception as e:
            logger.error(f"Failed to load fraud model: {e}")
    else:
        logger.warning(f"Fraud model file not found at {MODEL_PATH}. Predictions disabled.")
    return _model

def predict_fraud_risk(
    ndvi: float,
    evi: float,
    ndmi: float,
    land_area_acres: float,
    latitude: float,
    longitude: float,
    duplicate_polygon: int = 0,
    water_fraction: float = 0.0,
    urban_fraction: float = 0.0,
    historical_loss_rate: float = 0.0,
    impossible_growth: int = 0
) -> Dict[str, Any]:
    """
    Predict project fraud risk score using the trained XGBoost model.
    """
    model = _get_model()
    if model is None:
        # Graceful fallback if model is not loaded: calculate rule-based risk
        score = 0.0
        explanations = []
        if duplicate_polygon:
            score += 40.0
            explanations.append("Duplicate polygon boundaries detected in database.")
        if water_fraction > 0.2:
            score += 25.0
            explanations.append(f"High water body concentration ({water_fraction * 100:.1f}%).")
        if urban_fraction > 0.2:
            score += 25.0
            explanations.append(f"Urban development/built-up land cover detected ({urban_fraction * 100:.1f}%).")
        if historical_loss_rate > 0.3:
            score += 30.0
            explanations.append(f"Recent rapid deforestation trend of {historical_loss_rate * 100:.1f}%.")
        if impossible_growth:
            score += 35.0
            explanations.append("Physiologically impossible vegetation growth rate.")
        if ndvi < 0.25:
            score += 20.0
            explanations.append("Low vegetation density/desertification.")
            
        final_score = min(100.0, score)
        return {
            "fraud_probability": final_score,
            "is_fraud": 1 if final_score > 50 else 0,
            "explanation": "; ".join(explanations) if explanations else "No anomalies detected."
        }

    # Features must match the training order:
    # ["NDVI", "EVI", "NDMI", "land_area_acres", "latitude", "longitude",
    #  "duplicate_polygon", "water_fraction", "urban_fraction", "historical_loss_rate", "impossible_growth"]
    features = [
        ndvi, evi, ndmi, land_area_acres, latitude, longitude,
        duplicate_polygon, water_fraction, urban_fraction, historical_loss_rate, impossible_growth
    ]

    try:
        # Predict probability of class 1 (fraud)
        probs = model.predict_proba([features])[0]
        fraud_prob = float(probs[1]) * 100.0  # Convert to percentage
        is_fraud = int(model.predict([features])[0])
        
        # Build explanation
        explanations = []
        if duplicate_polygon:
            explanations.append("Duplicate polygon boundaries detected.")
        if water_fraction > 0.25:
            explanations.append(f"High water body fraction: {water_fraction * 100:.1f}%.")
        if urban_fraction > 0.25:
            explanations.append(f"High urban land cover: {urban_fraction * 100:.1f}%.")
        if historical_loss_rate > 0.35:
            explanations.append(f"Devegetation rate: {historical_loss_rate * 100:.1f}%.")
        if impossible_growth:
            explanations.append("Vegetation growth velocity exceeds biophysical limits.")
        if ndvi < 0.3:
            explanations.append("Insufficient vegetative cover for carbon sequestration.")

        explanation_str = "; ".join(explanations) if explanations else "Normal vegetation patterns and indices verified."
        
        return {
            "fraud_probability": round(fraud_prob, 2),
            "is_fraud": is_fraud,
            "explanation": explanation_str
        }
    except Exception as e:
        logger.error(f"Error during fraud model inference: {e}")
        return {
            "fraud_probability": 0.0,
            "is_fraud": 0,
            "explanation": f"Fraud inference failed ({e})."
        }
