import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash
from database import get_db_connection

# --- Authentication & User Operations ---

def create_user(email, password, full_name, phone, role='customer'):
    conn = get_db_connection()
    cursor = conn.cursor()
    password_hash = generate_password_hash(password)
    try:
        cursor.execute("""
        INSERT INTO users (email, password_hash, full_name, phone, role)
        VALUES (?, ?, ?, ?, ?)
        """, (email, password_hash, full_name, phone, role))
        user_id = cursor.lastrowid
        
        # Initialize loyalty points for customer
        cursor.execute("INSERT INTO loyalty_points (user_id, points_earned) VALUES (?, 0)", (user_id,))
        
        conn.commit()
        return user_id
    except sqlite3.IntegrityError:
        return None
    finally:
        conn.close()

def authenticate_user(email, password):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    conn.close()
    
    if user and check_password_hash(user['password_hash'], password):
        return user
    return None

def get_user_by_id(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()
    conn.close()
    return user

# --- Menu Operations ---

def get_all_menu_items(category=None, search=None, only_available=True):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = "SELECT * FROM menu_items WHERE 1=1"
    params = []
    
    if only_available:
        query += " AND is_available = 1"
        
    if category:
        query += " AND category = ?"
        params.append(category)
        
    if search:
        query += " AND (name LIKE ? OR description LIKE ? OR ingredients LIKE ?)"
        search_param = f"%{search}%"
        params.extend([search_param, search_param, search_param])
        
    cursor.execute(query, params)
    items = cursor.fetchall()
    conn.close()
    return [dict(item) for item in items]

def get_menu_item_by_id(item_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM menu_items WHERE id = ?", (item_id,))
    item = cursor.fetchone()
    conn.close()
    return dict(item) if item else None

def add_menu_item(name, description, category, price, ingredients, image_url, is_popular, is_available):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO menu_items (name, description, category, price, ingredients, image_url, is_popular, is_available)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (name, description, category, price, ingredients, image_url, int(is_popular), int(is_available)))
    item_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return item_id

def update_menu_item(item_id, name, description, category, price, ingredients, image_url, is_popular, is_available):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    UPDATE menu_items
    SET name = ?, description = ?, category = ?, price = ?, ingredients = ?, image_url = ?, is_popular = ?, is_available = ?
    WHERE id = ?
    """, (name, description, category, price, ingredients, image_url, int(is_popular), int(is_available), item_id))
    conn.commit()
    conn.close()
    return True

def delete_menu_item(item_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM menu_items WHERE id = ?", (item_id,))
    conn.commit()
    conn.close()
    return True

# --- Order Operations ---

def create_order(user_id, customer_name, customer_email, customer_phone, delivery_address, payment_method, promo_code, subtotal, discount, total, cart_items):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Create order record
        cursor.execute("""
        INSERT INTO orders (user_id, customer_name, customer_email, customer_phone, delivery_address, payment_method, promo_code, subtotal, discount, total, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
        """, (user_id, customer_name, customer_email, customer_phone, delivery_address, payment_method, promo_code, subtotal, discount, total))
        order_id = cursor.lastrowid
        
        # Insert items
        for item in cart_items:
            cursor.execute("""
            INSERT INTO order_items (order_id, menu_item_id, quantity, price_at_purchase)
            VALUES (?, ?, ?, ?)
            """, (order_id, item['id'], item['quantity'], item['price']))
            
        # If user is registered, award loyalty points (e.g. 10% of total as points)
        if user_id:
            points_to_award = int(total)
            cursor.execute("""
            UPDATE loyalty_points
            SET points_earned = points_earned + ?, updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ?
            """, (points_to_award, user_id))
            
            # If paid with loyalty points, deduct them (let's say 10 points = $1)
            if payment_method == 'loyalty':
                points_to_redeem = int(total * 10)
                cursor.execute("""
                UPDATE loyalty_points
                SET points_redeemed = points_redeemed + ?, updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ?
                """, (points_to_redeem, user_id))
                
        conn.commit()
        return order_id
    except Exception as e:
        conn.rollback()
        print(f"Error creating order: {e}")
        return None
    finally:
        conn.close()

def get_order_by_id(order_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM orders WHERE id = ?", (order_id,))
    order = cursor.fetchone()
    if not order:
        conn.close()
        return None
        
    cursor.execute("""
    SELECT oi.*, mi.name, mi.image_url 
    FROM order_items oi
    JOIN menu_items mi ON oi.menu_item_id = mi.id
    WHERE oi.order_id = ?
    """, (order_id,))
    items = cursor.fetchall()
    conn.close()
    
    order_dict = dict(order)
    order_dict['items'] = [dict(i) for i in items]
    return order_dict

def get_user_orders(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC", (user_id,))
    orders = cursor.fetchall()
    conn.close()
    return [dict(o) for o in orders]

def get_all_orders():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM orders ORDER BY created_at DESC")
    orders = cursor.fetchall()
    conn.close()
    return [dict(o) for o in orders]

def update_order_status(order_id, status):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE orders SET status = ? WHERE id = ?", (status, order_id))
    conn.commit()
    conn.close()
    return True

# --- Reservation Operations ---

def create_reservation(user_id, customer_name, customer_email, customer_phone, booking_date, booking_time, guest_count, special_requests):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Simple conflict check: check capacity (let's say total guests allowed per hour is 30)
    cursor.execute("""
    SELECT SUM(guest_count) FROM reservations 
    WHERE booking_date = ? AND booking_time = ? AND status != 'cancelled'
    """, (booking_date, booking_time))
    current_guests = cursor.fetchone()[0] or 0
    
    if current_guests + guest_count > 30:
        conn.close()
        return None  # Max capacity reached for this hour
        
    cursor.execute("""
    INSERT INTO reservations (user_id, customer_name, customer_email, customer_phone, booking_date, booking_time, guest_count, special_requests, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    """, (user_id, customer_name, customer_email, customer_phone, booking_date, booking_time, guest_count, special_requests))
    reservation_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return reservation_id

def get_user_reservations(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM reservations WHERE user_id = ? ORDER BY booking_date DESC, booking_time DESC", (user_id,))
    res = cursor.fetchall()
    conn.close()
    return [dict(r) for r in res]

def get_all_reservations():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM reservations ORDER BY booking_date DESC, booking_time DESC")
    res = cursor.fetchall()
    conn.close()
    return [dict(r) for r in res]

def update_reservation_status(res_id, status):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE reservations SET status = ? WHERE id = ?", (status, res_id))
    conn.commit()
    conn.close()
    return True

# --- Review Operations ---

def submit_review(menu_item_id, reviewer_name, reviewer_email, rating, comment):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO reviews (menu_item_id, reviewer_name, reviewer_email, rating, comment, is_approved)
    VALUES (?, ?, ?, ?, ?, 0)
    """, (menu_item_id, reviewer_name, reviewer_email, rating, comment))
    review_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return review_id

def get_approved_reviews(limit=10):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT r.*, mi.name as item_name 
    FROM reviews r
    LEFT JOIN menu_items mi ON r.menu_item_id = mi.id
    WHERE r.is_approved = 1 
    ORDER BY r.created_at DESC 
    LIMIT ?
    """, (limit,))
    reviews = cursor.fetchall()
    conn.close()
    return [dict(r) for r in reviews]

def get_all_reviews():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT r.*, mi.name as item_name 
    FROM reviews r
    LEFT JOIN menu_items mi ON r.menu_item_id = mi.id
    ORDER BY r.created_at DESC
    """)
    reviews = cursor.fetchall()
    conn.close()
    return [dict(r) for r in reviews]

def approve_review(review_id, approve=True):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE reviews SET is_approved = ? WHERE id = ?", (1 if approve else 0, review_id))
    conn.commit()
    conn.close()
    return True

def delete_review(review_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM reviews WHERE id = ?", (review_id,))
    conn.commit()
    conn.close()
    return True

# --- Coupon Operations ---

def get_coupon_by_code(code):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM coupons WHERE code = ? AND is_active = 1", (code.upper().strip(),))
    coupon = cursor.fetchone()
    conn.close()
    return dict(coupon) if coupon else None

def add_coupon(code, discount_type, discount_value, min_order_value, expiry_date):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
        INSERT INTO coupons (code, discount_type, discount_value, min_order_value, is_active, expiry_date)
        VALUES (?, ?, ?, ?, 1, ?)
        """, (code.upper(), discount_type, discount_value, min_order_value, expiry_date))
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False
    finally:
        conn.close()

def get_all_coupons():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM coupons ORDER BY id DESC")
    coups = cursor.fetchall()
    conn.close()
    return [dict(c) for c in coups]

def delete_coupon(coupon_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM coupons WHERE id = ?", (coupon_id,))
    conn.commit()
    conn.close()
    return True

# --- Loyalty Points Operations ---

def get_user_loyalty(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM loyalty_points WHERE user_id = ?", (user_id,))
    loyalty = cursor.fetchone()
    conn.close()
    return dict(loyalty) if loyalty else {"points_earned": 0, "points_redeemed": 0}

# --- Newsletter Operations ---

def subscribe_newsletter(email):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO newsletter_subscribers (email) VALUES (?)", (email.strip().lower(),))
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False
    finally:
        conn.close()

def get_all_subscribers():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM newsletter_subscribers ORDER BY subscribed_at DESC")
    subs = cursor.fetchall()
    conn.close()
    return [dict(s) for s in subs]

# --- Contact Form Operations ---

def submit_contact_form(name, email, subject, message):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO contact_submissions (name, email, subject, message)
    VALUES (?, ?, ?, ?)
    """, (name, email, subject, message))
    conn.commit()
    conn.close()
    return True

def get_all_contact_submissions():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM contact_submissions ORDER BY created_at DESC")
    subs = cursor.fetchall()
    conn.close()
    return [dict(s) for s in subs]
