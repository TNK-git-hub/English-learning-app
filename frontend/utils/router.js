/**
 * SPA Router — handles view switching with animated transitions.
 * Each route is registered with a template ID and an init function.
 */
import { state } from './state.js';

const routes = {};
let appContainer = null;

/**
 * Register a route (view) with the router.
 * @param {string} name — unique route name
 * @param {string} templateId — ID of the <template> element in HTML
 * @param {Function} initFn — function to call after the template is rendered
 */
export function registerRoute(name, templateId, initFn) {
    routes[name] = { templateId, initFn };
}

/**
 * Initialize the router with the app container element.
 */
export function initRouter(container) {
    appContainer = container;
}

/**
 * Navigate to a registered route with animated transition.
 */
export function navigateTo(viewName) {
    const route = routes[viewName];
    if (!route || !appContainer) {
        console.error(`Route "${viewName}" not found or router not initialized.`);
        return;
    }

    // Animate out current view
    const activeView = appContainer.querySelector('.main-wrapper')
        || appContainer.querySelector('.auth-card')
        || appContainer.querySelector('.articles-layout');

    if (activeView) {
        activeView.style.opacity = '0';
        activeView.style.transform = 'scale(0.98)';
        activeView.style.transition = 'all 0.2s ease-out';
    }

    setTimeout(() => {
        state.currentView = viewName;

        // Clone template and inject into container
        const template = document.getElementById(route.templateId);
        if (!template) {
            console.error(`Template #${route.templateId} not found.`);
            return;
        }

        appContainer.innerHTML = '';
        appContainer.appendChild(template.content.cloneNode(true));

        // Call page init function
        route.initFn();

        // Animate in new view
        const newActive = appContainer.querySelector('.main-wrapper')
            || appContainer.querySelector('.auth-card')
            || appContainer.querySelector('.articles-layout');

        if (newActive) {
            newActive.style.opacity = '0';
            newActive.style.transform = 'scale(0.98)';
            newActive.style.transition = 'none';

            setTimeout(() => {
                newActive.style.transition = 'all 0.2s ease-in';
                newActive.style.opacity = '1';
                newActive.style.transform = 'scale(1)';
            }, 10);
        }
    }, 200);
}
