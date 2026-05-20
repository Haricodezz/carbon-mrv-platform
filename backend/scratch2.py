import asyncio
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), ".")))

def test_rasterio():
    try:
        from pystac_client import Client
        import planetary_computer
        import rasterio
        from shapely.geometry import Point, mapping
        import numpy as np

        catalog = Client.open(
            "https://planetarycomputer.microsoft.com/api/stac/v1",
            modifier=planetary_computer.sign_inplace,
        )

        lon, lat = 77.5946, 12.9716
        point = Point(lon, lat)

        search = catalog.search(
            collections=["sentinel-2-l2a"],
            intersects=mapping(point),
            datetime="2024-01-01/2024-12-31",
            limit=1,
        )

        items = list(search.items())
        if not items:
            print("No items")
            return

        item = items[0]
        url = item.assets["B04"].href
        print(f"B04 URL: {url}")

        with rasterio.open(url) as src:
            # Try sampling
            val = list(src.sample([(lon, lat)]))
            print(f"Sampled value: {val}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_rasterio()
