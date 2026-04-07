/**
 * Article Service — API calls for articles.
 */
import { apiGet, apiPost, apiPut, apiDelete } from './api.js';

export async function getArticles(page = 1, limit = 10, search = '', tag = '') {
    let url = `/api/articles?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (tag) url += `&tag=${encodeURIComponent(tag)}`;
    return apiGet(url);
}

export async function getArticleById(id) {
    return apiGet(`/api/articles/${id}`);
}

export async function searchArticles(query, page = 1, limit = 10) {
    return apiGet(`/api/articles/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
}

export async function createArticle(data) {
    return apiPost('/api/articles', data);
}

export async function updateArticle(id, data) {
    return apiPut(`/api/articles/${id}`, data);
}

export async function deleteArticle(id) {
    return apiDelete(`/api/articles/${id}`);
}
