import rawProducts from '@/public/products.json';
import type { Product, Category, CategorySlug, PriceTier } from './types';

export const CURRENCY = 'UAH';
export const UNIT = 'г';

/** Display order + labels for every category we support. */
const CATEGORY_ORDER: Category[] = [
  { slug: 'puer', label: 'Пуер' },
  { slug: 'oolong', label: 'Улун' },
  { slug: 'green', label: 'Зелений чай' },
  { slug: 'red', label: 'Червоний чай' },
  { slug: 'white', label: 'Білий чай' },
  { slug: 'piala', label: 'Посуд' },
];

interface RawProduct {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  price: number | null;
  weight: number | null;
  priceTiers: PriceTier[];
  files: string[];
}

function build(raw: RawProduct): Product {
  const category = raw.slug.split('/')[0] as CategorySlug;
  const files = Array.isArray(raw.files) ? raw.files : [];
  const images = files.map((f) => `/${raw.slug}/${f}`);
  const priceTiers = (raw.priceTiers ?? []).slice().sort((a, b) => a.weight - b.weight);

  // When tiers exist, anchor the displayed "від ..." price/weight to the
  // cheapest (lowest-weight) tier rather than whatever `raw.price` says —
  // some source rows set `price`/`weight` to a middle tier.
  const basePrice = priceTiers[0]?.price ?? raw.price ?? null;
  const baseWeight = priceTiers[0]?.weight ?? raw.weight ?? null;

  return {
    slug: raw.slug,
    category,
    title: raw.title,
    subtitle: raw.subtitle,
    description: raw.description,
    price: basePrice,
    weight: baseWeight,
    priceTiers,
    files,
    images,
    image: images[0] ?? '',
    inStock: basePrice != null,
  };
}

export const products: Product[] = (rawProducts as unknown as RawProduct[]).map(build);

/** Only the categories that actually have products, in display order. */
export const categories: Category[] = CATEGORY_ORDER.filter((c) =>
    products.some((p) => p.category === c.slug),
);

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: CategorySlug | 'all'): Product[] {
  if (category === 'all') return products;
  return products.filter((p) => p.category === category);
}

export function categoryLabel(slug: string): string {
  return CATEGORY_ORDER.find((c) => c.slug === slug)?.label ?? slug;
}

export function allProductSlugs(): string[] {
  return products.map((p) => p.slug);
}

/**
 * Resolve the price for a chosen weight.
 * - With tiers: exact-match the weight, else null (invalid selection).
 * - Without tiers: the single price, regardless of the (0) weight.
 */
export function priceFor(product: Product, weight: number): number | null {
  if (product.priceTiers.length > 0) {
    return product.priceTiers.find((t) => t.weight === weight)?.price ?? null;
  }
  return product.price;
}

/** The weight a "quick add" should use (prefers 50 г, else first tier, else base). */
export function defaultWeight(product: Product): number {
  if (product.priceTiers.length > 0) {
    const fifty = product.priceTiers.find((t) => t.weight === 50);
    return (fifty ?? product.priceTiers[0]).weight;
  }
  return product.weight ?? 0;
}

/**
 * If buying `qty` packs of `weight` adds up to exactly another tier's weight
 * at a cheaper (or equal) price, collapse the selection to that single tier
 * pack instead of stacking N small packs — e.g. 2 × 25 г should become 1 × 50 г
 * when the 50 г tier is priced below double the 25 г price.
 */
export function collapseToTier(
    product: Product,
    weight: number,
    qty: number,
): { weight: number; qty: number } {
  if (qty <= 1 || product.priceTiers.length === 0) return { weight, qty };

  const unit = priceFor(product, weight);
  if (unit == null) return { weight, qty };

  const totalWeight = weight * qty;
  const match = product.priceTiers.find((t) => t.weight === totalWeight);
  if (match && match.price < unit * qty) {
    return { weight: match.weight, qty: 1 };
  }
  return { weight, qty };
}

/** Per-category placeholder tones (warm tea palette, low saturation). */
export const CAT_TONE: Record<CategorySlug, { a: string; b: string; label: string }> = {
  puer: { a: '#5C4A33', b: '#3E3120', label: 'ПУЕР' },
  green: { a: '#5E6B43', b: '#42502C', label: 'ЗЕЛЕНИЙ' },
  oolong: { a: '#7A6334', b: '#574722', label: 'УЛУН' },
  red: { a: '#7A3F2C', b: '#592A1C', label: 'ЧЕРВОНИЙ' },
  white: { a: '#8A7E63', b: '#6B6047', label: 'БІЛИЙ' },
  piala: { a: '#6E6552', b: '#4E4739', label: 'ПОСУД' },
};

export function tone(slug: string) {
  return CAT_TONE[slug as CategorySlug] ?? CAT_TONE.green;
}