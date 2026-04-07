const API_BASE_URL = 'http://localhost:8001';

document.addEventListener('DOMContentLoaded', () => {
    const appContainer = document.getElementById('app-container');

    // Initial state
    let state = {
        currentView: 'login', // 'login', 'register', or 'articles'
        selectedArticle: null
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
        } else if (state.currentView === 'admin-articles') {
            const template = document.getElementById('admin-articles-template');
            appContainer.innerHTML = '';
            appContainer.appendChild(template.content.cloneNode(true));
            attachAdminArticlesEvents();
        } else if (state.currentView === 'admin-categories') {
            const template = document.getElementById('admin-categories-template');
            appContainer.innerHTML = '';
            appContainer.appendChild(template.content.cloneNode(true));
            attachAdminCategoriesEvents();
        } else if (state.currentView === 'vocabulary') {
            const template = document.getElementById('vocabulary-template');
            appContainer.innerHTML = '';
            appContainer.appendChild(template.content.cloneNode(true));
            attachVocabularyEvents();
        } else if (state.currentView === 'article-detail') {
            const template = document.getElementById('article-detail-template');
            appContainer.innerHTML = '';
            appContainer.appendChild(template.content.cloneNode(true));
            renderArticleDetail();
            attachArticleDetailEvents();
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
                const errorBanner = document.getElementById('login-error-message');

                if (errorBanner) {
                    errorBanner.style.display = 'none';
                }

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
                        if (errorBanner) {
                            errorBanner.style.display = 'flex';
                            errorBanner.querySelector('span').textContent = data.message || 'Invalid email or password. Please try again.';
                        } else {
                            alert(data.message || 'Invalid email or password. Please try again.');
                        }
                    }
                } catch (error) {
                    console.error('Login error:', error);
                    if (errorBanner) {
                        errorBanner.style.display = 'flex';
                        errorBanner.querySelector('span').textContent = 'Server connection failed. Make sure FastAPI is running.';
                    } else {
                        alert('Server connection failed. Make sure FastAPI is running.');
                    }
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

        el.style.cursor = 'pointer';
        el.addEventListener('click', (e) => {
            if (e.target.closest('.bookmark-btn') || e.target.closest('.author')) return;
            state.selectedArticle = article;
            animateTransition('article-detail');
        });

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

        // GLOBAL NAVIGATION
        const navLinks = document.querySelectorAll('.main-nav a');
        navLinks.forEach(link => {
            if (link.textContent.trim() === 'Dashboard') {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    animateTransition('admin-articles');
                });
            } else if (link.textContent.trim() === 'Library') {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    animateTransition('vocabulary');
                });
            }
        });
    }

    // ===== Vocabulary Table Feature (Mocked Data) =====
    const vocabData = [
        { word: 'Ephemeral', type: 'Adjective', meaning: 'Lasting for a very short time', example: '"The sunset offered an ephemeral moment of beauty."' },
        { word: 'Resilient', type: 'Adjective', meaning: 'Able to withstand or recover quickly from difficult conditions.', example: '"She is a resilient girl who never gives up."' },
        { word: 'Eloquent', type: 'Adjective', meaning: 'Fluent or persuasive in speaking or writing.', example: '"The president gave an eloquent speech at the ceremony."' },
        { word: 'Meticulous', type: 'Adjective', meaning: 'Showing great attention to detail; very careful and precise.', example: '"He was meticulous about keeping the records."' },
        { word: 'Pragmatic', type: 'Adjective', meaning: 'Dealing with things sensibly and realistically', example: '"We need a pragmatic solution to this issue."' }
    ];
    // Dummy words to emulate pagination functionality
    for (let i = 1; i <= 119; i++) {
        vocabData.push({ word: `MockWord${i}`, type: 'Noun', meaning: 'Dummy meaning for pagination test.', example: '"This is a dummy sentence."' });
    }

    let vocabCurrentPage = 1;
    function attachVocabularyEvents() {
        const navArticles = document.getElementById('nav-vocab-articles');
        const navDashboard = document.getElementById('nav-vocab-dashboard');
        const logoBtn = document.getElementById('vocab-to-dashboard');

        if (navArticles) navArticles.addEventListener('click', (e) => { e.preventDefault(); animateTransition('articles'); });
        if (navDashboard) navDashboard.addEventListener('click', (e) => { e.preventDefault(); animateTransition('admin-articles'); });
        if (logoBtn) logoBtn.addEventListener('click', (e) => { e.preventDefault(); animateTransition('articles'); });

        const searchInput = document.getElementById('vocab-search');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                vocabCurrentPage = 1;
                renderVocabularyTable();
            });
        }
        renderVocabularyTable();
    }

    function renderVocabularyTable() {
        const tbody = document.getElementById('vocab-tbody');
        const searchInput = document.getElementById('vocab-search');
        const showingText = document.getElementById('vocab-showing-text');
        const pagination = document.getElementById('vocab-pagination');
        if (!tbody) return;

        const query = searchInput ? searchInput.value.toLowerCase() : '';
        const filtered = vocabData.filter(v =>
            v.word.toLowerCase().includes(query) || v.meaning.toLowerCase().includes(query)
        );

        const itemsPerPage = 10;
        const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
        if (vocabCurrentPage > totalPages) vocabCurrentPage = totalPages;

        const startIdx = (vocabCurrentPage - 1) * itemsPerPage;
        const pageItems = filtered.slice(startIdx, startIdx + itemsPerPage);

        tbody.innerHTML = '';
        pageItems.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <div class="vocab-word-cell">
                        <strong>${item.word}</strong>
                        <span>${item.type}</span>
                    </div>
                </td>
                <td><div class="vocab-meaning-cell">${item.meaning}</div></td>
                <td><div class="vocab-example-cell">${item.example}</div></td>
                <td>
                    <button class="action-icon" style="color: #64748b;"><i class="fa-solid fa-volume-high"></i></button>
                    <button class="action-icon" style="color: #64748b;"><i class="fa-solid fa-pen"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        if (filtered.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 40px; color: #94a3b8;">No words found matching your search.</td></tr>';
        }

        if (showingText) {
            const endIdx = Math.min(startIdx + itemsPerPage, filtered.length);
            showingText.textContent = `Showing ${filtered.length > 0 ? startIdx + 1 : 0}-${endIdx} of ${filtered.length} words`;
        }

        if (pagination) {
            pagination.innerHTML = '';

            const prevBtn = document.createElement('button');
            prevBtn.className = 'icon-btn';
            prevBtn.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
            prevBtn.disabled = vocabCurrentPage === 1;
            prevBtn.onclick = () => { if (vocabCurrentPage > 1) { vocabCurrentPage--; renderVocabularyTable(); } };
            pagination.appendChild(prevBtn);

            let pagesToShow = [];
            if (totalPages <= 5) {
                pagesToShow = Array.from({ length: totalPages }, (_, i) => i + 1);
            } else if (vocabCurrentPage <= 3) {
                pagesToShow = [1, 2, 3, 4, '...', totalPages];
            } else if (vocabCurrentPage > totalPages - 3) {
                pagesToShow = [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
            } else {
                pagesToShow = [1, '...', vocabCurrentPage - 1, vocabCurrentPage, vocabCurrentPage + 1, '...', totalPages];
            }

            pagesToShow.forEach(p => {
                if (p === '...') {
                    const span = document.createElement('span');
                    span.className = 'ellipsis';
                    span.textContent = '...';
                    pagination.appendChild(span);
                } else {
                    const btn = document.createElement('button');
                    btn.className = `page-btn ${p === vocabCurrentPage ? 'active' : ''}`;
                    btn.textContent = p;
                    btn.onclick = () => { vocabCurrentPage = p; renderVocabularyTable(); };
                    pagination.appendChild(btn);
                }
            });

            const nextBtn = document.createElement('button');
            nextBtn.className = 'icon-btn';
            nextBtn.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
            nextBtn.disabled = vocabCurrentPage === totalPages;
            nextBtn.onclick = () => { if (vocabCurrentPage < totalPages) { vocabCurrentPage++; renderVocabularyTable(); } };
            pagination.appendChild(nextBtn);
        }
    }

    // ===== Article Detail Feature (Interactive Popups) =====
    function renderArticleDetail() {
        const article = state.selectedArticle;
        if (!article) return;

        const titleEl = document.getElementById('detail-article-title');
        const subtitleEl = document.getElementById('detail-article-subtitle');
        const imageEl = document.getElementById('detail-article-image');
        const bodyEl = document.getElementById('detail-article-body');

        if (titleEl) titleEl.textContent = article.title;
        if (subtitleEl) subtitleEl.textContent = article.tags.join(' • ');
        if (imageEl) {
            imageEl.style.backgroundImage = `url(${article.image_url || 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1000&q=80'})`;
            imageEl.style.backgroundSize = 'cover';
            imageEl.style.backgroundPosition = 'center';
            imageEl.style.height = '400px';
            imageEl.style.borderRadius = '16px';
            imageEl.style.marginBottom = '40px';
        }

        if (bodyEl) {
            // Process text to make every word clickable
            const processedHtml = processTextForLookup(article.content || '');
            bodyEl.innerHTML = processedHtml;
        }
    }

    function processTextForLookup(text) {
        return text.split('\n').map(para => {
            if (!para.trim()) return '';
            const words = para.split(/(\s+)/);
            const wrappedWords = words.map(word => {
                if (/^\s+$/.test(word)) return word;
                const cleanWord = word.replace(/[.,!?;:()"]/g, '');
                if (!cleanWord) return word;
                return `<span class="lookup-word" data-word="${cleanWord.toLowerCase()}">${word}</span>`;
            }).join('');
            return `<p>${wrappedWords}</p>`;
        }).join('');
    }

    function attachArticleDetailEvents() {
        const backBtn = document.getElementById('detail-to-articles');
        if (backBtn) backBtn.addEventListener('click', () => animateTransition('articles'));

        const navLibrary = document.getElementById('nav-detail-library');
        if (navLibrary) navLibrary.addEventListener('click', (e) => { e.preventDefault(); animateTransition('vocabulary'); });

        const vocabPopup = document.getElementById('vocab-popup');
        const translationPopup = document.getElementById('translation-popup');

        function closeAllPopups() {
            if (vocabPopup) vocabPopup.classList.remove('show');
            if (translationPopup) translationPopup.classList.remove('show');
        }

        function positionPopup(triggerEl, popupEl) {
            const rect = triggerEl.getBoundingClientRect();
            let top = rect.bottom + window.scrollY + 10;
            let left = rect.left + window.scrollX - (340 / 2) + (rect.width / 2);

            if (left < 20) left = 20;
            if (left + 340 > window.innerWidth - 20) left = window.innerWidth - 360;

            popupEl.style.top = `${top}px`;
            popupEl.style.left = `${left}px`;

            popupEl.classList.add('show');
        }

        // Word Lookup Events
        document.querySelectorAll('.lookup-word').forEach(wordEl => {
            wordEl.addEventListener('click', async (e) => {
                e.stopPropagation();
                const word = wordEl.dataset.word;

                // Show loading state in popup
                closeAllPopups();
                document.getElementById('popup-word').textContent = word;
                document.getElementById('popup-phonetic').textContent = 'Loading...';
                document.getElementById('popup-definition').textContent = 'Fetching definition...';
                document.getElementById('popup-example').textContent = '';

                positionPopup(wordEl, vocabPopup);

                try {
                    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
                    const data = await res.json();

                    if (data && data.length > 0) {
                        const entry = data[0];
                        document.getElementById('popup-phonetic').textContent = entry.phonetic || '';
                        document.getElementById('popup-definition').textContent = entry.meanings[0].definitions[0].definition;
                        const example = entry.meanings[0].definitions[0].example;
                        document.getElementById('popup-example').textContent = example ? `"${example}"` : '';
                    } else {
                        document.getElementById('popup-definition').textContent = 'Definition not found.';
                    }
                } catch (err) {
                    document.getElementById('popup-definition').textContent = 'Error fetching definition.';
                }
            });
        });

        // Save Word to Vocabulary
        const addBtn = document.getElementById('add-to-vocab-btn');
        if (addBtn) {
            addBtn.onclick = () => {
                const word = document.getElementById('popup-word').textContent;
                const definition = document.getElementById('popup-definition').textContent;
                const example = document.getElementById('popup-example').textContent;

                if (word && definition !== 'Fetching definition...') {
                    vocabData.unshift({
                        word: word.charAt(0).toUpperCase() + word.slice(1),
                        type: 'Noun', // Simplified
                        meaning: definition,
                        example: example || 'No example provided.'
                    });
                    alert(`"${word}" added to your vocabulary!`);
                    closeAllPopups();
                }
            };
        }

        const detailLayout = document.querySelector('.article-detail-layout');
        if (detailLayout) {
            detailLayout.addEventListener('click', (e) => {
                if (vocabPopup && !vocabPopup.contains(e.target)) {
                    vocabPopup.classList.remove('show');
                }
            });
        }

        document.querySelectorAll('.popup-close').forEach(btn => {
            btn.addEventListener('click', closeAllPopups);
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