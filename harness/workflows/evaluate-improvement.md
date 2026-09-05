# Workflow: Evaluate a harness improvement

Treat a harness change as a software experiment. Improve reliable accepted work,
including the time and attention required to obtain it.

## Before editing

- Name a reproduced failure or opportunity, target layer, expected improvement,
  supported tasks/executors, allowed files and rollback.
- Freeze baseline and candidate identifiers, task cases, environments, tool
  permissions, cost/time budgets, trial count and independent graders.
- Keep the motivating failure, safe counterexamples and unrelated regression
  cases. Reserve held-out cases the candidate author does not tune against.
- Use current authority and host policy; a skill cannot approve its own access.

## Compare behavior

Run both versions against the same cases and conditions. Record actual final
state and retained invariants, failures, false positives, elapsed time, resource
cost and evidence locations for every attempt. Do not discard failing trials or
replace a failed run with its successful retry. Repeated stochastic runs and
uncertainty reporting must match the strength of the claim.

Use deterministic graders when a property is mechanically checkable. Calibrate
model or human graders against independent outcome examples, including false
alarms and missed failures. Do not let the candidate rewrite its own holdouts,
expected answers or acceptance thresholds. Inspect traces to diagnose a failure;
judge task completion from externally observable outcomes.

## Executable eligibility check

Populate `harness/templates/harness-evaluation.example.json` from actual paired
runs, then execute:

```bash
node scripts/evaluate-harness.mjs --input evaluation.json
```

The example is a **synthetic demonstration**, not effectiveness evidence. The
checker validates the supplied comparison: distinct versions, declared budget,
calibrated-grader and holdout assertions, required suites, repeated-trial counts,
complete measurements, a successful improvement on a motivating case, and retained behavior. Every regression and held-out control must demonstrate its required outcome. It rejects any
candidate invariant violation, new false positive, success regression or budget
overshoot. It reports `not-verified`, `rejected`, `no-measured-improvement`, or
`eligible-for-canary` and returns nonzero unless eligible.

This tool does not run agents, inspect referenced evidence, establish semantic
truth, prove independent grading or compute causal/statistical confidence. The
executor and evaluator must produce trustworthy inputs. Do not use fixture
passes to claim that agents follow a policy or that production delivery improved.

## Adopt cautiously and learn

An eligible comparison permits review for a bounded project canary. Define its
owner, affected work, observation window, stop/rollback conditions and delayed
outcomes before starting it. Compare useful completion, human review/repair,
escaped defects, reliability and cost. Do not merge distinct populations or
average severe regressions away. Promote only within the tested scope; a second
executor is necessary when a portability claim actually includes it.

After the observation window, record applied, deferred, rejected or reverted in
the ledger. Maintain regression fixtures and retire redundant instructions.
When a new case has been used for tuning, replace the held-out set before making
another generalization claim. An instruction that adds cost without preventing a
real failure should be simplified or removed.

## External skills

Inspect source, pinned revision, license, triggers, dependencies, hooks,
permissions, data movement and overlap before trying a skill. Record the result
in `harness/templates/skill-evaluation.md`. Prefer adapting one useful behavior
into an existing workflow when it avoids duplication. Any copied code or
substantial text retains its license notices. Compare with/without the skill on
representative tasks before calling it an improvement; popularity is discovery
information, not efficacy evidence.
