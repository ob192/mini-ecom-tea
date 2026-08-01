import { NextResponse } from 'next/server';
import { getProduct, priceFor, categoryLabel, CURRENCY, UNIT } from '@/lib/products';
import { uah, isValidUaPhone, normalizeUaPhone, siteUrl } from '@/lib/format';
import { rateLimit, clientKey } from '@/lib/rate-limit';
import { readGaCookies, sendPurchase } from '@/lib/ga4-server';
import type { OrderPayload, CartItem } from '@/lib/types';

export const runtime = 'nodejs';

const FREE_DELIVERY_THRESHOLD = 500;
const DELIVERY_FEE = 60;

function bad(error: string, status = 400) {
  return NextResponse.json({ ok: false, error }, { status });
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export async function POST(request: Request) {
  const key = clientKey(request.headers);
  const rl = rateLimit(key);
  if (!rl.ok) {
    return NextResponse.json(
        { ok: false, error: 'Забагато спроб. Спробуйте за хвилину.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec) } },
    );
  }

  let body: OrderPayload;
  try {
    body = (await request.json()) as OrderPayload;
  } catch {
    return bad('Невірний формат запиту.');
  }

  // Honeypot: pretend success, drop the order. Logged, because a silent drop
  // is indistinguishable from a bug when it misfires (it did: the field used to
  // be named "company" and browsers autofilled it from the address profile).
  if (body.botField && body.botField.trim() !== '') {
    console.warn('[order] honeypot triggered — dropped submission');
    return NextResponse.json({ ok: true, orderId: 'TC-000000' });
  }

  const first = (body.first ?? '').trim();
  const last = (body.last ?? '').trim();
  const phoneRaw = (body.phone ?? '').trim();

  if (first.length < 2) return bad("Вкажіть коректне ім'я.");
  if (last.length < 1) return bad('Вкажіть прізвище.');
  if (!isValidUaPhone(phoneRaw)) return bad('Невірний номер телефону.');

  // Delivery validation.
  const method = body.deliveryMethod;
  const cityName = (body.cityName ?? '').trim();
  const warehouse = (body.warehouse ?? '').trim();
  const address = (body.address ?? '').trim();

  if (method !== 'np_warehouse' && method !== 'np_courier') return bad('Оберіть спосіб доставки.');
  if (cityName.length < 2 || !(body.cityRef ?? '').trim()) return bad('Оберіть місто.');
  if (method === 'np_warehouse' && (!warehouse || !(body.warehouseRef ?? '').trim())) {
    return bad('Оберіть відділення Нової Пошти.');
  }
  if (method === 'np_courier' && address.length < 6) return bad('Уточніть адресу доставки.');

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return bad('Кошик порожній.');
  }

  type Line = {
    slug: string;
    category: string;
    name: string;
    weight: number;
    qty: number;
    price: number;
    lineTotal: number;
  };
  const lines: Line[] = [];
  let subtotal = 0;

  for (const raw of body.items as CartItem[]) {
    const product = getProduct(raw?.slug);
    const weight = Math.floor(Number(raw?.weight));
    const qty = Math.floor(Number(raw?.qty));
    if (!product) return bad(`Невідомий товар: ${escapeHtml(String(raw?.slug))}`);
    if (!Number.isFinite(qty) || qty < 1 || qty > 99) return bad('Невірна кількість товару.');

    const price = priceFor(product, weight);
    if (price == null) return bad(`Товар недоступний: ${product.title}`);
    if (!product.inStock) return bad(`Товар недоступний: ${product.title}`);

    const lineTotal = price * qty;
    subtotal += lineTotal;
    lines.push({
      slug: product.slug,
      category: categoryLabel(product.category),
      name: product.title,
      weight,
      qty,
      price,
      lineTotal,
    });
  }

  const delivery = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = subtotal + delivery;
  const phone = normalizeUaPhone(phoneRaw);

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.error('[order] Missing TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID');
    return bad('Сервіс тимчасово недоступний. Спробуйте пізніше.', 503);
  }

  const orderId = 'TC-' + Math.floor(100000 + Math.random() * 900000);

  const itemLines = lines
      .map((l) => {
        const w = l.weight ? ` (${l.weight} ${UNIT})` : '';
        return `• ${escapeHtml(l.name)}${w} — ${l.qty} × ${uah(l.price)} = <b>${uah(l.lineTotal)}</b>`;
      })
      .join('\n');

  const deliveryLine =
      method === 'np_warehouse'
          ? `Нова Пошта · ${escapeHtml(cityName)} · ${escapeHtml(warehouse)}`
          : `Нова Пошта (кур'єр) · ${escapeHtml(cityName)} · ${escapeHtml(address)}`;

  const text =
      `🍵 <b>Нове замовлення ${orderId}</b>\n\n` +
      `👤 <b>Клієнт:</b> ${escapeHtml(first)} ${escapeHtml(last)}\n` +
      `📞 <b>Телефон:</b> ${escapeHtml(phone)}\n` +
      `🚚 <b>Доставка:</b> ${deliveryLine}\n\n` +
      `🧾 <b>Замовлення:</b>\n${itemLines}\n\n` +
      `Сума: ${uah(subtotal)}\n` +
      `Доставка: ${delivery === 0 ? 'безкоштовно' : uah(delivery)}\n` +
      `💰 <b>Разом: ${uah(total)}</b>`;

  try {
    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!tgRes.ok) {
      const detail = await tgRes.text().catch(() => '');
      console.error('[order] Telegram error', tgRes.status, detail);
      return bad('Не вдалося надіслати замовлення. Спробуйте ще раз.', 502);
    }
  } catch (err) {
    console.error('[order] Telegram request failed', err);
    return bad('Не вдалося надіслати замовлення. Спробуйте ще раз.', 502);
  }

  // GA4 `purchase` — server-side (Measurement Protocol) so the revenue comes
  // from the recomputed total and survives ad-blockers. Fired only after
  // Telegram accepted the order; never throws.
  await sendPurchase(
      {
        transaction_id: orderId,
        value: total,
        currency: CURRENCY,
        shipping: delivery,
        page_location: `${siteUrl()}/order/success`,
        items: lines.map((l) => ({
          item_id: l.slug,
          item_name: l.name,
          item_category: l.category,
          ...(l.weight ? { item_variant: `${l.weight} ${UNIT}` } : {}),
          price: l.price,
          quantity: l.qty,
        })),
      },
      readGaCookies(request.headers.get('cookie'), process.env.GA4_MEASUREMENT_ID ?? ''),
  );

  return NextResponse.json({ ok: true, orderId, total });
}

export function GET() {
  return NextResponse.json({ ok: false, error: 'Method not allowed' }, { status: 405 });
}