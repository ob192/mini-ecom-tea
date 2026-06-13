# TEA CHE — чайний маркетплейс (Next.js)

Mobile-first, SEO-оптимізований інтернет-магазин листового чаю. Без бази даних і без онлайн-оплати: замовлення надсилаються менеджеру в **Telegram**, оплата — при отриманні.

Побудовано на **Next.js (App Router) + TypeScript + Tailwind CSS**. Усі тексти інтерфейсу — українською.

---

## Можливості

- **Каталог** (`/`) — статична генерація, фільтр за категоріями, сітка 2 колонки на мобільному.
- **Сторінка товару** (`/product/[slug]`) — статична генерація для кожного товару (`generateStaticParams`).
- **Кошик** (`/cart`) — клієнтський стан на React Context, збереження в `localStorage`, лічильник у шапці.
- **Оформлення** (`/checkout`) — форма з клієнтською й серверною валідацією, honeypot проти спаму.
- **Підтвердження** (`/order/success`).
- **Замовлення → Telegram** через `/api/order` (Bot API). Токен ніколи не потрапляє в браузер.
- **SEO**: метадані на кожній сторінці, динамічні OG/Twitter, JSON-LD (Product, BreadcrumbList, Organization), `sitemap.xml`, `robots.txt`, `<html lang="uk">`.

---

## Швидкий старт

Потрібен **Node.js 18.18+** (рекомендовано 20+).

```bash
# 1. встановити залежності
npm install

# 2. налаштувати змінні середовища
cp .env.example .env.local
#    і вписати свої значення (див. нижче)

# 3. запустити дев-сервер
npm run dev
# → http://localhost:3000
```

Корисні команди:

```bash
npm run build      # продакшн-збірка
npm run start      # запуск продакшн-збірки
npm run typecheck  # перевірка типів
npm run lint       # ESLint
```

---

## Редагування товарів

Усі товари й категорії — в одному файлі: **`products.json`** в корені проєкту.

```jsonc
{
  "currency": "UAH",
  "unit": "г",
  "categories": [
    { "slug": "puer", "label": "Пуер" }
    // ...
  ],
  "products": [
    {
      "slug": "longjing-cha",            // унікальний; використовується в URL /product/<slug>
      "name": "Лунцзінча",               // назва
      "subtitle": "Чай «Криниця Дракона»",
      "description": "Класичний зелений чай…",
      "category": "green",               // має збігатися зі slug категорії
      "price": 240,                       // ціна в ₴ (число)
      "weight": 50,                       // вага в «г»
      "image": "",                        // URL зображення; "" → красивий плейсхолдер
      "inStock": true,                    // наявність
      "origin": "Чжецзян"                 // (необов'язково) походження
    }
  ]
}
```

Правила:

- **`slug`** має бути унікальним і без пробілів (латиниця/цифри/дефіс) — це адреса сторінки товару.
- **`category`** має дорівнювати одному зі `slug` у `categories`.
- **`image`**: лишіть `""`, щоб показувати фірмовий градієнтний плейсхолдер, або вкажіть повний `https://…` URL. Для зовнішніх доменів за потреби звузьте `images.remotePatterns` у `next.config.mjs`.
- Після зміни `products.json` перезапустіть `npm run dev` (або зробіть новий `build` для продакшну) — сторінки й `sitemap.xml` оновляться автоматично.

---

## Налаштування Telegram

Замовлення надходять у Telegram через Bot API. Потрібні дві змінні.

1. **Створіть бота**: напишіть [@BotFather](https://t.me/BotFather) → `/newbot` → отримаєте `TELEGRAM_BOT_TOKEN` (вигляд `123456789:AAA…`).
2. **Дізнайтеся chat id** (`TELEGRAM_CHAT_ID`):
   - для приватних повідомлень — напишіть боту будь-що, потім відкрийте
     `https://api.telegram.org/bot<TOKEN>/getUpdates` і знайдіть `chat.id`;
   - або скористайтеся ботом на кшталт [@userinfobot](https://t.me/userinfobot);
   - для **групи/каналу** — додайте свого бота туди й використайте id групи (зазвичай від'ємне число, напр. `-1001234567890`).

Впишіть значення у `.env.local`:

```env
TELEGRAM_BOT_TOKEN=123456789:AAA-ваш-токен
TELEGRAM_CHAT_ID=000000000
NEXT_PUBLIC_SITE_URL=https://teache.example.com
```

> `NEXT_PUBLIC_SITE_URL` (без слеша в кінці) використовується для canonical-URL, OpenGraph, `sitemap.xml` і `robots.txt`. Встановіть ваш реальний домен у продакшні.

**Безпека**: `TELEGRAM_BOT_TOKEN` і `TELEGRAM_CHAT_ID` читаються лише на сервері (в `/api/order`) і ніколи не передаються в браузер. `.env.local` додано в `.gitignore`.

Базовий захист `/api/order`:
- серверна валідація всіх полів і українського формату телефону;
- honeypot-поле проти ботів;
- rate limiting (5 запитів за хвилину з однієї IP — за потреби змініть у `lib/rate-limit.ts`);
- ціни й суми **перераховуються на сервері** з `products.json`, дані з клієнта не довіряються.

---

## Деплой на Vercel

1. Залийте репозиторій на GitHub/GitLab.
2. У [Vercel](https://vercel.com) → **Add New → Project** → імпортуйте репозиторій (фреймворк визначиться як Next.js автоматично).
3. У **Settings → Environment Variables** додайте:
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`
   - `NEXT_PUBLIC_SITE_URL` (ваш продакшн-домен, напр. `https://teache.com`)
4. **Deploy**. Після деплою перевірте `/`, `/sitemap.xml`, `/robots.txt` і зробіть тестове замовлення.

> Примітка щодо rate limiting: реалізація тримає стан у пам'яті процесу. На serverless цього достатньо для базового захисту, але для суворих гарантій між інстансами під'єднайте спільне сховище (наприклад, Upstash Redis) у `lib/rate-limit.ts`.

---

## Структура проєкту

```
.
├── products.json              # ← єдине джерело даних про товари
├── app/
│   ├── layout.tsx             # шрифти, метадані, CartProvider, Organization JSON-LD
│   ├── page.tsx               # каталог (статичний)
│   ├── product/[slug]/page.tsx# сторінка товару (статична + JSON-LD)
│   ├── cart/page.tsx
│   ├── checkout/page.tsx
│   ├── order/success/page.tsx
│   ├── api/order/route.ts     # надсилання в Telegram
│   ├── sitemap.ts  robots.ts
│   ├── loading.tsx  error.tsx  not-found.tsx
│   └── globals.css
├── components/                # Header, Footer, ProductCard, CatalogGrid, форми, іконки…
├── context/CartContext.tsx    # кошик + localStorage
├── lib/                       # types, products (доступ до даних), format, rate-limit
├── tailwind.config.ts         # дизайн-токени TEA CHE
└── next.config.mjs
```

---

## Дизайн-система

Кольори, типографіка й радіуси винесені в `tailwind.config.ts` та CSS-змінні в `app/globals.css` (тепла кремова палітра, глибокий чайно-зелений, бурштиновий акцент; шрифти Oswald + PT Sans з кириличними підмножинами). Layout — мобільний, відцентрований у колонці `max-width: 480px`.
