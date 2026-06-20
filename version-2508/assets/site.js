(function () {
    var body = document.body;
    var toggle = document.querySelector('.menu-toggle');
    if (toggle) {
        toggle.addEventListener('click', function () {
            body.classList.toggle('menu-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var active = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, position) {
            slide.classList.toggle('active', position === active);
        });
        dots.forEach(function (dot, position) {
            dot.classList.toggle('active', position === active);
        });
    }

    function restartHero() {
        if (timer) {
            window.clearInterval(timer);
        }
        if (slides.length > 1) {
            timer = window.setInterval(function () {
                showSlide(active + 1);
            }, 5600);
        }
    }

    if (prev) {
        prev.addEventListener('click', function () {
            showSlide(active - 1);
            restartHero();
        });
    }

    if (next) {
        next.addEventListener('click', function () {
            showSlide(active + 1);
            restartHero();
        });
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
            restartHero();
        });
    });

    showSlide(0);
    restartHero();

    var forms = Array.prototype.slice.call(document.querySelectorAll('form.site-search'));
    forms.forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            if (!input || !input.value.trim()) {
                event.preventDefault();
                window.location.href = './search.html';
            }
        });
    });

    var filterInput = document.querySelector('.filter-input');
    var filterControls = Array.prototype.slice.call(document.querySelectorAll('.filter-control'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('.filter-list .movie-card'));
    var state = document.querySelector('[data-search-state]');

    function getQueryParam(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name) || '';
    }

    function applyFilters() {
        if (!cards.length) {
            return;
        }
        var term = filterInput ? filterInput.value.trim().toLowerCase() : '';
        var filters = {};
        filterControls.forEach(function (control) {
            filters[control.getAttribute('data-filter')] = control.value.trim().toLowerCase();
        });
        var visible = 0;
        cards.forEach(function (card) {
            var match = true;
            var search = card.getAttribute('data-search') || '';
            if (term && search.indexOf(term) === -1) {
                match = false;
            }
            Object.keys(filters).forEach(function (key) {
                var value = filters[key];
                var data = (card.getAttribute('data-' + key) || '').toLowerCase();
                if (value && data.indexOf(value) === -1) {
                    match = false;
                }
            });
            card.classList.toggle('is-hidden', !match);
            if (match) {
                visible += 1;
            }
        });
        if (state) {
            state.textContent = visible > 0 ? '片库结果' : '没有找到匹配内容';
        }
    }

    if (filterInput) {
        var initialQuery = getQueryParam('q');
        if (initialQuery) {
            filterInput.value = initialQuery;
        }
        filterInput.addEventListener('input', applyFilters);
    }

    filterControls.forEach(function (control) {
        control.addEventListener('change', applyFilters);
    });

    applyFilters();
})();
