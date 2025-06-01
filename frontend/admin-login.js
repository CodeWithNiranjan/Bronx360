document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    // Show alert
    function showAlert(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.querySelector('.card-body').insertBefore(alertDiv, loginForm);
        setTimeout(() => alertDiv.remove(), 5000);
    }

    // Handle form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        if (!username || !password) {
            showAlert('Please enter both username and password', 'warning');
            return;
        }

        try {
            console.log('Attempting login for:', username);
            const response = await fetch('http://localhost:3000/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Invalid credentials');
            }

            console.log('Login successful');
            localStorage.setItem('adminToken', data.token);
            window.location.href = 'admin-dashboard.html';
        } catch (error) {
            console.error('Login error:', error);
            showAlert(error.message || 'Invalid username or password', 'danger');
            passwordInput.value = '';
            passwordInput.focus();
        }
    });
}); 