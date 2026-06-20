/* Gusto Italiano & Cafe - Admin Dashboard Controller */

// Switch Tabs
function switchAdminPanel(panelId, menuElement) {
  // Update sidebar active status
  document.querySelectorAll('.admin-menu-item').forEach(item => item.classList.remove('active'));
  if (menuElement) menuElement.classList.add('active');
  
  // Update panel display
  document.querySelectorAll('.admin-panel').forEach(panel => panel.classList.remove('active'));
  
  const target = document.getElementById(`panel-${panelId}`);
  if (target) target.classList.add('active');
}

// Fetch KPI Stats on Load
function fetchDashboardKPIs() {
  fetch('/api/admin/stats')
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      const stats = data.stats;
      document.getElementById('sales-kpi').innerText = `$${parseFloat(stats.total_sales).toFixed(2)}`;
      document.getElementById('orders-kpi').innerText = stats.total_orders;
      document.getElementById('reservations-kpi').innerText = stats.total_reservations;
      document.getElementById('subs-kpi').innerText = stats.total_subscribers;
    }
  })
  .catch(err => console.error("Error loading dashboard metrics", err));
}

// Update Order Status
function updateOrderStatus(orderId, status) {
  fetch('/api/admin/order/status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ order_id: orderId, status: status })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      showToast(data.message, 'success');
      // Update color coded status pill
      const pill = document.getElementById(`pill-order-${orderId}`);
      if (pill) {
        pill.className = `status-pill ${status}`;
        pill.innerText = status;
      }
      fetchDashboardKPIs(); // Refresh metrics
    } else {
      showToast(data.message, 'error');
    }
  })
  .catch(() => showToast('Failed to modify order status', 'error'));
}

// Update Reservation Status
function setReservationStatus(resId, status) {
  fetch('/api/admin/reserve/status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reservation_id: resId, status: status })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      showToast(data.message, 'success');
      const pill = document.getElementById(`pill-reserve-${resId}`);
      if (pill) {
        pill.className = `status-pill ${status}`;
        pill.innerText = status;
      }
      fetchDashboardKPIs(); // Refresh metrics
    } else {
      showToast(data.message, 'error');
    }
  })
  .catch(() => showToast('Failed to modify reservation status', 'error'));
}

// CRUD: Add Menu Item
const addMenuForm = document.getElementById('add-menu-item-form');
if (addMenuForm) {
  addMenuForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('new-item-name').value;
    const price = document.getElementById('new-item-price').value;
    const category = document.getElementById('new-item-category').value;
    const image_url = document.getElementById('new-item-img').value;
    const description = document.getElementById('new-item-desc').value;
    const ingredients = document.getElementById('new-item-ingredients').value;
    const is_popular = document.getElementById('new-item-popular').checked ? 1 : 0;
    const is_available = document.getElementById('new-item-available').checked ? 1 : 0;
    
    fetch('/api/admin/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name, price, category, image_url, description, ingredients, is_popular, is_available
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showToast(data.message, 'success');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        showToast(data.message, 'error');
      }
    })
    .catch(() => showToast('Failed to create menu item', 'error'));
  });
}

// CRUD: Delete Menu Item
function deleteMenuItem(itemId) {
  if (!confirm("Are you sure you want to delete this dish from the menu?")) return;
  
  fetch(`/api/admin/menu/delete/${itemId}`, { method: 'POST' })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      showToast(data.message, 'success');
      const row = document.getElementById(`row-menu-${itemId}`);
      if (row) row.remove();
    } else {
      showToast(data.message, 'error');
    }
  })
  .catch(() => showToast('Failed to delete menu item', 'error'));
}

// moderate customer review
function moderateReview(reviewId, action) {
  fetch('/api/admin/reviews/approve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ review_id: reviewId, action: action })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      showToast(data.message, 'success');
      if (action === 'delete') {
        const row = document.getElementById(`row-review-${reviewId}`);
        if (row) row.remove();
      } else {
        const pill = document.getElementById(`pill-review-${reviewId}`);
        if (pill) {
          if (action === 'approve') {
            pill.className = "status-pill confirmed";
            pill.innerText = "Approved";
          } else {
            pill.className = "status-pill pending";
            pill.innerText = "Pending";
          }
        }
      }
    } else {
      showToast(data.message, 'error');
    }
  })
  .catch(() => showToast('Failed to moderate review', 'error'));
}

// CRUD: Create Promo Coupon
const createCouponForm = document.getElementById('create-coupon-form');
if (createCouponForm) {
  createCouponForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const code = document.getElementById('new-coupon-code').value;
    const discount_value = document.getElementById('new-coupon-value').value;
    const discount_type = document.getElementById('new-coupon-type').value;
    const min_order_value = document.getElementById('new-coupon-min').value;
    const expiry_date = document.getElementById('new-coupon-expiry').value;
    
    fetch('/api/admin/coupon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code, discount_value, discount_type, min_order_value, expiry_date
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showToast(data.message, 'success');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        showToast(data.message, 'error');
      }
    })
    .catch(() => showToast('Failed to create coupon code', 'error'));
  });
}

// CRUD: Delete Coupon
function deleteCoupon(couponId) {
  if (!confirm("Are you sure you want to delete this coupon code?")) return;
  
  fetch(`/api/admin/coupon/delete/${couponId}`, { method: 'POST' })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      showToast(data.message, 'success');
      const row = document.getElementById(`row-coupon-${couponId}`);
      if (row) row.remove();
    } else {
      showToast(data.message, 'error');
    }
  })
  .catch(() => showToast('Failed to delete coupon code', 'error'));
}

// Initial dashboard load stats
window.addEventListener('DOMContentLoaded', fetchDashboardKPIs);
