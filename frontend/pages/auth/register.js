/**
 * Register Page — Logic đăng ký
 * Extracted from app.js attachRegisterEvents()
 */

function attachRegisterEvents() {
    const registerForm = document.getElementById('register-form');
    const goToLogin = document.getElementById('go-to-login');

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('reg-name').value.trim();
            const email = document.getElementById('reg-email').value.trim();
            const password = document.getElementById('reg-password').value;
            const confirm = document.getElementById('reg-confirm').value;

            // Validate
            if (!name) {
                alert('Please enter your name');
                return;
            }
            if (password !== confirm) {
                const errorEl = document.getElementById('reg-confirm-error');
                if (errorEl) errorEl.style.display = 'block';
                return;
            }

            try {
                await registerAPI({ name, email, password });
                alert('Registration successful! Please login.');
                animateTransition('login');
            } catch (error) {
                alert(error.message || 'Registration failed.');
            }
        });
    }

    if (goToLogin) {
        goToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            animateTransition('login');
        });
    }

    // Real-time confirm password validation
    const regConfirm = document.getElementById('reg-confirm');
    const regPassword = document.getElementById('reg-password');
    if (regConfirm && regPassword) {
        regConfirm.addEventListener('input', () => {
            const errorEl = document.getElementById('reg-confirm-error');
            if (errorEl) {
                errorEl.style.display = regConfirm.value !== regPassword.value ? 'block' : 'none';
            }
        });
    }
}
