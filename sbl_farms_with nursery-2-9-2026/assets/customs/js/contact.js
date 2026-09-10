// Contact


(function () {

    /* ── Config ── */
    var STEP_LABELS = ['Your Details', 'Remarks / Notes', 'Submitted'];
    var TOTAL_STEPS = 3;
    var currentStep = 1;
    var guests = 2;
    var lastReference = '';
    var enquiryModal = document.getElementById('enquiryModal');

    function closeEnquiryModal() {
        if (enquiryModal) enquiryModal.hidden = true;
        document.body.classList.remove('enquiry-modal-open');
    }

    function showEnquiryModal(reference) {
        var data = getData();
        var nameEl = document.getElementById('modalName');
        var referenceEl = document.getElementById('modalReference');
        if (nameEl) nameEl.textContent = data.name !== '—' ? data.name : 'there';
        if (referenceEl) referenceEl.textContent = reference ? 'Reference: ' + reference : '';
        if (enquiryModal) {
            enquiryModal.hidden = false;
            document.body.classList.add('enquiry-modal-open');
            document.getElementById('closeEnquiryModal').focus();
        }
    }

    function getApiUrl() {
        if (window.SBL_CONTACT_API) {
            return window.SBL_CONTACT_API;
        }
        if (location.protocol === 'file:') {
            return 'http://127.0.0.1:5000/api/enquiry';
        }
        var port = location.port;
        if (port === '5500' || port === '3000' || port === '5173' || port === '8080') {
            return 'http://' + (location.hostname || '127.0.0.1') + ':5000/api/enquiry';
        }
        return '/api/enquiry';
    }

    /* ── Build step indicator ── */
    function buildIndicator() {
        var wrap = document.getElementById('stepIndicator');
        wrap.innerHTML = '';
        for (var i = 1; i <= TOTAL_STEPS; i++) {
            var col = document.createElement('div');
            col.className = 'step-col';

            var circle = document.createElement('div');
            circle.className = 'step-circle';
            circle.id = 'sc' + i;

            var lbl = document.createElement('div');
            lbl.className = 'step-label';
            lbl.id = 'sl' + i;
            lbl.textContent = STEP_LABELS[i - 1];

            col.appendChild(circle);
            col.appendChild(lbl);
            wrap.appendChild(col);

            if (i < TOTAL_STEPS) {
                var conn = document.createElement('div');
                conn.className = 'step-connector';
                conn.id = 'conn' + i;
                wrap.appendChild(conn);
            }
        }
        updateIndicator();
    }

    function updateIndicator() {
        for (var i = 1; i <= TOTAL_STEPS; i++) {
            var circle = document.getElementById('sc' + i);
            var lbl = document.getElementById('sl' + i);
            var conn = document.getElementById('conn' + i);

            if (i < currentStep) {
                circle.className = 'step-circle done';
                circle.innerHTML = '<i class="fa fa-check"></i>';
                lbl.className = 'step-label done';
            } else if (i === currentStep) {
                circle.className = 'step-circle active';
                circle.innerHTML = i;
                lbl.className = 'step-label active';
            } else {
                circle.className = 'step-circle';
                circle.innerHTML = i;
                lbl.className = 'step-label';
            }
            if (conn) conn.className = 'step-connector' + (i < currentStep ? ' done' : '');
        }
    }

    /* ── Show step ── */
    function goToStep(n) {
        document.querySelectorAll('.step-panel').forEach(function (p) { p.classList.remove('active'); });
        var panel = document.getElementById('step' + n);
        if (panel) panel.classList.add('active');
        currentStep = n;
        updateIndicator();
        if (n === 2) buildReview('reviewBody');
        if (n === 3) buildStep4();
        /* Scroll to top of booking card */
        var card = document.querySelector('.booking-card');
        if (card) window.scrollTo({ top: card.getBoundingClientRect().top + window.scrollY - 20, behavior: 'smooth' });
    }

    /* ── Collect form data ── */
    function fieldValue(id) {
        var el = document.getElementById(id);
        return el ? el.value.trim() : '';
    }

    function getData() {
        return {
            name: fieldValue('fname') || '—',
            phone: fieldValue('fphone') || '—',
            email: fieldValue('femail') || '—',
            enquiryAbout: fieldValue('fsource1') || '—',
            heardAbout: fieldValue('fsource2') || '—',
            notes: fieldValue('fnotes') || '—'
        };
    }

    /* ── Build review table ── */
    function buildReview(tbodyId) {

        var d = getData();

        var rows = [
            ['Full Name', d.name],
            ['Phone / WhatsApp', d.phone],
            ['Email', d.email],
            ['Enquiry About', d.enquiryAbout],
            ['Heard About Us', d.heardAbout],
            ['Remarks', d.notes]
        ];

        var tbody = document.getElementById(tbodyId);

        if (!tbody) return;

        tbody.innerHTML = rows.map(function (r) {
            return '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td></tr>';
        }).join('');
    }

    /* ── Step 4 success content ── */
    function buildStep4() {
        var d = getData();
        /* personalise greeting */
        var nameEl = document.getElementById('confirmName');
        if (nameEl) nameEl.textContent = d.name !== '—' ? d.name : 'there';
        /* reference number */
        var ref = lastReference || ('SBL-' + Date.now().toString().slice(-6));
        var refEl = document.getElementById('confirmRef');
        if (refEl) refEl.textContent = 'Reference: ' + ref;
        /* summary table */
        buildReview('confirmBody');
    }

    /* ── Guest counter ── */

    /* ── Add-on checkboxes ── */


    /* ── Validation ── */
    var REQUIRED_FIELDS = {
        1: [
            { id: 'fname', msg: 'Please enter your full name.' },
            { id: 'fphone', msg: 'Please enter your phone / WhatsApp number.' },
            { id: 'femail', msg: 'Please enter your email id.' }
        ],
        2: [
            { id: 'fsource1', msg: 'Please select what your enquiry is about.' },
            { id: 'fsource2', msg: 'Please select how you heard about us.' }
        ]
    };

    function showFieldError(id, msg) {
        var field = document.getElementById(id);
        var err = document.getElementById('err-' + id);
        if (field) field.classList.add('invalid');
        if (err) {
            err.textContent = msg;
            err.classList.add('show');
        }
    }

    function clearFieldError(id) {
        var field = document.getElementById(id);
        var err = document.getElementById('err-' + id);
        if (field) field.classList.remove('invalid');
        if (err) {
            err.textContent = '';
            err.classList.remove('show');
        }
    }

function validateStep(stepNum) {

    var fields = REQUIRED_FIELDS[stepNum] || [];
    var isValid = true;

    fields.forEach(function (f) {

        var field = document.getElementById(f.id);

        var value = field ? field.value.trim() : "";

        if (!value) {

            showFieldError(f.id, f.msg);
            isValid = false;
            return;

        }

        /* Phone Validation */

        if (f.id === "fphone") {

            if (!/^[0-9]{10}$/.test(value)) {

                showFieldError(
                    "fphone",
                    "Phone number must contain exactly 10 digits."
                );

                isValid = false;
                return;
            }
        }

        /* Email Validation */

        if (f.id === "femail") {

            var emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

            if (!emailPattern.test(value)) {

                showFieldError(
                    "femail",
                    "Please enter a valid email address (e.g. example@gmail.com)."
                );

                isValid = false;
                return;
            }
        }

        clearFieldError(f.id);

    });

    return isValid;

}

    /* Clear a field's error as soon as the user fixes it */
    Object.keys(REQUIRED_FIELDS).forEach(function (stepNum) {
        REQUIRED_FIELDS[stepNum].forEach(function (f) {
            var field = document.getElementById(f.id);
            if (!field) return;
            var evt = (field.tagName === 'SELECT') ? 'change' : 'input';
            field.addEventListener(evt, function () {

    var value = field.value.trim();

    if (!value) return;

    if (f.id === "fphone") {

        if (/^[0-9]{10}$/.test(value)) {
            clearFieldError(f.id);
        }

        return;
    }

    if (f.id === "femail") {

        if (/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value)) {
            clearFieldError(f.id);
        }

        return;
    }

    clearFieldError(f.id);

});
        });
    });

    /* ── Navigation ── */

    document.getElementById('n1').addEventListener('click', function () {
        if (!validateStep(1)) return;
        goToStep(2);
    });

    document.getElementById('b2').addEventListener('click', function () {
        goToStep(1);
    });

    document.getElementById('submitBtn').addEventListener('click', async function () {
        if (!validateStep(2)) return;

        var btn = document.getElementById('submitBtn');
        var originalHtml = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> &nbsp;Submitting…';

        var payload = getData();

        try {
            var response = await fetch(getApiUrl(), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: payload.name,
                    phone: payload.phone,
                    email: payload.email,
                    enquiryAbout: payload.enquiryAbout,
                    heardAbout: payload.heardAbout,
                    notes: payload.notes === '—' ? '' : payload.notes
                })
            });

            var result = {};
            try {
                result = await response.json();
            } catch (parseErr) {
                result = {};
            }

            if (response.ok && result.success) {
                lastReference = result.reference || '';
                goToStep(3);
                showEnquiryModal(lastReference);
                return;
            }

            alert(result.message || 'Could not submit enquiry. Please try again.');
        } catch (networkErr) {
            alert('Could not reach the enquiry server. Start python app.py first.');
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalHtml;
        }
    });

    /* ── Reset / new booking ── */
    document.getElementById('newBookingBtn').addEventListener('click', function () {
        closeEnquiryModal();
        document.getElementById('fname').value = '';
        document.getElementById('fphone').value = '';
        document.getElementById('femail').value = '';
        document.getElementById('fsource1').value = '';
        document.getElementById('fsource2').value = '';
        document.getElementById('fnotes').value = '';
        lastReference = '';

        Object.keys(REQUIRED_FIELDS).forEach(function (stepNum) {
            REQUIRED_FIELDS[stepNum].forEach(function (f) { clearFieldError(f.id); });
        });

        goToStep(1);
    });

    document.getElementById('closeEnquiryModal').addEventListener('click', closeEnquiryModal);
    document.querySelector('[data-close-enquiry]').addEventListener('click', closeEnquiryModal);
    document.getElementById('popupNewBookingBtn').addEventListener('click', function () {
        document.getElementById('newBookingBtn').click();
    });
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && enquiryModal && !enquiryModal.hidden) closeEnquiryModal();
    });

    /* ── Set date min ── */

    /* ── Keyboard nav ── */
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && currentStep === 1) {
            e.preventDefault();
            document.getElementById('n1').click();
        }
    });

    /* ── Contact form ── */
    var contactSend = document.getElementById('contactSend');
    if (contactSend) {
        contactSend.addEventListener('click', function () {
            var grid = document.getElementById('contactFormGrid');
            var success = document.getElementById('contactSuccess');
            if (grid) grid.style.display = 'none';
            if (success) success.style.display = 'block';
        });
    }

    /* ── Init ── */
    buildIndicator();

})();













// CONTACT required
/* Phone number : allow only digits and maximum 10 */

var phoneInput = document.getElementById("fphone");

if (phoneInput) {

    phoneInput.addEventListener("input", function () {

        this.value = this.value.replace(/\D/g, "");

        if (this.value.length > 10) {
            this.value = this.value.slice(0, 10);
        }

    });

}