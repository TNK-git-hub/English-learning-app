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
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                animateTransition('articles');
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

    function attachArticlesEvents() {
        const activeFiltersContainer = document.querySelector('.active-filters');
        const activeTagsContainer = document.getElementById('active-tags-container');
        const checkboxes = document.querySelectorAll('.custom-checkbox input[type="checkbox"]');
        const radios = document.querySelectorAll('.custom-radio input[type="radio"]');
        const resetBtn = document.querySelector('.btn-text');
        const searchInput = document.querySelector('.search-bar input');
        const articlesGrid = document.querySelector('.articles-grid');

        let appliedElements = [];
        let searchTimeout = null;
        let allArticles = [];
        let currentPage = 1;
        const itemsPerPage = 6;

        // Fetch API
        async function fetchArticles() {
            if (!articlesGrid) return;
            let tags = [];
            let difficulty = null;

            appliedElements.forEach(el => {
                if (el.type === 'checkbox') tags.push(el.value);
                if (el.type === 'radio') difficulty = el.value;
            });

            const query = searchInput ? searchInput.value.trim() : '';
            const params = new URLSearchParams();
            if (tags.length > 0) params.append('tags', tags.join(','));
            if (difficulty) params.append('difficulty', difficulty);
            if (query) params.append('q', query);

            try {
                const response = await fetch(`http://localhost:8000/api/articles?${params.toString()}`);
                if (!response.ok) throw new Error('Failed to fetch');
                const data = await response.json();
                allArticles = Array.isArray(data) ? data : (data.articles || []); // Handle array or paginated format
                currentPage = 1;
                renderArticles();
            } catch (err) {
                console.error(err);
                articlesGrid.innerHTML = '<p style="text-align: center; color: #64748b; padding: 48px; grid-column: 1/-1;">Could not load articles.</p>';
                const paginationContainer = document.getElementById('pagination-container');
                if (paginationContainer) paginationContainer.innerHTML = '';
            }
        }

        // Render HTML for articles
        function renderArticles() {
            const countEl = document.getElementById('article-count');
            if (countEl) {
                countEl.textContent = `Showing ${allArticles.length} article${allArticles.length !== 1 ? 's' : ''} based on your filters`;
            }

            if (!allArticles || allArticles.length === 0) {
                articlesGrid.innerHTML = '<p style="text-align: center; color: #64748b; padding: 48px; grid-column: 1/-1;">No articles found matching your criteria.</p>';
                const paginationContainer = document.getElementById('pagination-container');
                if (paginationContainer) paginationContainer.innerHTML = '';
                return;
            }

            const totalPages = Math.ceil(allArticles.length / itemsPerPage);
            const startIndex = (currentPage - 1) * itemsPerPage;
            const paginatedArticles = allArticles.slice(startIndex, startIndex + itemsPerPage);

            articlesGrid.innerHTML = paginatedArticles.map(art => `
                <article class="article-card" data-id="${art.id}">
                    <div class="card-img-wrapper">
                        <img src="${art.image_url || 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500&q=80'}" alt="${art.title}">
                    </div>
                    <div class="card-content">
                        <span class="category-tag">${art.tags && art.tags.length > 0 ? art.tags[0].name : 'GENERAL'}</span>
                        <h3>${art.title}</h3>
                        <p>${art.content || ''}</p>
                        <div class="card-footer">
                            <div class="author">
                                <img src="https://i.pravatar.cc/150?img=11" alt="Author">
                                <span>Default Author</span>
                            </div>
                            <button class="bookmark-btn ${art.is_bookmarked ? 'active' : ''}" data-id="${art.id}">
                                ${art.is_bookmarked ? '<i class="fa-solid fa-bookmark" style="color: #2563eb;"></i>' : '<i class="fa-regular fa-bookmark"></i>'}
                            </button>
                        </div>
                    </div>
                </article>
            `).join('');

            renderPagination(Math.ceil(allArticles.length / itemsPerPage));
        }

        function renderPagination(totalPages) {
            const container = document.getElementById('pagination-container');
            if (!container) return;
            if (totalPages <= 1) {
                container.innerHTML = '';
                return;
            }

            let html = '';
            html += `<button class="icon-btn prev-btn" ${currentPage === 1 ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}><i class="fa-solid fa-chevron-left"></i></button>`;

            for (let i = 1; i <= totalPages; i++) {
                if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                    html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
                } else if (i === currentPage - 2 || i === currentPage + 2) {
                    html += `<span class="ellipsis">...</span>`;
                }
            }

            html += `<button class="icon-btn next-btn" ${currentPage === totalPages ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}><i class="fa-solid fa-chevron-right"></i></button>`;

            container.innerHTML = html;

            container.querySelectorAll('.page-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    currentPage = parseInt(e.target.getAttribute('data-page'));
                    renderArticles();
                });
            });

            const prevBtn = container.querySelector('.prev-btn');
            if (prevBtn) {
                prevBtn.addEventListener('click', () => {
                    if (currentPage > 1) {
                        currentPage--;
                        renderArticles();
                    }
                });
            }

            const nextBtn = container.querySelector('.next-btn');
            if (nextBtn) {
                nextBtn.addEventListener('click', () => {
                    if (currentPage < totalPages) {
                        currentPage++;
                        renderArticles();
                    }
                });
            }
        }

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
                    fetchArticles();
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
                fetchArticles();
            });
        }

        checkboxes.forEach(cb => {
            cb.addEventListener('change', () => {
                if (!cb.checked && appliedElements.includes(cb)) {
                    appliedElements = appliedElements.filter(e => e !== cb);
                    renderActiveFilters();
                    fetchArticles();
                }
            });
        });

        radios.forEach(radio => {
            radio.addEventListener('mousedown', function () {
                this.dataset.wasChecked = this.checked;
            });
            radio.addEventListener('click', function (e) {
                if (this.dataset.wasChecked === 'true') {
                    this.checked = false;
                    this.dataset.wasChecked = 'false';

                    if (appliedElements.includes(this)) {
                        appliedElements = appliedElements.filter(el => el !== this);
                        renderActiveFilters();
                        fetchArticles();
                    }
                }
            });
        });

        const viewToggles = document.querySelectorAll('.view-toggles button');
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
                fetchArticles();
            });
        }

        // Search Debounce Event
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    fetchArticles();
                }, 500);
            });
        }

        // Bookmark Event Delegation
        if (articlesGrid) {
            articlesGrid.addEventListener('click', async (e) => {
                const btn = e.target.closest('.bookmark-btn');
                if (!btn) return;

                const articleId = btn.getAttribute('data-id');
                // Opt: Optimistic UI update
                btn.classList.toggle('active');
                if (btn.classList.contains('active')) {
                    btn.innerHTML = '<i class="fa-solid fa-bookmark" style="color: #2563eb;"></i>';
                } else {
                    btn.innerHTML = '<i class="fa-regular fa-bookmark"></i>';
                }

                try {
                    const token = localStorage.getItem('token') || '';
                    const res = await fetch(`http://localhost:8000/api/articles/${articleId}/bookmark`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (!res.ok) {
                        // Revert on error
                        btn.classList.toggle('active');
                        if (btn.classList.contains('active')) {
                            btn.innerHTML = '<i class="fa-solid fa-bookmark" style="color: #2563eb;"></i>';
                        } else {
                            btn.innerHTML = '<i class="fa-regular fa-bookmark"></i>';
                        }
                    }
                } catch (err) {
                    console.error(err);
                    // Revert on error
                    btn.classList.toggle('active');
                    if (btn.classList.contains('active')) {
                        btn.innerHTML = '<i class="fa-solid fa-bookmark" style="color: #2563eb;"></i>';
                    } else {
                        btn.innerHTML = '<i class="fa-regular fa-bookmark"></i>';
                    }
                }
            });
        }

        // Initial Fetch
        fetchArticles();
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
