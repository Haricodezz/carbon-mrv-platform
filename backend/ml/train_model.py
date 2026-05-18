from pathlib import Path
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score,
)

from xgboost import XGBRegressor


# =========================
# PATHS
# =========================

BASE_DIR = Path(__file__).resolve().parent
DATASET_PATH = BASE_DIR / "dataset.csv"
MODEL_DIR = BASE_DIR / "models"
MODEL_DIR.mkdir(
    parents=True,
    exist_ok=True,
)

MODEL_PATH = MODEL_DIR / "carbon_model.pkl"


# =========================
# LOAD DATASET
# =========================

if not DATASET_PATH.exists():
    raise FileNotFoundError(
        f"Dataset not found at {DATASET_PATH}"
    )

df = pd.read_csv(DATASET_PATH)

required_columns = [
    "B04",
    "B08",
    "B11",
    "NDVI",
    "EVI",
    "NDMI",
    "AGB",
]

for col in required_columns:
    if col not in df.columns:
        raise Exception(
            f"Missing required column: {col}"
        )

# Drop missing values
df = df.dropna()


# =========================
# FEATURES / LABELS
# =========================

X = df[
    [
        "B04",
        "B08",
        "B11",
        "NDVI",
        "EVI",
        "NDMI",
    ]
]

y = df["AGB"]


# =========================
# TRAIN / TEST SPLIT
# =========================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
)


# =========================
# MODEL
# =========================

model = XGBRegressor(
    n_estimators=500,
    learning_rate=0.05,
    max_depth=8,
    subsample=0.8,
    colsample_bytree=0.8,
    objective="reg:squarederror",
    random_state=42,
)


# =========================
# TRAIN
# =========================

print("Training model...")

model.fit(
    X_train,
    y_train,
)

print("Training complete.")


# =========================
# EVALUATE
# =========================

predictions = model.predict(
    X_test
)

mae = mean_absolute_error(
    y_test,
    predictions,
)

rmse = mean_squared_error(
    y_test,
    predictions,
) ** 0.5

r2 = r2_score(
    y_test,
    predictions,
)

print("\n===== MODEL PERFORMANCE =====")
print(f"MAE  : {mae:.4f}")
print(f"RMSE : {rmse:.4f}")
print(f"R²   : {r2:.4f}")


# =========================
# SAVE MODEL
# =========================

joblib.dump(
    model,
    MODEL_PATH,
)

print(
    f"\nModel saved successfully at: {MODEL_PATH}"
)