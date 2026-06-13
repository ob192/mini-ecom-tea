'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';
import type { CartItem } from '@/lib/types';
import { getProduct } from '@/lib/products';

const LS_KEY = 'teache_cart_v1';
const FREE_DELIVERY_THRESHOLD = 500;
const DELIVERY_FEE = 60;

type Action =
  | { type: 'hydrate'; items: CartItem[] }
  | { type: 'add'; slug: string; qty: number }
  | { type: 'inc'; slug: string }
  | { type: 'dec'; slug: string }
  | { type: 'remove'; slug: string }
  | { type: 'clear' };

function reducer(state: CartItem[], action: Action): CartItem[] {
  switch (action.type) {
    case 'hydrate':
      return action.items;
    case 'add': {
      const existing = state.find((i) => i.slug === action.slug);
      if (existing) {
        return state.map((i) =>
          i.slug === action.slug ? { ...i, qty: Math.min(99, i.qty + action.qty) } : i,
        );
      }
      return [...state, { slug: action.slug, qty: Math.min(99, action.qty) }];
    }
    case 'inc':
      return state.map((i) =>
        i.slug === action.slug ? { ...i, qty: Math.min(99, i.qty + 1) } : i,
      );
    case 'dec':
      return state.map((i) =>
        i.slug === action.slug ? { ...i, qty: Math.max(1, i.qty - 1) } : i,
      );
    case 'remove':
      return state.filter((i) => i.slug !== action.slug);
    case 'clear':
      return [];
    default:
      return state;
  }
}

interface CartContextValue {
  items: CartItem[];
  /** True once localStorage has been read — guards against SSR hydration flash. */
  ready: boolean;
  count: number;
  subtotal: number;
  delivery: number;
  total: number;
  freeDeliveryThreshold: number;
  lastAdded: string | null;
  add: (slug: string, qty?: number) => void;
  inc: (slug: string) => void;
  dec: (slug: string) => void;
  remove: (slug: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, dispatch] = useReducer(reducer, []);
  const [ready, setReady] = useState(false);
  const [lastAdded, setLastAdded] = useState<string | null>(null);

  // Read persisted cart once on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed?.cart)) {
          // Drop any items whose product no longer exists in products.json.
          const valid = parsed.cart.filter(
            (i: CartItem) => i && typeof i.slug === 'string' && getProduct(i.slug),
          );
          dispatch({ type: 'hydrate', items: valid });
        }
      }
    } catch {
      // ignore corrupt storage
    }
    setReady(true);
  }, []);

  // Persist on every change (after hydration).
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ cart: items }));
    } catch {
      // storage may be full / disabled — fail silently
    }
  }, [items, ready]);

  const derived = useMemo(() => {
    const count = items.reduce((s, i) => s + i.qty, 0);
    const subtotal = items.reduce((s, i) => {
      const p = getProduct(i.slug);
      return s + (p ? p.price * i.qty : 0);
    }, 0);
    const delivery =
      subtotal === 0 || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
    return { count, subtotal, delivery, total: subtotal + delivery };
  }, [items]);

  const value: CartContextValue = {
    items,
    ready,
    ...derived,
    freeDeliveryThreshold: FREE_DELIVERY_THRESHOLD,
    lastAdded,
    add: (slug, qty = 1) => {
      dispatch({ type: 'add', slug, qty });
      setLastAdded(slug);
    },
    inc: (slug) => dispatch({ type: 'inc', slug }),
    dec: (slug) => dispatch({ type: 'dec', slug }),
    remove: (slug) => dispatch({ type: 'remove', slug }),
    clear: () => dispatch({ type: 'clear' }),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within <CartProvider>');
  return ctx;
}
