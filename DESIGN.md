# Zentri — Visual Language & Design System

Comprehensive design specs for Zentri UI. See `CLAUDE.md` for workflow and `MISSIONS.md` for mission architecture.

## Cinematic Dusk Aesthetic

**Core Metaphor**: Deep indigo night sky fading into warm ember horizon. Inspired by Qutub Minar at twilight.

**Philosophy**: Warm/cool color theory aids cognition. Ember = action/primary. Teal = calm/secondary. No bright reds, no flat grays.

## Color Palette

| Token | Hex | Purpose | Meaning |
|-------|-----|---------|---------|
| `--sky-top` | #0a1028 | Deep indigo sky | Focus, depth |
| `--sky-mid` | #1a1f4d | Mid-tone sky | Secondary depth |
| `--horizon` | #8a3a5e | Warm horizon glow | Transition warmth |
| `--ember` | #ff7849 | Action primary | Buttons, highlights, interactive states |
| `--ember-glow` | #ffb37a | Secondary highlight | Secondary buttons, glows |
| `--teal` | #5eead4 | Calm alternate | Alternative actions, progress, success |
| `--sun` | #ffd166 | Special/warning | Special angles (30/45/60), hints |
| `--muted` | rgba(255,255,255,0.62) | Secondary text | Body copy, labels |
| `--muted-2` | rgba(255,255,255,0.38) | Tertiary text | Captions, metadata |
| `--line` | rgba(255,255,255,0.12) | Dividers | Borders, separators |
| `--line-2` | rgba(255,255,255,0.06) | Subtle dividers | Faint lines |

## Typography

### Display & Headings
- **Font**: Space Grotesk (Google Fonts)
- **Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- **Characteristics**: Premium, game-like, clean, modern
- **Usage**: Mission titles, chapter names, major CTAs, modal headers

### Body & UI
- **Font**: Space Grotesk (same as display for consistency)
- **Usage**: Copy, descriptions, labels

### Math & Numbers
- **Font**: JetBrains Mono (Google Fonts)
- **Weights**: 400, 500, 700
- **Characteristics**: Technical precision, monospace
- **Usage**: Angles, ratios, numeric readouts (e.g., "θ = 45°", "sin θ = 0.707")

## Spacing & Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--r-sm` | 10px | Small buttons, tight elements |
| `--r-md` | 16px | Cards, standard containers |
| `--r-lg` | 24px | Modals, large containers |
| `--r-xl` | 32px | Full-width containers |

**Spacing Scale**: 4px (base unit). Use multiples: 4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64.

## Glass-Morphism (Core UI Pattern)

All UI cards and overlays use glass-morphism:

```css
backdrop-filter: blur(12px);
border: 1px solid rgba(255, 255, 255, 0.1);
background: rgba(10, 12, 30, 0.8); /* or rgba(0, 0, 0, 0.3) for darker */
```

This creates premium, floating effect while maintaining readability over complex backgrounds.

## UI Components

### Buttons

**Primary Button** (Ember)
```css
background: #ff7849;
color: white;
padding: 12px 20px;
border-radius: var(--r-md);
font-weight: 600;
```

**Secondary Button** (Ember Glow)
```css
background: #ffb37a;
color: #0a0f24;
```

**Ghost Button** (Outline)
```css
border: 1px solid rgba(255, 255, 255, 0.3);
background: transparent;
```

**Glass Button** (Backdrop-filtered)
```css
backdrop-filter: blur(12px);
border: 1px solid rgba(255, 255, 255, 0.1);
background: rgba(10, 12, 30, 0.5);
```

### Cards & Containers

**Glass Card** (Standard)
```css
backdrop-filter: blur(12px);
border: 1px solid rgba(255, 255, 255, 0.1);
background: rgba(10, 12, 30, 0.8);
border-radius: var(--r-md);
padding: 20px;
```

**Glass Dark Card** (Darker variant)
```css
background: rgba(10, 12, 30, 0.95);
```

### Mobile Frame

- **Device**: iPhone-like (402px wide, 874px tall, aspect 402/874)
- **Border Radius**: 52px (large, modern phone look)
- **Notch**: Status bar at top (clock, battery, signal)
- **Home Indicator**: Thin line at bottom

## UI Patterns

### Status Bar
- Top-left: Clock, signal, battery (standard iOS)
- Subtle, integrated with background

### HUD (Heads-Up Display)
- **Top-left**: Back button (glass, circular, 40x40px)
- **Top-right**: Mission chip badge (ember color)
- Format: "MISSION NAME" in mono, small caps

### Mission Intro Card
- **Layout**: Hero orb/image (top), title (h-display 38px), story (body 15px), "What you'll learn" list (body 14px)
- **Animation**: Fade in + subtle slide up
- **CTA**: "Enter the mission" button (primary)

### Problem Statement (In-Game)
- **Location**: Top-center glass card
- **Content**: Visual diagram first, minimal text
- **Format**: "MISSION · GOAL" (mono, uppercase), then problem in h-title size

### Feedback Overlay
- **Success**: Centered toast, ember glow, celebration animation
- **Close**: Bottom-left glass card, coaching hint
- **Hint**: Bottom-left, appears after 2 misses, never shames

### Interactive Elements
- **Dial/Slider**: Full-width range input, glass container, live numeric readout (mono font)
- **Buttons in Grid**: 3–4 per row, glass style, tap-friendly (48px min height)
- **Geometric Tapper**: SVG elements with cursor: pointer, hover glow effect

## Animations & Transitions

- **Fade In**: `opacity: 0 → 1` over 300ms
- **Slide Up**: `transform: translateY(20px) → 0` over 300ms
- **Bounce**: `scale(0.95) → 1` on success, 200ms
- **Glow Pulse**: `box-shadow` pulse on interactive elements (optional)

**Easing**: `cubic-bezier(0.4, 0, 0.2, 1)` (material-design standard)

## Accessibility

- **Color Contrast**: All text ≥ 4.5:1 ratio (WCAG AA)
- **No Color-Only Signal**: Ember red always paired with icon or label
- **Focus Indicators**: Visible 2px outline on all interactive elements (use teal for contrast)
- **Touch Targets**: Minimum 44x44px for buttons
- **ARIA Labels**: All custom elements must have `aria-label` or semantic HTML

## Responsive Breakpoints

- **Mobile**: 375px (iPhone SE)
- **Tablet**: 768px (iPad)
- **Desktop**: 1280px+

*Primary target: Mobile-first (iPhone 8+, 376–428px width)*

## Character & Mascot

**Orb Mascot**: Abstract glowing sphere, no human representation.
- **Color**: Gradient from ember to sun (warm)
- **Size**: 120px (hero), 60px (small), 40px (icon)
- **Glow**: Subtle `filter: drop-shadow(0 0 8px #ffb37a)`
- **Purpose**: Friendly, premium, represents AI coach

## Component Examples

### Example: Mission Card on World Map

```
┌─────────────────────────────────┐
│ MISSION 03                      │
│ Archer's Angle                  │
│ Aim to learn the ratios          │
│                                 │
│ 3 / 7 ███░░░░░░░ (Progress)    │
└─────────────────────────────────┘
```

Colors: Ember accents, glass background, mono metadata.

### Example: Feedback Toast (Success)

```
           ✓
    You found it!
 You've locked sin 45° = √2/2
    [Glow pulse animation]
```

Colors: Teal circle, white text, centered, appears for 2s then fades.

## Design System Compliance

When implementing:
1. **All colors** must reference CSS custom properties (`--ember`, `--teal`, etc.)
2. **All text** must use Space Grotesk or JetBrains Mono
3. **All cards** must use glass-morphism (blur + transparent bg)
4. **All buttons** must have 44x44px+ touch target
5. **All interactive** elements must have visible focus state

Linter rule: No hardcoded hex colors in components.

---

**Last Updated**: 2026-04-22  
**Reference**: Claude Design prototype (2026-04-21)
