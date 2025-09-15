#!/usr/bin/env python3
"""
Simple HTTP server for the handwriting generation API
"""

import json
import os
import sys
import tempfile
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import logging

# Add the current directory to Python path to import our modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from demo import Hand
except ImportError as e:
    print(f"Error importing demo module: {e}")
    print("Make sure you have all required dependencies installed:")
    print("pip install -r requirements.txt")
    sys.exit(1)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class HandwritingHandler(BaseHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        # Initialize the handwriting model once
        if not hasattr(HandwritingHandler, '_hand_model'):
            logger.info("Initializing handwriting model...")
            try:
                HandwritingHandler._hand_model = Hand()
                logger.info("Model initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize model: {e}")
                HandwritingHandler._hand_model = None
        
        super().__init__(*args, **kwargs)

    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        """Handle GET requests"""
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/':
            self.send_response(200)
            self.send_header('Content-Type', 'text/html')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            html = """
            <!DOCTYPE html>
            <html>
            <head>
                <title>Handwriting Generation API</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; }
                    .status { padding: 20px; border-radius: 5px; margin: 20px 0; }
                    .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; }
                    .error { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; }
                </style>
            </head>
            <body>
                <h1>Handwriting Generation API Server</h1>
                <p>This server provides an API for generating handwritten text using AI.</p>
                
                <div class="status success">
                    <strong>✓ Server is running</strong><br>
                    Port: 8001<br>
                    Model status: """ + ("Loaded" if self._hand_model else "Failed to load") + """
                </div>
                
                <h2>API Endpoints:</h2>
                <ul>
                    <li><strong>POST /generate</strong> - Generate handwriting from text</li>
                    <li><strong>GET /health</strong> - Check server health</li>
                </ul>
                
                <h2>Usage:</h2>
                <p>Send a POST request to <code>/generate</code> with JSON data:</p>
                <pre>{
  "lines": ["Hello", "World"],
  "biases": [0.7, 0.7],
  "styles": [7, 7],
  "stroke_colors": ["#000000", "#000000"],
  "stroke_widths": [2, 2],
  "filename": "output.svg"
}</pre>
            </body>
            </html>
            """
            self.wfile.write(html.encode())
            
        elif parsed_path.path == '/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            health_data = {
                'status': 'healthy',
                'model_loaded': self._hand_model is not None
            }
            self.wfile.write(json.dumps(health_data).encode())
            
        else:
            self.send_error(404, "Not Found")

    def do_POST(self):
        """Handle POST requests"""
        if self.path == '/generate':
            self.handle_generate_request()
        else:
            self.send_error(404, "Not Found")

    def handle_generate_request(self):
        """Handle handwriting generation requests"""
        try:
            # Check if model is loaded
            if not self._hand_model:
                self.send_error_response(500, "Handwriting model not loaded")
                return

            # Parse request data
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data.decode('utf-8'))
            except json.JSONDecodeError:
                self.send_error_response(400, "Invalid JSON data")
                return

            # Validate required fields
            required_fields = ['lines', 'biases', 'styles', 'stroke_colors', 'stroke_widths', 'filename']
            for field in required_fields:
                if field not in data:
                    self.send_error_response(400, f"Missing required field: {field}")
                    return

            lines = data['lines']
            biases = data['biases']
            styles = data['styles']
            stroke_colors = data['stroke_colors']
            stroke_widths = data['stroke_widths']
            filename = data['filename']

            # Validate data
            if not lines or len(lines) == 0:
                self.send_error_response(400, "Lines cannot be empty")
                return

            if not all(len(line) <= 75 for line in lines):
                self.send_error_response(400, "Each line must be 75 characters or less")
                return

            # Ensure all arrays have the same length
            expected_length = len(lines)
            if not all(len(arr) == expected_length for arr in [biases, styles, stroke_colors, stroke_widths]):
                self.send_error_response(400, "All arrays must have the same length as lines")
                return

            logger.info(f"Generating handwriting for {len(lines)} lines")

            # Create temporary file for output
            with tempfile.NamedTemporaryFile(mode='w', suffix='.svg', delete=False) as temp_file:
                temp_filename = temp_file.name

            try:
                # Generate handwriting
                self._hand_model.write(
                    filename=temp_filename,
                    lines=lines,
                    biases=biases,
                    styles=styles,
                    stroke_colors=stroke_colors,
                    stroke_widths=stroke_widths
                )

                # Read the generated SVG
                with open(temp_filename, 'r', encoding='utf-8') as f:
                    svg_content = f.read()

                # Send response
                self.send_response(200)
                self.send_header('Content-Type', 'image/svg+xml')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(svg_content.encode('utf-8'))

                logger.info("Handwriting generated successfully")

            finally:
                # Clean up temporary file
                if os.path.exists(temp_filename):
                    os.unlink(temp_filename)

        except Exception as e:
            logger.error(f"Error generating handwriting: {e}")
            self.send_error_response(500, f"Internal server error: {str(e)}")

    def send_error_response(self, code, message):
        """Send JSON error response"""
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        error_data = {'error': message}
        self.wfile.write(json.dumps(error_data).encode())

    def log_message(self, format, *args):
        """Override to use our logger"""
        logger.info(f"{self.address_string()} - {format % args}")

def run_server(port=8001):
    """Run the HTTP server"""
    server_address = ('', port)
    httpd = HTTPServer(server_address, HandwritingHandler)
    
    logger.info(f"Starting handwriting generation server on port {port}")
    logger.info(f"Server URL: http://localhost:{port}")
    logger.info("Press Ctrl+C to stop the server")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        logger.info("Server stopped by user")
        httpd.server_close()

if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Handwriting Generation API Server')
    parser.add_argument('--port', type=int, default=8001, help='Port to run the server on (default: 8001)')
    args = parser.parse_args()
    
    run_server(args.port)