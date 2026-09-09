(function () {
    var isFileProtocol = window.location.protocol === 'file:';

    function resolveApiBase() {
        if (window.SBL_API_BASE) return window.SBL_API_BASE;
        if (isFileProtocol) return 'http://127.0.0.1:5000';
        var port = window.location.port;
        if (port === '5500' || port === '3000' || port === '5173' || port === '8080') {
            return 'http://' + (window.location.hostname || '127.0.0.1') + ':5000';
        }
        return '';
    }

    var apiBase = resolveApiBase();

    var form = document.getElementById('loginForm');
    var usernameInput = document.getElementById('username');
    var passwordInput = document.getElementById('password');
    var submitBtn = document.getElementById('submitBtn');
    var btnText = document.getElementById('btnText');
    var rememberMeCheckbox = document.getElementById('rememberMe');
    var statusBadge = document.getElementById('serverStatusBadge');
    var statusText = document.getElementById('serverStatusText');
    var alertBox = document.getElementById('loginAlert');
    var alertText = document.getElementById('loginAlertText');
    var fileWarning = document.getElementById('fileWarningBanner');
    var panel = document.querySelector('.login-panel');

    // Show warning if opened via local file protocol
    if (isFileProtocol && fileWarning) {
        fileWarning.style.display = 'block';
    }

    // Restore remembered username
    try {
        var savedUser = localStorage.getItem('sbl_admin_username');
        if (savedUser && usernameInput) {
            usernameInput.value = savedUser;
            if (rememberMeCheckbox) rememberMeCheckbox.checked = true;
            if (passwordInput) passwordInput.focus();
        }
    } catch (e) {}

    // Check server status
    function checkServerHealth() {
        if (!statusBadge || !statusText) return;
        statusBadge.className = 'server-status-badge checking';
        statusText.textContent = 'Checking server...';

        fetch(apiBase + '/api/health', { method: 'GET', cache: 'no-store' })
            .then(function (res) {
                if (res.ok) return res.json();
                throw new Error('Server returned ' + res.status);
            })
            .then(function (data) {
                if (data && data.ok) {
                    statusBadge.className = 'server-status-badge';
                    statusText.textContent = 'Server Online';
                    statusBadge.title = 'Backend running on port 5000. Data store connected.';
                } else {
                    throw new Error('Unhealthy');
                }
            })
            .catch(function () {
                statusBadge.className = 'server-status-badge offline';
                statusText.textContent = 'Server Offline';
                statusBadge.title = 'Server not responding. Please run python app.py';
            });
    }

    checkServerHealth();
    setInterval(checkServerHealth, 15000);

    function showAlert(message) {
        if (alertBox && alertText) {
            alertText.textContent = message;
            alertBox.classList.add('show');
        }
        if (panel) {
            panel.classList.remove('shake');
            void panel.offsetWidth;
            panel.classList.add('shake');
        }
    }

    function hideAlert() {
        if (alertBox) {
            alertBox.classList.remove('show');
        }
    }

    // Form submission
    if (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            event.stopPropagation();
            hideAlert();

            var username = (usernameInput ? usernameInput.value : '').trim().toLowerCase();
            var password = (passwordInput ? passwordInput.value : '').trim();

            if (!username || !password) {
                showAlert('Please enter both admin username and password.');
                return false;
            }

            // Button loading state
            var originalHtml = btnText ? btnText.innerHTML : 'Sign in';
            if (submitBtn) submitBtn.disabled = true;
            if (btnText) btnText.innerHTML = 'Signing in…';

            fetch(apiBase + '/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username, password: password })
            })
            .then(function (response) {
                return response.text().then(function (text) {
                    var body = {};
                    try { body = text ? JSON.parse(text) : {}; } catch (e) {
                        throw new Error('The server returned an invalid response. Please verify the Python backend is running.');
                    }
                    if (!response.ok) {
                        throw new Error(body.error || 'Invalid admin credentials.');
                    }
                    return body;
                });
            })
            .then(function (result) {
                if (!result || !result.token) {
                    throw new Error('Login succeeded but no token received.');
                }

                // Remember username if checked
                try {
                    if (rememberMeCheckbox && rememberMeCheckbox.checked) {
                        localStorage.setItem('sbl_admin_username', username);
                    } else {
                        localStorage.removeItem('sbl_admin_username');
                    }
                } catch (e) {}

                try { sessionStorage.setItem('sblAdminToken', result.token); } catch (e) {}
                try { localStorage.setItem('sblAdminToken', result.token); } catch (e) {}

                if (btnText) btnText.innerHTML = 'Authorized! Redirecting…';
                if (submitBtn) submitBtn.style.background = '#1e543c';

                // Quick redirect
                setTimeout(function () {
                    window.location.href = 'admin-dashboard.html';
                }, 200);
            })
            .catch(function (error) {
                var msg = error.message || 'Login failed.';
                if (msg === 'Failed to fetch' || msg.indexOf('fetch') !== -1 || msg.indexOf('NetworkError') !== -1) {
                    msg = isFileProtocol
                        ? 'Cannot connect from local file. Please open via http://localhost:5000/admin.html'
                        : 'Cannot connect to backend server. Make sure Python is running (python app.py).';
                    if (statusBadge && statusText) {
                        statusBadge.className = 'server-status-badge offline';
                        statusText.textContent = 'Server Offline';
                    }
                }
                showAlert(msg);
            })
            .finally(function () {
                if (submitBtn) submitBtn.disabled = false;
                if (btnText) btnText.innerHTML = originalHtml;
            });

            return false;
        });
    }

    // Subtle 3D perspective tilt effect on login panel for desktop devices
    if (panel && window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        var tiltFrame = null;
        panel.addEventListener('mousemove', function (e) {
            if (tiltFrame) cancelAnimationFrame(tiltFrame);
            tiltFrame = requestAnimationFrame(function () {
                var rect = panel.getBoundingClientRect();
                var x = e.clientX - rect.left;
                var y = e.clientY - rect.top;
                var centerX = rect.width / 2;
                var centerY = rect.height / 2;
                var rotateX = ((centerY - y) / centerY) * 3.5;
                var rotateY = ((x - centerX) / centerX) * 3.5;

                panel.style.transform = 'perspective(1000px) rotateX(' + rotateX.toFixed(2) + 'deg) rotateY(' + rotateY.toFixed(2) + 'deg) translateY(-2px)';
            });
        });

        panel.addEventListener('mouseleave', function () {
            if (tiltFrame) cancelAnimationFrame(tiltFrame);
            panel.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease, border-color 0.3s ease';
            panel.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
            setTimeout(function () {
                if (panel) panel.style.transition = '';
            }, 500);
        });

        panel.addEventListener('mouseenter', function () {
            panel.style.transition = 'transform 0.12s ease-out, box-shadow 0.3s ease, border-color 0.3s ease';
        });
    }
}());

