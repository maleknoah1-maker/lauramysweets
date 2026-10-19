// Laura, My Sweets: small site behaviors. No dependencies.
(function () {
  "use strict";

  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  // Announcement bar: dismissal is remembered per message, so a new message shows again.
  var bar = document.querySelector("[data-announce]");
  if (bar) {
    var key = "lms-announce:" + bar.getAttribute("data-announce");
    if (store.get(key) === "dismissed") bar.hidden = true;
    var close = bar.querySelector(".announce-close");
    if (close) close.addEventListener("click", function () {
      bar.hidden = true;
      store.set(key, "dismissed");
    });
  }

  // Desktop "Custom Cakes" dropdown
  document.querySelectorAll(".has-sub > button").forEach(function (btn) {
    var menu = document.getElementById(btn.getAttribute("aria-controls"));
    function set(open) { btn.setAttribute("aria-expanded", String(open)); menu.hidden = !open; }
    btn.addEventListener("click", function (e) { e.stopPropagation(); set(menu.hidden); });
    document.addEventListener("click", function (e) { if (!menu.contains(e.target)) set(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !menu.hidden) { set(false); btn.focus(); } });
  });

  // Phone menu
  var openBtn = document.querySelector(".header-pill .menu-btn");
  var panel = document.getElementById("mobile-menu");
  if (openBtn && panel) {
    var closeBtn = panel.querySelector("[data-close-menu]");
    var setMenu = function (open) {
      panel.hidden = !open;
      openBtn.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
      (open ? closeBtn : openBtn).focus();
    };
    openBtn.addEventListener("click", function () { setMenu(true); });
    closeBtn.addEventListener("click", function () { setMenu(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !panel.hidden) setMenu(false); });
  }

  // Gentle fade-up on scroll
  var reveals = document.querySelectorAll(".reveal");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!("IntersectionObserver" in window) || reduce) {
    reveals.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  }

  // Analytics hooks. GA4 itself is wired in step 4; until then these are no-ops.
  document.addEventListener("click", function (e) {
    var el = e.target.closest && e.target.closest("[data-track]");
    if (el && typeof window.gtag === "function") window.gtag("event", el.getAttribute("data-track"));
  });
})();
