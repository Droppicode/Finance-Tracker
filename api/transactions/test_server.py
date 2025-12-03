import sys
import os
from http.server import HTTPServer

# Add project root to path to allow relative imports
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.append(project_root)

from api.transactions.classifyTransactions import handler

def run(server_class=HTTPServer, handler_class=handler, port=8002):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f'Starting test server for classifyTransactions on http://localhost:{port}...')
    httpd.serve_forever()

if __name__ == "__main__":
    run()
