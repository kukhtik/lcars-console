/* app.js — темы, часы, цифровое поле, 6 состояний. Без библиотек. */
(function () {
  "use strict";
  var html = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* тема */
  var saved = null;
  try { saved = localStorage.getItem("lcars-theme"); } catch (e) {}
  if (saved) html.setAttribute("data-theme", saved);
  document.querySelectorAll("[data-theme-value]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var t = btn.getAttribute("data-theme-value");
      html.setAttribute("data-theme", t);
      try { localStorage.setItem("lcars-theme", t); } catch (e) {}
      document.querySelectorAll("[data-theme-value]").forEach(function (b) {
        b.setAttribute("aria-pressed", String(b === btn));
      });
    });
    btn.setAttribute("aria-pressed", String(btn.getAttribute("data-theme-value") === html.getAttribute("data-theme")));
  });

  /* часы */
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  var t0 = Date.now();
  var clock = document.getElementById("clock");
  var dateEl = document.getElementById("date");
  var uptime = document.getElementById("uptime");
  function tick() {
    var d = new Date();
    if (clock) clock.textContent = pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds());
    if (dateEl) dateEl.textContent = d.getFullYear() + "." + pad(d.getMonth() + 1) + "." + pad(d.getDate());
    if (uptime) {
      var s = Math.floor((Date.now() - t0) / 1000);
      uptime.textContent = pad(Math.floor(s / 60)) + ":" + pad(s % 60);
    }
  }
  tick();
  setInterval(tick, 1000);

  /* фоновое звёздное поле (ambient) */
  var canvas = document.getElementById("stars");
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    var stars = [];
    function resize() {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);
    for (var i = 0; i < 110; i++) {
      stars.push({ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
                   z: 0.2 + Math.random() * 0.8, r: 0.3 + Math.random() * 1.1 });
    }
    function draw() {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (var k = 0; k < stars.length; k++) {
        var st = stars[k];
        ctx.globalAlpha = 0.12 + 0.5 * st.z;
        ctx.fillStyle = "#cfd8ff";
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.r, 0, 6.2832);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    function step() {
      for (var k = 0; k < stars.length; k++) {
        var s = stars[k];
        s.x -= 0.02 * s.z;
        if (s.x < -2) s.x = window.innerWidth + 2;
      }
      draw();
      if (!reduce) requestAnimationFrame(step);
    }
    if (reduce) draw(); else requestAnimationFrame(step);
  }

  /* состояния главной */
  var states = Array.prototype.slice.call(document.querySelectorAll(".state"));
  var steps = Array.prototype.slice.call(document.querySelectorAll(".track .step"));
  var current = 0;
  function setState(i) {
    if (i === current && states[i] && states[i].classList.contains("is-on")) return;
    current = i;
    states.forEach(function (el, k) { el.classList.toggle("is-on", k === i); });
    document.querySelectorAll("[data-state-link]").forEach(function (a) {
      a.setAttribute("aria-current", String(Number(a.getAttribute("data-state-link")) === i));
    });
  }
  if (states.length) setState(0);
  if (steps.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) setState(steps.indexOf(e.target));
      });
    }, { threshold: 0.5 });
    steps.forEach(function (s) { io.observe(s); });
  }
  document.querySelectorAll("[data-state-link]").forEach(function (a) {
    a.addEventListener("click", function (ev) {
      var i = Number(a.getAttribute("data-state-link"));
      if (steps[i]) { ev.preventDefault(); steps[i].scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }); }
    });
  });
  document.addEventListener("keydown", function (e) {
    if (!states.length) return;
    if (e.key === "ArrowDown" || e.key === "PageDown") {
      e.preventDefault();
      if (steps[current + 1]) steps[current + 1].scrollIntoView({ behavior: "smooth" });
    }
    if (e.key === "ArrowUp" || e.key === "PageUp") {
      e.preventDefault();
      if (steps[current - 1]) steps[current - 1].scrollIntoView({ behavior: "smooth" });
    }
  });
})();
