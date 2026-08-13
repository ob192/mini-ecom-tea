/**
 * Canonical shop identity: the public name and every contact detail.
 *
 * These appear on /contacts, /returns and /privacy, in the Organization
 * JSON-LD, in the footer, and as the Merchant Center `g:brand`. Google checks
 * that the name and contact information a shop publishes agree across the feed,
 * the landing pages and the structured data, so keep this the single place any
 * of it is authored.
 *
 * SITE_NAME is the bare domain, matching NEXT_PUBLIC_SITE_URL. The absolute URL
 * itself comes from `siteUrl()` in lib/format.ts — never hardcode it.
 */

export const SITE_NAME = 'jintea.restreto-labs.com';

export const CONTACT_EMAIL = 'support@jintea.restreto-labs.com';

/** Display form; `PHONE_HREF` is the dialable one. */
export const CONTACT_PHONE = '+38 (098) 657-58-00';
export const CONTACT_PHONE_HREF = 'tel:+380986575800';

export const TELEGRAM_HANDLE = 'Jin_tea';
export const TELEGRAM_URL = 'https://t.me/Jin_tea';

export const INSTAGRAM_HANDLE = 'jintea.ua';
export const INSTAGRAM_URL = 'https://instagram.com/jintea.ua';
