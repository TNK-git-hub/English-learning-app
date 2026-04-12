/**
 * Article Card Component — Tạo card bài viết
 * Extracted from app.js createArticleCard()
 */

/**
 * Tạo HTML cho article card
 * @param {object} article - Dữ liệu bài viết
 * @returns {string} HTML string
 */
function createArticleCard(article) {
    const isBookmarked = AppState.bookmarkedArticles.includes(article.id);
    const imageUrl = article.image_url || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400&q=80';
    // Backend may return tags as array or comma-separated string
    const tags = Array.isArray(article.tags) ? article.tags : (article.tags ? article.tags.split(',').map(t => t.trim()) : []);
    const firstTag = tags.length > 0 ? tags[0] : 'General';

    return `
        <div class="article-card" data-article-id="${article.id}">
            <div class="card-img-wrapper">
                <img src="${imageUrl}" alt="${escapeHtml(article.title)}" 
                     onerror="this.src='https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400&q=80'">
            </div>
            <div class="card-content">
                <span class="category-tag">${escapeHtml(firstTag)}</span>
                <h3>${escapeHtml(article.title)}</h3>
                <p>${truncateText(article.description || article.content, 120)}</p>
                <div class="card-footer">
                    <div class="author">
                        <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(article.author || 'Author')}&background=2563eb&color=fff&size=32" alt="Author">
                        <span>${escapeHtml(article.author || 'LearnUP')}</span>
                    </div>
                    <button class="bookmark-btn ${isBookmarked ? 'active' : ''}" data-id="${article.id}">
                        <i class="${isBookmarked ? 'fas' : 'far'} fa-bookmark"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}
