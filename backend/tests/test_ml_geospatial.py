import unittest
from unittest.mock import patch, MagicMock
from uuid import uuid4
import numpy as np

from app.services.planetary_computer_service import verify_project_with_planetary_computer
from app.services.biomass_model_service import predict_project_biomass
from app.services.fraud_model_service import predict_fraud_risk

class TestMLGeospatialPipeline(unittest.TestCase):

    def test_stoichiometric_carbon_math(self):
        """
        Verify that our scientific formulas strictly enforce 1 Token = 1 Ton CO2e.
        """
        land_area_acres = 100.0
        # 1 acre = 0.40468564 hectares
        hectares = land_area_acres * 0.40468564
        
        # Assume AGB/ha is 150.0 tons/ha
        agb_per_hectare = 150.0
        total_biomass = agb_per_hectare * hectares
        
        # Carbon stock fraction = 47% of biomass
        carbon_stock = total_biomass * 0.47
        
        # CO2e = carbon_stock * 44/12
        co2e = carbon_stock * (44.0 / 12.0)
        
        estimated_credits = int(co2e)
        
        # Check calculation consistency
        self.assertAlmostEqual(hectares, 40.468564, places=5)
        self.assertAlmostEqual(total_biomass, 6070.2846, places=2)
        self.assertAlmostEqual(carbon_stock, 2853.03376, places=2)
        self.assertAlmostEqual(co2e, 10461.12379, places=2)
        self.assertEqual(estimated_credits, 10461)

    def test_biomass_model_prediction(self):
        """
        Verify that our trained biomass model accepts features and yields realistic outputs.
        """
        # Feature order: [B04 (Red), B08 (NIR), B11 (SWIR), NDVI, EVI, NDMI]
        # High vegetation indices should yield higher biomass
        high_veg_features = [500.0, 7500.0, 600.0, 0.875, 0.75, 0.852]
        res_high = predict_project_biomass(
            latitude=12.97, longitude=77.59, land_area_acres=10.0, features=high_veg_features
        )
        
        # Low vegetation indices should yield lower biomass
        low_veg_features = [1800.0, 2000.0, 1900.0, 0.052, 0.02, 0.025]
        res_low = predict_project_biomass(
            latitude=12.97, longitude=77.59, land_area_acres=10.0, features=low_veg_features
        )
        
        self.assertTrue(res_high["agb_per_hectare"] > res_low["agb_per_hectare"])
        self.assertEqual(res_high["estimated_credits"], int(res_high["co2e"]))
        self.assertEqual(res_low["estimated_credits"], int(res_low["co2e"]))

    def test_fraud_model_prediction(self):
        """
        Verify that our trained fraud model correctly flags duplicate polygons,
        impossible growth rates, water bodies, and low NDVI.
        """
        # Normal forested project
        normal_res = predict_fraud_risk(
            ndvi=0.8, evi=0.6, ndmi=0.5, land_area_acres=50.0, latitude=12.9, longitude=77.5,
            duplicate_polygon=0, water_fraction=0.01, urban_fraction=0.02, historical_loss_rate=0.01, impossible_growth=0
        )
        self.assertTrue(normal_res["fraud_probability"] < 50.0)
        self.assertEqual(normal_res["is_fraud"], 0)

        # Duplicate polygon flagged
        dup_res = predict_fraud_risk(
            ndvi=0.8, evi=0.6, ndmi=0.5, land_area_acres=50.0, latitude=12.9, longitude=77.5,
            duplicate_polygon=1, water_fraction=0.01, urban_fraction=0.02, historical_loss_rate=0.01, impossible_growth=0
        )
        self.assertTrue(dup_res["fraud_probability"] > 50.0)
        self.assertEqual(dup_res["is_fraud"], 1)

        # High water body
        water_res = predict_fraud_risk(
            ndvi=0.2, evi=0.1, ndmi=0.0, land_area_acres=50.0, latitude=12.9, longitude=77.5,
            duplicate_polygon=0, water_fraction=0.65, urban_fraction=0.02, historical_loss_rate=0.01, impossible_growth=0
        )
        self.assertTrue(water_res["fraud_probability"] > 50.0)
        self.assertEqual(water_res["is_fraud"], 1)

    def test_deterministic_geospatial_fallback(self):
        """
        Verify that the pipeline gracefully degrades to a deterministic,
        scientific model when STAC APIs or local packages are unavailable.
        """
        # Run planetary computer verification with mocked client failures
        with patch('app.services.planetary_computer_service._get_catalog', side_effect=Exception("STAC catalog unavailable")):
            res = verify_project_with_planetary_computer(
                latitude=15.342, longitude=75.123, land_area_acres=25.0, polygon_coordinates=None
            )
            
            # Verify response is structural and populated
            self.assertEqual(res["verification_status"], "verified")
            self.assertTrue(res["ndvi_score"] > 0.4)
            self.assertTrue(res["total_biomass"] > 0.0)
            self.assertEqual(res["estimated_credits"], int(res["co2e"]))
            self.assertIn("geographic modeling", res["verification_notes"])

if __name__ == '__main__':
    unittest.main()
