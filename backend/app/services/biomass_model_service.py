import logging
from pathlib import Path
from typing import List

import joblib
import numpy as np
import planetary_computer
import rasterio
from pystac_client import Client
from rasterio.mask import mask
from shapely.geometry import Point, mapping

from app.core.config import settings


# =========================
# LOGGING
# =========================
logger = logging.getLogger(__name__)


# =========================
# MODEL LOADING
# =========================
BASE_DIR = Path(__file__).resolve().parents[2]
MODEL_PATH = BASE_DIR / settings.MODEL_PATH

model = None

if MODEL_PATH.exists():
    try:
        model = joblib.load(MODEL_PATH)
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


# =========================
# PLANETARY COMPUTER CLIENT
# =========================
catalog = Client.open(
    "https://planetarycomputer.microsoft.com/api/stac/v1",
    modifier=planetary_computer.sign_inplace,
)


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

    point = Point(
        longitude,
        latitude,
    )

    search = catalog.search(
        collections=["sentinel-2-l2a"],
        intersects=mapping(point),
        datetime="2025-01-01/2025-12-31",
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
                        0.0001
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
):
    """
    Predict biomass, carbon stock, CO2e, and credits.
    """

    if model is None:
        raise Exception(
            "Biomass model not loaded. "
            "Please train and place carbon_model.pkl."
        )

    features = (
        get_live_sentinel_features(
            latitude,
            longitude,
        )
    )

    predicted_agb_per_hectare = float(
        model.predict(
            [features]
        )[0]
    )

    hectares = (
        land_area_acres
        * 0.404686
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
        * 3.67
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