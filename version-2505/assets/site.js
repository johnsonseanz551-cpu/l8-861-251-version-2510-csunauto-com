(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function byData(name) {
    return document.querySelector("[data-" + name + "]");
  }

  function initMobileNav() {
    var button = byData("mobile-toggle");
    var nav = byData("mobile-nav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var thumbs = Array.prototype.slice.call(document.querySelectorAll("[data-hero-thumb]"));
    if (slides.length === 0) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle("is-active", position === current);
      });
      thumbs.forEach(function (thumb, position) {
        thumb.classList.toggle("is-active", position === current);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 6200);
    }

    thumbs.forEach(function (thumb, index) {
      thumb.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    show(0);
    start();
  }

  function initSearchForms() {
    Array.prototype.slice.call(document.querySelectorAll("[data-search-form]")).forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input");
        var keyword = input ? input.value.trim() : "";
        var url = "./search.html";
        if (keyword) {
          url += "?q=" + encodeURIComponent(keyword);
        }
        window.location.href = url;
      });
    });
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initFilters() {
    var input = byData("filter-keyword");
    var year = byData("filter-year");
    var type = byData("filter-type");
    var region = byData("filter-region");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var noResult = byData("no-result");
    if (cards.length === 0 || !input) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q");
    if (initial) {
      input.value = initial;
    }

    function matches(card) {
      var keyword = normalize(input.value);
      var yearValue = year ? normalize(year.value) : "";
      var typeValue = type ? normalize(type.value) : "";
      var regionValue = region ? normalize(region.value) : "";
      var haystack = normalize([
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year,
        card.dataset.genre,
        card.dataset.tags
      ].join(" "));

      if (keyword && haystack.indexOf(keyword) === -1) {
        return false;
      }
      if (yearValue && normalize(card.dataset.year) !== yearValue) {
        return false;
      }
      if (typeValue && normalize(card.dataset.type).indexOf(typeValue) === -1) {
        return false;
      }
      if (regionValue && normalize(card.dataset.region).indexOf(regionValue) === -1) {
        return false;
      }
      return true;
    }

    function apply() {
      var visible = 0;
      cards.forEach(function (card) {
        var ok = matches(card);
        card.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });
      if (noResult) {
        noResult.classList.toggle("is-visible", visible === 0);
      }
    }

    [input, year, type, region].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
    apply();
  }

  function initBackTop() {
    var button = byData("back-top");
    if (!button) {
      return;
    }
    button.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  window.initMoviePlayer = function (source) {
    var shell = byData("player");
    if (!shell) {
      return;
    }
    var video = shell.querySelector("video");
    var overlay = shell.querySelector("[data-player-overlay]");
    var notice = shell.querySelector("[data-player-notice]");
    var loaded = false;
    var hls = null;

    function showNotice(text) {
      if (notice) {
        notice.textContent = text;
      }
    }

    function load() {
      if (loaded || !video) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showNotice("播放暂时不可用，请稍后重试");
          }
        });
      } else {
        video.src = source;
      }
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    }

    function play() {
      load();
      if (overlay) {
        overlay.hidden = true;
      }
      video.controls = true;
      video.play().catch(function () {
        showNotice("点击画面继续播放");
      });
    }

    if (overlay) {
      overlay.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (!loaded || video.paused) {
        play();
      }
    });
  };

  ready(function () {
    initMobileNav();
    initHero();
    initSearchForms();
    initFilters();
    initBackTop();
  });
})();
