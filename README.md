# MERI Industries — B2B Industrial Battery Platform

**Project Release Date**: August 18, 2026  
**Architecture**: Python Flask Backend, REST APIs, Semantic HTML5, Modular CSS3, Vanilla ES6 JavaScript, JSON Specs DB.

---

## 📅 Summary of Development Work Completed Today (August 18, 2026)

Today, we built a complete, high-trust, responsive B2B industrial battery web application modeled after modern industrial energy sites like Power-Sonic, custom-tailored for **MERI H Industries**.

### 1. Branding & Header Navigation
- **Company Branding**: Integrated the official **MERI H Industries** logo in the sticky main navigation bar with clean brand text (`MERI INDUSTRIES`).
- **Streamlined Navigation**: Clean top header containing `Home`, `Contact`, `Battery Catalog PDF 📥` (with direct PDF spec download), and `Request Bulk Quote`.
- **Live Search Autocomplete**: Header search bar offering instant model and spec suggestions via `/api/products?q=...`.

### 2. Specialized Technical Battery Catalog & Data Engine
- **Custom Chemistry Dataset (`products.json`)**: Configured technical specifications across key industrial battery chemistries:
  - **SLA** (Sealed Lead Acid AGM)
  - **Lithium** (LiFePO4 Smart Battery Packs)
  - **Graphene** (Next-Gen High Conductivity Graphene Batteries)
- **Specific Voltage Buckets**: Filterable by **4V**, **6V**, and **12V** nominal voltages.
- **Specific Capacity Ratings**: Sized for **2.8 Ah**, **9 Ah**, and **9.5 Ah** capacities.
- **Terminal Options**: Filterable by industrial **Faston F1 (0.187")** and **Faston F2 (0.250")** terminals.

### 3. Interactive Filtering & Direct PDF Download
- **Dynamic Filter Sidebar**: Live client-side and server-side AJAX filtering via `/api/filter` endpoint without page reloads.
- **Direct Catalog PDF Download**: Added `/download/catalog-pdf` route that streams the official 2026 Technical Specification Guide PDF (`MERI-Industries-2026-Product-Catalog.pdf`) directly upon clicking the header button.

### 4. Technical Product Detail Pages (PDP)
- **Specs Breakdown Table**: Includes complete electrical parameters (nominal voltage, capacity 20hr rate, internal resistance mΩ, max discharge current A, cycle life), mechanical parameters (L x W x H in mm & inches, weight in kg & lbs, UL94 case material), and temperature ranges.
- **CAD & Visual Gallery**: Product cutout views and CAD dimension schematics.
- **Datasheet Downloads**: Buttons for PDF Datasheets and Material Safety Data Sheets (SDS).

### 5. B2B Request for Quote (RFQ) System
- **Inquiry Modal**: B2B quote submission collecting company details, GSTIN/Tax ID, quantity requirements, and custom technical requirements.
- **Backend Logging**: Generates unique quote tracking IDs (`RFQ-YYYYMMDD-XXXXXX`) logged to `rfq_submissions.json`.

### 6. Automated Testing & Version Control
- **Backend Unit Tests (`test_routes.py`)**: 7/7 test suites passing (Homepage, Catalog, PDP, Filter API, RFQ API).
- **Git Initialization**: Created `.gitignore`, initialized local repository, and created the initial commit ready for GitHub deployment.

---

## 🛠️ Technology Stack

- **Backend**: Python 3.14, Flask, Jinja2
- **Frontend**: HTML5, Vanilla CSS3 (Custom Design Tokens), ES6 JavaScript
- **Data Engine**: JSON Specifications Database (`products.json`)
- **Testing**: Python `unittest` framework

---

## 🚀 How to Run the Application Locally

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the Development Server**:
   ```bash
   python app.py
   ```

3. **Access in Browser**:
   - 🏠 **Homepage**: `http://127.0.0.1:5000/`
   - 🔋 **Battery Catalog**: `http://127.0.0.1:5000/catalog`
   - ✉️ **Contact & Support**: `http://127.0.0.1:5000/contact`

4. **Run Automated Unit Tests**:
   ```bash
   python test_routes.py
   ```

---

