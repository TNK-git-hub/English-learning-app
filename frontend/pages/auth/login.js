/**
 * Login Page — Logic đăng nhập
 * Extracted from app.js attachLoginEvents()
 */

function attachLoginEvents() {
    const loginBtn = document.getElementById('login-btn');
    const goRegister = document.getElementById('go-register');
    const goRegisterBottom = document.getElementById('go-register-bottom');
    const togglePw = document.getElementById('toggle-login-pw');

    if (loginBtn) {
        loginBtn.addEventListener('click', async () => {
            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;

            if (!email || !password) {
                alert('Please enter email and password');
                return;
            }

            loginBtn.textContent = 'Signing in...';
            loginBtn.disabled = true;

            try {
                const data = await loginAPI(email, password);
                setToken(data.token);
                saveUser(data.user || { name: email.split('@')[0], email: email });
                animateTransition('articles');
            } catch (error) {
                alert(error.message || 'Login failed. Please check your credentials.');
            } finally {
                loginBtn.textContent = 'Sign In';
                loginBtn.disabled = false;
            }
        });
    }

    // Toggle password visibility
    if (togglePw) {
        togglePw.addEventListener('click', () => {
            const pwInput = document.getElementById('login-password');
            const icon = togglePw.querySelector('i');
            if (pwInput.type === 'password') {
                pwInput.type = 'text';
                icon.classList.replace('fa-eye', 'fa-eye-slash');
            } else {
                pwInput.type = 'password';
                icon.classList.replace('fa-eye-slash', 'fa-eye');
            }
        });
    }

    // Go to register
    if (goRegister) {
        goRegister.addEventListener('click', (e) => {
            e.preventDefault();
            animateTransition('register');
        });
    }
    if (goRegisterBottom) {
        goRegisterBottom.addEventListener('click', (e) => {
            e.preventDefault();
            animateTransition('register');
        });
    }

    // Enter key to login
    const loginPassword = document.getElementById('login-password');
    if (loginPassword) {
        loginPassword.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                loginBtn?.click();
            }
        });
    }
}
