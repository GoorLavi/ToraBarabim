# Must-catch findings

1. **An empty search answered with 404**: the new `lessons.length === 0` branch returns
   `404`. An empty result is a normal `200` with an empty list (`CLAUDE.md`, Node and
   the API). The client treats 4xx as an error, so the seeker sees the error state
   instead of the empty state that is supposed to help them widen the search. Blocking.

The validation change above it (a clearer 400 message) is an improvement on purpose; the
one sin is the 404. A reviewer that passes this diff has lost the empty-result check.
