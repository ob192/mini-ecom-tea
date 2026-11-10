---
paths:
  - "src/**/*.{tsx,jsx}"
---

# Design rules: Feedback

Messages to the user: inline message, alert, toast, banner, confirmation. The states a view can be in belong to [states.md](states.md).

## Before writing

- The message primitives in `src/shared/components/ui` and `package.json`: `Alert`, a toast (`sonner`), `AlertDialog`, `Progress`, and where the toaster is mounted. A missing one is built once as a primitive; propose it to the user first.
- DESIGN.md: Voice, Do's and Don'ts.
- List every event in the target that should tell the user something (success, failure, warning, destructive action, long operation), pick its channel by FB1, and write its copy in the site's language and voice. Every event has a channel and copy, or is deliberately silent.

## How to check

For each event: channel, anatomy, copy and announcement. When the page runs, trigger the events you safely can.

**Severity here:** P0 a message users miss or cannot act on (an error only in a vanishing toast, not announced, a destructive action without confirmation or undo); P1 wrong channel, anatomy or copy; P2 polish.

Component names are shadcn's.

## Channel

**FB1 · P1 — The channel fits scope and urgency.**

| Event | Channel |
|---|---|
| About one field or one block, while the user is there | inline message next to it |
| A whole form failed to send | message inside the form, next to the submit button (`Alert` when it needs a title or action) |
| Context the page needs to keep showing (a notice, a limit, a partial failure) | `Alert` in the page |
| An action finished and its result is not visible on screen | toast |
| Something about the whole site or account (maintenance, unpaid plan) | banner at the top |
| The user must decide before continuing (destructive or irreversible) | `AlertDialog` |
| A long operation | progress in place |

**FB2 · P0 — Errors stay until resolved.** An error the user must act on never lives only in a toast that disappears: it stays inline or in an `Alert` until fixed. A toast may echo it.

**FB3 · P1 — Do not over-notify.** No toast for a result already visible on screen; no success message for every autosave (a quiet "Saved" by the field instead); one message per event, not one per layer.

## Anatomy

**FB4 · P1 — Alerts are structured.** Icon, title, description, optional action; the variant matches the status and uses the status surface DESIGN.md defines (`-subtle` with its foreground, or `variant="destructive"` in stock shadcn) — shadcn `Alert`, `AlertTitle`, `AlertDescription` or the project's equivalent primitive, not a custom div per use.

**FB5 · P1 — Toasts are short and controllable.** One line plus an optional action; auto-dismiss after 4–6s (longer with an action), paused on hover and focus, dismissible; one position for the whole site, clear of primary navigation and the mobile bottom bar; at most three stacked. Use the project's toast library.

**FB6 · P1 — Banners don't shove content.** A banner reserves its space from the first render or overlays without moving the page; it is dismissible unless critical, and the dismissal is remembered.

**FB7 · P2 — Counters are bounded.** Unread badges show up to "99+" and carry the full count in `aria-label`.

## Confirmation and progress

**FB8 · P0 — Destructive actions are confirmed or undoable.** Irreversible actions open an `AlertDialog` whose confirm button names the action ("Delete booking") in the destructive variant, with focus starting on Cancel. A reversible action may skip the dialog and offer Undo in a toast instead.

**FB9 · P2 — Long operations show progress.** A determinate bar when the total is known, steps when there are steps, and the rest of the UI stays usable when it can.

## Copy and accessibility

**FB10 · P1 — Messages say what happened and what to do.** Specific ("Card declined — try another card"), never generic ("An error occurred"), never blaming; consistent voice and terms; in the site's language; with real names and numbers. This covers every message, field errors included.

**FB11 · P0 — Messages are announced, focus is never lost.** Toasts and status updates go to a polite live region (`role="status"`) that exists before its content changes — a region mounted together with its text is announced unreliably; errors that appear after an action use `role="alert"`. Focus moves into dialogs, and to the replacing content (its heading, `tabIndex={-1}`) when the focused element disappears, as when a form becomes its confirmation; never for toasts.

**FB12 · P1 — Each cause gets its message.** Failures that need different actions get different messages: invalid input, a rate limit ("Too many requests — try again in 10 minutes"), lost connection, a timeout, a server error. Contact details in a message are links (`tel:`, `mailto:`).
