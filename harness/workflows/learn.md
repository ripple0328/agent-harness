# Workflow: Learn

Use this workflow when a human correction, review finding, QA finding, or agent
self-detection should improve future harness behavior.

## Goal

Convert an observed harness miss into a durable rule, role prompt, workflow
change, template field, hook candidate, eval candidate, or signal trigger.

## Flow

```mermaid
flowchart LR
    A(["Correction or finding"]):::signal --> B["Classify<br/>miss category"]:::work
    B --> C["Route<br/>lowest layer"]:::work
    C --> D{"Already<br/>covered?"}:::decision
    D -->|yes| E["Compliance note"]:::quiet
    D -->|no| F["Minimal harness change"]:::artifact
    E --> G["Feedback event"]:::artifact
    F --> G
    G --> H(["Future behavior changed"]):::outcome
    H --> I(["Trigger potential"]):::improve

    classDef signal fill:#eef2ff,stroke:#4f46e5,color:#111827;
    classDef work fill:#e0f2fe,stroke:#0284c7,color:#111827;
    classDef decision fill:#fce7f3,stroke:#be185d,color:#111827;
    classDef artifact fill:#fef3c7,stroke:#d97706,color:#111827;
    classDef outcome fill:#dcfce7,stroke:#16a34a,color:#111827;
    classDef improve fill:#ecfccb,stroke:#65a30d,color:#111827;
    classDef quiet fill:#f8fafc,stroke:#94a3b8,color:#475569;
```

## Inputs

- lesson description
- recent review or QA output
- relevant harness files
- project-local rules if the lesson is project-specific

## Steps

1. State the observed signal.
2. Classify the feedback category:
   - `missed-risk`
   - `bad-scope`
   - `missing-evidence`
   - `bad-summary`
   - `bad-test-plan`
   - `design-drift`
   - `rule-gap`
   - `hook-candidate`
   - `eval-candidate`
3. Choose the lowest target layer:
   - rule
   - role prompt
   - workflow prompt
   - template
   - script or hook
   - eval case
   - project documentation
   - signal trigger
4. Check whether an existing rule already covers it.
5. Write the minimal durable change.
6. Save a Human Feedback Event using the template.
7. Report category, target, change, event path, when it will apply, and whether
   the signal should trigger future loops.

## Rules

- Apply small changes. Do not rewrite a whole prompt for one lesson.
- If the issue is deterministic, mark it as a hook candidate.
- If the issue requires judgment, mark it as an eval candidate.
- If the lesson is project-specific, put it in the project layer.
