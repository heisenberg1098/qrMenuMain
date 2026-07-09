/**
 * firebase-config.js
 * Placeholder Firebase configuration. Replace the values below with the
 * real project credentials from the Firebase console before deploying.
 * Nothing in the current build imports this file yet — the demo pages run
 * entirely on local sample data (see /assets/js/data/products.js) so the
 * site works today without a Firebase project connected. Wiring Firestore
 * in later only means: import these SDK pieces, fetch the "products"
 * collection, and pass the resulting array into initMenuApp() in place of
 * the local PRODUCTS import.
 */

// import { initializeApp } from "https://www.gstatic.com/firebasejs/10.x.x/firebase-app.js";
// import { getFirestore } from "https://www.gstatic.com/firebasejs/10.x.x/firebase-firestore.js";
// import { getStorage } from "https://www.gstatic.com/firebasejs/10.x.x/firebase-storage.js";

export const firebaseConfig = {
  apiKey: "REPLACE_ME",
  authDomain: "REPLACE_ME.firebaseapp.com",
  projectId: "REPLACE_ME",
  storageBucket: "REPLACE_ME.appspot.com",
  messagingSenderId: "REPLACE_ME",
  appId: "REPLACE_ME",
};

// export const app = initializeApp(firebaseConfig);
// export const db = getFirestore(app);
// export const storage = getStorage(app);

/**
 * Expected Firestore shape (collection: "products"), matching the local
 * sample data shape 1:1 so the render layer needs no changes:
 *
 * {
 *   category: "burger",
 *   categoryLabel: "Burger",
 *   name: "Noir Smash Burger",
 *   desc: "Iki kat smash köfte, cheddar, karamelize soğan, özel sos",
 *   price: 245,
 *   oldPrice: 285 | null,
 *   kcal: 540,
 *   tag: "chef" | "bestseller" | null,
 *   images: ["https://.../1.jpg", "https://.../2.jpg", "https://.../3.jpg"]
 * }
 */
