import Link from 'next/link';
import { Check, Leaf, Phone, ShoppingBag, Truck } from 'lucide-react';

import { Accordion } from '@/components/ui/accordion';
import { Alert } from '@/components/ui/alert';
import { BackLink } from '@/components/ui/back-link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eyebrow } from '@/components/ui/eyebrow';
import { InfoRow, InfoRows } from '@/components/ui/info-row';
import { SectionHeading } from '@/components/ui/section-heading';
import { Skeleton } from '@/components/ui/skeleton';
import { TextLink } from '@/components/ui/text-link';
import { ColorPair, NonTextSwatch, TypeRow } from '@/components/playground/LiveValues';
import { PgBlock, PgCode, PgSection } from '@/components/playground/Shell';
import { FieldSpecimens } from '@/components/playground/Fields';
import { PlaygroundInteractive } from '@/components/playground/Interactive';
import { devOnly } from '@/components/playground/guard';

/*
  The design-system reference. Everything here renders from the real tokens and
  the real primitives — a swatch is `bg-card`, a button is `<Button>` — so the
  page breaks when the system does, and every number on it is read out of the
  browser rather than retyped beside a class.

  Dev only: the guard is in app/playground/layout.tsx.
*/

const SECTIONS = [
  ['colour', 'Колір'],
  ['type', 'Типографіка'],
  ['radius', 'Радіуси'],
  ['depth', 'Глибина'],
  ['icons', 'Іконки'],
  ['actions', 'Дії'],
  ['inputs', 'Поля'],
  ['feedback', 'Повідомлення'],
  ['shop', 'Магазинні контроли'],
  ['dos', 'Можна і не можна'],
  ['composition', 'Композиція'],
] as const;

const BUTTON_VARIANTS = ['primary', 'secondary', 'outline', 'ghost', 'destructive', 'link'] as const;
const BUTTON_SIZES = ['xs', 'sm', 'default', 'lg'] as const;

export default function PlaygroundReference() {
  devOnly();

  return (
    <>
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <Eyebrow className="text-muted-foreground">Jintea</Eyebrow>
        <h1 className="mt-2 text-3xl font-semibold">Дизайн-система</h1>
        <p className="mt-3 max-w-prose text-base text-muted-foreground text-pretty">
          Значення живуть у <PgCode>app/globals.css</PgCode>, рішення — у{' '}
          <PgCode>DESIGN.md</PgCode>, примітиви — у <PgCode>components/ui</PgCode>. Контраст на цій
          сторінці рахується з розвʼязаних кольорів у браузері, а не переписаний руками.
        </p>
        <nav aria-label="Розділи" className="mt-6 flex flex-wrap gap-2">
          {SECTIONS.map(([id, label]) => (
            <Link
              key={id}
              href={`#${id}`}
              className="inline-flex min-h-11 items-center rounded-full border border-border px-3.5 text-sm text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
            >
              {label}
            </Link>
          ))}
        </nav>
        <Alert variant="warning" className="mt-8" title="Напрям бренду ще не обрано">
          <p>
            <PgCode>--primary</PgCode> тимчасово тримає нинішній зелений магазину. Три варіанти —{' '}
            <Link href="/playground/brand" className="underline underline-offset-4">
              на сторінці «Напрям бренду»
            </Link>
            .
          </p>
        </Alert>
      </div>

      {/* ── 2. Colour ─────────────────────────────────────────────────────── */}
      <PgSection
        id="colour"
        title="Колір"
        lead="Ролі, а не відтінки. Кожна поверхня — у парі зі своїм текстом і виміряним контрастом."
        className="flex flex-col gap-10"
      >
        <PgBlock title="Поверхні" className="items-stretch">
          <ColorPair surface="bg-background" foreground="text-foreground" label="background / foreground" />
          <ColorPair surface="bg-subtle" foreground="text-subtle-foreground" label="subtle" />
          <ColorPair surface="bg-card" foreground="text-card-foreground" label="card" />
          <ColorPair surface="bg-popover" foreground="text-popover-foreground" label="popover" />
        </PgBlock>

        <PgBlock
          title="Другорядний текст"
          note={
            <>
              <PgCode>muted-foreground</PgCode> перевіряється на кожній поверхні, на якій стоїть —
              на картці він темніший за фон менше, ніж на сторінці.
            </>
          }
          className="items-stretch"
        >
          <ColorPair
            surface="bg-background"
            foreground="text-muted-foreground"
            label="muted-foreground / background"
          />
          <ColorPair
            surface="bg-card"
            foreground="text-muted-foreground"
            label="muted-foreground / card"
          />
          <ColorPair
            surface="bg-subtle"
            foreground="text-muted-foreground"
            label="muted-foreground / subtle"
          />
        </PgBlock>

        <PgBlock title="Бренд" className="items-stretch">
          <ColorPair surface="bg-primary" foreground="text-primary-foreground" label="primary" />
          <ColorPair
            surface="bg-primary-strong"
            foreground="text-primary-foreground"
            label="primary-strong (hover)"
          />
          <ColorPair
            surface="bg-primary-subtle"
            foreground="text-primary-subtle-foreground"
            label="primary-subtle"
          />
          <ColorPair
            surface="bg-secondary"
            foreground="text-secondary-foreground"
            label="secondary"
          />
        </PgBlock>

        <PgBlock title="Статуси" className="items-stretch">
          <ColorPair surface="bg-error" foreground="text-error-foreground" label="error" />
          <ColorPair surface="bg-success" foreground="text-success-foreground" label="success" />
          <ColorPair surface="bg-warning" foreground="text-warning-foreground" label="warning" />
          <ColorPair surface="bg-info" foreground="text-info-foreground" label="info" />
          <ColorPair
            surface="bg-error-subtle"
            foreground="text-error-subtle-foreground"
            label="error-subtle"
          />
          <ColorPair
            surface="bg-success-subtle"
            foreground="text-success-subtle-foreground"
            label="success-subtle"
          />
          <ColorPair
            surface="bg-warning-subtle"
            foreground="text-warning-subtle-foreground"
            label="warning-subtle"
          />
          <ColorPair
            surface="bg-info-subtle"
            foreground="text-info-subtle-foreground"
            label="info-subtle"
          />
        </PgBlock>

        <PgBlock
          title="Лінії та фокус (не текст — поріг 3:1)"
          note={
            <>
              <PgCode>border</PgCode> декоративний і навмисно нижчий за 3:1; межа поля{' '}
              <PgCode>input</PgCode> і кільце фокуса <PgCode>ring</PgCode> — ні, їх має бути видно
              (WCAG 1.4.11).
            </>
          }
          className="items-stretch"
        >
          <NonTextSwatch token="bg-border" label="border (декор)" />
          <NonTextSwatch token="bg-border-strong" label="border-strong" />
          <NonTextSwatch token="bg-input" label="input / background" />
          <NonTextSwatch token="bg-input" label="input / card" surface="bg-card" />
          <NonTextSwatch token="bg-ring" label="ring" />
          <NonTextSwatch token="bg-primary" label="primary / background" />
        </PgBlock>

        <PgBlock
          title="Темний блок"
          note={
            <>
              <PgCode>class=&quot;dark&quot;</PgCode> на секції перемикає ті самі токени. Жодного{' '}
              <PgCode>dark:</PgCode>-класу для кольору.
            </>
          }
        >
          <div className="dark w-full rounded-xl bg-background p-6 text-foreground">
            <div className="flex flex-wrap items-stretch gap-4">
              <ColorPair
                surface="bg-background"
                foreground="text-foreground"
                label="background / foreground"
              />
              <ColorPair
                surface="bg-card"
                foreground="text-muted-foreground"
                label="muted-foreground / card"
              />
              <ColorPair surface="bg-primary" foreground="text-primary-foreground" label="primary" />
              <NonTextSwatch token="bg-input" label="input / card" surface="bg-card" />
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button>Замовити</Button>
              <Button variant="outline">Детальніше</Button>
              <Button variant="ghost">Скасувати</Button>
              <Badge variant="success">В наявності</Badge>
            </div>
          </div>
        </PgBlock>
      </PgSection>

      {/* ── 3. Typography ─────────────────────────────────────────────────── */}
      <PgSection
        id="type"
        title="Типографіка"
        lead="Geist, одна гарнітура. Розмір, міжрядковий інтервал і трекінг зчитані з браузера."
        className="flex flex-col gap-10"
      >
        <div>
          <TypeRow step="text-5xl" role="Заголовок першого екрана (від sm)" sample="Чай, який варто заварити" />
          <TypeRow step="text-4xl" role="Заголовок першого екрана на телефоні" sample="Чай, який варто заварити" />
          <TypeRow step="text-3xl" role="Заголовок сторінки (h1); заголовок секції від sm" sample="Набір «Старт МІНІ»" />
          <TypeRow step="text-2xl" role="Заголовок секції на телефоні; заголовок блока" sample="Оберіть свій чай" />
          <TypeRow step="text-xl" role="Заголовок картки, заголовок діалогу" sample="Шу пуер Цзінмай Цяому" />
          <TypeRow step="text-lg" role="Назва пункту, підсумок акордеона" sample="Приготування" />
          <TypeRow step="text-base" role="Основний текст і ліди" sample="Сім сортів по 10 г, разом 70 г — дві повні церемонії з кожного." />
          <TypeRow step="text-sm" role="Мета: підписи, підказки, підписи кнопок" sample="Безкоштовна доставка від 500 ₴" />
          <TypeRow step="text-xs" role="Мітки: бейджі, надрядкові мітки, юридичні рядки" sample="Пуер · Шу · № 12" />
        </div>

        <PgBlock title="Насиченість">
          <p className="text-lg font-normal">400 — основний текст</p>
          <p className="text-lg font-medium">500 — мітки й навігація</p>
          <p className="text-lg font-semibold">600 — заголовки й кнопки</p>
        </PgBlock>

        <PgBlock
          title="Кирилиця у два рядки"
          note={
            <>
              Найгірший випадок: виносні <PgCode>у р д</PgCode> у першому рядку над{' '}
              <PgCode>Й Ї</PgCode> у другому. У Geist вони торкаються на 1.073, тож підлога кожного
              заголовка — 1.1. Нижче рядки злипнуться.
            </>
          }
        >
          <div className="flex w-full flex-col gap-6">
            <p className="max-w-md text-3xl font-semibold">
              Церемонія для другу
              <br />
              Їдемо по чай
            </p>
            <p className="max-w-lg text-5xl font-semibold">
              Чаю дуруй
              <br />
              Їжак Йорш
            </p>
          </div>
        </PgBlock>

        <PgBlock
          title="Повний набір українських знаків"
          note="Якби хоч один падав у запасний шрифт, він стояв би іншою гарнітурою в цьому рядку."
        >
          <p className="text-3xl">і ї є ґ І Ї Є Ґ ʼ № ₴ « » ’ – —</p>
        </PgBlock>

        <PgBlock title="Суцільний текст">
          <p className="max-w-prose text-base text-pretty">
            Шу пуер із Цзінмаю, пресований 2016 року з листа старих дерев. Заварка темна й густа, у
            смаку — фініки, чорнослив і вологе дерево; після п&apos;ятого проливу з&apos;являється
            солодкість, яка тримається довго.{' '}
            <Link href="/brewing" className="underline underline-offset-4 hover:text-primary">
              Як його заварювати
            </Link>
            .
          </p>
        </PgBlock>
      </PgSection>

      {/* ── 4. Radius ─────────────────────────────────────────────────────── */}
      <PgSection id="radius" title="Радіуси" lead="Шкала Tailwind без змін.">
        <div className="flex flex-wrap gap-5">
          {[
            ['rounded-sm', '4px', 'дрібні чипи'],
            ['rounded-md', '6px', 'кнопки, поля, чипи, лічильник'],
            ['rounded-lg', '8px', '—'],
            ['rounded-xl', '12px', 'картки, зображення, діалоги'],
            ['rounded-2xl', '16px', '—'],
            ['rounded-full', '∞', 'бейджі, круглі кнопки'],
          ].map(([cls, px, use]) => (
            <div key={cls} className="flex w-32 flex-col gap-2">
              <div className={`h-20 bg-card ${cls}`} />
              <span className="font-mono text-xs text-muted-foreground">{cls}</span>
              <span className="text-xs text-muted-foreground">
                {px} · {use}
              </span>
            </div>
          ))}
        </div>
      </PgSection>

      {/* ── 5. Elevation ──────────────────────────────────────────────────── */}
      <PgSection
        id="depth"
        title="Глибина"
        lead="Площинно: глибину дають поверхні й волосяні лінії, тінь — лише в оверлеях і під нижньою панеллю."
      >
        <div className="flex flex-wrap gap-5">
          <div className="flex min-w-56 flex-1 flex-col gap-2">
            <div className="rounded-xl bg-subtle p-4">
              <div className="rounded-xl bg-card p-4 text-sm">background → subtle → card</div>
            </div>
            <span className="font-mono text-xs text-muted-foreground">крок поверхні</span>
          </div>
          <div className="flex min-w-56 flex-1 flex-col gap-2">
            <div className="rounded-xl border border-border p-4 text-sm">border</div>
            <span className="font-mono text-xs text-muted-foreground">волосяна лінія</span>
          </div>
          <div className="flex min-w-56 flex-1 flex-col gap-2">
            <div className="rounded-xl bg-popover p-4 text-sm shadow-xl">shadow-xl</div>
            <span className="font-mono text-xs text-muted-foreground">оверлей</span>
          </div>
          <div className="flex min-w-56 flex-1 flex-col gap-2">
            <div className="rounded-xl bg-card p-4 text-sm shadow-up">shadow-up</div>
            <span className="font-mono text-xs text-muted-foreground">нижня панель покупки</span>
          </div>
        </div>
      </PgSection>

      {/* ── 6. Icons ──────────────────────────────────────────────────────── */}
      <PgSection id="icons" title="Іконки" lead="lucide-react, контурні, розмір за розміром тексту поруч.">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1 text-xs">
              <Leaf className="size-3.5" /> 14px біля text-xs
            </span>
            <span className="inline-flex items-center gap-2 text-sm">
              <Truck className="size-4" /> 16px біля text-sm
            </span>
            <span className="inline-flex items-center gap-2 text-lg">
              <ShoppingBag className="size-5" /> 20px біля text-lg
            </span>
            <Phone className="size-6" />
          </div>
          <div className="flex items-center gap-4 text-muted-foreground">
            <Leaf className="size-5" />
            <Truck className="size-5" />
            <ShoppingBag className="size-5" />
            <span className="text-sm">приглушена іконка стоїть поруч із приглушеним текстом</span>
          </div>
        </div>
      </PgSection>

      {/* ── 7. Actions ────────────────────────────────────────────────────── */}
      <PgSection
        id="actions"
        title="Дії"
        lead="Варіант × розмір. Стани — наведення, фокус, натиск — закріплені, щоб їх було видно без курсора."
        className="flex flex-col gap-10"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-150 border-collapse text-left">
            <caption className="sr-only">Кнопки: варіант на розмір</caption>
            <thead>
              <tr>
                <th scope="col" className="w-28 pb-3 text-xs font-medium text-muted-foreground">
                  варіант
                </th>
                {BUTTON_SIZES.map((size) => (
                  <th key={size} scope="col" className="pb-3 text-xs font-medium text-muted-foreground">
                    {size}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BUTTON_VARIANTS.map((variant) => (
                <tr key={variant} className="border-t border-border">
                  <th scope="row" className="py-3 font-mono text-xs font-normal text-muted-foreground">
                    {variant}
                  </th>
                  {BUTTON_SIZES.map((size) => (
                    <td key={size} className="py-3 pr-4">
                      <Button variant={variant} size={size}>
                        У кошик
                      </Button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <PgBlock title="Стани">
          <Button data-preview="hover">Наведення</Button>
          <Button data-preview="focus">Фокус</Button>
          <Button data-preview="active">Натиск</Button>
          <Button disabled>Вимкнена</Button>
          <Button pending>Оформлюємо</Button>
          <Button variant="outline" data-preview="focus">
            Фокус на outline
          </Button>
        </PgBlock>

        <PgBlock title="Кнопки-іконки та посилання">
          <Button size="icon" variant="outline" aria-label="Кошик">
            <ShoppingBag />
          </Button>
          <Button size="icon-sm" variant="outline" className="rounded-full" aria-label="Наступні товари">
            <ShoppingBag />
          </Button>
          <TextLink href="/catalog">Усі товари</TextLink>
          <TextLink glyph="plus">Читати далі</TextLink>
          <BackLink href="/catalog" />
        </PgBlock>

        <PgBlock title="Бейджі">
          <Badge>Пуер · Шу</Badge>
          <Badge variant="primary">Новинка</Badge>
          <Badge variant="subtle">Хіт</Badge>
          <Badge variant="outline">70 г</Badge>
          <Badge variant="success">
            <Check /> В наявності
          </Badge>
          <Badge variant="error">Немає</Badge>
          <Badge variant="warning">Останні 3</Badge>
          <Badge variant="info">Передзамовлення</Badge>
          <Badge size="lg">Безкоштовна доставка</Badge>
        </PgBlock>
      </PgSection>

      <FieldSpecimens />

      {/* ── 9. Feedback ───────────────────────────────────────────────────── */}
      <PgSection
        id="feedback"
        title="Повідомлення"
        lead="Помилка, яку треба виправити, не живе лише в тості — вона лишається на місці."
        className="flex max-w-2xl flex-col gap-4"
      >
        <Alert variant="info" title="Самовивіз у Чернігові">
          Забрати замовлення можна в будні з 10:00 до 19:00.
        </Alert>
        <Alert variant="success" title="Замовлення прийнято">
          Ми передзвонимо протягом робочого дня, щоб підтвердити доставку.
        </Alert>
        <Alert variant="warning" title="Лишилося три пачки">
          Цей збір більше не повториться — наступний урожай буде іншим.
        </Alert>
        <Alert
          variant="error"
          title="Не вдалося надіслати замовлення"
          action={
            <Button size="sm" variant="outline">
              Спробувати ще раз
            </Button>
          }
        >
          Схоже, зник звʼязок. Усе, що ви ввели, на місці — спробуйте ще раз або подзвоніть нам на{' '}
          <a href="tel:+380986575800" className="underline underline-offset-4">
            +38 (098) 657-58-00
          </a>
          .
        </Alert>
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Завантаження
          </span>
          <div className="flex gap-4">
            <Skeleton className="aspect-square w-32 rounded-xl" />
            <div className="flex flex-1 flex-col gap-2 py-1">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="mt-auto h-11 w-40" />
            </div>
          </div>
        </div>
      </PgSection>

      {/* ── 10. Shop controls ─────────────────────────────────────────────── */}
      <PlaygroundInteractive />

      {/* ── 11. Do and Don't ──────────────────────────────────────────────── */}
      <PgSection
        id="dos"
        title="Можна і не можна"
        lead="Чотири правила з DESIGN.md, які найлегше порушити."
        className="grid gap-6 md:grid-cols-2"
      >
        <DoDont
          ok
          title="Одна головна дія на екран"
          note="Друга дія — secondary або outline."
        >
          <div className="flex gap-3">
            <Button>Додати в кошик</Button>
            <Button variant="outline">До каталогу</Button>
          </div>
        </DoDont>
        <DoDont title="Дві однакові головні кнопки поруч" note="Око не знає, куди йти.">
          <div className="flex gap-3">
            <Button>Додати в кошик</Button>
            <Button>До каталогу</Button>
          </div>
        </DoDont>

        <DoDont ok title="Бренд — на дії" note="Площину тонує -subtle, а не насичена заливка.">
          <div className="rounded-xl bg-primary-subtle p-4">
            <p className="text-sm text-primary-subtle-foreground">
              Безкоштовна доставка від 500 ₴
            </p>
          </div>
        </DoDont>
        <DoDont title="Бренд — на площину" note="Велика насичена заливка кричить і ламає ієрархію.">
          <div className="rounded-xl bg-primary p-4">
            <p className="text-sm text-primary-foreground">Безкоштовна доставка від 500 ₴</p>
          </div>
        </DoDont>

        <DoDont ok title="Заголовок звичайним регістром" note="Великими — лише дрібні мітки.">
          <div className="flex flex-col gap-1">
            <Eyebrow className="text-muted-foreground">Сезон пуеру</Eyebrow>
            <p className="text-2xl font-semibold">Оберіть свій чай</p>
          </div>
        </DoDont>
        <DoDont title="Заголовок великими літерами" note="Кирилиця капслоком читається повільніше.">
          <p className="text-2xl font-semibold uppercase">Оберіть свій чай</p>
        </DoDont>

        <DoDont ok title="Картка на кроці поверхні" note="Колір або рамка — щось одне.">
          <div className="rounded-xl bg-card p-4 text-sm">Шу пуер Цзінмай Цяому</div>
        </DoDont>
        <DoDont title="Картка в картці" note="Два обрамлення одне в одному читаються як помилка.">
          <div className="rounded-xl bg-card p-4">
            <div className="rounded-xl border border-border bg-card p-4 text-sm">
              Шу пуер Цзінмай Цяому
            </div>
          </div>
        </DoDont>
      </PgSection>

      {/* ── 12. Composition ───────────────────────────────────────────────── */}
      <PgSection
        id="composition"
        title="Композиція"
        lead="Один реальний блок, зібраний лише з токенів і примітивів."
      >
        <div className="max-w-sm">
          <SectionHeading as="h3" action={<TextLink href="/catalog">Усі набори</TextLink>}>
            Для початку
          </SectionHeading>
          <Card className="mt-5">
            <CardHeader>
              <div className="flex flex-wrap gap-2">
                <Badge variant="subtle">7 сортів</Badge>
                <Badge variant="success">
                  <Check /> В наявності
                </Badge>
              </div>
              <CardTitle>Набір «Старт МІНІ»</CardTitle>
              <CardDescription>
                Сім сортів по 10 г, разом 70 г — дві повні церемонії з кожного.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-2xl font-semibold tabular-nums">570 ₴</p>
              <Button className="w-full">Додати в кошик</Button>
              <InfoRows>
                <InfoRow icon={<Truck />}>Безкоштовна доставка від 500 ₴</InfoRow>
                <InfoRow icon={<Check />}>Оплата при отриманні</InfoRow>
              </InfoRows>
              <Accordion title="Що всередині">
                <ul className="flex list-none flex-col gap-1 text-sm text-muted-foreground">
                  <li>Габа Наполеон</li>
                  <li>Шу пуер Цзінмай Цяому 2016</li>
                  <li>Зелений Лунцзин, весна 2025</li>
                  <li>Червоний Дянь Хун, перший сорт</li>
                  <li>Білий Шоу Мей</li>
                  <li>Улун світлий Те Гуань Інь 5</li>
                  <li>Улун темний Да Хун Пао Жоу Гуй</li>
                </ul>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </PgSection>
    </>
  );
}

function DoDont({
  ok = false,
  title,
  note,
  children,
}: {
  ok?: boolean;
  title: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <p
        className={
          ok
            ? 'text-sm font-semibold text-success-subtle-foreground'
            : 'text-sm font-semibold text-error-subtle-foreground'
        }
      >
        {ok ? 'Можна' : 'Не можна'} — {title}
      </p>
      <div className="rounded-xl border border-border p-5">{children}</div>
      <p className="text-sm text-muted-foreground text-pretty">{note}</p>
    </div>
  );
}
