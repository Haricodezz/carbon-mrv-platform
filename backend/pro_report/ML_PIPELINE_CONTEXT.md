# Machine Learning & Satellite Verification Pipeline

## 1. Geospatial Data Extraction
The platform utilizes the Microsoft Planetary Computer STAC (SpatioTemporal Asset Catalog) API to search and retrieve cloud-free Sentinel-2 Level-2A surface reflectance imagery.

### Pixel Index Calculations
For a given coordinates bounding box, we crop the raster and compute three core spectral indices across the pixel arrays:
1. **NDVI (Normalized Difference Vegetation Index)**:
   $$\text{NDVI} = \frac{\text{B08} - \text{B04}}{\text{B08} + \text{B04} + 10^{-6}}$$
2. **EVI (Enhanced Vegetation Index)**:
   $$\text{EVI} = 2.5 \times \frac{\text{B08} - \text{B04}}{\text{B08} + 6.0 \times \text{B04} + 1.0}$$
3. **NDMI (Normalized Difference Moisture Index)**:
   $$\text{NDMI} = \frac{\text{B08} - \text{B11}}{\text{B08} + \text{B11} + 10^{-6}}$$

Where:
- `B04` = Red band (665 nm)
- `B08` = Near-Infrared (NIR) band (842 nm)
- `B11` = Shortwave Infrared (SWIR) band (1610 nm)

---

## 2. Biomass Regression Model (`carbon_model.pkl`)
- **Architecture**: XGBoost Regressor (`XGBRegressor`)
- **Features**: `["B04", "B08", "B11", "NDVI", "EVI", "NDMI"]`
- **Output**: Above Ground Biomass per hectare ($\text{AGB/ha}$) in metric tons.

### IPCC Stoichiometric Conversion
Once $\text{AGB/ha}$ is predicted, the total $CO_2$ equivalent is calculated:
1. $\text{Hectares} = \text{Acres} \times 0.40468564$
2. $\text{Total Biomass} = \text{AGB/ha} \times \text{Hectares}$
3. $\text{Carbon Stock} = \text{Total Biomass} \times 0.47$ (carbon fraction of dry biomass)
4. $\text{CO2e} = \text{Carbon Stock} \times 3.6667$ ($\text{CO}_2$ to $\text{C}$ weight ratio $\frac{44}{12}$)

---

## 3. Fraud & Anomaly Classifier Model (`fraud_model.pkl`)
- **Architecture**: XGBoost Binary Classifier (`XGBClassifier`)
- **Inputs**: NDVI, EVI, NDMI, land area, latitude, longitude, duplicate polygon flag, water body fraction, urban land cover fraction, deforestation loss rate, and biophysical impossible growth.
- **Output**: Probability of fraudulent land submission ($0.0$ to $100.0\%$).

### Rule-based Anomaly Flags (Fallback and Pre-filtering)
- **Duplicate Boundary**: Checked against PostgreSQL polygon registry.
- **Water Body Override**: Flagged if NIR reflectance drops below Red reflectance (`B08 < B04`) across $\ge 30\%$ of the polygon.
- **Urban Built-up Encroachment**: Flagged if SWIR exceeds NIR and NDVI is low ($0.05 \le \text{NDVI} \le 0.25$) across $\ge 30\%$ of the polygon.
- **Biophysical Impossibility**: Flagged if vegetation indices change at rates physically impossible for forest growth.

---

## 4. Code Locations & Modules
- **Data & Training Scripts**: `backend/ml/`
  - `generate_datasets.py`: Synthesizes scientific training CSVs.
  - `train_biomass_model.py`: Trains the regression pipeline.
  - `train_fraud_model.py`: Trains the binary classifier.
  - `evaluate_models.py`: Prints feature importance and $R^2$ metrics.
- **Inference Classes**:
  - `backend/app/services/biomass_model_service.py`: Orchestrates feature scaling and runs biomass prediction.
  - `backend/app/services/fraud_model_service.py`: Loads the model and yields fraud risk probabilities.
  - `backend/app/services/planetary_computer_service.py`: Fetches Sentinel-2 data and clips rasters.
