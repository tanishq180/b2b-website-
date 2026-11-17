import io
import os
import sys
import unittest
import tempfile
import app as app_module

# Ensure backend directory is in python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app, load_products

class TestSunkaApp(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()
        self.client.testing = True
        self.temp = tempfile.TemporaryDirectory()
        self.original_log = app_module.RFQ_LOG_FILE
        app_module.RFQ_LOG_FILE = os.path.join(self.temp.name, "enquiries.json")
        self.addCleanup(self.temp.cleanup)
        self.addCleanup(setattr, app_module, "RFQ_LOG_FILE", self.original_log)

    def test_homepage(self):
        res = self.client.get('/')
        self.assertEqual(res.status_code, 200)
        self.assertIn(b'SUNKA industrial batteries', res.data)
        self.assertIn(b'main-header', res.data)
        self.assertIn(b'Request Bulk Quote', res.data)

    def test_catalog_page(self):
        res = self.client.get('/catalog')
        self.assertEqual(res.status_code, 200)
        self.assertIn(b'Industrial Battery Catalog', res.data)
        self.assertIn(b'main-header', res.data)

    def test_contact_page(self):
        res = self.client.get('/contact')
        self.assertEqual(res.status_code, 200)
        self.assertIn(b'Contact &amp; Request Bulk Quote', res.data)
        self.assertIn(b'contact-page-form', res.data)
        self.assertIn(b'formspree.io/f/mwlkyyrr', res.data)


    def test_pdp_page(self):
        res = self.client.get('/product/sunka-mr1232bs')
        self.assertEqual(res.status_code, 200)
        self.assertIn(b'SUNKA MR1232BS', res.data)
        self.assertIn(b'1. ELECTRICAL SPECIFICATIONS', res.data)
        self.assertIn(b'specs-table-cta-bar', res.data)
        self.assertIn(b'rfq-modal-overlay', res.data)
        self.assertIn(b'b2b-center-rfq-form', res.data)

    def test_pdp_lithium(self):
        res = self.client.get('/product/sunka-18650-2200')
        self.assertEqual(res.status_code, 200)
        self.assertIn(b'SUNKA 18650-2200', res.data)
        self.assertIn(b'specs-table-cta-bar', res.data)
        self.assertIn(b'rfq-modal-overlay', res.data)

    def test_api_products(self):
        res = self.client.get('/api/products?q=lithium')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data['status'], 'success')
        self.assertGreater(data['count'], 0)

    def test_api_filter(self):
        payload = {
            'chemistry': ['lithium'],
            'voltage': ['3.7'],
            'search': ''
        }
        res = self.client.post('/api/filter', json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data['status'], 'success')
        self.assertGreaterEqual(data['filtered_count'], 1)

    def test_api_filter_categories(self):
        # Removed 48V category has no products
        res = self.client.post('/api/filter', json={'voltage': ['48']})
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data['filtered_count'], 0)

        # Test SLA Battery Filter
        res = self.client.post('/api/filter', json={'chemistry': ['sla']})
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertGreaterEqual(data['filtered_count'], 1)
        self.assertEqual(data['products'][0]['chemistry'], 'SLA')

    def test_api_rfq(self):
        payload = {
            'full_name': 'Test Engineer',
            'company_name': 'Test Power Systems',
            'email': 'engineer@testpower.com',
            'phone': '+1 555-0192',
            'product_model': 'PSL-121000',
            'estimated_qty': 20,
            'application_details': 'UPS Systems',
            'message': 'Testing RFQ flow'
        }
        res = self.client.post('/api/rfq', json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data['status'], 'success')
        self.assertIn('RFQ-', data['quote_id'])
        self.assertIn('timestamp', data)

    def test_api_enquiries(self):
        self.assertEqual(self.client.get('/api/enquiries').status_code, 404)
        self.assertEqual(self.client.get('/api/rfq').status_code, 404)

if __name__ == '__main__':
    unittest.main()
