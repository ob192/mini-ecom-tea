import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement>;

export const CartIcon = (p: P) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden {...p}>
    <path d="M3 4h2.2l1.6 11.2a1.6 1.6 0 0 0 1.6 1.4h8.1a1.6 1.6 0 0 0 1.57-1.27L19.6 7H6.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="9.5" cy="20" r="1.4" fill="currentColor" />
    <circle cx="17" cy="20" r="1.4" fill="currentColor" />
  </svg>
);

export const LeafIcon = (p: P) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden {...p}>
    <path d="M20 4S9 3 5.5 9.5C3 14 6 19 6 19s5 .5 9-3.5C18.5 12 20 4 20 4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M6 19c2-6 6-9 11-12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export const PlusIcon = (p: P) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden {...p}>
    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
  </svg>
);

export const MinusIcon = (p: P) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden {...p}>
    <path d="M5 12h14" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
  </svg>
);

export const TrashIcon = (p: P) => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden {...p}>
    <path d="M4 7h16M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7m2 0-.7 12.1A1.6 1.6 0 0 1 14.7 20.6H9.3a1.6 1.6 0 0 1-1.6-1.5L7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const CheckIcon = (p: P) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden {...p}>
    <path d="M5 12.5 10 17.5 19 6.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ChevLeftIcon = (p: P) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden {...p}>
    <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ArrowIcon = (p: P) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden {...p}>
    <path d="M5 12h13M12 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const AlertIcon = (p: P) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden {...p}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
    <path d="M12 7.5v5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="12" cy="16.3" r="1.05" fill="currentColor" />
  </svg>
);

export const PinIcon = (p: P) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden {...p}>
    <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="12" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

export const PhoneIcon = (p: P) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden {...p}>
    <path d="M6.5 3h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16 16 0 0 1 4.5 5.2 2 2 0 0 1 6.5 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
  </svg>
);

export const MailIcon = (p: P) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden {...p}>
    <rect x="3" y="5.5" width="18" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
    <path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export const TruckIcon = (p: P) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden {...p}>
    <path d="M3 6.5h10v9H3z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    <path d="M13 9.5h4l3 3.2V15.5h-7z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    <circle cx="7" cy="17.5" r="1.8" stroke="currentColor" strokeWidth="1.7" />
    <circle cx="16.5" cy="17.5" r="1.8" stroke="currentColor" strokeWidth="1.7" />
  </svg>
);
