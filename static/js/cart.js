/* Gusto Italiano & Cafe - Cart Controller */

let cart = [];

// Initialize Cart from Local Storage
function initCart() {
  const storedCart = localStorage.getItem('gusto_cart');
  if (storedCart) {
    cart = JSON.parse(storedCart);
  }
  updateCartBadge();
  renderCartDrawer();
}

// Save Cart to Local Storage
function saveCart() {
  localStorage.setItem('gusto_cart', JSON.stringify(cart));
  updateCartBadge();
  renderCartDrawer();
}

// Add Item to Cart
function addToCart(id, name, price, img) {
  const existingItem = cart.find(item => item.id === parseInt(id));
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: parseInt(id),
      name: name,
      price: parseFloat(price),
      image_url: img,
      quantity: 1
    });
  }
  
  saveCart();
  showToast(`Added ${name} to your cart!`, 'success');
}

// Remove Item from Cart
function removeFromCart(id) {
  cart = cart.filter(item => item.id !== parseInt(id));
  saveCart();
}

// Change Item Quantity
function changeQuantity(id, delta) {
  const item = cart.find(item => item.id === parseInt(id));
  if (!item) return;
  
  item.quantity += delta;
  
  if (item.quantity <= 0) {
    removeFromCart(id);
  } else {
    saveCart();
  }
}

// Update Header Navigation Badge Count
function updateCartBadge() {
  const badge = document.getElementById('cart-badge-count');
  if (badge) {
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    badge.innerText = totalCount;
  }
}

// Toggle Cart Drawer Visibility
const cartToggleBtn = document.getElementById('cart-toggle-btn');
const closeCartBtn = document.getElementById('close-cart-btn');
const cartDrawer = document.getElementById('cart-drawer');
const cartOverlay = document.getElementById('cart-drawer-overlay');

if (cartToggleBtn && cartDrawer && cartOverlay) {
  cartToggleBtn.addEventListener('click', () => {
    cartDrawer.classList.add('active');
    cartOverlay.classList.add('active');
  });
}

const hideCart = () => {
  if (cartDrawer) cartDrawer.classList.remove('active');
  if (cartOverlay) cartOverlay.classList.remove('active');
};

if (closeCartBtn) closeCartBtn.addEventListener('click', hideCart);
if (cartOverlay) cartOverlay.addEventListener('click', hideCart);

// Render items in Cart Drawer HTML
function renderCartDrawer() {
  const listContainer = document.getElementById('cart-items-list');
  const summaryFooter = document.getElementById('cart-summary-footer');
  const subtotalLabel = document.getElementById('cart-subtotal-val');
  
  if (!listContainer) return;
  
  if (cart.length === 0) {
    listContainer.innerHTML = `
      <div class="cart-empty-state">
        <i class="fa-solid fa-basket-shopping"></i>
        <p data-trn="cart_empty">Your cart is empty. Let's add some delicious dishes!</p>
        <a href="/menu" class="btn btn-primary" data-trn="view_menu">View Menu</a>
      </div>
    `;
    if (summaryFooter) summaryFooter.style.display = 'none';
    
    // retranslate empty state
    const cachedLang = localStorage.getItem('gusto_lang') || 'en';
    if (typeof setLanguage === 'function') setLanguage(cachedLang);
    return;
  }
  
  let subtotal = 0.0;
  let html = '';
  
  cart.forEach(item => {
    const price = parseFloat(item.price);
    const qty = parseInt(item.quantity);
    subtotal += price * qty;
    
    html += `
      <div class="cart-item">
        <img src="${item.image_url}" alt="${item.name}" class="cart-item-img">
        <div class="cart-item-details">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">$${price.toFixed(2)}</div>
          <div class="cart-item-qty-control">
            <button class="qty-btn" onclick="changeQuantity(${item.id}, -1)">-</button>
            <span class="qty-val">${qty}</span>
            <button class="qty-btn" onclick="changeQuantity(${item.id}, 1)">+</button>
            <button class="remove-item-btn" onclick="removeFromCart(${item.id})" aria-label="Remove item"><i class="fa-regular fa-trash-can"></i></button>
          </div>
        </div>
      </div>
    `;
  });
  
  listContainer.innerHTML = html;
  if (subtotalLabel) subtotalLabel.innerText = `$${subtotal.toFixed(2)}`;
  if (summaryFooter) summaryFooter.style.display = 'block';
}

// Bind quick add buttons globally
document.addEventListener('click', function(e) {
  if (e.target && e.target.classList.contains('quick-add-btn')) {
    const id = e.target.getAttribute('data-id');
    const name = e.target.getAttribute('data-name');
    const price = e.target.getAttribute('data-price');
    const img = e.target.getAttribute('data-img');
    addToCart(id, name, price, img);
  }
});

// Startup load
window.addEventListener('DOMContentLoaded', initCart);
