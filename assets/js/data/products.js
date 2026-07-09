/**
 * products.js
 * Generates the demo product catalogue. In production this data lives in
 * Firestore (see /firebase). Here it is composed from category "recipe"
 * templates so the catalogue reads like a real, curated menu rather than
 * "Ürün 1 / Ürün 2" placeholders, while staying easy to maintain.
 *
 * Each category exports 11-14 named dishes with description, price and a
 * photo seed. A tiny seeded PRNG assigns tags (chef pick / best seller) and
 * discounts deterministically, so the demo looks the same on every visit
 * until the data is swapped for live Firestore documents.
 */

// ---- Seeded PRNG (mulberry32) so tag/discount assignment is stable ----
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(1998);

const CATEGORY_DEFS = [
  {
    id: "burger",
    label: "Burger",
    photo: "burger",
    items: [
      ["Noir Smash Burger", "Iki kat smash köfte, cheddar, karamelize soğan, özel sos", 245],
      ["Truffle Steakhouse Burger", "Trüf mayonez, közlenmiş mantar, gruyère peyniri", 315],
      ["Klasik Angus Burger", "180g dana angus köfte, marul, domates, turşu", 225],
      ["BBQ Bacon Burger", "Çıtır bacon, cheddar, ev yapımı barbekü sos", 265],
      ["Spicy Jalapeño Burger", "Acı jalapeño, pul biber mayonez, çift peynir", 255],
      ["Double Cheddar Burger", "İki kat köfte, üç kat cheddar, karamelize soğan", 285],
      ["Blue Cheese Burger", "Rokfor peyniri, ceviz, karamelize armut", 295],
      ["Double Smoked Burger", "Çift füme köfte, kızarmış pastırma, füme sos", 305],
    ],
  },
  {
    id: "durum",
    label: "Dürüm",
    photo: "wrap",
    items: [
      ["Tavuk Şiş Dürüm", "Marine tavuk şiş, közlenmiş sebze, sarımsak sos", 165],
      ["Adana Dürüm", "El yapımı Adana kebap, lavaş, közlenmiş biber", 195],
      ["Etli Kaşarlı Dürüm", "Dana kuşbaşı, eritilmiş kaşar, közlenmiş domates", 215],
      ["Tavuk Cheddarlı Dürüm", "Tavuk şiş, cheddar peyniri, közlenmiş biber", 185],
      ["Falafel Dürüm", "Ev yapımı falafel, humus, taze yeşillik", 155],
      ["Urfa Dürüm", "Acılı Urfa kebap, sumaklı soğan, lavaş", 205],
      ["Bonfile Dürüm", "Dana bonfile, mantar sote, özel sos", 265,],
      ["Kağıt Kebap Dürüm", "İnce kıyma, biber, domates, tereyağı", 185],
      ["Tavuk Fajita Dürüm", "Meksika usulü tavuk, biber, tortilla", 175],
      ["Levrek Dürüm", "Izgara levrek, taze roka, limon sos", 235],
      ["Kuzu Pirzola Dürüm", "Marine kuzu, nane yoğurt sos, lavaş", 255],
    ],
  },
  {
    id: "pizza",
    label: "Pizza",
    photo: "pizza",
    items: [
      ["Margherita", "San marzano domates, taze mozzarella, fesleğen", 195],
      ["Tartufo Bianca", "Trüf yağı, mantar, mozzarella, roka", 285],
      ["Pepperoni Deluxe", "Bol pepperoni, mozzarella, domates sos", 225],
      ["Quattro Formaggi", "Dört peynir, bal şurubu ile servis", 255],
    ],
  },
  {
    id: "izgara",
    label: "Izgara",
    photo: "grill",
    items: [
      ["Dana Antrikot", "300g dana antrikot, közlenmiş sebze garnitür", 495],
      ["Kuzu Pirzola", "Marine kuzu pirzola, nane sos, patates", 465],
      ["Tavuk Şiş Tabağı", "Marine tavuk şiş, pilav, közlenmiş biber", 265],
      ["Adana Kebap Tabağı", "El yapımı Adana, lavaş, közlenmiş domates", 285],

    ],
  },
  {
    id: "salata",
    label: "Salata",
    photo: "salad",
    items: [
      ["Sezar Salata", "Izgara tavuk, parmesan, kruton, sezar sos", 175],
      ["Akdeniz Salatası", "Zeytin, feta peyniri, domates, salatalık", 155],
      ["Roka Parmesan Salata", "Taze roka, parmesan tıraşlama, balzamik", 165],
      ["Ton Balıklı Salata", "Ton balığı, haşlanmış yumurta, zeytin", 195,],
      ["Avokado Karides Salata", "Izgara karides, avokado, cherry domates", 245],
      ["Quinoa Salata", "Kinoa, nar, ceviz, nane, limon sos", 185],
      ["Kaz Ciğeri Salata", "Foie gras, karamelize armut, roka", 285],
      ["Yeşil Mevsim Salata", "Taze yeşillik, çeri domates, limon sos", 135],
      ["Halloumi Salata", "Izgara halloumi, roka, nar ekşisi", 195],
    ],
  },
  {
    id: "tatli",
    label: "Tatlı",
    photo: "dessert",
    items: [
      ["San Sebastian Cheesecake", "Karamelize yüzeyli, kremalı iç", 165],
      ["Çikolatalı Lav Kek", "Sıcak servis, vanilyalı dondurma ile", 175],
      ["Tiramisu", "Klasik İtalyan usulü, kakao tozu", 155],
      ["Fıstıklı Baklava", "Antep fıstığı, ev yapımı şerbet", 145],
      ["Kunefe", "Peynirli künefe, antep fıstığı, kaymak", 175],
    ],
  },
  {
    id: "kahve",
    label: "Kahve",
    photo: "coffee",
    items: [
      ["Flat White", "Çift shot espresso, ipeksi süt köpüğü", 95],
      ["V60 Filtre Kahve", "Tek menşei, elde demleme", 105],
      ["Karamel Machiato", "Espresso, karamel, sıcak süt", 115],
      ["Cold Brew", "18 saat soğuk demleme, buzlu servis", 110],
      ["Flat Espresso", "Yoğun kavrulmuş çekirdek, çift shot", 85],

    ],
  },
  {
    id: "soguk-icecek",
    label: "Soğuk İçecek",
    photo: "drink",
    items: [
      ["Ev Yapımı Limonata", "Taze sıkma limon, nane yaprakları", 85],
      ["Kola", "Soguk Kola, maden sodası", 95],
      ["Limonlu  Soda", "Soguk limonlu soda", 90],
      ["Şeftali Buzlu Çay", "Ev yapımı şeftalili buzlu çay", 80],
    ],
  },
];

function seededPick(arr, r) {
  return arr[Math.floor(r * arr.length)];
}

function buildProducts() {
  const products = [];
  let counter = 1;

  CATEGORY_DEFS.forEach((cat) => {
    cat.items.forEach(([name, desc, price], idx) => {
      const r1 = rand();
      const r2 = rand();
      const r3 = rand();

      const hasDiscount = r1 < 0.32;
      const oldPrice = hasDiscount ? Math.round((price * (1 + 0.12 + r2 * 0.15)) / 5) * 5 : null;

      let tag = null;
      if (r3 < 0.16) tag = "chef";
      else if (r3 < 0.32) tag = "bestseller";

      const kcal = 180 + Math.floor(rand() * 620);
      const seedBase = `${cat.photo}-${idx}`;

      products.push({
        id: `${cat.id}-${String(counter).padStart(3, "0")}`,
        category: cat.id,
        categoryLabel: cat.label,
        name,
        desc,
        price,
        oldPrice,
        kcal,
        tag,
        images: [
          `../assets/images/${cat.id}-${String(counter).padStart(3, "0")}-a.png`,
          `../assets/images/${cat.id}-${String(counter).padStart(3, "0")}-b.png`,
          `../assets/images/${cat.id}-${String(counter).padStart(3, "0")}-c.png`,
        ],
      });
      counter += 1;
    });
  });

  return products;
}

export const CATEGORIES = CATEGORY_DEFS.map((c) => ({ id: c.id, label: c.label }));
export const PRODUCTS = buildProducts();

export const OPTION_SETS = {
  sauce: { label: "Sos Seçimi", choices: ["Ketçap", "Mayonez", "Acı Sos", "Barbekü"] },
  drink: { label: "İçecek Seçimi", choices: ["Cola", "Fanta", "Sprite", "Soda"] },
  extra: { label: "Extra Malzeme", choices: ["Çift Kaşar", "Extra Et", "Turşu", "Karamelize Soğan"] },
};
