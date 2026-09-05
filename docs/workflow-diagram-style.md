# Workflow Diagram Style

Workflow diagrams are communication surfaces. They should help adopters
understand the shape of the workflow before reading the details.

## Diagram Goals

- Show the story of the workflow, not every implementation step.
- Keep labels short and human-facing.
- Use consistent colors for similar concepts.
- Make the feedback or improvement path visible.
- Prefer five to eight nodes over a dense trace.

## Suggested Color Roles

Use these roles consistently:

| Role | Meaning |
|---|---|
| `signal` | Request, trigger, diff, or input signal. |
| `work` | Context gathering, judgment, or active work. |
| `artifact` | Packet, report, plan, evidence, or durable output. |
| `decision` | Approval, conformance, confidence, or routing decision. |
| `outcome` | Completed workflow state. |
| `improve` | Harness learning, trigger, or improvement path. |
| `learn` | Repair, escalation, or human judgment path. |

## Pattern

```mermaid
flowchart LR
    A(["Signal"]):::signal --> B["Work stage"]:::work
    B --> C["Artifact"]:::artifact
    C --> D{"Decision?"}:::decision
    D -->|yes| E(["Outcome"]):::outcome
    D -->|improve| F["Harness signal"]:::improve

    classDef signal fill:#eef2ff,stroke:#4f46e5,color:#111827;
    classDef work fill:#e0f2fe,stroke:#0284c7,color:#111827;
    classDef artifact fill:#fef3c7,stroke:#d97706,color:#111827;
    classDef decision fill:#fce7f3,stroke:#be185d,color:#111827;
    classDef outcome fill:#dcfce7,stroke:#16a34a,color:#111827;
    classDef improve fill:#ecfccb,stroke:#65a30d,color:#111827;
```

If a diagram needs more detail, put the detail in the workflow steps instead of
adding more nodes.
