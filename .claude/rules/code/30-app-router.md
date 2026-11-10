---
paths:
  - "src/app/**"
---

# App Router (`src/app`)

## `layout.tsx` — технический файл, а не вёрстка

Корневой `app/layout.tsx` обязан рендерить `<html>` и `<body>`, поэтому держит то, что нужно всему сайту:
`lang="uk"`, шрифты (`next/font`), `globals.css`, GTM и Consent Mode (`next/script`), `AppProvider`.
Шапку, футер и любые классы вёрстки он **не** рендерит.

Вложенный `layout.tsx` создаётся только ради того, что умеет один сервер (метаданные, гварды) — и возвращает
`children` как есть.

## Chrome страницы — в `page.tsx`

`LayoutSkipLink`, `LayoutHeader`, `LayoutFooter`, `LayoutMobileBar` подключает **каждая страница сама**:

```tsx
export default function HomePage() {
	return (
		<>
			<LayoutSkipLink />
			<LayoutHeader />
			<main id={NAVIGATION_SECTION_ID.main}>
				<HomeHero />
				...
			</main>
			<LayoutFooter />
			<LayoutMobileBar />
		</>
	)
}
```

Дублирование между `/` и `/privacy` — осознанное: у страниц разный первый экран, и шапка лежит поверх него.

## Server или client

- `page.tsx` — Server Component без директивы: он только собирает виджеты. Клиентские виджеты объявляют
  `"use client"` сами.
- Страница, которой нельзя в production (`/playground`), зовёт `notFound()` из `next/navigation`.

## Метаданные

Заголовки, описания, Open Graph, `sitemap.ts`, `robots.ts` и JSON-LD — по **`50-seo.md`**. Иконки — файловые соглашения
Next рядом с корневым layout: `favicon.ico` (16/32/48), `icon.svg`, `apple-icon.png` (180), `manifest.ts` (иконки
192/512 и maskable 512 в `public/icons/`). Все — знак на непрозрачном белом квадрате, вписанный в круг: Google
показывает favicon в круге.

## API

`app/api/{name}/route.ts` — тонкий: `export function POST(request: Request)` и вызов обработчика из `server.ts`
слайса (`23-api.md`). Бизнес-логику в `src/app/` не класть.
