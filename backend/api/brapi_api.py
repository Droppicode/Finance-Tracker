import requests
import os

BRAPI_API_KEY = os.getenv("BRAPI_API_KEY")
BASE_URL = "https://brapi.dev/api"

def _make_request(endpoint, params):
    if BRAPI_API_KEY:
        params["token"] = BRAPI_API_KEY
    
    url = f"{BASE_URL}/{endpoint}"
    response = requests.get(url, params=params)
    response.raise_for_status()
    return response.json()

def search_symbol(symbol):
    endpoint = "quote/list"
    params = {
        "search": symbol,
        "limit": 10, 
    }
    return _make_request(endpoint, params)

def get_quote(symbol):
    endpoint = f"quote/{symbol}"
    params = {}
    return _make_request(endpoint, params)
