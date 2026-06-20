import os
from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from datetime import datetime
import models

app = Flask(__name__)
app.secret_key = "gusto_italiano_luxury_secret_key_2026"

# Ensure DB is ready on startup
import database
database.init_db()

# Custom Filter to format currency
@app.template_filter('currency')
def currency_filter(value):
    try:
        return f"${float(value):.2f}"
    except (ValueError, TypeError):
        return value

# --- Page Rendering Routes ---

@app.route('/')
def index():
    # Fetch featured / popular items for preview on homepage
    all_items = models.get_all_menu_items()
    featured_items = [item for item in all_items if item['is_popular']]
    
    # Get a couple of approved reviews
    reviews = models.get_approved_reviews(limit=3)
    
    return render_template('home.html', featured_items=featured_items, reviews=reviews, current_page='home')

@app.route('/menu')
def menu_page():
    category = request.args.get('category', None)
    search = request.args.get('search', None)
    items = models.get_all_menu_items(category=category, search=search)
    return render_template('menu.html', items=items, current_category=category or 'all', current_page='menu')

@app.route('/about')
def about():
    reviews = models.get_approved_reviews(limit=5)
    return render_template('about.html', reviews=reviews, current_page='about')

@app.route('/gallery')
def gallery():
    return render_template('gallery.html', current_page='gallery')

@app.route('/contact')
def contact():
    return render_template('contact.html', current_page='contact')

@app.route('/reviews')
def reviews_page():
    reviews = models.get_approved_reviews(limit=50)
    
    # Calculate average rating
    avg_rating = 0.0
    if reviews:
        avg_rating = sum(r['rating'] for r in reviews) / len(reviews)
        
    return render_template('reviews.html', reviews=reviews, avg_rating=round(avg_rating, 1), current_page='reviews')

@app.route('/checkout')
def checkout():
    # Access control: can buy as guest, but check if user is logged in
    user_id = session.get('user_id')
    loyalty = None
    if user_id:
        loyalty = models.get_user_loyalty(user_id)
        
    return render_template('checkout.html', loyalty=loyalty, current_page='checkout')

@app.route('/tracking/<int:order_id>')
def tracking(order_id):
    order = models.get_order_by_id(order_id)
    if not order:
        return redirect(url_for('index'))
    return render_template('tracking.html', order=order)

@app.route('/admin/login')
def admin_login():
    if session.get('role') == 'admin':
        return redirect(url_for('admin_dashboard'))
    return render_template('admin_login.html')

@app.route('/admin/dashboard')
def admin_dashboard():
    if session.get('role') != 'admin':
        return redirect(url_for('admin_login'))
        
    # Load dashboard data
    orders = models.get_all_orders()
    reservations = models.get_all_reservations()
    menu_items = models.get_all_menu_items(only_available=False)
    reviews = models.get_all_reviews()
    coupons = models.get_all_coupons()
    subscribers = models.get_all_subscribers()
    contacts = models.get_all_contact_submissions()
    
    return render_template('admin_dashboard.html', 
                           orders=orders, 
                           reservations=reservations, 
                           menu_items=menu_items, 
                           reviews=reviews, 
                           coupons=coupons,
                           subscribers=subscribers,
                           contacts=contacts)

# --- API Endpoints ---

# Authentication
@app.route('/api/auth/register', methods=['POST'])
def api_register():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')
    full_name = data.get('full_name')
    phone = data.get('phone')
    
    if not all([email, password, full_name, phone]):
        return jsonify({"success": False, "message": "All fields are required"}), 400
        
    user_id = models.create_user(email, password, full_name, phone)
    if user_id:
        # Auto-login
        user = models.get_user_by_id(user_id)
        session['user_id'] = user['id']
        session['email'] = user['email']
        session['full_name'] = user['full_name']
        session['role'] = user['role']
        return jsonify({"success": True, "message": "Registration successful"})
    else:
        return jsonify({"success": False, "message": "Email already registered"}), 400

@app.route('/api/auth/login', methods=['POST'])
def api_login():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')
    
    if not all([email, password]):
        return jsonify({"success": False, "message": "Email and password are required"}), 400
        
    user = models.authenticate_user(email, password)
    if user:
        session['user_id'] = user['id']
        session['email'] = user['email']
        session['full_name'] = user['full_name']
        session['role'] = user['role']
        return jsonify({
            "success": True, 
            "message": "Login successful", 
            "role": user['role'],
            "user": {
                "email": user['email'],
                "full_name": user['full_name'],
                "phone": user['phone']
            }
        })
    else:
        return jsonify({"success": False, "message": "Invalid email or password"}), 401

@app.route('/api/auth/logout', methods=['GET', 'POST'])
def api_logout():
    session.clear()
    return jsonify({"success": True, "message": "Logged out successfully"})

# Loyalty and Account info
@app.route('/api/auth/profile', methods=['GET'])
def api_profile():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"success": False, "message": "Unauthorized"}), 401
    
    user = models.get_user_by_id(user_id)
    loyalty = models.get_user_loyalty(user_id)
    return jsonify({
        "success": True,
        "user": {
            "email": user['email'],
            "full_name": user['full_name'],
            "phone": user['phone'],
            "role": user['role']
        },
        "loyalty": {
            "points": loyalty['points_earned'] - loyalty['points_redeemed']
        }
    })

# Menu API
@app.route('/api/menu', methods=['GET'])
def api_menu():
    category = request.args.get('category', None)
    search = request.args.get('search', None)
    items = models.get_all_menu_items(category=category, search=search)
    return jsonify({"success": True, "items": items})

# Order & Cart
@app.route('/api/order/coupon', methods=['POST'])
def api_validate_coupon():
    data = request.get_json() or {}
    code = data.get('code')
    subtotal = data.get('subtotal', 0.0)
    
    if not code:
        return jsonify({"success": False, "message": "Coupon code required"}), 400
        
    coupon = models.get_coupon_by_code(code)
    if not coupon:
        return jsonify({"success": False, "message": "Invalid or expired coupon code"}), 404
        
    if subtotal < coupon['min_order_value']:
        return jsonify({
            "success": False, 
            "message": f"Minimum order value for this coupon is ${coupon['min_order_value']:.2f}"
        }), 400
        
    # Calculate discount
    discount = 0.0
    if coupon['discount_type'] == 'percentage':
        discount = subtotal * (coupon['discount_value'] / 100.0)
    elif coupon['discount_type'] == 'flat':
        discount = coupon['discount_value']
        
    # Discount cannot exceed subtotal
    discount = min(discount, subtotal)
    
    return jsonify({
        "success": True,
        "code": coupon['code'],
        "discount_type": coupon['discount_type'],
        "discount_value": coupon['discount_value'],
        "discount_amount": discount
    })

@app.route('/api/order/track/<int:order_id>', methods=['GET'])
def api_track_order(order_id):
    order = models.get_order_by_id(order_id)
    if not order:
        return jsonify({"success": False, "message": "Order not found"}), 404
    return jsonify({"success": True, "status": order['status']})

@app.route('/api/order/detail/<int:order_id>', methods=['GET'])
def api_order_detail(order_id):
    order = models.get_order_by_id(order_id)
    if not order:
        return jsonify({"success": False, "message": "Order not found"}), 404
    return jsonify({"success": True, "order": order})

@app.route('/api/order/create', methods=['POST'])
def api_create_order():
    data = request.get_json() or {}
    customer_name = data.get('name')
    customer_email = data.get('email')
    customer_phone = data.get('phone')
    delivery_address = data.get('address')
    payment_method = data.get('payment_method') # 'cash', 'card', 'loyalty'
    promo_code = data.get('promo_code')
    cart_items = data.get('items', [])
    
    if not all([customer_name, customer_email, customer_phone, delivery_address, payment_method, cart_items]):
        return jsonify({"success": False, "message": "Missing required fields"}), 400
        
    # Calculate Subtotal
    subtotal = 0.0
    resolved_items = []
    for item in cart_items:
        db_item = models.get_menu_item_by_id(item['id'])
        if not db_item or not db_item['is_available']:
            return jsonify({"success": False, "message": f"Item '{item.get('name')}' is currently unavailable"}), 400
        price = db_item['price']
        subtotal += price * int(item['quantity'])
        resolved_items.append({
            "id": db_item['id'],
            "name": db_item['name'],
            "price": price,
            "quantity": int(item['quantity'])
        })
        
    # Validate Coupon
    discount = 0.0
    if promo_code:
        coupon = models.get_coupon_by_code(promo_code)
        if coupon and subtotal >= coupon['min_order_value']:
            if coupon['discount_type'] == 'percentage':
                discount = subtotal * (coupon['discount_value'] / 100.0)
            elif coupon['discount_type'] == 'flat':
                discount = coupon['discount_value']
            discount = min(discount, subtotal)
            
    # Calculate Total
    total = subtotal - discount
    
    user_id = session.get('user_id')
    
    # Loyalty Check
    if payment_method == 'loyalty':
        if not user_id:
            return jsonify({"success": False, "message": "Must be logged in to pay with loyalty points"}), 400
        loyalty = models.get_user_loyalty(user_id)
        current_points = loyalty['points_earned'] - loyalty['points_redeemed']
        required_points = int(total * 10) # 10 points = $1
        if current_points < required_points:
            return jsonify({"success": False, "message": f"Insufficient loyalty points. You need {required_points} points (you have {current_points})."}), 400
            
    order_id = models.create_order(
        user_id, customer_name, customer_email, customer_phone,
        delivery_address, payment_method, promo_code,
        subtotal, discount, total, resolved_items
    )
    
    if order_id:
        # Simulate Automated confirmations
        send_automated_order_confirmation(order_id, customer_email, customer_phone, resolved_items, total)
        return jsonify({
            "success": True, 
            "message": "Order placed successfully!", 
            "order_id": order_id
        })
    else:
        return jsonify({"success": False, "message": "Failed to place order due to database error"}), 500

def send_automated_order_confirmation(order_id, email, phone, items, total):
    # Print mock confirmation logs for notifications
    print("\n--- AUTOMATED ORDER CONFIRMATION SYSTEM ---")
    print(f"SMTP: Sending order receipt to {email}...")
    print(f"SMS: Sending tracking link to {phone}...")
    item_str = ", ".join([f"{i['name']} (x{i['quantity']})" for i in items])
    print(f"NOTIFICATION CONTENT:\n'Grazie! Your order #{order_id} for {item_str} totaling ${total:.2f} is confirmed! Track your order status in real time.'")
    print("-------------------------------------------\n")

# Table Booking
@app.route('/api/reserve/create', methods=['POST'])
def api_create_reservation():
    data = request.get_json() or {}
    customer_name = data.get('name')
    customer_email = data.get('email')
    customer_phone = data.get('phone')
    booking_date = data.get('date') # YYYY-MM-DD
    booking_time = data.get('time') # HH:MM
    guest_count = int(data.get('guests', 1))
    special_requests = data.get('special_requests', '')
    
    if not all([customer_name, customer_email, customer_phone, booking_date, booking_time]):
        return jsonify({"success": False, "message": "All fields are required"}), 400
        
    user_id = session.get('user_id')
    res_id = models.create_reservation(
        user_id, customer_name, customer_email, customer_phone,
        booking_date, booking_time, guest_count, special_requests
    )
    
    if res_id:
        send_automated_reservation_confirmation(res_id, customer_email, customer_name, booking_date, booking_time, guest_count)
        return jsonify({
            "success": True, 
            "message": "Table booked successfully!", 
            "reservation_id": res_id
        })
    else:
        return jsonify({
            "success": False, 
            "message": "We are fully booked for this slot. Please select a different time or date."
        }), 400

def send_automated_reservation_confirmation(res_id, email, name, date, time, guests):
    print("\n--- AUTOMATED RESERVATION SYSTEM ---")
    print(f"SMTP: Sending reservation voucher to {email}...")
    print(f"NOTIFICATION CONTENT:\n'Dear {name}, your table booking #{res_id} for {guests} guest(s) on {date} at {time} has been requested and is currently PENDING confirmation.'")
    print("------------------------------------\n")

# Reviews & Newsletter
@app.route('/api/reviews/submit', methods=['POST'])
def api_submit_review():
    data = request.get_json() or {}
    name = data.get('name')
    email = data.get('email')
    rating = int(data.get('rating', 5))
    comment = data.get('comment')
    menu_item_id = data.get('menu_item_id') # optional
    
    if not all([name, email, comment]):
        return jsonify({"success": False, "message": "Name, email, and comment are required"}), 400
        
    models.submit_review(menu_item_id, name, email, rating, comment)
    return jsonify({
        "success": True, 
        "message": "Review submitted successfully! It will appear once approved by the administrator."
    })

@app.route('/api/newsletter/subscribe', methods=['POST'])
def api_newsletter():
    data = request.get_json() or {}
    email = data.get('email')
    if not email:
        return jsonify({"success": False, "message": "Email is required"}), 400
        
    success = models.subscribe_newsletter(email)
    if success:
        return jsonify({"success": True, "message": "Subscribed successfully! Check your inbox for custom coffee offers."})
    else:
        return jsonify({"success": False, "message": "Email is already subscribed!"}), 400

@app.route('/api/contact/submit', methods=['POST'])
def api_contact():
    data = request.get_json() or {}
    name = data.get('name')
    email = data.get('email')
    subject = data.get('subject')
    message = data.get('message')
    
    if not all([name, email, subject, message]):
        return jsonify({"success": False, "message": "All fields are required"}), 400
        
    models.submit_contact_form(name, email, subject, message)
    return jsonify({"success": True, "message": "Thank you! Your message has been received."})

# AI Recommendations
@app.route('/api/recommend', methods=['POST'])
def api_recommend():
    data = request.get_json() or {}
    flavor = data.get('flavor') # 'savory', 'sweet', 'bold', 'light'
    preference = data.get('category') # 'coffee', 'fastfood', 'italian', 'dessert' or 'all'
    
    items = models.get_all_menu_items()
    recommendations = []
    
    # Recommendation rules matching category & description keywords
    for item in items:
        # Category match
        if preference != 'all' and item['category'] != preference:
            continue
            
        desc = item['description'].lower() + " " + item['name'].lower() + " " + item['ingredients'].lower()
        
        if flavor == 'sweet':
            if any(k in desc for k in ['sugar', 'sweet', 'honey', 'syrup', 'pistachio', 'strawberry', 'tiramisu', 'cannoli', 'panna cotta', 'chocolate']):
                recommendations.append(item)
        elif flavor == 'savory':
            if any(k in desc for k in ['patty', 'cheese', 'bacon', 'garlic', 'beef', 'truffle', 'linguine', 'lasagna', 'pizza', 'porcini', 'sauce', 'fries']):
                recommendations.append(item)
        elif flavor == 'bold':
            if any(k in desc for k in ['espresso', 'shot', 'chili', 'spicy', 'truffle', 'garlic', 'black truffle', 'calabrian']):
                recommendations.append(item)
        elif flavor == 'light':
            if any(k in desc for k in ['clams', 'mussels', 'shrimp', 'cherry tomatoes', 'lemon', 'salad', 'water', 'herbs', 'fresh basil']):
                recommendations.append(item)
                
    # Fallback if no matching rules, return top 3 popular items
    if not recommendations:
        recommendations = [item for item in items if item['is_popular']][:3]
        
    return jsonify({"success": True, "items": recommendations[:3]})


# --- PROTECTED ADMIN API ENDPOINTS ---

def check_admin_auth():
    if session.get('role') != 'admin':
        return False
    return True

@app.route('/api/admin/stats', methods=['GET'])
def api_admin_stats():
    if not check_admin_auth():
        return jsonify({"success": False, "message": "Unauthorized"}), 403
        
    orders = models.get_all_orders()
    reservations = models.get_all_reservations()
    subscribers = models.get_all_subscribers()
    
    total_sales = sum(o['total'] for o in orders if o['status'] != 'cancelled')
    pending_orders = sum(1 for o in orders if o['status'] == 'pending')
    confirmed_reservations = sum(1 for r in reservations if r['status'] == 'confirmed')
    
    return jsonify({
        "success": True,
        "stats": {
            "total_sales": total_sales,
            "total_orders": len(orders),
            "pending_orders": pending_orders,
            "total_reservations": len(reservations),
            "confirmed_reservations": confirmed_reservations,
            "total_subscribers": len(subscribers)
        }
    })

@app.route('/api/admin/menu', methods=['POST', 'PUT'])
def api_admin_manage_menu():
    if not check_admin_auth():
        return jsonify({"success": False, "message": "Unauthorized"}), 403
        
    data = request.get_json() or {}
    item_id = data.get('id')
    name = data.get('name')
    description = data.get('description')
    category = data.get('category')
    price = float(data.get('price', 0.0))
    ingredients = data.get('ingredients')
    image_url = data.get('image_url', '/static/images/hero_coffee.png')
    is_popular = int(data.get('is_popular', 0))
    is_available = int(data.get('is_available', 1))
    
    if not all([name, description, category, price]):
        return jsonify({"success": False, "message": "Required fields: name, description, category, price"}), 400
        
    if request.method == 'POST':
        new_id = models.add_menu_item(name, description, category, price, ingredients, image_url, is_popular, is_available)
        return jsonify({"success": True, "message": "Menu item created successfully", "id": new_id})
    else:
        if not item_id:
            return jsonify({"success": False, "message": "Item ID required for update"}), 400
        models.update_menu_item(item_id, name, description, category, price, ingredients, image_url, is_popular, is_available)
        return jsonify({"success": True, "message": "Menu item updated successfully"})

@app.route('/api/admin/menu/delete/<int:item_id>', methods=['POST', 'DELETE'])
def api_admin_delete_menu(item_id):
    if not check_admin_auth():
        return jsonify({"success": False, "message": "Unauthorized"}), 403
        
    models.delete_menu_item(item_id)
    return jsonify({"success": True, "message": "Menu item deleted successfully"})

@app.route('/api/admin/order/status', methods=['POST'])
def api_admin_order_status():
    if not check_admin_auth():
        return jsonify({"success": False, "message": "Unauthorized"}), 403
        
    data = request.get_json() or {}
    order_id = data.get('order_id')
    status = data.get('status')
    
    if not all([order_id, status]):
        return jsonify({"success": False, "message": "Order ID and status are required"}), 400
        
    models.update_order_status(order_id, status)
    
    # Notify customer of order status update
    print(f"\n--- AUTOMATED STATUS UPDATE ---")
    print(f"SMTP/SMS: Order #{order_id} status changed to '{status}'. Sent notification to customer.")
    print("--------------------------------\n")
    
    return jsonify({"success": True, "message": f"Order status updated to {status}"})

@app.route('/api/admin/reserve/status', methods=['POST'])
def api_admin_reserve_status():
    if not check_admin_auth():
        return jsonify({"success": False, "message": "Unauthorized"}), 403
        
    data = request.get_json() or {}
    res_id = data.get('reservation_id')
    status = data.get('status')
    
    if not all([res_id, status]):
        return jsonify({"success": False, "message": "Reservation ID and status are required"}), 400
        
    models.update_reservation_status(res_id, status)
    
    # Notify customer of reservation status
    print(f"\n--- AUTOMATED RESERVATION UPDATE ---")
    print(f"SMTP: Table booking #{res_id} is now '{status}'. Sent email confirmation.")
    print("-------------------------------------\n")
    
    return jsonify({"success": True, "message": f"Reservation status updated to {status}"})

@app.route('/api/admin/reviews/approve', methods=['POST'])
def api_admin_reviews_approve():
    if not check_admin_auth():
        return jsonify({"success": False, "message": "Unauthorized"}), 403
        
    data = request.get_json() or {}
    review_id = data.get('review_id')
    action = data.get('action') # 'approve', 'disapprove', 'delete'
    
    if not all([review_id, action]):
        return jsonify({"success": False, "message": "Review ID and action are required"}), 400
        
    if action == 'approve':
        models.approve_review(review_id, approve=True)
        msg = "Review approved"
    elif action == 'disapprove':
        models.approve_review(review_id, approve=False)
        msg = "Review unapproved"
    elif action == 'delete':
        models.delete_review(review_id)
        msg = "Review deleted"
    else:
        return jsonify({"success": False, "message": "Invalid action"}), 400
        
    return jsonify({"success": True, "message": msg})

@app.route('/api/admin/coupon', methods=['POST'])
def api_admin_create_coupon():
    if not check_admin_auth():
        return jsonify({"success": False, "message": "Unauthorized"}), 403
        
    data = request.get_json() or {}
    code = data.get('code')
    discount_type = data.get('discount_type')
    discount_value = float(data.get('discount_value', 0.0))
    min_order_value = float(data.get('min_order_value', 0.0))
    expiry_date = data.get('expiry_date')
    
    if not all([code, discount_type, discount_value, expiry_date]):
        return jsonify({"success": False, "message": "Missing required fields"}), 400
        
    success = models.add_coupon(code, discount_type, discount_value, min_order_value, expiry_date)
    if success:
        return jsonify({"success": True, "message": "Coupon code created successfully"})
    else:
        return jsonify({"success": False, "message": "Coupon code already exists"}), 400

@app.route('/api/admin/coupon/delete/<int:coupon_id>', methods=['POST', 'DELETE'])
def api_admin_delete_coupon(coupon_id):
    if not check_admin_auth():
        return jsonify({"success": False, "message": "Unauthorized"}), 403
        
    models.delete_coupon(coupon_id)
    return jsonify({"success": True, "message": "Coupon deleted successfully"})


if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)
