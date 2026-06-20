(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMobileMenu() {
        var button = qs('[data-menu-toggle]');
        var panel = qs('[data-mobile-panel]');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function setupSearchForms() {
        qsa('[data-search-form]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = qs('input[name="q"]', form) || qs('input[type="search"]', form);
                var value = input ? input.value.trim() : '';
                var target = 'search.html';
                if (value) {
                    target += '?q=' + encodeURIComponent(value);
                }
                window.location.href = target;
            });
        });
    }

    function setupHero() {
        var root = qs('[data-hero]');
        if (!root) {
            return;
        }
        var slides = qsa('[data-hero-slide]', root);
        var controls = qsa('[data-hero-control]', root);
        var current = 0;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            controls.forEach(function (control, controlIndex) {
                control.classList.toggle('is-active', controlIndex === current);
            });
        }
        controls.forEach(function (control, index) {
            control.addEventListener('click', function () {
                show(index);
            });
        });
        if (slides.length > 1) {
            window.setInterval(function () {
                show(current + 1);
            }, 6500);
        }
    }

    function setupFilters() {
        var input = qs('[data-filter-input]');
        var year = qs('[data-filter-year]');
        var cards = qsa('[data-card]');
        var empty = qs('[data-empty-state]');
        if (!input || !cards.length) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        if (query) {
            input.value = query;
        }
        function apply() {
            var keyword = input.value.trim().toLowerCase();
            var selectedYear = year ? year.value : '';
            var visible = 0;
            cards.forEach(function (card) {
                var text = (card.getAttribute('data-search') || '').toLowerCase();
                var cardYear = card.getAttribute('data-year') || '';
                var matchedText = !keyword || text.indexOf(keyword) !== -1;
                var matchedYear = !selectedYear || cardYear === selectedYear;
                var ok = matchedText && matchedYear;
                card.style.display = ok ? '' : 'none';
                if (ok) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }
        input.addEventListener('input', apply);
        if (year) {
            year.addEventListener('change', apply);
        }
        apply();
    }

    function setupPlayer() {
        var player = qs('[data-player]');
        if (!player) {
            return;
        }
        var video = qs('video', player);
        var overlay = qs('[data-play-overlay]', player);
        if (!video || !overlay) {
            return;
        }
        var stream = video.getAttribute('data-stream');
        var ready = false;
        var hls = null;
        function attach() {
            if (ready || !stream) {
                return;
            }
            ready = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    maxBufferLength: 40,
                    enableWorker: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else {
                video.src = stream;
            }
        }
        function play() {
            attach();
            player.classList.add('is-playing');
            video.setAttribute('controls', 'controls');
            var started = video.play();
            if (started && typeof started.catch === 'function') {
                started.catch(function () {});
            }
        }
        overlay.addEventListener('click', play);
        video.addEventListener('click', function () {
            if (!ready) {
                play();
            }
        });
        window.addEventListener('pagehide', function () {
            if (hls && typeof hls.destroy === 'function') {
                hls.destroy();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileMenu();
        setupSearchForms();
        setupHero();
        setupFilters();
        setupPlayer();
    });
})();
