# Task: Visual Spec And Testing

Use when a UI task needs design-source validation, visual regression coverage, or
a visual coverage ledger update.

## Load

- `examples/optional-web/workflows/design-visual-validation.md`
- `examples/optional-web/rules/design-validation.md`
- `examples/optional-web/rules/web-ui.md`
- `examples/optional-web/templates/design-reference-manifest.schema.json`
- `examples/optional-web/templates/visual-coverage-ledger.md`

## Steps

1. Read the feature spec and identify UI surfaces.
2. Confirm design references or record a pending coverage row.
3. Sync or capture benchmark artifacts.
4. Render the implementation in a real browser when possible.
5. Compare the render to the benchmark.
6. Fix drift or record approved deviations.
7. Add or update visual regression baselines only after conformance passes.
8. Report visual evidence in the QA Impact Packet.

## Output

- updated design references or manifest
- visual coverage ledger update
- screenshots or visual report
- QA packet visual evidence
