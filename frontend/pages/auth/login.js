/**
 * Login Page — handles login form submission and validation.
 */
import { navigateTo } from '../../utils/router.js';
import { login } from '../../services/auth-service.js';
import { saveAuth } from '../../utils/auth.js';
import { showError, hideError } from '../../utils/helpers.js';

export const TEMPLATE_ID = 'login-template';

export function init() {
    const goRegisterBtn = document.getElementById('go-to-register');
    const loginForm = document.getElementById('login-form');

    if (goRegisterBtn) {
        goRegisterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo('register');
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const errorBanner = document.getElementById('login-error-message');

            hideError(errorBanner);

            try {
                const data = await login(email, password);

                if (data.success) {
                    saveAuth(data);
                    navigateTo('articles');
                } else {
                    showError(errorBanner, data.message || 'Invalid email or password. Please try again.');
                }
            } catch (error) {
                console.error('Login error:', error);
                showError(errorBanner, 'Server connection failed. Make sure FastAPI is running.');
            }
        });
    }
}
