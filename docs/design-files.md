# Where the designs live

Which Figma file holds which screen. Without this, the only way to find a design was to
open ten files and guess which was current, and for a month that is what happened: the
same screen existed in three files, each with a different idea of it.

The rules about Figma (which project, who writes, what code is canonical for) are in
[CLAUDE.md](../CLAUDE.md); this page is only the map.

## The four files

Every design belongs to one of four, split by who opens it and when.

| File | Holds |
|---|---|
| [תורה ברבים · האתר](https://www.figma.com/design/eKRaQ4mYDFIOa0IJHhFlXJ/) | Every public screen, one page each, plus the shared components |
| [תורה ברבים · פאנל ניהול](https://www.figma.com/design/z4fVzRjRFwYpLae22BmNKy/) | The admin screens and the weekly import flow |
| [תורה ברבים · פאנל הרב](https://www.figma.com/design/A3Q2jWyeHFvjqgdcMKmKB8/) | The rabbi's own screens. Empty: none are designed yet |
| [תורה ברבים · שפה ורכיבים](https://www.figma.com/design/sLBptV1k2ASbu1vKP0caBz/) | Logo, mark, share images, the token board |

**A page per screen, numbered.** The number orders the list; it means nothing else.

## The site file, page by page

| Page | Screen |
|---|---|
| `01 בית` | Home, with its filtered, empty, loading and error states |
| `02 חיפוש` | Search results, no results, loading, desktop, and the rabbanit name match |
| `03 עיר` | A city's lessons |
| `04 רב` | A rabbi's page, including no photo, a sparse record, loading, empty, error |
| `05 כל הרבנים` | The rabbis index |
| `06 שיעור` | The lesson ticket page as shipped, its details, and the area preview with its loading, empty and failed states. The ticket's own states are on `99 כרטיס השיעור · כל המצבים` |
| `07 אזור הנשים` | `/women`, all six states |
| `08 רשימת רבניות` | `/women/rabbaniyot` |
| `09 צור קשר` | Contact |
| `10 כל הערים` | The cities index |
| `11 שיעורים` | The lessons listing |
| `12 מקום` | A place's page |
| `13 כל המקומות` | The places index |
| `14 אזור` | An area's page |
| `99 Components` | The 29 shared components. Screens are built from instances of these |
| `99 כרטיס השיעור · כל המצבים` | Every lesson card state, side by side |

## The admin file, page by page

| Page | Screen |
|---|---|
| `01 מסכי ניהול` | The admin lists and forms: lessons, rabbis, places, exceptions, sign-in |
| `02 ייבוא שבועי` | The weekly import flow: upload, preview, changed-since, result, duplicate-name resolution. A design ahead of the code: the admin panel has no import tab yet |
| `03 צפייה בשיעור וברב בפאנל הניהול` | The view-first lesson and rabbi screens, with their loading, empty and error states. Drawn from the shipped screens, because the draft they started from had fallen behind the code |

## The language file, page by page

| Page | Holds |
|---|---|
| `01 לוגו וסמל` | The mark, the lockup, and the checks at header and icon sizes |
| `02 תמונות שיתוף` | The share images, square and wide, each on a dark and a light background |
| `03 טוקנים` | The token board. Behind the code; see Known gaps |

## Components are in the site file, not the components file

The name says otherwise, so this is worth stating: the 29 components live on
`99 Components` **inside the site file**, because instances can only reference
components in the same file unless that file is published as a library, and publishing
is a manual step the owner has to repeat after every change. They move to
`שפה ורכיבים` the day the admin or rabbi file needs them, and that day someone
publishes it.

## Two reference widths, which is why reuse keeps failing

The library on `99 Components` is drawn at **375** phone and **1280** desktop. Most
screen pages are drawn at **390** and **1440**. A part drawn for 375 does not drop into
a 390 frame without stretching, so those pages were drawn by hand rather than built
from instances, and an instruction to reuse a component fails there for a reason
nothing on the page shows.

| Drawn at | Pages |
|---|---|
| 375 / 1280, the library's own widths | `07 אזור הנשים`, `08 רשימת רבניות` |
| 390 / 1440 | `01` to `05`, `09`, `10` (`03` adds a 768 frame, `09` a 320 one) |
| 390 / 1280 | `06 שיעור` |
| 390, phone only | `11` to `14` |

`07` and `08` are the only pages built from library instances, and the only two drawn
at the library's widths. `02 חיפוש` is caught between the two: two footer instances
beside seven hand-drawn copies of the same footer.

`01 בית` shows the cost most plainly. Its 42 lesson cards are instances, but of a
second `Lesson card` set sitting loose on that page (`272:70`), built at 171 and 276
because the library's card is 165.5 and 296. Two component sets for one card, one per
width.

**The reference pair is not decided yet.** `tora-designer` recommends 390 phone and
1280 desktop: 390 because the design system's own card cell is measured there, 1280
because it is the content cap. Whichever pair is chosen, the library can be fixed in
one of two ways: rebuilt at those widths, or with its phone parts set to fill their
frame so one variant serves both 375 and 390.

The library and `01 בית` were re-read on 2026-09-24; the other pages' widths come from
a full-file audit on 2026-09-23.

## The archive

These files are the rounds that got us here. Nothing current lives in them, and nothing
new goes into them. They keep their old names, which is how you can tell.

| File | What it kept |
|---|---|
| `Women's area: drafts (2026-09-15)` | Eight rounds of decisions, the cancelled pointer row, the rejected emblems |
| `Lesson page + home polish` | Three rejected direction rounds, the card-as-link study, the home decisions sheet |
| `ToraBarabim / Home` | The first file. Its rabbi and lesson boards lost to the dedicated pages; `Palette directions` lost to ארגמן וזהב |
| `ToraBarabim - Import (drafts)` | The import flow, before it moved to the admin file |
| `ToraBarabim share images (drafts)` | The share images, before they moved |
| `DRAFT - Lesson page: rabbi link + area preview` | The ticket page design, folded into `06 שיעור`, and its "state before the change" boards |
| `ToraBarabim Admin Panel: view-first` | The first view-first draft, which the shipped code overtook. Not the reference for anything |

## Work in progress elsewhere

Current work that is not part of the map yet, so nobody mistakes it for archive or
tidies it away:

- **`תורה ברבים: מקומות וכניסה משותפת`**, a file another change is working in.
- **`01 בית · הקדשות · לאישור`** (`323:488`), beside `01 בית`: the home page with the
  dedication bands drawn at their measured heights, four phone frames and no desktop
  yet. It waits on the owner, and on the width decision above.
- **`הקדשות · אזור בדיקה`** (`123:2`), a page at the end of the site file: the
  dedication masters, the notes for directions F to N with the reasoning for each,
  and an archive section. Those notes are the only place that reasoning is written,
  so deleting the page deletes it.

Each folds into the numbered structure when its change ships.

## Known gaps, on purpose

- **The token board is behind the code.** It shows three palettes where the product
  ships one, and 13 tokens of 17. Code wins, per CLAUDE.md; the board needs an editing
  pass.
- **The colours on migrated pages are raw, not bound to variables.** One binding pass
  closes this, and closes the missing `color/scrim` with it.
- **`01 בית`'s desktop frame ends at the rails.** It holds the header, the context line
  and the rails, and nothing after: no contact band and no footer, though the code
  renders both at every width. No frame on the page shows the women's-area band or a
  dedication band either, though the code renders both.
- **`06 שיעור` has no footer on any frame**, phone or desktop, though every page
  renders one (from the 2026-09-23 audit).
- **The pinned filter bar has no design.** The code renders the filter fields twice, once
  in flow and once in a bar that sticks on scroll below `lg`. Figma has one header.
