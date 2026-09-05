# Contracts and state rules

The filename is retained for compatibility. These rules apply to any software
boundary; they do not prescribe a network protocol or storage engine.

- Define inputs, outputs, failures, ownership and compatibility before changing a public contract.
- Validate at the receiving trust boundary and keep internal sensitive state out of exposed results.
- Make retry, duplicate, cancellation, ordering and partial-failure semantics explicit when applicable.
- Preserve invariants under concurrency. Choose transactions, constraints, locks or other mechanisms in the project layer.
- A persistent-state transition needs recovery or an explicit, justified limit on reversibility.
- Test upgrade and compatibility behavior when existing consumers or stored state are affected.
- Confirm dependent-system contracts and handle unavailability without leaking internal details.
- Use controlled substitutes for fast tests and real boundary integration evidence for the important assumptions.
