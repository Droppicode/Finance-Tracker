import requests
from http.server import BaseHTTPRequestHandler
from datetime import datetime
from dateutil.relativedelta import relativedelta
from api._utils import send_cors_preflight, send_json_response, send_error_response, get_request_body

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

def get_monthly_series(series_id, start_date_str, end_date_str):
    """Get monthly series data with buffered dates"""
    start = datetime.fromisoformat(start_date_str.replace('Z', '+00:00'))
    end = datetime.fromisoformat(end_date_str.replace('Z', '+00:00'))
    
    # Buffer the dates by 2 months
    buffered_start_date = start - relativedelta(months=2)
    buffered_end_date = end + relativedelta(months=2)
    
    # Format dates as dd/MM/yyyy
    formatted_start_date = buffered_start_date.strftime("%d/%m/%Y")
    formatted_end_date = buffered_end_date.strftime("%d/%m/%Y")
    
    params = {
        "dataInicial": formatted_start_date,
        "dataFinal": formatted_end_date,
    }
    
    return _make_request(series_id, params)

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """Handle CORS preflight request"""
        send_cors_preflight(self, 'POST, OPTIONS')
    
    def do_POST(self):
        """Handle POST request"""
        try:
            # Read request body
            data = get_request_body(self)
            
            series_id = data.get('seriesId')
            start_date = data.get('startDate')
            end_date = data.get('endDate')
            
            if not series_id or not start_date or not end_date:
                send_json_response(
                    self,
                    {'error': 'Missing required parameters: seriesId, startDate, endDate'},
                    status_code=400,
                    methods='POST, OPTIONS'
                )
                return
            
            # Get the data
            result = get_monthly_series(series_id, start_date, end_date)
            send_json_response(self, {'data': result}, methods='POST, OPTIONS')
            
        except Exception as error:
            print(f"Error in getMonthlySeries Vercel function: {error}")
            send_error_response(self, error, methods='POST, OPTIONS')
