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
    'user-dashboard', 'admin-articles', 'admin-categories', 'admin-users'
];

const ADMIN_VIEWS = ['admin-articles', 'admin-categories', 'admin-users'];

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

    // ADMIN GUARD: redirect non-admins away from admin pages
    if (ADMIN_VIEWS.includes(AppState.currentView)) {
        if (!AppState.user || AppState.user.role !== 'admin') {
            AppState.currentView = 'articles';
        }
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
        'admin-users':      { templateId: 'admin-users-template',      events: attachAdminUsersEvents },
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
 * Dashboard events — loads real data from /api/users/dashboard
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

    // Fetch real dashboard data and populate
    _loadDashboardData();
}

/**
 * Fetches /api/users/dashboard and populates all dynamic elements.
 */
async function _loadDashboardData() {
    // --- Greeting ---
    const userName = getUserDisplayName() || 'there';
    const greetEl = document.getElementById('dash-greeting-text');
    if (greetEl) greetEl.textContent = `Hello, ${userName}! 👋`;

    try {
        const res = await apiFetch('/api/users/dashboard');
        if (!res.success) return;
        const d = res.data;

        // ── Vocabulary stats ──────────────────────────────────────────
        const totalWords = d.vocab.total;
        const todayWords = d.vocab.today;
        const weekWords  = d.vocab.this_week;

        // Words learned stat card
        const wordsEl = document.getElementById('overview-stat-words');
        if (wordsEl) wordsEl.textContent = totalWords.toLocaleString();

        // Words-trend badge: show today's additions
        const wordsTrendEl = document.getElementById('overview-stat-words-trend');
        if (wordsTrendEl) wordsTrendEl.textContent = `+${todayWords} today`;

        // ── Quiz stats ────────────────────────────────────────────────
        const quizTotal    = d.quiz.total_attempts;
        const quizCorrect  = d.quiz.total_correct;
        const quizQ        = d.quiz.total_questions;
        const bestScore    = d.quiz.best_score_pct;
        const overallPct   = quizQ > 0 ? Math.round(quizCorrect / quizQ * 100) : 0;

        // Flashcards card → repurpose to show quiz attempts
        const cardsEl = document.getElementById('overview-stat-cards');
        if (cardsEl) cardsEl.textContent = quizTotal;
        const cardsTrendEl = document.getElementById('overview-stat-cards-trend');
        if (cardsTrendEl) cardsTrendEl.textContent = `${bestScore}% best`;

        // Articles read card → total quiz questions answered
        const artEl = document.getElementById('overview-stat-articles');
        if (artEl) artEl.textContent = quizQ;
        const artTrendEl = document.getElementById('overview-stat-art-trend');
        if (artTrendEl) artTrendEl.textContent = `${overallPct}% acc.`;

        // ── Daily goal circle (based on today's vocab vs goal of 10) ──
        const DAILY_GOAL = 10;
        const dailyPct = Math.min(100, Math.round(todayWords / DAILY_GOAL * 100));
        const circumference = 2 * Math.PI * 50; // r=50
        const offset = circumference - (dailyPct / 100) * circumference;

        const circle = document.getElementById('overview-daily-circle');
        if (circle) {
            circle.style.strokeDasharray = circumference;
            circle.style.strokeDashoffset = offset;
        }
        const pctText = document.getElementById('overview-daily-percent');
        if (pctText) pctText.textContent = `${dailyPct}%`;

        const curEl = document.getElementById('overview-daily-current');
        if (curEl) curEl.textContent = todayWords;
        const totEl = document.getElementById('overview-daily-total');
        if (totEl) totEl.textContent = DAILY_GOAL;
        const remEl = document.getElementById('overview-daily-remain');
        if (remEl) remEl.textContent = Math.max(0, DAILY_GOAL - todayWords);

        // Update greeting sub-text
        const subEl = document.getElementById('dash-greeting-sub');
        const pctSpan = document.getElementById('dash-greeting-percent');
        if (subEl && pctSpan) {
            pctSpan.textContent = `${dailyPct}%`;
        }

        // ── Weekly chart (words per day, last 7 days) ─────────────────
        const chartCanvas = document.getElementById('weeklyProgressChart');
        if (chartCanvas && typeof Chart !== 'undefined') {
            const days = [];
            const counts = [];
            const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            for (let i = 6; i >= 0; i--) {
                const d2 = new Date();
                d2.setDate(d2.getDate() - i);
                const key = d2.toISOString().split('T')[0];
                days.push(dayLabels[d2.getDay()]);
                counts.push(d.vocab.by_day_last7[key] || 0);
            }
            new Chart(chartCanvas, {
                type: 'bar',
                data: {
                    labels: days,
                    datasets: [{
                        label: 'Words',
                        data: counts,
                        backgroundColor: counts.map((_, idx) =>
                            idx === counts.length - 1 ? '#2563eb' : '#93c5fd'),
                        borderRadius: 6,
                        borderSkipped: false,
                        barPercentage: 0.55,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false },
                        tooltip: { callbacks: {
                            label: ctx => `${ctx.raw} word${ctx.raw !== 1 ? 's' : ''}`
                        }}
                    },
                    scales: {
                        y: { beginAtZero: true, grid: { color: '#f1f5f9' },
                             ticks: { color: '#94a3b8', stepSize: 1 } },
                        x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
                    }
                }
            });
        }

        // ── "Continue Learning" — last 2 articles from DB ─────────────
        const grid = document.getElementById('dash-continue-learning-grid');
        if (grid && d.recent_articles && d.recent_articles.length > 0) {
            const tagIcons = { Sport: 'fa-futbol', Business: 'fa-briefcase',
                Culture: 'fa-masks-theater', Science: 'fa-flask',
                Lifestyle: 'fa-heart', Technology: 'fa-microchip' };
            grid.innerHTML = d.recent_articles.map(art => {
                const tag = art.tags[0] || 'Article';
                const icon = tagIcons[tag] || 'fa-book-open';
                return `
                <div class="dash-continue-card" style="cursor:pointer"
                     onclick="animateTransition('articles')">
                    <div class="continue-tag">
                        <i class="fa-solid ${icon}"></i> ${tag.toUpperCase()}
                    </div>
                    <h4 class="truncate-1">${art.title}</h4>
                    <p class="text-gray" style="font-size:13px;margin-top:8px;">
                        ${art.difficulty} • ${art.tags.join(', ')}
                    </p>
                </div>`;
            }).join('');
        }

        // ── Goals tab: Daily Vocab ─────────────────────────────────────
        const WEEKLY_READ_GOAL = 5;
        const vocabCurrent = document.getElementById('goal-vocab-current');
        if (vocabCurrent) vocabCurrent.textContent = todayWords;
        const vocabBar = document.getElementById('goal-vocab-bar');
        if (vocabBar) vocabBar.style.width = `${dailyPct}%`;
        const vocabPctTxt = document.getElementById('goal-vocab-percent-text');
        if (vocabPctTxt) vocabPctTxt.textContent = `${dailyPct}% Complete`;
        const vocabRemain = document.getElementById('goal-vocab-remain');
        if (vocabRemain) vocabRemain.textContent = Math.max(0, DAILY_GOAL - todayWords);

        // ── Goals tab: Weekly Reading (quiz attempts this week as proxy) ─
        const weeklyAttempts = Math.min(WEEKLY_READ_GOAL, quizTotal);
        const readingPct = Math.round(weeklyAttempts / WEEKLY_READ_GOAL * 100);
        const readingCircumference = 2 * Math.PI * 38; // r=38
        const readingOffset = readingCircumference - (readingPct / 100) * readingCircumference;

        const readCircle = document.getElementById('goal-reading-circle');
        if (readCircle) {
            readCircle.style.strokeDasharray = readingCircumference;
            readCircle.style.strokeDashoffset = readingOffset;
        }
        const readCur = document.getElementById('goal-reading-current');
        if (readCur) readCur.textContent = weeklyAttempts;
        const readPctTxt = document.getElementById('goal-reading-percent-text');
        if (readPctTxt) readPctTxt.textContent = `${readingPct}%`;

        // Step dots
        const dots = document.querySelectorAll('#reading-step-dots .step-dot');
        dots.forEach((dot, idx) => {
            if (idx < weeklyAttempts) {
                dot.classList.add('completed');
                dot.innerHTML = '<i class="fa-solid fa-check"></i>';
            } else {
                dot.classList.remove('completed');
                dot.innerHTML = '<i class="fa-solid fa-minus"></i>';
            }
        });

    } catch (err) {
        console.error('Dashboard load error:', err);
        // Fall back to placeholder chart if fetch fails
        const chartCanvas = document.getElementById('weeklyProgressChart');
        if (chartCanvas && typeof Chart !== 'undefined') {
            new Chart(chartCanvas, {
                type: 'bar',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{ label: 'Words', data: [0,0,0,0,0,0,0],
                        backgroundColor: '#93c5fd', borderRadius: 6,
                        borderSkipped: false, barPercentage: 0.55 }]
                },
                options: { responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true }, x: { grid: { display: false } } }
                }
            });
        }
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
 * Admin Users events — delegates to admin.js
 */
function attachAdminUsersEvents() {
    if (typeof initAdminUsers === 'function') {
        initAdminUsers();
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
        // Restore to admin panel if user is an admin
        AppState.currentView = AppState.user?.role === 'admin' ? 'admin-articles' : 'articles';
    } else {
        // Force login view — clear any stale state
        AppState.currentView = 'login';
    }

    // Initial render
    renderApp();
});