# Tool Capability Map

Use this when adopting the harness into a project or agent environment.

## Environment

**Project:**
**Agent environment:**
**Maintainer:**
**Last updated:** YYYY-MM-DD

## Capabilities

| Capability | Available? | Tool or command | Allowed actions | Default artifact |
|---|---|---|---|---|
| Code editing | Yes/No |  |  | Phase report |
| Terminal execution | Yes/No |  |  | Verification result |
| Repository search/diff | Yes/No |  |  | PR Attention Packet |
| Browser/UI automation | Yes/No |  |  | QA Impact Packet |
| Design/source export | Yes/No |  |  | Design manifest |
| PR/issue integration | Yes/No |  |  | PR packet / feedback event |
| Background loop | Yes/No |  |  | Loop trace |
| Scheduled run | Yes/No |  |  | Harness audit |
| Monitor/canary | Yes/No |  |  | Trigger signal |
| Sub-agent/role delegation | Yes/No |  |  | Role report |
| Proposed-patch mode | Yes/No |  |  | Proposed improvement |

## Bounds

| Loop or scheduled job | Trigger | Limit | Stop condition | Escalation |
|---|---|---|---|---|
| Weekly harness audit | Schedule | Once weekly | Audit posted | Missing evidence |
| QA signal sweep | PR update | One run per update | QA brief posted | Failing or unknown signal |

## Routing

| Signal | Task | Workflow | Output |
|---|---|---|---|
| High-risk untraced AC | `improve-harness` | `signal-triggered-improvement` | Proposed rule, hook, or template update |
| Visual coverage gap | `visual-spec` | `design-visual-validation` | Ledger update or baseline plan |
| Review packet too noisy | `improve-harness` | `signal-triggered-improvement` | PR packet experiment |
