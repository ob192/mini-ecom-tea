export type CategorySlug = 'puer' | 'green' | 'oolong' | 'red' | 'white';

export interface Category {
  slug: CategorySlug;
  label: string;
}

export interface Product {
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  category: CategorySlug;
  price: number;
  weight: number;
  image: string;
  inStock: boolean;
  origin?: string;
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
  qty: number;
}

/** Customer details collected at checkout. */
export interface CheckoutForm {
  first: string;
  last: string;
  phone: string;
  address: string;
}

/** Payload POSTed to /api/order. */
export interface OrderPayload extends CheckoutForm {
  items: CartItem[];
  /** Honeypot field — must be empty for a legitimate submission. */
  company?: string;
}
