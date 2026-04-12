/**
 * LearnUP — Main Application Bootstrapper
 * Loads all templates, initializes routing, renders views
 */

/**
 * Template paths cho lazy loading
 */
const TEMPLATE_PATHS = [
    'pages/auth/login.html',
    'pages/auth/register.html',
    'pages/articles/articles-list.html',
    'pages/articles/article-detail.html',
    'pages/vocabulary/vocabulary.html',
    'pages/quiz/quiz.html',
    'admin/admin.html',
];

/**
 * Views that require authentication
 */
const PROTECTED_VIEWS = [
    'articles', 'article-detail', 'vocabulary', 'quiz',
    'user-dashboard', 'admin-articles', 'admin-categories'
];

/**
 * Load all HTML templates into the DOM
 */
async function loadTemplates() {
    for (const path of TEMPLATE_PATHS) {
        try {
            const response = await fetch(path);
            if (response.ok) {
                const html = await response.text();
                document.body.insertAdjacentHTML('beforeend', html);
            }
        } catch (error) {
            console.warn(`Failed to load template: ${path}`, error);
        }
    }
}

/**
 * Main render function — renders the current view
 */
function renderApp() {
    const container = document.getElementById('app-container');
    if (!container) return;

    // AUTH GUARD: redirect to login if not authenticated
    if (PROTECTED_VIEWS.includes(AppState.currentView) && !isLoggedIn()) {
        AppState.currentView = 'login';
    }

    // Map view names to template IDs and event handlers
    const viewConfig = {
        'login':            { templateId: 'login-template',          events: attachLoginEvents },
        'register':         { templateId: 'register-template',       events: attachRegisterEvents },
        'articles':         { templateId: 'articles-template',       events: attachArticlesEvents },
        'article-detail':   { templateId: 'article-detail-template', events: attachArticleDetailEvents },
        'vocabulary':       { templateId: 'vocabulary-template',     events: attachVocabularyEvents },
        'quiz':             { templateId: 'quiz-template',           events: attachQuizEvents },
        'user-dashboard':   { templateId: 'user-dashboard-template', events: attachDashboardEvents },
        'admin-articles':   { templateId: 'admin-articles-template', events: attachAdminArticlesEvents },
        'admin-categories': { templateId: 'admin-categories-template', events: attachAdminCategoriesEvents },
    };

    const config = viewConfig[AppState.currentView];
    if (!config) {
        console.error(`Unknown view: ${AppState.currentView}`);
        return;
    }

    const template = document.getElementById(config.templateId);
    if (!template) {
        console.error(`Template not found: ${config.templateId}`);
        return;
    }

    container.innerHTML = '';
    const content = template.content.cloneNode(true);
    container.appendChild(content);

    // Attach events for the current view
    if (typeof config.events === 'function') {
        config.events();
    }

    // Auto-attach logout dropdown for authenticated views
    if (PROTECTED_VIEWS.includes(AppState.currentView)) {
        attachUserDropdownEvents();
    }
}

/**
 * Setup user dropdown (avatar click -> show menu with logout)
 * Works on any page that has .user-profile element
 */
function attachUserDropdownEvents() {
    const dropdowns = document.querySelectorAll('.user-profile-dropdown');

    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.user-profile-toggle');
        const menu = dropdown.querySelector('.user-dropdown-menu');

        if (!toggle || !menu) return;

        // Update display name
        const nameEl = dropdown.querySelector('.user-dropdown-name');
        if (nameEl) {
            nameEl.textContent = getUserDisplayName();
        }

        // Toggle menu on click
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.classList.toggle('show');
        });

        // Logout button
        const logoutBtn = menu.querySelector('.logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                logout();
            });
        }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        document.querySelectorAll('.user-dropdown-menu.show').forEach(m => {
            m.classList.remove('show');
        });
    });
}

/**
 * Dashboard events
 */
function attachDashboardEvents() {
    // Navigation links
    const navLinks = {
        'nav-dash-articles': 'articles',
        'nav-dash-library': 'vocabulary',
        'nav-dash-quiz': 'quiz',
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

    // Dashboard tabs
    const tabs = document.querySelectorAll('.dash-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const target = tab.dataset.target;
            document.querySelectorAll('.dash-content-view').forEach(view => {
                view.style.display = 'none';
                view.classList.remove('active');
            });

            const targetView = document.getElementById(`dash-view-${target}`);
            if (targetView) {
                targetView.style.display = '';
                targetView.classList.add('active');
            }
        });
    });

    // Weekly progress chart
    const chartCanvas = document.getElementById('weeklyProgressChart');
    if (chartCanvas && typeof Chart !== 'undefined') {
        new Chart(chartCanvas, {
            type: 'bar',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Minutes',
                    data: [30, 45, 25, 50, 40, 60, 35],
                    backgroundColor: '#3b82f6',
                    borderRadius: 6,
                    borderSkipped: false,
                    barPercentage: 0.5,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { color: '#94a3b8' } },
                    x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
                }
            }
        });
    }
}

/**
 * Admin Articles events — delegates to admin.js
 */
function attachAdminArticlesEvents() {
    if (typeof initAdminArticles === 'function') {
        initAdminArticles();
    }
}

/**
 * Admin Categories events — delegates to admin.js
 */
function attachAdminCategoriesEvents() {
    if (typeof initAdminCategories === 'function') {
        initAdminCategories();
    }
}

/**
 * App initialization
 */
document.addEventListener('DOMContentLoaded', async () => {
    // Load all HTML templates
    await loadTemplates();

    // Restore user from localStorage
    loadUser();

    // Check if user is already logged in with valid token
    if (isLoggedIn()) {
        AppState.currentView = 'articles';
    } else {
        // Force login view — clear any stale state
        AppState.currentView = 'login';
    }

    // Initial render
    renderApp();
});