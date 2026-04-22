# Zentri — Game-Based Learning for Class 10 Math

## Overview
Zentri is an AI-first, game-based learning app converting NCERT Class 10 Math curriculum into immersive gameplay. Core principle: **Engagement > Concept Mastery > Exam Performance**. Learning happens *inside* gameplay, never passively.

**Current State**: Claude Design delivered a working HTML/CSS/JS prototype with 14 playable missions (Ch 8: Trigonometry, Ch 9: Heights & Distances). All gameplay mechanics are implemented. **Task**: Migrate to production tech stack, integrate backend, validate pedagogy with real students.

---

## Design Philosophy (NON-NEGOTIABLE)

### Core Tenets
- **Interaction over Information** — Students learn by *doing*, not reading. No explainer text; the game *is* the explanation.
- **Invisible Pedagogy** — AI hints appear naturally ("Try this approach"), never as failures ("You got it wrong").
- **Concept → Unique Mechanic** — sin/cos/tan is a bow angle mechanic, not an MCQ. Each math concept has a distinct play experience.
- **No Negative Feedback** — Never use: "Wrong," "Incorrect," "Failed." Use: "Close! Try this…", "You're onto something!"
- **Dusk Aesthetic is Core** — Not decoration. Cinematic dusk (indigo sky → warm ember) + color theory (ember = action, teal = calm) aids cognition.
- **Multiplayer ≠ Competitive** — Raid shows party *contribution*, not ranks. No leaderboards ranking students.
- **Progress as Constellation** — Mastered concepts light up as stars. Metaphor drives intrinsic motivation.

---

## Design System & Brand

### Visual Language
- **Aesthetic**: Cinematic dusk twilight (Qutub Minar nod). Deep indigo night sky fading to warm horizon glow.
- **Palette**:
  - `--sky-top: #0a1028` (deep indigo)
  - `--ember: #ff7849` (action/primary — warm amber)
  - `--ember-glow: #ffb37a` (secondary highlight)
  - `--teal: #5eead4` (calm/alternate — cool accent)
  - `--sun: #ffd166` (warning/special angles)
  - `--muted: rgba(255,255,255,0.62)` (secondary text)
  - `--line: rgba(255,255,255,0.12)` (dividers)

- **Fonts**:
  - `Space Grotesk` (display/UI headings) — premium, game-like, clean
  - `JetBrains Mono` (numbers, angles, math expressions) — technical precision

- **Spacing & Radius**:
  - `--r-sm: 10px` (small buttons)
  - `--r-md: 16px` (cards)
  - `--r-lg: 24px` (modals)
  - `--r-xl: 32px` (containers)

- **Glass-morphism**: All UI cards use:
  ```css
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.3);
  ```

- **Character**: Abstract glowing orb mascot (no human — avoids representation issues, feels premium).

### UI Patterns
- **Status Bar**: Top-left clock, battery, signal (standard mobile).
- **HUD**: Top-left back button, mission chip badge.
- **Buttons**: Primary (ember), Ghost (outline), Glass (backdrop-filtered).
- **Feedback**: Inline hints (bottom-left glass card), success praise (centered toast).
- **Navigation**: Bottom home indicator, scene-based routing.

---

## Mission Architecture

### Three-Layer Structure (REQUIRED for Every Mission)

Each mission must implement:

1. **Learn Layer** — Interactive exploration (min. 3 interactive steps):
   - Student explores the concept through play, discovering the math principle.
   - Example (Triangle Anatomy): Tap to name opposite/adjacent/hypotenuse as angle rotates. Student learns side roles change with angle position.

2. **Solve Layer** — Challenge without MCQ mentality:
   - Student applies the learned concept to solve a problem.
   - Problem statement should be *visual/physical*, not textual ("Hit the target where sin θ = 0.5") not ("What is sin 30°?").
   - Multiple solution paths are OK; one correct answer required.

3. **Reflect Layer** — Feedback that reinforces the insight:
   - Show *what concept was mastered*, not just "you passed."
   - Example: "You locked sin 45° = √2/2 — you've got it solid now." (not "Mission complete! +4 XP").
   - Hint toward next concept: "Identities use these ratios combined. Ready for the next level?"

### Mission Catalog (14 Total)

**Chapter 8: Introduction to Trigonometry** (7 missions + 1 boss)
1. **Triangle Anatomy** (Tap-to-name): Tap opposite/adjacent/hypotenuse as θ rotates. Learn side role changes.
2. **Ratio Workshop** (Archer intro): Draw bow, watch sin/cos/tan update live. Introduction to trig ratios.
3. **Archer's Angle** (Full archer): Aim to hit targets at specific sin/cos/tan values. Master ratio mechanics.
4. **Special Angles Arena** (30/45/60): Physics-like ramps shaped by exact values (√3, 1/√2, etc.). Memorize special angles through motion.
5. **Ratio Decoder** (Given 1, find all 6): Given tan A = 4/3, use Pythagoras to derive all ratios. Multi-step solver.
6. **Identity Forge** (Drag-drop on unit circle): Assemble sin²θ + cos²θ = 1, 1 + tan²θ = sec², etc. physically. Tangible identities.
7. **Proof Duel** (Rearrange steps): Prove identity by arranging algebraic steps in logical order. Learn mathematical reasoning.
8. **Boss: The Dusk Minar** (Synthesis): 4 questions combining ratios, identities, angles, applications. Master Ch 8.

**Chapter 9: Applications of Trigonometry** (6 missions + 1 boss)
1. **Line of Sight** (Elevation vs. Depression): Tilt phone/head metaphor. Learn the angle definitions before applications.
2. **Lighthouse** (Angle of depression solver): Rotate beam to lock ship. Reveal triangle, solve D = H / tan θ. Core application.
3. **Flagstaff on the Tower** (Two angles): Observe building top (30°) and flag top (45°). Use both triangles to find flag length. NCERT Ex 4.
4. **Sun's Shadow** (Equations over time): Shadow lengthens as sun drops. Two sun angles, solve for tower height. NCERT Ex 5.
5. **Twin Towers** (Depression angles): From 60m tower, observe shorter building. Two depression angles → building height. NCERT Ex 6.
6. **River Width** (Bridge perspective): From 3m bridge, lock two depression beams (one per bank). Solve river width. NCERT Ex 7.
7. **Boss: The River** (Full synthesis): Class 10 NCERT final boss. Measure a river using only angle observations from one point.

---

## Coding Standards for Mission Implementation

### Component Structure
```tsx
// Template for each mission
function MissionName({ onDone }) {
  // State: angle, round, answer, result, etc.
  const [state, setState] = useState(initialState);
  
  // Handler: Check answer, move to next round, submit
  const check = (answer) => {
    if (isCorrect(answer)) {
      setResult('success');
      setTimeout(() => onDone({ success: true }), 1000);
    } else if (isClose(answer)) {
      setResult('close');
      // Show hint
    }
  };
  
  return (
    <div className="screen sky-dusk">
      <Stars count={count}/>
      <StatusBar/>
      <HUD with back button, chip badge/>
      
      {/* Interactive scene */}
      <svg or interactive area/>
      
      {/* Problem statement (visual, not textual) */}
      <GlassCard>Question shown as diagram, not MCQ</GlassCard>
      
      {/* Input method (not keyboard if possible) */}
      <DialInput or NumericKeypad or GeometricTapper/>
      
      {/* Feedback */}
      {result === 'success' && <ReflectFeedback/>}
    </div>
  );
}
```

### Copy & Tone Rules

**Mission Story (Intro)**: Narrative hook + learning objectives.
- ✅ "You stand in a lighthouse. A ship is adrift. The only measurement you have is the angle you lower your eyes to see it. Use that to find the distance."
- ❌ "Learn angle of depression and the formula D = H / tan θ."

**Problem Statement (In-game)**: Visual first, minimal text.
- ✅ "Angle of depression = 35°. Lighthouse height = 20m. Ship distance = ?"
- ❌ "What is the distance of the ship if the angle of depression is 35°?"

**Feedback (Success)**: Reinforce concept, not perfection.
- ✅ "You found the distance using tan 35° — that's the power of trigonometry. Heights, distances, angles: all connected."
- ❌ "Mission complete! +4 confidence. Great job!"

**Feedback (Close/Hint)**: Coach, not shame. Suggest a specific step.
- ✅ "You're close. Remember: D = H / tan θ. You have H = 20, θ = 35. What's tan 35°?"
- ❌ "Incorrect. Try again."

### Content Alignment with NCERT
Every mission's `learns` array must cite the NCERT concept:
```tsx
learns: [
  'Angle of depression — looking down from horizontal',
  'tan θ = opposite / adjacent; solve for distance',
  'NCERT Ch 9 Example 3: Applying heights & distances',
]
```

---

## Backend Integration

### Data Models

**Player**
```typescript
{
  id: string;
  email: string;
  name: string;
  createdAt: timestamp;
  lastLoginAt: timestamp;
  intent: 'fun' | 'concept' | 'exam';
  progressCh8: number; // missions completed (0-7)
  progressCh9: number; // missions completed (0-6)
  confidenceScore: number; // 0-100, visual as constellation
}
```

**Mission Result**
```typescript
{
  playerId: string;
  missionId: string; // e.g., 'ch8-m3-archer'
  timestamp: timestamp;
  success: boolean;
  hintsUsed: number;
  timeSpentMs: number;
  attempts: number;
  finalAnswer: string | number;
  correctAnswer: string | number;
  conceptsMastered: string[]; // e.g., ['sin', 'cos', 'tan']
}
```

**AI Hint Trigger**
```typescript
{
  playerId: string;
  missionId: string;
  round: number;
  attemptCount: number;
  wrongAnswers: string[]; // to infer misconception
  hintProvided: string;
  studentAcceptedHint: boolean;
}
```

### API Endpoints
- `POST /auth/otp` — Send email OTP
- `POST /auth/verify` — Verify OTP, return JWT
- `GET /player/profile` — Fetch current player
- `POST /mission/:missionId/submit` — Submit mission result
- `GET /mission/:missionId/hint` — Get AI hint for current attempt
- `GET /progress/:playerId` — Fetch constellation state
- `POST /raid/join` — Join live class raid
- `WS /raid/:raidId` — WebSocket for real-time raid updates

### AI Hint System
**Rule-based initially** (upgrade to ML later):
```
IF missAttempt(2) AND wrong concept inferred THEN
  SELECT hint FROM hintBank WHERE missionId AND concept AND misconception
  DISPLAY "Think: [specific NCERT example]. Try this approach."
```

Misconception mapping (example):
```
Misconception: sin(2θ) = 2·sin(θ)
Hint: "sin(2θ) = 2·sin(θ)·cos(θ), not just 2·sin(θ). The cosine matters!"
```

---

## Quality Gate Checklist

Before marking a mission "complete," verify:

- [ ] **Learn Layer**: Student completes mission without reading explainer text.
- [ ] **Concept Coverage**: One core NCERT concept is addressed; cites the chapter & example.
- [ ] **Copy Tone**: Zero instances of "wrong," "incorrect," "failed," "mistake."
- [ ] **Feedback Insight**: Feedback reinforces *what concept was learned*, not just success/fail.
- [ ] **Mechanics**: Touch-first (not mouse-dependent). Haptic feedback on key interactions.
- [ ] **Accessibility**: ARIA labels, keyboard nav, color-blind safe (ember ≠ only visual signal).
- [ ] **Performance**: <3s load, 60fps on iPhone 8.
- [ ] **Pedagogy**: Tested with 3+ real Class 10 students; 80%+ grasp the concept after mission.

---

## Tech Stack (PENDING — ANSWER IN NEXT SESSION)

### Decisions Needed
1. **Framework**: Next.js (fullstack) | Vite + Node/Python backend (modular)?
2. **Database**: PostgreSQL (relational) | Firebase (serverless) | Supabase (both)?
3. **Multiplayer**: WebSocket (real-time raid) | SSE (simpler) | polling (simplest)?
4. **AI Hints**: Rule-based (launch MVP) | ML (future)?
5. **Deployment**: Vercel (Next.js native) | AWS (more control)?

### Provisional Stack (Awaiting Confirmation)
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express or Next.js API routes
- **Database**: PostgreSQL (Supabase if serverless preferred)
- **Multiplayer**: Socket.io for real-time raids
- **Deployment**: Vercel (frontend) + serverless function (backend) or self-hosted

---

## Roadmap & Milestones

### Phase 1: Foundation (2 weeks)
- [ ] Initialize monorepo (Yarn workspaces or Nx)
- [ ] Set up TypeScript + ESLint + Prettier
- [ ] Migrate React components to .tsx
- [ ] Extract design tokens (colors, fonts, spacing)
- [ ] Build component library (Button, Card, Dialog, etc.)

### Phase 2: Backend (2 weeks)
- [ ] Auth API (email OTP)
- [ ] Player state persistence
- [ ] Mission result submission
- [ ] Analytics schema
- [ ] AI hint engine (rule-based)

### Phase 3: Gameplay Polish (2 weeks)
- [ ] Touch-first interaction audit
- [ ] Micro-animations (mission complete, hint fade-in, progress ↑)
- [ ] Sound design (optional)
- [ ] Accessibility audit
- [ ] Performance optimization

### Phase 4: Pedagogy Validation (2 weeks)
- [ ] Test each mission against NCERT learning outcomes
- [ ] Verify difficulty curve
- [ ] Document misconceptions
- [ ] Beta test with 10-15 Class 10 students
- [ ] Iterate based on feedback

### Phase 5: Scale (4+ weeks)
- [ ] Add more chapters (Polynomials, Linear Equations, etc.)
- [ ] Hindi translation & localization
- [ ] Science chapter scaffolding
- [ ] Multiplayer raid backend
- [ ] Analytics dashboard for teachers

---

## Critical Rules & Constraints

1. **No Placeholder Content** — Every mission in a manifest must be fully playable before shipping.
2. **Test End-to-End** — Click every button, complete every flow. Rendering ≠ working.
3. **Commit After Each Feature** — Don't batch fixes. Verify → commit → push → verify on production.
4. **Preserve Dusk Aesthetic** — No random bright colors. All UI must reference design tokens.
5. **Pedagogy First** — If a mission doesn't teach the concept through play, redesign it.

---

## Resources
- **NCERT Ch 8**: `/project/uploads/jemh108.pdf` + `.txt` summary
- **NCERT Ch 9**: `/project/uploads/jemh109.pdf` + `.txt` summary
- **Design Chat**: `/chats/chat1.md` (full design intent & iterations)
- **Prototype**: `project/` folder (HTML/CSS/JS reference)

---

## Next Steps
1. Answer the 5 tech/content questions (see planning doc).
2. Confirm tech stack & timeline.
3. Start Phase 1 (Foundation) in next session.

---

**Last Updated**: 2026-04-22  
**Handoff From**: Claude Design  
**Maintained By**: [You]
