/**
 * Helper utilities — common functions used across pages.
 */

/**
 * Truncate text to a max length with ellipsis.
 */
export function truncateText(text, maxLength = 100) {
    if (!text) return 'No description available.';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

/**
 * Format ISO date string to readable format.
 */
export function formatDate(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
    });
}

/**
 * Show an error message in a banner element.
 */
export function showError(banner, message) {
    if (banner) {
        banner.style.display = 'flex';
        const span = banner.querySelector('span');
        if (span) span.textContent = message;
    } else {
        alert(message);
    }
}

/**
 * Hide an error banner.
 */
export function hideError(banner) {
    if (banner) banner.style.display = 'none';
}
