/**
 * LearnUp — Main Application Bootstrapper.
 *
 * This file only registers routes and starts the app.
 * All page logic is in separate modules under pages/.
 */
import { registerRoute, initRouter, navigateTo } from './utils/router.js';
import * as loginPage from './pages/auth/login.js';
import * as registerPage from './pages/auth/register.js';
import * as articlesListPage from './pages/articles/articles-list.js';
import * as articleDetailPage from './pages/articles/article-detail.js';
import * as vocabularyPage from './pages/vocabulary/vocabulary.js';

document.addEventListener('DOMContentLoaded', () => {
    const appContainer = document.getElementById('app-container');

    // Initialize router
    initRouter(appContainer);

    // Register all routes: name → templateId → init function
    registerRoute('login',          loginPage.TEMPLATE_ID,         loginPage.init);
    registerRoute('register',       registerPage.TEMPLATE_ID,      registerPage.init);
    registerRoute('articles',       articlesListPage.TEMPLATE_ID,  articlesListPage.init);
    registerRoute('article-detail', articleDetailPage.TEMPLATE_ID, articleDetailPage.init);
    registerRoute('vocabulary',     vocabularyPage.TEMPLATE_ID,    vocabularyPage.init);

    // Start app at login page
    navigateTo('login');
});