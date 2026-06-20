import unittest
import os
import tempfile
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash

# Set testing environment variables
os.environ['DATABASE_URL'] = ':memory:'

import database
import models
from app import app

class GustoItalianoTestCase(unittest.TestCase):
    
    def setUp(self):
        # 1. Setup temporary database file path
        self.db_fd, self.db_path = tempfile.mkstemp()
        database.DB_PATH = self.db_path
        
        # Override the models connection path too since it imports from database
        def get_test_conn():
            conn = sqlite3.connect(self.db_path)
            conn.row_factory = sqlite3.Row
            return conn
        models.get_db_connection = get_test_conn
        
        # Initialize the test database schema
        database.init_db()
        
        # 2. Configure Flask App for testing
        app.config['TESTING'] = True
        app.config['WTF_CSRF_ENABLED'] = False
        self.app = app.test_client()
        
    def tearDown(self):
        # Clean up database file
        os.close(self.db_fd)
        os.unlink(self.db_path)

    # --- Database Schema Tests ---
    
    def test_database_creation(self):
        # Verify that all tables are created successfully
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [t[0] for t in cursor.fetchall()]
        conn.close()
        
        self.assertIn('users', tables)
        self.assertIn('menu_items', tables)
        self.assertIn('orders', tables)
        self.assertIn('order_items', tables)
        self.assertIn('reservations', tables)
        self.assertIn('reviews', tables)
        self.assertIn('coupons', tables)
        self.assertIn('loyalty_points', tables)
        self.assertIn('newsletter_subscribers', tables)
        self.assertIn('contact_submissions', tables)

    # --- Authentication Tests ---

    def test_user_creation_and_auth(self):
        # Test creating user and checking password hash
        email = "test@example.com"
        pwd = "testpassword123"
        user_id = models.create_user(email, pwd, "Test User", "+12345678")
        self.assertIsNotNone(user_id)
        
        # Verify authenticated user returns the Row object
        user = models.authenticate_user(email, pwd)
        self.assertIsNotNone(user)
        self.assertEqual(user['email'], email)
        
        # Verify auth fails with wrong password
        fail_user = models.authenticate_user(email, "wrongpassword")
        self.assertIsNone(fail_user)

    # --- Menu CRUD Tests ---

    def test_menu_crud(self):
        # Create an item
        item_id = models.add_menu_item(
            "Test Pizza", "A mock test Neapolitan pizza", "italian", 
            12.50, "Flour, Yeast, Tomato", "/static/images/test.png", 0, 1
        )
        self.assertIsNotNone(item_id)
        
        # Read the item
        item = models.get_menu_item_by_id(item_id)
        self.assertIsNotNone(item)
        self.assertEqual(item['name'], "Test Pizza")
        
        # Update the item
        models.update_menu_item(
            item_id, "Updated Pizza", "New mock description", "italian",
            14.00, "Flour, Tomato, Basil", "/static/images/test.png", 1, 1
        )
        updated_item = models.get_menu_item_by_id(item_id)
        self.assertEqual(updated_item['name'], "Updated Pizza")
        self.assertEqual(updated_item['price'], 14.00)
        self.assertEqual(updated_item['is_popular'], 1)
        
        # Delete the item
        models.delete_menu_item(item_id)
        deleted_item = models.get_menu_item_by_id(item_id)
        self.assertIsNone(deleted_item)

    # --- Cart, Coupon, and Order System Tests ---

    def test_coupon_calculations(self):
        # Seed test menu item
        models.add_menu_item("Gourmet Burger", "Burger desc", "fastfood", 15.00, "Beef, Bun", "/static/img.png", 0, 1)
        
        # Add test coupons
        models.add_coupon("SAVE10", "percentage", 10.0, 10.0, "2028-12-31")
        models.add_coupon("FLAT5", "flat", 5.0, 20.0, "2028-12-31")
        
        # Check valid percentage coupon
        response = self.app.post('/api/order/coupon', json={"code": "SAVE10", "subtotal": 20.0})
        data = response.get_json()
        self.assertEqual(response.status_code, 200)
        self.assertTrue(data['success'])
        self.assertEqual(data['discount_amount'], 2.0)
        
        # Check flat coupon with insufficient order subtotal
        response_flat = self.app.post('/api/order/coupon', json={"code": "FLAT5", "subtotal": 15.0})
        self.assertEqual(response_flat.status_code, 400)
        
        # Check flat coupon with sufficient order subtotal
        response_flat_ok = self.app.post('/api/order/coupon', json={"code": "FLAT5", "subtotal": 25.0})
        data_flat = response_flat_ok.get_json()
        self.assertEqual(response_flat_ok.status_code, 200)
        self.assertEqual(data_flat['discount_amount'], 5.0)

    # --- Admin Dashboard Protection Locks ---

    def test_admin_lockout(self):
        # Verify page redirects if not authorized
        response = self.app.get('/admin/dashboard')
        self.assertEqual(response.status_code, 302)
        self.assertIn('/admin/login', response.headers['Location'])
        
        # Verify stats endpoint returns 403 Forbidden
        response_api = self.app.get('/api/admin/stats')
        self.assertEqual(response_api.status_code, 403)

if __name__ == '__main__':
    unittest.main()
