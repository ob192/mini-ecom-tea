/**
 * Журнал — the editorial content behind `/journal` and the home page's
 * `Journal` section in jintea.pen.
 *
 * There is no CMS and no database here, exactly as with the catalogue: the
 * articles are authored in this file and rendered statically. Adding one means
 * appending an entry below; `generateStaticParams` and the sitemap pick it up
 * with no further wiring.
 *
 * `body` follows the same convention as a product's `description` in
 * public/products.json — one line per paragraph, bullets prefixed with "• " —
 * so `descriptionParagraphs()` from lib/format.ts renders both.
 *
 * COVER IMAGES are catalogue photographs. The mockup uses stock imagery we do
 * not own; rather than ship placeholders, each article points at a product
 * photo that actually depicts its subject. Swap `cover` when purpose-shot
 * photography exists.
 *
 * THE COPY IS A FIRST DRAFT. The three titles come from the design file, and
 * the text is written from general tea knowledge — it is accurate, but it has
 * not been reviewed by anyone at Jintea and makes no claims about specific
 * lots, suppliers or harvests. Read it before publishing.
 */

export interface Article {
  /** URL segment: /journal/<slug>. */
  slug: string;
  title: string;
  /** Uppercase kicker above the title, e.g. "ГІД". */
  category: string;
  /** One sentence; used for the card, the meta description and OG. */
  excerpt: string;
  /** Public path to the cover photograph. */
  cover: string;
  /** ISO date, for <time> and the sitemap. */
  published: string;
  /** Newline-separated paragraphs; bullets start with "• ". */
  body: string;
}

export const articles: Article[] = [
  {
    slug: 'shu-chy-shen',
    title: 'Шу чи шен: у чому різниця між видами пуеру',
    category: 'Гід',
    excerpt:
      'Два різні чаї з одного листа: один дозріває десятиліттями, інший — за кілька місяців у цеху.',
    cover: '/puer/gongting-gongbing-shu/1.jpg',
    published: '2026-08-14',
    body: [
      'Пуер роблять з листя чайного дерева різновиду Camellia sinensis var. assamica, що росте у провінції Юньнань. Із того самого листа виходять два зовсім різні чаї — шен і шу. Різницю створює не сировина, а спосіб ферментації.',
      'Шен (сирий) пуер проходить класичну обробку: зав’ялювання, скручування, сушіння на сонці, після чого чай пресують. Далі він ферментується повільно, роками, у сховищі. Молодий шен світлий і різкий, з помітною гіркуватістю та квітково-фруктовим ароматом. З витримкою він темнішає, гіркота йде, з’являються ноти сухофруктів і деревини.',
      'Шу (зрілий) пуер — винахід 1970-х. Щоб не чекати десятиліттями, листя складають у купи, зволожують і залишають дозрівати під контролем — так зване «во дуй», вологе скирдування. Процес триває близько 45–70 днів і дає чай, що одразу нагадує витриманий шен: темний настій, м’який смак, ноти чорносливу, темного шоколаду й вологої деревини.',
      'Що обрати:',
      '• Шу — якщо ви шукаєте м’який, землистий, зігрівальний чай без гіркоти. Він прощає помилки у заварюванні.',
      '• Шен — якщо цікавить жвавість, кислинка та еволюція смаку з роками зберігання.',
      'Обидва добре витримують багато проливів. Різниця в тому, що шу розкривається одразу, а шен потребує уваги до температури й часу.',
    ].join('\n'),
  },
  {
    slug: 'gory-yunnani',
    title: 'Гори Юньнані: звідки походить справжній пуер',
    category: 'Культура',
    excerpt:
      'Висота, вік дерева й конкретна гора впливають на смак пуеру не менше, ніж спосіб обробки.',
    cover: '/puer/naka-gushu-shengcha/1.jpg',
    published: '2026-08-02',
    body: [
      'Юньнань — південно-західна провінція Китаю на кордоні з М’янмою, Лаосом і В’єтнамом. Саме тут ростуть чайні дерева, з листя яких роблять пуер, і саме тут чай культивують найдовше в світі.',
      'Значна частина плантацій лежить на висоті 1200–2000 метрів. Прохолодні ночі, тумани й різкий перепад температур уповільнюють ріст листа — воно накопичує більше ароматичних речовин. Це та сама логіка, що й у високогірного улуну.',
      'Окремо стоять гушу (古树) — старі дерева, часто віком понад сто років. На відміну від низьких кущів плантацій, у них глибока коренева система, що дістає до мінералів у глибших шарах ґрунту. Настій з такого листа зазвичай густіший, з довгим післясмаком і меншою різкістю.',
      'Назви гір на упаковці — не маркетинг, а вказівка на смаковий профіль:',
      '• Нака — щільний, мінеральний, з вираженою солодкістю у післясмаку.',
      '• Їу — м’якший і квітковий, з делікатнішою структурою.',
      '• Буланшань — насичений і гіркуватий у молодості, добре розкривається з витримкою.',
      '• Цзінмай — збалансований, з медовими та квітковими нотами.',
      'Тому два шени одного року й однакової обробки можуть смакувати абсолютно по-різному — усе вирішує, з якого схилу зібрано лист.',
    ].join('\n'),
  },
  {
    slug: 'gunfu-cha-vdoma',
    title: 'Гунфу ча вдома: посуд і перші кроки',
    category: 'Практика',
    excerpt:
      'Мінімальний набір і кілька правил, щоб заварювати короткими проливами без спеціального столу.',
    cover: '/gaiwan/jingdezhen-200ml/1.jpg',
    published: '2026-07-19',
    body: [
      'Гунфу ча — спосіб заварювання короткими проливами у малому об’ємі. Замість одного довгого настою ви отримуєте 8–12 порцій, кожна з іншим відтінком смаку. Для початку не потрібен ані чайний стіл, ані дорогий посуд.',
      'Мінімальний набір:',
      '• Гайвань 100–150 мл. Універсальніша за чайник: не вбирає аромат, легко митися, підходить будь-якому чаю.',
      '• Чахай (глек) — щоб злити настій одразу й повністю, інакше чай перезаварюється.',
      '• Ситечко та дві-три піали по 30–50 мл.',
      '• Ваги з точністю 0,1 г. Це єдине, на чому не варто економити: пропорція вирішує все.',
      'Базові пропорції — 5–6 г листа на 100 мл води. Для пуеру температура 95–100 °C, для зеленого чаю 80–85 °C, для улуну 90–95 °C.',
      'Перший пролив пуеру — промивання: залийте окропом і злийте через 5–10 секунд. Він не для пиття, а щоб розкрити пресований лист і змити чайний пил.',
      'Далі заварюйте по 5–15 секунд, додаючи кілька секунд до кожного наступного проливу. Головне правило одне: зливайте настій повністю, не залишаючи води в гайвані. Саме це, а не сорт чи ціна чаю, найчастіше псує смак у початківців.',
    ].join('\n'),
  },
];

export function getArticle(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

/** Newest first — the order the home page and /journal render. */
export function articlesByDate(): Article[] {
  return [...articles].sort((a, b) => b.published.localeCompare(a.published));
}
