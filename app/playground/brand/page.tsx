import { BrandSpecimen } from '@/components/playground/BrandSpecimen';
import { devOnly } from '@/components/playground/guard';

/*
  Brand direction — three candidates, the same real block rendered three times.

  Only the brand roles change between them, and each one points at a family that
  already exists in the palette (`leaf`, `honey`, `clay`), so there is not a
  single raw colour on this page: what you see is exactly what `:root` would
  hold. Neutrals, type, spacing, radii and every status colour are identical in
  all three — this is a decision about one hue, not about the system.

  Once the owner chooses, the five lines move into `:root` and the five dark
  ones into `.dark` in app/globals.css, the two rejected families are deleted
  from `@theme`, and this page goes with them.
*/

const SCOPES = `
.brand-leaf {
	--primary: var(--color-leaf-700);
	--primary-foreground: var(--color-white);
	--primary-strong: var(--color-leaf-800);
	--primary-subtle: var(--color-leaf-50);
	--primary-subtle-foreground: var(--color-leaf-800);
}
.brand-leaf.dark, .brand-leaf .dark {
	--primary: var(--color-leaf-300);
	--primary-foreground: var(--color-neutral-950);
	--primary-strong: var(--color-leaf-200);
	--primary-subtle: var(--color-leaf-950);
	--primary-subtle-foreground: var(--color-leaf-200);
}

.brand-honey {
	--primary: var(--color-honey-500);
	--primary-foreground: var(--color-neutral-900);
	--primary-strong: var(--color-honey-600);
	--primary-subtle: var(--color-honey-50);
	--primary-subtle-foreground: var(--color-honey-800);
}
.brand-honey.dark, .brand-honey .dark {
	--primary: var(--color-honey-500);
	--primary-foreground: var(--color-neutral-950);
	--primary-strong: var(--color-honey-400);
	--primary-subtle: var(--color-honey-950);
	--primary-subtle-foreground: var(--color-honey-200);
}

.brand-clay {
	--primary: var(--color-clay-600);
	--primary-foreground: var(--color-white);
	--primary-strong: var(--color-clay-700);
	--primary-subtle: var(--color-clay-50);
	--primary-subtle-foreground: var(--color-clay-700);
}
.brand-clay.dark, .brand-clay .dark {
	--primary: var(--color-clay-500);
	--primary-foreground: var(--color-white);
	--primary-strong: var(--color-clay-400);
	--primary-subtle: var(--color-clay-950);
	--primary-subtle-foreground: var(--color-clay-200);
}
`;

const DIRECTIONS = [
  {
    scope: 'brand-leaf',
    n: 1,
    name: 'Лист',
    idea:
      'Нинішня тотожність магазину, перенесена на нову систему: глибокий чайний зелений на дії, кремові нейтральні навколо.',
    tradeoff:
      'Найменше змін для покупця, який уже бачив сайт, і зелений лишається «кольором чаю». Але він темний і спокійний — кнопка не вихоплюється з кремової сторінки так, як могла б, а на фото чайного листя зелений на зеленому частково зникає.',
    tech: 'leaf-700 · білий текст 10,3:1 · у темному блоці піднімається до leaf-300',
  },
  {
    scope: 'brand-honey',
    n: 2,
    name: 'Мед',
    idea:
      'Формула RedАвто: майже нейтральні теплі кремові й один насичений акцент — колір завареного настою.',
    tradeoff:
      'Найяскравіша дія з трьох: жовто-медовий на кремовому видно з кутика ока, і він тримається однаковим у світлому й темному блоці. Зелений зникає з інтерфейсу й лишається тільки на фотографіях. Ризик: він близький до статусного «warning», тож попередження доведеться впізнавати за іконкою й текстом, а не за кольором.',
    tech: 'honey-500 · темний текст 6,1:1 · той самий відтінок у темному блоці',
  },
  {
    scope: 'brand-clay',
    n: 3,
    name: 'Глина',
    idea:
      'Теракота — колір ісінського чайника й настою червоного чаю. Теплі кремові, один глибокий цегляний акцент.',
    tradeoff:
      'Найбільший контраст із кремовим фоном і найтепліший із трьох; добре лягає на фото чаю, бо нічого на них не повторює. Ризик дзеркальний до другого варіанту: цегляний сусідить із «error», тож повідомлення про помилку мусить відрізнятися не кольором, а іконкою, рамкою й текстом.',
    tech: 'clay-600 · білий текст 6,4:1 · у темному блоці світлішає до clay-500',
  },
];

export default function BrandDirectionsPage() {
  devOnly();

  return (
    <>
      <style>{SCOPES}</style>

      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold">Напрям бренду</h1>
        <p className="mt-3 max-w-prose text-base text-muted-foreground text-pretty">
          Один і той самий блок, відрендерений тричі. Відрізняється лише те, на яку родину вказують
          п&apos;ять брендових токенів: нейтральні, типографіка, відступи, радіуси й статусні
          кольори в усіх трьох однакові. Акцент показано там, де він справді стоїть — головна
          кнопка, обрана вага, бейдж, знак бренду й посилання — і поруч із помилкою поля.
        </p>
        <p className="mt-3 max-w-prose text-sm text-muted-foreground text-pretty">
          Кожен варіант нижче — на цілий екран, із порожнім проміжком між ними, щоб жоден не
          оцінювався поруч із сусідом.
        </p>
      </div>

      {DIRECTIONS.map((d) => (
        <section key={d.scope} aria-labelledby={`dir-${d.n}`}>
          <div className="mx-auto w-full max-w-6xl border-t border-border px-4 py-10 sm:px-6 lg:px-8">
            <h2 id={`dir-${d.n}`} className="text-2xl font-semibold">
              {d.n}. {d.name}
            </h2>
            <p className="mt-2 max-w-prose text-base text-pretty">{d.idea}</p>
            <p className="mt-2 max-w-prose text-sm text-muted-foreground text-pretty">
              {d.tradeoff}
            </p>
            <p className="mt-2 font-mono text-xs text-muted-foreground">{d.tech}</p>
          </div>

          <div className={d.scope}>
            <BrandSpecimen />
          </div>

          {/* A viewport of nothing, so the next direction is judged on its own. */}
          <div className="h-svh bg-subtle" aria-hidden />
        </section>
      ))}
    </>
  );
}
