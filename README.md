# Kayseri QR Menü — Satış Sitesi

Kayseri'deki restoran/kafe işletmelerine QR menü sistemi satmak için hazırlanmış
vitrin sitesi. Framework yok: HTML5 + Modern CSS + Vanilla JS (ES modules),
Firebase Hosting/Firestore/Storage ile çalışacak şekilde yapılandırıldı.

## Klasör yapısı

```
/                  Ana satış sayfası (index.html)
/starter/          Başlangıç paket demosu — "Luna Cafe"
/standard/         Standart paket demosu — "Mare Bistro"
/premium/          Premium paket demosu — "Noir Steakhouse"
/assets/css/       tokens.css (tasarım sistemi) · base.css · components.css · home.css · menu.css
/assets/js/        theme.js · reveal.js · nav.js · hero-phone.js · menu-app.js
/assets/js/data/   products.js — ~100 ürünlük örnek katalog (Firestore'a taşınana kadar kaynak veri)
/firebase/         firebase-config.js (placeholder), firestore.rules
firebase.json      Firebase Hosting yapılandırması
robots.txt / sitemap.xml
```

## Yerelde önizleme

Herhangi bir statik sunucu yeterli, örnek:

```bash
npx serve .
# veya
python3 -m http.server 8080
```

`/starter`, `/standard`, `/premium` klasörlerindeki `index.html` dosyaları
doğrudan çalışır; ekstra derleme adımı yoktur.

## Görseller

Ürün ve arka plan görselleri şu an `picsum.photos` üzerinden gelen yer
tutuculardır (bkz. `assets/js/data/products.js` → `images`). Gerçek ürün
fotoğrafları hazır olduğunda:

1. Görselleri Firebase Storage'a veya `/assets/images/products/` altına yükleyin.
2. `products.js` içindeki `images` alanlarını yeni URL'lerle değiştirin
   (veya Firestore'a taşıyorsanız doğrudan doküman alanına yazın).

Kart, galeri ve modal bileşenleri herhangi bir görsel URL'i ile sorunsuz çalışır;
tasarımda boyut/oran sabittir (4:3 kart, 16:10 modal).

## Firebase'e bağlama

1. `firebase/firebase-config.js` içindeki `REPLACE_ME` alanlarını gerçek proje
   bilgileriyle doldurun ve dosyanın üstündeki yorum satırlarını aktif edin.
2. `assets/js/data/products.js` içindeki `PRODUCTS` dizisini, Firestore'un
   `products` koleksiyonundan gelen bir sorgu sonucu ile değiştirin — veri
   şekli birebir aynı olduğu için `menu-app.js` içinde değişiklik gerekmez.
3. `firebase deploy --only hosting,firestore:rules` ile yayınlayın.

## Paket farklılaştırması

Üç demo sayfası da aynı `menu-app.js` motorunu kullanır; farklılık yalnızca
`initMenuApp(config)` çağrısındaki bayraklardan gelir:

| Özellik              | Başlangıç | Standart | Premium |
|----------------------|:---------:|:--------:|:-------:|
| Dijital menü + QR    | ✓ | ✓ | ✓ |
| Fotoğraf galerisi     | – | ✓ | ✓ |
| Gerçek zamanlı arama  | – | ✓ | ✓ |
| Çoklu dil (TR/EN)    | – | – | ✓ |
| Sipariş seçenekleri   | – | – | ✓ |
| Garson çağırma / hesap | – | – | ✓ |

Bir müşteriyi Başlangıç'tan Premium'a yükseltmek kod yeniden yazımı değil,
config değişikliğidir.
