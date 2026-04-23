# Sprint 0 — Technical Architecture

## Tech Stack

| Layer | Tech | Why |
|---|---|---|
| **Frontend** | Vite + React 18 + TypeScript | Fast builds, modern tooling, scalable |
| **Styling** | Tailwind CSS + CSS modules | Utility-first, isolated component styles |
| **Backend** | Supabase (Postgres + Auth + Storage) | Open-source, free tier, no Firebase lock-in |
| **Assets** | Cloudflare R2 (deferred to S1) | Free egress, cheaper than Supabase at scale |
| **Local storage** | IndexedDB + Service Worker | Offline-first, cached app shell |
| **Deployment** | Vercel | Free tier, built for React, auto-deploys on git push |
| **Package manager** | npm (or pnpm if preferred) | Standard, well-supported |

## Project structure (S0 minimal)

```
src/
├── engine/
│   ├── progress-store.ts       # IndexedDB + Supabase sync (offline-first)
│   ├── manifest-loader.ts      # Load YAML curriculum → React props
│   └── entitlement.ts          # canAccess(user, curriculum) → boolean
├── mechanics/                   # The 7 reusable components
│   ├── tap-identify/index.tsx
│   ├── drag-angle-release/index.tsx
│   ├── slider-live-readout/index.tsx
│   ├── drag-to-order/index.tsx
│   ├── two-point-measure/index.tsx
│   ├── drag-match-slot/index.tsx
│   └── build-diagram/index.tsx
├── scenes/                      # Current Zentri screens (legacy during migration)
│   ├── Onboarding.tsx
│   ├── Lobby.tsx
│   ├── Worlds.tsx
│   ├── MissionIntro.tsx
│   └── MissionPlay.tsx          # Routes to mechanic based on manifest
├── ui/                          # Shared components
│   ├── Orb.tsx
│   ├── GlassCard.tsx
│   └── Button.tsx
├── lib/
│   ├── supabase.ts              # Supabase client + typed queries
│   ├── idb.ts                   # IndexedDB wrapper
│   ├── cache.ts                 # Service worker cache utilities
│   └── auth.ts                  # Auth helpers (stub for S0)
├── types/
│   ├── curriculum.ts            # Manifest types
│   ├── concept.ts               # Concept + progress types
│   ├── progress.ts              # Progress syncing types
│   └── index.ts                 # Re-exports
├── i18n/
│   └── en.json                  # English strings
├── App.tsx                      # Root component + routing
└── main.tsx                     # Entry point
public/
├── sw.js                        # Service worker (Workbox-generated)
└── manifest.webmanifest         # PWA manifest
supabase/
├── migrations/
│   └── 001_initial.sql          # 6-table schema + RLS
└── seed/
    └── landmarks.sql            # Insert 14 landmark configs
curricula/
└── class10-math/
    └── en/
        └── manifest.yaml        # Biome → landmark → concept mapping
scripts/
└── migrate-firebase.ts          # One-time: Firebase → Supabase
types/
└── index.ts                     # Global type definitions
.env.local.example               # Template (user fills in keys)
vite.config.ts
tsconfig.json
package.json
index.html
```

## Data model

### Supabase tables

**profiles** (extends auth.users)
```sql
id (uuid, PK)
display_name (text)
free_chapter_id (text)  -- User's chosen free chapter
selected_language (text, default 'en')
created_at (timestamptz)
```

**concepts** (migrated from Firebase)
```sql
id (text, PK)  -- 'trig-ratios-at-standard-angles'
curriculum_id (text)  -- 'class10-math'
language (text, default 'en')
chapter_id (text)  -- 'ch8'
topic_id (text)
name (text)
source_reference (text)  -- 'ncert-class10-ch8.3'
prerequisites (text[])
mastery_criteria (jsonb)
common_misconceptions (jsonb)
created_at (timestamptz)
```

**landmarks**
```sql
id (text, PK)  -- 'jaipur-hawa-mahal'
curriculum_id (text)
biome_id (text)  -- 'pink-city'
concept_id (text, FK)
mechanic_type (text)  -- 'tap-identify', 'drag-angle-release', etc.
mechanic_config (jsonb)  -- Config passed to mechanic component
vibe_notes (text)
sort_order (int)
created_at (timestamptz)
```

**progress** (one row per concept per user)
```sql
user_id (uuid, FK)
concept_id (text, FK)
curriculum_id (text)
mastery_level (int, 0-5)
last_practiced (timestamptz)
next_due (timestamptz)  -- For spaced-rep (populated in S2)
attempts (int)
correct (int)
created_at (timestamptz)
updated_at (timestamptz)
PK (user_id, concept_id)
```

**entitlements** (paywall hook)
```sql
user_id (uuid, FK)
curriculum_id (text)
tier (text, default 'horizon')
free_chapter_id (text)
expires_at (timestamptz)
created_at (timestamptz)
PK (user_id, curriculum_id)
```

**questions** (PYQs migrated from Firestore)
```sql
id (text, PK)  -- 'ch8-q1'
curriculum_id (text)  -- 'class10-math'
chapter_id (text)  -- 'ch8'
concept_id (text, FK optional)  -- Links to concept if applicable
question_text (text)
options (jsonb)  -- [{text: "...", isCorrect: true}, ...]
answer_explanation (text)
difficulty (text)  -- 'easy', 'medium', 'hard'
source (text)  -- 'ncert', 'pmt', 'jee', 'pyq'
year (int)  -- 2023, 2022, etc.
created_at (timestamptz)
```

**leaderboard_weekly** (materialized view, populated by cron)
```
Aggregates from progress table hourly
Shows community stats (not individual ranks)
```

## Data flow (S0)

```
[User plays mission]
  → writes to IndexedDB immediately (offline works)
  → MissionPlay component dispatches updateProgress action
  → useEffect syncs queue to Supabase (when online)
  → Supabase INSERT/UPDATE to progress table
  → On next app open, pull latest from Supabase
  → Merge local + remote (last-write-wins by updated_at)
```

## Mechanic lifecycle

```
manifest.yaml loads
  → MissionPlay reads landmark config
  → Extracts mechanic_type ('drag-angle-release')
  → Imports mechanic component
  → Passes mechanic_config as props
  → Mechanic renders
  → On completion, returns { correct: boolean, duration: ms }
  → MissionPlay calls updateProgress(concept_id, correct)
  → Progress syncs to Supabase
```

## Environment variables (.env.local)

```
VITE_SUPABASE_URL=https://ynpkjsfnapbhwjmkrfzc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

(Provided in user setup phase, not committed to git)

## Build & deployment

- **Dev**: `npm run dev` → Vite dev server on localhost:5173
- **Build**: `npm run build` → optimized production bundle
- **Deploy**: Push to `feature/s0-foundation` → Vercel auto-deploys preview
  - On merge to main → production deploy
- **Service worker**: Generated by Workbox on each build

## Offline-first sync strategy

1. **Read path**: IndexedDB first, Supabase if not found or stale
2. **Write path**: IndexedDB immediately, queue to Supabase
3. **Conflict resolution**: last-write-wins by `updated_at` timestamp
4. **Validation**: Supabase RLS ensures user can only write own progress

## Performance targets (S0)

- **First paint**: < 1.5s on 4G
- **App shell cached**: instant on 2nd visit
- **Mission load**: < 200ms (mechanic from bundle)
- **IndexedDB writes**: < 50ms
- **Supabase sync**: async, non-blocking

## Security (S0)

- RLS enabled on all user-data tables
- Anon key (frontend) has limited read-write via RLS
- Service-role key (backend/migration) only used server-side
- No secrets in frontend code (Vite prefixes public vars with VITE_)
- CORS configured in Supabase for Vercel domain

---

**Next step**: Execute this architecture as defined. No deviations unless blocking.
