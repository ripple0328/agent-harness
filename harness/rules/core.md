# Core rules

- Start with the user's intended outcome and existing context. Scale ceremony to uncertainty and risk: a small fix can use a short intent, test and result record; a larger feature needs a spec and phased plan.
- Preserve the authorized scope and existing work. Resolve routine choices from evidence; surface decisions only when missing information changes correctness, authority or irreversible consequences.
- Load only relevant workflow, role, rules and scoped project knowledge. Verify stale or conflicting context before dependent work.
- Choose small independently verifiable increments. Parallelize independent work with one owner per file or isolated checkouts and a named integrator.
- Test behavior changes at the least expensive meaningful layer. Name the failure each test would catch.
- Verification claims cite executed evidence for the relevant artifact version and environment. Marker presence, model confidence and reviewer agreement alone are not execution proof.
- Missing, skipped, stale, malformed and conflicting evidence remain explicit. A passing check cannot erase another failed required dimension.
- Reuse valid evidence when its inputs have not changed; invalidate it when code, dependencies, configuration, environment or requirements relevant to the claim change.
- Keep observations, curated context and promoted policy separate. Prefer deterministic checks over repeated prompt reminders.
- Record repeated or severe misses with supporting evidence. Evaluate a candidate against the baseline and controls before broad adoption.
- Update the spec, decisions and handoff when work changes them; report remaining gaps, owner and next action.
- Keep domain, language, framework, host, model and provider conventions in project adapters or optional extensions, outside the portable defaults.
