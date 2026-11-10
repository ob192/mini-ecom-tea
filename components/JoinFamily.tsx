import { InstagramMark, TikTokMark } from '@/components/BrandMarks';
import { Button } from '@/components/ui/button';
import { ContactLink } from './Analytics';
import { INSTAGRAM_URL, TIKTOK_URL } from '@/lib/contacts';

/*
  JoinFamily — a quiet strip with a centred heading, one line of copy and the
  two social accounts.

  The design labels it «Приєднуйтесь до родини» with a newsletter feel, but
  there is no mailing list behind it — so the buttons go to the accounts that do
  exist, through ContactLink, which reports each click as a `contact_click`
  carrying its own channel. The design draws one button; there are two accounts,
  so they share the row and each is labelled, rather than one «Стежити» that
  silently picks a winner.

  Both are `outline`: neither is the page's main action, and a section gets one
  primary at most (L12).
*/
export function JoinFamily() {
  return (
    <section className="bg-subtle py-16 md:py-20">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold text-balance sm:text-3xl">
          Приєднуйтесь до родини
        </h2>
        <p className="max-w-prose text-base text-muted-foreground text-pretty">
          Живі фото чаю, анонси нових надходжень і чайні поради.
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Button asChild variant="outline">
            <ContactLink channel="instagram" location="home_join" href={INSTAGRAM_URL}>
              <InstagramMark className="size-4" />
              Instagram
            </ContactLink>
          </Button>
          <Button asChild variant="outline">
            <ContactLink channel="tiktok" location="home_join" href={TIKTOK_URL}>
              <TikTokMark className="size-4" />
              TikTok
            </ContactLink>
          </Button>
        </div>
      </div>
    </section>
  );
}
