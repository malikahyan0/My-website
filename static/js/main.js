/* Gusto Italiano & Cafe - Main Javascript Controller */

// --- 0. Netlify Client-Side Mock Backend (Static Mode) ---
const isStaticMode = window.location.pathname.endsWith('.html') || window.location.hostname.includes('netlify') || window.location.protocol === 'file:';

if (isStaticMode) {
  // Ensure default data exists in localStorage
  if (!localStorage.getItem('gusto_menu_items')) {
    localStorage.setItem('gusto_menu_items', JSON.stringify([
      {id: 1, name: "Espresso Romano", description: "A double shot of our house blend specialty espresso, served with a fresh lemon peel twist to cut sweetness and enhance citrus undertones.", category: "coffee", price: 4.50, ingredients: "Specialty Espresso Blend, Lemon Twist", image_url: "static/images/hero_coffee.png", is_popular: 1, is_available: 1},
      {id: 2, name: "Golden Crema Cappuccino", description: "Perfectly balanced espresso shot with micro-foamed milk, decorated with a sprinkle of edible 24k gold leaf flakes.", category: "coffee", price: 5.50, ingredients: "Espresso, Steamed Milk, Milk Foam, 24k Gold Flakes", image_url: "static/images/hero_coffee.png", is_popular: 1, is_available: 1},
      {id: 3, name: "Pistachio Affogato", description: "A scoop of authentic Sicilian pistachio gelato drowned in a hot shot of fresh pulled single-origin espresso.", category: "coffee", price: 6.50, ingredients: "Sicilian Pistachio Gelato, Single-origin Espresso, Crushed Pistachios", image_url: "static/images/hero_coffee.png", is_popular: 0, is_available: 1},
      {id: 4, name: "Lavender Honey Latte", description: "Espresso combined with milk and organic lavender flower extract, sweetened with raw wild honey.", category: "coffee", price: 5.75, ingredients: "Espresso, Honey, Lavender Extract, Steamed Oat Milk", image_url: "static/images/hero_coffee.png", is_popular: 0, is_available: 1},
      {id: 5, name: "Gusto Smash Burger", description: "Two 80/20 Angus beef patties smashed crispy, melted aged cheddar, caramelized balsamic onions, secret Gusto spread on toasted brioche.", category: "fastfood", price: 14.50, ingredients: "Angus Beef, Cheddar Cheese, Caramelized Onions, Gusto Sauce, Brioche Bun", image_url: "static/images/hero_burger.png", is_popular: 1, is_available: 1},
      {id: 6, name: "Truffle Parmesan Fries", description: "Hand-cut Idaho potatoes tossed in white truffle oil, grated pecorino romano, and chopped fresh Italian flat-leaf parsley.", category: "fastfood", price: 8.00, ingredients: "Idaho Potatoes, Truffle Oil, Pecorino Romano, Flat-leaf Parsley", image_url: "static/images/hero_burger.png", is_popular: 1, is_available: 1},
      {id: 7, name: "Spicy Italian Chicken Sandwich", description: "Crispy double-dredged chicken breast dipped in Calabrian chili oil, topped with house coleslaw and sliced pickles on a brioche bun.", category: "fastfood", price: 13.50, ingredients: "Fried Chicken Breast, Calabrian Chili Oil, Coleslaw, Pickles, Brioche Bun", image_url: "static/images/hero_burger.png", is_popular: 0, is_available: 1},
      {id: 8, name: "Hand-Tossed Margherita Pizza", description: "Stone-baked pizza topped with rich San Marzano tomato sauce, fresh buffalo mozzarella, organic basil leaves, and a drizzle of extra virgin olive oil.", category: "italian", price: 15.00, ingredients: "Neapolitan Dough, San Marzano Tomatoes, Buffalo Mozzarella, Fresh Basil, EVOO", image_url: "static/images/hero_pasta.png", is_popular: 1, is_available: 1},
      {id: 9, name: "Fettuccine Tartufo e Funghi", description: "House-made fresh egg fettuccine tossed in a luxurious black truffle cream sauce with wild porcini mushrooms.", category: "italian", price: 22.00, ingredients: "Fresh Fettuccine, Black Truffle Cream, Porcini Mushrooms, Parmigiano Reggiano", image_url: "static/images/hero_pasta.png", is_popular: 1, is_available: 1},
      {id: 10, name: "Seafood Linguine", description: "Linguine sautéed in a light garlic white wine sauce with fresh clams, mussels, shrimp, and cherry tomatoes.", category: "italian", price: 26.00, ingredients: "Linguine, Shrimp, Clams, Mussels, Cherry Tomatoes, White Wine, Garlic", image_url: "static/images/hero_pasta.png", is_popular: 0, is_available: 1},
      {id: 11, name: "Classic Lasagna Bolognese", description: "Layered egg pasta sheets with our slow-simmered beef, veal and pork ragù, creamy bechamel, and melted mozzarella.", category: "italian", price: 19.00, ingredients: "Pasta Sheets, Bolognese Ragù, Bechamel, Mozzarella, Parmigiano", image_url: "static/images/hero_pasta.png", is_popular: 0, is_available: 1},
      {id: 12, name: "Nonna's Tiramisu", description: "Layered ladyfingers soaked in espresso and dark rum, whipped mascarpone cream, finished with premium Dutch cocoa dust.", category: "dessert", price: 8.50, ingredients: "Ladyfingers, Espresso, Mascarpone, Dark Rum, Cocoa Powder", image_url: "static/images/restaurant_interior.png", is_popular: 1, is_available: 1},
      {id: 13, name: "Sicilian Cannoli", description: "Two crispy pastry shells filled with sweet sheep's milk ricotta, dark chocolate chips, and candied orange peel zest.", category: "dessert", price: 7.00, ingredients: "Cannoli Shell, Sheep's Ricotta, Chocolate Chips, Candied Orange", image_url: "static/images/restaurant_interior.png", is_popular: 0, is_available: 1},
      {id: 14, name: "Vanilla Bean Panna Cotta", description: "Silky chilled cream dessert infused with real Madagascar vanilla bean pods, topped with a fresh strawberry-basil coulis.", category: "dessert", price: 8.00, ingredients: "Heavy Cream, Vanilla Bean, Gelatin, Strawberry Coulis, Fresh Basil", image_url: "static/images/restaurant_interior.png", is_popular: 0, is_available: 1}
    ]));
  }
  
  if (!localStorage.getItem('gusto_coupons')) {
    localStorage.setItem('gusto_coupons', JSON.stringify([
      {id: 1, code: "WELCOME10", discount_type: "percentage", discount_value: 10.0, min_order_value: 15.0, is_active: 1, expiry_date: "2028-12-31"},
      {id: 2, code: "GUSTO20", discount_type: "percentage", discount_value: 20.0, min_order_value: 30.0, is_active: 1, expiry_date: "2028-12-31"},
      {id: 3, code: "FLAT5", discount_type: "flat", discount_value: 5.0, min_order_value: 20.0, is_active: 1, expiry_date: "2028-12-31"}
    ]));
  }

  if (!localStorage.getItem('gusto_orders')) {
    localStorage.setItem('gusto_orders', JSON.stringify([]));
  }
  
  if (!localStorage.getItem('gusto_reservations')) {
    localStorage.setItem('gusto_reservations', JSON.stringify([]));
  }
  
  if (!localStorage.getItem('gusto_subscribers')) {
    localStorage.setItem('gusto_subscribers', JSON.stringify([
      {id: 1, email: "chef@example.com", subscribed_at: "2026-06-06 12:00:00"}
    ]));
  }

  if (!localStorage.getItem('gusto_contacts')) {
    localStorage.setItem('gusto_contacts', JSON.stringify([]));
  }

  if (!localStorage.getItem('gusto_reviews')) {
    localStorage.setItem('gusto_reviews', JSON.stringify([
      {id: 1, menu_item_id: 9, reviewer_name: "Sophia Loren", reviewer_email: "sophia@example.com", rating: 5, comment: "The Fettuccine Tartufo is to die for! Reminds me of Rome. Absolutely stunning ambiance.", is_approved: 1, created_at: "2026-06-01"},
      {id: 2, menu_item_id: 1, reviewer_name: "Gordon R.", reviewer_email: "gordon@example.com", rating: 4, comment: "Brilliant espresso extraction. The smash burger has a perfect crust. Will return.", is_approved: 1, created_at: "2026-06-02"},
      {id: 3, menu_item_id: 8, reviewer_name: "Giuseppe V.", reviewer_email: "giuseppe@example.com", rating: 5, comment: "The Margherita pizza is wood-fired perfection. Best Neapolitan style crust in town.", is_approved: 1, created_at: "2026-06-03"},
      {id: 4, menu_item_id: 12, reviewer_name: "Elisa B.", reviewer_email: "elisa@example.com", rating: 5, comment: "Warm, gold, elegant interior design. Dark mode on their menu website is so sleek! Love the loyalty points system.", is_approved: 1, created_at: "2026-06-04"}
    ]));
  }

  // Setup default session
  if (!localStorage.getItem('gusto_session')) {
    localStorage.setItem('gusto_session', JSON.stringify(null));
  }

  // Override window.fetch
  const originalFetch = window.fetch;
  window.fetch = function(url, options) {
    const urlStr = url.toString();
    if (!urlStr.startsWith('/api/')) {
      return originalFetch(url, options);
    }

    const method = (options && options.method || 'GET').toUpperCase();
    const data = options && options.body ? JSON.parse(options.body) : {};

    // Helper mock response builder
    const mockResponse = (jsonPayload, statusCode = 200) => {
      return Promise.resolve(new Response(JSON.stringify(jsonPayload), {
        status: statusCode,
        headers: { 'Content-Type': 'application/json' }
      }));
    };

    // 1. LOGIN API
    if (urlStr.includes('/api/auth/login')) {
      const email = data.email;
      const password = data.password;
      if (email === 'admin@gusto.com' && password === 'admin123') {
        const sessionData = { user_id: 99, email: email, full_name: "Administrator", role: "admin" };
        localStorage.setItem('gusto_session', JSON.stringify(sessionData));
        return mockResponse({ success: true, message: "Login successful", role: "admin", user: sessionData });
      } else if (email === 'customer@gusto.com' && password === 'customer123') {
        const sessionData = { user_id: 100, email: email, full_name: "Mario Rossi", role: "customer", phone: "+39 333 1234567" };
        localStorage.setItem('gusto_session', JSON.stringify(sessionData));
        return mockResponse({ success: true, message: "Login successful", role: "customer", user: sessionData });
      } else {
        return mockResponse({ success: false, message: "Invalid email or password" }, 401);
      }
    }

    // 2. REGISTER API
    if (urlStr.includes('/api/auth/register')) {
      const sessionData = { user_id: Date.now(), email: data.email, full_name: data.full_name, role: "customer", phone: data.phone };
      localStorage.setItem('gusto_session', JSON.stringify(sessionData));
      return mockResponse({ success: true, message: "Registration successful" });
    }

    // 3. LOGOUT API
    if (urlStr.includes('/api/auth/logout')) {
      localStorage.setItem('gusto_session', JSON.stringify(null));
      return mockResponse({ success: true, message: "Logged out successfully" });
    }

    // 4. PROFILE API
    if (urlStr.includes('/api/auth/profile')) {
      const sessionData = JSON.parse(localStorage.getItem('gusto_session'));
      if (!sessionData) {
        return mockResponse({ success: false, message: "Unauthorized" }, 401);
      }
      return mockResponse({
        success: true,
        user: sessionData,
        loyalty: { points: sessionData.role === 'admin' ? 100 : 150 }
      });
    }

    // 5. COUPON VALIDATION
    if (urlStr.includes('/api/order/coupon')) {
      const code = data.code.toUpperCase().trim();
      const subtotal = data.subtotal;
      const coupons = JSON.parse(localStorage.getItem('gusto_coupons'));
      const coupon = coupons.find(c => c.code === code && c.is_active === 1);
      
      if (!coupon) {
        return mockResponse({ success: false, message: "Invalid or expired coupon code" }, 404);
      }
      if (subtotal < coupon.min_order_value) {
        return mockResponse({ success: false, message: `Minimum order value is $${coupon.min_order_value.toFixed(2)}` }, 400);
      }
      let discount = 0.0;
      if (coupon.discount_type === 'percentage') {
        discount = subtotal * (coupon.discount_value / 100.0);
      } else {
        discount = coupon.discount_value;
      }
      discount = Math.min(discount, subtotal);
      return mockResponse({ success: true, code: coupon.code, discount_amount: discount });
    }

    // 6. ORDER CREATE
    if (urlStr.includes('/api/order/create')) {
      const orders = JSON.parse(localStorage.getItem('gusto_orders'));
      const newId = orders.length + 1;
      
      const subtotal = data.items.reduce((sum, i) => sum + (parseFloat(i.price) * parseInt(i.quantity)), 0.0);
      let discount = 0.0;
      if (data.promo_code) {
        const coupons = JSON.parse(localStorage.getItem('gusto_coupons'));
        const coupon = coupons.find(c => c.code === data.promo_code);
        if (coupon) {
          discount = coupon.discount_type === 'percentage' ? subtotal * (coupon.discount_value / 100.0) : coupon.discount_value;
        }
      }
      const total = Math.max(0, subtotal - discount);
      
      const newOrder = {
        id: newId,
        customer_name: data.name,
        customer_email: data.email,
        customer_phone: data.phone,
        delivery_address: data.address,
        payment_method: data.payment_method,
        promo_code: data.promo_code,
        subtotal: subtotal,
        discount: discount,
        total: total,
        status: "pending",
        created_at: new Date().toLocaleString(),
        items: data.items.map(i => ({ name: i.name, price_at_purchase: parseFloat(i.price), quantity: parseInt(i.quantity) }))
      };
      
      orders.push(newOrder);
      localStorage.setItem('gusto_orders', JSON.stringify(orders));
      
      // Auto transition order status after some time (simulating backend kitchen)
      setTimeout(() => {
        const ords = JSON.parse(localStorage.getItem('gusto_orders'));
        const o = ords.find(x => x.id === newId);
        if (o && o.status === 'pending') {
          o.status = 'preparing';
          localStorage.setItem('gusto_orders', JSON.stringify(ords));
        }
      }, 10000);

      setTimeout(() => {
        const ords = JSON.parse(localStorage.getItem('gusto_orders'));
        const o = ords.find(x => x.id === newId);
        if (o && o.status === 'preparing') {
          o.status = 'on_the_way';
          localStorage.setItem('gusto_orders', JSON.stringify(ords));
        }
      }, 25000);
      
      return mockResponse({ success: true, message: "Order placed successfully!", order_id: newId });
    }

    // 7. ORDER TRACK STATUS
    if (urlStr.includes('/api/order/track/')) {
      const parts = urlStr.split('/');
      const id = parseInt(parts[parts.length - 1]);
      const orders = JSON.parse(localStorage.getItem('gusto_orders'));
      const order = orders.find(o => o.id === id);
      if (!order) return mockResponse({ success: false, message: "Order not found" }, 404);
      return mockResponse({ success: true, status: order.status });
    }

    // 8. ORDER DETAILS
    if (urlStr.includes('/api/order/detail/')) {
      const parts = urlStr.split('/');
      const id = parseInt(parts[parts.length - 1]);
      const orders = JSON.parse(localStorage.getItem('gusto_orders'));
      const order = orders.find(o => o.id === id);
      if (!order) return mockResponse({ success: false, message: "Order not found" }, 404);
      return mockResponse({ success: true, order: order });
    }

    // 9. TABLE RESERVATIONS
    if (urlStr.includes('/api/reserve/create')) {
      const reservations = JSON.parse(localStorage.getItem('gusto_reservations'));
      const newId = reservations.length + 1;
      const newRes = {
        id: newId,
        customer_name: data.name,
        customer_email: data.email,
        customer_phone: data.phone,
        booking_date: data.date,
        booking_time: data.time,
        guest_count: parseInt(data.guests),
        special_requests: data.special_requests,
        status: "pending",
        created_at: new Date().toLocaleString()
      };
      reservations.push(newRes);
      localStorage.setItem('gusto_reservations', JSON.stringify(reservations));
      return mockResponse({ success: true, message: "Table booked successfully!", reservation_id: newId });
    }

    // 10. REVIEWS SUBMIT
    if (urlStr.includes('/api/reviews/submit')) {
      const reviews = JSON.parse(localStorage.getItem('gusto_reviews'));
      reviews.push({
        id: reviews.length + 1,
        reviewer_name: data.name,
        reviewer_email: data.email,
        rating: parseInt(data.rating),
        comment: data.comment,
        is_approved: 0,
        created_at: new Date().toISOString().split('T')[0]
      });
      localStorage.setItem('gusto_reviews', JSON.stringify(reviews));
      return mockResponse({ success: true, message: "Review submitted successfully! It will appear once approved by the administrator." });
    }

    // 11. NEWSLETTER SUBSCRIBE
    if (urlStr.includes('/api/newsletter/subscribe')) {
      const subs = JSON.parse(localStorage.getItem('gusto_subscribers'));
      if (subs.find(s => s.email === data.email.trim().toLowerCase())) {
        return mockResponse({ success: false, message: "Email is already subscribed!" }, 400);
      }
      subs.push({ id: subs.length + 1, email: data.email, subscribed_at: new Date().toLocaleString() });
      localStorage.setItem('gusto_subscribers', JSON.stringify(subs));
      return mockResponse({ success: true, message: "Subscribed successfully!" });
    }

    // 12. CONTACT INQUIRY
    if (urlStr.includes('/api/contact/submit')) {
      const contacts = JSON.parse(localStorage.getItem('gusto_contacts'));
      contacts.push({ id: contacts.length + 1, name: data.name, email: data.email, subject: data.subject, message: data.message, created_at: new Date().toLocaleString() });
      localStorage.setItem('gusto_contacts', JSON.stringify(contacts));
      return mockResponse({ success: true, message: "Thank you! Your message has been received." });
    }

    // 13. RECOMMEND API
    if (urlStr.includes('/api/recommend')) {
      const items = JSON.parse(localStorage.getItem('gusto_menu_items'));
      const flavor = data.flavor;
      const preference = data.category;
      
      let recs = items.filter(item => {
        if (preference !== 'all' && item.category !== preference) return false;
        const text = (item.description + " " + item.name + " " + item.ingredients).toLowerCase();
        
        if (flavor === 'sweet') {
          return ['sugar', 'sweet', 'honey', 'syrup', 'pistachio', 'strawberry', 'tiramisu', 'cannoli', 'panna cotta', 'chocolate'].some(k => text.includes(k));
        } else if (flavor === 'savory') {
          return ['patty', 'cheese', 'bacon', 'garlic', 'beef', 'truffle', 'linguine', 'lasagna', 'pizza', 'porcini', 'sauce', 'fries'].some(k => text.includes(k));
        } else if (flavor === 'bold') {
          return ['espresso', 'shot', 'chili', 'spicy', 'truffle', 'garlic', 'black truffle', 'calabrian'].some(k => text.includes(k));
        } else if (flavor === 'light') {
          return ['clams', 'mussels', 'shrimp', 'cherry tomatoes', 'lemon', 'salad', 'water', 'herbs'].some(k => text.includes(k));
        }
        return false;
      });
      if (recs.length === 0) recs = items.filter(i => i.is_popular === 1);
      return mockResponse({ success: true, items: recs.slice(0, 3) });
    }

    // 14. ADMIN STATS
    if (urlStr.includes('/api/admin/stats')) {
      const orders = JSON.parse(localStorage.getItem('gusto_orders'));
      const reservations = JSON.parse(localStorage.getItem('gusto_reservations'));
      const subs = JSON.parse(localStorage.getItem('gusto_subscribers'));
      
      const sales = orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.total, 0.0);
      const pending = orders.filter(o => o.status === 'pending').length;
      const booked = reservations.filter(r => r.status === 'confirmed').length;
      
      return mockResponse({
        success: true,
        stats: {
          total_sales: sales,
          total_orders: orders.length,
          pending_orders: pending,
          total_reservations: reservations.length,
          confirmed_reservations: booked,
          total_subscribers: subs.length
        }
      });
    }

    // 15. ADMIN ORDER UPDATE STATUS
    if (urlStr.includes('/api/admin/order/status')) {
      const orders = JSON.parse(localStorage.getItem('gusto_orders'));
      const order = orders.find(o => o.id === parseInt(data.order_id));
      if (order) {
        order.status = data.status;
        localStorage.setItem('gusto_orders', JSON.stringify(orders));
        return mockResponse({ success: true, message: `Order status updated to ${data.status}` });
      }
      return mockResponse({ success: false, message: "Order not found" }, 404);
    }

    // 16. ADMIN RESERVE UPDATE STATUS
    if (urlStr.includes('/api/admin/reserve/status')) {
      const resList = JSON.parse(localStorage.getItem('gusto_reservations'));
      const r = resList.find(x => x.id === parseInt(data.reservation_id));
      if (r) {
        r.status = data.status;
        localStorage.setItem('gusto_reservations', JSON.stringify(resList));
        return mockResponse({ success: true, message: `Reservation status updated to ${data.status}` });
      }
      return mockResponse({ success: false, message: "Booking not found" }, 404);
    }

    // 17. ADMIN REVIEW MODERATION
    if (urlStr.includes('/api/admin/reviews/approve')) {
      const reviews = JSON.parse(localStorage.getItem('gusto_reviews'));
      const id = parseInt(data.review_id);
      const action = data.action;
      
      if (action === 'delete') {
        const list = reviews.filter(x => x.id !== id);
        localStorage.setItem('gusto_reviews', JSON.stringify(list));
        return mockResponse({ success: true, message: "Review deleted" });
      } else {
        const r = reviews.find(x => x.id === id);
        if (r) {
          r.is_approved = action === 'approve' ? 1 : 0;
          localStorage.setItem('gusto_reviews', JSON.stringify(reviews));
          return mockResponse({ success: true, message: action === 'approve' ? "Review approved" : "Review unapproved" });
        }
      }
      return mockResponse({ success: false, message: "Review not found" }, 404);
    }

    // 18. ADMIN CREATE COUPON
    if (urlStr.includes('/api/admin/coupon')) {
      const coupons = JSON.parse(localStorage.getItem('gusto_coupons'));
      const code = data.code.toUpperCase().trim();
      if (coupons.find(c => c.code === code)) {
        return mockResponse({ success: false, message: "Coupon code already exists" }, 400);
      }
      const newC = {
        id: coupons.length + 1,
        code: code,
        discount_type: data.discount_type,
        discount_value: parseFloat(data.discount_value),
        min_order_value: parseFloat(data.min_order_value || 0.0),
        is_active: 1,
        expiry_date: data.expiry_date
      };
      coupons.push(newC);
      localStorage.setItem('gusto_coupons', JSON.stringify(coupons));
      return mockResponse({ success: true, message: "Coupon code created successfully" });
    }

    // 19. ADMIN DELETE COUPON
    if (urlStr.includes('/api/admin/coupon/delete/')) {
      const parts = urlStr.split('/');
      const id = parseInt(parts[parts.length - 1]);
      const coupons = JSON.parse(localStorage.getItem('gusto_coupons'));
      const list = coupons.filter(c => c.id !== id);
      localStorage.setItem('gusto_coupons', JSON.stringify(list));
      return mockResponse({ success: true, message: "Coupon deleted successfully" });
    }

    // 20. ADMIN DELETE MENU ITEM
    if (urlStr.includes('/api/admin/menu/delete/')) {
      const parts = urlStr.split('/');
      const id = parseInt(parts[parts.length - 1]);
      const items = JSON.parse(localStorage.getItem('gusto_menu_items'));
      const list = items.filter(i => i.id !== id);
      localStorage.setItem('gusto_menu_items', JSON.stringify(list));
      return mockResponse({ success: true, message: "Menu item deleted successfully" });
    }

    return mockResponse({ success: false, message: "Mock endpoint not found" }, 404);
  };
}

// --- 1. Multi-language translation dictionary ---
const translations = {
  en: {
    home: "Home",
    menu: "Menu",
    about: "About",
    gallery: "Gallery",
    reviews: "Reviews",
    contact: "Contact",
    explore: "Explore",
    our_menu: "Our Menu",
    book_table: "Book Table",
    our_story: "Our Story",
    photo_gallery: "Photo Gallery",
    testimonials: "Testimonials",
    business_hours: "Business Hours",
    weekdays: "Monday - Friday:",
    weekends: "Saturday - Sunday:",
    newsletter: "Newsletter",
    newsletter_desc: "Subscribe for culinary news, coffee masterclasses, and priority reservation invites.",
    crafted: "Crafted with passion in Italy.",
    privacy_policy: "Privacy Policy",
    terms_conditions: "Terms of Conditions",
    your_cart: "Your Cart",
    cart_empty: "Your cart is empty. Let's add some delicious dishes!",
    view_menu: "View Menu",
    subtotal: "Subtotal:",
    checkout_btn: "Proceed to Checkout",
    sign_in: "Sign In",
    dont_have_account: "Don't have an account?",
    register_now: "Register Now",
    create_account: "Create Account",
    full_name_label: "Full Name",
    email_label: "Email Address",
    phone_label: "Phone Number",
    password_label: "Password",
    register_btn: "Register",
    already_have_account: "Already have an account?",
    customer_profile: "Customer Profile",
    loyalty_points_label: "Loyalty Points:",
    online: "Online",
    chat_welcome: "Ciao! I am your Gusto Assistant. How can I help you today?",
    track_order: "Track Order",
    ai_recs: "AI Recommendations",
    opening_hours: "Opening Hours",
    
    // Home Page
    hero_title: "Specialty Coffee & Italian Cuisine",
    hero_subtitle: "Crafted with certified organic ingredients, roasted to perfection, and served in luxury.",
    order_online: "Order Online",
    about_preview_sub: "Authentic & Refined",
    about_preview_title: "A Culinary Union of Coffee & Cuisine",
    about_preview_p: "Gusto Italiano is not just a restaurant; it is a celebration of taste. We combine a third-wave artisan coffee house with traditional, handcrafted Neapolitan pizza, slow-cooked pasta, and gourmet burgers.",
    discover_more: "Discover Our Story",
    featured_dishes_sub: "Customer Favorites",
    featured_dishes_title: "Gusto Specialties",
    popular: "Popular",
    add_to_cart_btn: "Add to Cart",
    explore_full_menu: "Explore Full Menu",
    reservation_sub: "Secure A Table",
    reservation_title: "Real-Time Booking",
    name_label: "Your Name",
    booking_date_label: "Date",
    booking_time_label: "Preferred Time Slot",
    guests_label: "Number of Guests",
    special_requests_label: "Special Requests / Allergies",
    confirm_booking_btn: "Confirm Booking",
    reviews_sub: "Critics & Customers",
    reviews_title: "What People Say",
    
    // Menu Page
    menu_banner_title: "Our Gourmet Menu",
    menu_banner_subtitle: "Authentic Italian Flavors & Artisan Coffee",
    ai_title: "Smart AI Taste Matcher",
    ai_subtitle: "Can't decide? Answer a quick 2-question quiz and let our artificial intelligence match your craving!",
    find_match_btn: "Match My Craving",
    search_dish: "Search Dishes",
    categories: "Categories",
    all_categories: "All Items",
    coffee_bevs: "Coffee & Beverages",
    fast_food: "Fast Food",
    italian_cuisine: "Italian Cuisine",
    desserts: "Desserts",
    dietary: "Dietary",
    vegetarian: "Vegetarian",
    gluten_free: "Gluten Free Option",
    price_range: "Price Range",
    ingredients_label: "Ingredients:",
    no_dishes_found: "No items found",
    no_dishes_sub: "Try adjusting your filters or search keywords.",
    
    // Contact Page
    contact_banner_title: "Connect With Us",
    contact_banner_subtitle: "We are always ready to welcome you",
    find_us: "Find Us",
    location_label: "Our Location",
    send_message_title: "Send Us a Message",
    subject_label: "Subject",
    message_label: "Message",
    send_message_btn: "Send Message",
    
    // Reviews Page
    reviews_banner_title: "Customer Reviews",
    reviews_banner_subtitle: "Authentic Feedback from our Guests",
    average_score: "Average Score",
    share_exp_title: "Share Your Experience",
    share_exp_desc: "We value your feedback. Let us know how your coffee extraction was, or how you liked our fresh hand-tossed pasta!",
    write_review_btn: "Write A Review",
    rating_label: "Your Rating",
    comment_label: "Your Comments",
    submit_review_btn: "Submit Review",
    what_guests_say: "What Our Guests Say",
    
    // Checkout Page
    checkout_title: "Complete Your Order",
    delivery_details: "Delivery Details",
    delivery_address_label: "Delivery Address",
    payment_method: "Payment Method",
    cod: "Cash / Card on Delivery",
    cod_desc: "Pay with cash or swipe your card directly to the courier.",
    pay_loyalty: "Redeem Loyalty Points",
    redeem_points_desc: "Pay using your rewards. Balance:",
    points: "points",
    login_loyalty_tip: "Sign in to redeem loyalty points on your purchase.",
    place_order: "Place Order",
    order_summary: "Order Summary",
    promo_code_label: "Promo Code",
    apply: "Apply",
    discount: "Discount:",
    total: "Total:"
  },
  it: {
    home: "Home",
    menu: "Menu",
    about: "Chi Siamo",
    gallery: "Galleria",
    reviews: "Recensioni",
    contact: "Contatti",
    explore: "Esplora",
    our_menu: "Il Nostro Menu",
    book_table: "Prenota Tavolo",
    our_story: "La Nostra Storia",
    photo_gallery: "Galleria Foto",
    testimonials: "Dicono Di Noi",
    business_hours: "Orari Apertura",
    weekdays: "Lunedì - Venerdì:",
    weekends: "Sabato - Domenica:",
    newsletter: "Newsletter",
    newsletter_desc: "Iscriviti per notizie culinarie, masterclass sul caffè e inviti con prenotazione prioritaria.",
    crafted: "Creato con passione in Italia.",
    privacy_policy: "Privacy Policy",
    terms_conditions: "Termini e Condizioni",
    your_cart: "Il Tuo Carrello",
    cart_empty: "Il carrello è vuoto. Aggiungiamo qualche piatto delizioso!",
    view_menu: "Vedi Menu",
    subtotal: "Subtotale:",
    checkout_btn: "Procedi al Checkout",
    sign_in: "Accedi",
    dont_have_account: "Non hai un account?",
    register_now: "Registrati Ora",
    create_account: "Crea Account",
    full_name_label: "Nome Completo",
    email_label: "Indirizzo Email",
    phone_label: "Numero di Telefono",
    password_label: "Password",
    register_btn: "Registrati",
    already_have_account: "Hai già un account?",
    customer_profile: "Profilo Cliente",
    loyalty_points_label: "Punti Fedeltà:",
    online: "In linea",
    chat_welcome: "Ciao! Sono il tuo Assistente Gusto. Come posso aiutarti oggi?",
    track_order: "Traccia Ordine",
    ai_recs: "Consigli AI",
    opening_hours: "Orari di Apertura",
    
    // Home Page
    hero_title: "Caffè Speciale & Cucina Italiana",
    hero_subtitle: "Creato con ingredienti biologici certificati, tostato alla perfezione e servito con lusso.",
    order_online: "Ordina Online",
    about_preview_sub: "Autentico & Raffinato",
    about_preview_title: "Un'unione Culinaria di Caffè e Cucina",
    about_preview_p: "Gusto Italiano non è solo un ristorante; è una celebrazione del gusto. Combiniamo una caffetteria specialty artigianale con pizza napoletana fatta a mano, pasta a cottura lenta e hamburger gourmet.",
    discover_more: "Scopri La Nostra Storia",
    featured_dishes_sub: "I Preferiti dai Clienti",
    featured_dishes_title: "Specialità di Gusto",
    popular: "Popolare",
    add_to_cart_btn: "Aggiungi al Carrello",
    explore_full_menu: "Esplora l'Intero Menu",
    reservation_sub: "Assicurati un Tavolo",
    reservation_title: "Prenotazione in Tempo Reale",
    name_label: "Il Tuo Nome",
    booking_date_label: "Data",
    booking_time_label: "Fascia Oraria Preferita",
    guests_label: "Numero di Ospiti",
    special_requests_label: "Richieste Speciali / Allergie",
    confirm_booking_btn: "Conferma Prenotazione",
    reviews_sub: "Critici & Clienti",
    reviews_title: "Cosa Dicono Di Noi",

    // Menu Page
    menu_banner_title: "Il Nostro Menu Gourmet",
    menu_banner_subtitle: "Sapori Italiani Autentici & Caffè Artigianale",
    ai_title: "Selettore di Gusto Intelligente AI",
    ai_subtitle: "Non riesci a decidere? Rispondi a un quiz di 2 domande e lascia che la nostra intelligenza artificiale trovi il tuo piatto!",
    find_match_btn: "Trova il Mio Piatto",
    search_dish: "Cerca Piatti",
    categories: "Categorie",
    all_categories: "Tutti i Piatti",
    coffee_bevs: "Caffetteria e Bevande",
    fast_food: "Fast Food",
    italian_cuisine: "Cucina Italiana",
    desserts: "Dolci",
    dietary: "Dietetico",
    vegetarian: "Vegetariano",
    gluten_free: "Opzione Senza Glutine",
    price_range: "Fascia di Prezzo",
    ingredients_label: "Ingredienti:",
    no_dishes_found: "Nessun piatto trovato",
    no_dishes_sub: "Prova a modificare i filtri o le parole chiave.",

    // Contact Page
    contact_banner_title: "Contattaci",
    contact_banner_subtitle: "Siamo sempre pronti ad accoglierti",
    find_us: "Dove Siamo",
    location_label: "Nostra Posizione",
    send_message_title: "Inviaci un Messaggio",
    subject_label: "Oggetto",
    message_label: "Messaggio",
    send_message_btn: "Invia Messaggio",

    // Reviews Page
    reviews_banner_title: "Recensioni Clienti",
    reviews_banner_subtitle: "Feedback Autentico dai Nostri Ospiti",
    average_score: "Punteggio Medio",
    share_exp_title: "Condividi la Tua Esperienza",
    share_exp_desc: "Apprezziamo la tua opinione. Facci sapere com'era il tuo caffè specialty o come hai trovato la nostra pasta fresca fatta a mano!",
    write_review_btn: "Scrivi Recensione",
    rating_label: "Tuo Punteggio",
    comment_label: "Tuo Commento",
    submit_review_btn: "Invia Recensione",
    what_guests_say: "Cosa Dicono i Nostri Ospiti",

    // Checkout Page
    checkout_title: "Completa l'Ordine",
    delivery_details: "Dettagli di Consegna",
    delivery_address_label: "Indirizzo di Consegna",
    payment_method: "Metodo di Pagamento",
    cod: "Contanti / Carta alla Consegna",
    cod_desc: "Paga in contanti o striscia la carta direttamente al corriere.",
    pay_loyalty: "Riscatta Punti Fedeltà",
    redeem_points_desc: "Paga usando i tuoi punti fedeltà. Saldo:",
    points: "punti",
    login_loyalty_tip: "Accedi per riscattare i tuoi punti fedeltà sull'acquisto.",
    place_order: "Invia Ordine",
    order_summary: "Riepilogo Ordine",
    promo_code_label: "Codice Promo",
    apply: "Applica",
    discount: "Sconto:",
    total: "Totale:"
  }
};

let currentLanguage = 'en';

function setLanguage(lang) {
  currentLanguage = lang;
  document.querySelectorAll('[data-trn]').forEach(el => {
    const key = el.getAttribute('data-trn');
    if (translations[lang][key]) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = translations[lang][key];
      } else {
        el.innerText = translations[lang][key];
      }
    }
  });
  localStorage.setItem('gusto_lang', lang);
}

// Bind language select dropdown
const langSelect = document.getElementById('lang-select');
if (langSelect) {
  langSelect.addEventListener('change', function() {
    setLanguage(this.value);
  });
}

// --- 2. Dark/Light Theme Switcher ---
const themeToggleBtn = document.getElementById('theme-toggle-btn');
if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', function() {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    
    // Save theme via session API mock/fetch
    fetch('/api/newsletter/subscribe', { // dummy query to trigger session save or keep it local
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme: isDark ? 'dark' : 'light' })
    }).catch(()=>{});
    
    localStorage.setItem('gusto_theme', isDark ? 'dark' : 'light');
  });
}

// --- 3. Mobile Navigation Menu Toggle ---
const mobileNavToggle = document.getElementById('mobile-nav-toggle');
const navLinks = document.getElementById('nav-links');
if (mobileNavToggle && navLinks) {
  mobileNavToggle.addEventListener('click', function() {
    this.classList.toggle('active');
    navLinks.classList.toggle('active');
  });
}

// Close mobile menu on clicking any link
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    if (mobileNavToggle) mobileNavToggle.classList.remove('active');
    if (navLinks) navLinks.classList.remove('active');
  });
});

// --- 4. Sticky Header on Scroll ---
window.addEventListener('scroll', function() {
  const header = document.getElementById('main-header');
  if (header) {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
});

// --- 5. Custom Notification Toast Helper ---
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let icon = 'fa-check-circle';
  if (type === 'error') icon = 'fa-times-circle';
  if (type === 'warning') icon = 'fa-exclamation-triangle';
  
  toast.innerHTML = `
    <i class="fa-solid ${icon}"></i>
    <span>${message}</span>
  `;
  
  container.appendChild(toast);
  
  // Fade out and remove after 4 seconds
  setTimeout(() => {
    toast.classList.add('fade-out');
    toast.addEventListener('animationend', () => toast.remove());
  }, 4000);
}

// --- 6. Auth Dialog Modals Controller ---
const loginTrigger = document.getElementById('login-modal-trigger');
const authOverlay = document.getElementById('auth-modal-overlay');
const closeAuthBtn = document.getElementById('close-modal-btn');
const switchToRegister = document.getElementById('switch-to-register');
const switchToLogin = document.getElementById('switch-to-login');
const loginView = document.getElementById('login-view');
const registerView = document.getElementById('register-view');

if (loginTrigger && authOverlay) {
  loginTrigger.addEventListener('click', () => {
    authOverlay.classList.add('active');
    loginView.style.display = 'block';
    registerView.style.display = 'none';
  });
}

if (closeAuthBtn && authOverlay) {
  closeAuthBtn.addEventListener('click', () => authOverlay.classList.remove('active'));
}

if (switchToRegister && loginView && registerView) {
  switchToRegister.addEventListener('click', (e) => {
    e.preventDefault();
    loginView.style.display = 'none';
    registerView.style.display = 'block';
  });
}

if (switchToLogin && loginView && registerView) {
  switchToLogin.addEventListener('click', (e) => {
    e.preventDefault();
    registerView.style.display = 'none';
    loginView.style.display = 'block';
  });
}

// Close modals when clicking overlay background
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', function(e) {
    if (e.target === this) {
      this.classList.remove('active');
    }
  });
});

// Login Form Submit AJAX
const loginForm = document.getElementById('login-form-element');
if (loginForm) {
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showToast(data.message, 'success');
        authOverlay.classList.remove('active');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        showToast(data.message, 'error');
      }
    })
    .catch(() => showToast('Login request failed', 'error'));
  });
}

// Register Form Submit AJAX
const registerForm = document.getElementById('register-form-element');
if (registerForm) {
  registerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const full_name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const phone = document.getElementById('reg-phone').value;
    const password = document.getElementById('reg-password').value;
    
    fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name, email, phone, password })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showToast(data.message, 'success');
        authOverlay.classList.remove('active');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        showToast(data.message, 'error');
      }
    })
    .catch(() => showToast('Registration request failed', 'error'));
  });
}

// Profile modal controller
const profileTrigger = document.getElementById('profile-toggle-btn');
const profileOverlay = document.getElementById('profile-modal-overlay');
const closeProfileBtn = document.getElementById('close-profile-btn');

if (profileTrigger && profileOverlay) {
  profileTrigger.addEventListener('click', () => {
    // Load profile data via API
    fetch('/api/auth/profile')
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        document.getElementById('prof-name').innerText = data.user.full_name;
        document.getElementById('prof-email').innerText = data.user.email;
        document.getElementById('prof-phone').innerText = data.user.phone;
        document.getElementById('prof-points').innerText = data.loyalty.points;
        
        if(data.user.role === 'admin') {
          document.getElementById('profile-go-admin').style.display = 'block';
        }
        
        profileOverlay.classList.add('active');
      }
    });
  });
}
if (closeProfileBtn && profileOverlay) {
  closeProfileBtn.addEventListener('click', () => profileOverlay.classList.remove('active'));
}

// Logout script
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', function() {
    fetch('/api/auth/logout')
    .then(() => {
      showToast('Logged out successfully', 'success');
      setTimeout(() => window.location.reload(), 1000);
    });
  });
}

// --- 7. Live Chat Widget Assistant logic ---
const chatToggleBubble = document.getElementById('chat-toggle-btn-bubble');
const chatWindowBox = document.getElementById('chat-window-box');
const closeChatIcon = document.getElementById('close-chat-btn-icon');
const chatMessagesScroll = document.getElementById('chat-messages-scroll');
const chatSendBtn = document.getElementById('chat-send-btn-action');
const chatInputText = document.getElementById('chat-input-text');

if (chatToggleBubble && chatWindowBox) {
  chatToggleBubble.addEventListener('click', () => {
    chatWindowBox.classList.toggle('active');
  });
}
if (closeChatIcon && chatWindowBox) {
  closeChatIcon.addEventListener('click', () => {
    chatWindowBox.classList.remove('active');
  });
}

function appendChatMessage(sender, text) {
  const msg = document.createElement('div');
  msg.className = `chat-msg ${sender}`;
  msg.innerText = text;
  chatMessagesScroll.appendChild(msg);
  chatMessagesScroll.scrollTop = chatMessagesScroll.scrollHeight;
}

function botReply(userText) {
  let reply = "I'm sorry, I didn't quite catch that. You can ask me about table bookings, tracking orders, menu recommendation, or opening hours!";
  const text = userText.toLowerCase();
  
  if (text.includes('reserve') || text.includes('table') || text.includes('book')) {
    reply = "Excellent choice! You can reserve a table in real-time by visiting our booking section on the homepage or clicking 'Book Table' below.";
  } else if (text.includes('hours') || text.includes('open') || text.includes('time')) {
    reply = "We are open Monday to Friday from 07:30 AM to 10:00 PM, and Saturdays and Sundays from 08:30 AM to 11:30 PM. Ciao!";
  } else if (text.includes('track') || text.includes('order')) {
    reply = "To track your delivery, please look at the order tracking page link sent to your phone after placing the online cart order.";
  } else if (text.includes('recommend') || text.includes('dish') || text.includes('eat') || text.includes('food')) {
    reply = "We highly recommend Nonna's Tiramisu or our hand-tossed Margherita pizza! Try opening the Smart AI Taste Matcher quiz on the Menu page.";
  } else if (text.includes('ciao') || text.includes('hello') || text.includes('hi')) {
    reply = "Ciao! Welcome to Gusto Italiano. How can I serve you today?";
  }
  
  setTimeout(() => {
    appendChatMessage('bot', reply);
  }, 600);
}

function handleChatSend() {
  const text = chatInputText.value.trim();
  if (!text) return;
  
  appendChatMessage('user', text);
  chatInputText.value = '';
  
  botReply(text);
}

if (chatSendBtn && chatInputText) {
  chatSendBtn.addEventListener('click', handleChatSend);
  chatInputText.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') handleChatSend();
  });
}

// Bind quick replies
document.querySelectorAll('.quick-reply-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    const text = this.getAttribute('data-msg');
    appendChatMessage('user', text);
    botReply(text);
  });
});

// Newsletter subscription ajax
const newsForm = document.getElementById('newsletter-form-action');
if(newsForm) {
  newsForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('newsletter-email-val').value;
    
    fetch('/api/newsletter/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showToast(data.message, 'success');
        document.getElementById('newsletter-email-val').value = '';
      } else {
        showToast(data.message, 'error');
      }
    })
    .catch(() => showToast('Failed to subscribe newsletter', 'error'));
  });
}

// --- 8. Load Local Cache Settings on Startup ---
window.addEventListener('DOMContentLoaded', () => {
  // Theme load
  const cachedTheme = localStorage.getItem('gusto_theme');
  if (cachedTheme === 'dark') {
    document.body.classList.add('dark-theme');
  }
  
  // Lang load
  const cachedLang = localStorage.getItem('gusto_lang') || 'en';
  if (langSelect) langSelect.value = cachedLang;
  setLanguage(cachedLang);
});
