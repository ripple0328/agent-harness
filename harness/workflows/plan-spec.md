# Workflow: Plan Spec

Use this workflow after a feature spec is ready and before implementation.

## Goal

Create a phase-by-phase implementation plan that names files, tests, commands,
risks, and decision points.

## Flow

```mermaid
flowchart LR
    A(["Ready spec"]):::signal --> B["System scan<br/>patterns and constraints"]:::work
    B --> C["Phase map<br/>what changes when"]:::artifact
    C --> D["Evidence plan<br/>tests and commands"]:::artifact
    D --> E{"Risks<br/>understood?"}:::decision
    E -->|needs decision| F["Human callout"]:::learn
    F --> C
    E -->|yes| G(["Implementation-ready plan"]):::outcome

    classDef signal fill:#eef2ff,stroke:#4f46e5,color:#111827;
    classDef work fill:#e0f2fe,stroke:#0284c7,color:#111827;
    classDef artifact fill:#fef3c7,stroke:#d97706,color:#111827;
    classDef decision fill:#fce7f3,stroke:#be185d,color:#111827;
    classDef learn fill:#f8fafc,stroke:#64748b,color:#111827;
    classDef outcome fill:#dcfce7,stroke:#16a34a,color:#111827;
```

## Inputs

- feature spec
- existing project structure
- architecture decisions
- project-local rules
- relevant open technical debt or known issues

## Steps

1. Locate and read the feature spec completely.
2. Read the relevant generic and project-local rules.
3. Inspect the existing codebase for patterns in the affected surfaces.
4. Identify small phases around independently verifiable behavior:
   - clarify contracts and invariants
   - implement one complete capability
   - exercise affected boundaries and recovery
   - integrate and verify the outcome
   - prepare acceptance, release and operational evidence
5. Omit phases that do not apply.
6. For each phase, name:
   - files to create or modify
   - tests to write alongside the change
   - commands to run
   - dependencies and blockers
   - acceptance criteria affected
7. Call out risks and decisions that need human approval.
8. Save the plan using `harness/templates/implementation-plan.md`.

## Output

- implementation plan
- active/skipped phase list
- estimated file count
- risk and decision list

## Rules

- Do not write product code.
- Do not invent stack-specific commands; use project-local commands.
- Do not create vague test instructions. Name exact behavior to test.
