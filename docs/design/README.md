# Design Knowledge

This directory is the repository-local design research and reference layer. It
helps agents find relevant examples, principles, tools, and practitioners when a
task involves product design, interaction, UI craft, design systems, or
design-engineering implementation.

[DesEngs](https://desengs.com/) is a core global discovery source. It is an
actively curated directory for design engineers and exposes its underlying data
in the open-source [remvze/desengs repository](https://github.com/remvze/desengs).

## Knowledge Map

- `sources.md`: curated source registry and initial DesEngs resource clusters.
- `knowledge-graph.md`: relationships between design questions, themes,
  references, delivery artifacts, and verification.
- `research/`: dated source snapshots, observations, interpretations, and gaps.
- `docs/design-visual-workflow.md`: the harness workflow for turning an approved
  reference into a benchmark and validated implementation.

## Authority Order

Use references in this order:

1. The product's approved design, requirements, and user needs.
2. The project's design system, tokens, content rules, and platform conventions.
3. Accessibility, security, privacy, and implementation constraints.
4. Curated references such as DesEngs for discovery and comparative examples.
5. Local interpretation recorded in this knowledge graph.

A visually attractive external example never overrides a product constraint or
becomes a regression baseline by itself.

## How To Use This Knowledge

1. Translate the request into design questions: hierarchy, layout, typography,
   color, motion, interaction, feedback, accessibility, or implementation.
2. Read the target project's local design sources and constraints first.
3. Use `knowledge-graph.md` to select a small relevant cluster.
4. Recheck the live source because directories and linked resources change.
5. Compare three to seven references when possible; extract recurring principles
   instead of copying one surface.
6. State which observations come from a source and which conclusions are local
   interpretation.
7. Convert the chosen direction into an explicit benchmark, design decision, or
   acceptance criterion.
8. Validate the rendered result through `docs/design-visual-workflow.md`.
9. Record which references were useful, misleading, stale, or rejected so the
   graph improves from real delivery evidence.

## Maintenance Rule

Grow this directory when a design task produces durable knowledge. Do not mirror
every DesEngs entry. Index the nodes and relationships that improve future
decisions, and preserve source URLs and observation dates so stale claims are
visible.
