/**
 * menu-app.js
 * Drives the demo restaurant menu (starter / standard / premium). A single
 * engine renders the catalogue; feature availability is controlled by the
 * `config` object each page passes in, so upgrading a real client from
 * Starter to Premium is a config change, not a rewrite.
 *
 * Data currently comes from /assets/js/data/products.js. Swapping to
 * Firestore later only means replacing PRODUCTS with a query result of the
 * same shape — the render layer does not need to change.
 */

import { PRODUCTS, CATEGORIES, OPTION_SETS } from "./data/products.js";
import { initReveal } from "./reveal.js";

const STRINGS = {
  tr: {
    all: "Tümü",
    searchPlaceholder: "Menüde ara...",
    empty: "Aradığınız ürün bulunamadı.",
    waiter: "Garson Çağır",
    bill: "Hesap İste",
    waiterToast: "Garson çağrıldı, hemen geliyor.",
    billToast: "Hesabınız hazırlanıyor.",
    kcal: "kcal",
  },
  en: {
    all: "All",
    searchPlaceholder: "Search menu...",
    empty: "No matching items found.",
    waiter: "Call Waiter",
    bill: "Request Bill",
    waiterToast: "Waiter has been notified.",
    billToast: "Your bill is being prepared.",
    kcal: "kcal",
  },
};

export function initMenuApp(config) {
  const root = document.querySelector("[data-menu-root]");
  if (!root) return;

  const state = {
    lang: "tr",
    activeCategory: "all",
    query: "",
  };

  const els = {
    categoryRail: root.querySelector("[data-category-rail]"),
    grid: root.querySelector("[data-menu-grid]"),
    searchInput: root.querySelector("[data-search-input]"),
    langButtons: root.querySelectorAll("[data-lang]"),
    toast: document.querySelector("[data-toast]"),
  };

  renderCategoryRail();
  renderGrid();
  bindSearch();
  bindLang();
  bindFloatActions();

  // ---- Category rail ----
  function renderCategoryRail() {
    if (!els.categoryRail) return;
    const counts = countsByCategory();
    const t = STRINGS[state.lang];

    const pills = [{ id: "all", label: t.all }, ...CATEGORIES].map((c) => {
      const count = c.id === "all" ? PRODUCTS.length : counts[c.id] || 0;
      const active = state.activeCategory === c.id ? "active" : "";
      return `<button class="category-pill ${active}" data-cat="${c.id}">${c.label} <span class="count">${count}</span></button>`;
    });

    els.categoryRail.innerHTML = pills.join("");
    els.categoryRail.querySelectorAll("[data-cat]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.activeCategory = btn.dataset.cat;
        renderCategoryRail();
        renderGrid();
        const section = document.querySelector(`[data-cat-section="${btn.dataset.cat}"]`);
        if (section && btn.dataset.cat !== "all") {
          section.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          els.grid.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  }

  function countsByCategory() {
    return PRODUCTS.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {});
  }

  // ---- Grid ----
  function filteredProducts() {
    const q = state.query.trim().toLowerCase();
    return PRODUCTS.filter((p) => {
      const matchesCat = state.activeCategory === "all" || p.category === state.activeCategory;
      const matchesQuery = !q || p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }

  function renderGrid() {
    const t = STRINGS[state.lang];
    const items = filteredProducts();

    if (items.length === 0) {
      els.grid.innerHTML = `
        <div class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="7"/><path d="m21 21-3.5-3.5" stroke-linecap="round"/></svg>
          <p>${t.empty}</p>
        </div>`;
      return;
    }

    // Group by category to render section titles when browsing "all"
    const groups = groupByCategory(items);
    els.grid.innerHTML = groups
      .map(
        (g) => `
        <section data-cat-section="${g.id}">
          <h2 class="menu-section-title">${g.label}</h2>
          <div class="product-grid" data-reveal-group>
            ${g.items.map((p) => productCard(p)).join("")}
          </div>
        </section>`
      )
      .join("");

    bindCardInteractions();
    initReveal();
  }

  function groupByCategory(items) {
    const order = CATEGORIES.map((c) => c.id);
    const map = new Map();
    items.forEach((p) => {
      if (!map.has(p.category)) map.set(p.category, []);
      map.get(p.category).push(p);
    });
    return order
      .filter((id) => map.has(id))
      .map((id) => ({ id, label: CATEGORIES.find((c) => c.id === id).label, items: map.get(id) }));
  }

  function badgeHtml(p) {
    if (p.tag === "chef") return `<span class="badge badge-chef">Şefin Tavsiyesi</span>`;
    if (p.tag === "bestseller") return `<span class="badge badge-bestseller">Çok Satan</span>`;
    return "";
  }

  function productCard(p) {
    const t = STRINGS[state.lang];
    const discountPct = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : null;
    const showGallery = config.gallery !== false;
    const images = showGallery ? p.images : [p.images[0]];

    return `
      <article class="product-card" data-reveal data-product-id="${p.id}">
        <div class="product-gallery" data-gallery>
          <div class="product-badges">${badgeHtml(p)}</div>
          ${discountPct ? `<span class="product-discount">-%${discountPct}</span>` : ""}
          <div class="product-gallery-track" data-track style="transform: translateX(0)">
            ${images.map((src) => `<img src="${src}" alt="${p.name}" loading="lazy" width="640" height="480">`).join("")}
          </div>
          ${
            images.length > 1
              ? `<div class="product-gallery-nav">
                  <button aria-label="Önceki fotoğraf" data-nav="prev"></button>
                  <button aria-label="Sonraki fotoğraf" data-nav="next"></button>
                </div>
                <div class="product-gallery-dots" data-dots>
                  ${images.map((_, i) => `<span class="${i === 0 ? "active" : ""}"></span>`).join("")}
                </div>`
              : ""
          }
        </div>
        <div class="product-info">
          <div class="product-info-top">
            <div>
              <h3>${p.name}</h3>
              <p>${p.desc}</p>
            </div>
            <div class="product-price">
              ${p.oldPrice ? `<span class="old">${p.oldPrice}₺</span>` : ""}
              <span class="now">${p.price}₺</span>
            </div>
          </div>
          <div class="product-meta">
            <span class="kcal">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2c-1 3-4 4-4 8a4 4 0 0 0 8 0c0-1.5-.5-2-1-3 1 0 2 1 2 3a5 5 0 0 1-10 0c0-4 3-5 4-8"/></svg>
              ${p.kcal} ${t.kcal}
            </span>
          </div>
        </div>
      </article>`;
  }

  function bindCardInteractions() {
    els.grid.querySelectorAll("[data-gallery]").forEach((galleryEl) => {
      const track = galleryEl.querySelector("[data-track]");
      const dots = galleryEl.querySelectorAll("[data-dots] span");
      let index = 0;

      const go = (i) => {
        index = Math.max(0, Math.min(i, dots.length - 1));
        track.style.transform = `translateX(-${index * 100}%)`;
        dots.forEach((d, di) => d.classList.toggle("active", di === index));
      };

      const prev = galleryEl.querySelector('[data-nav="prev"]');
      const next = galleryEl.querySelector('[data-nav="next"]');
      if (prev) prev.addEventListener("click", (e) => { e.stopPropagation(); go(index - 1 < 0 ? dots.length - 1 : index - 1); });
      if (next) next.addEventListener("click", (e) => { e.stopPropagation(); go(index + 1 >= dots.length ? 0 : index + 1); });

      // Touch swipe
      let startX = 0;
      galleryEl.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; }, { passive: true });
      galleryEl.addEventListener("touchend", (e) => {
        const diff = e.changedTouches[0].clientX - startX;
        if (Math.abs(diff) > 40) go(diff > 0 ? index - 1 : index + 1);
      }, { passive: true });
    });

    els.grid.querySelectorAll("[data-product-id]").forEach((card) => {
      card.addEventListener("click", (e) => {
        if (e.target.closest("[data-nav]")) return;
        const product = PRODUCTS.find((p) => p.id === card.dataset.productId);
        openModal(product);
      });
    });
  }

  // ---- Search ----
  function bindSearch() {
    if (!els.searchInput) return;
    let debounce;
    els.searchInput.addEventListener("input", (e) => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        state.query = e.target.value;
        renderGrid();
      }, 140);
    });
  }

  // ---- Language ----
  function bindLang() {
    if (!config.languages) return;
    els.langButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        state.lang = btn.dataset.lang;
        els.langButtons.forEach((b) => b.classList.toggle("active", b === btn));
        if (els.searchInput) els.searchInput.placeholder = STRINGS[state.lang].searchPlaceholder;
        renderCategoryRail();
        renderGrid();
      });
    });
  }

  // ---- Floating actions (premium) ----
  function bindFloatActions() {
    const waiterBtn = document.querySelector("[data-action='waiter']");
    const billBtn = document.querySelector("[data-action='bill']");
    if (waiterBtn) waiterBtn.addEventListener("click", () => showToast(STRINGS[state.lang].waiterToast));
    if (billBtn) billBtn.addEventListener("click", () => showToast(STRINGS[state.lang].billToast));
  }

  function showToast(message) {
    if (!els.toast) return;
    els.toast.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>${message}`;
    els.toast.classList.add("is-visible");
    clearTimeout(els.toast._t);
    els.toast._t = setTimeout(() => els.toast.classList.remove("is-visible"), 2600);
  }

  // ---- Modal ----
  const modal = document.querySelector("[data-modal]");

  function openModal(p) {
    if (!modal || !p) return;
    const t = STRINGS[state.lang];

    modal.querySelector("[data-modal-img]").src = p.images[0];
    modal.querySelector("[data-modal-img]").alt = p.name;
    modal.querySelector("[data-modal-badges]").innerHTML = badgeHtml(p);
    modal.querySelector("[data-modal-title]").textContent = p.name;
    modal.querySelector("[data-modal-desc]").textContent = p.desc;
    modal.querySelector("[data-modal-old]").textContent = p.oldPrice ? `${p.oldPrice}₺` : "";
    modal.querySelector("[data-modal-now]").textContent = `${p.price}₺`;
    modal.querySelector("[data-modal-kcal]").textContent = p.kcal;

    const optionsWrap = modal.querySelector("[data-modal-options]");
    if (config.options && ["burger", "durum", "izgara"].includes(p.category)) {
      optionsWrap.innerHTML = Object.entries(OPTION_SETS)
        .map(
          ([key, set]) => `
          <div class="option-group">
            <h4>${set.label} <span class="hint">isteğe bağlı</span></h4>
            <div class="option-chips">
              ${set.choices.map((c) => `<button class="option-chip" data-option="${key}">${c}</button>`).join("")}
            </div>
          </div>`
        )
        .join("");
      optionsWrap.querySelectorAll(".option-chip").forEach((chip) => {
        chip.addEventListener("click", () => chip.classList.toggle("selected"));
      });
      optionsWrap.style.display = "";
    } else {
      optionsWrap.innerHTML = "";
      optionsWrap.style.display = "none";
    }

    modal.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
    modal.querySelectorAll("[data-modal-close]").forEach((btn) => btn.addEventListener("click", closeModal));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });
  }

  if (els.searchInput) els.searchInput.placeholder = STRINGS[state.lang].searchPlaceholder;
}
