from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from api._utils import send_cors_preflight, send_text_response

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """Handle CORS preflight request"""
        send_cors_preflight(self, 'GET, OPTIONS')
    
    def do_GET(self):
        """Handle GET request"""
        # Parse query parameters
        parsed_path = urlparse(self.path)
        query_params = parse_qs(parsed_path.query)
        name = query_params.get('name', ['mundo'])[0]
        
        # Send response
        message = f"Olá, {name}!"
        send_text_response(self, message, methods='GET, OPTIONS')
