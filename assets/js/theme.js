/**
 * theme.js
 * Handles dark/light theme switching with localStorage persistence.
 * Applied as early as possible (inline in <head>) to avoid a flash of
 * the wrong theme; this module wires up the toggle button afterwards.
 */

const THEME_KEY = "qrmenu-theme";

export function getStoredTheme() {
  return localStorage.getItem(THEME_KEY);
}

export function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute("content", theme === "light" ? "#faf9f6" : "#0a0c10");
  }
}

export function initThemeToggle() {
  const toggleButtons = document.querySelectorAll("[data-theme-toggle]");
  const current = document.documentElement.getAttribute("data-theme") || "dark";

  toggleButtons.forEach((btn) => {
    btn.setAttribute("aria-pressed", current === "light");
    btn.addEventListener("click", () => {
      const now = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
      applyTheme(now);
      localStorage.setItem(THEME_KEY, now);
      toggleButtons.forEach((b) => b.setAttribute("aria-pressed", now === "light"));
    });
  });
}
