# Метаданные и JSON-LD

Сайт — локальный бизнес в Чернигове. Разметка и метаданные описывают **только офис в Чернигове**; филиалы
(Прилуки, Ичня, Бахмач) есть в контактах на странице, но в JSON-LD их нет.

## Источник правды — профиль в Google

Название, адрес с индексом, координаты, телефон и часы работы взяты из подтверждённого Google Business Profile
(Maps CID `1258648312328183933`) и лежат в `@/shared/constants/site` (`SITE_BUSINESS_NAME`, `SITE_POSTAL_ADDRESS`,
`SITE_GEO`, `SITE_PHONE`, `SITE_OPENING_HOURS`). Их читают **и тексты сайта, и разметка**: Google доверяет бизнесу,
у которого эти факты везде совпадают.

- Факт меняется сначала в профиле Google, потом в `site.ts`. Литералом в JSX или в разметке его не пишут.
- Число отзывов на сайте — «50+» (`SITE_GOOGLE_RATING.countLabel`), без точной цифры: решение владельца.
- Лицензия — `SITE_LICENCE`, со ссылкой на запись в ЄДЕБО. Слов «атестований» и «акредитований» нет: в реестре
  «Не атестовано».

## Метаданные (Next Metadata API)

| Где                               | Что                                                                          |
| --------------------------------- | ---------------------------------------------------------------------------- |
| `app/layout.tsx`                  | `metadataBase`, шаблон заголовка, описание и Open Graph по умолчанию, `robots` |
| `SEO_SHARE_IMAGE` (`@/shared/constants/seo`) | картинка превью ссылок 1200×630 (`public/rsc/imgs/og-home.jpg`) — в метаданных каждой страницы, не файлом `opengraph-image`: `openGraph` страницы выкинул бы файловую картинку layout |
| `@/shared/constants/seo`          | `SEO_PAGES`: путь, полный заголовок и описание каждой страницы               |
| `page.tsx`                        | `export const metadata = buildSeoPageMetadata(SEO_PAGES.<страница>)`         |
| `app/sitemap.ts`, `app/robots.ts` | генерируются; статических файлов в `public/` нет                             |

- Заголовок — до ~60 символов, описание — до ~160. Заголовок пишется целиком и идёт как `title.absolute`.
- Next сливает метаданные **поверхностно**: `openGraph` страницы заменяет весь объект layout, поэтому
  `buildSeoPageMetadata` повторяет `type`, `locale`, `siteName`.
- Новая индексируемая страница — запись в `SEO_PAGES`, `metadata` в `page.tsx` и строка в `app/sitemap.ts`.
- Служебная страница (`/playground`) — `robots: {index: false, follow: false}`.

## JSON-LD

- Выводит `<JsonLd data={…} />` из `@/shared/components/json-ld` прямо в `page.tsx` (рекомендация Next); `<`
  экранируется.
- Узлы собирают `build…` из `@/shared/utils/json-ld`, один `@graph` на страницу. Постоянные `@id` — `JSON_LD_ID`:
  `#business` и `#website` одни на весь сайт, страница — `{url}#webpage`.
- Бизнес — `["LocalBusiness", "EducationalOrganization"]`. Типа `DrivingSchool` в schema.org **нет**.
- Главная: `WebSite` + бизнес + `WebPage` + `FAQPage`. Остальные страницы: `WebSite` + бизнес + своя `WebPage`, чтобы
  каждый `@id`, на который ссылается страница, был в её же графе.
- Данные для разметки — из тех же констант, что рисуют секции: цены — `getHomePricesJsonLdOffers()`, FAQ —
  `getHomeFaqJsonLdEntries()`. Разметка не может разойтись со страницей.
- **Нельзя:** `aggregateRating` и `review` (Google не показывает звёзды за отзывы о себе на своём сайте, а отзывы
  из Google не наши), филиалы, факты, которых нет на странице.

## Проверка

После правки разметки или метаданных: `pnpm build`, затем на запущенной странице снять `<head>` и JSON-LD; типы и
свойства сверить со словарём schema.org; Rich Results Test (`search.google.com/test/rich-results`) и Schema Markup
Validator (`validator.schema.org`). После деплоя — URL Inspection в Search Console.
