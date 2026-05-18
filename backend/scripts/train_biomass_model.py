import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import (
    mean_absolute_error,
    r2_score,
)


# =========================
# LOAD DATASET
# =========================

DATASET_FILE =
    "training_dataset.csv"

MODEL_OUTPUT =
    "carbon_model.pkl"


df = pd.read_csv(
    DATASET_FILE
)

# Drop invalid rows
df = df.dropna()


# =========================
# FEATURES / LABEL
# =========================

FEATURE_COLUMNS = [
    "red",
    "nir",
    "swir",
    "ndvi",
    "evi",
    "ndmi",
]

TARGET_COLUMN = "agb"


X = df[
    FEATURE_COLUMNS
]

y = df[
    TARGET_COLUMN
]


# =========================
# SPLIT
# =========================

X_train, X_test, y_train, y_test = (
    train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
    )
)


# =========================
# MODEL
# =========================

model = RandomForestRegressor(
    n_estimators=300,
    max_depth=20,
    random_state=42,
    n_jobs=-1,
)

model.fit(
    X_train,
    y_train,
)


# =========================
# EVALUATION
# =========================

predictions = model.predict(
    X_test
)

mae = mean_absolute_error(
    y_test,
    predictions,
)

r2 = r2_score(
    y_test,
    predictions,
)

print(
    f"MAE: {mae:.2f}"
)

print(
    f"R² Score: {r2:.4f}"
)


# =========================
# SAVE MODEL
# =========================

joblib.dump(
    model,
    MODEL_OUTPUT,
)

print(
    f"Model saved as {MODEL_OUTPUT}"
)