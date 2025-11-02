import requests
from datetime import date, timedelta

BASE_URL = "https://api.bcb.gov.br/dados/serie"

def _make_request(series_id, params=None):
    if params is None:
        params = {}
        
    url = f"{BASE_URL}/bcdata.sgs.{series_id}/dados"
    
    # Se não houver parâmetros, busca o último valor
    if not params:
        url += "/ultimos/5"
        params['formato'] = 'json'
    else:
        # Garante que o formato seja json
        params['formato'] = 'json'

    response = requests.get(url, params=params)
    response.raise_for_status()
    data = response.json()

    print("\n\nDATA", data)
    print("\n")
    
    if isinstance(data, list) and data:
        return data[0].get('valor')
    return None

def get_cdi():
    """Busca o último valor do CDI."""
    return _make_request(12)

def get_selic():
    """Busca o último valor da SELIC."""
    return _make_request(4189)

def get_ipca():
    """Busca o último valor do IPCA."""
    return _make_request(433)

def get_igpm():
    """Busca o último valor do IGP-M."""
    return _make_request(189)
