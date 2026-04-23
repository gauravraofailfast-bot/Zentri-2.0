# Sprint 0 — Locked Scope

**Status**: Planning → Implementation  
**Kickoff**: 2026-04-23  
**Target completion**: 2026-04-26 (3 days)  
**Model**: Claude Haiku (cost-optimized)  
**Branch**: `feature/s0-foundation`  

---

## What S0 delivers (no more, no less)

### Infrastructure & Backend
- [ ] Vite + TypeScript + React 18 scaffold with proper build tooling
- [ ] Supabase project configured with 6-table schema (profiles, concepts, landmarks, progress, entitlements, leaderboard_weekly)
- [ ] Row-Level Security (RLS) policies on all tables
- [ ] Firebase → Supabase migration script for Class X Math concepts
- [ ] Environment variables (.env.local) configured and documented

### Codebase Refactor (No visual changes to player)
- [ ] Extract 14 existing missions → 7 reusable mechanic components
  - tap-identify
  - drag-angle-release
  - slider-live-readout
  - drag-to-order
  - two-point-measure
  - drag-match-slot
  - build-diagram
- [ ] Universal progress store (IndexedDB + Supabase sync) with offline-first architecture
- [ ] Manifest loader that reads curriculum YAML and routes to mechanics
- [ ] Entitlement checker (paywall hook, non-functional in S0)

### Frontend Scaffolding
- [ ] Service worker skeleton with Workbox (caching configured but no asset bundles yet)
- [ ] PWA manifest for installability
- [ ] TypeScript types for curriculum, concepts, progress
- [ ] Auth skeleton (Supabase auth ready, UI deferred to S1)

### Content Data
- [ ] Class X Math concepts migrated from Firebase to Supabase
- [ ] `curricula/class10-math/en/manifest.yaml` created, referencing all concepts
- [ ] 14 landmarks configured in Supabase with mechanic mappings

### Deployment
- [ ] Vercel deployment working (blank app shell, no journey engine UI)
- [ ] GitHub branch with all S0 commits
- [ ] Zero console errors on app load

---

## What's NOT in S0 (explicitly deferred)

- ❌ Journey engine (parallax scroll, world camera) → **S1**
- ❌ Fold cinematic animation → **S1**
- ❌ Companion system or sprites → **S1**
- ❌ Sketchbook UI → **S1**
- ❌ Audio or sound system → **S1**
- ❌ Biome visuals or backgrounds → **S1**
- ❌ Paywall UI or payment integration → **Phase 3 (post-MVP)**
- ❌ Leaderboard UI → **S2**
- ❌ Spaced-repetition scheduler → **S2**
- ❌ Curriculum authoring agent → **Deferred (use Firebase concepts as-is)**
- ❌ Multi-language UI → **S2 (architecture ready, English content only)**

---

## Exit criteria (all must pass)

- [ ] App loads on Vercel without console errors
- [ ] All 14 existing missions runnable via mechanic library (visually identical to current Zentri)
- [ ] Supabase DB contains Class X Math concepts + landmarks
- [ ] IndexedDB progress syncs to Supabase when online
- [ ] Service worker registers (`navigator.serviceWorker` ready)
- [ ] PWA installable on Android (add to home screen works)
- [ ] No hardcoded mission logic in app code (all config-driven)
- [ ] Git history clean with meaningful commits

---

## Known constraints & assumptions

- Class X Math only (no multi-curriculum in S0)
- English language only
- Firebase concepts extracted and migrated (not regenerated)
- Current Zentri visual/UX preserved (no design changes)
- No user authentication flow UI (Supabase auth wired but login screen deferred)
- Paywall hooks built (entitlements table exists) but no payment processing
- No analytics tracking in S0

---

## Scope creep prevention

If new ideas emerge:
1. Document in `BACKLOG.md` with target sprint
2. Do NOT add to S0
3. Reference this locked plan if questioned

**All S0 tasks are blocking.** Cannot move to S1 until 100% of exit criteria pass.

---

## Success definition

When S0 is done, we should be able to:
1. Visit Vercel URL → app loads
2. See current Zentri (same UI as today)
3. Open DevTools → zero errors
4. Click any mission → runs via mechanic library (invisible refactor)
5. Progress syncs to Supabase backend
6. Close app, reopen → progress persists (offline-first works)

That's S0 success. S1 starts only after this verification.
