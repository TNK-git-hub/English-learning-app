/**
 * Vocabulary Page — Render vocabulary table, search, pagination
 * Extracted from app.js attachVocabularyEvents()
 */

// Mock vocabulary data (sẽ thay bằng API call sau)
const MOCK_VOCAB = [
    { word: 'ubiquitous', phonetic: '/juːˈbɪk.wɪ.təs/', meaning: 'Seeming to be everywhere', example: 'Smartphones have become ubiquitous in modern life.' },
    { word: 'ephemeral', phonetic: '/ɪˈfem.ər.əl/', meaning: 'Lasting for a very short time', example: 'The beauty of cherry blossoms is ephemeral.' },
    { word: 'pragmatic', phonetic: '/præɡˈmæt.ɪk/', meaning: 'Dealing with things in a practical way', example: 'We need a pragmatic approach to solve this problem.' },
    { word: 'eloquent', phonetic: '/ˈel.ə.kwənt/', meaning: 'Fluent or persuasive in speaking', example: 'She gave an eloquent speech at the conference.' },
    { word: 'resilient', phonetic: '/rɪˈzɪl.i.ənt/', meaning: 'Able to recover quickly from difficulties', example: 'Children are remarkably resilient creatures.' },
    { word: 'ambiguous', phonetic: '/æmˈbɪɡ.ju.əs/', meaning: 'Open to more than one interpretation', example: 'The instructions were ambiguous and confusing.' },
];

let vocabCurrentPage = 1;
const vocabPerPage = 5;

/**
 * Render vocabulary table
 */
function renderVocabTable(searchTerm = '') {
    const tbody = document.getElementById('vocab-tbody');
    if (!tbody) return;

    let data = MOCK_VOCAB;
    if (searchTerm) {
        data = data.filter(v => 
            v.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.meaning.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    const start = (vocabCurrentPage - 1) * vocabPerPage;
    const paged = data.slice(start, start + vocabPerPage);

    tbody.innerHTML = paged.map(v => `
        <tr>
            <td>
                <div class="vocab-word-cell">
                    <strong>${escapeHtml(v.word)}</strong>
                    <span>${escapeHtml(v.phonetic)}</span>
                </div>
            </td>
            <td class="vocab-meaning-cell">${escapeHtml(v.meaning)}</td>
            <td class="vocab-example-cell">${escapeHtml(v.example)}</td>
            <td>
                <button class="btn-audio small" title="Play pronunciation">
                    <i class="fas fa-volume-up"></i>
                </button>
            </td>
        </tr>
    `).join('');

    // Update showing text
    const showingText = document.getElementById('vocab-showing-text');
    if (showingText) {
        showingText.textContent = `Showing ${start + 1}-${Math.min(start + vocabPerPage, data.length)} of ${data.length} words`;
    }
}

/**
 * Attach events cho vocabulary page
 */
function attachVocabularyEvents() {
    renderVocabTable();

    // Navigation links
    const navLinks = {
        'nav-vocab-articles': 'articles',
        'nav-vocab-quiz': 'quiz',
        'nav-vocab-dashboard': 'user-dashboard',
        'vocab-to-articles': 'articles',
        'vocab-back-to-articles': 'articles',
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

    // Search
    const searchInput = document.getElementById('vocab-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            vocabCurrentPage = 1;
            renderVocabTable(e.target.value);
        });
    }
}
