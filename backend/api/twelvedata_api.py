import requests
import time
import os

TWELVEDATA_API_KEY = os.getenv("TWELVEDATA_API_KEY")
BASE_URL = "https://api.twelvedata.com"

# Última vez que uma requisição foi feita para a API Twelve Data
last_request_time = 0
# Intervalo mínimo entre requisições (60 segundos / 8 requisições = 7.5 segundos)
REQUEST_INTERVAL = 7.5

def _make_request(endpoint, params):
    global last_request_time
    current_time = time.time()

    if current_time - last_request_time < REQUEST_INTERVAL:
        sleep_time = REQUEST_INTERVAL - (current_time - last_request_time)
        time.sleep(sleep_time)

    params["apikey"] = TWELVEDATA_API_KEY
    url = f"{BASE_URL}/{endpoint}"
    response = requests.get(url, params=params)
    response.raise_for_status()  # Levanta um erro para status de resposta ruins (4xx ou 5xx)
    last_request_time = time.time()
    return response.json()

def search_symbol(symbol):
    if not TWELVEDATA_API_KEY:
        raise ValueError("TWELVEDATA_API_KEY não está configurada nas variáveis de ambiente.")
    
    endpoint = "symbol_search"
    params = {
        "symbol": symbol,
        "outputsize": 10, # Limita o número de resultados
    }
    return _make_request(endpoint, params)

def get_quote(symbol):
    if not TWELVEDATA_API_KEY:
        raise ValueError("TWELVEDATA_API_KEY não está configurada nas variáveis de ambiente.")
    
    endpoint = "quote"
    params = {
        "symbol": symbol,
    }
    return _make_request(endpoint, params)
