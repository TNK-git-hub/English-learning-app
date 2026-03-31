const API_BASE_URL = 'http://localhost:8001';

document.addEventListener('DOMContentLoaded', () => {
    const appContainer = document.getElementById('app-container');

    // Initial state
    let state = {
        currentView: 'login' // 'login', 'register', or 'articles'
    };

    // Render function based on state
    function render() {
        if (state.currentView === 'login') {
            const template = document.getElementById('login-template');
            appContainer.innerHTML = '';
            appContainer.appendChild(template.content.cloneNode(true));
            attachLoginEvents();
        } else if (state.currentView === 'register') {
            const template = document.getElementById('register-template');
            appContainer.innerHTML = '';
            appContainer.appendChild(template.content.cloneNode(true));
            attachRegisterEvents();
        } else if (state.currentView === 'articles') {
            const template = document.getElementById('articles-template');
            appContainer.innerHTML = '';
            appContainer.appendChild(template.content.cloneNode(true));
            attachArticlesEvents();
            fetchArticles(); // Gọi API lấy articles từ database
        }
    }

    // --- Events ---
    function attachLoginEvents() {
        const goRegisterBtn = document.getElementById('go-to-register');
        const loginForm = document.getElementById('login-form');

        if (goRegisterBtn) {
            goRegisterBtn.addEventListener('click', (e) => {
                e.preventDefault();
                animateTransition('register');
            });
        }

        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('login-email').value;
                const password = document.getElementById('login-password').value;

                try {
                    const res = await fetch(`${API_BASE_URL}/api/users/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password })
                    });
                    const data = await res.json();

                    if (data.status === 'Success') {
                        animateTransition('articles');
                    } else {
                        alert(data.message || 'Đăng nhập thất bại');
                    }
                } catch (error) {
                    console.error('Login error:', error);
                    alert('Không thể kết nối server. Hãy chắc chắn FastAPI đang chạy trên port 8000.');
                }
            });
        }
    }

    function attachRegisterEvents() {
        const goLoginBtn = document.getElementById('go-to-login');
        const registerForm = document.getElementById('register-form');

        if (goLoginBtn) {
            goLoginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                animateTransition('login');
            });
        }

        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();

                const password = document.getElementById('reg-password').value;
                const confirm = document.getElementById('reg-confirm').value;
                const wrapper = document.getElementById('reg-confirm-wrapper');
                const errorText = document.getElementById('reg-confirm-error');

                if (password !== confirm) {
                    wrapper.classList.add('error');
                    errorText.style.display = 'flex';
                    return;
                }

                wrapper.classList.remove('error');
                errorText.style.display = 'none';

                alert("Registration functionality to be implemented!");
            });
        }
    }

    // ===== Fetch & Render Articles từ Database =====
    async function fetchArticles() {
        const grid = document.getElementById('articles-grid');
        const discoverText = document.querySelector('.discover-texts p');

        try {
            const res = await fetch(`${API_BASE_URL}/api/articles`);
            const data = await res.json();

            if (data.success && data.data.length > 0) {
                // Xóa loading message
                grid.innerHTML = '';

                // Cập nhật text hiển thị số articles
                if (discoverText) {
                    discoverText.textContent = `Showing ${data.total} articles based on your interests`;
                }

                // Render từng article card
                data.data.forEach(article => {
                    const card = createArticleCard(article);
                    grid.appendChild(card);
                });

                // Attach bookmark events cho các cards mới
                attachBookmarkEvents();
            } else {
                grid.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #94a3b8;">
                        <i class="fa-solid fa-newspaper" style="font-size: 48px; margin-bottom: 16px; display: block;"></i>
                        <h3 style="color: #64748b; margin-bottom: 8px;">No articles found</h3>
                        <p>Run <code>python seed_data.py</code> to add sample articles.</p>
                    </div>
                `;
                if (discoverText) {
                    discoverText.textContent = 'No articles available';
                }
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

    function createArticleCard(article) {
        const el = document.createElement('article');
        el.className = 'article-card';

        // Lấy tag đầu tiên hoặc 'General'
        const primaryTag = article.tags && article.tags.length > 0 ? article.tags[0] : 'General';

        // Cắt ngắn content cho preview
        const preview = article.content
            ? (article.content.length > 100 ? article.content.substring(0, 100) + '...' : article.content)
            : 'No description available.';

        // Random avatar cho author (tạm thời)
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

        return el;
    }

    function attachBookmarkEvents() {
        const bookmarkBtns = document.querySelectorAll('.bookmark-btn');
        bookmarkBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                btn.classList.toggle('active');
                if (btn.classList.contains('active')) {
                    btn.innerHTML = '<i class="fa-solid fa-bookmark" style="color: #2563eb;"></i>';
                } else {
                    btn.innerHTML = '<i class="fa-regular fa-bookmark"></i>';
                }
            });
        });
    }

    function attachArticlesEvents() {
        const activeFiltersContainer = document.querySelector('.active-filters');
        const activeTagsContainer = document.getElementById('active-tags-container');
        const checkboxes = document.querySelectorAll('.custom-checkbox input[type="checkbox"]');
        const radios = document.querySelectorAll('.custom-radio input[type="radio"]');
        const resetBtn = document.querySelector('.btn-text'); // "Reset All" button

        let appliedElements = [];

        function renderActiveFilters() {
            activeTagsContainer.innerHTML = '';

            appliedElements.forEach(el => {
                const tag = document.createElement('div');
                tag.className = 'active-tag';
                tag.innerHTML = `${el.value} <button><i class="fa-solid fa-xmark"></i></button>`;

                const btn = tag.querySelector('button');
                btn.addEventListener('click', () => {
                    el.checked = false;
                    appliedElements = appliedElements.filter(e => e !== el);
                    renderActiveFilters();
                });
                activeTagsContainer.appendChild(tag);
            });

            activeFiltersContainer.style.display = appliedElements.length > 0 ? 'flex' : 'none';
        }

        const applyBtn = document.querySelector('.apply-btn');
        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                appliedElements = [];
                checkboxes.forEach(cb => { if (cb.checked) appliedElements.push(cb); });
                radios.forEach(radio => { if (radio.checked) appliedElements.push(radio); });
                renderActiveFilters();
            });
        }

        checkboxes.forEach(cb => {
            cb.addEventListener('change', () => {
                if (!cb.checked && appliedElements.includes(cb)) {
                    appliedElements = appliedElements.filter(e => e !== cb);
                    renderActiveFilters();
                }
            });
        });

        const viewToggles = document.querySelectorAll('.view-toggles button');
        const articlesGrid = document.querySelector('.articles-grid');

        if (viewToggles.length >= 2 && articlesGrid) {
            const gridBtn = viewToggles[0];
            const listBtn = viewToggles[1];

            gridBtn.addEventListener('click', () => {
                gridBtn.classList.add('active');
                listBtn.classList.remove('active');
                articlesGrid.classList.remove('list-view');
            });

            listBtn.addEventListener('click', () => {
                listBtn.classList.add('active');
                gridBtn.classList.remove('active');
                articlesGrid.classList.add('list-view');
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                checkboxes.forEach(cb => cb.checked = false);
                radios.forEach(radio => radio.checked = false);
                appliedElements = [];
                renderActiveFilters();
            });
        }
    }

    function animateTransition(nextView) {
        const activeView = document.querySelector('.main-wrapper') || document.querySelector('.auth-card') || document.querySelector('.articles-layout');
        if (activeView) {
            activeView.style.opacity = '0';
            activeView.style.transform = 'scale(0.98)';
            activeView.style.transition = 'all 0.2s ease-out';
        }

        setTimeout(() => {
            state.currentView = nextView;
            render();
            const newActive = document.querySelector('.main-wrapper') || document.querySelector('.auth-card') || document.querySelector('.articles-layout');
            if (newActive) {
                newActive.style.opacity = '0';
                newActive.style.transform = 'scale(0.98)';
                newActive.style.transition = 'none';

                setTimeout(() => {
                    newActive.style.transition = 'all 0.2s ease-in';
                    newActive.style.opacity = '1';
                    newActive.style.transform = 'scale(1)';
                }, 10);
            }
        }, 200);
    }

    // Initial Render
    render();
});
