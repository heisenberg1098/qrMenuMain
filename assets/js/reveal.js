/**
 * reveal.js
 * Lightweight scroll-reveal system. Elements marked with [data-reveal] or
 * [data-reveal-scale] fade/slide into place once they enter the viewport.
 * Supports staggered groups via [data-reveal-group] (children get an
 * incremental transition-delay).
 */

export function initReveal() {
  const groups = document.querySelectorAll("[data-reveal-group]");
  groups.forEach((group) => {
    const children = group.querySelectorAll("[data-reveal], [data-reveal-scale]");
    children.forEach((child, i) => {
      child.style.setProperty("--d", `${i * 90}ms`);
    });
  });

  const targets = document.querySelectorAll("[data-reveal], [data-reveal-scale]");
  if (!("IntersectionObserver" in window) || targets.length === 0) {
    targets.forEach((t) => t.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
  );

  targets.forEach((t) => observer.observe(t));
}

/** Adds/removes .is-scrolled on the header once the page scrolls past a threshold. */
export function initHeaderScrollState() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}
