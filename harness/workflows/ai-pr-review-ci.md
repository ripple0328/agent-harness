# Workflow: AI PR Review In CI

Use this workflow when a CI job asks an AI reviewer to inspect a pull request.

## Flow

```mermaid
flowchart LR
    A(["PR update"]):::signal --> B["Context pack<br/>diff, specs, CI"]:::work
    B --> C["Risk lens<br/>scope, tests, security"]:::work
    C --> D{"Actionable<br/>and high confidence?"}:::decision
    D -->|yes| E["Inline finding"]:::artifact
    D -->|no| F["Hold comment"]:::quiet
    E --> G["Sticky review summary"]:::artifact
    F --> G
    G --> H(["Harness signal"]):::improve

    classDef signal fill:#eef2ff,stroke:#4f46e5,color:#111827;
    classDef work fill:#e0f2fe,stroke:#0284c7,color:#111827;
    classDef decision fill:#fce7f3,stroke:#be185d,color:#111827;
    classDef artifact fill:#fef3c7,stroke:#d97706,color:#111827;
    classDef improve fill:#dcfce7,stroke:#16a34a,color:#111827;
    classDef quiet fill:#f8fafc,stroke:#94a3b8,color:#475569;
```

## Inputs

- pull request metadata
- changed files and diff
- linked specs, plans, or tickets
- project-local rules
- generic harness review rules
- central AI review prompt

## Steps

1. Gather context with repository tools.
   - PR title, body, labels, base branch, and changed files.
   - Linked specs and acceptance criteria.
   - CI status if available.
2. Infer intended scope.
3. Compare scope to diff.
   - flag scope creep
   - flag missing expected changes
   - flag unrelated churn
4. Review by risk layer.
   - correctness and edge cases
   - data/API contract impact
   - UI, accessibility, and visual impact
   - security and privacy boundaries
   - test and traceability coverage
   - release and migration risk
5. Run an adversarial self-check.
   - what would make this review wrong
   - what evidence is missing
   - which comments are low confidence and should be omitted
6. Post comments.
   - inline only for actionable, high-confidence findings
   - one sticky summary for risk, evidence, and open questions

## Output

- high-confidence inline findings
- summary comment
- optional harness feedback candidate

## Rules

- Do not ask for style-only churn unless a project rule requires it.
- Do not duplicate failing CI logs unless the agent adds prioritization.
- Do not claim a check passed unless the job evidence proves it.
- Prefer "not verified" over invented confidence.
