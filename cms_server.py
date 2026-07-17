#!/usr/bin/env python3
"""
cms_server.py - Zero-overhead Local Visual CMS Server for Antigravity Pair-Programming
Runs on http://localhost:4000 and manages cms_queue.json seamlessly.
"""

import os
import json
import time
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse

PORT = 4000
QUEUE_FILE = "cms_queue.json"

class CMSServerHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/cms/list":
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.end_headers()
            try:
                if os.path.exists(QUEUE_FILE):
                    with open(QUEUE_FILE, "r", encoding="utf-8") as f:
                        data = json.load(f)
                else:
                    data = {"pending_edits": []}
            except Exception as e:
                data = {"pending_edits": [], "error": str(e)}
            self.wfile.write(json.dumps(data).encode("utf-8"))
            return
        
        # Default redirect / to /editor.html if requested directly
        if parsed.path == "/":
            self.path = "/editor.html"
            
        return super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        
        # Add item to queue
        if parsed.path == "/api/cms/add":
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length).decode('utf-8')
            try:
                new_item = json.loads(post_data)
                new_item['timestamp'] = time.strftime('%Y-%m-%d %H:%M:%S')
                new_item['id'] = f"cms_{int(time.time())}_{len(new_item.get('target', 'edit'))}"
                new_item['status'] = "PENDING"

                data = {"pending_edits": []}
                if os.path.exists(QUEUE_FILE):
                    with open(QUEUE_FILE, "r", encoding="utf-8") as f:
                        try:
                            data = json.load(f)
                        except Exception:
                            data = {"pending_edits": []}
                
                if "pending_edits" not in data or not isinstance(data["pending_edits"], list):
                    data["pending_edits"] = []
                    
                data["pending_edits"].append(new_item)
                
                with open(QUEUE_FILE, "w", encoding="utf-8") as f:
                    json.dump(data, f, indent=2)

                self.send_response(200)
                self.send_header("Content-type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": True, "item": new_item, "total_pending": len(data["pending_edits"])}).encode("utf-8"))
            except Exception as e:
                self.send_response(500)
                self.send_header("Content-type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": str(e)}).encode("utf-8"))
            return

        # Clear queue
        if parsed.path == "/api/cms/clear":
            try:
                data = {"pending_edits": []}
                with open(QUEUE_FILE, "w", encoding="utf-8") as f:
                    json.dump(data, f, indent=2)
                self.send_response(200)
                self.send_header("Content-type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": True}).encode("utf-8"))
            except Exception as e:
                self.send_response(500)
                self.send_header("Content-type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": str(e)}).encode("utf-8"))
            return

        self.send_response(404)
        self.end_headers()

def run_server():
    print(f"============================================================")
    print(f"🚀 Visual CMS Server Running at: http://localhost:{PORT}/editor.html")
    print(f"📁 Managing Local Queue File: {QUEUE_FILE}")
    print(f"============================================================")
    server_address = ('', PORT)
    httpd = HTTPServer(server_address, CMSServerHandler)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping Visual CMS Server.")
        httpd.server_close()

if __name__ == '__main__':
    run_server()
