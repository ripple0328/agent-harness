# AI-First Software Delivery Sources

**Last curated:** 2026-09-05

The daily loop uses this registry as a starting point, not a closed list. `core`
sources are checked on their stated cadence. `watch` sources are checked when a
related signal appears. `paused` sources remain documented but are skipped.

## Curated Sources

This publication includes public sources only. Private collections, account
activity and execution metadata are omitted. The last-checked dates below are
historical observations, not claims of current availability.

| Priority | Source | Type | Authority | Cadence | Last checked | Focus |
|---|---|---|---|---|---|---|
| core | [OpenAI Codex documentation](https://developers.openai.com/codex/) | official docs | primary | daily | 2026-09-03; current documentation surfaces were retrieved, including plugins, hooks, permissions, security, SDK, app-server, and non-interactive workflows; no single documentation-diff feed was available | Codex capabilities, configuration, safety, and workflows |
| core | [OpenAI Codex changelog](https://developers.openai.com/codex/changelog) | official changelog | primary | daily | 2026-09-03; 0.153.0 is current and includes session-reconnect, Guardian-history, rollback/subagent-isolation, and app-account-scoped MCP approval behavior | Product and workflow changes |
| core | [OpenAI engineering](https://openai.com/news/engineering/) | official blog | primary for described practice | daily | 2026-09-03; the current index lists a 2026-08-25 inference article as latest, with no newer harness-workflow item | Harness, orchestration, eval, and agent operating models |
| core | [OpenAI Developers Codex blog](https://developers.openai.com/blog) | official blog | primary for described practice and published evals | daily | 2026-09-03; reviewed 2026-08-19 through 2026-08-25 posts on open harness ownership, durable notebook-style automation, and evidence-plus-human security decisions | Repository guidance, code review, eval design, and agent workflows |
| core | [Claude Code changelog](https://github.com/anthropics/claude-code/releases) | official changelog | primary | daily | 2026-09-03; 2.1.259 from 2026-09-02 is current and 2.1.257 through 2.1.259 change managed MCP, fail-deny, session-state, sandbox, permission, and subagent-delivery behavior; no local negative-test reproduction was attempted | Agents, hooks, skills, permissions, worktrees, and reliability |
| core | [Claude Code documentation](https://code.claude.com/docs/en/overview) | official docs | primary | daily | 2026-09-03; current overview retrieved; no separately dated generic workflow delta was isolated beyond the release record | Agent workflows and integration patterns |
| core | [Xcode release notes](https://developer.apple.com/documentation/xcode-release-notes) | official release notes | primary | daily | 2026-09-03; Xcode 27 beta 6 availability and system requirements were verified, but no beta-6-specific Coding Intelligence workflow delta was isolated | Coding intelligence, testing, build, and release workflows |
| core | [GitHub changelog](https://github.blog/changelog/) | official changelog | primary | daily | 2026-09-03; reviewed Copilot content exclusions, optional pull-request approval, review changes, and the announced 2026-09-28 policy and retention defaults; no organization setting was changed | Coding agents, review, Actions, security, and repository controls |
| core | [Current software-engineering paper feed](https://export.arxiv.org/api/query?search_query=cat%3Acs.SE&sortBy=submittedDate&sortOrder=descending) | official paper metadata | primary for paper metadata | daily | 2026-09-03; direct official-feed retrieval exposed current work on harness evolution and transfer, judge competence, deterministic GitOps application, executable tool validation, and trajectory-aware evaluation | Empirical AI-assisted delivery, agent evaluation, testing, and verification research |
| watch | [Model Context Protocol](https://modelcontextprotocol.io/docs/getting-started/intro) | official standard docs | primary | weekly | 2026-09-03; no later dated release was found after the 2026-07-28 specification | Tool and context interoperability |
| watch | [Agent Plugins](https://agent-plugins.org/specification) | open cross-vendor standard | primary | weekly | 2026-09-03; version 1.0.0 now identifies itself as Published; it standardizes portable packaging but leaves runtime, permission, and trust enforcement to hosts | Portable skill and MCP packaging, conformance, extensions, and trust boundaries |
| watch | [Thoughtworks Technology Radar](https://www.thoughtworks.com/radar) | practitioner research | corroborated | each edition | 2026-08-05 | AI-assisted delivery practices and cautions |
| watch | [How Do Practitioners Build SE Agents?](https://arxiv.org/abs/2607.10856) | empirical preprint | primary for its reported study | revisions | 2026-08-18; latest revision remained 2026-07-25 | Evaluation-driven development, comprehension debt, and provider-side behavioral drift |
| watch | [Self-Evolving Coding Agents](https://arxiv.org/abs/2608.03392) | survey preprint | primary for its synthesis | revisions | 2026-08-18; no revision after the 2026-08-04 submission | Feedback reliability, memory and skill evolution, benchmark overfitting, and long-term software quality |
| watch | [Active-SWE](https://arxiv.org/abs/2608.04682) | benchmark preprint and code | primary for its reported evaluation | revisions | 2026-08-18; no revision after the 2026-08-05 v1 and no local reproduction was attempted | Proactive bug discovery without issue reports, localization, multi-bug repair, and verifier design |
| watch | [Agent Skills Can Be Harmful](https://arxiv.org/abs/2608.11888) | empirical preprint | primary for its reported study | revisions | 2026-08-18; no revision after the 2026-08-12 v1 and no local reproduction was attempted | Skill/no-skill attribution, functional regressions, procedure cost, and trajectory evidence |
| watch | [SWE-Skills-Bench](https://arxiv.org/abs/2603.15401) | preliminary benchmark preprint and dataset | primary for its reported evaluation | revisions | 2026-08-18; no revision after the 2026-03-16 v1 and no local reproduction was attempted | Marginal skill utility, acceptance-criteria verification, domain fit, and token cost |
| watch | [The Devil Is in the Interface](https://arxiv.org/abs/2608.11386) | controlled preprint | primary for its reported study | revisions | 2026-08-18; no revision after the 2026-08-11 v1 and no local reproduction was attempted | Tool-interface effects on consistency, exploration, steps, tokens, and agent behavior |
| watch | [Does Fixing Break Security?](https://arxiv.org/abs/2608.13404) | accepted empirical paper | primary for its reported study | revisions | 2026-08-18; latest revision remained 2026-08-14 and no local reproduction was attempted | Pass-to-fail invariant transitions, cumulative-best masking, repair budgets, and security-aware verification |
| watch | [QuoteBench](https://arxiv.org/abs/2608.13547) | controlled preprint and artifact | primary for its reported study | revisions | 2026-08-18; latest version remained the 2026-08-13 v1 crossed evaluation; no local reproduction was attempted | Command-path attribution, final-state validation, serializer and parser boundaries, and path-matched evaluation |
| watch | [Vero](https://arxiv.org/abs/2608.13522) | benchmark preprint and code | primary for its reported evaluation | revisions | 2026-08-18; latest version remained 2026-08-13 v1; the paper and live project page disagree on corpus size and the benchmark was not run locally | Repository-scale formal verification, specification auditing, full-solve metrics, and proof-oracle design |
| watch | [LegacyWorld](https://arxiv.org/abs/2608.14131) | accepted empirical paper and replication repository | primary for its reported evaluation | revisions | 2026-08-18; latest version remained 2026-08-14 v1 and no local reproduction was attempted | Stateful agent workflows, useful completion, valid and invalid failure, forbidden side effects, and independent final-state validation |
| watch | [The Working Set of a Coding Agent](https://arxiv.org/abs/2608.16630) | controlled preprint and artifact | primary for its reported study | revisions | 2026-08-18; reviewed the 2026-08-17 v1 paper, migration controls, edit-time fact-availability model, limitations, and public artifact; no local reproduction was attempted | Coherence debt, current and consistent edit-coupled facts, stale instructions, handoff gaps, and output-grounded validation |
| watch | [When Agents Coordinate](https://arxiv.org/abs/2608.16801) | controlled preprint and dataset | primary for its reported study | revisions | 2026-08-18; reviewed the 2026-08-17 v1 paper, 1,902-run main grid, 244-run sealed replication, conditional file-channel result, coordinator result, and validity limits; no local reproduction was attempted | Multi-agent coordination topology, shared-artifact economics, nominal leadership, containment, and coordination measurement |
| watch | [HarnessDev](https://arxiv.org/abs/2609.01437) | controlled preprint and artifact | primary for its reported study | revisions | 2026-09-03; reviewed the 2026-09-01 v1 paper's six creator models, four domains, five benchmarks, 2,207 tasks, executor switches, held-out transfer, token efficiency, uncertainty, and limitations; no local reproduction was attempted | Harness creation and evolution, held-out generalization, executor dependence, capability, cost, and regression risk |
| watch | [DORA research](https://cloud.google.com/blog/products/ai-machine-learning/announcing-the-2025-dora-report) | observational research | primary for reported findings | new editions | 2026-09-05 | Delivery throughput, stability and organizational conditions; not causal harness proof |
| watch | [NIST SSDF](https://csrc.nist.gov/pubs/sp/800/218/final) | published guidance | primary | revisions | 2026-09-05 | Security across the full lifecycle |
| watch | [Anthropic context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) | engineering guidance | primary for described practice | relevant changes | 2026-09-05 | Selective context, structured notes and retrieval |
| watch | [Anthropic agent evaluations](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents) | engineering guidance | primary for described practice | relevant changes | 2026-09-05 | Final outcomes, repeated trials and calibrated graders |
| watch | [Google testing strategy](https://testing.googleblog.com/2021/06/how-much-testing-is-enough.html) | practitioner guidance | primary | relevant changes | 2026-09-05 | Risk-based layers and field failures |
| watch | [Google SRE postmortems](https://sre.google/sre-book/postmortem-culture/) | practitioner guidance | primary | relevant changes | 2026-09-05 | Operational feedback, ownership and reliability |
| watch | [METR productivity research](https://metr.org/blog/2026-02-24-uplift-update/) | empirical research update | primary for reported study | new studies | 2026-09-05 | Task selection, time accounting and validity limits |
| watch | [Developer field experiments](https://www.microsoft.com/en-us/research/publication/the-effects-of-generative-ai-on-high-skilled-work-evidence-from-three-field-experiments-with-software-developers/) | randomized studies | primary for reported study | new studies | 2026-09-05 | Task output versus production reliability |
| watch | [Superpowers source](https://github.com/obra/superpowers/tree/b36e0829c6d0140e93cfef2ca599b1b07d4a7797) | workflow source | primary for content only | concrete skill gap | 2026-09-05 | Pinned source, license, overlap and marginal utility; no import justified |
| watch | [OpenAI agent evaluations](https://developers.openai.com/api/docs/guides/agent-evals) | official guidance | primary for described practice | relevant changes | 2026-09-05 | Outcome evaluation and trace diagnosis |

## Seed Reference Documents

These are stable starting points for the local knowledge base:

- [Harness engineering: leveraging Codex in an agent-first world](https://openai.com/index/harness-engineering/) — repository knowledge, agent legibility, mechanical invariants, feedback loops, and doc gardening.
- [An open-source spec for Codex orchestration: Symphony](https://openai.com/index/open-source-codex-orchestration-symphony/) — task systems as an orchestration control plane.
- [Unrolling the Codex agent loop](https://openai.com/index/unrolling-the-codex-agent-loop/) — primary description of the model-tool harness loop.
- [Unlocking the Codex harness: how we built the App Server](https://openai.com/index/unlocking-the-codex-harness/) — thread, tool, client, and protocol boundaries.
- [Xcode 26 release notes](https://developer.apple.com/documentation/xcode-release-notes/xcode-26-release-notes) — current coding-intelligence and build-tool changes.

## Public Discovery Feeds

These public vendor feeds are optional discovery sources. Inclusion does not
imply that any account is followed, connected or accessed by this repository.

- [OpenAI Developers](https://x.com/OpenAIDevs)
- [Anthropic](https://x.com/AnthropicAI)
- [GitHub](https://x.com/github)
- [Apple Developer](https://x.com/AppleDeveloper)

## Curation Rules

- Prefer stable canonical URLs over reposts, screenshots, or summaries.
- Preserve publication date and access date in the dated research note.
- Record paywalls, deleted posts, login failures, timeouts, and inaccessible
  sources as not verified.
- Pause sources that repeatedly add volume without actionable delivery signal.
- Add practitioner accounts only with a focus statement; follower count is not
  an authority grade.
