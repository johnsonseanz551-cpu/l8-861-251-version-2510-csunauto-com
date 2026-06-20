(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var active = 0;

    function showHero(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === active);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showHero(index);
      });
    });

    showHero(0);
    if (slides.length > 1) {
      setInterval(function () {
        showHero(active + 1);
      }, 5200);
    }
  }

  function normalize(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  function runFilter(panel) {
    var input = panel.querySelector('[data-filter-input]');
    var buttons = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-value]'));
    var scope = panel.parentElement || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-search]'));
    var empty = scope.querySelector('[data-empty-state]');
    var query = normalize(input ? input.value : '');
    var activeButton = buttons.find(function (button) {
      return button.classList.contains('is-active');
    });
    var activeValue = normalize(activeButton ? activeButton.getAttribute('data-filter-value') : '');
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize(card.getAttribute('data-search'));
      var type = normalize(card.getAttribute('data-type'));
      var genre = normalize(card.getAttribute('data-genre'));
      var queryHit = !query || haystack.indexOf(query) !== -1;
      var typeHit = !activeValue || type.indexOf(activeValue) !== -1 || genre.indexOf(activeValue) !== -1;
      var show = queryHit && typeHit;
      card.hidden = !show;
      if (show) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle('is-visible', visible === 0);
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-card-filter]')).forEach(function (panel) {
    var input = panel.querySelector('[data-filter-input]');
    var buttons = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-value]'));

    if (input) {
      input.addEventListener('input', function () {
        runFilter(panel);
      });
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        buttons.forEach(function (item) {
          item.classList.remove('is-active');
        });
        button.classList.add('is-active');
        runFilter(panel);
      });
    });

    var params = new URLSearchParams(window.location.search);
    var keyword = params.get('q');
    if (keyword && input) {
      input.value = keyword;
    }
    runFilter(panel);
  });
})();
