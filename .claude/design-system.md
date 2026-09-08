# ToraBarabim Design System

The rules below split into two kinds. **Settled** rules hold no matter what the site
ends up looking like. **Open** decisions have not been made yet: the designer
(`tora-designer`) sets them at the first design pass, the human ratifies, and they get
written down here. Do not invent a value for an open decision and treat it as a token.

Once the code has real tokens, the code is the source of truth and this file is the
human-readable mirror. Keep the two in sync. The styled-components theme in code is
canonical, and this file follows it.

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

**The 8px separation may be carried optically, and only in a grid of identical cells
such as a date picker.** Adjacent day cells touch: the mark that reads as the day is
40px inside a 48px cell, and the 8px lives in that margin. The target is still a full
48 by 48. This bends the separation, never the size, and it does not travel: two
different actions side by side, especially where one of them removes something, still
take a real 8px.

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

**Aspect ratio 3:4, portrait.** This is not negotiable downstream: the public card is
built at 3:4, so any other ratio arrives cropped or padded. Minimum 900 by 1200. This line previously read 800 by 1200, which is 2:3 and
contradicted the 3:4 in the sentence above it. The seed portraits were drawn to 2:3 and
the card rendered 2:3 in consequence, adding a sixth of the card's height on every screen
at every width. The ratio is 3:4 and the card crops to it, which is what the vertical crop
control exists for. JPG or
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

**This applies to the filtered home page**, the mode a person reaches by choosing a
date, a city, or a search term. There the axis is the date: no lessons in this city
tonight becomes lessons in this city on the next day that has any. When even that is
empty, the screen says so in a designed way and still shows real lessons below it, so
the person is never left looking at nothing.

**When the filter is a city or a search term and not a date**, there is no date axis to
widen along. That screen names the constraint and offers the way back instead: an action
that clears the filter and returns to the rows.

**The rows themselves have no empty state.** A row with nothing in it is never sent, so
there is never a heading over an empty rail. The only empty case is a page with no rows
at all, which with no filter applied means the site itself is empty, and it is written
as exactly that.

### Feel
Warm and trustworthy, quietly modern. Generous type, calm color, plenty of breathing
room. The audience spans a wide range of ages and comfort with technology, and the
subject deserves dignity. Not sterile-corporate, not kitsch, not flashy. No heavy
animation.

Carousels and any other moving element are driven by the person, never on a timer.
Arrows and dots are fine. A slide that advances by itself is not.

### The logo
`תורה ברבים` paired with an abstract Beit HaMikdash mark: a flat beam, two solid
columns, an arched entrance, and a base step, fully symmetrical so it needs no mirroring
for RTL. See [0014](../docs/decisions/0014-the-logo-is-a-fixed-mark-not-a-theme-token.md)
for why this shape and not the alternatives explored alongside it.

**The mark is always rendered in fixed brand colors, never the active theme's
tokens.** Structural shapes `#6B2436`, the arched opening `#B8862B`; on a `primary`
field, `#FFFFFF` and `#E0B45E`. It is the one deliberate exception to "tokens are
named for their role, never for their color": comment the exception at the
implementation site so it is not read as a bug and pointed back at the theme.

Geometry on a 100x100 grid: top beam `9,8,82,7`; main beam `3,16,94,11`; columns
`14,30,19,50` and `67,30,19,50`; arched opening `40,38,20,42` with the top corners
radius 10; base `2,85,96,10`. Full spec, sizing, and safe-area guidance live in the
Figma file referenced by 0014.

The mark needs **two cuts, not one asset scaled down**: a hand-tuned 16px favicon cut
(single beam, grid-snapped) for favicon and app-icon sizes, and the general shape above
for the header size and up. At 16px the mark occupies 11px inside the icon tile, not a
smaller fraction. The mark never appears without the wordmark below header size: alone,
it reads as an institution's crest rather than a listings site.

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

### The theme and the token contract
The site ships one color scheme, `ארגמן וזהב`, as a single styled-components theme.

**Tokens are named for their role, never for their color.** `color.primary`, never
`color.plum`. `color.accent`, never `color.gold`. A color word inside a token name is
a bug: it stops meaning the thing it says the moment the value behind it changes.

Type, spacing, radii, shadows and breakpoints live alongside color in the same theme
object. All are tokens, none are raw values in a component.

### Color: the token set
Sixteen color tokens. The theme defines all sixteen.

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
| `color.textOnPrimaryMuted` | Secondary text on a `primary` fill. White at 76%, the on-dark counterpart of `textSecondary` |
| `color.border` | Hairlines, card and field outlines |
| `color.borderOnPrimary` | Hairlines and perforations on a `primary` fill. White at 30% |
| `color.surfaceOnPrimary` | A quiet raised block on a `primary` fill, such as a tag on the lesson ticket. White at 12% |
| `color.danger` | Error text. Text only, never a fill |

**Contrast rule for `accent`.** The accent does not reach 4.5:1 against `surface`, so it
is reserved for graphic elements and large numerals and is never used for body-size text:
`#B8862B` on white is 3.24:1, which is fine for the large time in a date medallion and
wrong for a 14px label.

Where the accent has to appear on a dark field, use `accentOnDark`. It is tuned to clear
3:1 against `primary`.

The three on-primary tokens are alpha over the fill rather than opaque values, so they
hold if `primary` ever changes. They are only valid on a `primary` or `primarySoft`
field; on `surface` they are invisible.

### Color: `ארגמן וזהב`
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
| `color.textOnPrimaryMuted` | `rgba(255, 255, 255, 0.76)` |
| `color.border` | `#E6DEDF` |
| `color.borderOnPrimary` | `rgba(255, 255, 255, 0.3)` |
| `color.surfaceOnPrimary` | `rgba(255, 255, 255, 0.12)` |
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
| Ticket time | 44 / 48 | 36 / 40 | 700 |
| Ticket date | 56 / 56 | 64 / 64 | 700 |
| Ticket venue | 18 / 26 | 20 / 28 | 600 |
| Body | 17 / 26 | 17 / 26 | 400 |
| Secondary | 15 / 22 | 15 / 22 | 400 |
| Tag and caption | 14 / 20 | 14 / 20 | 600 |

Body is 17 and not 16 deliberately: the audience spans a wide age range and reads this
outdoors.

**Ticket time is the one role that gets smaller on a wider screen.** On a phone the start
time carries the lesson ticket on its own, so it is set at 44 / 48. On desktop the ticket
turns and the date hero sits beside it, so the time steps down to 36 / 40. The number has
not become less important; it has stopped standing alone. This is the only inversion in
the scale, and it applies to exactly one thing: the start time on the lesson ticket,
always in `color.accentOnDark`. Do not cite it anywhere else.

The other two ticket roles do not invert. **Ticket date** is the day numeral on the stub.
It is the hero the time steps aside for on a wide screen, so it grows from 56 on a phone
to 64 on desktop while the time shrinks. On a phone it must stay quieter than the gold
start time, not louder: at 64 the white numeral out-shouts the one accent on the card,
which is the thing the single-gold rule exists to protect. **Ticket venue** is the place
name in the ticket's lower panel, and it is a
role rather than a reuse of `Card title` because it is the one line a person going out
tonight actually needs: it has to outrank the street, the city and the rabbi's title,
which all sit at `Secondary` around it.

**No text anywhere goes below 14, with exactly one exemption.**

The exemption is the small line inside the date medallion, which is 12 / 16. It is named
here rather than left as drift, and it is bounded on purpose: it applies only where the
line sits directly above the time at 20px or larger, and only where it names a day the
list heading has usually already stated. It is the least load-bearing text on the card.
**Do not cite this exemption anywhere else.** Any other request to go below 14 is a
signal that something needs less text, not smaller text.

In a two-column poster grid on a phone the card is roughly 173px wide, and the card
title steps down to 15 / 21 with its supporting lines at 14 / 20. That is the floor, not
a licence to shrink further.

**The step is measured against the card's own width, never the screen's.** A card 200px
wide on a 375px phone gets the full size; the same component in a 173px grid cell keeps
the floor. Reading the viewport instead was a real defect: it shrank the type on a card
that had plenty of room, because a narrow screen was mistaken for a narrow card.

### Spacing
Base 4.

`xs 4`, `sm 8`, `md 12`, `lg 16`, `xl 24`, `xxl 32`, `xxxl 48`, `section 64`

Screen side gutter is `lg` (16) on a phone and `xl` (24) from 768 up. Vertical space
between home page sections is `section` (64) on a phone and 80 on desktop.

**Rails are the exception, and it is deliberate.** Between one rail and the next the
space is `xxl` (32) on a phone and `xxxl` (48) from 768 up, tighter than the 64 and 80
above. Four rails at section spacing read as four separate pages rather than one browsing
surface. Rails are sub-sections of a single block; the 64 and 80 still apply between that
whole block and whatever follows it.

**A horizontally scrolling row runs full width inside a page that has side gutters.** It
cancels the gutter and re-applies the same value as its own inline padding, so the first
card lines up under its heading and the last card still gets trailing space. Nothing about
this may be written as a left or a right.

### Radii
Four values, and no others.

`sm 8` tags and small blocks, `md 12` fields and buttons, `lg 16` cards, `pill 999`
chips and avatars.

### Shadows
Two. The shadow color is a near-black at low alpha, because a tinted shadow reads as a
smudge.

- `shadow.card`: `0 1px 2px rgba(28,26,23,0.04), 0 1px 3px rgba(28,26,23,0.06)`
- `shadow.raised`: `0 4px 16px rgba(28,26,23,0.10)`, for the sticky search bar only

Separation is carried mainly by `color.border` and by `surface` against `bg`, not by
shadow.

### Breakpoints and content width
Min-width, narrow to wide: `sm 480`, `md 768`, `lg 1024`, `xl 1280`.

**Maximum content width 1280px.** One value, and it binds every page: no page gets its
own width. Blocks of running text still cap at 640px, so widening the container costs no
readability anywhere. At a 1280 viewport the 24px side gutter leaves a 1232 band; from
1328 up the band caps at 1280 and the page centres. Wider than that, only the margins
grow.

**The lesson grid steps: two columns on a phone, three from `md` 768, four from `xl`
1280.** Every step down is real and must be built, not treated as a wide-screen
afterthought: a small laptop lands on three columns, not a squeezed four. The cell is
296px in the 1232 band and 308px in the full 1280 band, with the 3:4 poster following the
cell.

Not five. The reason is the poster, not the text: measured in Assistant, the widest line a
card carries is the audience and topic line at 172px, and the longest rabbi name in the
data is 143px, so every line still fits in a 243px cell. What five columns breaks is the
poster, at 243 by 324, which is a thumbnail. An earlier version of this paragraph claimed
four columns broke long names at 262px; that was an estimate, it was measured and found
wrong, and it is gone.

**This describes every lesson grid:** the filtered home page, `/lessons`, and the city
page. The rows use a fixed card width and never reflow into a grid; see below.

**A column count is set by the longest real string, never by the container.** The
all-rabbis index stays at two columns even in the wider band: its longest meta line
measures 294px, and a third column would leave it 281px.

A day group holding fewer lessons than the row has columns leaves an empty cell at the
end. That is ordinary wrapping-grid behaviour and is accepted, not a defect to design
around.

### Horizontal rails
The unfiltered home page is rows of cards that scroll sideways, each row a different cut
of the same lessons.

- **Card width is fixed, not a fraction:** 200 on a phone, 220 from 768, 240 from 1024.
  A fraction makes the peek depend on the screen, and the peek is the whole point.
- **Gap** `md` (12) on a phone, `lg` (16) from 768. Heading to cards `lg` (16).
- **The peek is the signal.** At a phone width one card sits whole and the next is
  visibly cut, so the row reads as continuing rather than ending.
- **Rails stay rails at every width.** They never become a grid on a desktop: the order
  is a ranking, and a wrapping grid destroys it and turns the first row into a page.
- Above 1024, previous and next buttons at the row's inline edges, 48 by 48, `surface`
  fill with `border` and `shadow.card`, centred on the poster rather than the whole card.
  At the ends they go **disabled, never hidden**, so the row does not shift.
- **Snap by proximity, never mandatorily.** Mandatory snapping fights a fast flick and
  feels grabby, which is the opposite of what this site is for.
- A flick must not navigate the browser backwards.
- The scrollbar is hidden on touch and thin on a pointer device.
- **Direction is inherited, never declared.** The first card sits at the inline start,
  which is the right; "more" is to the left. This is free as long as nothing names a
  side. Scrolling a rail from code must derive its direction rather than assume a sign,
  because browsers disagree about what a scroll offset means in a right to left page.

## Open (not decided yet)

- **Who maintains the list of cities.** The city an admin picks must come from a fixed
  list, never free text, or one admin typing `ת״א` once splits a city in two and the
  public filter degrades quietly. The list starts as a curated constant in code. Who
  edits it, and how a new city gets added, is not decided.
- **Iconography.** Icons are drawn ad hoc per screen today. No set, no stroke weight, and
  no source has been chosen.
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

**The lesson page is the one exception, and it goes the other way: the poster slot closes
entirely and the text takes the full width.** The rule above holds wherever a card sits in
a grid or a rail and needs a uniform height. The lesson page has no grid to keep even, and
a blank 132 by 176 panel in the middle of a plum field reads worse than no panel at all.
Ratified 2026-09-07 after the lesson page was designed. This exemption is bounded to that
one screen; anywhere else, the soft placeholder stands.

### No default city
A first-time visitor sees lessons across **all areas**, not one default city. There is
no geolocation and no assumed home city, so the honest starting state is unfiltered. The
city picker narrows from there. Do not pick a placeholder city (Jerusalem, Petah Tikva,
or otherwise) to make the header look populated on first load.

### Date chips collapse to three
`עכשיו` and `הערב` are the same day and do not need to be two chips. The row is
**`היום` / `מחר` / `בשבת`**, plus the calendar button for any other date. `היום` shows
the whole day, not only what has not started yet.

### No default date (2026-08-19)
The sibling of "no default city", and it arrived the same way. **No chip is selected on
first load**, because a visitor who has chosen nothing has not asked about today.

A chip is a toggle: **tapping the selected chip clears it** and returns to the unfiltered
rows. The affordance is a small `×` inside the same pill, at the label's weight so it is
still visible outdoors and to an older reader. The pill stays one 48px target, and its
accessible name gains `הסרת הסינון`. No hint line, no tooltip, no fourth chip.

The chips **do not reorder when one is selected**. A row that rearranges itself under the
thumb costs more than the tidier hierarchy is worth. A long chosen date drops its weekday
and shows the day and month only, so the pill does not wrap; the full date still reads in
the heading below.
