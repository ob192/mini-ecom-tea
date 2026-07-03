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
import { getProduct, priceFor } from '@/lib/products';

const LS_KEY = 'teache_cart_v2'; // bumped: cart lines now carry a weight
const FREE_DELIVERY_THRESHOLD = 500;
const DELIVERY_FEE = 60;

const same = (i: CartItem, slug: string, weight: number) =>
    i.slug === slug && i.weight === weight;

type Action =
    | { type: 'hydrate'; items: CartItem[] }
    | { type: 'add'; slug: string; weight: number; qty: number }
    | { type: 'inc'; slug: string; weight: number }
    | { type: 'dec'; slug: string; weight: number }
    | { type: 'remove'; slug: string; weight: number }
    | { type: 'clear' };

function reducer(state: CartItem[], action: Action): CartItem[] {
  switch (action.type) {
    case 'hydrate':
      return action.items;
    case 'add': {
      const existing = state.find((i) => same(i, action.slug, action.weight));
      if (existing) {
        return state.map((i) =>
            same(i, action.slug, action.weight)
                ? { ...i, qty: Math.min(99, i.qty + action.qty) }
                : i,
        );
      }
      return [...state, { slug: action.slug, weight: action.weight, qty: Math.min(99, action.qty) }];
    }
    case 'inc':
      return state.map((i) =>
          same(i, action.slug, action.weight) ? { ...i, qty: Math.min(99, i.qty + 1) } : i,
      );
    case 'dec':
      return state.map((i) =>
          same(i, action.slug, action.weight) ? { ...i, qty: Math.max(1, i.qty - 1) } : i,
      );
    case 'remove':
      return state.filter((i) => !same(i, action.slug, action.weight));
    case 'clear':
      return [];
    default:
      return state;
  }
}

interface CartContextValue {
  items: CartItem[];
  ready: boolean;
  count: number;
  subtotal: number;
  delivery: number;
  total: number;
  freeDeliveryThreshold: number;
  lastAdded: string | null;
  add: (slug: string, weight: number, qty?: number) => void;
  inc: (slug: string, weight: number) => void;
  dec: (slug: string, weight: number) => void;
  remove: (slug: string, weight: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, dispatch] = useReducer(reducer, []);
  const [ready, setReady] = useState(false);
  const [lastAdded, setLastAdded] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed?.cart)) {
          const valid: CartItem[] = parsed.cart.filter((i: CartItem) => {
            if (!i || typeof i.slug !== 'string' || typeof i.weight !== 'number') return false;
            const p = getProduct(i.slug);
            return !!p && priceFor(p, i.weight) != null;
          });
          dispatch({ type: 'hydrate', items: valid });
        }
      }
    } catch {
      /* ignore corrupt storage */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ cart: items }));
    } catch {
      /* storage full / disabled — fail silently */
    }
  }, [items, ready]);

  const derived = useMemo(() => {
    const count = items.reduce((s, i) => s + i.qty, 0);
    const subtotal = items.reduce((s, i) => {
      const p = getProduct(i.slug);
      const price = p ? priceFor(p, i.weight) : null;
      return s + (price ?? 0) * i.qty;
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
    add: (slug, weight, qty = 1) => {
      dispatch({ type: 'add', slug, weight, qty });
      setLastAdded(slug);
    },
    inc: (slug, weight) => dispatch({ type: 'inc', slug, weight }),
    dec: (slug, weight) => dispatch({ type: 'dec', slug, weight }),
    remove: (slug, weight) => dispatch({ type: 'remove', slug, weight }),
    clear: () => dispatch({ type: 'clear' }),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within <CartProvider>');
  return ctx;
}