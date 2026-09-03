"""
MERI Industries B2B Platform
Root wrapper delegating to backend/app.py
"""
import sys
import os

backend_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend')
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from app import app, load_products, save_rfq_submission

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
