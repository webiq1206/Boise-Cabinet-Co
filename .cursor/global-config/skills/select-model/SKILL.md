---
name: select-model
description: >-
  Selects the appropriate Cursor model and interaction mode based on task
  complexity to balance quality and cost. Use at the start of every task and
  before launching subagents — for coding, debugging, refactors, exploration,
  reviews, planning, or when choosing between Agent, Plan, Ask, or Debug mode.
---

# Select Model

Route every task to the right model tier and mode. Default to the cheapest tier that can succeed; escalate only when signals justify it.

## Quick decision

1. **Classify the task** (see tiers below).
2. **Pick mode** (Agent / Plan / Ask / Debug).
3. **Pick model tier** for the work.
4. **For subagents**: always pass an explicit `model` on the Task tool.
5. **For main chat**: if the current session model is below the required tier, say so briefly and continue if possible — or ask the user to switch before heavy work.

## Task tiers

| Tier | When to use | Examples |
|------|-------------|----------|
| **T1 — Fast** | Single-file, mechanical, low ambiguity | Rename symbol, fix typo, format, simple grep, update copy, add import, config tweak |
| **T2 — Standard** | Typical multi-step coding with clear scope | Feature in 1–3 files, moderate bug fix, test additions, API wiring, component work |
| **T3 — Strong** | Multi-file, subtle logic, or high correctness bar | Cross-module refactor, race conditions, performance work, complex types, tricky migrations |
| **T4 — Premium** | Highest reasoning depth or repeated T3 failure | Architecture decisions, security audit, novel algorithm design, root-cause of elusive bugs |

**Bias toward the lower tier.** Escalate one tier at a time, not straight to premium.

## Model routing

Use these slugs when calling the Task tool. For main chat, recommend the same tier to the user if they need to switch models manually.

| Tier | Primary model | Alternate |
|------|---------------|-----------|
| **T1** | `composer-2.5-fast` | `claude-4.5-haiku-thinking` |
| **T2** | `claude-4.6-sonnet-medium-thinking` | `gpt-5.4-medium` |
| **T3** | `gpt-5.3-codex` | `claude-4.5-sonnet-thinking` |
| **T4** | `claude-opus-4-8-thinking-high` | `claude-opus-4-7-thinking-xhigh` |

### Specialist overrides

Prefer these even when tier alone would suggest otherwise:

| Task shape | Model |
|------------|-------|
| Deep code generation, multi-file edits, test-driven fixes | `gpt-5.3-codex` |
| Broad repo exploration (many files, unknown location) | `composer-2.5-fast` via `explore` subagent |
| Security-sensitive review | `claude-opus-4-8-thinking-high` (T4) |
| Quick read-only Q&A ("where is X defined?") | `claude-4.5-haiku-thinking` or answer inline without subagent |

If the user requests a specific model, use it. Do not substitute.

## Mode selection

| Mode | Use when |
|------|----------|
| **Agent** | Clear implementation goal; ready to edit, run commands, ship |
| **Plan** | Multiple valid approaches, large scope, unclear requirements, or architecture trade-offs |
| **Ask** | Read-only: explain code, compare options, review without changes |
| **Debug** | Bug, test failure, or unexpected behavior — need runtime evidence before fixing |

Switch proactively: start in **Plan** for ambiguous large work; switch to **Agent** once the approach is settled. Use **Ask** when the user only wants understanding.

## Subagent routing

When using the Task tool, **always set `model`** from the table above. Match `subagent_type` to task shape:

| Subagent | Model tier | Typical use |
|----------|------------|-------------|
| `explore` | T1 | Find files, map codebase, keyword search |
| `shell` | T1–T2 | Git, build, CI commands |
| `generalPurpose` | T2–T3 | Multi-step research + edits |
| `bugbot` | T3 | Code review of diffs |
| `security-review` | T4 | Security review of diffs |
| `ci-investigator` | T2 | Single failing check diagnosis |

Run independent subagents **in parallel** at T1–T2 when possible instead of one T4 agent doing sequential exploration.

## Escalate when

- Two failed attempts at the same approach on T2+
- User says quality isn't good enough
- Task spans 5+ files with coupling or unclear boundaries
- Subtle correctness: concurrency, auth, payments, data loss risk
- Explicit user request for best quality

## Do not escalate when

- Answer is findable with grep/read (do that first)
- One-file cosmetic or config change
- User asked for speed or cost savings
- Subagent is only fetching a path or running a single command
- Plan mode already narrowed the approach — execute at T2

## Main chat limitation

The agent cannot change the user's model picker. When tier > likely current model:

1. State the recommended model and tier in one sentence.
2. Continue with lightweight steps (read, classify, plan) on the current model.
3. Before large edits or subagent fan-out, ask the user to switch — or use Task subagents at the correct tier so work runs on the right model even if main chat is lower.

## Examples

**"Fix typo in README"** → T1, Agent mode, no subagent.

**"Add pagination to the blog list"** → T2, Agent mode, main work inline; `explore` at T1 only if route files are unknown.

**"Refactor auth across 8 files"** → Plan first, then T3 Agent or T3 `generalPurpose` subagent.

**"Why does checkout fail intermittently?"** → Debug mode, T3; escalate to T4 if two hypotheses fail.

**"Review my branch for security issues"** → Ask or Agent, T4 `security-review` subagent.

For the full task-to-tier matrix, see [reference.md](reference.md).
