import os
import random
import pandas as pd
from pathlib import Path

# Setup paths
BASE_DIR = Path(__file__).resolve().parent
DATASET_DIR = BASE_DIR / "datasets"
DATASET_DIR.mkdir(parents=True, exist_ok=True)

BIOMASS_CSV = DATASET_DIR / "biomass_dataset.csv"
FRAUD_CSV = DATASET_DIR / "fraud_dataset.csv"

# ==========================================
# 1. BIOMASS DATASET GENERATION
# ==========================================
print("Generating scientific biomass dataset...")
biomass_data = []
for _ in range(5000):
    # Simulated Sentinel-2 reflectance values (0-10000 range)
    B04 = random.uniform(100, 2000)   # Red
    B08 = random.uniform(1500, 8000)  # NIR
    B11 = random.uniform(300, 4000)   # SWIR
    
    # Calculate standard spectral indices
    ndvi = (B08 - B04) / (B08 + B04 + 1e-6)
    evi = 2.5 * ((B08 - B04) / (B08 + 6.0 * B04 + 1.0))
    ndmi = (B08 - B11) / (B08 + B11 + 1e-6)
    
    # Biomass (Above Ground Biomass - AGB in tons per hectare)
    # AGB is highly correlated with NDVI, EVI, and soil/moisture (NDMI)
    agb = max(
        5.0,
        ndvi * 180.0
        + evi * 120.0
        + ndmi * 60.0
        + random.uniform(-10.0, 10.0)
    )
    
    biomass_data.append({
        "B04": B04,
        "B08": B08,
        "B11": B11,
        "NDVI": ndvi,
        "EVI": evi,
        "NDMI": ndmi,
        "AGB": agb
    })

df_biomass = pd.DataFrame(biomass_data)
df_biomass.to_csv(BIOMASS_CSV, index=False)
print(f"Saved biomass dataset to {BIOMASS_CSV}")

# ==========================================
# 2. FRAUD DATASET GENERATION
# ==========================================
print("Generating scientific fraud dataset...")
fraud_data = []
for _ in range(3000):
    ndvi = random.uniform(0.1, 0.95)
    evi = random.uniform(0.05, 0.8)
    ndmi = random.uniform(-0.2, 0.7)
    land_area_acres = random.uniform(1.0, 500.0)
    latitude = random.uniform(-35.0, 35.0)  # Tropical & subtropical zones
    longitude = random.uniform(-120.0, 140.0)
    
    # Anomaly/Fraud indicators
    duplicate_polygon = 1 if random.random() < 0.05 else 0
    water_fraction = random.uniform(0.0, 0.8) if random.random() < 0.1 else 0.0
    urban_fraction = random.uniform(0.0, 0.8) if random.random() < 0.1 else 0.0
    historical_loss_rate = random.uniform(0.0, 0.7) if random.random() < 0.15 else 0.0
    impossible_growth = 1 if random.random() < 0.05 else 0
    
    # Determine fraud label based on rules
    # 1. Low vegetation claiming to be forest
    is_low_veg_fraud = 1 if ndvi < 0.35 and random.random() < 0.7 else 0
    # 2. Impossible growth anomaly
    is_growth_fraud = 1 if impossible_growth == 1 else 0
    # 3. Double-claiming duplicate polygons
    is_dup_fraud = 1 if duplicate_polygon == 1 else 0
    # 4. Urban or water bodies included in claiming area
    is_cover_fraud = 1 if water_fraction > 0.25 or urban_fraction > 0.25 else 0
    # 5. Rapid deforestation trend
    is_deforestation_fraud = 1 if historical_loss_rate > 0.35 else 0
    
    is_fraud = int(
        is_low_veg_fraud or 
        is_growth_fraud or 
        is_dup_fraud or 
        is_cover_fraud or 
        is_deforestation_fraud
    )
    
    fraud_data.append({
        "NDVI": ndvi,
        "EVI": evi,
        "NDMI": ndmi,
        "land_area_acres": land_area_acres,
        "latitude": latitude,
        "longitude": longitude,
        "duplicate_polygon": duplicate_polygon,
        "water_fraction": water_fraction,
        "urban_fraction": urban_fraction,
        "historical_loss_rate": historical_loss_rate,
        "impossible_growth": impossible_growth,
        "is_fraud": is_fraud
    })

df_fraud = pd.DataFrame(fraud_data)
df_fraud.to_csv(FRAUD_CSV, index=False)
print(f"Saved fraud dataset to {FRAUD_CSV}")
