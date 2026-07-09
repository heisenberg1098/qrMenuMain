/**
 * nav.js
 * Mobile navigation sheet toggle + page loader dismissal.
 */

export function initMobileNav() {
  const toggle = document.querySelector("[data-nav-toggle]");
  const sheet = document.querySelector("[data-mobile-nav]");
  if (!toggle || !sheet) return;

  const closeIcon = toggle.querySelector("[data-icon-close]");
  const openIcon = toggle.querySelector("[data-icon-open]");

  const setOpen = (open) => {
    sheet.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
    if (openIcon && closeIcon) {
      openIcon.style.display = open ? "none" : "";
      closeIcon.style.display = open ? "" : "none";
    }
  };

  toggle.addEventListener("click", () => {
    setOpen(!sheet.classList.contains("is-open"));
  });

  sheet.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setOpen(false));
  });
}

export function initPageLoader() {
  const loader = document.querySelector("[data-page-loader]");
  if (!loader) return;
  window.addEventListener("load", () => {
    setTimeout(() => loader.classList.add("is-hidden"), 280);
  });
  // Safety fallback in case 'load' already fired
  setTimeout(() => loader.classList.add("is-hidden"), 1800);
}
