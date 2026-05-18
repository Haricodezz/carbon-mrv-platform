from pathlib import Path
import random
import pandas as pd


# =========================
# CONFIG
# =========================

BASE_DIR = Path(__file__).resolve().parent
OUTPUT_PATH = BASE_DIR / "dataset.csv"

NUM_SAMPLES = 5000


# =========================
# DATASET GENERATION
# =========================

dataset = []

print("Generating synthetic carbon dataset...")

for i in range(NUM_SAMPLES):
    # Simulated spectral bands
    B04 = random.uniform(500, 3000)   # Red
    B08 = random.uniform(1000, 8000)  # NIR
    B11 = random.uniform(500, 5000)   # SWIR

    # Vegetation indices
    NDVI = (B08 - B04) / (B08 + B04 + 1e-6)
    EVI = 2.5 * ((B08 - B04) / (B08 + 6 * B04 + 1))
    NDMI = (B08 - B11) / (B08 + B11 + 1e-6)

    # Simulated biomass relationship
    AGB = max(
        5,
        NDVI * 250
        + NDMI * 120
        + random.uniform(-15, 15)
    )

    dataset.append(
        {
            "B04": B04,
            "B08": B08,
            "B11": B11,
            "NDVI": NDVI,
            "EVI": EVI,
            "NDMI": NDMI,
            "AGB": AGB,
        }
    )

    if (i + 1) % 500 == 0:
        print(f"Generated {i+1}/{NUM_SAMPLES} samples")


# =========================
# SAVE CSV
# =========================

df = pd.DataFrame(dataset)

df.to_csv(
    OUTPUT_PATH,
    index=False,
)

print(f"\nDataset saved successfully at: {OUTPUT_PATH}")