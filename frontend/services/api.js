/**
 * API Service — centralized fetch wrapper.
 * All API calls go through here for consistent headers & error handling.
 */
const API_BASE_URL = 'http://localhost:8001';

export async function apiGet(endpoint) {
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}${endpoint}`, { headers });
    if (!res.ok && res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
    return res.json();
}

export async function apiPost(endpoint, body) {
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
    });
    return res.json();
}

export async function apiPut(endpoint, body) {
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(body)
    });
    return res.json();
}

export async function apiDelete(endpoint) {
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers
    });
    return res.json();
}
