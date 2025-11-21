from http.server import BaseHTTPRequestHandler
import os
import json
import http.client
from api._utils import send_cors_preflight, send_json_response, send_error_response, get_request_body

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """Handle CORS preflight request"""
        send_cors_preflight(self, 'POST, OPTIONS')
    
    def do_POST(self):
        """Handle POST request to dispatch GitHub Action"""
        try:
            # Get environment variables
            github_token = os.environ.get('GITHUB_TOKEN')
            github_repo_owner = os.environ.get('GITHUB_REPO_OWNER')
            github_repo_name = os.environ.get('GITHUB_REPO_NAME')
            
            # Validate configuration
            if not github_token or not github_repo_owner or not github_repo_name:
                send_error_response(
                    self, 
                    Exception('GitHub configuration is missing. Check environment variables.'),
                    status_code=500,
                    methods='POST, OPTIONS'
                )
                return
            
            # Parse request body
            body = get_request_body(self)
            symbol = body.get('symbol')
            range_value = body.get('range', 'max')
            
            # Validate required parameters
            if not symbol:
                send_error_response(
                    self,
                    Exception('Missing required parameter: symbol'),
                    status_code=400,
                    methods='POST, OPTIONS'
                )
                return
            
            # Prepare GitHub API request
            conn = http.client.HTTPSConnection('api.github.com')
            
            payload = json.dumps({
                'event_type': 'fetch-historical-data',
                'client_payload': {
                    'symbol': symbol,
                    'range': range_value
                }
            })
            
            headers = {
                'Accept': 'application/vnd.github.v3+json',
                'Authorization': f'token {github_token}',
                'Content-Type': 'application/json',
                'User-Agent': 'Finance-Tracker-App'
            }
            
            # Make request to GitHub
            path = f'/repos/{github_repo_owner}/{github_repo_name}/dispatches'
            conn.request('POST', path, payload, headers)
            
            # Get response
            response = conn.getresponse()
            
            # GitHub returns 204 No Content on success
            if response.status == 204:
                send_json_response(
                    self,
                    {
                        'success': True,
                        'message': f'GitHub Action dispatched successfully for {symbol}',
                        'symbol': symbol,
                        'range': range_value
                    },
                    status_code=200,
                    methods='POST, OPTIONS'
                )
            else:
                response_data = response.read().decode('utf-8')
                send_error_response(
                    self,
                    Exception(f'GitHub API error: {response.status} - {response_data}'),
                    status_code=response.status,
                    methods='POST, OPTIONS'
                )
            
            conn.close()
            
        except Exception as e:
            send_error_response(self, e, methods='POST, OPTIONS')
