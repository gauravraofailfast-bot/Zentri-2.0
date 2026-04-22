# Zentri — Mission Architecture & Pedagogy

Pedagogical design for all 14 missions. See `CLAUDE.md` for workflow and `DESIGN.md` for visual specs.

## Three-Layer Structure (REQUIRED for Every Mission)

Every mission must implement these three layers in sequence:

### 1. Learn Layer (Interactive Exploration)
**Duration**: 3+ interactive steps  
**Goal**: Student discovers the math concept through play, not explanation.

**Example** (Triangle Anatomy):
```
Step 1: "Tap the opposite side" → student taps vertical side
Step 2: Angle rotates 30° → "Now what's opposite?" → student taps, realizes side role changed
Step 3: Angle rotates 60° → "How did opposite change?" → student discovers: side role depends on θ
Insight unlocked: "Opposite, adjacent, hypotenuse—names change with the angle!"
```

**Key Rules**:
- No explainer text before interaction
- Student learns by exploring, not by reading
- Problem statement is visual/physical ("tap the side")
- Feedback confirms discovery, not correctness

### 2. Solve Layer (Challenge Application)
**Goal**: Student applies learned concept to solve a problem.

**Example** (Archer's Angle):
```
Visual challenge: "Hit the target where sin θ = 0.5"
(Not: "What is sin 30°?")
Student draws bow → adjusts angle → watches sin readout live
When sin reaches ~0.5 → target lights → challenge won
```

**Key Rules**:
- Problem is visual/physical, not textual MCQ
- One correct answer, multiple paths OK
- Student uses mechanic learned in Layer 1
- No MCQs unless genuinely the best mechanic (rare)

### 3. Reflect Layer (Concept Reinforcement)
**Goal**: Show what concept was mastered, not just "you passed."

**Example**:
```
✅ "You locked sin 30° = 0.5. That's the insight—sin is the ratio of 
opposite to hypotenuse. Wherever you see a 30° angle in a right triangle, 
opposite/hypotenuse is always 1/2. Solid."
```

NOT:
```
✅ "Mission complete! +4 confidence. Great job!"
```

**Key Rules**:
- Reinforce the NCERT concept, not the perfection
- Reference the concept by name (sin, cos, tan, angle of depression, etc.)
- Hint toward next concept or connection
- Celebrate understanding, not achievement

---

## Mission Catalog (14 Total)

### Chapter 8: Introduction to Trigonometry (7 missions + 1 boss)

**M1: Triangle Anatomy**
- **Learn**: Tap to name opposite/adjacent/hypotenuse as θ rotates
- **Solve**: Correctly name 5 sides as angle changes
- **Reflect**: "Side names depend on angle position—that's the foundation"
- **NCERT**: Ch 8 Section 8.1 (right triangle basics)

**M2: Ratio Workshop** (Archer Intro)
- **Learn**: Draw bow → watch sin/cos/tan update live as angle changes
- **Solve**: Hit targets at specific ratios (sin = 0.5, cos = √3/2, etc.)
- **Reflect**: "sin θ, cos θ, tan θ—three ratios that describe any angle in a right triangle"
- **NCERT**: Ch 8 Section 8.2 (trig ratios definition)

**M3: Archer's Angle**
- **Learn**: Same bow mechanic, deeper engagement (more targets)
- **Solve**: Hit 8 targets combining sin, cos, tan at various angles
- **Reflect**: "You've mastered the core mechanic. sin/cos/tan are just ratios—geometry made numbers."
- **NCERT**: Ch 8 Section 8.3 (trig ratios for standard angles)

**M4: Special Angles Arena**
- **Learn**: Physics-like ramps shaped by √3, 1/√2, etc. Drag angle to match ramp
- **Solve**: Given sin/cos/tan value, drop angle into correct slot (30°, 45°, 60°, 0°, 90°)
- **Reflect**: "30°, 45°, 60°—the magic angles. Their exact ratios unlock shortcuts in every problem."
- **NCERT**: Ch 8 Section 8.4 (exact values of trig ratios)

**M5: Ratio Decoder**
- **Learn**: Given one ratio (tan A = 4/3), use Pythagoras to build the triangle
- **Solve**: Derive all 6 ratios (sin, cos, tan, cot, sec, cosec) from one given ratio
- **Reflect**: "Every ratio is connected. Give me one—I can find all six using Pythagoras."
- **NCERT**: Ch 8 Section 8.5 (complementary angle relationships)

**M6: Identity Forge**
- **Learn**: Unit circle spinning. Drag sin/cos/tan pieces onto circle as θ changes
- **Solve**: Assemble three identities (sin²+cos²=1, 1+tan²=sec², 1+cot²=cosec²)
- **Reflect**: "Identities aren't memorized—they're laws of geometry. sin²θ+cos²θ is always 1, no matter θ."
- **NCERT**: Ch 8 Section 8.6 (trig identities)

**M7: Proof Duel**
- **Learn**: Rearrange algebraic steps to prove an identity (interactive puzzle)
- **Solve**: 3 identity proofs, each 4–6 steps, in correct logical order
- **Reflect**: "Proof is just tracking the logic. Each step follows from the last—that's how mathematics works."
- **NCERT**: Ch 8 Section 8.6 (proving identities)

**Boss: The Dusk Minar** (Synthesis)
- **Learn**: 4 multi-concept questions mixing ratios, identities, angles, applications
- **Solve**: Solve all 4 to complete the Minar
- **Reflect**: "You've mastered Chapter 8. sin, cos, tan, identities, special angles—you're ready for real-world applications."
- **NCERT**: Ch 8 full chapter synthesis

---

### Chapter 9: Applications of Trigonometry (6 missions + 1 boss)

**M1: Line of Sight**
- **Learn**: Tilt phone/head metaphor. Look UP (elevation angle forms above horizontal), DOWN (depression angle forms below horizontal)
- **Solve**: Identify 5 angles as elevation vs. depression in visual scenarios
- **Reflect**: "Elevation and depression are just angle of sight. Up → elevation. Down → depression. Alternate interior angles = they're equal."
- **NCERT**: Ch 9 Section 9.1 (angle of elevation & depression)

**M2: Lighthouse**
- **Learn**: Rotate beam to lock onto ship. Reveal the right triangle formed (height, distance, angle)
- **Solve**: Given height (20m) and angle (35°), solve D = H / tan θ
- **Reflect**: "Angle of depression reveals distance. tan θ = height / distance. One measurement gives you the rest."
- **NCERT**: Ch 9 Example 3

**M3: Flagstaff on Tower**
- **Learn**: Observe building top (30°) and flag top (45°). Two angles → two triangles
- **Solve**: Given building height (10m), angles (30° & 45°), find flag length
- **Reflect**: "Two angles from one point = two right triangles. Solve for distance once, then use both to find unknowns."
- **NCERT**: Ch 9 Example 4

**M4: Sun's Shadow**
- **Learn**: Shadow lengthens as sun drops (time-lapse visualization). Two sun angles, shadow grows
- **Solve**: Given shadow diff (4m) at two sun angles, find tower height
- **Reflect**: "Change in shadow over time = two equations. Subtract to eliminate unknown base distance. Algebra + trig together."
- **NCERT**: Ch 9 Example 5

**M5: Twin Towers**
- **Learn**: From 60m tower top, observe shorter building. Two depression angles (top & bottom)
- **Solve**: Find the building's height using tan at both angles
- **Reflect**: "Depression angles from a high point. Use tan to find distance, then compute height of target. Two angles = two equations."
- **NCERT**: Ch 9 Example 6

**M6: River Width**
- **Learn**: Stand on 3m bridge over river. Lock depression beams to each bank (two angles)
- **Solve**: Compute river width from just the two angles and bridge height
- **Reflect**: "Two angles from one point on a bridge = river width without crossing. Trigonometry measures what geometry can't."
- **NCERT**: Ch 9 Example 7

**Boss: The River** (Synthesis)
- **Learn**: Final integration of all Ch 9 concepts
- **Solve**: Multi-step problem combining elevations, depressions, and multiple unknowns
- **Reflect**: "You've applied trigonometry to real-world measurement. Heights, distances, angles—all connected. You're ready for the exam."
- **NCERT**: Ch 9 full chapter synthesis

---

## Mission Quality Gate

Before marking a mission "complete," verify all of these:

| Aspect | Checklist |
|--------|-----------|
| **Learn Layer** | Can student complete without reading explanation? Is there 3+ interactive steps? |
| **Solve Layer** | Problem is visual/physical, not MCQ? One correct answer? Mechanic from Learn layer applied? |
| **Reflect Layer** | Feedback names the NCERT concept? Reinforces understanding, not perfection? |
| **Copy Tone** | Zero instances of "wrong," "incorrect," "failed"? All feedback is coaching? |
| **NCERT Alignment** | Mission cites specific NCERT chapter & example? Concept covered is in curriculum? |
| **Accessibility** | ARIA labels on interactive elements? Keyboard nav works? Color ≠ only signal? |
| **Performance** | <3s load? 60fps on iPhone 8? Touch-friendly (44x44px+ targets)? |
| **Pedagogy** | Tested with 3+ real Class 10 students? 80%+ understand the concept after mission? |

## Common Pitfalls to Avoid

🚩 **MCQ with image**  
Solution: Redesign as interactive mechanic (dial, drag, tap-to-name, draw).

🚩 **Explainer card before gameplay**  
Solution: Embed explanation into Learn layer mechanics. Let interaction teach.

🚩 **Feedback says "Great job!" or "+4 confidence"**  
Solution: Reframe as: "You locked sin 45° = √2/2. That concept is solid now."

🚩 **Hint says "Try again"**  
Solution: Replace with specific coaching: "Think: tan θ = opp/adj. What's opposite here?"

🚩 **Mission doesn't cite NCERT example**  
Solution: Every mission's `learns` array must reference "NCERT Ch X Example Y" or section.

🚩 **Two-angle problem without setting up equations visually**  
Solution: Show the two right triangles on screen so student sees the setup, not just the numbers.

---

## Concept Mastery Tracking

After each mission, track which concepts were mastered:

```typescript
conceptsMastered: [
  'sin',        // M2, M3
  'cos',        // M2, M3
  'tan',        // M2, M3
  'angles-30-45-60', // M4
  'pythagoras', // M5
  'identities', // M6, M7
  'elevation-depression', // M1, M2
  'heights-distances',  // M3, M4, M5, M6
]
```

This powers the constellation UI: as concepts light up, the constellation grows.

---

## Backend Data Model (Mission Results)

```typescript
{
  playerId: string;
  missionId: string; // e.g., 'ch8-m3-archer'
  success: boolean;
  attempts: number;
  hintsUsed: number;
  timeSpentMs: number;
  finalAnswer?: string | number;
  correctAnswer?: string | number;
  conceptsMastered: string[]; // which NCERT concepts did this unlock?
  timestamp: timestamp;
}
```

---

## Testing Checklist (Pedagogy Validation)

After Phase 3 (Gameplay Polish), before Phase 4 (Pedagogy Validation), test with real Class 10 students:

- [ ] Student completes mission without guidance?
- [ ] Student can explain the NCERT concept afterward (in their own words)?
- [ ] Student's confidence in the topic increased?
- [ ] Did any hints fire? Were they helpful or confusing?
- [ ] Any misconceptions revealed by wrong answers?
- [ ] Did the game feel engaging or tedious?
- [ ] Would student replay this mission for fun or drill?

Document all findings in a **mission test report** (per mission, per student).

---

**Last Updated**: 2026-04-22  
**Reference**: Claude Design prototype (2026-04-21), NCERT Class 10 Math Ch 8 & 9
