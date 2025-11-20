import requests
from http.server import BaseHTTPRequestHandler
from _utils import send_cors_preflight, send_json_response, send_error_response

BASE_URL = "https://api.bcb.gov.br/dados/serie"

def _make_request(series_id, params=None):
    """Make request to BCB API"""
    if params is None:
        params = {}
    
    url = f"{BASE_URL}/bcdata.sgs.{series_id}/dados"
    
    if not params or ('dataInicial' not in params and 'dataFinal' not in params):
        url += "/ultimos/1"
    
    params["formato"] = "json"
    
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        return response.json()
    except Exception as error:
        print(f"Error making request to BCB API: {error}")
        raise Exception("Error making request to BCB API") from error

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """Handle CORS preflight request"""
        send_cors_preflight(self, 'GET, OPTIONS')
    
    def do_GET(self):
        """Handle GET request"""
        try:
            # Series ID 189 is for IGPM
            result = _make_request(189)
            value = result[0]['valor'] if isinstance(result, list) and len(result) > 0 else None
            send_json_response(self, {'data': value}, methods='GET, OPTIONS')
        except Exception as error:
            print(f"Error in getIgpm Vercel function: {error}")
            send_error_response(self, error, methods='GET, OPTIONS')
