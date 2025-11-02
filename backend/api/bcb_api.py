import requests
from datetime import date, timedelta, datetime

BASE_URL = "https://api.bcb.gov.br/dados/serie"

def _make_request(series_id, params=None):
    if params is None:
        params = {}
        
    url = f"{BASE_URL}/bcdata.sgs.{series_id}/dados"
    
    if not params or ('dataInicial' not in params and 'dataFinal' not in params):
        url += "/ultimos/1"
    
    params['formato'] = 'json'

    print(url, params)

    response = requests.get(url, params=params)
    response.raise_for_status()
    return response.json()

def get_daily_series(series_id, start_date_str, end_date_str):
    # Parse the date strings into date objects
    start_date = datetime.strptime(start_date_str, '%d/%m/%Y').date()
    end_date = datetime.strptime(end_date_str, '%d/%m/%Y').date()

    # Add 5-day buffer
    buffered_start_date = start_date - timedelta(days=5)
    buffered_end_date = end_date + timedelta(days=5)

    # Format dates back to string for the API call
    formatted_start_date = buffered_start_date.strftime('%d/%m/%Y')
    formatted_end_date = buffered_end_date.strftime('%d/%m/%Y')

    params = {
        'dataInicial': formatted_start_date,
        'dataFinal': formatted_end_date,
    }
    return _make_request(series_id, params)

def get_monthly_series(series_id, start_date_str, end_date_str):
    # Parse the date strings into date objects
    start_date = datetime.strptime(start_date_str, '%d/%m/%Y').date()
    end_date = datetime.strptime(end_date_str, '%d/%m/%Y').date()

    # Add 2-month buffer
    buffered_start_date = start_date - timedelta(days=65)
    buffered_end_date = end_date + timedelta(days=65)

    # Format dates back to string for the API call
    formatted_start_date = buffered_start_date.strftime('%d/%m/%Y')
    formatted_end_date = buffered_end_date.strftime('%d/%m/%Y')

    params = {
        'dataInicial': formatted_start_date,
        'dataFinal': formatted_end_date,
    }
    return _make_request(series_id, params)

def get_ipca():
    """Busca o último valor do IPCA."""
    data = _make_request(433)
    if isinstance(data, list) and data:
        return data[0].get('valor')
    return None

def get_igpm():
    """Busca o último valor do IGP-M."""
    data = _make_request(189)
    if isinstance(data, list) and data:
        return data[0].get('valor')
    return None
