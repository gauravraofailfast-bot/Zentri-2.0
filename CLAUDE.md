# Zentri — Workflow & Operational Heuristics

Lean operational guide for Zentri development. For visual specs, see `DESIGN.md`. For mission architecture, see `MISSIONS.md`.

## Core Directives

### Pedagogy (Non-Negotiable)
- **Invisible Pedagogy**: Never "Wrong," "Incorrect," "Failed." Use: "Close!", "You're onto something!", "Try this approach."
- **Interaction > Information**: Students learn by doing. If tempted to add explainer card, rethink the mechanic.
- **Concept → Unique Mechanic**: sin/cos/tan is bow angle, not MCQ. Each concept gets distinct play experience.
- **Learning Inside Gameplay**: All learning embedded in interaction. No passive content.

### Engineering
- **Test-First**: Before implementing a feature, write test/verification tool to confirm logic.
- **Plan Classification**: Classify every plan as **over-engineered**, **under-engineered**, or **appropriately engineered** (one paragraph why).
- **No Placeholders**: Every mission in manifest must be fully playable. `implemented: false` = unfinished.
- **End-to-End Testing**: Click every button, complete every flow. Rendering ≠ working.
- **Commit After Feature**: Verify → commit → push → verify on production.

### Context Management
- If session exceeds 50% capacity, notify user to avoid "Dumb Zone."
- Spawn **3–5 sub-agents in parallel** for complex research (physics logic, API design, pedagogy validation).

## Operational Workflow

### When Starting Work
1. Check which phase (Foundation / Backend / Polish / Testing).
2. If touching UI: skim `DESIGN.md` for palette, fonts, patterns.
3. If touching gameplay: skim `MISSIONS.md` for three-layer structure and examples.
4. Write test/verification tool before implementation.

### When Debugging Complex Problems
- For multi-path solutions (hint engine design, multiplayer architecture), spawn 3–5 agents in parallel.
- Summarize findings before proposing solution.

### When Committing
- Verify end-to-end (test in browser).
- Commit immediately after verification.
- Push and verify deployment reflects changes.

### When Updating Design
- Update `DESIGN.md` or `MISSIONS.md` only when deliberate and documented.
- Notify user if violating a design principle.

## Tone & Copy Rules

Warm coach, never judge. Key patterns:

| Context | ✅ Do | ❌ Never |
|---------|------|---------|
| Mission Intro | "You stand in a lighthouse. A ship is adrift..." | "Learn angle of depression and formula D = H / tan θ." |
| Problem | "Height = 20m, Angle = 35°. Distance = ?" (visual) | "What is the distance of the ship if..." |
| Success | "You found distance using tan 35°. That's trigonometry." | "Mission complete! +4 confidence. Great job!" |
| Hint | "You're close! Remember: tan θ = opp/adj. What's tan 35°?" | "Incorrect. Try again." |

## Quality Gate

Before marking done:
- [ ] Can student complete without explainer text?
- [ ] One NCERT concept covered; cites chapter & example?
- [ ] Zero negative-feedback words?
- [ ] Feedback reinforces concept, not perfection?
- [ ] Touch-first (mobile-optimized)?
- [ ] Accessible (ARIA, keyboard, color-blind safe)?
- [ ] Performance (<3s load, 60fps on iPhone 8)?

## Tech Stack (Pending User Decision)

**Questions waiting:**
1. Framework: Next.js | Vite + backend?
2. Database: Supabase | PostgreSQL | Firebase?
3. Multiplayer: WebSocket | SSE | Polling?
4. AI Hints: Rule-based MVP | ML?
5. Timeline: Aug 2026 | EOY | open-ended?

See `/memory/zentri_tech_decisions.md` for detailed options.

## Red Flags

🚩 Mission has "instructions" card → Move into mechanics.
🚩 Feedback uses "score," "XP," "points" → Reframe as constellation.
🚩 Mission is MCQ + diagram → Redesign as interactive.
🚩 Hint says "try again" → Replace with specific coaching.
🚩 UI color not in dusk palette → Use CSS custom properties.
🚩 Leaderboard ranks by score → Show contribution size instead.

## References

- **Design Specs**: `DESIGN.md` (colors, fonts, glass-morphism, UI patterns)
- **Mission Architecture**: `MISSIONS.md` (three-layer structure, mission catalog, quality gates)
- **Design Chat**: `/chats/chat1.md` (full intent & iterations)
- **NCERT Ch 8**: `/project/uploads/jemh108.txt` (concepts)
- **NCERT Ch 9**: `/project/uploads/jemh109.txt` (concepts)
- **Project Memory**: `/memory/MEMORY.md` (auto-loads next session)
- **Prototype**: `/project/` (HTML/CSS/JS reference)

---

**Last Updated**: 2026-04-22  
**Handoff From**: Claude Design (2026-04-21)  
**Maintained By**: [You]
