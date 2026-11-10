import { notFound } from 'next/navigation';

/*
  The playground exists only in development. Called first in every playground
  page, so its content is never rendered in a production build.

  On its own this is *not* enough, and the measurements are worth keeping:
  `notFound()` here renders the 404 markup, but the playground layout has
  already begun streaming by then, so the response stays at HTTP 200 with a 404
  page in the body. Tried from the layout instead, and with the route both
  static and `force-dynamic`: 200 every time, while `/nope` returned a real 404.
  What produces the status is the `beforeFiles` rewrite in next.config.mjs.
*/
export function devOnly() {
  if (process.env.NODE_ENV === 'production') notFound();
}
