/* Gusto Italiano & Cafe - Gallery and Lightbox Controller */

let galleryImages = [];
let currentImgIndex = 0;

function initGallery() {
  const items = document.querySelectorAll('.gallery-item img');
  galleryImages = Array.from(items).map(img => ({
    src: img.getAttribute('src'),
    alt: img.getAttribute('alt')
  }));
}

// Category filter
function filterGallery(group, btnElement) {
  // Update buttons
  document.querySelectorAll('.gallery-filter-btn').forEach(btn => btn.classList.remove('active'));
  if (btnElement) btnElement.classList.add('active');
  
  const items = document.querySelectorAll('.gallery-item');
  items.forEach(item => {
    const itemGroup = item.getAttribute('data-group');
    if (group === 'all' || itemGroup === group) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  });
}

// Lightbox controller
const lightboxPortal = document.getElementById('lightbox-portal');
const lightboxImg = document.getElementById('lightbox-main-img');
const lightboxCaption = document.getElementById('lightbox-img-caption');
const closeLightboxBtn = document.getElementById('lightbox-close-btn');
const prevBtn = document.getElementById('lightbox-prev-btn');
const nextBtn = document.getElementById('lightbox-next-btn');

function openLightbox(index) {
  if (!lightboxPortal) return;
  currentImgIndex = index;
  updateLightboxContent();
  lightboxPortal.classList.add('active');
}

function updateLightboxContent() {
  if (currentImgIndex >= galleryImages.length) currentImgIndex = 0;
  if (currentImgIndex < 0) currentImgIndex = galleryImages.length - 1;
  
  const image = galleryImages[currentImgIndex];
  if (lightboxImg && lightboxCaption) {
    lightboxImg.setAttribute('src', image.src);
    lightboxCaption.innerText = image.alt;
  }
}

function closeLightbox() {
  if (lightboxPortal) lightboxPortal.classList.remove('active');
}

if (closeLightboxBtn) closeLightboxBtn.addEventListener('click', closeLightbox);
if (prevBtn) prevBtn.addEventListener('click', () => { currentImgIndex--; updateLightboxContent(); });
if (nextBtn) nextBtn.addEventListener('click', () => { currentImgIndex++; updateLightboxContent(); });

// Keyboard controls
window.addEventListener('keydown', function(e) {
  if (lightboxPortal && lightboxPortal.classList.contains('active')) {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') { currentImgIndex--; updateLightboxContent(); }
    if (e.key === 'ArrowRight') { currentImgIndex++; updateLightboxContent(); }
  }
});

// Startup load
window.addEventListener('DOMContentLoaded', () => {
  initGallery();
});
