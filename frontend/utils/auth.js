/**
 * Auth Utils — token management in localStorage.
 */

export function saveAuth(data) {
    if (data.token) localStorage.setItem('token', data.token);
    if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
}

export function getToken() {
    return localStorage.getItem('token');
}

export function getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

export function isAuthenticated() {
    return !!getToken();
}

export function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}
