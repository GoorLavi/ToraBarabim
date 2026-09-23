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
| [תורה ברבים · פאנל ניהול](https://www.figma.com/design/z4fVzRjRFwYpLae22BmNKy/) | The admin screens, the weekly import flow, and every panel: the shared login, the place panel and the rabbi panel |
| [תורה ברבים · פאנל הרב](https://www.figma.com/design/A3Q2jWyeHFvjqgdcMKmKB8/) | Still empty. The rabbi panel was drawn in the panel file above instead, since it shares a login with the place panel and splitting the two would have split one screen across two files |
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
| `09 צור קשר` | Contact, at 390 and 320 and desktop. It loads nothing, so it has no loading, empty or error state |
| `10 כל הערים` | The cities index, with loading, board empty, error and a long-name stress frame |
| `11 שיעורים` | The lessons listing. Eight frames, because `renderContent` resolves to that many distinct screens |
| `12 מקום` | A place's page, including both empty widenings, a detail error, a lessons error and the 404 branch |
| `13 כל המקומות` | The places directory, including search with and without results |
| `14 אזור` | An area's lessons |
| `99 Components` | The 29 shared components. **Nothing instances them:** every page is built from raw nodes |
| `99 כרטיס השיעור · כל המצבים` | Every lesson card state, side by side |

## The admin file, page by page

| Page | Screen |
|---|---|
| `01 מסכי ניהול` | The admin lists and forms: lessons, rabbis, places, exceptions, sign-in |
| `02 ייבוא שבועי` | The weekly import flow: upload, preview, changed-since, result, duplicate-name resolution. A design ahead of the code: the admin panel has no import tab yet |
| `03 צפייה בשיעור וברב בפאנל הניהול` | The view-first lesson and rabbi screens, with their loading, empty and error states. Drawn from the shipped screens, because the draft they started from had fallen behind the code |
| `04 פאנל הניהול: מקומות` | The places list, the place record, and the place form with every state of its sign-in section |
| `05 כניסה משותפת ופאנלים` | The shared rabbi-and-place login, the three place-panel screens, and the four rabbi-panel screens |

`01 מסכי ניהול` is behind the code: desktop 1440 only, with a separate admin sign-in
that the shared login on `05` has replaced, and none of the mobile-first panel that
ships. Read it as history until someone redraws it.

## The language file, page by page

| Page | Holds |
|---|---|
| `01 לוגו וסמל` | The mark, the lockup, and the checks at header and icon sizes |
| `02 תמונות שיתוף` | The share images, square and wide, each on a dark and a light background |
| `03 טוקנים` | The token board. Behind the code; see Known gaps |

## Components are in the site file, and nothing instances them

**Every page in the site file is built from raw nodes, not component instances.** The
components page is a specification to build against, not a source the screens depend
on, so editing a component there changes nothing on any screen. Checked across the
whole file: zero instances. Match that when you add a page, rather than introducing a
second shape.

The file name says otherwise, so this is worth stating too: the 29 components live on
`99 Components` **inside the site file**, because instances can only reference
components in the same file unless that file is published as a library, and publishing
is a manual step the owner has to repeat after every change. They move to
`שפה ורכיבים` the day the admin or rabbi file needs them, and that day someone
publishes it.

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
| `תורה ברבים - מקומות וכניסה משותפת` | The places and shared-login round, written beside the panel file rather than inside it. Rebuilt from the shipped code into the site file's `12` and `13` and the panel file's `04` and `05`; nothing here is unique any more |

## Work in progress elsewhere

Current work that is not part of the map yet, so nobody mistakes it for archive or
tidies it away:

- **`הקדשות · אזור בדיקה`**, a page at the end of the site file.

Each folds into the numbered structure when its change ships.

## Known gaps, on purpose

- **The token board is behind the code.** It shows three palettes where the product
  ships one, and 13 tokens of 17. Code wins, per CLAUDE.md; the board needs an editing
  pass.
- **The colours on migrated pages are raw, not bound to variables.** One binding pass
  closes this, and closes the missing `color/scrim` with it.
- **The pinned filter bar has no design.** The code renders the filter fields twice, once
  in flow and once in a bar that sticks on scroll below `lg`. Figma has one header.
