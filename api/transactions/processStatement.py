import os
import time
import base64
import json
from http.server import BaseHTTPRequestHandler
import google.generativeai as genai
from api._utils import send_cors_preflight, send_json_response, send_error_response, get_request_body

MAX_RETRIES = 3
RETRY_DELAY_MS = 2000

def get_system_prompt(categories_str):
    return f"""Você é um extrator inteligente de dados financeiros.
Seu objetivo é analisar um documento (extrato bancário em PDF ou Nota Fiscal/Recibo) e extrair TODAS as transações financeiras.

REGRAS IMPORTANTES PARA O TÍTULO (description):
- Seja EXTREMAMENTE conciso no título.
- NUNCA use palavras redundantes como "Pagamento", "PIX recebido", "PIX enviado", "Transferência", "Compra". O fato de ser positivo/negativo já indica a natureza da transação.
- Exemplos corretos: ao invés de "Pagamento Uber", retorne apenas "Uber". Ao invés de "Pagamento Atacadão", retorne "Atacadão". Ao invés de "PIX de João", retorne "João".
- Coloque informações extras e originais da transação no campo "note" (descrição), não no título.

CATEGORIAS DISPONÍVEIS DO USUÁRIO:
Tente classificar usando EXATAMENTE uma das categorias desta lista.
No entanto, se você tiver altíssima confiança de que a transação NÃO se encaixa bem em nenhuma delas, você PODE sugerir uma nova categoria enviando o nome ideal no campo "category".
Lista: {categories_str or 'Nenhuma lista fornecida'}

Para CADA transação, você deve retornar um objeto JSON com os seguintes campos:
- amount: (Number) valor absoluto da transação.
- description: (String) título extremamente conciso.
- type: (String) "credit" ou "debit" (para receitas e despesas).
- date: (String) data no formato YYYY-MM-DD.
- note: (String) detalhes adicionais, se houver.
- category: (String) nome exato da categoria que melhor se aplica.
- confidence: (Number) de 0.0 a 1.0 indicando o quão confiante você está nesta extração e classificação.

Retorne EXCLUSIVAMENTE um array de objetos JSON."""

def extract_transactions(file_base64, categories_str):
    api_key = os.environ.get('GEMINI_API_KEY')
    if not api_key:
        raise Exception("GEMINI_API_KEY is not configured.")
    
    genai.configure(api_key=api_key)
    
    model = genai.GenerativeModel(
        'gemini-3.5-flash',
        system_instruction=get_system_prompt(categories_str),
        generation_config=genai.types.GenerationConfig(temperature=0.1)
    )
    
    if "," in file_base64:
        file_base64 = file_base64.split(",")[1]

    pdf_data = base64.b64decode(file_base64)
    contents = [
        "Extraia as transações deste documento:",
        {
            "mime_type": "application/pdf",
            "data": pdf_data
        }
    ]
    
    response_text = None
    for i in range(MAX_RETRIES):
        try:
            print(f"Attempt {i + 1} of {MAX_RETRIES} to call Gemini API...")
            result = model.generate_content(contents)
            response_text = result.text
            
            replaced_response = response_text.strip().replace("```json", "").replace("```", "")
            return json.loads(replaced_response)
        except Exception as e:
            print(f"Attempt {i + 1} failed: {e}")
            if i < MAX_RETRIES - 1:
                time.sleep(RETRY_DELAY_MS / 1000)
            else:
                raise Exception("Could not parse transactions from statement.") from e
    
    raise Exception("Failed to extract transactions after multiple retries.")

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        send_cors_preflight(self, 'POST, OPTIONS')
    
    def do_POST(self):
        try:
            data = get_request_body(self)
            
            file_base64 = data.get('fileBase64')
            categories_str = data.get('categoriesStr', '')
            
            if not file_base64:
                send_json_response(self, {'error': 'Missing fileBase64.'}, status_code=400, methods='POST, OPTIONS')
                return
            
            transactions = extract_transactions(file_base64, categories_str)
            send_json_response(self, {'data': transactions}, methods='POST, OPTIONS')
            
        except Exception as error:
            print(f"Error processing statement: {error}")
            send_error_response(self, error, methods='POST, OPTIONS')
