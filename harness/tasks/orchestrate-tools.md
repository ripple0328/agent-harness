# Task: orchestrate-tools

## Use When

A task should use existing agent-tool capabilities such as code execution,
browser checks, repository/PR tools, bounded loops, scheduled runs, monitors,
sub-agents, or proposed-patch mode.

## Load

- `docs/agent-tooling-playbook.md`
- `harness/workflows/tool-assisted-learning-loop.md`
- relevant task and workflow for the actual job
- `harness/templates/tool-capability-map.md`

## Steps

1. List available capabilities.
2. Choose the smallest capability set for the job.
3. Define bounds, stop conditions, and escalation conditions.
4. Run the tool-assisted workflow.
5. Emit the structured packet.
6. Route harness misses to `improve-harness`.

## Output

- tool capability map
- structured packet or proposed patch
- run trace
- follow-up schedule or monitor, if needed
