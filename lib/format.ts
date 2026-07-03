/** Format a number as Ukrainian hryvnia, e.g. 1 240 ₴ */
export function uah(n: number): string {
  return new Intl.NumberFormat('uk-UA').format(n) + ' ₴';
}

/** Ukrainian plural selector: plural(2, 'товар','товари','товарів') */
export function plural(n: number, one: string, few: string, many: string): string {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
  return many;
}

/**
 * Validate a Ukrainian phone number.
 * Accepts +380XXXXXXXXX, 380XXXXXXXXX, 0XXXXXXXXX with spaces/dashes/parens.
 * Mobile operator code is the first two digits after the leading 0 / +380.
 */
export function isValidUaPhone(raw: string): boolean {
  const digits = raw.replace(/\D/g, '');
  if (/^380\d{9}$/.test(digits)) return true;
  if (/^0\d{9}$/.test(digits)) return true;
  return false;
}

/** Normalise any accepted UA phone input to +380XXXXXXXXX. */
export function normalizeUaPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (/^380\d{9}$/.test(digits)) return '+' + digits;
  if (/^0\d{9}$/.test(digits)) return '+38' + digits;
  return raw.trim();
}

/** Site origin for canonical/OG/sitemap. No trailing slash. */
export function siteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}
