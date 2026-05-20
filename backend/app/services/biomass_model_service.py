import logging
from pathlib import Path
from typing import List

import numpy as np

from app.core.config import settings
from app.services.satellite_utils import sentinel_search_datetime_range


# =========================
# LOGGING
# =========================
logger = logging.getLogger(__name__)


# =========================
# MODEL LOADING (LAZY)
# =========================
BASE_DIR = Path(__file__).resolve().parents[2]
MODEL_PATH = BASE_DIR / settings.MODEL_PATH

_model = None
_model_loaded = False


def _get_model():
    """Lazily load the ML model on first use, not at import time."""
    global _model, _model_loaded
    if _model_loaded:
        return _model

    _model_loaded = True
    if MODEL_PATH.exists():
        try:
            import joblib
            _model = joblib.load(MODEL_PATH)
            logger.info(
                f"Biomass model loaded successfully from {MODEL_PATH}"
            )
        except Exception as e:
            logger.error(
                f"Failed to load biomass model: {e}"
            )
    else:
        logger.warning(
            f"Biomass model file not found at {MODEL_PATH}. "
            "Predictions disabled."
        )
    return _model


# =========================
# LAZY PLANETARY COMPUTER CLIENT
# =========================
_catalog = None


def _get_catalog():
    """Lazily initialize the Planetary Computer STAC catalog client."""
    global _catalog
    if _catalog is None:
        try:
            from pystac_client import Client
            import planetary_computer

            _catalog = Client.open(
                "https://planetarycomputer.microsoft.com/api/stac/v1",
                modifier=planetary_computer.sign_inplace,
            )
            logger.info("Biomass service: Planetary Computer catalog initialized.")
        except Exception as e:
            logger.warning(f"Biomass service: Failed to init Planetary Computer: {e}")
            raise
    return _catalog


# =========================
# FEATURE EXTRACTION
# =========================
def get_live_sentinel_features(
    latitude: float,
    longitude: float,
) -> List[float]:
    """
    Fetch Sentinel-2 bands and vegetation indices.
    """
    import rasterio
    from rasterio.mask import mask
    from shapely.geometry import Point, mapping

    catalog = _get_catalog()

    point = Point(
        longitude,
        latitude,
    )

    search = catalog.search(
        collections=["sentinel-2-l2a"],
        intersects=mapping(point),
        datetime=sentinel_search_datetime_range(),
        limit=1,
    )

    items = list(
        search.items()
    )

    if not items:
        raise Exception(
            "No Sentinel imagery found."
        )

    item = items[0]

    bands = {
        "B04": item.assets["B04"].href,
        "B08": item.assets["B08"].href,
        "B11": item.assets["B11"].href,
    }

    values = {}

    for band_name, url in bands.items():
        with rasterio.open(
            url
        ) as src:
            geojson = [
                mapping(
                    point.buffer(
                        0.001
                    )
                )
            ]

            out_image, _ = mask(
                src,
                geojson,
                crop=True,
            )

            values[
                band_name
            ] = float(
                np.nanmean(
                    out_image
                )
            )

    red = values["B04"]
    nir = values["B08"]
    swir = values["B11"]

    ndvi = (
        (nir - red)
        / (nir + red + 1e-6)
    )

    evi = (
        2.5
        * (
            (nir - red)
            / (
                nir
                + 6 * red
                + 1
            )
        )
    )

    ndmi = (
        (nir - swir)
        / (nir + swir + 1e-6)
    )

    return [
        red,
        nir,
        swir,
        ndvi,
        evi,
        ndmi,
    ]


# =========================
# BIOMASS PREDICTION
# =========================
def predict_project_biomass(
    latitude: float,
    longitude: float,
    land_area_acres: float,
    features: List[float] = None,
):
    """
    Predict biomass, carbon stock, CO2e, and credits.
    """
    if features is None:
        features = get_live_sentinel_features(latitude, longitude)

    model = _get_model()
    if model is None:
        # Graceful scientific fallback: AGB/ha mapped to NDVI (features[3])
        # Tropical/dense forest range up to 250 tons/ha
        ndvi_val = features[3] if len(features) > 3 else 0.5
        predicted_agb_per_hectare = max(5.0, ndvi_val * 220.0)
    else:
        try:
            predicted_agb_per_hectare = float(model.predict([features])[0])
        except Exception as pred_err:
            logger.warning(f"ML prediction failed ({pred_err}). Reverting to rule-based fallback.")
            ndvi_val = features[3] if len(features) > 3 else 0.5
            predicted_agb_per_hectare = max(5.0, ndvi_val * 220.0)

    hectares = (
        land_area_acres
        * 0.40468564
    )

    total_biomass = (
        predicted_agb_per_hectare
        * hectares
    )

    carbon_stock = (
        total_biomass
        * 0.47
    )

    co2e = (
        carbon_stock
        * (44.0 / 12.0)
    )

    estimated_credits = max(
        int(co2e),
        0,
    )

    return {
        "agb_per_hectare":
            round(
                predicted_agb_per_hectare,
                2,
            ),
        "total_biomass":
            round(
                total_biomass,
                2,
            ),
        "carbon_stock":
            round(
                carbon_stock,
                2,
            ),
        "co2e":
            round(
                co2e,
                2,
            ),
        "estimated_credits":
            estimated_credits,
    }