# ToraBarabim: what the product is

The one page to read before working on anything here. It answers what this is, who it
is for, and which properties are fixed. It does not carry rules (those live in
`CLAUDE.md`) or the reasoning behind past choices (that lives in `decisions/`).

## The problem

Someone wants to learn tonight. They know a rabbi they follow, or a neighbourhood they
are in, or simply that they are free after nine. Today that person asks in a WhatsApp
group, or remembers a flyer on a noticeboard, or does not go.

ToraBarabim is where that person finds a lesson. Modelled on how a listings site like
comy.co.il works for stand-up shows: browse by who is speaking, by where, by when.

## Who it is for

**The person looking for a lesson.** Usually on a phone, often outdoors, often deciding
in the next hour. A wide range of ages and comfort with technology. This person is the
only user the public site is designed for.

**The administrator.** A small trusted group who enter and maintain the listings. Not
the public. See `decisions/0001-lessons-are-admin-entered.md`.

## The signal that it worked

Someone opened the site, found a lesson they did not previously know about, and went.
Everything else is a proxy for that.

## What the site is made of

- **A lesson** happens weekly on set weekdays, or once on a date. It has a start time,
  a length, a rabbi, a place, and an audience. Title, topic, and notes are optional.
- **An exception** overrides a single date of a recurring lesson: cancelled, or moved
  in time, place, or speaker. It never changes the rule itself, so cancelling one week
  cannot affect any other week.
- **A rabbi** has a name, an optional title, a biography, and a tall portrait poster.
  The poster is structural rather than decorative: every rabbi has one, and screens may
  be designed around its presence.
- **A place** is a synagogue, yeshiva, or kollel, with an address, inside a city.
- **A city** comes from the official data.gov.il locality list and is chosen, never
  invented.

## Fixed properties

These are settled and are not open questions in ordinary work. Reopening one is a
decision record, not a pull request comment.

- **Hebrew only, right to left.** No language switching, no translation layer, no
  English fallbacks. Copy is written natively in Hebrew, never translated.
- **Phone first.** Designed narrow and allowed to grow, never designed wide and shrunk.
- **The audience of a lesson has exactly three values**, written in Hebrew as
  `גברים`, `נשים`, and `גם גברים וגם נשים`. The word `מעורב` is never used for the
  third: it reads wrong to this audience.
- **Times and dates are Israeli.** Today, tomorrow, and this weekend resolve against
  Israel time, and dates and numbers are formatted the way an Israeli reader expects.
- **The listings are curated, not crowdsourced.** Accuracy is the product. A lesson
  that is not really happening is worse than a lesson that is missing.

## What it is not

Not a social network, and not a place for comments, ratings, or attendance. Not a
streaming or recording archive. Not a donation platform. Not a general Jewish content
site: it answers where and when, nothing more.

## Where everything else lives

| You want | Read |
| --- | --- |
| The rules for writing code here | `CLAUDE.md`, plus the one in each workspace |
| Why a past choice was made, and what was rejected | `docs/decisions/` |
| Colour, type, spacing, tokens | `.claude/design-system.md` |
| How work moves from idea to shipped, and who does what | `.claude/README.md` |
