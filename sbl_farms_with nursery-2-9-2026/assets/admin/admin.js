(function () {
    var host = window.location.hostname || '127.0.0.1';
    var apiBase = window.SBL_API_BASE || (window.location.port === '5000' ? '' : 'http://' + host + ':5000');
    function resolveApiBase() {
        if (window.SBL_API_BASE) return window.SBL_API_BASE;
        if (window.location.protocol === 'file:') return 'http://127.0.0.1:5000';
        var port = window.location.port;
        if (port === '5500' || port === '3000' || port === '5173' || port === '8080') {
            return 'http://' + (window.location.hostname || '127.0.0.1') + ':5000';
        }
        return '';
    }

    var apiBase = resolveApiBase();
    var token = sessionStorage.getItem('sblAdminToken') || '';
    var enquiries = [];
    var loginView = document.getElementById('loginView');
    var dashboardView = document.getElementById('dashboardView');
    var loginError = document.getElementById('loginError');
    var dashboardError = document.getElementById('dashboardError');

    function request(path, options) {
        options = options || {};
        options.headers = Object.assign({ 'Content-Type': 'application/json' }, options.headers || {});
        if (token) options.headers.Authorization = 'Bearer ' + token;
        return fetch(apiBase + path, options).then(function (response) {
            return response.text().then(function (text) {
                var body;
                try { body = text ? JSON.parse(text) : {}; } catch (error) {
                    throw new Error('Admin server returned an invalid response. Start the Python server and try again.');
                }
                if (!response.ok) throw new Error(body.error || 'Request failed.');
                return body;
            });
        });
    }

    function showDashboard() {
        loginView.hidden = true;
        dashboardView.hidden = false;
        loadEnquiries();
    }

    function login(event) {
        event.preventDefault();
        loginError.textContent = '';
        var button = event.target.querySelector('button');
        button.disabled = true;
        request('/api/admin/login', { method: 'POST', body: JSON.stringify({ username: document.getElementById('username').value, password: document.getElementById('password').value }) })
            .then(function (result) { token = result.token; sessionStorage.setItem('sblAdminToken', token); showDashboard(); })
            .catch(function (error) { loginError.textContent = error.message; })
            .finally(function () { button.disabled = false; });
    }

    function loadEnquiries() {
        dashboardError.textContent = '';
        request('/api/admin/enquiries').then(function (result) {
            enquiries = result.enquiries;
            populateCategories();
            render();
        }).catch(function (error) {
            if (error.message === 'Admin login required.') logout();
            else dashboardError.textContent = error.message;
        });
    }

    function populateCategories() {
        var select = document.getElementById('categoryFilter');
        var current = select.value;
        var categories = enquiries.map(function (item) { return item.enquiryAbout; }).filter(function (value, index, list) { return value && list.indexOf(value) === index; }).sort();
        select.innerHTML = '<option value="all">All categories</option>' + categories.map(function (category) { return '<option>' + escapeHtml(category) + '</option>'; }).join('');
        select.value = categories.indexOf(current) >= 0 ? current : 'all';
    }

    function escapeHtml(value) { return String(value || '').replace(/[&<>"']/g, function (character) { return ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[character]; }); }
    function formatDate(value) { return new Date(value).toLocaleString('en-IN', { dateStyle:'medium', timeStyle:'short' }); }

    function render() {
        var query = document.getElementById('search').value.toLowerCase().trim();
        var status = document.getElementById('statusFilter').value;
        var category = document.getElementById('categoryFilter').value;
        var filtered = enquiries.filter(function (item) {
            var haystack = [item.name, item.email, item.phone, item.reference, item.enquiryAbout].join(' ').toLowerCase();
            return (!query || haystack.indexOf(query) >= 0) && (status === 'all' || item.status === status) && (category === 'all' || item.enquiryAbout === category);
        });
        var counts = { all: enquiries.length, new:0, contacted:0, closed:0 };
        enquiries.forEach(function (item) { counts[item.status] = (counts[item.status] || 0) + 1; });
        document.getElementById('stats').innerHTML = [['all','Total'],['new','New'],['contacted','Contacted'],['closed','Closed']].map(function (entry) { return '<div class="stat"><strong>' + counts[entry[0]] + '</strong><span>' + entry[1] + ' enquiries</span></div>'; }).join('');
        document.getElementById('enquiryList').innerHTML = filtered.length ? filtered.map(card).join('') : '<div class="empty">No enquiries match these filters.</div>';
        document.querySelectorAll('.status').forEach(function (select) { select.addEventListener('change', changeStatus); });
    }

    function card(item) {
        var status = item.status || 'new';
        return '<article class="enquiry"><div><h2>' + escapeHtml(item.name) + '</h2><div class="meta"><a href="mailto:' + escapeHtml(item.email) + '">' + escapeHtml(item.email) + '</a> &middot; <a href="tel:' + escapeHtml(item.phone) + '">' + escapeHtml(item.phone) + '</a><br>' + escapeHtml(item.enquiryAbout) + ' &middot; Heard via ' + escapeHtml(item.heardAbout) + '<br>' + formatDate(item.createdAt) + '</div>' + (item.notes ? '<p class="notes">' + escapeHtml(item.notes) + '</p>' : '') + '</div><div class="enquiry-side"><div class="reference">' + escapeHtml(item.reference) + '</div><select class="status ' + status + '" data-id="' + escapeHtml(item.id) + '" aria-label="Update enquiry status"><option value="new" ' + (status === 'new' ? 'selected' : '') + '>New</option><option value="contacted" ' + (status === 'contacted' ? 'selected' : '') + '>Contacted</option><option value="closed" ' + (status === 'closed' ? 'selected' : '') + '>Closed</option></select></div></article>';
    }

    function changeStatus(event) {
        var select = event.target;
        var previous = enquiries.find(function (item) { return item.id === select.dataset.id; }).status;
        select.disabled = true;
        request('/api/admin/enquiries/' + encodeURIComponent(select.dataset.id), { method:'PATCH', body:JSON.stringify({ status:select.value }) })
            .then(function (result) { var item = enquiries.find(function (entry) { return entry.id === result.enquiry.id; }); item.status = result.enquiry.status; render(); })
            .catch(function (error) { select.value = previous; dashboardError.textContent = error.message; })
            .finally(function () { select.disabled = false; });
    }

    function logout() { token = ''; sessionStorage.removeItem('sblAdminToken'); dashboardView.hidden = true; loginView.hidden = false; }
    document.getElementById('loginForm').addEventListener('submit', login);
    document.getElementById('logoutButton').addEventListener('click', logout);
    document.getElementById('refreshButton').addEventListener('click', loadEnquiries);
    document.getElementById('search').addEventListener('input', render);
    document.getElementById('statusFilter').addEventListener('change', render);
    document.getElementById('categoryFilter').addEventListener('change', render);
    if (token) showDashboard();
}());
