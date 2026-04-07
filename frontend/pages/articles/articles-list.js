/**
 * Articles List Page — fetch, display, filter, search articles.
 */
import { navigateTo } from '../../utils/router.js';
import { getArticles } from '../../services/article-service.js';
import { state } from '../../utils/state.js';
import { truncateText } from '../../utils/helpers.js';

export const TEMPLATE_ID = 'articles-template';

export function init() {
    attachFilterEvents();
    attachNavEvents();
    attachSearchEvents();
    fetchAndRenderArticles();
}

// ===== Fetch & Render Articles from API =====
async function fetchAndRenderArticles(page = 1, search = '', tag = '') {
    const grid = document.getElementById('articles-grid');
    const discoverText = document.querySelector('.discover-texts p');

    try {
        const data = await getArticles(page, 10, search, tag);

        if (data.success && data.data.length > 0) {
            grid.innerHTML = '';

            if (discoverText) {
                discoverText.textContent = `Showing ${data.total} articles based on your interests`;
            }

            data.data.forEach(article => {
                const card = createArticleCard(article);
                grid.appendChild(card);
            });

            attachBookmarkEvents();
        } else {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #94a3b8;">
                    <i class="fa-solid fa-newspaper" style="font-size: 48px; margin-bottom: 16px; display: block;"></i>
                    <h3 style="color: #64748b; margin-bottom: 8px;">No articles found</h3>
                    <p>Run <code>python -m scripts.seed_data</code> to add sample articles.</p>
                </div>
            `;
            if (discoverText) discoverText.textContent = 'No articles available';
        }
    } catch (error) {
        console.error('Fetch articles error:', error);
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #ef4444;">
                <i class="fa-solid fa-triangle-exclamation" style="font-size: 48px; margin-bottom: 16px; display: block;"></i>
                <h3 style="margin-bottom: 8px;">Cannot connect to server</h3>
                <p style="color: #94a3b8;">Make sure FastAPI is running on <code>http://localhost:8001</code></p>
            </div>
        `;
    }
}

// ===== Create Article Card Element =====
function createArticleCard(article) {
    const el = document.createElement('article');
    el.className = 'article-card';

    const preview = truncateText(article.content, 100);
    const avatarId = Math.floor(Math.random() * 50) + 1;

    el.innerHTML = `
        <div class="card-img-wrapper">
            <img src="${article.image_url || 'https://images.unsplash.com/photo-1557683316-973673baf926?w=500&q=80'}" 
                 alt="${article.title}" 
                 onerror="this.src='https://images.unsplash.com/photo-1557683316-973673baf926?w=500&q=80'">
        </div>
        <div class="card-content">
            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                ${article.tags.map(tag => `<span class="category-tag">${tag.toUpperCase()}</span>`).join('')}
            </div>
            <h3>${article.title}</h3>
            <p>${preview}</p>
            <div class="card-footer">
                <div class="author">
                    <img src="https://i.pravatar.cc/150?img=${avatarId}" alt="Author">
                    <span>EngVocabLearn</span>
                </div>
                <button class="bookmark-btn"><i class="fa-regular fa-bookmark"></i></button>
            </div>
        </div>
    `;

    el.style.cursor = 'pointer';
    el.addEventListener('click', (e) => {
        if (e.target.closest('.bookmark-btn') || e.target.closest('.author')) return;
        state.selectedArticle = article;
        navigateTo('article-detail');
    });

    return el;
}

// ===== Bookmark Toggle =====
function attachBookmarkEvents() {
    document.querySelectorAll('.bookmark-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
            btn.innerHTML = btn.classList.contains('active')
                ? '<i class="fa-solid fa-bookmark" style="color: #2563eb;"></i>'
                : '<i class="fa-regular fa-bookmark"></i>';
        });
    });
}

// ===== Search Events =====
function attachSearchEvents() {
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                fetchAndRenderArticles(1, searchInput.value.trim());
            }, 400);
        });
    }
}

// ===== Filter Sidebar Events =====
function attachFilterEvents() {
    const activeFiltersContainer = document.querySelector('.active-filters');
    const activeTagsContainer = document.getElementById('active-tags-container');
    const checkboxes = document.querySelectorAll('.custom-checkbox input[type="checkbox"]');
    const radios = document.querySelectorAll('.custom-radio input[type="radio"]');
    const resetBtn = document.querySelector('.btn-text');

    let appliedElements = [];

    function renderActiveFilters() {
        if (!activeTagsContainer) return;
        activeTagsContainer.innerHTML = '';

        appliedElements.forEach(el => {
            const tag = document.createElement('div');
            tag.className = 'active-tag';
            tag.innerHTML = `${el.value} <button><i class="fa-solid fa-xmark"></i></button>`;

            tag.querySelector('button').addEventListener('click', () => {
                el.checked = false;
                appliedElements = appliedElements.filter(e => e !== el);
                renderActiveFilters();
            });
            activeTagsContainer.appendChild(tag);
        });

        if (activeFiltersContainer) {
            activeFiltersContainer.style.display = appliedElements.length > 0 ? 'flex' : 'none';
        }
    }

    const applyBtn = document.querySelector('.apply-btn');
    if (applyBtn) {
        applyBtn.addEventListener('click', () => {
            appliedElements = [];
            checkboxes.forEach(cb => { if (cb.checked) appliedElements.push(cb); });
            radios.forEach(radio => { if (radio.checked) appliedElements.push(radio); });
            renderActiveFilters();

            // Get selected tag and trigger search
            const selectedTags = appliedElements
                .filter(el => el.type === 'checkbox')
                .map(el => el.value);
            const tag = selectedTags.length > 0 ? selectedTags[0] : '';
            const searchInput = document.querySelector('.search-bar input');
            const search = searchInput ? searchInput.value.trim() : '';
            fetchAndRenderArticles(1, search, tag);
        });
    }

    // View toggle (grid/list)
    const viewToggles = document.querySelectorAll('.view-toggles button');
    const articlesGrid = document.querySelector('.articles-grid');

    if (viewToggles.length >= 2 && articlesGrid) {
        viewToggles[0].addEventListener('click', () => {
            viewToggles[0].classList.add('active');
            viewToggles[1].classList.remove('active');
            articlesGrid.classList.remove('list-view');
        });
        viewToggles[1].addEventListener('click', () => {
            viewToggles[1].classList.add('active');
            viewToggles[0].classList.remove('active');
            articlesGrid.classList.add('list-view');
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            checkboxes.forEach(cb => cb.checked = false);
            radios.forEach(radio => radio.checked = false);
            appliedElements = [];
            renderActiveFilters();
            fetchAndRenderArticles();
        });
    }
}

// ===== Navigation Events =====
function attachNavEvents() {
    const navLinks = document.querySelectorAll('.main-nav a');
    navLinks.forEach(link => {
        if (link.textContent.trim() === 'Dashboard') {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                navigateTo('admin-articles');
            });
        } else if (link.textContent.trim() === 'Library') {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                navigateTo('vocabulary');
            });
        }
    });
}
