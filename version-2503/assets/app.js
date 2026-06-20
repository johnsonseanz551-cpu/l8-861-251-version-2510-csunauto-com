(function () {
  var toggle = document.querySelector(".mobile-toggle");
  var panel = document.querySelector(".mobile-panel");
  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      var opened = panel.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  var topButton = document.querySelector(".back-top");
  if (topButton) {
    topButton.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  document.querySelectorAll("[data-hero-slider]").forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    var prev = slider.querySelector(".hero-arrow.prev");
    var next = slider.querySelector(".hero-arrow.next");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5800);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    start();
  });

  document.querySelectorAll(".rail-wrap").forEach(function (wrap) {
    var rail = wrap.querySelector(".movie-rail");
    var prev = wrap.querySelector(".rail-prev");
    var next = wrap.querySelector(".rail-next");
    if (!rail) {
      return;
    }
    function move(direction) {
      rail.scrollBy({ left: direction * Math.max(280, rail.clientWidth * 0.72), behavior: "smooth" });
    }
    if (prev) {
      prev.addEventListener("click", function () {
        move(-1);
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        move(1);
      });
    }
  });

  document.querySelectorAll(".filter-panel").forEach(function (panel) {
    var input = panel.querySelector(".filter-input");
    var type = panel.querySelector(".filter-type");
    var region = panel.querySelector(".filter-region");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    if (input && initial) {
      input.value = initial;
    }

    function match(card) {
      var q = input ? input.value.trim().toLowerCase() : "";
      var t = type ? type.value : "";
      var r = region ? region.value : "";
      var hay = (card.getAttribute("data-search") || "").toLowerCase();
      var cardType = card.getAttribute("data-type") || "";
      var cardRegion = card.getAttribute("data-region") || "";
      return (!q || hay.indexOf(q) !== -1) && (!t || cardType.indexOf(t) !== -1) && (!r || cardRegion.indexOf(r) !== -1);
    }

    function apply() {
      cards.forEach(function (card) {
        card.classList.toggle("is-filter-hidden", !match(card));
      });
    }

    [input, type, region].forEach(function (node) {
      if (node) {
        node.addEventListener("input", apply);
        node.addEventListener("change", apply);
      }
    });
    apply();
  });
}());
