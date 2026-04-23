# Zentri Workflow & Heuristics

## Sprint Planning & Scope Discipline

**ALL sprints must reference the locked scope document before starting work.**

- **Sprint 0**: See `SPRINT_0_LOCKED.md` + `SPRINT_0_ARCHITECTURE.md`
  - No scope creep. Exit criteria must all pass before moving to S1.
  - All deferred items go to `BACKLOG.md`, not into S0.
- **Future Sprints**: Locked scope docs created before implementation.

## Core Directives
- **Invisible Pedagogy**: Never use negative terms like "Wrong," "Incorrect," or "Failed". Use "Close!", "You're onto something!", or "Try this approach".
- **Test-First Development**: Before implementing a feature, create a verification tool or unit test to confirm the logic works.
- **No Placeholder Items**: Every mission in a manifest must be fully playable. No `implemented: false` flags left in production data.
- **Commit After Feature**: Verify end-to-end → commit → push → verify on production.

## Operational Workflow
- **Calibration**: For complex debugging or physics-based mission logic, spawn **3–5 sub-agents** to research parallel implementation paths.
- **Design Reference**: Read `DESIGN.md` before any UI/CSS changes.
- **Mission Reference**: Read `MISSIONS.md` before implementing or modifying gameplay layers.
- **Architecture Reference**: Read `SPRINT_0_ARCHITECTURE.md` for S0 tech stack + data model.
