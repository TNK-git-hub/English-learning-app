/**
 * Articles List Page — Fetch articles, render grid with pagination, filters, navigation
 */

const ARTICLES_PER_PAGE = 6;

/**
 * Fetch articles từ API và render lên grid
 */
async function fetchArticles() {
    try {
        const articles = await fetchArticlesAPI();
        AppState.articles = articles;
        AppState.filteredArticles = articles;
        AppState.currentPage = 1;
        renderArticlesGrid();
    } catch (error) {
        console.error('Failed to fetch articles:', error);
        const grid = document.getElementById('articles-grid');
        if (grid) {
            grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 60px; color: #94a3b8;">
                <i class="fas fa-exclamation-circle" style="font-size: 32px; margin-bottom: 16px; display: block;"></i>
                Failed to load articles. Please try again later.
            </div>`;
        }
    }
}

/**
 * Render articles grid với phân trang
 */
function renderArticlesGrid() {
    const grid = document.getElementById('articles-grid');
    if (!grid) return;

    const articles = AppState.filteredArticles;

    if (articles.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 60px; color: #94a3b8;">
            No articles found.
        </div>`;
        renderPagination(0, 0);
        return;
    }

    // Tính toán phân trang
    const totalPages = Math.ceil(articles.length / ARTICLES_PER_PAGE);

    // Đảm bảo currentPage hợp lệ
    if (AppState.currentPage < 1) AppState.currentPage = 1;
    if (AppState.currentPage > totalPages) AppState.currentPage = totalPages;

    const startIndex = (AppState.currentPage - 1) * ARTICLES_PER_PAGE;
    const endIndex = startIndex + ARTICLES_PER_PAGE;
    const pageArticles = articles.slice(startIndex, endIndex);

    // Render các bài viết của trang hiện tại
    grid.innerHTML = pageArticles.map(article => createArticleCard(article)).join('');

    // Attach click events for cards
    grid.querySelectorAll('.article-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('.bookmark-btn')) return;

            const articleId = card.dataset.articleId;
            const article = AppState.articles.find(a => a.id == articleId);
            if (article) {
                AppState.selectedArticle = article;
                animateTransition('article-detail');
            }
        });
    });

    // Attach bookmark events
    attachBookmarkEvents();

    // Render pagination
    renderPagination(totalPages, articles.length);

    // Scroll lên đầu content khi chuyển trang
    const contentArea = document.querySelector('.content-area');
    if (contentArea) {
        contentArea.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

/**
 * Render pagination buttons
 */
function renderPagination(totalPages, totalArticles) {
    const paginationEl = document.getElementById('articles-pagination');
    const infoEl = document.getElementById('pagination-info');

    if (!paginationEl) return;

    // Info text
    if (infoEl) {
        if (totalArticles === 0) {
            infoEl.textContent = '';
        } else {
            const start = (AppState.currentPage - 1) * ARTICLES_PER_PAGE + 1;
            const end = Math.min(AppState.currentPage * ARTICLES_PER_PAGE, totalArticles);
            infoEl.textContent = `Showing ${start}–${end} of ${totalArticles} articles`;
        }
    }

    // Nếu chỉ có 1 trang thì ẩn pagination
    if (totalPages <= 1) {
        paginationEl.innerHTML = '';
        return;
    }

    let html = '';

    // Nút Previous
    html += `<button class="icon-btn ${AppState.currentPage === 1 ? 'disabled' : ''}" 
             data-page="${AppState.currentPage - 1}" 
             ${AppState.currentPage === 1 ? 'disabled' : ''}>
             <i class="fa-solid fa-chevron-left"></i></button>`;

    // Tạo danh sách page numbers (thông minh với ellipsis)
    const pages = getPaginationRange(AppState.currentPage, totalPages);

    pages.forEach(page => {
        if (page === '...') {
            html += `<span class="ellipsis">…</span>`;
        } else {
            html += `<button class="page-btn ${page === AppState.currentPage ? 'active' : ''}" 
                     data-page="${page}">${page}</button>`;
        }
    });

    // Nút Next
    html += `<button class="icon-btn ${AppState.currentPage === totalPages ? 'disabled' : ''}" 
             data-page="${AppState.currentPage + 1}" 
             ${AppState.currentPage === totalPages ? 'disabled' : ''}>
             <i class="fa-solid fa-chevron-right"></i></button>`;

    paginationEl.innerHTML = html;

    // Attach click events cho pagination buttons
    paginationEl.querySelectorAll('button[data-page]').forEach(btn => {
        btn.addEventListener('click', () => {
            const page = parseInt(btn.dataset.page);
            if (page >= 1 && page <= totalPages && page !== AppState.currentPage) {
                AppState.currentPage = page;
                renderArticlesGrid();
            }
        });
    });
}

/**
 * Tạo range pagination thông minh với ellipsis
 * Ví dụ: [1, 2, 3, '...', 10] hoặc [1, '...', 5, 6, 7, '...', 10]
 */
function getPaginationRange(current, total) {
    if (total <= 7) {
        // Hiển thị tất cả
        return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages = [];

    // Luôn hiển thị trang 1
    pages.push(1);

    if (current <= 3) {
        // Gần đầu: 1 2 3 4 ... total
        pages.push(2, 3, 4, '...', total);
    } else if (current >= total - 2) {
        // Gần cuối: 1 ... (total-3) (total-2) (total-1) total
        pages.push('...', total - 3, total - 2, total - 1, total);
    } else {
        // Ở giữa: 1 ... (current-1) current (current+1) ... total
        pages.push('...', current - 1, current, current + 1, '...', total);
    }

    return pages;
}

/**
 * Attach bookmark button events
 */
function attachBookmarkEvents() {
    document.querySelectorAll('.bookmark-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            const index = AppState.bookmarkedArticles.indexOf(id);

            if (index > -1) {
                AppState.bookmarkedArticles.splice(index, 1);
                btn.classList.remove('active');
                btn.querySelector('i').classList.replace('fas', 'far');
            } else {
                AppState.bookmarkedArticles.push(id);
                btn.classList.add('active');
                btn.querySelector('i').classList.replace('far', 'fas');
            }
        });
    });
}

/**
 * Attach events cho articles page
 */
function attachArticlesEvents() {
    // Navigation links
    const navLinks = {
        'nav-articles-library': 'vocabulary',
        'nav-articles-quiz': 'quiz',
        'nav-articles-dashboard': 'user-dashboard',
    };

    Object.entries(navLinks).forEach(([id, view]) => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                animateTransition(view);
            });
        }
    });

    // View toggles (grid/list)
    const viewToggleBtns = document.querySelectorAll('.view-toggles button');
    viewToggleBtns.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            viewToggleBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const grid = document.getElementById('articles-grid');
            if (grid) {
                grid.classList.toggle('list-view', index === 1);
            }
        });
    });

    // Fetch articles
    fetchArticles();
}
