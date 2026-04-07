/**
 * Register Page — handles registration form submission and validation.
 */
import { navigateTo } from '../../utils/router.js';
import { register } from '../../services/auth-service.js';
import { saveAuth } from '../../utils/auth.js';
import { showError, hideError } from '../../utils/helpers.js';

export const TEMPLATE_ID = 'register-template';

export function init() {
    const goLoginBtn = document.getElementById('go-to-login');
    const registerForm = document.getElementById('register-form');

    if (goLoginBtn) {
        goLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo('login');
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('reg-name').value.trim();
            const email = document.getElementById('reg-email').value.trim();
            const password = document.getElementById('reg-password').value;
            const confirm = document.getElementById('reg-confirm').value;
            const confirmWrapper = document.getElementById('reg-confirm-wrapper');
            const confirmError = document.getElementById('reg-confirm-error');
            const errorBanner = document.getElementById('register-error-message');

            // Reset errors
            hideError(errorBanner);
            if (confirmWrapper) confirmWrapper.classList.remove('error');
            if (confirmError) confirmError.style.display = 'none';

            // Client-side validation
            if (password !== confirm) {
                if (confirmWrapper) confirmWrapper.classList.add('error');
                if (confirmError) confirmError.style.display = 'flex';
                return;
            }

            if (password.length < 8) {
                showError(errorBanner, 'Password must be at least 8 characters long.');
                return;
            }

            try {
                const data = await register(email, password, name);

                if (data.success) {
                    saveAuth(data);
                    navigateTo('articles');
                } else {
                    showError(errorBanner, data.message || 'Registration failed. Please try again.');
                }
            } catch (error) {
                console.error('Register error:', error);
                showError(errorBanner, 'Server connection failed. Make sure FastAPI is running.');
            }
        });
    }
}
