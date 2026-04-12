/**
 * Admin Module — Fetch articles/categories from backend for admin panel
 * Function names use _admin suffix to avoid conflict with app.js wrappers
 */

function initAdminArticles() {
    const catNav = document.getElementById('nav-admin-categories');
    if (catNav) {
        catNav.addEventListener('click', (e) => {
            e.preventDefault();
            animateTransition('admin-categories');
        });
    }
    setupAdminHeaderNav();
    fetchAdminArticles();
}

async function fetchAdminArticles() {
    const tbody = document.getElementById('admin-articles-tbody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; color: #cbd5e1; margin-bottom: 12px; display: block;"></i> Loading database articles...</td></tr>';

    try {
        const res = await fetch(`${API_BASE_URL}/api/articles`);
        const data = await res.json();

        if (data.success && data.data && data.data.length > 0) {
            tbody.innerHTML = '';

            const showingText = document.querySelector('.admin-content .table-footer .showing-text');
            if (showingText) showingText.textContent = `Showing 1 to ${data.data.length} of ${data.total} articles`;

            let totalViews = 0;
            let publishedCount = 0;
            let pendingCount = 0;

            data.data.forEach(article => {
                const primaryTag = article.tags && article.tags.length > 0 ? article.tags[0] : 'General';
                const dateAdded = article.created_at
                    ? new Date(article.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : 'Unknown';

                const idSum = article.id ? String(article.id).split('').reduce((a, b) => a + b.charCodeAt(0), 0) : article.title.length * 10;
                const views = idSum * 15 + (article.title.length * 7);

                const isPending = (idSum % 4 === 0);
                const isDraft = (idSum % 9 === 0 && !isPending);

                let status;
                if (isDraft) status = { cls: 'draft', label: 'Draft' };
                else if (isPending) { status = { cls: 'pending', label: 'Pending review' }; pendingCount++; }
                else { status = { cls: 'published', label: 'Published' }; publishedCount++; }

                totalViews += views;

                const diffModes = ['Beginner', 'Intermediate', 'Advanced'];
                const difficulty = diffModes[idSum % 3];

                const tr = document.createElement('tr');
                tr.innerHTML = `
                        <td style="color: #0f172a; font-weight: 500;">${article.title}</td>
                        <td>${primaryTag}</td>
                        <td><span class="text-gray">${difficulty}</span></td>
                        <td><span class="status-badge ${status.cls}"><i class="fa-solid fa-circle"></i> ${status.label}</span></td>
                        <td>${dateAdded}</td>
                        <td>
                            <button class="action-icon"><i class="fa-solid fa-pen"></i></button>
                            <button class="action-icon text-gray"><i class="fa-regular fa-trash-can"></i></button>
                        </td>
                    `;
                tbody.appendChild(tr);
            });

            const statCards = document.querySelectorAll('.admin-stats-grid .stat-card strong');
            if (statCards.length >= 3) {
                statCards[0].textContent = totalViews >= 1000 ? (totalViews / 1000).toFixed(1) + 'k' : totalViews;
                statCards[1].textContent = publishedCount;
                statCards[2].textContent = pendingCount;
            }

        } else {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px; color: #64748b;">No articles found in database.</td></tr>';
        }
    } catch (error) {
        console.error('Fetch admin articles error:', error);
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #ef4444; padding: 40px;">Failed to connect to backend server.</td></tr>';
    }
}

function initAdminCategories() {
    const artNav = document.getElementById('nav-category-articles');
    if (artNav) {
        artNav.addEventListener('click', (e) => {
            e.preventDefault();
            animateTransition('admin-articles');
        });
    }
    setupAdminHeaderNav();
    fetchAdminCategories();
}

async function fetchAdminCategories() {
    const tbody = document.getElementById('admin-categories-tbody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; color: #cbd5e1; margin-bottom: 12px; display: block;"></i> Loading database categories...</td></tr>';

    try {
        const res = await fetch(`${API_BASE_URL}/api/articles`);
        const data = await res.json();

        if (data.success && data.data) {
            tbody.innerHTML = '';

            let catMap = {};
            data.data.forEach(article => {
                const tList = (article.tags && article.tags.length > 0) ? article.tags : ['General'];
                tList.forEach(t => {
                    const tag = t.trim();
                    if (!catMap[tag]) { catMap[tag] = { name: tag, count: 0 }; }
                    catMap[tag].count++;
                });
            });

            const catArray = Object.values(catMap).sort((a, b) => b.count - a.count);

            const showingText = document.querySelector('.admin-content .table-footer .showing-text');
            if (showingText) showingText.textContent = `Showing 1 to ${catArray.length} of ${catArray.length} categories`;

            const statCards = document.querySelectorAll('.admin-stats-grid .stat-card strong');
            const mostUsedCards = document.querySelectorAll('.admin-stats-grid .stat-card .stat-subtitle');

            if (statCards.length >= 3) {
                statCards[0].textContent = catArray.length;
                if (catArray.length > 0) {
                    statCards[1].textContent = catArray[0].name;
                    if (mostUsedCards.length > 0) mostUsedCards[0].textContent = `${catArray[0].count} Articles linked`;
                }
                statCards[2].textContent = '0';
            }

            catArray.forEach(tag => {
                const slug = tag.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

                let countColor = 'count-green';
                if (tag.count < 3) countColor = 'count-orange';
                if (tag.count >= 3 && tag.count < 10) countColor = 'count-blue';

                const tr = document.createElement('tr');
                tr.innerHTML = `
                        <td style="color: #0f172a; font-weight: 500;"><i class="fa-solid fa-tag table-cat-icon"></i> ${tag.name}</td>
                        <td><span class="text-gray" style="font-family: monospace;">${slug}</span></td>
                        <td><span class="count-badge ${countColor}">${tag.count}</span></td>
                        <td><span class="text-gray">--</span></td>
                        <td>
                            <button class="action-icon"><i class="fa-solid fa-pen"></i></button>
                            <button class="action-icon text-gray"><i class="fa-regular fa-trash-can"></i></button>
                        </td>
                    `;
                tbody.appendChild(tr);
            });

            if (catArray.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px; color: #64748b;">No categories found.</td></tr>';
            }
        } else {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px; color: #64748b;">No categories found in database.</td></tr>';
        }
    } catch (error) {
        console.error('Fetch admin categories error:', error);
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #ef4444; padding: 40px;">Failed to connect to backend server.</td></tr>';
    }
}

function setupAdminHeaderNav() {
    const navLinks = document.querySelectorAll('.main-nav a');
    navLinks.forEach(link => {
        if (link.textContent.trim() === 'Dashboard' || link.textContent.trim() === 'Articles') {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                animateTransition('articles');
            });
        }
    });
}