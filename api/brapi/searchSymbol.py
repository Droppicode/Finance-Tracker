import requests
import os
from http.server import BaseHTTPRequestHandler
from api._utils import send_cors_preflight, send_json_response, send_error_response, get_request_body

BASE_URL = "https://brapi.dev/api"

def make_request(endpoint, params):
    """Make request to Brapi API"""
    api_key = os.environ.get('BRAPI_API_KEY')
    if api_key:
        params['token'] = api_key
    
    url = f"{BASE_URL}/{endpoint}"
    print(f"Making request to Brapi API: {url}", {"params": params})
    
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        return response.json()
    except Exception as error:
        print(f"Error making request to Brapi API: {error}")
        raise Exception("Error making request to Brapi API") from error

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """Handle CORS preflight request"""
        send_cors_preflight(self, 'POST, OPTIONS')
    
    def do_POST(self):
        """Handle POST request"""
        try:
            # Check for API key
            if not os.environ.get('BRAPI_API_KEY'):
                print("BRAPI_API_KEY is not set.")
                send_json_response(
                    self,
                    {'error': 'BRAPI_API_KEY is not configured.'},
                    status_code=500,
                    methods='POST, OPTIONS'
                )
                return
            
            # Read request body
            data = get_request_body(self)
            
            symbol = data.get('symbol')
            
            print("searchSymbol function called with data:", data)
            
            if not symbol:
                send_json_response(
                    self,
                    {'error': "The function must be called with one argument 'symbol'."},
                    status_code=400,
                    methods='POST, OPTIONS'
                )
                return
            
            endpoint = "quote/list"
            params = {
                'search': symbol,
                'limit': 10,
            }
            
            # Make the request
            results = make_request(endpoint, params)
            print("searchSymbol function results:", results)
            
            # Send success response
            stocks = results.get('stocks', [])
            send_json_response(self, {'data': stocks}, methods='POST, OPTIONS')
            
        except Exception as error:
            print(f"Error in searchSymbol Vercel function: {error}")
            send_error_response(self, error, methods='POST, OPTIONS')
