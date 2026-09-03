"""
MERI Industries B2B Platform - Main Server Launcher
Runs the Flask application with separated frontend and backend directories.
"""
import sys
import os

# Add backend directory to path
backend_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend')
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from app import app

if __name__ == '__main__':
    print("=======================================================")
    print("Starting MERI Industries B2B Industrial Battery Server")
    print("   Frontend: ./frontend (Templates & Static Assets)")
    print("   Backend:  ./backend  (Flask App, APIs & Data)")
    print("   URL:      http://127.0.0.1:5000")
    print("=======================================================")
    app.run(host='0.0.0.0', port=5000, debug=True)
