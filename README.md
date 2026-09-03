# MERI Industries — B2B Industrial Battery Platform

**Architecture**: Modular Decoupled Architecture (Python Flask Backend, REST APIs, Semantic HTML5, Modular CSS3, ES6 JavaScript, JSON Database).

---

## 📁 Project Structure

```text
Website Creation/
├── frontend/                     # Dedicated Frontend Workspace
│   ├── static/                  # Static Assets
│   │   ├── css/
│   │   │   └── styles.css       # Core design tokens, theme & component styling
│   │   ├── js/
│   │   │   └── main.js          # Interactive filtering, autocomplete & modal logic
│   │   └── images/              # Product photography, schematics & company branding
│   │       ├── products/
│   │       ├── meri_logo.png
│   │       └── ...
│   └── templates/               # Jinja2 HTML5 Templates
│       ├── layout.html          # Base template with header, RFQ modal & footer
│       ├── index.html           # Homepage with hero & featured products
│       ├── catalog.html         # Interactive battery catalog & filter engine
│       ├── product-detail.html  # Technical PDP with engineering specs & CAD
│       ├── about.html           # Company engineering & QA standards
│       └── contact.html         # Engineering contact & support inquiry
│
├── backend/                      # Dedicated Backend Workspace
│   ├── app.py                   # Flask server, routing & REST API endpoints
│   ├── products.json            # Battery catalog database & specifications
│   ├── rfq_submissions.json     # B2B RFQ quote logs and inquiry store
│   ├── requirements.txt         # Backend Python dependencies
│   └── test_routes.py           # Automated unit test suite
│
├── run.py                        # Root server launcher
├── requirements.txt              # Root dependency reference
└── README.md                     # Documentation
```

---

## 🚀 How to Run the Application

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Start the Server
You can launch the server using either method:
```bash
# Method A: From project root
python run.py

# Method B: Directly from backend
python backend/app.py
```

### 3. Access in Browser
- 🏠 **Homepage**: [http://127.0.0.1:5000/](http://127.0.0.1:5000/)
- 🔋 **Battery Catalog**: [http://127.0.0.1:5000/catalog](http://127.0.0.1:5000/catalog)
- ✉️ **Contact & Inquiries**: [http://127.0.0.1:5000/contact](http://127.0.0.1:5000/contact)

---

## 🧪 Running Automated Tests

To run the backend test suite:
```bash
python backend/test_routes.py
```
*(All 8 test suites verifying catalog routes, filtering algorithms, REST endpoints, and RFQ submissions)*

---

## 📡 REST API Endpoints

- `GET /api/products` — Fetch all products or query via `?q=<term>`
- `GET /api/products/<product_id>` — Fetch detailed specs for a specific battery model
- `POST /api/filter` — Multi-dimensional filter (chemistry, voltage, capacity, terminal, applications)
- `POST /api/rfq` — Submit B2B Request for Quote
- `GET /download/catalog-pdf` — Direct download for the 2026 Technical Specification Guide PDF
