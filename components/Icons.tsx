/**
 * Icon layer — all icons come from lucide-react.
 *
 * Every icon that used to be a hand-rolled SVG is re-exported here under its
 * original name, so no consuming component had to change its imports.
 * Consumers keep passing width/height/className exactly as before; lucide
 * accepts `size`, `width`, `height`, `className`, `strokeWidth`, etc.
 *
 * Migration map (old custom SVG -> lucide equivalent):
 *   CartIcon      -> ShoppingCart
 *   PlusIcon      -> Plus
 *   MinusIcon     -> Minus
 *   TrashIcon     -> Trash2
 *   CheckIcon     -> Check
 *   ChevLeftIcon  -> ChevronLeft
 *   ArrowIcon     -> ArrowRight
 *   AlertIcon     -> AlertCircle
 *   PinIcon       -> MapPin
 *   PhoneIcon     -> Phone
 *   MailIcon      -> Mail
 *   TruckIcon     -> Truck
 *   LeafIcon      -> Leaf  (BRAND MARK — see note below)
 *
 * NOTE ON THE BRAND LEAF
 * ----------------------
 * LeafIcon is your logo/brand mark, not a generic UI glyph. It's aliased to
 * lucide's `Leaf` for now so the app renders, but you asked to restyle it
 * separately. Replace the body of `LeafIcon` below with your bespoke brand SVG
 * when ready — every call site (Logo, Header, Hero, Footer, empty states,
 * placeholders) already funnels through this single export.
 */

import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Check,
  ChevronLeft,
  ArrowRight,
  AlertCircle,
  MapPin,
  Phone,
  Mail,
  Truck,
  Leaf,
  type LucideProps,
} from 'lucide-react';

// lucide's default strokeWidth is 2; the old hand-rolled set sat around
// 1.6–1.7 for a lighter, more editorial line. Centralize that here so the
// whole icon system shares one weight — tweak in one place.
const STROKE = 1.7;

function make(Base: React.ComponentType<LucideProps>) {
  const Icon = (props: LucideProps) => <Base strokeWidth={STROKE} {...props} />;
  Icon.displayName = Base.displayName ?? 'Icon';
  return Icon;
}

export const CartIcon = make(ShoppingCart);
export const PlusIcon = make(Plus);
export const MinusIcon = make(Minus);
export const TrashIcon = make(Trash2);
export const CheckIcon = make(Check);
export const ChevLeftIcon = make(ChevronLeft);
export const ArrowIcon = make(ArrowRight);
export const AlertIcon = make(AlertCircle);
export const PinIcon = make(MapPin);
export const PhoneIcon = make(Phone);
export const MailIcon = make(Mail);
export const TruckIcon = make(Truck);

/** BRAND MARK — restyle this with your bespoke leaf when ready. */
export const LeafIcon = make(Leaf);
