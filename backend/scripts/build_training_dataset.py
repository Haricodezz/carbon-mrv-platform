import pandas as pd
import numpy as np
from pystac_client import Client
import planetary_computer
import rasterio
from rasterio.mask import mask
from shapely.geometry import Point, mapping
import requests
import json
import time


# =========================
# CONFIG
# =========================

OUTPUT_FILE = "training_dataset.csv"

# Example GEDI sample points
# Replace later with larger GEDI batch
GEDI_SAMPLE_POINTS = [
    {
        "latitude": 23.5937,
        "longitude": 80.9629,
        "agb": 120.5,
    },
    {
        "latitude": 21.1458,
        "longitude": 79.0882,
        "agb": 95.3,
    },
    {
        "latitude": 26.8467,
        "longitude": 80.9462,
        "agb": 78.4,
    },
]


# =========================
# PLANETARY COMPUTER CLIENT
# =========================

catalog = Client.open(
    "https://planetarycomputer.microsoft.com/api/stac/v1",
    modifier=planetary_computer.sign_inplace,
)


# =========================
# SENTINEL FEATURE EXTRACTION
# =========================

def get_sentinel_features(
    latitude: float,
    longitude: float,
):
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
        return None

    item = items[0]

    bands = {
        "B04": item.assets["B04"].href,  # Red
        "B08": item.assets["B08"].href,  # NIR
        "B11": item.assets["B11"].href,  # SWIR
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
            ] = np.nanmean(
                out_image
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

    return {
        "red": red,
        "nir": nir,
        "swir": swir,
        "ndvi": ndvi,
        "evi": evi,
        "ndmi": ndmi,
    }


# =========================
# BUILD DATASET
# =========================

dataset_rows = []

for sample in GEDI_SAMPLE_POINTS:
    try:
        features = (
            get_sentinel_features(
                sample[
                    "latitude"
                ],
                sample[
                    "longitude"
                ],
            )
        )

        if not features:
            continue

        dataset_rows.append(
            {
                "latitude": sample[
                    "latitude"
                ],
                "longitude": sample[
                    "longitude"
                ],
                "agb": sample[
                    "agb"
                ],
                **features,
            }
        )

        print(
            f"Processed point: {sample['latitude']}, {sample['longitude']}"
        )

        time.sleep(
            1
        )  # avoid throttling

    except Exception as e:
        print(
            f"Error processing point: {e}"
        )


# =========================
# SAVE
# =========================

df = pd.DataFrame(
    dataset_rows
)

df.to_csv(
    OUTPUT_FILE,
    index=False,
)

print(
    f"Training dataset saved to {OUTPUT_FILE}"
)