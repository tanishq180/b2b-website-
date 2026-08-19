import unittest
from app import app

class TestPowerSonicApp(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()
        self.client.testing = True

    def test_homepage(self):
        res = self.client.get('/')
        self.assertEqual(res.status_code, 200)
        self.assertIn(b'Engineered Energy Solutions', res.data)

    def test_catalog_page(self):
        res = self.client.get('/catalog')
        self.assertEqual(res.status_code, 200)
        self.assertIn(b'Industrial Battery Catalog', res.data)

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
        # Test 48V Rackmount Telecom Lithium
        res = self.client.post('/api/filter', json={'voltage': ['48']})
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data['filtered_count'], 1)
        self.assertEqual(data['products'][0]['id'], 'psl-48100')

        # Test High Rate UPS
        res = self.client.post('/api/filter', json={'chemistry': ['high_rate']})
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertGreaterEqual(data['filtered_count'], 2)

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

    def test_admin_flow(self):
        # 1. Unauthenticated access should redirect to login
        res = self.client.get('/admin')
        self.assertEqual(res.status_code, 302)
        self.assertIn('/admin/login', res.headers['Location'])

        # 2. Login Page GET
        res = self.client.get('/admin/login')
        self.assertEqual(res.status_code, 200)
        self.assertIn(b'Admin Control Portal', res.data)

        # 3. Invalid credentials POST
        res = self.client.post('/admin/login', data={'username': 'admin', 'password': 'wrongpassword'})
        self.assertEqual(res.status_code, 200)
        self.assertIn(b'Invalid username or password', res.data)

        # 4. Valid credentials POST
        res = self.client.post('/admin/login', data={'username': 'admin', 'password': 'meri2026'}, follow_redirects=True)
        self.assertEqual(res.status_code, 200)
        self.assertIn(b'Battery Product Manager', res.data)

        # 5. Add Product via Admin Portal
        add_payload = {
            'model': 'TEST-BAT-123',
            'title': '12V 50Ah Test Battery',
            'chemistry': 'Lithium',
            'voltage': '12',
            'capacity_ah': '50',
            'terminal_type': 'M6',
            'weight_kg': '5.5',
            'moq': '5',
            'lead_time': 'In Stock',
            'description': 'Test admin battery product creation'
        }
        res = self.client.post('/admin/product/add', data=add_payload, follow_redirects=True)
        self.assertEqual(res.status_code, 200)
        self.assertIn(b'TEST-BAT-123', res.data)

        # 6. Delete Product via Admin Portal
        res = self.client.post('/admin/product/delete/test-bat-123', follow_redirects=True)
        self.assertEqual(res.status_code, 200)
        self.assertNotIn(b'test-bat-123', res.data)

if __name__ == '__main__':
    unittest.main()
