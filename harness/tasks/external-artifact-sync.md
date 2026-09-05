# Task: external-artifact-sync

## Use When

The project needs to import external artifacts such as client docs, contract
files, API schemas, spreadsheets, or reference material into a controlled repo
location.

## Load

- project-local sync policy
- source artifact list
- exclusion and redaction rules

## Steps

1. Identify the source and target directories.
2. Apply allowlist, exclusion, and redaction rules.
3. Preserve source metadata when useful.
4. Do not import secrets or private data.
5. Report added, changed, skipped, and redacted files.

## Output

- synced artifacts
- sync report
- redaction or exclusion notes
