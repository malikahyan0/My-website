import os
import shutil
import re
from app import app, database, models

# 1. Configuration
SRC_DIR = os.path.dirname(os.path.abspath(__file__))
DEST_DIR = os.path.join(os.path.dirname(SRC_DIR), "gusto-italiano-static")

# Ensure destination directory is clean
if os.path.exists(DEST_DIR):
    shutil.rmtree(DEST_DIR)
os.makedirs(DEST_DIR)

# 2. Pages to render and their static filenames
PAGES = {
    "/": "index.html",
    "/menu": "menu.html",
    "/about": "about.html",
    "/gallery": "gallery.html",
    "/contact": "contact.html",
    "/reviews": "reviews.html",
    "/checkout": "checkout.html",
    "/tracking/1": "tracking.html", # compile with placeholder ID=1
    "/admin/login": "admin_login.html",
    "/admin/dashboard": "admin_dashboard.html"
}

# Ensure database is seeded to provide mock details during compilation
database.init_db()
try:
    import seed
    seed.seed_db()
except Exception as e:
    print("Database seeding info:", e)

# 3. Create Flask Test Client for rendering pages
client = app.test_client()

print("Starting static template compilation...")

for route, filename in PAGES.items():
    print(f"Rendering route: {route} -> {filename}")
    
    # Simulate an admin session if accessing admin dashboard during compile time
    # so Flask doesn't redirect us to login
    with client.session_transaction() as sess:
        sess['role'] = 'admin'
        sess['user_id'] = 99
        sess['email'] = 'admin@gusto.com'
        sess['full_name'] = 'Administrator'
        sess['theme'] = 'dark'
        
    response = client.get(route)
    if response.status_code != 200 and response.status_code != 302:
        print(f"Error rendering {route}: Status code {response.status_code}")
        continue
        
    html = response.get_data(as_text=True)
    
    # 4. Post-processing HTML strings to work as relative static pages
    # Replace absolute navbar/footer links
    html = html.replace('href="/"', 'href="index.html"')
    html = html.replace('href="/menu"', 'href="menu.html"')
    html = html.replace('href="/about"', 'href="about.html"')
    html = html.replace('href="/gallery"', 'href="gallery.html"')
    html = html.replace('href="/contact"', 'href="contact.html"')
    html = html.replace('href="/reviews"', 'href="reviews.html"')
    html = html.replace('href="/checkout"', 'href="checkout.html"')
    html = html.replace('href="/admin/login"', 'href="admin_login.html"')
    html = html.replace('href="/admin/dashboard"', 'href="admin_dashboard.html"')
    html = html.replace('href="/#reserve-section"', 'href="index.html#reserve-section"')
    
    # Make static assets relative (remove leading slash)
    html = html.replace('href="/static/', 'href="static/')
    html = html.replace('src="/static/', 'src="static/')
    html = html.replace('url(\'/static/', 'url(\'static/')
    
    # Write file to destination
    dest_file = os.path.join(DEST_DIR, filename)
    with open(dest_file, "w", encoding="utf-8") as f:
        f.write(html)

# 5. Copy static assets (css, js, images)
src_static = os.path.join(SRC_DIR, "static")
dest_static = os.path.join(DEST_DIR, "static")

shutil.copytree(src_static, dest_static)

# Cleanup: remove raw png files that might have been copied from appData during setup
for item in os.listdir(dest_static):
    if item.endswith(".png") and "hero_" not in item and "restaurant_" not in item:
        try:
            os.remove(os.path.join(dest_static, item))
        except:
            pass

print(f"\nCompilation complete! Netlify deployable static site created at:")
print(f"-> {DEST_DIR}\n")
