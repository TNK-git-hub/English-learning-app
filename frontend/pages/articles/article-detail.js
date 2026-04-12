/**
 * Article Detail Page — Render nội dung bài viết, lookup từ, popup
 * Extracted from app.js renderArticleDetail() & attachArticleDetailEvents()
 */

/**
 * Render chi tiết bài viết
 */
function renderArticleDetail() {
    const article = AppState.selectedArticle;
    if (!article) return;

    const titleEl = document.getElementById('detail-article-title');
    const subtitleEl = document.getElementById('detail-article-subtitle');
    const bodyEl = document.getElementById('detail-article-body');

    if (titleEl) titleEl.textContent = article.title || 'Untitled';
    if (subtitleEl) subtitleEl.textContent = article.description || '';

    if (bodyEl && article.content) {
        // Process text for word lookup
        const processedContent = processTextForLookup(article.content);
        bodyEl.innerHTML = processedContent;
    }
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
    const backBtn = document.getElementById('detail-to-articles');
    if (backBtn) {
        backBtn.addEventListener('click', () => animateTransition('articles'));
    }

    // Navigation links
    const navLinks = {
        'nav-detail-articles': 'articles',
        'nav-detail-library': 'vocabulary',
        'nav-detail-quiz': 'quiz',
        'nav-detail-dashboard': 'user-dashboard',
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
