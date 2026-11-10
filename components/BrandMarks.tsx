/*
  Brand marks — Instagram, TikTok, Telegram, YouTube.

  Not icons: they are other companies' logos, so they are drawn as assets and
  kept out of the icon set (I1). Lucide has Instagram and Youtube but neither
  Telegram nor TikTok, and a social row drawn from two sources looks like it.
  They take their size from the caller like a lucide icon does, inherit
  `currentColor`, and are hidden from assistive tech — the link around each one
  carries the name.
*/
type MarkProps = { className?: string };

export function InstagramMark({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" />
    </svg>
  );
}

export function TikTokMark({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path
        d="M13.4 3h2.3c.2 1.7 1.2 3.1 2.9 3.5v2.3c-1.1-.05-2.1-.4-3-1v5.9a5.1 5.1 0 1 1-5.1-5.1c.3 0 .5 0 .8.05v2.4a2.7 2.7 0 1 0 1.9 2.6V3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TelegramMark({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path
        d="M21 4.4 2.9 11.2l5.3 1.8 1.3 5.2 2.9-3 4.1 3.1L21 4.4Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="m8.2 13 9.4-6.6-6.1 7.9" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export function YouTubeMark({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10.5 9.5l5 2.5-5 2.5v-5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
