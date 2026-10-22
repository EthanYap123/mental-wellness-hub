// === Theme: apply the saved (or system) colour scheme before the page paints ===
// Loaded in <head> without defer so there is no flash of the wrong theme.
(() => {
  let saved = null;
  try {
    saved = localStorage.getItem("mwh-theme");
  } catch (err) {
    // Storage can be blocked (e.g. private mode) — fall back to the system setting
  }

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = saved === "light" || saved === "dark" ? saved : (prefersDark ? "dark" : "light");
  document.documentElement.setAttribute("data-bs-theme", theme);

  // Turn on scroll-reveal styles early so sections don't flash in then hide
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if ("IntersectionObserver" in window && !reduceMotion) {
    document.documentElement.classList.add("js-reveal");
  }
})();
