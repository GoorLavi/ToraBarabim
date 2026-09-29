# 0041: An unlinked course names its teacher in free text, with no honorific and no audience guard

- **Status:** accepted
- **Date:** 2026-09-24
- **Decided by:** project owner

## Context

A rabbi's name is never shown bare, and a rabbanit teaches women only
([0026](0026-rabbaniyot-teach-women-only-and-the-honorific-is-a-field.md)). Both rules
hang on the rabbi's record. A course with no linked rabbi
([0039](0039-an-admin-course-may-have-no-rabbi-and-no-place.md)) has no such record.

## Decision

The teacher of an unlinked course is whatever the administrator typed, shown exactly
as typed. The site adds no "הרב" or "הרבנית", and the women-only guard cannot fire,
because there is no honorific field to read. This is a gap accepted on purpose.

## Consequences

- An administrator can list a course by a rabbanit with the audience set to men or to
  both, and nothing stops it.
- A teacher can appear on the site with no honorific, or with one spelled differently
  from every other page.
- **What would change this:** the first unlinked course that names a rabbanit with the
  wrong audience, or the first complaint about a bare name.

## Rejected

- **An honorific field on the unlinked shape.** It would rebuild half of the rabbi
  record inside the course, for a shape only administrators use.
- **Guessing the honorific from the text.** A wrong guess enforces the wrong rule.
