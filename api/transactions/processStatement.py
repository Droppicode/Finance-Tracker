import os
import time
from http.server import BaseHTTPRequestHandler
import google.generativeai as genai
from api._utils import send_cors_preflight, send_json_response, send_error_response, get_request_body

MAX_RETRIES = 3
RETRY_DELAY_MS = 2000  # 2 seconds

def extract_transactions_from_text(text):
    """Extract transactions from bank statement text using Gemini AI"""
    print(f"extractTransactionsFromText called with text (first 200 chars): {text[:200]}")
    
    api_key = os.environ.get('GEMINI_API_KEY')
    if not api_key:
        print("GEMINI_API_KEY is not set.")
        raise Exception("GEMINI_API_KEY is not configured.")
    
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-2.5-flash')
    
    prompt = """
    You are an expert in extracting transaction information from bank
    statements. Given the text from a bank statement, extract the following
    information for each transaction:
    - Date
    - Description (the name of the establishment)
    - Amount
    - Type (credit or debit)
    - Category in Portuguese (e.g., Alimentação, Transporte, Lazer, Salário,
      etc.)

    **Important**: The descriptions must be kept in Portuguese and should be
    short and direct.

    Return the information in a JSON format, as a list of objects.
    For example:
    [
        {
            "date": "2023-10-26",
            "description": "Supermercado Pague Menos",
            "amount": 345.60,
            "type": "debit",
            "category": "Alimentação"
        },
        {
            "date": "2023-10-27",
            "description": "Posto Shell Av. Central",
            "amount": 150.00,
            "type": "debit",
            "category": "Transporte"
        },
        {
            "date": "2023-10-28",
            "description": "Depósito de Salário",
            "amount": 5000.00,
            "type": "credit",
            "category": "Salário"
        }
    ]

    Bank statement text:
    """ + text
    
    response_text = None
    for i in range(MAX_RETRIES):
        try:
            print(f"Attempt {i + 1} of {MAX_RETRIES} to call Gemini API...")
            result = model.generate_content(prompt)
            response_text = result.text
            print("Received response from Gemini API.")
            
            # Clean up the response
            import json
            replaced_response = response_text.strip().replace("json", "")
            cleaned_response = replaced_response.replace("`", "")
            
            return json.loads(cleaned_response)
        except Exception as e:
            print(f"Attempt {i + 1} failed: {e}")
            
            # Check if it's a 503 overload error
            error_str = str(e).lower()
            if "503" in error_str and "overloaded" in error_str and i < MAX_RETRIES - 1:
                print(f"Retrying in {RETRY_DELAY_MS / 1000} seconds...")
                time.sleep(RETRY_DELAY_MS / 1000)
            else:
                print("Failed to parse JSON from Gemini response:", e)
                print("Raw response text:", response_text)
                raise Exception("Could not parse transactions from statement.") from e
    
    raise Exception("Failed to extract transactions after multiple retries.")

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """Handle CORS preflight request"""
        send_cors_preflight(self, 'POST, OPTIONS')
    
    def do_POST(self):
        """Handle POST request"""
        try:
            print("processStatement function called.")
            
            # Read request body
            data = get_request_body(self)
            
            text = data.get('text')
            
            if not text:
                send_json_response(
                    self,
                    {'error': 'The function must be called with extracted text from a statement.'},
                    status_code=400,
                    methods='POST, OPTIONS'
                )
                return
            
            # Extract transactions
            transactions = extract_transactions_from_text(text)
            print("Successfully processed statement and extracted transactions.")
            
            # Send success response
            send_json_response(self, {'data': transactions}, methods='POST, OPTIONS')
            
        except Exception as error:
            print(f"Error processing statement: {error}")
            send_error_response(self, error, methods='POST, OPTIONS')
