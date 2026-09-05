# AI Workflow Original Intent

This harness exists because agentic development changes the bottleneck.

When agents can produce implementation, tests, summaries, and pull requests very
quickly, the limiting factor is no longer typing code. The limiting factor is
human trust:

- did the work match the requirement
- did tests cover the risky behavior
- did the review surface the right files and questions
- did visual QA compare against an actual design source
- did repeated human corrections improve the next run

The harness turns those questions into a repeatable workflow.

## Core Thesis

The useful unit is the workflow, not a single model answer.

A good run leaves behind evidence that another human or agent can inspect:

- a spec with acceptance criteria
- a plan that maps phases to files and checks
- tests traced to the spec
- a QA packet that names risk and residual gaps
- a PR packet that tells reviewers where to look first
- a feedback event when the harness itself missed something

## Human Leverage

The harness should move humans away from line-by-line rediscovery and toward
high-signal judgment:

- confirm intent and scope
- inspect the riskiest behavior first
- challenge weak or missing evidence
- identify recurring harness misses
- approve or reject residual risk

This does not remove human review. It gives humans a shorter, sharper surface.

## Harness Learning

Conversation is calibration data. When a human says "we keep missing this" or
"this summary buried the real risk", the harness should not rely on the next
agent remembering the chat.

Route the signal into one of these layers:

| Layer | Use when |
|---|---|
| Rule | A durable constraint applies whenever a surface is touched. |
| Role | One agent persona is missing a responsibility. |
| Workflow | The order of operations is wrong. |
| Template | A report or packet lacks a field. |
| Script or hook | The check can be deterministic. |
| CI gate | The check should run for every branch or pull request. |
| Eval | The check requires judgment and should be replayed against agents. |

## Maturity Path

Start lightweight:

1. Write specs with stable acceptance criteria.
2. Require QA and PR packets for risky changes.
3. Add traceability scripts for deterministic checks.
4. Capture feedback events when a human correction should change the harness.
5. Add CI aggregation once multiple jobs emit useful signals.
6. Add visual and design validation as soon as UI work matters.
7. Periodically audit whether feedback events actually changed rules, prompts,
   templates, scripts, or gates.

The harness is successful when its artifacts get shorter, more precise, and
more trustworthy over time.
