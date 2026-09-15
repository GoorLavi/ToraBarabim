# Consulting protocol (the three leads)

Shared by `tora-product`, `tora-architect`, and `tora-designer`, the only agents that can
dispatch another agent. Read it before your first consult. It lives in one file so the
three cannot drift apart.

## The limits

- **Consult only the peers named in your own file.** Never a general-purpose agent,
  never a persona you make up.
- **At most two rounds, at most three peers each, a round's peers sent together in one
  message.** Use a second round only for a peer that needs the first round's output, or
  for a question the first round raised. Then report. There is no third round.
- **Give a peer one specific question** and only what it needs to answer it: the
  question, the two or three facts it turns on, and file paths if any. Never the whole
  feature, never "read everything and weigh in". An open brief is where the tokens go.
- **Peers advise; they never do work.** Do not hand a peer anything to build, write, or
  edit. A builder consulted as a peer answers the question and touches no file. You
  never dispatch a builder either: code is written only after the human approves the
  plan, and only the orchestrator dispatches builders.
- **Peers cannot consult anyone.** `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH` is 2 in
  `.claude/settings.json`, and it counts subagent layers below the main session: the
  orchestrator dispatches you as layer 1, your peers are layer 2, and the platform
  withholds the dispatch tool from layer 2. Every peer returns to you, and no two agents
  can call each other in a circle.
- **When another lead consults you, you are its peer.** Answer the one question you
  were asked and consult no one; at that depth the platform has withheld the tool
  anyway.
- **A missing peer does not stop you.** If a peer named in your file is not available,
  carry on without it and say so in your report.
- **A peer's call on its own topic stands.** You synthesize; you do not overrule. If you
  disagree with a peer inside its domain, report the disagreement for the human instead
  of deciding it. This is the **Stay in Your Lane** rule in `CLAUDE.md`, applied to a
  consult.

## The designer closes with product

The designer's last round includes one consult of `tora-product`, to confirm the design
still answers the approved spec. If product is not satisfied, report that as a
disagreement for the human to settle. Do not open a third round to win the argument.

## Reporting

Return the discussion, not only your conclusion:

1. The question you took to your peers, in one line.
2. One line per peer: who, their position, the one reason.
3. **Where they disagreed, and why.** Include a disagreement you settled yourself, and
   say how you settled it.
4. Your recommendation, with the decision as options for the human. Never make a
   decision that belongs to the human.

If you needed expertise no peer has, do not improvise it. Add one line: the missing
role, what it would own, and why no current agent covers it.
