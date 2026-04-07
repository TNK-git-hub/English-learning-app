/**
 * Vocabulary Page — display saved words with search and pagination.
 * Note: Currently uses mock data. Will connect to API in future.
 */
import { navigateTo } from '../../utils/router.js';

export const TEMPLATE_ID = 'vocabulary-template';

// Shared vocabulary data (used by article-detail for saving words)
export const vocabData = [
    { word: 'Ephemeral', type: 'Adjective', meaning: 'Lasting for a very short time', example: '"The sunset offered an ephemeral moment of beauty."' },
    { word: 'Resilient', type: 'Adjective', meaning: 'Able to withstand or recover quickly from difficult conditions.', example: '"She is a resilient girl who never gives up."' },
    { word: 'Eloquent', type: 'Adjective', meaning: 'Fluent or persuasive in speaking or writing.', example: '"The president gave an eloquent speech at the ceremony."' },
    { word: 'Meticulous', type: 'Adjective', meaning: 'Showing great attention to detail; very careful and precise.', example: '"He was meticulous about keeping the records."' },
    { word: 'Pragmatic', type: 'Adjective', meaning: 'Dealing with things sensibly and realistically', example: '"We need a pragmatic solution to this issue."' }
];

// Add dummy words for pagination demo
for (let i = 1; i <= 119; i++) {
    vocabData.push({ word: `MockWord${i}`, type: 'Noun', meaning: 'Dummy meaning for pagination test.', example: '"This is a dummy sentence."' });
}

let currentPage = 1;

export function init() {
    const navArticles = document.getElementById('nav-vocab-articles');
    const navDashboard = document.getElementById('nav-vocab-dashboard');
    const logoBtn = document.getElementById('vocab-to-dashboard');

    if (navArticles) navArticles.addEventListener('click', (e) => { e.preventDefault(); navigateTo('articles'); });
    if (navDashboard) navDashboard.addEventListener('click', (e) => { e.preventDefault(); navigateTo('admin-articles'); });
    if (logoBtn) logoBtn.addEventListener('click', (e) => { e.preventDefault(); navigateTo('articles'); });

    const searchInput = document.getElementById('vocab-search');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            currentPage = 1;
            renderTable();
        });
    }

    renderTable();
}

function renderTable() {
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
    if (currentPage > totalPages) currentPage = totalPages;

    const startIdx = (currentPage - 1) * itemsPerPage;
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

    if (pagination) renderPagination(pagination, totalPages);
}

function renderPagination(container, totalPages) {
    container.innerHTML = '';

    const prevBtn = document.createElement('button');
    prevBtn.className = 'icon-btn';
    prevBtn.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => { if (currentPage > 1) { currentPage--; renderTable(); } };
    container.appendChild(prevBtn);

    let pagesToShow = [];
    if (totalPages <= 5) {
        pagesToShow = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else if (currentPage <= 3) {
        pagesToShow = [1, 2, 3, 4, '...', totalPages];
    } else if (currentPage > totalPages - 3) {
        pagesToShow = [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    } else {
        pagesToShow = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
    }

    pagesToShow.forEach(p => {
        if (p === '...') {
            const span = document.createElement('span');
            span.className = 'ellipsis';
            span.textContent = '...';
            container.appendChild(span);
        } else {
            const btn = document.createElement('button');
            btn.className = `page-btn ${p === currentPage ? 'active' : ''}`;
            btn.textContent = p;
            btn.onclick = () => { currentPage = p; renderTable(); };
            container.appendChild(btn);
        }
    });

    const nextBtn = document.createElement('button');
    nextBtn.className = 'icon-btn';
    nextBtn.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => { if (currentPage < totalPages) { currentPage++; renderTable(); } };
    container.appendChild(nextBtn);
}
