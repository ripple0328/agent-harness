# Task: design-source-sync

## Use When

A UI spec references external design frames, screenshots, or design artifacts that
should be stored locally for stable comparison.

## Load

- `examples/optional-web/rules/design-validation.md`
- relevant feature spec
- project-local design-source configuration

## Steps

1. Read the spec's design-reference section.
2. Resolve each referenced design artifact.
3. Export or copy stable local references into the spec's artifact directory.
4. Write a manifest mapping labels to source ids and local files.
5. Report missing or stale references.

## Output

- local design artifacts
- manifest
- missing-reference report

## Source Notes

The source can be Figma, screenshots, Storybook captures, design-system examples,
or another project-approved source.
