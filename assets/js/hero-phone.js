/**
 * hero-phone.js
 * Fills the homepage phone mockup with real product data so it reads as a
 * working app rather than a static screenshot, and gently auto-cycles the
 * active category pill to imply life/interactivity without user input.
 */

import { PRODUCTS, CATEGORIES } from "./data/products.js";

export function initHeroPhone() {
  const wrap = document.querySelector("[data-hero-phone]");
  if (!wrap) return;

  const catsEl = wrap.querySelector("[data-phone-cats]");
  const listEl = wrap.querySelector("[data-phone-list]");
  const heroImgLabel = wrap.querySelector("[data-phone-hero-label]");
  if (!catsEl || !listEl) return;

  const shortCats = CATEGORIES.slice(0, 6);
  catsEl.innerHTML = shortCats
    .map((c, i) => `<span class="${i === 0 ? "active" : ""}" data-phone-cat="${c.id}">${c.label}</span>`)
    .join("");

  function renderList(catId) {
    const items = PRODUCTS.filter((p) => p.category === catId).slice(0, 5);
    listEl.innerHTML = items
      .map(
        (p) => `
        <div class="phone-item">
          <div class="phone-item-thumb" style="background-image:url('${p.images[0]}')"></div>
          <div class="phone-item-info">
            <strong>${p.name}</strong>
            <small>${p.desc}</small>
          </div>
          <div class="phone-item-price">${p.price}₺</div>
        </div>`
      )
      .join("");
    if (heroImgLabel) heroImgLabel.textContent = CATEGORIES.find((c) => c.id === catId)?.label ?? "";
  }

  renderList(shortCats[0].id);

  let activeIndex = 0;
  setInterval(() => {
    activeIndex = (activeIndex + 1) % shortCats.length;
    const cat = shortCats[activeIndex];
    catsEl.querySelectorAll("[data-phone-cat]").forEach((el) => {
      el.classList.toggle("active", el.dataset.phoneCat === cat.id);
    });
    renderList(cat.id);
  }, 3200);
}
