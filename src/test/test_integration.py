import pytest
import requests
import os
from dotenv import load_dotenv
from supabase import create_client, Client
 
load_dotenv()
 
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
AI_BASE_URL  = "http://localhost:5000"
 
 
class TestResaaIntegration:
 
    # ---------------------------------------------------------
    # Test Case 1: Supabase Database Connection
    # ---------------------------------------------------------
    def test_supabase_connection(self):
        """
        Integration Test 1: Verify system can connect to Supabase database.
        """
        # 1. Input: Load credentials from environment
        url: str = os.environ.get("SUPABASE_URL")
        key: str = os.environ.get("SUPABASE_KEY")
 
        # Check if credentials exist before running
        if not url or not key:
            pytest.skip("Supabase credentials missing in .env")
 
        try:
            # 2. Act: Initialize client and attempt a simple query
            supabase: Client = create_client(url, key)
 
            # Select 1 record just to verify connection is alive
            response = supabase.table("auction").select("*").limit(1).execute()
 
            # 3. Assert: Verify the connection was successful
            # If the query runs without error, the connection is good.
            assert response.data is not None, "Failed to retrieve data from Supabase"
            assert isinstance(response.data, list), "Data format is incorrect"
 
            print("\nTest 1 Passed: Connected to Supabase successfully.")
            print(f"Records returned: {len(response.data)}")
 
        except Exception as e:
            print(f"\nTest 1 Failed: Could not connect to Supabase")
            raise


    # ---------------------------------------------------------
    # Test Case 2: Fetch Real Auction Data
    # ---------------------------------------------------------
    def test_fetch_auction_data(self):
        """
        Integration Test 2: Verify system retrieves complete auction record.
        """
        # 1. Input: Connect to real database
        url: str = os.environ.get("SUPABASE_URL")
        key: str = os.environ.get("SUPABASE_KEY")
 
        if not url or not key:
            pytest.skip("Supabase credentials missing in .env")
 
        try:
            # 2. Act: Fetch one real auction with all important fields
            supabase: Client = create_client(url, key)
 
            response = supabase.table("auction") \
                .select("auction_id, auction_name, start_price, highest_bid, start_time, end_time") \
                .limit(1) \
                .execute()
 
            # 3. Assert: Auction exists and has all required fields
            assert response.data is not None, "No data returned from Supabase"
            assert len(response.data) > 0, "Auction table is empty"
 
            auction = response.data[0]
 
            assert "auction_id"   in auction, "Missing field: auction_id"
            assert "auction_name" in auction, "Missing field: auction_name"
            assert "start_price"  in auction, "Missing field: start_price"
            assert "highest_bid"  in auction, "Missing field: highest_bid"
            assert "start_time"   in auction, "Missing field: start_time"
            assert "end_time"     in auction, "Missing field: end_time"
            assert auction["start_price"] > 0, "start_price must be greater than zero"
 
            print("\nTest 2 Passed: Auction data retrieved successfully.")
            print(f"Auction Name : {auction['auction_name']}")
            print(f"Start Price  : {auction['start_price']:,} SAR")
            print(f"Highest Bid  : {auction['highest_bid']:,} SAR")
            print(f"Start Time   : {auction['start_time']}")
            print(f"End Time     : {auction['end_time']}")
 
        except AssertionError as e:
            print(f"\nTest 2 Failed: {e}")
            raise

     # ---------------------------------------------------------
    # Test Case 3: AI Property Analysis API
    # ---------------------------------------------------------
    def test_ai_price_prediction(self):
        """
        Integration Test 3: Verify AI API returns valid property analysis.
        Corresponds to: User views AI price analysis on auction detail page.
        Using fixed property data to ensure consistent and repeatable test results.
        """

        # 1. Input: Fixed property data for consistent test results
        property_input = {
            "area_sqm":       300,
            "neighborhood":   "الروضة",
            "property_type":  "أرض",
            "classification": "سكني",
            "plan_no":        "0",
            "parcel_no":      "0",
        }
 
        try:
            # 2. Act: Send request to the real AI prediction API
            response = requests.post(
                f"{AI_BASE_URL}/predict",
                json=property_input,
                timeout=10
            )
 
            # 3. Assert: Response is successful and has required fields
            assert response.status_code == 200, \
                f"Expected status 200, got {response.status_code}"
 
            data = response.json()
 
            assert "total_price"      in data, "Missing field: total_price"
            assert "price_range"      in data, "Missing field: price_range"
            assert "demand_indicator" in data, "Missing field: demand_indicator"
            assert "max_bid"          in data, "Missing field: max_bid"
            assert data["total_price"] > 0,    "total_price must be greater than zero"
            assert data["max_bid"]     > 0,    "max_bid must be greater than zero"
            assert data["price_range"]["high"] > data["price_range"]["low"], \
                "price_range high must be greater than low"
 
            print("\nTest 3 Passed: AI API returned valid prediction.")
            print(f"Total Price      : {data['total_price']:,} SAR")
            print(f"Price Range      : {data['price_range']['low']:,} — {data['price_range']['high']:,} SAR")
            print(f"Demand Indicator : {data['demand_indicator']}")
            print(f"Max Bid          : {data['max_bid']:,} SAR")
 
        except AssertionError as e:
            print(f"\nTest 3 Failed: {e}")
            raise
 

 