# Запросы и серверная часть

На сайте один запрос — заявка из формы. Образец: `features/signup/signup-form/`.

## Где что лежит

| Файл                                           | Что внутри                                                                 |
| ---------------------------------------------- | -------------------------------------------------------------------------- |
| `features/{domain}/{slice}/api/post-{name}.ts` | вызов из браузера: `fetch` к своему `/api/*`, таймаут, типизированная ошибка |
| `features/{domain}/{slice}/server.ts`          | обработчик запроса: разбор, проверки, отправка; первая строка `import "server-only"` |
| `features/{domain}/{slice}/utils.ts`           | zod-схемы и чистые функции, общие для формы и сервера                      |
| `app/api/{name}/route.ts`                      | тонкий маршрут: `export function POST(request) { return handle…(request) }` |
| `shared/utils/telegram.ts`                     | отправка в Telegram (`import "server-only"`)                               |

## Правила

- **Одна схема на обе стороны.** Форма валидирует ту же zod-схему, что и сервер; сервер проверяет её заново —
  в `/api/*` можно отправить что угодно напрямую.
- **Ошибка — с причиной.** `api/` бросает ошибку с `kind` (`rate-limit`, `timeout`, `network`, `server`),
  форма показывает текст под причину.
- **Ответы сервера — без PII.** В логах — только причина сбоя, не значения полей.
- **Имена с доменом:** `postSignupLead`, `handleSignupLeadRequest`, `getSignupFormSchema` — не `post`, `handler`.
- Клиент не импортирует `server.ts` и `shared/utils/telegram.ts`: `server-only` упадёт на сборке.
