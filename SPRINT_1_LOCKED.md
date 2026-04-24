# Sprint 1 — Alto Journey (Locked Scope)

**Status**: In Progress  
**Kickoff**: 2026-04-24  
**Branch**: `claude/thirsty-joliot-8a5b3e`  
**Depends on**: S0 foundation (mechanics library, manifest loader, IDB sync — all complete)

---

## The Problem with S0's UI

S0 left a beautiful dusk UI (Lobby → World map → Progress) where missions are discrete icons you tap, play in a modal, then return to the map. That pattern feels like a homework app, not a game.

The user wants **Alto's Odyssey** — a single seamless journey where Kavya drifts across India, and challenges rise organically from the landscape without ever breaking the sense of motion.

---

## What Sprint 1 Delivers

### Core: Seamless Journey Scene (`src/scenes/Journey.tsx`)

- Single scrollable world that IS the game — no tab bar during play
- Three parallax layers moving at different speeds: stars (slow), silhouette (medium), foreground (fast)
- Biome gradient interpolation: background colour smoothly shifts across 5 Indian settings as you scroll (Jaipur rose → Goa teal → Pahalgam indigo → Amritsar gold → Nalanda green)
- Kavya (Orb) pinned at viewport centre — the world scrolls past her
- Landmark markers loaded from `manifest.yaml` (no hardcoded mission list)
- Proximity detection: when a landmark drifts within ~120px of viewport centre, show a pulsing "Tap to enter" beacon
- **Inline mechanic activation**: tapping activates the mechanic *inside the current viewport* behind a glass panel — no scene change, no route transition
- `onComplete` → `saveProgress()` to IndexedDB → landmark turns teal → scroll auto-advances to next landmark
- HUD: "Camp" button (top-left), biome name chip (top-right), Sky icon (top-right)

### Camp Overlay (`src/scenes/CampOverlay.tsx`)

Re-skin of the existing Lobby as a **bottom-sheet panel** that slides over the journey when the Camp button is pressed. Retains the confidence meter, streak chip, and tonight's quests list from the current Lobby design. "Continue Journey" button dismisses it.

### Sky Overlay (`src/scenes/SkyOverlay.tsx`)

Re-skin of the existing Progress scene as a **top-sheet drawer** that slides down when the Sky icon is pressed. Retains the constellation map and story timeline.

### Desktop Portrait Frame (`src/index.css`)

At `≥900px`: the 402px journey column is centred in a full-bleed dusk ambient canvas (stars + gradient). Feels intentional — a game played in a portrait window — not a stretched mobile layout.

---

## Architecture Changes

| Before (S0) | After (S1) |
|---|---|
| `Scene` union: onboarding / lobby / world / progress / raid | `Scene` union: `onboarding` / `journey` |
| TabBar always visible during play | TabBar removed from journey; Camp/Sky are overlays |
| World.tsx: 7 hardcoded mission icons | Journey.tsx: manifest-driven landmark scroll |
| Missions open new scene | Mechanics render inline, no scene change |
| Lobby.tsx: standalone scene | CampOverlay.tsx: bottom-sheet within journey |
| Progress.tsx: standalone scene | SkyOverlay.tsx: top-sheet within journey |

**Files added**: `Journey.tsx`, `CampOverlay.tsx`, `SkyOverlay.tsx`  
**Files updated**: `App.tsx`, `index.css`, `TapIdentify.tsx`, `DragAngleRelease.tsx` (fix Tailwind class names)  
**Files retired** (kept, not routed): `World.tsx`, `Lobby.tsx` (as standalone scenes — Camp/Sky replace them)

---

## Biome Style Map

| Biome ID | Location | Sky Gradient | Accent |
|---|---|---|---|
| `pink-city` | Jaipur | `#0a1028 → #3b2a62 → #8a3a5e` | `--ember` |
| `coastal-dusk` | Goa | `#0a1028 → #0e2a4a → #1a6a6a` | `--teal` |
| `valley-lanterns` | Pahalgam | `#05061a → #1a1f4d → #2a1a5e` | `--violet` |
| `golden-water` | Amritsar | `#0a0f24 → #2a1f0a → #6a4a1a` | `--gold` |
| `bodhi-grove` | Nalanda | `#050f0a → #0a2a1a → #1a4a2e` | `--teal` |

---

## Playable Landmarks in This Sprint

5 landmarks with full mechanic configs from the manifest (biomes 3–4 have no landmarks yet — they show as ambient biome transitions only):

| # | Landmark | Biome | Mechanic |
|---|---|---|---|
| 1 | Hawa Mahal Triangle Anatomy | Pink City | `tap-identify` |
| 2 | Jantar Mantar Ratios | Pink City | `slider-live-readout` |
| 3 | Archer's Angle | Pink City | `drag-angle-release` |
| 4 | Dona Paula Line of Sight | Coastal Dusk | `tap-identify` |
| 5 | Nalanda Summit | Bodhi Grove | `composite-challenge` |

---

## What's NOT in Sprint 1 (explicitly deferred)

- ❌ Character sprite walker — Kavya stays as Orb
- ❌ Audio / ambient raag beds — manifest has the config, implementation deferred to S2
- ❌ Biome 3 + 4 landmark content (no landmarks defined in manifest yet)
- ❌ Raid / multiplayer in the journey
- ❌ Login UI — still anonymous IDB-only
- ❌ Paywall biome gating
- ❌ Supabase real-time sync (IDB offline-first only)
- ❌ Spaced-repetition scheduler

---

## Exit Criteria (all must pass before S2)

- [ ] Onboarding → Journey renders without console errors
- [ ] Scrolling the journey shows biome gradient transition (Jaipur rose → Goa teal)
- [ ] Parallax layers (stars, skyline) move at different speeds on scroll
- [ ] At least 3 landmarks visible at correct scroll positions on the journey canvas
- [ ] Tapping a landmark near centre → mechanic overlay appears inline
- [ ] Completing `TapIdentify` mechanic → landmark glows teal → scroll auto-advances
- [ ] Completing `DragAngleRelease` mechanic → `saveProgress()` called (check DevTools IndexedDB)
- [ ] Camp button → Camp overlay slides up with confidence meter
- [ ] Sky button → Sky overlay slides down with constellation
- [ ] Desktop @ 1440px → portrait frame centred with ambient dusk canvas
- [ ] Mobile @ 390px → full-bleed layout unchanged
- [ ] Zero console errors
- [ ] `npm run build` passes with no TypeScript errors

---

## Todo Checklist

- [x] S0: mechanics library (7 components)
- [x] S0: manifest YAML + loader
- [x] S0: IndexedDB + Supabase sync
- [ ] **S1**: `SPRINT_1_LOCKED.md` (this file)
- [ ] **S1**: `src/scenes/Journey.tsx`
- [ ] **S1**: `src/scenes/CampOverlay.tsx`
- [ ] **S1**: `src/scenes/SkyOverlay.tsx`
- [ ] **S1**: Fix mechanic Tailwind class names
- [ ] **S1**: Update `src/App.tsx`
- [ ] **S1**: Update `src/index.css`
- [ ] **S1**: Verify all exit criteria
- [ ] **S1**: Commit + push + production deploy confirmed

---

## Design Constraints

- **Keep**: ember/teal/violet/gold palette, Space Grotesk + JetBrains Mono, glass cards, chips, meters, orb, dusk skyline SVG
- **Change**: scene structure — fewer screens, everything lives in the journey
- **Invisible pedagogy**: never show "Wrong" or "Failed" — use "Close!", "You're onto something!", "Try this approach"
- **Mobile-first**: 402px column is the canonical play area; desktop treatment is additive
