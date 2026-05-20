import os
from pathlib import Path
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from xgboost import XGBRegressor

# Paths
BASE_DIR = Path(__file__).resolve().parent
DATASET_PATH = BASE_DIR / "datasets" / "biomass_dataset.csv"
MODEL_DIR = BASE_DIR / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)
MODEL_PATH = MODEL_DIR / "carbon_model.pkl"

if not DATASET_PATH.exists():
    raise FileNotFoundError(f"Dataset not found at {DATASET_PATH}")

# Load
df = pd.read_csv(DATASET_PATH).dropna()

features = ["B04", "B08", "B11", "NDVI", "EVI", "NDMI"]
target = "AGB"

X = df[features]
y = df[target]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Initialize and train model
print("Training biomass XGBoost model...")
model = XGBRegressor(
    n_estimators=300,
    learning_rate=0.05,
    max_depth=6,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42
)
model.fit(X_train, y_train)

# Evaluate
preds = model.predict(X_test)
mae = mean_absolute_error(y_test, preds)
rmse = mean_squared_error(y_test, preds) ** 0.5
r2 = r2_score(y_test, preds)

print("\n===== BIOMASS MODEL METRICS =====")
print(f"MAE  : {mae:.4f} tons/ha")
print(f"RMSE : {rmse:.4f} tons/ha")
print(f"R2   : {r2:.4f}")

# Save
joblib.dump(model, MODEL_PATH)
print(f"\nSaved trained biomass model to: {MODEL_PATH}")
