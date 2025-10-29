import PyPDF2
import google.generativeai as genai
import os
import json
import re

def extract_text_from_pdf(file):
    reader = PyPDF2.PdfReader(file)
    text = ""
    for page in reader.pages:
        text += page.extract_text()
    return text

def extract_transactions_from_text(text):
    genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

    model = genai.GenerativeModel('gemini-2.5-flash') # Dont change the model

    prompt = f"""
    You are an expert in extracting transaction information from bank statements.
    Given the text from a bank statement, extract the following information for each transaction:
    - Date
    - Description (the name of the establishment)
    - Amount
    - Type (credit or debit)
    - Category in Portuguese (e.g., Alimentação, Transporte, Lazer, Salário, etc.)

    **Important**: The descriptions must be kept in Portuguese and should be short and direct.

    Return the information in a JSON format, as a list of objects.
    For example:
    [
        {{
            "date": "2023-10-26",
            "description": "Supermercado Pague Menos",
            "amount": 345.60,
            "type": "debit",
            "category": "Alimentação"
        }},
        {{
            "date": "2023-10-27",
            "description": "Posto Shell Av. Central",
            "amount": 150.00,
            "type": "debit",
            "category": "Transporte"
        }},
        {{
            "date": "2023-10-28",
            "description": "Depósito de Salário",
            "amount": 5000.00,
            "type": "credit",
            "category": "Salário"
        }}
    ]

    Bank statement text:
    {text}
    """

    response = model.generate_content(prompt)
    
    # Clean the response to get only the JSON
    cleaned_response = response.text.strip().replace('```json', '').replace('```', '')
    
    try:
        transactions = json.loads(cleaned_response)
    except json.JSONDecodeError:
        # If the direct parsing fails, try to find the JSON within the text
        match = re.search(r'\[.*\]', cleaned_response, re.DOTALL)
        if match:
            transactions = json.loads(match.group(0))
        else:
            raise ValueError("Could not parse JSON from the response.")

    return transactions
