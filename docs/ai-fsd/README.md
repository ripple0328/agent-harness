# Continuous AI-First Software Delivery Research

This directory is the repository-local system of record for the harness's outer
learning loop. Here, **AI FSD** means AI-first software delivery across discovery,
requirements, design, implementation, review, QA, release, operations, and
maintenance. It is broader than code generation and narrower than general AI
news.

The goal is not to adopt every new agent feature. The goal is to notice changes
that could improve reliable software delivery, test them against a concrete
problem, and let verified improvements compound.

## Knowledge Map

- `sources.md`: curated source registry, authority, cadence, and last check.
- `research/YYYY-MM-DD.md`: dated evidence, decisions, failures, and watchlist.
- `application-ledger.md`: durable record of what was applied, deferred,
  rejected, or reverted.
- `adoption-and-feedback.md`: how other projects consume the canonical harness
  and return evidence.
- `harness/templates/research-signal.md`: daily note format.

## Research Policy

- X bookmarks, liked posts, and public social searches are useful discovery
  inputs, not proof.
- Official documentation, release notes, code, standards, and research papers
  are preferred evidence.
- Vendor blogs may explain an operating model, but measurable claims still need
  reproduction or project evidence before becoming a gate.
- Keep confirmed facts, inferences, user-curated signals, and unresolved claims
  distinct.
- Run at most one small experiment per daily sweep. A valid outcome can be
  `No qualified change today`.
- Keep vendor-specific capabilities in documentation or adapters; keep the core
  workflow tool-neutral.

## Daily Contract

The `research-harness` task follows
`harness/workflows/continuous-research-improvement.md`. Every run must leave a
short dated note, even when sources fail or no change qualifies. A run that edits
the harness must also update the application ledger, verify the change, and
create a feedback event when the harness itself missed a needed behavior. Every
run also includes a plain-language introduction article, a concrete application
example, and a short knowledge check with an answer key. When nothing qualifies
for implementation, the article teaches the strongest useful signal or revisits
a foundational concept without pretending it was newly applied.

Run the knowledge check with:

```bash
npm run harness:research:check
```

## Human Curation

Add or reprioritize sources in `sources.md`. Mark a source `watch`, `core`, or
`paused`; the daily loop should respect that decision. A bookmarked item can be
promoted by adding its stable URL and the question it should help answer.
