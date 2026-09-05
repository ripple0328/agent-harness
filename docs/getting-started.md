# How to use the harness

Begin with one real task. Tell the assistant what outcome you want, let it load
the relevant harness instructions, and judge the result by the evidence it
produces. Add capture and retrieval tools as they become useful.

For the reasoning behind this approach, read [Principles in practice](principles.md).
For exact script options, use [the tool reference](tool-reference.md).

## 1. Make the harness available

| Your situation | Setup |
|---|---|
| Working in this repository | Ask the assistant to read `AGENTS.md`. The core and tools are already present. |
| Adding it to an existing project | Copy `harness/` and merge the bootstrap instructions into the existing `AGENTS.md`. Preserve the project's README, rules and decisions. Add the tool files only if needed. |
| Starting with instructions only | Make `harness/` accessible and point the assistant at its README and relevant workflow. Use available project checks; report any harness checks that cannot run. |

The workflow instructions do not require a particular agent client or application
stack. The supplied scripts require Node.js 20+. To use them, copy `scripts/`
including `scripts/lib/`, and retain `harness/templates/`, where their schemas
live. Invoke the scripts directly or merge the needed package commands into the
project's package file. Keep the project's build and test commands intact.

Adapt `harness.config.example.json` into a project-local `harness.config.json`
when using AC tracing: set the actual spec and test paths and risk hints. Define
the relevant quality areas using
[the quality-policy template](../harness/templates/quality-policy.md). It records
decisions; the QA gate does not read that Markdown as configuration.

Copying these files does not start a daemon, install agent commands or connect
external systems. The assistant must load the instructions, and optional tools
or adapters must be invoked by the chosen workflow.

## 2. Give the assistant a task

Use this prompt in an assistant with access to the project:

```text
Read AGENTS.md and use this project's harness.

Outcome: <what should become possible or behave differently>
Constraints: <scope, compatibility, time and other limits>

Inspect existing behavior and relevant decisions. Choose a process proportional
to the risk, make the authorized change, and verify it with the project's checks.
Keep important assumptions and unresolved decisions visible. Finish with the
result, evidence, remaining gaps, and context or feedback worth preserving.
```

You do not need to name every phase. For a larger feature, the assistant should
use a spec and plan; for a small clear fix, a compact intent/check/result record
can be enough. Existing authorization carries across internal phases. Missing
information that materially affects correctness or a consequential decision
still needs your judgment.

To request one phase only, use the named task. These are ordinary prompt labels
mapped to files in [the task catalog](../harness/tasks/README.md), not shell or
slash commands installed by this repository.

| What you need | Example request | Expected result |
|---|---|---|
| Clarify requirements | “Use `define-spec` for this outcome.” | Observable acceptance criteria, scope and open questions |
| Plan ready work | “Use `plan-spec` for this spec.” | Small phases, affected files, checks and dependencies |
| Implement | “Use `implement-spec` to deliver this ready spec.” | Changed behavior, executed checks and updated evidence |
| Review | “Use `review` on this change against the spec.” | Actionable findings with supporting evidence |
| Verify | “Use `qa` to determine which criteria are satisfied.” | Per-criterion verdicts, gaps and residual risk |
| Resume | “Use `build-context` for this area, then resume from this handoff.” | Relevant current knowledge and a checked next action |
| Improve the process | “Use `improve-harness` to investigate this repeated miss.” | Confirmed cause, smallest useful change and verification |
| Compare a candidate | “Use `evaluate-harness` for this proposed workflow change.” | Baseline comparison and a scoped adoption decision |
| Observe after release | “Use `operate` to inspect this release's outcomes.” | Observations, recovery or follow-up actions and owners |

## 3. Follow one task through the loop

Suppose the request is: **allow a long-running operation to be cancelled**. No
particular interface, framework or deployment system is assumed.

| Step | Assistant action | Evidence you should expect |
|---|---|---|
| Understand | Inspect the operation and clarify what cancellation promises | A contract for stopping, reporting the outcome and preserving valid state |
| Specify and plan | Write observable criteria and choose a small implementation increment | Criteria for normal completion, cancellation and relevant boundary cases; exact checks |
| Build | Implement the agreed behavior using project patterns | A focused change with tests that can catch incorrect cancellation |
| Review and verify | Exercise normal completion, cancellation and state recovery; inspect the test expectations | Actual results for the changed artifact; explicit missing evidence |
| Accept or release | Complete the requested acceptance/release steps within authority | Verified artifact, relevant recovery plan and observation owner |
| Preserve and learn | Update a changed decision; investigate repeated test/review misses | Current context and a feedback candidate when justified |

If a cancellation check fails and then passes on retry, preserve both outcomes.
The assistant should investigate the difference before changing a rule or
quarantining the check. A confirmed product defect needs a fix and regression
evidence. A repeated process failure may also justify an evaluated harness change.

This is how the three loops work together: delivery fixes the current behavior,
context preserves a verified decision, and learning changes future procedure only
when the evidence supports it.

## 4. Know what a completed task looks like

A useful completion report answers:

- **What changed and why?** Connect the change to the requested outcome.
- **What was verified?** Name the actual checks, results and checked artifact.
- **What is still open?** List failed, skipped or unavailable checks with the reason and next owner.
- **What carries forward?** Link changed decisions, a handoff or a feedback event when useful.

“Tests pass” is incomplete if required recovery or compatibility checks did not
run. Static AC markers identify possible coverage; the agent must still verify
the behavior. Product acceptance and release follow the project's authority and
the scope you already gave.

## 5. Resume without rebuilding the whole conversation

Ask:

```text
Read AGENTS.md and <handoff path>. Check which inputs changed since the recorded
verification. Load relevant current context records when available, resolve
stale or conflicting sources, and continue the next authorized action.
```

Save unfinished work using [the handoff template](../harness/templates/handoff.md).
It records progress, open questions and the next action. Save a durable fact or
decision as context only after checking its source, scope and expiry.

The context builder needs at least one supplied record and writes a pack to
standard output. It does not inject that pack into the assistant. The workflow
must run it and read the result. If there are no curated records yet, read the
relevant source files directly; add records when they will save repeated work.

## 6. Add passive feedback and controlled learning

Start by wrapping an existing check. During that invocation, outcome metadata
is saved automatically; you do not have to rewrite the event manually. CI,
review, conversation and incident sources require their own configured adapters.

At a natural checkpoint, inspect repeated or severe observations and verify
their causes. Update a project decision when warranted. If the cause is a harness
gap, propose the smallest preventive change and compare it with the current
workflow before broad adoption. A canary is a limited real-project trial used to
observe benefit, regressions and cost.

“Continuous context” means useful knowledge is maintained between tasks.
“Passive feedback” means observations are captured during connected work. Neither
means a background system is already watching, classifying or rewriting rules.

For the commands, input formats and integration boundaries, continue to
[the tool reference](tool-reference.md). For a gradual rollout into multiple
projects, use [the adoption guide](adoption-guide.md).
