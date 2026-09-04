import io
import os
import sys
import unittest

# Ensure backend directory is in python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app, load_products

class TestSunkaApp(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()
        self.client.testing = True

    def test_homepage(self):
        res = self.client.get('/')
        self.assertEqual(res.status_code, 200)
        self.assertIn(b'Engineered Energy Solutions', res.data)
        self.assertIn(b'main-header', res.data)
        self.assertIn(b'Request Bulk Quote', res.data)

    def test_catalog_page(self):
        res = self.client.get('/catalog')
        self.assertEqual(res.status_code, 200)
        self.assertIn(b'Industrial Battery Catalog', res.data)
        self.assertIn(b'main-header', res.data)

    def test_pdp_page(self):
        res = self.client.get('/product/ps-1295')
        self.assertEqual(res.status_code, 200)
        self.assertIn(b'PS-1295 F2', res.data)
        self.assertIn(b'1. ELECTRICAL SPECIFICATIONS', res.data)

    def test_pdp_lithium(self):
        res = self.client.get('/product/psl-1290')
        self.assertEqual(res.status_code, 200)
        self.assertIn(b'PSL-1290 Smart', res.data)

    def test_api_products(self):
        res = self.client.get('/api/products?q=lithium')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data['status'], 'success')
        self.assertGreater(data['count'], 0)

    def test_api_filter(self):
        payload = {
            'chemistry': ['lithium'],
            'voltage': ['12'],
            'search': ''
        }
        res = self.client.post('/api/filter', json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data['status'], 'success')
        self.assertGreaterEqual(data['filtered_count'], 1)

    def test_api_filter_categories(self):
        # Test 48V Telecom Category (Lithium PSL-48100)
        res = self.client.post('/api/filter', json={'voltage': ['48']})
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data['filtered_count'], 1)

        # Test Gel Battery Filter
        res = self.client.post('/api/filter', json={'chemistry': ['gel']})
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertGreaterEqual(data['filtered_count'], 1)
        self.assertEqual(data['products'][0]['chemistry'], 'Gel')

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

if __name__ == '__main__':
    unittest.main()
