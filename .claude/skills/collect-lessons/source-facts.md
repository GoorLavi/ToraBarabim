# Source facts

Facts about a source site that the page itself does not state, confirmed by the owner.
`/collect-lessons` reads this before every run. Add or change an entry only when the
owner confirms it, and keep the note saying who confirmed it and when.

Every value filled from here is marked in the row's `notes` as given by hand, not read
from the site. A fact stops being true when the site changes; if the site now states the
thing itself, the site wins and the entry is reported as possibly stale.

## levmeirisrael.com (הרב מאיר אליהו)
- **The three fixed lessons ("שיעורים קבועים בארץ") are on Tuesday.** The site says they
  are weekly and fixed but not which day. Confirmed by the owner, 2026-09-15; he asked
  that they not be dropped. Note on the row: "היום הושלם ידנית".

## tlvgreatsynagogue.org (בית הכנסת הגדול תל אביב)
- **Address: רחוב אלנבי 110, תל אביב.** Not on the `/Courses` page. Given by the owner
  with the link, 2026-09-15. Note on the row: "הכתובת נמסרה ידנית ואינה מופיעה בדף".

## ayal-taarog.org.il (הרב אייל עמרמי)
- **קבוע / משתנה is the colour of the time tag**, per the legend at the bottom of the
  image: solid red is קבוע, white with an outline is משתנה. There is no text saying it.
  This is the most fragile reading in the whole run: read the colour from the pixels, not
  by eye, and mark the row `needsReview` when unsure.

## Expected row counts (for the sanity check)
From the run of 2026-09-15. An order-of-magnitude change fails the source.

| Site | Rows |
|---|---|
| ayal-taarog.org.il | 12 |
| yabia-omer.co.il | 10 |
| levmeirisrael.com | 10 |
| hse.org.il | 4 |
| musayof.co.il | 95 |
| tlvgreatsynagogue.org | 5 (1 kept after drops, split into 5 days) |
| hameir-laarets.org.il | 4 |
