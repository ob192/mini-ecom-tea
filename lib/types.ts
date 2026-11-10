export type CategorySlug =
  | 'puer'
  | 'green'
  | 'oolong'
  | 'red'
  | 'white'
  | 'set'
  | 'gaiwan'
  | 'teapot'
  | 'piala'
  | 'accessory'
  | 'figurine';

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
/*
  A product video is its own field, never an entry in `files`.

  `files` is the photo list: it becomes `images` (the gallery), `image` (the
  first photo), the OG and JSON-LD image, and `g:image_link` in the Merchant
  Center feed. A .mp4 in that array would be handed to `next/image`, could
  become the feed's image link, and would be rejected by Google — a silent way
  to drop the product out of Shopping. Keeping video in its own field means
  every one of those paths keeps seeing photographs only.
*/
export interface ProductVideo {
  /** Resolved public path, e.g. "/set/start-mini-7/unboxing-720.mp4". */
  src: string;
  /** Resolved public path of the still shown before playback — the clip's own frame 0. */
  poster: string;
  /** What the clip shows, for the slide's accessible name. */
  label: string;
}

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
  /** Optional product video; null for everything that has none. */
  video: ProductVideo | null;
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
  botField?: string;
}