import asyncio
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), ".")))

from app.services.planetary_computer_service import verify_project_with_planetary_computer

def test():
    # Example for Bengaluru 
    result = verify_project_with_planetary_computer(latitude=12.9716, longitude=77.5946, land_area_acres=10.0, polygon_coordinates=None)
    for k, v in result.items():
        print(f"{k}: {v}")

if __name__ == "__main__":
    test()
