# Admin panel: polish and completion brief

Hand this to a fresh session. It is self contained. The work is all in the admin panel
under `client/src/AdminPanel/`, plus two small pieces of scope that were deferred rather
than skipped.

Start by reading `CLAUDE.md`, `client/CLAUDE.md`, `.claude/design-system.md`,
`docs/product.md`, and `docs/decisions/0007-admin-panel-lives-in-the-same-app.md`. That
decision makes the panel deliberately phone AND desktop, both first class.

## Context you need

The panel was built, reviewed on the rendered screens, and had thirteen genuinely broken
things fixed. What is left is polish, plus three items the project owner approved and
then moved into this chunk of work. The panel currently manages lessons and rabbis.

**Nothing here is guesswork.** Every item was seen on a real screen or read off the
source, and each names its cause. Do not re-litigate whether they are real.

**Verification is by hand.** There are no automated tests, deliberately: see
`docs/decisions/0008-no-automated-tests-yet.md`. "It works" means it type checks, it
runs, and someone exercised the path in a browser. Nothing less counts, and a screenshot
proves the design is right, never that the code is correct.

**A warning from this project's own history.** Three separate agents verified the write
endpoints with `curl` and all reported success. Every one of them was wrong in the same
way: `curl` does not send a CORS preflight, so nobody noticed the browser was refusing
every edit and delete in the panel. The project owner found it in minutes of real use.
**Exercise the real screens in a real browser.** Do not accept a passing type check or a
passing `curl` as evidence about anything a person does in a browser.

## Scope, in priority order

### A. Three things the owner approved, which are not polish

**A1. Neither list can be paged.** Both the lessons and the rabbis list fetch one page of
50 rows and there is no next control. Past 50, the rest are unreachable and therefore
uneditable. The API already returns `page`, `pageSize`, and `total` on every list
response, so this is client work only.

**A2. There is no way to manage places.** A place is a synagogue, yeshiva, or kollel with
a name, an address, and a city. Today a place can only be created from inside the lesson
form, and after that nothing can touch it again: a typo in a synagogue's name is
permanent and shows on every lesson held there, a venue that moves needs a new record
and every lesson moved across by hand, and the same synagogue entered twice cannot be
merged.

Build a places screen: **list, edit, delete. No create.** Creation already happens in the
right place, inside the lesson form, and a second entry point would produce duplicates.
The API exists: `GET/PATCH/DELETE /v1/admin/places`, plus
`GET /v1/admin/places/:id/delete-preview`.

Deleting a place cascades to its lessons and their exceptions. Read
`docs/decisions/0004-deleting-cascades-deliberately.md` before you build that screen. The
UI must call the preview endpoint and show the real counts, "this will also delete 14
lessons", before it asks for confirmation. A confirm dialog that does not say what will
be destroyed defeats the only guard standing in front of permanent data loss.

**A3. Cancelling a single date has no screen.** The API supports lesson exceptions
(cancel one date, or move its time, place, or speaker) at
`/v1/admin/lessons/:lessonId/exceptions`. The owner was explicit about the shape: **this
belongs inside the lesson's own screen, not in a separate "exceptions" section.** Open a
lesson, see its upcoming dates, cancel one. A standalone screen would force you to pick a
lesson from a list to reach exactly the same place.

### B. The design system needs an error colour

Error text in the panel currently sits on `accentSoft`, a gold cream, because there is
nothing else. It reads as a notice, not a failure. The owner approved adding a real error
colour: one new token across all three themes in `.claude/design-system.md`, then use it
wherever the panel reports a failure. Code is the source of truth for tokens and the
design system file mirrors it, so change both together.

### C. The polish list, from the design review

Ordered by how much each one hurts. Every one names its cause.

1. **Every button-shaped link is underlined.** `GlobalStyle.ts` never touches `a`, and no
   admin style sets `text-decoration`. So the primary "add lesson" pill, the active
   header tab, "edit", "new lesson", "cancel", and the breadcrumb all carry the browser
   default underline. **This is the single thing that makes the panel read as a bolted
   on tool rather than the same product as the public site.** Remove it from
   button-shaped and tab-shaped links; keep it on true inline text links.

2. **There is no focus style anywhere except the login inputs.** One `:focus` exists in
   the whole panel. Every field, pill, chip, tab and button falls back to the browser
   ring, which is nearly invisible on the maroon filled buttons and the filled weekday
   circles. This is data entry and keyboard use is normal. Add one shared
   `:focus-visible` treatment, and a variant for controls sitting on the primary header
   band.

3. **The primary action loses the fight in both form footers, on phone.** The footer is a
   wrapping flex ordered cancel, save-and-add-another, save. The long secondary label
   takes the first line alone, so the filled primary button lands on the second line
   below a secondary action, and cancel is the first thing at the start edge. On phone,
   stack it: primary full width first, secondary below, cancel last as a plain centred
   text link. Keep the horizontal row from `md` up with the primary at the inline start.

4. **Seven weekday circles wrap six plus one at 375px**, orphaning the last day on its
   own line so the week stops reading as a week. Use a seven column grid so it is always
   one line, with a minimum block size of 48px so the tap target survives.

5. **On the lessons list the filter is invisible while the empty state blames it.** On
   phone the bar collapses to a chip reading "filter, 1" and the empty panel says to
   narrow or clear the filter, but nothing on screen says what the filter is. Show the
   active filters as removable chips, and name the term in the empty state.

6. **Both the card and the table drop the venue name**, showing only the city. The design
   system's city-only rule is written for the public lesson card, where it is about
   scanning. An admin looking for one of three lessons by the same rabbi in Bnei Brak
   needs the venue. Add the place name as a secondary line.

7. **Hebrew plurals break at one.** "1 שיעורים" on the rabbi card and in the rabbi
   picker, and "1 רבנים במערכת" will do the same. Use singular forms.

8. **On phone the preview card sits above the form on both forms.** The admin scrolls
   past a 500px mostly empty preview to reach the first field, then back up to check it.
   On phone put the form first and the preview after the last section. Keep the
   side-by-side sticky layout from `lg` up.

9. **The two forms disagree about where the page heading lives.** The rabbi form puts it
   inside the white card at section size; the lesson form puts it outside at page size.
   Pick the lesson form's arrangement for both.

10. **The audience field now says the same thing twice.** After a recent fix it shows both
    the error "יש לבחור קהל יעד" and the helper "יש לבחור אחת מהאפשרויות." directly
    beneath it. Keep one.

11. **The rabbi search subheading still reports a count during a search.** Searching for
    something with no matches shows the correct empty state but the subheading above it
    still reads "0 רבנים במערכת", which is false: there are twelve. Suppress or reword
    the count while a search term is active.

12. **Smaller ones.** The back link bakes an arrow into the string, and bidi drops that
    neutral glyph at the visual left end where it points away from its own label: render
    it as a separate element at the inline start. The login submit uses `radii.md` while
    every other primary button uses `radii.pill`. The loading skeletons are static
    60% opacity blocks that read as broken on a slow request; a slow opacity pulse is
    within the no-heavy-animation rule. Between 768 and 1023, a touch tablet width, the
    desktop "edit" link is a 26px tap target with no minimum block size. A long rabbi
    name wraps to two lines and misaligns the action buttons across its grid row.

## What was never reviewed, and needs to be

- **The login screen was never seen rendered.** The reviewer arrived with a live session
  and could not log out. Everything known about it came from reading the source.
- **Desktop above 800px was never seen.** The review tool reported 800 CSS pixels
  whatever it was asked for, so the 1120 content cap, the `lg` form split, and the `xl`
  four column grid are all unreviewed.
- **Loading and error states were judged from structure only**, everywhere. Only the
  empty states were seen on screen.

## Hard boundaries

- **Do not change anything under `server/`, `common/`, `infra/`, or the public
  `HomePage` components.** This work is the admin panel and the design system tokens.
- **Never stage or commit** without the owner asking, each time.
- **Hebrew is written natively, never translated.** Never write `מעורב` for a mixed
  audience: the three values are `גברים`, `נשים`, `גם גברים וגם נשים`.
- Code, comments, and file names in English. No em-dash characters anywhere.
- Read `.claude/README.md` for which documents each agent reads, and `CLAUDE.md` for when
  a choice earns a decision record. **Specialist agents never write a decision record**:
  flag it and let the owner decide.
