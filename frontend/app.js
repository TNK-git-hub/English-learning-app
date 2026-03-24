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
