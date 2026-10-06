# 0058: A link preview shows the real photo or none

- **Status:** accepted
- **Date:** 2026-10-06
- **Decided by:** goorlavi

## Context

Share buttons arrive on the lesson, rabbi and place pages, so the WhatsApp preview
becomes something we put in front of people on purpose. Lesson and rabbi pages
previewed with the site logo, which says nothing about the lesson. Not every rabbi has
a poster: the column is nullable, whatever the product page says.

## Decision

- **Lesson and rabbi pages preview with the teaching rabbi's poster**, as it is, with
  no crop and no generated card. **Without a poster there is no image at all**, not the
  logo.
- **`twitter:card` follows the image:** `summary_large_image` with one, `summary`
  without. This also moves a place with no photo to `summary`.
- **Shared links carry `?s`**, the shortest tag that still tells us a visit came from a
  share. Canonical URLs ignore it.

## Consequences

- The poster is 3:4 and previews crop it: WhatsApp's small preview takes a centred
  square and can cut the top of the head; a wide preview keeps a band through the face.
  Not checked on a device.
- No width or height is sent with the image (posters have none stored), so a first
  scrape by some apps may skip it.
- A shared lesson by a rabbi with no poster previews as text only.

## Rejected

- **A generated card per lesson** (poster, day, time, city). The most persuasive
  preview, and declined by the owner as more than this needs.
- **A server-side square crop from the top of the poster.** Keeps the face, at the cost
  of image processing; declined in favour of the poster as it is.
- **Keep the logo as the fallback.** A logo tells the recipient nothing about the
  lesson.
- **A longer tag such as `?from=share`.** Clearer, but longer and uglier in a message.
