import os
import json
import uuid
from datetime import datetime
from flask import Flask, render_template, request, jsonify, abort, Response
from werkzeug.utils import secure_filename

# Directory & Path Configurations
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(BACKEND_DIR, '..'))
FRONTEND_DIR = os.path.join(PROJECT_ROOT, 'frontend')
TEMPLATES_DIR = os.path.join(FRONTEND_DIR, 'templates')
STATIC_DIR = os.path.join(FRONTEND_DIR, 'static')

PRODUCTS_FILE = os.path.join(BACKEND_DIR, 'products.json')
RFQ_LOG_FILE = os.path.join(BACKEND_DIR, 'rfq_submissions.json')

app = Flask(
    __name__,
    template_folder=TEMPLATES_DIR,
    static_folder=STATIC_DIR,
    static_url_path='/static'
)
app.secret_key = os.environ.get('SECRET_KEY', 'meri_h_industries_secret_key_2026')

# Load Product Dataset
def load_products():
    if not os.path.exists(PRODUCTS_FILE):
        return []
    with open(PRODUCTS_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

# Storage for RFQ submissions (in-memory demo store & log file)
def save_rfq_submission(submission_data):
    rfqs = []
    if os.path.exists(RFQ_LOG_FILE):
        try:
            with open(RFQ_LOG_FILE, 'r', encoding='utf-8') as f:
                rfqs = json.load(f)
        except Exception:
            rfqs = []

    if not submission_data.get('timestamp'):
        submission_data['timestamp'] = datetime.now().isoformat()

    rfqs.append(submission_data)
    with open(RFQ_LOG_FILE, 'w', encoding='utf-8') as f:
        json.dump(rfqs, f, indent=2)

# Context processor for global metadata
@app.context_processor
def inject_global_data():
    products = load_products()
    chemistries = sorted(list(set(p.get('chemistry') for p in products if p.get('chemistry'))))
    voltages = sorted(list(set(p.get('voltage') for p in products if p.get('voltage') is not None)))
    applications = sorted(list(set(app_item for p in products for app_item in p.get('applications', []))))
    return dict(
        total_products=len(products),
        chemistries=chemistries,
        voltages=voltages,
        applications=applications
    )

# --- WEB PAGE ROUTES ---

@app.route('/')
def index():
    products = load_products()
    featured_products = products[:4]
    return render_template('index.html', featured_products=featured_products)

@app.route('/catalog')
def catalog():
    return render_template('catalog.html')

@app.route('/product/<product_id>')
def product_detail(product_id):
    products = load_products()
    product = next((p for p in products if p['id'] == product_id.lower()), None)
    if not product:
        abort(404)
    
    # Related products (same chemistry or application)
    related_products = [
        p for p in products 
        if p['id'] != product['id'] and (p['chemistry'] == product['chemistry'] or any(app_item in product.get('applications', []) for app_item in p.get('applications', [])))
    ][:3]
    
    return render_template('product-detail.html', product=product, related_products=related_products)

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/contact')
def contact():
    return render_template('contact.html')

@app.route('/download/catalog-pdf')
def download_catalog_pdf():
    pdf_content = (
        "%PDF-1.4\n"
        "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n"
        "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n"
        "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj\n"
        "4 0 obj << /Length 220 >> stream\n"
        "BT\n"
        "/F1 24 Tf\n"
        "50 720 Td (MERI INDUSTRIES - 2026 PRODUCT CATALOG) Tj\n"
        "/F1 12 Tf\n"
        "0 -40 Td (Complete Technical Specification Guide for SLA and Lithium Batteries) Tj\n"
        "0 -30 Td (Official B2B Engineering Specification Manual) Tj\n"
        "ET\n"
        "endstream\n"
        "endobj\n"
        "5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n"
        "xref\n0 6\n"
        "0000000000 65535 f \n"
        "0000000009 00000 n \n"
        "0000000058 00000 n \n"
        "0000000115 00000 n \n"
        "0000000261 00000 n \n"
        "0000000532 00000 n \n"
        "trailer << /Size 6 /Root 1 0 R >>\n"
        "startxref\n605\n%%EOF\n"
    )
    response = Response(pdf_content, mimetype='application/pdf')
    response.headers['Content-Disposition'] = 'attachment; filename=MERI-Industries-2026-Product-Catalog.pdf'
    return response

# --- REST API ENDPOINTS ---

@app.route('/api/products', methods=['GET'])
def get_products():
    products = load_products()
    query = request.args.get('q', '').strip().lower()
    
    if query:
        products = [
            p for p in products 
            if query in p.get('model', '').lower() or 
               query in p.get('title', '').lower() or 
               query in p.get('chemistry', '').lower() or
               query in str(p.get('voltage', '')) or
               any(query in app_item.lower() for app_item in p.get('applications', []))
        ]
        
    return jsonify({
        'status': 'success',
        'count': len(products),
        'products': products
    })

@app.route('/api/products/<product_id>', methods=['GET'])
def get_product_by_id(product_id):
    products = load_products()
    product = next((p for p in products if p['id'] == product_id.lower()), None)
    if not product:
        return jsonify({'status': 'error', 'message': 'Product not found'}), 404
    return jsonify({'status': 'success', 'product': product})

@app.route('/api/filter', methods=['POST'])
def filter_products():
    data = request.get_json() or {}
    products = load_products()
    
    selected_chemistries = data.get('chemistry', [])
    selected_voltages = [float(v) for v in data.get('voltage', []) if v]
    selected_capacity_buckets = data.get('capacity', [])
    selected_terminals = data.get('terminal', [])
    selected_applications = data.get('applications', [])
    search_query = data.get('search', '').strip().lower()
    
    filtered = []
    for p in products:
        # Filter by chemistry
        if selected_chemistries and p.get('chemistry_code') not in selected_chemistries and p.get('chemistry') not in selected_chemistries:
            continue
            
        # Filter by voltage nominal range
        if selected_voltages:
            p_volt = float(p.get('voltage', 0))
            voltage_matched = False
            for v in selected_voltages:
                if v == 4 and 3.5 <= p_volt <= 4.5:
                    voltage_matched = True
                elif v == 6 and 5.0 <= p_volt <= 7.0:
                    voltage_matched = True
                elif v == 12 and 11.5 <= p_volt <= 13.5:
                    voltage_matched = True
                elif v == 48 and 40.0 <= p_volt <= 55.0:
                    voltage_matched = True
                elif abs(p_volt - v) < 0.5:
                    voltage_matched = True
            if not voltage_matched:
                continue
            
        # Filter by capacity bucket
        if selected_capacity_buckets:
            p_cap_bucket = str(p.get('capacity_bucket', ''))
            p_cap_val = f"{p.get('capacity_ah')}Ah"
            if p_cap_bucket not in selected_capacity_buckets and p_cap_val not in selected_capacity_buckets:
                continue
            
        # Filter by terminal type code
        if selected_terminals and p.get('terminal_code') not in selected_terminals:
            continue
            
        # Filter by application
        if selected_applications and not any(app_item in selected_applications for app_item in p.get('applications', [])):
            continue
            
        # Search keyword
        if search_query:
            match_model = search_query in p.get('model', '').lower()
            match_title = search_query in p.get('title', '').lower()
            match_chem = search_query in p.get('chemistry', '').lower()
            match_apps = any(search_query in app_item.lower() for app_item in p.get('applications', []))
            if not (match_model or match_title or match_chem or match_apps):
                continue
                
        filtered.append(p)
        
    return jsonify({
        'status': 'success',
        'total_count': len(products),
        'filtered_count': len(filtered),
        'products': filtered
    })

@app.route('/api/rfq', methods=['POST'])
def submit_rfq():
    data = request.get_json() or request.form
    
    # Required Fields
    full_name = data.get('full_name', '').strip()
    company_name = data.get('company_name', '').strip()
    email = data.get('email', '').strip()
    phone = data.get('phone', '').strip()
    
    if not full_name or not company_name or not email:
        return jsonify({
            'status': 'error',
            'message': 'Please fill in all required fields (Full Name, Company, Email).'
        }), 400
        
    quote_id = f"RFQ-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
    
    rfq_payload = {
        'quote_id': quote_id,
        'timestamp': datetime.now().isoformat(),
        'full_name': full_name,
        'company_name': company_name,
        'email': email,
        'phone': phone,
        'gstin_tax_id': data.get('gstin_tax_id', '').strip(),
        'items': data.get('items', []),
        'product_model': data.get('product_model', '').strip(),
        'estimated_qty': data.get('estimated_qty', '1'),
        'application_details': data.get('application_details', '').strip(),
        'message': data.get('message', '').strip()
    }
    
    save_rfq_submission(rfq_payload)
    
    return jsonify({
        'status': 'success',
        'quote_id': quote_id,
        'timestamp': rfq_payload['timestamp'],
        'message': f'Thank you {full_name}. Your B2B Quote Request ({quote_id}) has been received. Our application engineer will reach out within 2 business hours.'
    })

@app.route('/api/rfq', methods=['GET'])
@app.route('/api/enquiries', methods=['GET'])
def get_rfq_submissions():
    if not os.path.exists(RFQ_LOG_FILE):
        return jsonify({'status': 'success', 'count': 0, 'submissions': []})
    try:
        with open(RFQ_LOG_FILE, 'r', encoding='utf-8') as f:
            rfqs = json.load(f)
        return jsonify({'status': 'success', 'count': len(rfqs), 'submissions': rfqs})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.errorhandler(404)
def page_not_found(e):
    return render_template('layout.html', custom_body="""
    <div class="container py-5 text-center my-5">
        <h1 class="display-3 text-navy font-weight-bold">404</h1>
        <h2>Technical Specification Page Not Found</h2>
        <p class="lead text-muted">The battery model or technical page you requested does not exist in our active catalog.</p>
        <a href="/catalog" class="btn btn-accent mt-3 px-4 py-2">Explore Battery Catalog</a>
    </div>
    """), 404

if __name__ == '__main__':
    print("Starting MERI Industries B2B Server on http://127.0.0.1:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)
