// =========================================================
// Mental Wellness Hub — shared helpers used on every page
// Page scripts (mood-tracker.js, quiz.js, ...) load after this file
// and use the MWH object below.
// =========================================================

const MWH = (() => {
  // === Safe localStorage wrapper (never throws, always returns usable data) ===
  const store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch (err) {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (err) {
        return false;
      }
    },
    remove(key) {
      try {
        localStorage.removeItem(key);
      } catch (err) {
        // ignore
      }
    }
  };

  // Escape user text before it goes into innerHTML (prevents HTML injection)
  const escapeHTML = (text) =>
    String(text).replace(/[&<>"']/g, (ch) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[ch]);

  // "2026-10-22" style key in the user's local time zone
  const dateKey = (date = new Date()) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const parseKey = (key) => {
    const [y, m, d] = key.split("-").map(Number);
    return new Date(y, m - 1, d);
  };

  const formatDate = (key, options = { weekday: "short", day: "numeric", month: "short" }) =>
    parseKey(key).toLocaleDateString("en-SG", options);

  // Count consecutive days (ending today or yesterday) that appear in a list of date keys
  const streak = (keys) => {
    const days = new Set(keys);
    const cursor = new Date();
    if (!days.has(dateKey(cursor))) cursor.setDate(cursor.getDate() - 1);

    let count = 0;
    while (days.has(dateKey(cursor))) {
      count++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  };

  // Shared mood scale used by the tracker, check-in form and home page
  const MOODS = {
    1: { emoji: "😣", label: "Awful" },
    2: { emoji: "😕", label: "Low" },
    3: { emoji: "😐", label: "Okay" },
    4: { emoji: "🙂", label: "Good" },
    5: { emoji: "😄", label: "Great" }
  };

  const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return { store, escapeHTML, dateKey, parseKey, formatDate, streak, MOODS, reducedMotion };
})();

document.addEventListener("DOMContentLoaded", () => {
  // === Dark / light mode toggle ===
  const themeToggle = document.getElementById("themeToggle");
  const root = document.documentElement;

  const syncToggleLabel = () => {
    if (!themeToggle) return;
    const isDark = root.getAttribute("data-bs-theme") === "dark";
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
    themeToggle.title = isDark ? "Light mode" : "Dark mode";
  };

  if (themeToggle) {
    syncToggleLabel();
    themeToggle.addEventListener("click", () => {
      const next = root.getAttribute("data-bs-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-bs-theme", next);
      try {
        localStorage.setItem("mwh-theme", next);
      } catch (err) {
        // theme still changes for this visit
      }
      syncToggleLabel();
    });
  }

  // === Footer year ===
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // === Close the mobile menu after picking a link ===
  const navCollapse = document.getElementById("primaryNav");
  if (navCollapse && window.bootstrap) {
    navCollapse.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        const menu = bootstrap.Collapse.getInstance(navCollapse);
        if (menu) menu.hide();
      });
    });
  }

  // === Gentle fade-in for sections as they scroll into view ===
  const revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length && root.classList.contains("js-reveal")) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealEls.forEach((el) => observer.observe(el));
  }
});
