// Contact


(function () {

    /* ── Config ── */
    var STEP_LABELS = ['Your Details', 'Visit Details', 'Review & Confirm', 'SubmitConfirmed'];
    var TOTAL_STEPS = 4;
    var currentStep = 1;
    var guests = 2;

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
        if (n === 3) buildReview('reviewBody');
        if (n === 4) buildStep4();
        /* Scroll to top of booking card */
        var card = document.querySelector('.booking-card');
        if (card) window.scrollTo({ top: card.getBoundingClientRect().top + window.scrollY - 20, behavior: 'smooth' });
    }

    /* ── Collect form data ── */
    function getData() {
        var addons = [];
        document.querySelectorAll('#addons .check-item.checked').forEach(function (el) {
            addons.push(el.getAttribute('data-value'));
        });

        var timeVal = document.getElementById('ftime').value;
        var timeStr = timeVal;
        if (timeVal) {
            var parts = timeVal.split(':');
            var h = parseInt(parts[0], 10), m = parts[1];
            var ampm = h >= 12 ? 'PM' : 'AM';
            var h12 = h % 12 || 12;
            timeStr = h12 + ':' + m + ' ' + ampm;
        }

        var dateVal = document.getElementById('fdate').value;
        var dateStr = dateVal;
        if (dateVal) {
            try {
                dateStr = new Date(dateVal + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
            } catch (e) { }
        }

        return {
            name: document.getElementById('fname').value.trim() || '—',
            phone: document.getElementById('fphone').value.trim() || '—',
            email: document.getElementById('femail').value.trim() || '—',
            source: document.getElementById('fsource').value || '—',
            package: document.getElementById('fpackage').value || '—',
            date: dateStr || '—',
            time: timeStr || '—',
            guests: guests + ' person' + (guests !== 1 ? 's' : ''),
            addons: addons.length ? addons.join(', ') : 'None selected',
            notes: document.getElementById('fnotes').value.trim() || '—'
        };
    }

    /* ── Build review table ── */
    function buildReview(tbodyId) {
        var d = getData();
        var rows = [
            ['Name', d.name],
            ['Phone', d.phone],
            ['Email', d.email],
            ['Package', d.package],
            ['Date', d.date],
            ['Time', d.time],
            ['Guests', d.guests],
            ['Add-ons', d.addons],
            ['Notes', d.notes]
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
        var ref = 'SBL-' + Date.now().toString().slice(-6);
        var refEl = document.getElementById('confirmRef');
        if (refEl) refEl.textContent = 'Reference: ' + ref;
        /* summary table */
        buildReview('confirmBody');
    }

    /* ── Guest counter ── */
    document.getElementById('gMinus').addEventListener('click', function () {
        if (guests > 1) { guests--; refresh(); }
    });
    document.getElementById('gPlus').addEventListener('click', function () {
        if (guests < 200) { guests++; refresh(); }
    });
    function refresh() {
        document.getElementById('gCount').textContent = guests;
        document.getElementById('fguests').value = guests;
    }

    /* ── Add-on checkboxes ── */
    document.querySelectorAll('#addons .check-item').forEach(function (item) {
        item.addEventListener('click', function () {
            this.classList.toggle('checked');
        });
    });

    /* ── Navigation ── */
    document.getElementById('n1').addEventListener('click', function () { goToStep(2); });
    document.getElementById('b2').addEventListener('click', function () { goToStep(1); });
    document.getElementById('n2').addEventListener('click', function () { goToStep(3); });
    document.getElementById('b3').addEventListener('click', function () { goToStep(2); });
    document.getElementById('submitBtn').addEventListener('click', function () { goToStep(4); });

    /* ── Reset / new booking ── */
    document.getElementById('newBookingBtn').addEventListener('click', function () {
        document.getElementById('fname').value = '';
        document.getElementById('fphone').value = '';
        document.getElementById('femail').value = '';
        document.getElementById('fsource').value = '';
        document.getElementById('fpackage').value = '';
        document.getElementById('fdate').value = '';
        document.getElementById('ftime').value = '';
        document.getElementById('fnotes').value = '';
        guests = 2; refresh();
        document.querySelectorAll('#addons .check-item').forEach(function (el) { el.classList.remove('checked'); });
        goToStep(1);
    });

    /* ── Set date min ── */
    document.getElementById('fdate').setAttribute('min', new Date().toISOString().split('T')[0]);

    /* ── Keyboard nav ── */
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
            if (currentStep === 1) document.getElementById('n1').click();
            else if (currentStep === 2) document.getElementById('n2').click();
        }
    });

    /* ── Contact form ── */
    document.getElementById('contactSend').addEventListener('click', function () {
        document.getElementById('contactFormGrid').style.display = 'none';
        document.getElementById('contactSuccess').style.display = 'block';
    });

    /* ── Init ── */
    buildIndicator();

})();










