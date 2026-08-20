import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { BRAND_NAME } from '@/lib/contacts';

/**
 * Default social card for every route that doesn't ship its own image
 * (home, /about, /brewing, /contacts, /delivery, and any product without a photo).
 *
 * Next resolves the served URL against `metadataBase` in app/layout.tsx, i.e.
 * NEXT_PUBLIC_SITE_URL — nothing here hardcodes a domain.
 */
export const alt = `${BRAND_NAME} — колекційний листовий чай прямих поставок`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const GREEN = '#2E4631';
const GREEN_DEEP = '#233726';
const PAPER = '#F3ECDD';
const AMBER = '#BE8638';

export default async function OpengraphImage() {
  // Read off disk at build time — satori needs ttf/otf (no woff2), and Oswald
  // is the site's display face and covers Cyrillic.
  const oswald = await readFile(join(process.cwd(), 'app/og/Oswald-SemiBold.ttf'));

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '84px 90px',
          backgroundColor: GREEN,
          backgroundImage: `linear-gradient(135deg, ${GREEN} 0%, ${GREEN_DEEP} 100%)`,
          color: PAPER,
          fontFamily: 'Oswald',
        }}
      >
        {/* leaf mark — same path as app/icon.svg */}
        <svg width="86" height="86" viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth="1.5"
             strokeLinejoin="round" strokeLinecap="round">
          <path d="M20 4S9 3 5.5 9.5C3 14 6 19 6 19s5 .5 9-3.5C18.5 12 20 4 20 4Z" />
          <path d="M6 19c2-6 6-9 11-12" />
        </svg>

        <div style={{ display: 'flex', fontSize: 96, letterSpacing: 6, marginTop: 34 }}>
          {BRAND_NAME}
        </div>

        <div style={{ display: 'flex', fontSize: 40, lineHeight: 1.3, marginTop: 18, opacity: 0.9, maxWidth: 900 }}>
          Колекційний листовий чай прямих поставок
        </div>

        <div
          style={{
            display: 'flex',
            marginTop: 46,
            paddingTop: 28,
            borderTop: `2px solid rgba(243, 236, 221, 0.22)`,
            fontSize: 30,
            letterSpacing: 3,
            color: AMBER,
          }}
        >
          ПУЕР · УЛУН · ЗЕЛЕНИЙ · ЧЕРВОНИЙ · БІЛИЙ · ПОСУД
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: 'Oswald', data: oswald, weight: 600, style: 'normal' }],
    },
  );
}
