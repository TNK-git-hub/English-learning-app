/**
 * Article Detail Page — displays full article with word lookup popup.
 */
import { navigateTo } from '../../utils/router.js';
import { state } from '../../utils/state.js';
import { vocabData } from '../vocabulary/vocabulary.js';

export const TEMPLATE_ID = 'article-detail-template';

export function init() {
    renderArticleDetail();
    attachDetailEvents();
}

// ===== Render Article Content =====
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
        bodyEl.innerHTML = processTextForLookup(article.content || '');
    }
}

// ===== Make each word clickable for dictionary lookup =====
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

// ===== Attach Events (back button, word lookup, save to vocab) =====
function attachDetailEvents() {
    // Back to articles
    const backBtn = document.getElementById('detail-to-articles');
    if (backBtn) backBtn.addEventListener('click', () => navigateTo('articles'));

    // Nav links
    const navLibrary = document.getElementById('nav-detail-library');
    if (navLibrary) navLibrary.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('vocabulary');
    });

    const vocabPopup = document.getElementById('vocab-popup');

    function closeAllPopups() {
        if (vocabPopup) vocabPopup.classList.remove('show');
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

    // Word lookup — click word → fetch definition from Dictionary API
    document.querySelectorAll('.lookup-word').forEach(wordEl => {
        wordEl.addEventListener('click', async (e) => {
            e.stopPropagation();
            const word = wordEl.dataset.word;

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
                    document.getElementById('popup-definition').textContent =
                        entry.meanings[0].definitions[0].definition;
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

    // Save word to vocabulary
    const addBtn = document.getElementById('add-to-vocab-btn');
    if (addBtn) {
        addBtn.onclick = () => {
            const word = document.getElementById('popup-word').textContent;
            const definition = document.getElementById('popup-definition').textContent;
            const example = document.getElementById('popup-example').textContent;

            if (word && definition !== 'Fetching definition...') {
                vocabData.unshift({
                    word: word.charAt(0).toUpperCase() + word.slice(1),
                    type: 'Noun',
                    meaning: definition,
                    example: example || 'No example provided.'
                });
                alert(`"${word}" added to your vocabulary!`);
                closeAllPopups();
            }
        };
    }

    // Click outside popup to close
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
