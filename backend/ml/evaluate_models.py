import os
from pathlib import Path
import pandas as pd
import joblib
import numpy as np

from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

# Paths
BASE_DIR = Path(__file__).resolve().parent
BIOMASS_DATA = BASE_DIR / "datasets" / "biomass_dataset.csv"
FRAUD_DATA = BASE_DIR / "datasets" / "fraud_dataset.csv"

BIOMASS_MODEL_PATH = BASE_DIR / "models" / "carbon_model.pkl"
FRAUD_MODEL_PATH = BASE_DIR / "models" / "fraud_model.pkl"

def evaluate_biomass():
    print("\n" + "="*40)
    print("EVALUATING BIOMASS PREDICTION MODEL")
    print("="*40)
    
    if not BIOMASS_MODEL_PATH.exists() or not BIOMASS_DATA.exists():
        print("Biomass model or dataset not found. Skipping.")
        return
        
    df = pd.read_csv(BIOMASS_DATA).dropna()
    features = ["B04", "B08", "B11", "NDVI", "EVI", "NDMI"]
    
    X = df[features]
    y = df["AGB"]
    
    model = joblib.load(BIOMASS_MODEL_PATH)
    preds = model.predict(X)
    
    mae = mean_absolute_error(y, preds)
    rmse = mean_squared_error(y, preds) ** 0.5
    r2 = r2_score(y, preds)
    
    print(f"Total Evaluated Samples: {len(df)}")
    print(f"Mean Absolute Error (MAE): {mae:.4f} tons/ha")
    print(f"Root Mean Squared Error (RMSE): {rmse:.4f} tons/ha")
    print(f"R² (Coefficient of Determination): {r2:.4f}")
    
    # Feature importances
    if hasattr(model, 'feature_importances_'):
        importances = model.feature_importances_
        indices = np.argsort(importances)[::-1]
        print("\nFeature Importances:")
        for idx in indices:
            print(f" - {features[idx]}: {importances[idx]:.4f}")

def evaluate_fraud():
    print("\n" + "="*40)
    print("EVALUATING FRAUD DETECTION MODEL")
    print("="*40)
    
    if not FRAUD_MODEL_PATH.exists() or not FRAUD_DATA.exists():
        print("Fraud model or dataset not found. Skipping.")
        return
        
    df = pd.read_csv(FRAUD_DATA).dropna()
    features = [
        "NDVI", "EVI", "NDMI", "land_area_acres", "latitude", "longitude",
        "duplicate_polygon", "water_fraction", "urban_fraction", "historical_loss_rate", "impossible_growth"
    ]
    
    X = df[features]
    y = df["is_fraud"]
    
    model = joblib.load(FRAUD_MODEL_PATH)
    preds = model.predict(X)
    
    acc = accuracy_score(y, preds)
    prec = precision_score(y, preds)
    rec = recall_score(y, preds)
    f1 = f1_score(y, preds)
    
    print(f"Total Evaluated Samples: {len(df)}")
    print(f"Accuracy  : {acc:.4f}")
    print(f"Precision : {prec:.4f}")
    print(f"Recall    : {rec:.4f}")
    print(f"F1-Score  : {f1:.4f}")
    
    if hasattr(model, 'feature_importances_'):
        importances = model.feature_importances_
        indices = np.argsort(importances)[::-1]
        print("\nFeature Importances:")
        for idx in indices:
            print(f" - {features[idx]}: {importances[idx]:.4f}")

if __name__ == "__main__":
    evaluate_biomass()
    evaluate_fraud()
