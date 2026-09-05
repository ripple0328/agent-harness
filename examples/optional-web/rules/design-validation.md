# Design Validation Rules

Use these when a feature changes user-facing UI.

## Sources Of Truth

A project should name its design sources in the project layer:

- design files or screenshots
- component library
- token system
- content guidelines
- accessibility standard

The generic harness only requires that the source be explicit.

## Visual Conformance

Before approving a UI change:

- compare the rendered UI to the design source when one exists
- record meaningful drift such as missing sections, broken hierarchy, wrong
  tokens, clipped content, or layout collapse
- ignore sub-pixel noise unless the project has pixel-perfect requirements
- document accessibility-driven deviations

## Regression Baselines

Only create or update a visual regression baseline after the render has passed
design conformance. Do not update a baseline just to silence a failing diff.

Keep the benchmark label and the baseline label aligned so a reviewer can trace
the implementation snapshot back to the design source.

## Coverage Gaps

If a changed screen lacks a design source or visual baseline, record a pending
coverage item. Do not skip silently.
