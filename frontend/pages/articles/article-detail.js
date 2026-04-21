/**
 * Article Detail Page — Render nội dung bài viết, lookup từ, popup
 * Redesigned: wider layout with sidebar, back nav, reading stats
 */

/**
 * Render chi tiết bài viết
 */
function renderArticleDetail() {
    const article = AppState.selectedArticle;
    if (!article) return;

    const titleEl = document.getElementById('detail-article-title');
    const bodyEl = document.getElementById('detail-article-body');
    const headerTitle = document.getElementById('detail-header-title');
    const categoryTag = document.getElementById('detail-category-tag');
    const difficultyEl = document.getElementById('detail-difficulty');
    const readTimeEl = document.getElementById('detail-read-time');

    // Title
    if (titleEl) titleEl.textContent = article.title || 'Untitled';
    if (headerTitle) headerTitle.textContent = article.title || 'Untitled';

    // Category tag
    const tags = Array.isArray(article.tags) ? article.tags : (article.tags ? article.tags.split(',').map(t => t.trim()) : []);
    if (categoryTag) {
        categoryTag.textContent = tags.length > 0 ? tags[0] : 'General';
    }

    // Difficulty
    if (difficultyEl) {
        const difficulty = article.difficulty || 'Beginner';
        difficultyEl.textContent = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
    }

    // Read time estimate (roughly 200 words per minute)
    if (readTimeEl && article.content) {
        const wordCount = article.content.split(/\s+/).length;
        const minutes = Math.max(1, Math.ceil(wordCount / 200));
        readTimeEl.textContent = `${minutes} min read`;

        // Update words read stats
        const wordsReadEl = document.getElementById('detail-words-read');
        if (wordsReadEl) wordsReadEl.textContent = `0 / ${wordCount.toLocaleString()}`;
    }

    // Hero image
    const heroEl = document.getElementById('detail-article-image');
    if (heroEl) {
        const imageUrl = article.image_url || 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=1200&q=80';
        heroEl.style.cssText += `background-image: none;`;
        heroEl.innerHTML = '';
        // Override the ::after pseudo-element
        heroEl.style.setProperty('--hero-bg', `url('${imageUrl}')`);
        // Just set a background directly
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = article.title || '';
        img.style.cssText = 'width:100%;height:100%;object-fit:cover;position:relative;z-index:1;';
        img.onerror = () => { img.src = 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=1200&q=80'; };
        heroEl.appendChild(img);
    }

    // Content body with word lookup
    if (bodyEl && article.content) {
        const processedContent = processTextForLookup(article.content);
        bodyEl.innerHTML = processedContent;
    }

    // Keywords sidebar
    const keywordsEl = document.getElementById('detail-keywords');
    if (keywordsEl) {
        if (tags.length > 0) {
            keywordsEl.innerHTML = tags.map(t => `<span class="keyword-chip">${escapeHtml(t)}</span>`).join('');
        } else {
            keywordsEl.innerHTML = '<span class="keyword-chip">General</span>';
        }
    }

    // Bookmark state
    const bookmarkBtn = document.getElementById('detail-bookmark-btn');
    if (bookmarkBtn) {
        const isBookmarked = AppState.bookmarkedArticles.includes(article.id);
        const icon = bookmarkBtn.querySelector('i');
        if (isBookmarked) {
            bookmarkBtn.classList.add('active');
            if (icon) icon.className = 'fas fa-bookmark';
        } else {
            bookmarkBtn.classList.remove('active');
            if (icon) icon.className = 'far fa-bookmark';
        }
    }

    // Track reading progress on scroll
    setupReadingProgress();
}

/**
 * Setup reading progress tracking
 */
function setupReadingProgress() {
    const bodyEl = document.getElementById('detail-article-body');
    const progressEl = document.getElementById('detail-progress');
    const wordsReadEl = document.getElementById('detail-words-read');
    if (!bodyEl || !progressEl) return;

    const article = AppState.selectedArticle;
    const totalWords = article && article.content ? article.content.split(/\s+/).length : 0;

    const observer = new IntersectionObserver((entries) => {
        // Simple progress: % of body scrolled into view
    }, { threshold: Array.from({ length: 20 }, (_, i) => i * 0.05) });

    // Use scroll event on nearest scrollable parent
    const scrollParent = bodyEl.closest('.detail-page-body') || window;
    const handleScroll = () => {
        const rect = bodyEl.getBoundingClientRect();
        const totalHeight = bodyEl.scrollHeight;
        const viewportH = window.innerHeight;
        const scrolled = Math.max(0, -rect.top + viewportH * 0.3);
        const pct = Math.min(100, Math.round((scrolled / totalHeight) * 100));
        
        progressEl.textContent = `${pct}%`;
        if (wordsReadEl) {
            const wordsRead = Math.round((pct / 100) * totalWords);
            wordsReadEl.textContent = `${wordsRead.toLocaleString()} / ${totalWords.toLocaleString()}`;
        }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call
}

/**
 * Process text to make each word clickable for lookup
 * @param {string} text - Raw article content
 * @returns {string} HTML with clickable words
 */
function processTextForLookup(text) {
    if (!text) return '';
    
    // Split into paragraphs
    const paragraphs = text.split(/\n+/);
    return paragraphs.map(p => {
        if (!p.trim()) return '';
        // Wrap each word in a span for clicking
        const words = p.split(/(\s+)/);
        const processed = words.map(word => {
            // Skip whitespace
            if (/^\s+$/.test(word)) return word;
            // Skip punctuation-only
            const cleanWord = word.replace(/[^a-zA-Z]/g, '');
            if (!cleanWord) return word;
            return `<span class="lookup-word" data-word="${cleanWord}">${word}</span>`;
        }).join('');
        return `<p>${processed}</p>`;
    }).join('');
}

/**
 * Attach events cho article detail page
 */
function attachArticleDetailEvents() {
    // Render article content
    renderArticleDetail();

    // Back to articles
    const backBtn = document.getElementById('detail-back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => animateTransition('articles'));
    }

    // Logo click -> articles
    const logoBtn = document.getElementById('detail-logo-home');
    if (logoBtn) {
        logoBtn.addEventListener('click', () => animateTransition('articles'));
    }

    // Bookmark toggle in header
    const bookmarkBtn = document.getElementById('detail-bookmark-btn');
    if (bookmarkBtn && AppState.selectedArticle) {
        bookmarkBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const articleId = AppState.selectedArticle.id;
            const index = AppState.bookmarkedArticles.indexOf(articleId);
            const icon = bookmarkBtn.querySelector('i');

            if (index > -1) {
                AppState.bookmarkedArticles.splice(index, 1);
                bookmarkBtn.classList.remove('active');
                if (icon) icon.className = 'far fa-bookmark';
            } else {
                AppState.bookmarkedArticles.push(articleId);
                bookmarkBtn.classList.add('active');
                if (icon) icon.className = 'fas fa-bookmark';
            }
            // Persist bookmarks
            localStorage.setItem('learnup_bookmarks', JSON.stringify(AppState.bookmarkedArticles));
        });
    }

    // Take quiz button
    const quizBtn = document.getElementById('detail-take-quiz-btn');
    if (quizBtn) {
        quizBtn.addEventListener('click', () => animateTransition('quiz'));
    }

    // Word lookup on click
    document.querySelectorAll('.lookup-word').forEach(wordEl => {
        wordEl.addEventListener('click', (e) => {
            e.stopPropagation();
            const word = wordEl.dataset.word;
            if (word) {
                lookupWord(word);
            }
        });
    });

    // Close popup on click outside
    document.addEventListener('click', (e) => {
        const popup = document.getElementById('vocab-popup');
        if (popup && !popup.contains(e.target) && !e.target.classList.contains('lookup-word')) {
            popup.classList.remove('show');
        }
    });
}

/**
 * Lookup word using Dictionary API
 * @param {string} word
 */
async function lookupWord(word) {
    const popup = document.getElementById('vocab-popup');
    const wordEl = document.getElementById('popup-word');
    const phoneticEl = document.getElementById('popup-phonetic');
    const definitionEl = document.getElementById('popup-definition');
    const exampleEl = document.getElementById('popup-example');

    if (!popup) return;

    // Show popup with loading state
    if (wordEl) wordEl.textContent = word;
    if (phoneticEl) phoneticEl.textContent = 'Loading...';
    if (definitionEl) definitionEl.textContent = 'Looking up...';
    if (exampleEl) exampleEl.textContent = '';
    popup.classList.add('show');

    try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        if (response.ok) {
            const data = await response.json();
            const entry = data[0];
            const phonetic = entry.phonetics?.find(p => p.text)?.text || '';
            const meaning = entry.meanings?.[0];
            const definition = meaning?.definitions?.[0]?.definition || 'No definition found';
            const example = meaning?.definitions?.[0]?.example || 'No example available';

            if (phoneticEl) phoneticEl.textContent = phonetic;
            if (definitionEl) definitionEl.textContent = definition;
            if (exampleEl) exampleEl.textContent = `"${example}"`;

            // Audio playback
            const audioUrl = entry.phonetics?.find(p => p.audio)?.audio;
            const audioBtn = popup.querySelector('.btn-audio');
            if (audioBtn && audioUrl) {
                audioBtn.onclick = () => new Audio(audioUrl).play();
            }
        } else {
            if (phoneticEl) phoneticEl.textContent = '';
            if (definitionEl) definitionEl.textContent = 'Word not found in dictionary.';
            if (exampleEl) exampleEl.textContent = '';
        }
    } catch (error) {
        if (definitionEl) definitionEl.textContent = 'Error looking up word.';
    }
}
