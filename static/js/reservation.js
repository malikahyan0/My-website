/* Gusto Italiano & Cafe - Table Booking Controller */

const reservationForm = document.getElementById('reservation-form');
const bookingCardPanel = document.getElementById('booking-card-panel');

if (reservationForm && bookingCardPanel) {
  reservationForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('res-name').value;
    const email = document.getElementById('res-email').value;
    const phone = document.getElementById('res-phone').value;
    const date = document.getElementById('res-date').value;
    const time = document.getElementById('res-time').value;
    const guests = document.getElementById('res-guests').value;
    const special_requests = document.getElementById('res-requests').value;
    
    // AJAX Request to reservation endpoint
    fetch('/api/reserve/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name, email, phone, date, time, guests, special_requests
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showToast(data.message, 'success');
        
        // Render confirmation ticket voucher
        renderBookingTicket(data.reservation_id, name, date, time, guests);
      } else {
        showToast(data.message, 'error');
      }
    })
    .catch(() => showToast('Failed to connect to reservation service. Please try again.', 'error'));
  });
}

function renderBookingTicket(id, name, date, time, guests) {
  bookingCardPanel.innerHTML = `
    <div style="border: 2px dashed var(--accent); border-radius: 8px; padding: 30px; text-align: center; background-color: var(--bg-secondary); position: relative; animation: fadeIn 0.8s ease;">
      <i class="fa-solid fa-circle-check" style="font-size: 3.5rem; color: var(--success); margin-bottom: 20px;"></i>
      <h3 style="font-family: var(--font-display); font-size: 1.6rem; margin-bottom: 5px;">Reservation Confirmed!</h3>
      <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 25px;">Voucher reference: <strong>#GUSTO-RES-${id}</strong></p>
      
      <div style="max-width: 350px; margin: 0 auto; text-align: left; font-size: 0.9rem; border-top: 1px solid var(--border); padding-top: 20px; border-bottom: 1px solid var(--border); padding-bottom: 20px; margin-bottom: 25px;">
        <p style="margin-bottom: 8px;"><strong>Guest Name:</strong> ${name}</p>
        <p style="margin-bottom: 8px;"><strong>Date:</strong> ${date}</p>
        <p style="margin-bottom: 8px;"><strong>Time Slot:</strong> ${time} PM</p>
        <p><strong>Table Size:</strong> ${guests} Guest(s)</p>
      </div>
      
      <p style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 20px;">
        A confirmation receipt has been sent to your email. We look forward to welcoming you to Gusto Italiano!
      </p>
      
      <button class="btn btn-secondary" onclick="window.location.reload()">Book Another Table</button>
    </div>
  `;
}
