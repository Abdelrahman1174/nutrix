import joblib
import pandas as pd
from pathlib import Path

_BASE = Path(__file__).resolve().parent.parent / "data" / "models"

_model = None
_scaler = None
_encoder = None


def _load_artifacts():
    global _model, _scaler, _encoder
    if _model is None:
        _model = joblib.load(_BASE / "model.pkl")
        _scaler = joblib.load(_BASE / "scaler.pkl")
        _encoder = joblib.load(_BASE / "encoder.pkl")


def predict_condition(input_data: dict) -> str:
    if not input_data:
        raise ValueError("input_data must not be empty.")

    _load_artifacts()

    try:
        df = pd.DataFrame([input_data])
    except Exception:
        raise ValueError("Invalid input format. Could not convert to DataFrame.")

    # Ensure correct feature order and presence
    expected_features = getattr(_scaler, "feature_names_in_", None)

    if expected_features is not None:
        missing = set(expected_features) - set(df.columns)
        if missing:
            raise ValueError(f"Missing required fields: {list(missing)}")

        df = df[expected_features]

    # Ensure numeric values
    try:
        df = df.astype(float)
    except Exception:
        raise ValueError("All input values must be numeric.")

    try:
        scaled = _scaler.transform(df)
        prediction = _model.predict(scaled)
        label = _encoder.inverse_transform(prediction)[0]
    except Exception as e:
        raise ValueError(f"Prediction failed: {str(e)}")

    return str(label)