/* Gusto Italiano & Cafe - AI Recommendation Controller */

const openAiQuizBtn = document.getElementById('open-ai-quiz-btn');
const closeAiQuizBtn = document.getElementById('close-ai-quiz-btn');
const aiQuizModal = document.getElementById('ai-quiz-modal-overlay');
const submitQuizBtn = document.getElementById('submit-ai-quiz-btn');
const retakeQuizBtn = document.getElementById('retake-ai-quiz-btn');

const quizQuestionsView = document.getElementById('ai-quiz-questions');
const quizResultsView = document.getElementById('ai-quiz-results');
const recommendationsList = document.getElementById('ai-recommendations-list');

if (openAiQuizBtn && aiQuizModal) {
  openAiQuizBtn.addEventListener('click', () => {
    aiQuizModal.classList.add('active');
    quizQuestionsView.style.display = 'block';
    quizResultsView.style.display = 'none';
  });
}

const hideQuizModal = () => {
  if (aiQuizModal) aiQuizModal.classList.remove('active');
};

if (closeAiQuizBtn) closeAiQuizBtn.addEventListener('click', hideQuizModal);

if (submitQuizBtn) {
  submitQuizBtn.addEventListener('click', function(e) {
    e.preventDefault();
    
    const category = document.getElementById('ai-q-category').value;
    const flavor = document.getElementById('ai-q-flavor').value;
    
    fetch('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, flavor })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success && data.items.length > 0) {
        renderRecommendations(data.items);
        quizQuestionsView.style.display = 'none';
        quizResultsView.style.display = 'block';
      } else {
        showToast('No recommendations found for this specific combo. Try another!', 'warning');
      }
    })
    .catch(() => showToast('Failed to fetch recommendations', 'error'));
  });
}

if (retakeQuizBtn) {
  retakeQuizBtn.addEventListener('click', () => {
    quizQuestionsView.style.display = 'block';
    quizResultsView.style.display = 'none';
  });
}

function renderRecommendations(items) {
  if (!recommendationsList) return;
  
  let html = '';
  items.forEach(item => {
    html += `
      <div style="display: flex; gap: 15px; border-bottom: 1px solid var(--border); padding-bottom: 15px; align-items: center;">
        <img src="${item.image_url}" alt="${item.name}" style="width: 80px; height: 80px; border-radius: 6px; object-fit: cover;">
        <div style="flex: 1;">
          <h4 style="font-family: var(--font-display); font-size: 1.1rem; margin-bottom: 5px;">${item.name}</h4>
          <p style="font-size: 0.75rem; color: var(--text-secondary); line-height: 1.4; margin-bottom: 8px;">${item.description}</p>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 700; color: var(--accent);">$${parseFloat(item.price).toFixed(2)}</span>
            <button class="btn btn-primary" onclick="addToCartFromAI(${item.id}, '${item.name}', ${item.price}, '${item.image_url}')" style="padding: 6px 12px; font-size: 0.75rem;">Add to Cart</button>
          </div>
        </div>
      </div>
    `;
  });
  
  recommendationsList.innerHTML = html;
}

// Wrapper for quick-add in AI dialog
window.addToCartFromAI = function(id, name, price, img) {
  if (typeof addToCart === 'function') {
    addToCart(id, name, price, img);
    hideQuizModal();
  }
};
