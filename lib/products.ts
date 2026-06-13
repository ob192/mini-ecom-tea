import shopData from '@/products.json';
import type { Shop, Product, Category, CategorySlug } from './types';

// products.json is the single source of truth. Cast through `unknown` so the
// JSON literal is validated against our typed model at the boundary.
const SHOP = shopData as unknown as Shop;

export const CURRENCY = SHOP.currency; // "UAH"
export const UNIT = SHOP.unit; // "г"

export const categories: Category[] = SHOP.categories;
export const products: Product[] = SHOP.products;

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: CategorySlug | 'all'): Product[] {
  if (category === 'all') return products;
  return products.filter((p) => p.category === category);
}

export function categoryLabel(slug: string): string {
  return categories.find((c) => c.slug === slug)?.label ?? slug;
}

export function allProductSlugs(): string[] {
  return products.map((p) => p.slug);
}

/** Per-category placeholder tones (warm tea palette, low saturation). */
export const CAT_TONE: Record<CategorySlug, { a: string; b: string; label: string }> = {
  puer: { a: '#5C4A33', b: '#3E3120', label: 'ПУЕР' },
  green: { a: '#5E6B43', b: '#42502C', label: 'ЗЕЛЕНИЙ' },
  oolong: { a: '#7A6334', b: '#574722', label: 'УЛУН' },
  red: { a: '#7A3F2C', b: '#592A1C', label: 'ЧЕРВОНИЙ' },
  white: { a: '#8A7E63', b: '#6B6047', label: 'БІЛИЙ' },
};

export function tone(slug: string) {
  return CAT_TONE[slug as CategorySlug] ?? CAT_TONE.green;
}
