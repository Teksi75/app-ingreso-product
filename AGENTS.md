## Repository Rules

- Never add `Co-Authored-By` or AI attribution to commits.
- Use conventional commits only.
- Never run production builds after changes.
- Verify with targeted tests, lint, typecheck, or static inspection when appropriate.
- Keep responses short by default.
- Ask at most one question at a time. After asking it, stop and wait.
- Verify technical claims before stating them.

## Knowledge & Context

- Use Engram as the primary persistent memory for project decisions, discoveries, bugs, patterns, session summaries, and SDD artifacts.
- Do not require Graphify during normal development.
- Do not treat `graphify-out/` as a required source of truth.
- If structural exploration is needed, prefer targeted code reading or delegated exploration via sub-agents.
- Graphify may be used manually as an optional analysis tool only when explicitly requested.

## SDD & Multi-Agent Workflow

- Use SDD for substantial changes: proposal, specs, design, tasks, apply, verify, archive.
- Use sub-agents for broad exploration, multi-file implementation, or independent verification.
- Keep worker tasks bounded, explicit, and scoped to clear files or responsibilities.
- The orchestrator coordinates and synthesizes; workers execute; verifiers review.
- Pass relevant Engram context to sub-agents instead of relying on duplicated local knowledge systems.