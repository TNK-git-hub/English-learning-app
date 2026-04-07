/**
 * Auth Service — API calls for authentication.
 */
import { apiPost } from './api.js';

export async function login(email, password) {
    return apiPost('/api/auth/login', { email, password });
}

export async function register(email, password, name) {
    return apiPost('/api/auth/register', { email, password, name });
}
