from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import os, webbrowser, threading
root=Path(__file__).resolve().parent
os.chdir(root)
url="http://127.0.0.1:8765/index.html"
threading.Timer(1.0, lambda: webbrowser.open(url)).start()
print("Knaus Companion Ultimate is running at", url)
print("Press Ctrl+C to stop.")
ThreadingHTTPServer(("0.0.0.0",8765),SimpleHTTPRequestHandler).serve_forever()
