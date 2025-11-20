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
        raise

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
            
            print("getQuote function called with data:", data)
            
            symbol = data.get('symbol')
            range_param = data.get('range', '1mo')
            interval = data.get('interval', '1d')
            
            if not symbol:
                send_json_response(
                    self,
                    {'error': "The function must be called with 'symbol'."},
                    status_code=400,
                    methods='POST, OPTIONS'
                )
                return
            
            # Remove .SA suffix if present
            endpoint = f"quote/{symbol.replace('.SA', '')}"
            params = {
                'range': range_param,
                'interval': interval,
            }
            
            print("Params sent to Brapi API:", params)
            
            # Make the request
            results = make_request(endpoint, params)
            print("getQuote function results:", results)
            
            # Send success response
            result_data = results.get('results', [{}])[0] if results.get('results') else {}
            send_json_response(self, {'data': result_data}, methods='POST, OPTIONS')
            
        except requests.exceptions.HTTPError as error:
            print(f"Error in getQuote Vercel function: {error}")
            
            status_code = 500
            error_message = str(error)
            
            if hasattr(error, 'response') and error.response is not None:
                if error.response.status_code == 404:
                    status_code = 404
                    error_message = "Symbol not found"
                elif error.response.status_code == 403:
                    status_code = 403
                    error_message = "Forbidden. Check your Brapi API plan and permissions."
            
            send_json_response(
                self,
                {'error': error_message},
                status_code=status_code,
                methods='POST, OPTIONS'
            )
            
        except Exception as error:
            print(f"Error in getQuote Vercel function: {error}")
            send_error_response(self, error, methods='POST, OPTIONS')
