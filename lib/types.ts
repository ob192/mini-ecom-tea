export type CategorySlug = 'puer' | 'green' | 'oolong' | 'red' | 'white' | 'piala';

export interface Category {
  slug: CategorySlug;
  label: string;
}

/** One weight option for a product (e.g. 25 г / 415 ₴). */
export interface PriceTier {
  weight: number;
  price: number;
}

/**
 * Product, derived from public/products.json.
 * `category` is parsed from the slug prefix ("green/longjing-cha" -> "green").
 */
export interface Product {
  slug: string; // "green/longjing-cha"
  category: CategorySlug;
  title: string;
  subtitle: string;
  description: string;
  /** Base/display price. Null when the source row has no price yet. */
  price: number | null;
  /** Base weight in grams (null for teaware / volume items). */
  weight: number | null;
  priceTiers: PriceTier[];
  /** Raw filenames from the JSON, e.g. ["1.jpg","2.jpg"]. */
  files: string[];
  /** Resolved public paths, e.g. ["/green/longjing-cha/1.jpg", ...]. */
  images: string[];
  /** First image or '' (empty -> branded placeholder). */
  image: string;
  /** Purchasable when a base price can be resolved. */
  inStock: boolean;
}

export interface Shop {
  currency: string;
  unit: string;
  categories: Category[];
  products: Product[];
}

/** A single line in the cart (persisted to localStorage). */
export interface CartItem {
  slug: string;
  /** Selected weight tier (0 for weightless / single-price items). */
  weight: number;
  qty: number;
}

/** Customer + delivery details collected at checkout. */
export interface CheckoutForm {
  first: string;
  last: string;
  phone: string;
  deliveryMethod: 'np_warehouse' | 'np_courier';
  cityRef: string;
  cityName: string;
  warehouseRef: string;
  warehouse: string;
  address: string;
}

/** Payload POSTed to /api/order. */
export interface OrderPayload extends CheckoutForm {
  items: CartItem[];
  /** Honeypot field — must be empty for a legitimate submission. */
  company?: string;
}