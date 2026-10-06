# 0059: The calendar sheet asks which calendar first

- **Status:** accepted
- **Date:** 2026-10-06
- **Decided by:** goorlavi
- **Supersedes:** [0055](0055-a-lesson-goes-into-a-calendar-as-a-copy-or-a-subscription.md)

## Context

0055 sent iPhone and desktop visitors straight to the device's own calendar: an `.ics`
download, or a `webcal://` subscription. On a computer, someone who keeps their life in
Google Calendar got a file they could not use. Only Android went to Google.

## Decision

Everything in 0055 still holds (a copy never updates, a weekly lesson can also be
subscribed to, every event links back, no rabbi-wide feed), except how a visitor reaches
it on iPhone and desktop:

- **"הוספה ליומן" always opens a sheet that asks "באיזה יומן אתם משתמשים?"**, with two
  choices: "יומן Google" and "היומן בטלפון או במחשב" (iPhone Calendar, Outlook and the
  rest).
- **A one-time lesson** is added by that single choice: a prefilled Google event in a new
  tab, or the `.ics` file.
- **A weekly lesson** then asks the shipped second question in the same sheet, "רק שיעור
  אחד" or "כל השיעורים הבאים, עם עדכונים", with a way back to the first. Google gives a
  prefilled event or Google's subscribe link; the device gives `.ics` or `webcal://`.
- **Android is unchanged:** it goes straight to the second question, both answers through
  Google.
- **The choice is not remembered** between visits, on purpose for a first version.

## Consequences

- One more tap for everyone on iPhone and desktop, including people the old direct
  download suited.
- Google's subscribe link opens in the browser and needs a signed-in Google account
  there. On iPhone it is checked by hand on a real device before this ships.
- On a computer with no calendar program, the device choice may do nothing, for example
  for someone who uses Outlook only in the browser. Accepted; Google is the other choice.
- The add-to-calendar event now records which calendar was chosen, and a sheet open is
  counted, so how many opens end in a choice can be measured.

## Rejected

- **Both questions on one screen with a confirm button.** Reads as a form; heavier for a
  visitor with little technical comfort.
- **Four rows (calendar × one or all).** Every title has to carry two facts and repeat
  them.
- **Remembering the choice.** Saves a tap later, but needs a way to change it; deferred.
- **Guessing the calendar from the device.** A Mac or an iPhone says nothing about
  whether its owner uses Google Calendar.
