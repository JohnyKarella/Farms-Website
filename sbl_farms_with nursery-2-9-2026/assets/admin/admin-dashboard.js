(function () {
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
    var token = '';
    try {
        token = sessionStorage.getItem('sblAdminToken') || localStorage.getItem('sblAdminToken') || '';
        if (token && !sessionStorage.getItem('sblAdminToken')) {
            sessionStorage.setItem('sblAdminToken', token);
        }
    } catch (e) {}
    var enquiries = [];
    var dashboardError = document.getElementById('dashboardError');
    var editingEnquiryIds = {};
    var lastSavedId = null;

    var ALL_CATEGORIES = [
        "Agritour Booking",
        "Dairy",
        "Greenwall",
        "Landscaping",
        "Nimma Mali",
        "Corn Silage",
        "Events",
        "Other"
    ];

    var ALL_HEARD_ABOUT = [
        "Google Search",
        "Instagram / Facebook",
        "Friend / Family Referral",
        "Travel Blog / Article",
        "Corporate Event Planner",
        "Other"
    ];

    function getCategoryOptions(current) {
        var list = ALL_CATEGORIES.slice();
        if (current && list.indexOf(current) === -1) list.unshift(current);
        return list.map(function (c) {
            return '<option value="' + escapeHtml(c) + '"' + (c === current ? ' selected' : '') + '>' + escapeHtml(c) + '</option>';
        }).join('');
    }

    function getHeardOptions(current) {
        var list = ALL_HEARD_ABOUT.slice();
        if (current && list.indexOf(current) === -1) list.unshift(current);
        return list.map(function (h) {
            return '<option value="' + escapeHtml(h) + '"' + (h === current ? ' selected' : '') + '>' + escapeHtml(h) + '</option>';
        }).join('');
    }

    function request(path, options) {
        options = options || {};
        options.headers = Object.assign({ 'Content-Type': 'application/json' }, options.headers || {});
        options.headers.Authorization = 'Bearer ' + token;
        return fetch(apiBase + path, options).catch(function () {
            throw new Error('Cannot connect to backend server. Make sure Python server is running.');
        }).then(function (response) {
            return response.text().then(function (text) {
                var body = {};
                try { if (text) body = JSON.parse(text); } catch (error) {}
                if (!response.ok) {
                    throw new Error(body.error || body.message || ('Request failed with status ' + response.status));
                }
                return body;
            });
        });
    }

    function escapeHtml(value) { return String(value || '').replace(/[&<>"']/g, function (character) { return ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[character]; }); }
    function formatDate(value) { return new Date(value).toLocaleString('en-IN', { dateStyle:'medium', timeStyle:'short' }); }

    function logout() {
        sessionStorage.removeItem('sblAdminToken');
        try {
            sessionStorage.removeItem('sblAdminToken');
            localStorage.removeItem('sblAdminToken');
        } catch (e) {}
        window.location.href = 'admin.html';
    }

    function loadEnquiries() {
        dashboardError.textContent = '';
        var refreshBtn = document.getElementById('refreshButton');
        if (refreshBtn) refreshBtn.classList.add('is-refreshing');
        request('/api/admin/enquiries').then(function (result) {
            enquiries = result.enquiries;
            populateCategories();
            populateReportMembers();
            renderStats();
            renderEnquiryList();
            renderReport();
        }).catch(function (error) {
            if (error.message === 'Admin login required.') logout();
            else dashboardError.textContent = error.message;
        }).finally(function () {
            if (refreshBtn) {
                window.setTimeout(function () {
                    refreshBtn.classList.remove('is-refreshing');
                }, 400);
            }
        });
    }

    function populateCategories() {
        var select = document.getElementById('categoryFilter');
        var current = select.value;
        var categories = enquiries.map(function (item) { return item.enquiryAbout; }).filter(function (value, index, list) { return value && list.indexOf(value) === index; }).sort();
        select.innerHTML = '<option value="all">All categories</option>' + categories.map(function (category) { return '<option>' + escapeHtml(category) + '</option>'; }).join('');
        select.value = categories.indexOf(current) >= 0 ? current : 'all';
    }

    function populateReportMembers() {
        var select = document.getElementById('reportMember');
        if (!select) return;
        var current = select.value;
        var members = enquiries
            .map(function (item) { return (item.assignedTo || '').trim(); })
            .filter(function (name) { return name.length > 0; })
            .filter(function (value, index, list) { return list.indexOf(value) === index; })
            .sort(function (a, b) { return a.toLowerCase().localeCompare(b.toLowerCase()); });

        var options = [
            '<option value="all">All team members</option>',
            '<option value="__unassigned__">Unassigned</option>'
        ].concat(members.map(function (member) {
            return '<option value="' + escapeHtml(member) + '">' + escapeHtml(member) + '</option>';
        }));

        select.innerHTML = options.join('');
        var exists = current && (current === 'all' || current === '__unassigned__' || members.indexOf(current) >= 0);
        select.value = exists ? current : 'all';
    }

    function renderReport() {
        var select = document.getElementById('reportMember');
        if (!select) return;
        var member = select.value || 'all';
        var label = 'All team members';
        var items = enquiries;

        if (member === '__unassigned__') {
            items = enquiries.filter(function (item) {
                var assigned = (item.assignedTo || '').trim();
                return !assigned;
            });
            label = 'Unassigned';
        } else if (member !== 'all') {
            items = enquiries.filter(function (item) {
                var assigned = (item.assignedTo || '').trim();
                return assigned.toLowerCase() === member.toLowerCase();
            });
            label = member;
        }

        var counts = { total: items.length, new: 0, contacted: 0, closed: 0, not_interested: 0 };
        items.forEach(function (item) {
            var st = item.status || 'new';
            counts[st] = (counts[st] || 0) + 1;
        });

        var reportLabel = document.getElementById('reportLabel');
        if (reportLabel) {
            reportLabel.innerHTML = 'Showing performance breakdown for <strong>' + escapeHtml(label) + '</strong>';
        }

        var entries = [
            ['total', 'Total'],
            ['new', 'New'],
            ['contacted', 'Contacted'],
            ['closed', 'Closed'],
            ['not_interested', 'Not interested']
        ];

        var reportStats = document.getElementById('reportStats');
        if (reportStats) {
            reportStats.innerHTML = entries.map(function (entry) {
                return '<div class="stat"><strong>' + (counts[entry[0]] || 0) + '</strong><span>' + entry[1] + ' enquiries</span></div>';
            }).join('');
        }
    }

    function renderStats() {
        var counts = { all: enquiries.length, new: 0, contacted: 0, closed: 0, not_interested: 0 };
        enquiries.forEach(function (item) {
            var st = item.status || 'new';
            counts[st] = (counts[st] || 0) + 1;
        });
        document.getElementById('stats').innerHTML = [
            ['all', 'Total'],
            ['new', 'New'],
            ['contacted', 'Contacted'],
            ['closed', 'Closed'],
            ['not_interested', 'Not interested']
        ].map(function (entry) {
            return '<div class="stat"><strong>' + (counts[entry[0]] || 0) + '</strong><span>' + entry[1] + ' enquiries</span></div>';
        }).join('');
    }

    function renderEnquiryList() {
        var query = document.getElementById('search').value.toLowerCase().trim();
        var status = document.getElementById('statusFilter').value;
        var category = document.getElementById('categoryFilter').value;
        var fromValue = document.getElementById('dateFrom').value;
        var toValue = document.getElementById('dateTo').value;
        var fromTime = fromValue ? new Date(fromValue + 'T00:00:00').getTime() : null;
        var toTime = toValue ? new Date(toValue + 'T23:59:59').getTime() : null;
        var filtered = enquiries.filter(function (item) {
            var haystack = [item.name, item.email, item.phone, item.reference, item.enquiryAbout, item.notes].join(' ').toLowerCase();
            var created = new Date(item.createdAt).getTime();
            var inDateRange = (fromTime === null || created >= fromTime) && (toTime === null || created <= toTime);
            return (!query || haystack.indexOf(query) >= 0) && (status === 'all' || item.status === status) && (category === 'all' || item.enquiryAbout === category) && inDateRange;
        });
        document.getElementById('enquiryList').innerHTML = filtered.length ? filtered.map(card).join('') : '<div class="empty">No enquiries match these filters.</div>';
        document.querySelectorAll('.status').forEach(function (select) {
            select.addEventListener('change', function (e) {
                e.target.className = 'status ' + e.target.value;
                var c = e.target.closest('.enquiry');
                if (c) {
                    var btn = c.querySelector('.save-actions');
                    if (btn) btn.classList.add('needs-save');
                }
            });
        });
        document.querySelectorAll('.save-actions').forEach(function (button) {
            button.addEventListener('click', saveEnquiry);
        });
        document.querySelectorAll('.edit-actions').forEach(function (button) {
            button.addEventListener('click', toggleEdit);
        });
        document.querySelectorAll('.delete-actions').forEach(function (button) {
            button.addEventListener('click', deleteEnquiry);
        });
    }

    function render() {
        renderStats();
        renderEnquiryList();
        renderReport();
    }

    function patchEnquiry(item, payload, onSuccess, onError) {
        return request('/api/admin/enquiries/' + encodeURIComponent(item.id), { method:'PATCH', body:JSON.stringify(payload) })
            .then(function (result) { Object.assign(item, result.enquiry); if (onSuccess) onSuccess(); })
            .catch(function (error) { if (onError) onError(error); else dashboardError.textContent = error.message; render(); });
    }

    function toggleEdit(event) {
        var button = event.currentTarget;
        var id = button.dataset.id;
        if (editingEnquiryIds[id]) {
            delete editingEnquiryIds[id];
        } else {
            editingEnquiryIds[id] = true;
        }
        dashboardError.textContent = '';
        renderEnquiryList();
    }

    function deleteEnquiry(event) {
        var button = event.currentTarget;
        var id = button.dataset.id;
        if (!id) return;
        var item = enquiries.find(function (entry) {
            return String(entry.id) === String(id) || String(entry.reference) === String(id);
        });
        var ref = (item && item.reference) ? item.reference : id;
        var name = (item && item.name) ? item.name : 'this lead';
        if (!window.confirm('Are you sure you want to permanently delete lead ' + ref + ' (' + name + ')?')) {
            return;
        }
        button.disabled = true;
        button.textContent = 'Deleting…';
        dashboardError.textContent = '';

        function finishDeletion() {
            enquiries = enquiries.filter(function (entry) {
                return String(entry.id) !== String(id) && String(entry.reference) !== String(id);
            });
            delete editingEnquiryIds[id];
            renderStats();
            populateReportMembers();
            renderReport();
            renderEnquiryList();
        }

        request('/api/admin/enquiries/' + encodeURIComponent(id), { method: 'DELETE' })
            .catch(function () {
                return request('/api/admin/enquiries/' + encodeURIComponent(id) + '/delete', { method: 'POST' });
            })
            .then(function () {
                finishDeletion();
            })
            .catch(function (err) {
                button.disabled = false;
                button.textContent = 'Delete';
                dashboardError.textContent = err.message || 'Failed to delete enquiry.';
            });
    }

    function exportEnquiries() {
        var query = document.getElementById('search').value.trim();
        var status = document.getElementById('statusFilter').value;
        var category = document.getElementById('categoryFilter').value;
        var dateFrom = document.getElementById('dateFrom').value;
        var dateTo = document.getElementById('dateTo').value;

        var params = [];
        if (query) params.push('query=' + encodeURIComponent(query));
        if (status && status !== 'all') params.push('status=' + encodeURIComponent(status));
        if (category && category !== 'all') params.push('category=' + encodeURIComponent(category));
        if (dateFrom) params.push('dateFrom=' + encodeURIComponent(dateFrom));
        if (dateTo) params.push('dateTo=' + encodeURIComponent(dateTo));

        var url = apiBase + '/api/admin/enquiries/export' + (params.length ? '?' + params.join('&') : '');
        var btn = document.getElementById('exportButton');
        if (!btn) return;
        var originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Exporting…';

        fetch(url, {
            headers: { 'Authorization': 'Bearer ' + token }
        }).then(function (res) {
            if (!res.ok) throw new Error('Failed to export CSV. Please try again.');
            return res.blob();
        }).then(function (blob) {
            var downloadUrl = window.URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = downloadUrl;
            a.download = 'sbl_enquiries_' + new Date().toISOString().slice(0, 10) + '.csv';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(downloadUrl);
        }).catch(function (error) {
            dashboardError.textContent = error.message;
        }).finally(function () {
            btn.disabled = false;
            btn.textContent = originalText;
        });
    }

    function saveEnquiry(event) {
        var button = event.currentTarget;
        var id = button.dataset.id;
        var item = enquiries.find(function (entry) { return entry.id === id; });
        if (!item) return;
        var cardEl = button.closest('.enquiry');
        var statusVal = cardEl.querySelector('.status').value;
        var assigneeVal = cardEl.querySelector('.assignee').value.trim();
        var telecallerVal = cardEl.querySelector('.telecaller').value;

        var payload = {
            status: statusVal,
            assignedTo: assigneeVal,
            contactedByTelecaller: telecallerVal
        };

        var isEditing = !!editingEnquiryIds[id];
        if (isEditing) {
            var nameInput = cardEl.querySelector('.edit-name');
            var emailInput = cardEl.querySelector('.edit-email');
            var phoneInput = cardEl.querySelector('.edit-phone');
            var catInput = cardEl.querySelector('.edit-category');
            var heardInput = cardEl.querySelector('.edit-heard');
            var notesInput = cardEl.querySelector('.edit-notes');

            if (nameInput) payload.name = nameInput.value.trim();
            if (emailInput) payload.email = emailInput.value.trim();
            if (phoneInput) payload.phone = phoneInput.value.trim();
            if (catInput) payload.enquiryAbout = catInput.value;
            if (heardInput) payload.heardAbout = heardInput.value;
            if (notesInput) payload.notes = notesInput.value.trim();

            if (!payload.name) {
                dashboardError.textContent = 'Name is required.';
                return;
            }
        }

        button.disabled = true;
        button.classList.add('saving');
        var originalText = button.textContent;
        button.textContent = 'Saving…';
        dashboardError.textContent = '';

        patchEnquiry(item, payload, function () {
            delete editingEnquiryIds[id];
            lastSavedId = id;
            renderStats();
            populateReportMembers();
            renderReport();
            renderEnquiryList();

            window.setTimeout(function () {
                if (lastSavedId === id) {
                    lastSavedId = null;
                    var currentCard = document.querySelector('.enquiry[data-id="' + id + '"]');
                    if (currentCard) {
                        var sBtn = currentCard.querySelector('.save-actions');
                        if (sBtn) {
                            sBtn.classList.remove('saved');
                            sBtn.textContent = 'Save';
                        }
                    }
                }
            }, 1200);
        }, function (error) {
            button.textContent = originalText;
            button.classList.remove('saving');
            button.disabled = false;
            dashboardError.textContent = error.message;
        });
    }

    function card(item, index) {
        var status = item.status || 'new';
        var assigned = item.assignedTo || '';
        var telecaller = item.contactedByTelecaller || '';
        var isEditing = !!editingEnquiryIds[item.id];
        var isJustSaved = (lastSavedId === item.id);
        var delay = Math.min((index || 0) * 0.04, 0.36);

        var bodyHtml = '';
        if (isEditing) {
            bodyHtml = '<div class="enquiry-body"><div class="edit-grid">' +
                '<label class="field"><span>Name</span><input class="edit-name" data-id="' + escapeHtml(item.id) + '" type="text" value="' + escapeHtml(item.name || '') + '" maxlength="80" required></label>' +
                '<div class="edit-row">' +
                    '<label class="field"><span>Email</span><input class="edit-email" type="email" value="' + escapeHtml(item.email || '') + '"></label>' +
                    '<label class="field"><span>Phone</span><input class="edit-phone" type="tel" value="' + escapeHtml(item.phone || '') + '"></label>' +
                '</div>' +
                '<div class="edit-row">' +
                    '<label class="field"><span>Enquiry About</span><select class="edit-category">' + getCategoryOptions(item.enquiryAbout) + '</select></label>' +
                    '<label class="field"><span>Heard Via</span><select class="edit-heard">' + getHeardOptions(item.heardAbout) + '</select></label>' +
                '</div>' +
                '<label class="field"><span>Notes / Remarks</span><textarea class="edit-notes" rows="2" placeholder="Notes">' + escapeHtml(item.notes || '') + '</textarea></label>' +
            '</div></div>';
        } else {
            bodyHtml = '<div class="enquiry-body"><h2>' + escapeHtml(item.name) + '</h2>' +
                '<div class="meta"><a href="mailto:' + escapeHtml(item.email) + '">' + escapeHtml(item.email) + '</a> &middot; <a href="tel:' + escapeHtml(item.phone) + '">' + escapeHtml(item.phone) + '</a><br>' +
                escapeHtml(item.enquiryAbout) + ' &middot; Heard via ' + escapeHtml(item.heardAbout) + '<br>' +
                formatDate(item.createdAt) + '</div>' +
                (item.notes ? '<p class="notes">' + escapeHtml(item.notes) + '</p>' : '') +
            '</div>';
        }

        var actionsHtml = '<div class="enquiry-actions">' +
            '<label class="field"><span>Assign to</span><input class="assignee" data-id="' + escapeHtml(item.id) + '" type="text" value="' + escapeHtml(assigned) + '" placeholder="Name" maxlength="80" autocomplete="off"></label>' +
            '<label class="field"><span>Contacted by telecaller</span><select class="telecaller" data-id="' + escapeHtml(item.id) + '" aria-label="Contacted by telecaller">' +
                '<option value="" ' + (telecaller === '' ? 'selected' : '') + '>—</option>' +
                '<option value="yes" ' + (telecaller === 'yes' ? 'selected' : '') + '>Yes</option>' +
                '<option value="no" ' + (telecaller === 'no' ? 'selected' : '') + '>No</option>' +
            '</select></label>' +
        '</div>';

        var sideHtml = '<div class="enquiry-side">' +
            '<div class="side-top">' +
                '<div class="reference">' + escapeHtml(item.reference) + '</div>' +
                '<select class="status ' + status + '" data-id="' + escapeHtml(item.id) + '" aria-label="Update enquiry status">' +
                    '<option value="new" ' + (status === 'new' ? 'selected' : '') + '>New</option>' +
                    '<option value="contacted" ' + (status === 'contacted' ? 'selected' : '') + '>Contacted</option>' +
                    '<option value="closed" ' + (status === 'closed' ? 'selected' : '') + '>Closed</option>' +
                    '<option value="not_interested" ' + (status === 'not_interested' ? 'selected' : '') + '>Not interested</option>' +
                '</select>' +
            '</div>' +
            '<div class="enquiry-buttons">' +
                '<button class="edit-actions secondary ' + (isEditing ? 'is-editing' : '') + '" data-id="' + escapeHtml(item.id) + '" type="button">' + (isEditing ? 'Cancel' : 'Edit') + '</button>' +
                '<button class="delete-actions secondary" data-id="' + escapeHtml(item.id) + '" type="button" title="Delete lead">Delete</button>' +
                '<button class="save-actions ' + (isJustSaved ? 'saved' : '') + '" data-id="' + escapeHtml(item.id) + '" type="button">' + (isJustSaved ? 'Saved' : 'Save') + '</button>' +
            '</div>' +
        '</div>';

        return '<article class="enquiry ' + (isEditing ? 'is-editing' : '') + '" style="animation-delay:' + delay + 's" data-id="' + escapeHtml(item.id) + '">' +
            bodyHtml + actionsHtml + sideHtml +
        '</article>';
    }

    if (!token) { window.location.href = 'admin.html'; return; }
    document.getElementById('logoutButton').addEventListener('click', logout);
    document.getElementById('refreshButton').addEventListener('click', loadEnquiries);
    var exportBtn = document.getElementById('exportButton');
    if (exportBtn) exportBtn.addEventListener('click', exportEnquiries);
    document.getElementById('search').addEventListener('input', render);
    document.getElementById('statusFilter').addEventListener('change', render);
    document.getElementById('categoryFilter').addEventListener('change', render);
    document.getElementById('dateFrom').addEventListener('change', render);
    document.getElementById('dateTo').addEventListener('change', render);
    document.getElementById('clearDates').addEventListener('click', function () {
        document.getElementById('dateFrom').value = '';
        document.getElementById('dateTo').value = '';
        render();
    });
    document.getElementById('reportMember').addEventListener('change', renderReport);
    loadEnquiries();
}());
