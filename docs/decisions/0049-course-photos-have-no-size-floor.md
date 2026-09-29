# 0049: Course photos have no size floor; a small photo gets a warning

- **Status:** accepted
- **Date:** 2026-09-26
- **Decided by:** project owner

## Context

The course cover was built with the rabbi poster's floor, 900 by 1200, and the gallery
with a floor of 600 on the short side. On his first hand run the owner was refused a
photo as too small, and then a good phone photo failed because it was over the upload
limit. He asked why the site limits at all.

## Decision

A course photo of any size is accepted. When a cover is under 600 by 800, or a gallery
photo's short side is under 600, the form warns that it may look blurred on the site,
and saves it anyway. The owner: "לקבל כל גודל, עם אזהרה על טשטוש".

Every photo is re-encoded in the browser to at most 2000 pixels on its long side
before it is sent, so a phone photo clears the 5MB upload limit. If the browser cannot
decode or re-encode a file, the original is sent as it is.

## Consequences

- A blurred course card can reach the site. The lister was warned and chose.
- The rabbi poster keeps its 900 by 1200 floor. This record covers course photos only.
- The re-encode fails open: a file the browser cannot handle may still be refused by
  the server for its size, with the picker's own message.
- **What would change this:** the first course card the owner finds blurry on a phone.

## Rejected

- **Keeping the floor.** It turned away the photos listers actually have.
- **Letting the lister crop to reach the floor.** Cropping cannot add pixels that the
  photo does not have.
