# 0061: The site advertises to seekers first, through rabbis' own clips

- **Status:** accepted
- **Date:** 2026-10-07
- **Decided by:** goorlavi

## Context

The site lists lessons every week and nobody who does not already know about it finds
them. The owner wants to start publishing. The roster had no marketing lane: it was
left out on purpose in September 2026 as not yet worth its weight. The questions that
decide a campaign (whom, what, with what money, with whose face) are the owner's, not
an agent's, and they change which agents are worth defining.

## Decision

- **The audience is the national-religious and traditional public**, including people
  returning to observance. The Haredi public is not a target for now: it is largely
  off the networks the campaign runs on.
- **Seekers are recruited first, not listers.** The site already carries lessons,
  imported weekly; what it lacks is people who know it exists.
- **Paid spend is small**, up to a few hundred shekels a month, and the free channels
  carry the campaign: a rabbi's own groups and channels, synagogue noticeboards, the
  rabbis themselves. Paid ads complete the free channels; they never replace them.
- **The creative is a short clip of a rabbi teaching**, cut with a closing card that
  says where his lessons are found. The same cut goes into the groups and channels
  where the rabbi's public is, and as a paid reel aimed at the city of the lesson. A paid
  ad cannot be aimed at a WhatsApp group; the group is reached through the rabbi.
- **A rabbi's public clip is used without asking him.** Sermons are forwarded freely
  in this public, and the owner decided the site does the same. A rabbi who asks for
  a clip to be taken down is taken down, without argument. When the site does speak
  to a rabbi, the framing stays that of a service to the public and זיכוי הרבים, never
  a benefit to him.
- **National from the start.** No preferred city. A paid clip is aimed at the city
  where that rabbi teaches, and the campaign as a whole spans rabbis from different
  cities.
- **The clip opens on the Torah and the site comes last.** The rabbi's strongest
  moment leads, with nothing sold over it; the closing card is the only place the site
  speaks.
- **Success is visits to the rabbi's page from the campaign**: a page view of the rabbi
  page, filtered by the asset's source value. Navigation and calendar clicks after it
  are the second number, the one that says the person also went.
- **The first campaign tests two promises**, two lead lines every ad returns to, each
  with its own source values; the strategist recommends one from the numbers, and the
  winner stands in `marketing/playbook.md` for the campaigns after it.
- **Agents never publish and never spend.** Posting, boosting, and the ad account are
  the owner's hands. A campaign ends with a checklist the owner follows.
- **The marketing lane is four agents**: a growth strategist who leads the plan, a
  copywriter, an ad designer who leads the creative, and a video editor. The existing
  designer and Hebrew editor review the creative; no new reviewer was added. The lane's
  artifacts live in `marketing/`.
- **The two agents that write lines the public reads, the strategist and the
  copywriter, are instructed in Hebrew**, as the Hebrew editor already is, so the
  message is thought in Hebrew rather than translated into it. The plans, copy,
  checklists, and retros in `marketing/` are written in Hebrew for the same reason: the
  owner reads and acts on them. This is a named exception to the rule that documents
  are English; file names, source values, and event names stay as the code has them.

## Consequences

- Two new leads in `.claude/consulting-protocol.md`, with fixed peers, under the same
  two-round limit. A campaign has two human gates before production: the plan, then
  the creative.
- `ffmpeg` and the Assistant typeface are installed on the owner's Mac by the owner;
  the video editor stops and asks when either is missing.
- Every campaign link carries a `utm_source` value, which the client's closed list of
  sources must learn; each campaign's plan names its values and the client change is
  scheduled before the first post.
- Raw footage and rendered video stay out of git.

## Rejected

- **Recruiting rabbis and places first.** The marketplace problem is real, but the
  listings exist already; the empty side is the public.
- **Targeting "the rabbi's groups" with paid ads.** Not a thing any platform sells; the
  honest version is the rabbi sharing it himself.
- **An audience-voice agent** that reads an ad as a member of the public. Kept in
  reserve for when many variants are in play; for now the owner is that voice.
- **One combined creative agent** for stills and video. Different tools and a
  different craft, and the editor runs once per rabbi while the card is built once.
