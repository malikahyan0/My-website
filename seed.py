import sqlite3
from werkzeug.security import generate_password_hash
from database import get_db_connection, init_db

def seed_db():
    # Ensure tables are created first
    init_db()
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Clean existing records to avoid duplicates if re-running
    cursor.execute("DELETE FROM users")
    cursor.execute("DELETE FROM menu_items")
    cursor.execute("DELETE FROM coupons")
    cursor.execute("DELETE FROM reviews")
    cursor.execute("DELETE FROM loyalty_points")
    
    # 2. Seed Admin User
    admin_email = "admin@gusto.com"
    admin_pw_hash = generate_password_hash("admin123")
    cursor.execute("""
    INSERT INTO users (email, password_hash, full_name, phone, role)
    VALUES (?, ?, ?, ?, ?)
    """, (admin_email, admin_pw_hash, "Administrator", "+1234567890", "admin"))
    
    # Get the admin's user id to seed loyalty
    admin_id = cursor.lastrowid
    cursor.execute("INSERT INTO loyalty_points (user_id, points_earned) VALUES (?, ?)", (admin_id, 100))

    # Seed regular customer user
    customer_email = "customer@gusto.com"
    customer_pw_hash = generate_password_hash("customer123")
    cursor.execute("""
    INSERT INTO users (email, password_hash, full_name, phone, role)
    VALUES (?, ?, ?, ?, ?)
    """, (customer_email, customer_pw_hash, "Mario Rossi", "+1987654321", "customer"))
    customer_id = cursor.lastrowid
    cursor.execute("INSERT INTO loyalty_points (user_id, points_earned) VALUES (?, ?)", (customer_id, 150))
    
    # 3. Seed Menu Items
    menu_items = [
        # --- Coffee & Beverages ---
        (
            "Espresso Romano",
            "A double shot of our house blend specialty espresso, served with a fresh lemon peel twist to cut sweetness and enhance citrus undertones.",
            "coffee",
            4.50,
            "Specialty Espresso Blend, Lemon Twist",
            "/static/images/hero_coffee.png",
            1, # popular
            1  # available
        ),
        (
            "Golden Crema Cappuccino",
            "Perfectly balanced espresso shot with micro-foamed milk, decorated with a sprinkle of edible 24k gold leaf flakes.",
            "coffee",
            5.50,
            "Espresso, Steamed Milk, Milk Foam, 24k Gold Flakes",
            "/static/images/hero_coffee.png",
            1,
            1
        ),
        (
            "Pistachio Affogato",
            "A scoop of authentic Sicilian pistachio gelato drowned in a hot shot of fresh pulled single-origin espresso.",
            "coffee",
            6.50,
            "Sicilian Pistachio Gelato, Single-origin Espresso, Crushed Pistachios",
            "/static/images/hero_coffee.png",
            0,
            1
        ),
        (
            "Lavender Honey Latte",
            "Espresso combined with milk and organic lavender flower extract, sweetened with raw wild honey.",
            "coffee",
            5.75,
            "Espresso, Honey, Lavender Extract, Steamed Oat Milk",
            "/static/images/hero_coffee.png",
            0,
            1
        ),
        
        # --- Fast Food ---
        (
            "Gusto Smash Burger",
            "Two 80/20 Angus beef patties smashed crispy, melted aged cheddar, caramelized balsamic onions, secret Gusto spread on toasted brioche.",
            "fastfood",
            14.50,
            "Angus Beef, Cheddar Cheese, Caramelized Onions, Gusto Sauce, Brioche Bun",
            "/static/images/hero_burger.png",
            1,
            1
        ),
        (
            "Truffle Parmesan Fries",
            "Hand-cut Idaho potatoes tossed in white truffle oil, grated pecorino romano, and chopped fresh Italian flat-leaf parsley.",
            "fastfood",
            8.00,
            "Idaho Potatoes, Truffle Oil, Pecorino Romano, Flat-leaf Parsley",
            "/static/images/hero_burger.png",
            1,
            1
        ),
        (
            "Spicy Italian Chicken Sandwich",
            "Crispy double-dredged chicken breast dipped in Calabrian chili oil, topped with house coleslaw and sliced pickles on a brioche bun.",
            "fastfood",
            13.50,
            "Fried Chicken Breast, Calabrian Chili Oil, Coleslaw, Pickles, Brioche Bun",
            "/static/images/hero_burger.png",
            0,
            1
        ),
        
        # --- Italian Cuisine ---
        (
            "Hand-Tossed Margherita Pizza",
            "Stone-baked pizza topped with rich San Marzano tomato sauce, fresh buffalo mozzarella, organic basil leaves, and a drizzle of extra virgin olive oil.",
            "italian",
            15.00,
            "Neapolitan Dough, San Marzano Tomatoes, Buffalo Mozzarella, Fresh Basil, EVOO",
            "/static/images/hero_pasta.png",
            1,
            1
        ),
        (
            "Fettuccine Tartufo e Funghi",
            "House-made fresh egg fettuccine tossed in a luxurious black truffle cream sauce with wild porcini mushrooms.",
            "italian",
            22.00,
            "Fresh Fettuccine, Black Truffle Cream, Porcini Mushrooms, Parmigiano Reggiano",
            "/static/images/hero_pasta.png",
            1,
            1
        ),
        (
            "Seafood Linguine",
            "Linguine sautéed in a light garlic white wine sauce with fresh clams, mussels, shrimp, and cherry tomatoes.",
            "italian",
            26.00,
            "Linguine, Shrimp, Clams, Mussels, Cherry Tomatoes, White Wine, Garlic",
            "/static/images/hero_pasta.png",
            0,
            1
        ),
        (
            "Classic Lasagna Bolognese",
            "Layered egg pasta sheets with our slow-simmered beef, veal and pork ragù, creamy bechamel, and melted mozzarella.",
            "italian",
            19.00,
            "Pasta Sheets, Bolognese Ragù, Bechamel, Mozzarella, Parmigiano",
            "/static/images/hero_pasta.png",
            0,
            1
        ),
        
        # --- Desserts ---
        (
            "Nonna's Tiramisu",
            "Layered ladyfingers soaked in espresso and dark rum, whipped mascarpone cream, finished with premium Dutch cocoa dust.",
            "dessert",
            8.50,
            "Ladyfingers, Espresso, Mascarpone, Dark Rum, Cocoa Powder",
            "/static/images/restaurant_interior.png",
            1,
            1
        ),
        (
            "Sicilian Cannoli",
            "Two crispy pastry shells filled with sweet sheep's milk ricotta, dark chocolate chips, and candied orange peel zest.",
            "dessert",
            7.00,
            "Cannoli Shell, Sheep's Ricotta, Chocolate Chips, Candied Orange",
            "/static/images/restaurant_interior.png",
            0,
            1
        ),
        (
            "Vanilla Bean Panna Cotta",
            "Silky chilled cream dessert infused with real Madagascar vanilla bean pods, topped with a fresh strawberry-basil coulis.",
            "dessert",
            8.00,
            "Heavy Cream, Vanilla Bean, Gelatin, Strawberry Coulis, Fresh Basil",
            "/static/images/restaurant_interior.png",
            0,
            1
        )
    ]
    
    cursor.executemany("""
    INSERT INTO menu_items (name, description, category, price, ingredients, image_url, is_popular, is_available)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, menu_items)
    
    # 4. Seed Coupons
    coupons = [
        ("WELCOME10", "percentage", 10.0, 15.0, 1, "2028-12-31"),
        ("GUSTO20", "percentage", 20.0, 30.0, 1, "2028-12-31"),
        ("FLAT5", "flat", 5.0, 20.0, 1, "2028-12-31")
    ]
    cursor.executemany("""
    INSERT INTO coupons (code, discount_type, discount_value, min_order_value, is_active, expiry_date)
    VALUES (?, ?, ?, ?, ?, ?)
    """, coupons)
    
    # 5. Seed Reviews
    reviews = [
        (None, "Sophia Loren", "sophia@example.com", 5, "The Fettuccine Tartufo is to die for! Reminds me of Rome. Absolutely stunning ambiance.", 1),
        (None, "Gordon R.", "gordon@example.com", 4, "Brilliant espresso extraction. The smash burger has a perfect crust. Will return.", 1),
        (None, "Giuseppe V.", "giuseppe@example.com", 5, "The Margherita pizza is wood-fired perfection. Best Neapolitan style crust in town.", 1),
        (None, "Elisa B.", "elisa@example.com", 5, "Warm, gold, elegant interior design. Dark mode on their menu website is so sleek! Love the loyalty points system.", 1)
    ]
    cursor.executemany("""
    INSERT INTO reviews (menu_item_id, reviewer_name, reviewer_email, rating, comment, is_approved)
    VALUES (?, ?, ?, ?, ?, ?)
    """, reviews)
    
    conn.commit()
    conn.close()
    print("Database seeded successfully with items, admin user, coupons, and reviews.")

if __name__ == "__main__":
    seed_db()
