function initializeNavigation() {
    const toggle = document.querySelector("[data-mobile-toggle]");
    const nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
        return;
    }
    toggle.addEventListener("click", () => {
        nav.classList.toggle("open");
    });
}

function initializeHero() {
    const hero = document.querySelector("[data-hero]");
    if (!hero) {
        return;
    }
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
        return;
    }
    let current = 0;
    const activate = (index) => {
        current = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle("active", slideIndex === current);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle("active", dotIndex === current);
        });
    };
    dots.forEach((dot) => {
        dot.addEventListener("click", () => {
            activate(Number(dot.getAttribute("data-hero-dot")) || 0);
        });
    });
    window.setInterval(() => {
        activate(current + 1);
    }, 5600);
}

function normalize(value) {
    return String(value || "").trim().toLowerCase();
}

function applyFilters(scope) {
    const input = scope.querySelector("[data-search-input]");
    const cards = Array.from(scope.querySelectorAll("[data-movie-card]"));
    const query = normalize(input ? input.value : "");
    const yearButton = scope.querySelector("[data-filter-year].active");
    const typeButton = scope.querySelector("[data-filter-type].active");
    const selectedYear = yearButton ? yearButton.getAttribute("data-filter-year") : "all";
    const selectedType = typeButton ? typeButton.getAttribute("data-filter-type") : "all";
    cards.forEach((card) => {
        const haystack = normalize(card.getAttribute("data-search"));
        const year = card.getAttribute("data-year") || "";
        const type = card.getAttribute("data-type") || "";
        const queryMatch = !query || haystack.includes(query);
        const yearMatch = !selectedYear || selectedYear === "all" || year === selectedYear;
        const typeMatch = !selectedType || selectedType === "all" || type === selectedType;
        card.classList.toggle("hidden-by-filter", !(queryMatch && yearMatch && typeMatch));
    });
}

function initializeFilters() {
    const scopes = Array.from(document.querySelectorAll("[data-filter-scope]"));
    scopes.forEach((scope) => {
        const input = scope.querySelector("[data-search-input]");
        if (input) {
            input.addEventListener("input", () => applyFilters(scope));
        }
        scope.querySelectorAll("[data-filter-year]").forEach((button) => {
            button.addEventListener("click", () => {
                scope.querySelectorAll("[data-filter-year]").forEach((item) => item.classList.remove("active"));
                button.classList.add("active");
                applyFilters(scope);
            });
        });
        scope.querySelectorAll("[data-filter-type]").forEach((button) => {
            button.addEventListener("click", () => {
                scope.querySelectorAll("[data-filter-type]").forEach((item) => item.classList.remove("active"));
                button.classList.add("active");
                applyFilters(scope);
            });
        });
        const params = new URLSearchParams(window.location.search);
        const query = params.get("q");
        if (query && input) {
            input.value = query;
            applyFilters(scope);
        }
    });
}

function initMoviePlayer(options) {
    const video = document.getElementById(options.videoId);
    const button = document.getElementById(options.buttonId);
    const Hls = options.hlsConstructor;
    const source = options.source;
    if (!video || !button || !source) {
        return;
    }
    let loaded = false;
    let hls = null;
    let pendingPlay = false;
    const requestPlay = () => {
        const playTask = video.play();
        if (playTask && typeof playTask.catch === "function") {
            playTask.catch(() => {
                button.classList.remove("is-hidden");
            });
        }
    };
    const prepare = () => {
        if (loaded) {
            return;
        }
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            if (pendingPlay) {
                requestPlay();
            }
            return;
        }
        if (Hls && Hls.isSupported()) {
            hls = new Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                if (pendingPlay) {
                    requestPlay();
                }
            });
        }
    };
    const start = () => {
        pendingPlay = true;
        button.classList.add("is-hidden");
        prepare();
        requestPlay();
    };
    button.addEventListener("click", start);
    video.addEventListener("click", () => {
        if (video.paused) {
            start();
        }
    });
    video.addEventListener("play", () => {
        button.classList.add("is-hidden");
    });
    video.addEventListener("pause", () => {
        if (!video.ended) {
            button.classList.remove("is-hidden");
        }
    });
    window.addEventListener("beforeunload", () => {
        if (hls) {
            hls.destroy();
        }
    });
}

window.initMoviePlayer = initMoviePlayer;
initializeNavigation();
initializeHero();
initializeFilters();
