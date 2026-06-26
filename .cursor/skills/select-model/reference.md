# Model selection reference

Extended task classification. Default one tier lower when unsure.

## T1 — Fast

- Fix lint/format issues
- Update strings, metadata, SEO titles
- Add or remove a single import
- Rename a variable in one file
- Answer "where is X?" with grep/read (no subagent)
- Run a single shell command
- Update dependency version with no API change

## T2 — Standard

- New UI component with existing patterns
- CRUD endpoint following project conventions
- Write unit tests for isolated function
- Fix bug with clear stack trace and local scope
- Migrate one API call to a new shape
- Internal linking / SEO page metadata updates
- CI investigator for one failing check
- Bugbot-style diff review (non-security)

## T3 — Strong

- Refactor shared module used by 3+ callers
- Debug flaky or non-deterministic behavior
- Optimize hot path / query / bundle size
- Complex TypeScript generics or state management
- Database migration with data backfill
- Integrate third-party SDK with edge cases
- Multi-file feature with tests

## T4 — Premium

- System architecture proposal with trade-offs
- Security review (auth, injection, secrets, RLS)
- Design novel algorithm or domain model
- Third T3 attempt still failing
- User explicitly wants maximum quality

## Parallelism vs premium

Prefer **multiple T1/T2 subagents in parallel** over one T4 agent when:

- Searching several unrelated areas of the codebase
- Running independent shell checks (lint + test + typecheck)
- Gathering context before a T2 implementation pass

Use **one T3/T4 agent** when:

- Steps depend on prior findings
- Whole-repo reasoning is required
- Edits must stay consistent across many files

## Cost checklist

Before launching subagents:

- [ ] Can grep/read answer this without a subagent?
- [ ] Can `explore` at T1 replace `generalPurpose` at T3?
- [ ] Are subagents parallelizable instead of sequential?
- [ ] Is Plan mode enough to avoid a wrong T3 implementation pass?
