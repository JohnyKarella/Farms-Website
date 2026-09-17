// Tabs & Accordion Toggle for Mobile & Desktop
(function () {
    function initTabsToggle() {
        var diffWraps = document.querySelectorAll('.diff-wrap');
        if (!diffWraps.length) return;

        diffWraps.forEach(function (wrap) {
            var labels = wrap.querySelectorAll('.diff-right label[for]');

            labels.forEach(function (label) {
                label.addEventListener('click', function (e) {
                    // Do not close if clicking inside the expanded content (buttons, links, text)
                    if (e.target.closest('.tab-expand')) {
                        return;
                    }

                    var forId = label.getAttribute('for');
                    if (!forId) return;

                    var radio = document.getElementById(forId);
                    if (!radio) return;

                    var isMobile = window.matchMedia('(max-width: 900px)').matches;
                    var isToggleBtn = e.target.closest('.tab-tog');

                    // If the item is already open:
                    // On mobile view (accordion mode), clicking the header or the cross button closes it.
                    // On desktop, clicking the cross button specifically closes it.
                    if (radio.checked) {
                        if (isMobile || isToggleBtn) {
                            e.preventDefault();
                            e.stopPropagation();
                            radio.checked = false;
                            radio.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                    }
                }, true); // Capture phase ensures we intercept before label's default action
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTabsToggle);
    } else {
        initTabsToggle();
    }
})();
