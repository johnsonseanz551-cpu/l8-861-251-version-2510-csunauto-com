(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMobileMenu() {
    var button = document.querySelector('[data-mobile-menu-button]');
    var menu = document.querySelector('[data-mobile-menu]');

    if (!button || !menu) {
      return;
    }

    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupHeroCarousel() {
    var carousel = document.querySelector('[data-hero-carousel]');

    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    function show(nextIndex) {
      index = nextIndex;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show((index + 1) % slides.length);
      }, 5000);
    }
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }

    values.forEach(function (value) {
      if (!value) {
        return;
      }
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function uniqueSorted(cards, attributeName) {
    var values = cards.map(function (card) {
      return card.getAttribute(attributeName) || '';
    }).filter(Boolean);

    return Array.from(new Set(values)).sort(function (a, b) {
      return b.localeCompare(a, 'zh-CN', { numeric: true });
    });
  }

  function setupFilters() {
    var root = document.querySelector('[data-filter-root]');

    if (!root) {
      return;
    }

    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var searchInput = root.querySelector('.js-search-input');
    var yearSelect = root.querySelector('.js-filter-year');
    var typeSelect = root.querySelector('.js-filter-type');
    var regionSelect = root.querySelector('.js-filter-region');
    var count = root.querySelector('[data-result-count]');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    fillSelect(yearSelect, uniqueSorted(cards, 'data-year'));
    fillSelect(typeSelect, uniqueSorted(cards, 'data-type'));
    fillSelect(regionSelect, uniqueSorted(cards, 'data-region'));

    if (query && searchInput) {
      searchInput.value = query;
    }

    function applyFilter() {
      var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var region = regionSelect ? regionSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = card.getAttribute('data-search') || '';
        var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchesYear = !year || card.getAttribute('data-year') === year;
        var matchesType = !type || card.getAttribute('data-type') === type;
        var matchesRegion = !region || card.getAttribute('data-region') === region;
        var isVisible = matchesKeyword && matchesYear && matchesType && matchesRegion;

        card.classList.toggle('is-hidden', !isVisible);
        if (isVisible) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = String(visible);
      }
    }

    [searchInput, yearSelect, typeSelect, regionSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    applyFilter();
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('.js-player'));

    players.forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('.player-start');
      var source = player.getAttribute('data-video-src') || (video && video.getAttribute('data-src'));
      var hlsInstance = null;

      if (!video || !source) {
        return;
      }

      function attachSource() {
        if (video.getAttribute('data-ready') === 'true') {
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else {
          video.src = source;
        }

        video.setAttribute('data-ready', 'true');
      }

      function startPlayer() {
        attachSource();
        player.classList.add('is-playing');
        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            video.controls = true;
          });
        }
      }

      if (button) {
        button.addEventListener('click', startPlayer);
      }

      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });

      window.addEventListener('beforeunload', function () {
        if (hlsInstance && typeof hlsInstance.destroy === 'function') {
          hlsInstance.destroy();
        }
      });
    });

    var scrollButtons = Array.prototype.slice.call(document.querySelectorAll('[data-scroll-player]'));
    scrollButtons.forEach(function (button) {
      button.addEventListener('click', function (event) {
        var player = document.querySelector('.js-player');
        if (player) {
          event.preventDefault();
          player.scrollIntoView({ behavior: 'smooth', block: 'center' });
          var start = player.querySelector('.player-start');
          if (start) {
            start.focus();
          }
        }
      });
    });
  }

  ready(function () {
    setupMobileMenu();
    setupHeroCarousel();
    setupFilters();
    setupPlayers();
  });
})();
