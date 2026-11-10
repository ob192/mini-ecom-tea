import { InstagramMark, TikTokMark } from '@/components/BrandMarks';
import { ContactLink } from './Analytics';
import { INSTAGRAM_URL, TIKTOK_URL } from '@/lib/contacts';

/*
  JoinFamily — the `Join Family` band of the home screen: a paper-deep strip
  with a centred heading, one line of copy and an outlined green button.

  The design labels it "ПРИЄДНУЙТЕСЬ ДО РОДИНИ" with a newsletter feel, but
  there is no mailing list behind it — so the buttons go to the social accounts
  that do exist, through ContactLink, which reports each click as a
  `contact_click` carrying its own channel. The design draws one button; there
  are two accounts, so they share the row and each is labelled, rather than one
  «Стежити» that silently picks a winner.
*/
const FOLLOW_BUTTON =
  'inline-flex items-center gap-2 rounded-md px-7 py-[13px] text-xs uppercase text-primary shadow-[inset_0_0_0_1px_var(--green)] transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

export function JoinFamily() {
  return (
    <section className="bg-subtle py-16">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-5 text-center lg:px-8">
        <h2 className="m-0 text-[26px] font-semibold uppercase text-foreground">
          Приєднуйтесь до родини
        </h2>
        <p className="m-0 max-w-[52ch] text-base text-muted-foreground">
          Живі фото чаю, анонси нових надходжень і чайні поради.
        </p>
        <div className="mt-1 flex flex-wrap items-center justify-center gap-3">
          <ContactLink
            channel="instagram"
            location="home_join"
            href={INSTAGRAM_URL}
            className={FOLLOW_BUTTON}
          >
            <InstagramMark className="size-4" aria-hidden />
            Instagram
          </ContactLink>
          <ContactLink
            channel="tiktok"
            location="home_join"
            href={TIKTOK_URL}
            className={FOLLOW_BUTTON}
          >
            <TikTokMark className="size-4" aria-hidden />
            TikTok
          </ContactLink>
        </div>
      </div>
    </section>
  );
}
