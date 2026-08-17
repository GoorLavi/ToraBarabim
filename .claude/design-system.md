# ToraBarabim Design System

The rules below split into two kinds. **Settled** rules hold no matter what the site
ends up looking like. **Open** decisions have not been made yet: the designer
(`tora-designer`) sets them at the first design pass, the human ratifies, and they get
written down here. Do not invent a value for an open decision and treat it as a token.

Once the code has real tokens, the code is the source of truth and this file is the
human-readable mirror. Keep the two in sync. **The client does not exist yet, so for now
this file is the only record of the ratified values.** The moment the styled-components
themes land, those themes become canonical and this file follows them.

## Settled

### Hebrew and right-to-left
The site is Hebrew only. The page renders `direction: rtl`. Use CSS logical
properties everywhere in layout.

```css
/* Good */ .row { text-align: start; padding-inline: 16px; border-inline-start: 1px solid var(--border); }
/* Bad  */ .row { text-align: left;  padding-left: 16px;  border-left: 1px solid #e0e0e0; }
```

Copy is written natively in Hebrew, never translated from English. Dates, times, and
numbers are formatted the way an Israeli reader expects them.

Two traps that have already bitten this design, both worth knowing before writing
layout code:

- **A number at a line break flips.** A house number inside a long Hebrew address can
  render on the wrong side once the address wraps. Structure the data rather than
  relying on the bidi algorithm to sort it out: give an address its own line and never
  let it wrap mid-address.
- **Text that came from the server gets `dir='auto'`**, per `client/CLAUDE.md`. A Latin
  word or a numeral inside a Hebrew string lands on the wrong side without it.

### Mobile first
Most people will find this site on a phone, often while out. Design the narrow screen
first and let it grow. Tap targets are thumb-sized, never mouse-sized: minimum 48 by 48,
with at least 8px between adjacent targets.

**This one has no exemption.** If a Figma frame and this rule disagree about a tap
target, the rule wins and the frame is a defect to fix, not a precedent to copy into
code.

**A target is not as tall as its text.** This is the assumption that caused the only
systemic defect found so far: chips drawn at 40 and every text link on the site left at
22, the height of its own line box. A text link reaches 48 through vertical padding on
the anchor itself, never through a larger font, a taller line-height, or a bare line of
text that happens to sit in a roomy row. Section-head links and footer links are links,
and they are the ones that get forgotten.

### Layout must survive real data
Every layout is tested against a long rabbi name, a long place name, a missing photo,
and a lesson with almost no detail filled in. Fixed widths that only fit the sample
data are a defect.

**A lesson card carries the city, not the full address.** Venue name and street belong
on the lesson page, where they have room and where someone who has already decided to
go will look for them. A full address inside a grid cell wraps to three lines and leaves
a ragged bottom edge across the row, and it is detail nobody needs while scanning.

### The poster image
Every rabbi has one and it is required, so it is structural rather than decorative.

**Aspect ratio 2:3, portrait.** This is not negotiable downstream: the public card is
built at 2:3, so any other ratio arrives cropped or padded. Minimum 800 by 1200. JPG or
PNG, up to 5MB. The admin form offers a vertical crop control, because a portrait
photograph is usually taller than the frame and the face has to survive the crop.

The poster belongs to the rabbi. A per-lesson override is deliberately **not** in the
first version: every lesson already has an image through its rabbi, and the override
would add an upload, a crop, a storage path and a second failure mode to the most-used
form in the panel, for a case nobody has confirmed exists.

### Place: the city is the unit, and there is no distance
**Nothing in the product displays a distance**, because nothing can compute one. There
is no geolocation, no permission prompt, no radius, and no sorting by proximity. The
person chooses a city from the chip in the header, and the city is how place is
expressed everywhere: on cards, in section headings, and in empty states.

This is a capability limit, not a design preference. If distance ever becomes possible
it is an addition to be designed then, so do not reserve space for it, do not leave a
slot where it would go, and do not write copy that implies it.

### Every data screen has three states
Loading, empty, and error: each designed, not an afterthought. The empty state
carries the most weight on this site: someone searched for a lesson near them and
found none, and the screen has to help rather than dead-end.

The ratified empty state does not stay empty. It names the constraint that produced no
results, then widens the search itself along the one axis available and shows real
lessons, rather than handing back a list of buttons. A screen that only announces
failure is not finished.

On the home page that axis is the date: no lessons in this city tonight becomes lessons
in this city on the next day that has any. When even that is empty, the screen says so
in a designed way and still shows real lessons below it, so the person is never left
looking at nothing.

### Feel
Warm and trustworthy, quietly modern. Generous type, calm color, plenty of breathing
room. The audience spans a wide range of ages and comfort with technology, and the
subject deserves dignity. Not sterile-corporate, not kitsch, not flashy. No heavy
animation.

Carousels and any other moving element are driven by the person, never on a timer.
Arrows and dots are fine. A slide that advances by itself is not.

### Audience wording
A lesson's audience is one of exactly three values, written exactly this way:

- `גברים`
- `נשים`
- `גם גברים וגם נשים`

**The word `מעורב` never appears in this product**, not in the interface, not in admin
screens, not as a stored data value, not in help text. In a religious Jewish context it
means men and women together without separation, which is the opposite of what a lesson
open to both actually is. Getting this wrong is not a copy nit; it tells the reader we
do not know who they are.

The word `בהפרדה` is also not used. The three values above already carry that meaning
for this audience, and appending it is redundant.

**Audience is required.** The admin schema is an enum with no empty case, so a lesson
without an audience cannot exist and no surface needs to render one. An earlier version
of this section described a hide-when-empty behaviour; the implementation settled the
question the other way and this file follows the code.

### Themes and the token contract
Three color themes ship together as styled-components themes, so they can be compared
in the running app. **`ארגמן וזהב` is the default.**

Two rules bind every theme, and they are the reason three can coexist safely:

1. **Identical token names across all three themes.** Same keys, same semantic meaning,
   only the values differ. No token may exist in one theme and not another. A component
   that reaches for a token present in only one theme breaks silently the moment someone
   switches, and nobody notices for a month.
2. **Tokens are named for their role, never for their color.** `color.primary`, never
   `color.plum`. `color.accent`, never `color.gold`. A color word inside a token name is
   a bug, because the next theme makes it a lie.

Type, spacing, radii, shadows and breakpoints are shared by all three themes. Only color
varies.

### Color: the token set
Thirteen color tokens. Every theme defines all thirteen.

| Token | Role |
|---|---|
| `color.bg` | Page background |
| `color.surface` | Cards, fields, anything sitting on the page background |
| `color.primary` | Primary buttons, links, the header band, the date medallion |
| `color.primaryStrong` | Hover and pressed state of anything using `primary` |
| `color.primarySoft` | Tinted background: quiet bands, inactive chips, avatar fallbacks |
| `color.accent` | Time and date graphics, large numerals. See the contrast rule below |
| `color.accentSoft` | Tinted background in accent contexts |
| `color.accentOnDark` | The accent, lightened for use on a `primary` or `primaryStrong` field |
| `color.text` | Primary text |
| `color.textSecondary` | Secondary text: city, supporting lines |
| `color.textOnPrimary` | Text sitting on a `primary` fill |
| `color.border` | Hairlines, card and field outlines |
| `color.danger` | Error text. Text only, never a fill |

**Contrast rule for `accent`.** In some themes the accent does not reach 4.5:1 against
`surface`, so it is reserved for graphic elements and large numerals and is never used
for body-size text. The default theme is the case that forces this: `#B8862B` on white
is 3.24:1, which is fine for the large time in a date medallion and wrong for a 14px
label.

Where the accent has to appear on a dark field, use `accentOnDark`. It is tuned per
theme to clear 3:1 against that theme's `primary`.

### Color: theme `ארגמן וזהב` (default)
Ceremonial and dignified. Deep plum and gold on a warm neutral, closest to a book
binding or a parochet.

| Token | Value |
|---|---|
| `color.bg` | `#F7F4F3` |
| `color.surface` | `#FFFFFF` |
| `color.primary` | `#6B2436` |
| `color.primaryStrong` | `#521827` |
| `color.primarySoft` | `#F2E7EA` |
| `color.accent` | `#B8862B` |
| `color.accentSoft` | `#F9EFDC` |
| `color.accentOnDark` | `#E0B45E` |
| `color.text` | `#201B1D` |
| `color.textSecondary` | `#6B6165` |
| `color.textOnPrimary` | `#FFFFFF` |
| `color.border` | `#E6DEDF` |
| `color.danger` | `#A32A22` |

### Color: theme `אבן וזית`
Local and grounded. Jerusalem limestone, olive green, terracotta.

| Token | Value |
|---|---|
| `color.bg` | `#F5F2EC` |
| `color.surface` | `#FFFFFF` |
| `color.primary` | `#3D5A45` |
| `color.primaryStrong` | `#2E4534` |
| `color.primarySoft` | `#E8EDE7` |
| `color.accent` | `#B4552F` |
| `color.accentSoft` | `#F7E9E1` |
| `color.accentOnDark` | `#EAA983` |
| `color.text` | `#22201C` |
| `color.textSecondary` | `#6E6A62` |
| `color.textOnPrimary` | `#FFFFFF` |
| `color.border` | `#E3DED3` |
| `color.danger` | `#9B2C22` |

### Color: theme `אבן ותכלת`
Clear and civic. A single hue: cool grey ground, slate, tekhelet. No second color
anywhere.

| Token | Value |
|---|---|
| `color.bg` | `#F3F5F7` |
| `color.surface` | `#FFFFFF` |
| `color.primary` | `#2E4057` |
| `color.primaryStrong` | `#223146` |
| `color.primarySoft` | `#E6EBF1` |
| `color.accent` | `#1A6FBB` |
| `color.accentSoft` | `#E2EEF9` |
| `color.accentOnDark` | `#7FB8E8` |
| `color.text` | `#1A1F26` |
| `color.textSecondary` | `#616B76` |
| `color.textOnPrimary` | `#FFFFFF` |
| `color.border` | `#DCE2E8` |
| `color.danger` | `#A32A22` |

### Type
**Assistant**, confirmed present in Figma with the three weights the design uses. It was
drawn for Hebrew rather than derived from a Latin family, and its open letterforms stay
readable at small sizes and for older readers.

Weights in use: **400** body, **600** card titles, names and times, **700** page and
section headings. The family also carries ExtraLight, Light, and ExtraBold. Those are
not used: the thin weights fail this audience.

In the Figma font list the style strings have no space: `Regular`, `SemiBold`, `Bold`.
Verify style names with `listAvailableFontsAsync` rather than guessing.

| Role | Phone | Desktop | Weight |
|---|---|---|---|
| Page heading | 28 / 36 | 40 / 48 | 700 |
| Section heading | 20 / 28 | 24 / 32 | 700 |
| Card title | 18 / 26 | 18 / 26 | 600 |
| Time in a card | 20 / 24 | 20 / 24 | 600 |
| Body | 17 / 26 | 17 / 26 | 400 |
| Secondary | 15 / 22 | 15 / 22 | 400 |
| Tag and caption | 14 / 20 | 14 / 20 | 600 |

Body is 17 and not 16 deliberately: the audience spans a wide age range and reads this
outdoors. **No text anywhere goes below 14, with exactly one exemption.**

The exemption is the small line inside the date medallion, which is 12 / 16. It is named
here rather than left as drift, and it is bounded on purpose: it applies only where the
line sits directly above the time at 20px or larger, and only where it names a day the
list heading has usually already stated. It is the least load-bearing text on the card.
**Do not cite this exemption anywhere else.** Any other request to go below 14 is a
signal that something needs less text, not smaller text.

In a two-column poster grid on a phone the card is roughly 173px wide, and the card
title steps down to 15 / 21 with its supporting lines at 14 / 20. That is the floor, not
a licence to shrink further.

### Spacing
Base 4.

`xs 4`, `sm 8`, `md 12`, `lg 16`, `xl 24`, `xxl 32`, `xxxl 48`, `section 64`

Screen side gutter is `lg` (16) on a phone and `xl` (24) from 768 up. Vertical space
between home page sections is `section` (64) on a phone and 80 on desktop.

### Radii
Four values, and no others.

`sm 8` tags and small blocks, `md 12` fields and buttons, `lg 16` cards, `pill 999`
chips and avatars.

### Shadows
Two. The shadow color is a near-black at low alpha and does not change per theme,
because a tinted shadow reads as a smudge.

- `shadow.card`: `0 1px 2px rgba(28,26,23,0.04), 0 1px 3px rgba(28,26,23,0.06)`
- `shadow.raised`: `0 4px 16px rgba(28,26,23,0.10)`, for the sticky search bar only

Separation is carried mainly by `color.border` and by `surface` against `bg`, not by
shadow.

### Breakpoints and content width
Min-width, narrow to wide: `sm 480`, `md 768`, `lg 1024`, `xl 1280`.

**Maximum content width 1120px.** Blocks of running text cap at 640px so a line never
gets uncomfortable to read.

Lesson cards are two columns on a phone, and three at the 1120 content width. Not four:
at four the cells fall to roughly 262px and a long rabbi name wraps in every other cell.
Four columns only above 1280.

## Open (not decided yet)

- **Who maintains the list of cities.** The city an admin picks must come from a fixed
  list, never free text, or one admin typing `ת״א` once splits a city in two and the
  public filter degrades quietly. The list starts as a curated constant in code. Who
  edits it, and how a new city gets added, is not decided.
- **Iconography.** Icons are drawn ad hoc per screen today. No set, no stroke weight, and
  no source has been chosen.
- **The wordmark.** `תורה ברבים` is set type with no mark. Whether it stays that way is
  undecided.
- **An audience filter on the home page.** Deliberately deferred: the tag on the card
  does the work for now. If most lessons in a given area turn out to be for one audience,
  this decision is wrong and needs revisiting.

Decided against, so not open and not to be reopened casually:

- **Dark mode.** One theme set, done properly, first.
- **A topic browse axis on the home page.** The admin entering lessons does not
  necessarily know the topic. Worth adding once the data supports it.
- **A public add-a-lesson form.** Only an admin or a rabbi adds a lesson, and an admin
  adds it to a specific rabbi. So the home page carries no add-a-lesson link and no admin
  door. Visitors who want a lesson listed are pointed at `כתבו לנו`.
- **A featured slot at the top of the home page.** Designed in three shapes, then
  dropped: the poster grid already supplies the visual richness the slot existed to
  compensate for back when the design assumed there were no images. Revisit only if the
  page proves flat in the running app.
When one of these is settled, move it up into **Settled** with its actual value and say
where it lives in code.

## Settled at the first home-page build (2026-08-14)

Three real corrections from the human after seeing the first implementation. Each
overrides an earlier guess; the guess is not restated here, only the ratified answer.

### Rabbi image fallback
A lesson can in future carry its own photo, distinct from the rabbi's (not in the wire
types yet: a follow-up for `common`, not built today). Until then, and whenever a lesson
has no image of its own, the card shows the rabbi's photo. **If the rabbi has no photo
either, the card shows a plain, soft placeholder background: no icon, no initials, no
silhouette.** This replaces an earlier, stricter design-doc entry that assumed the admin
form would always require a photo and so no fallback should exist at all. That entry was
wrong; a rabbi without a photo is a real state the product must render, calmly.

### No default city
A first-time visitor sees lessons across **all areas**, not one default city. There is
no geolocation and no assumed home city, so the honest starting state is unfiltered. The
city picker narrows from there. Do not pick a placeholder city (Jerusalem, Petah Tikva,
or otherwise) to make the header look populated on first load.

### Date chips collapse to three
`עכשיו` and `הערב` are the same day and do not need to be two chips. The row is
**`היום` / `מחר` / `בשבת`**, plus the calendar button for any other date. `היום` shows
the whole day, not only what has not started yet.
