# Soteria — Design System Spec

**Version:** 1.0  
**Product:** 999/911 emergency dispatch dashboard for coordinating community allies and emergency services around active incidents.

This document is **fully standalone**. It contains every token, style rule, component pattern, and copy guideline needed to design or implement the UI without reading any other file.

---

## 1. Product & layout model

### What the operator sees

A full-screen dark map with three UI layers floating above it:

```
┌──────────────────────────────────────────────────────────────────────────┐
│ 12px margin                                                              │
│  ┌─────────────┐                              ┌────────────┐ ┌─────────┐ │
│  │ Queue panel │         MAP (stage)          │  Toolbar   │ │ Detail  │ │
│  │   272px     │                              │   236px    │ │  292px  │ │
│  │             │                              │            │ │         │ │
│  │  Incidents  │                              │  Routes    │ │ Incident│ │
│  │  by urgency │                              │  Reset     │ │ Allies  │ │
│  │             │                              │            │ │ Services│ │
│  └─────────────┘                              └────────────┘ └─────────┘ │
│                         ┌─────────────────────┐                          │
│                         │  Call dock / popup  │                          │
│                         └─────────────────────┘                          │
│ 12px margin                                                              │
└──────────────────────────────────────────────────────────────────────────┘
```

### Design concept: floating glass dispatch

- The **map is the stage**; all chrome floats above it in frosted glass panels.
- Panels are **inset 12px** from viewport edges so the map remains visible in the margins.
- Visual depth comes from **blur, hairline borders, and restrained shadows** — not gradients, glow halos, or heavy decoration.
- **Incident type color** appears only as thin accent: left border, header wash, map marker fill.

### Z-index stack

| Layer | z-index | Examples |
|-------|---------|----------|
| Map | 0 | Base map, routes, markers |
| Side panels | 10 | Queue, detail panel |
| Map toolbar | 15 | Routes toggle, reset view |
| Map dock | 20 | Call card, entity popups |

---

## 2. Layout tokens

| Token | Value | Use |
|-------|-------|-----|
| `panelInset` | `12px` | Gap between viewport edge and floating panels |
| `queue` | `272px` | Left queue panel width |
| `detail` | `292px` | Right incident/ally panel width |
| `gap` | `16px` | Space between detail panel and map toolbar |
| `toolbarWidth` | `236px` | Map toolbar width |

### Absolute positioning

**Left panel (queue):**
```
position: absolute
top: 12px; bottom: 12px; left: 12px
width: 272px
```

**Right panel (detail):**
```
position: absolute
top: 12px; bottom: 12px; right: 12px
width: 292px
```

**Map toolbar:**
```
position: absolute
top: 12px
right: 12 + 292 + 16 = 320px
width: 236px
```

**Map dock** (call card, entity detail popups):
```
position: absolute
bottom: 20px          /* panelInset + 8 */
left: 284px           /* panelInset + queue */
right: 304px          /* panelInset + detail */
display: flex; flex-direction: column; align-items: center
gap: 10px
pointer-events: none  /* children re-enable */
```

**App root background:** `#0b0d12` (visible in panel margins).

### Map camera padding

When fitting the map to show incident + ally + services, reserve space for chrome:

```
top:    84px    /* 72 + panelInset */
bottom: 180px   /* 168 + panelInset */
left:   300px   /* panelInset + queue + gap */
right:  556px   /* panelInset + detail + gap + toolbarWidth */
```

Minimum zoom: `15`.

---

## 3. Spacing scale

8px grid. **Use only these values** in panel chrome.

| Token | px |
|-------|-----|
| `xs` | 4 |
| `sm` | 8 |
| `md` | 16 |

Approved combinations: `10` (sm+2), `11` (sm+3), `12` (sm+4 or md−4).

---

## 4. Color system

### Core UI tokens

| Name | Value | Use |
|------|-------|-----|
| `primary` | `#EC0016` | Call button, ringing indicator, urgent chip tint |
| `secondary` | `#5B8DEF` | UI accent, ally focus, routes, active label |
| `accentMuted` | `rgba(91, 141, 239, 0.18)` | Secondary button fill, toggle-on background |
| `accentBorder` | `rgba(91, 141, 239, 0.35)` | Active/focused blue borders |
| `text` | `#e4e7ec` | Primary text |
| `muted` | `rgba(228, 231, 236, 0.5)` | Captions, secondary text |
| `bg` | `#0b0d12` | App background |
| `surface` | `#12151b` | Panel sections, neutral chips |
| `elevated` | `#1a1e26` | Emphasized surfaces |
| `border` | `rgba(255, 255, 255, 0.08)` | Standard borders |
| `borderSubtle` | `rgba(255, 255, 255, 0.04)` | Dividers |
| `borderPanel` | `rgba(255, 255, 255, 0.06)` | Panel section dividers |

### Semantic

| Name | Value | Use |
|------|-------|-----|
| `success` | `#34D399` | In-call state, verified label, live dot |
| `successBg` | `rgba(52, 211, 153, 0.12)` | "Will help" button |
| `successBorder` | `rgba(52, 211, 153, 0.28)` | In-call card border |

### Glass & card fills

| Name | Value | Use |
|------|-------|-----|
| `glassPanel` | `rgba(14, 17, 23, 0.78)` | Side panels |
| `glassToolbar` | `rgba(14, 17, 23, 0.82)` | Map toolbar |
| `card` | `rgba(22, 26, 34, 0.92)` | Cards, dock base |
| `cardActive` | `rgba(26, 30, 38, 0.95)` | Active hero ally card |
| `queueSelected` | `rgba(26, 30, 38, 0.92)` | Selected queue item |

### Emergency service colors (map only)

| Service | Color |
|---------|-------|
| Ambulance | `#EF4444` |
| Police | `#60A5FA` |
| Fire engine | `#F97316` |

### Incident type accent colors

Use for queue left border, map marker, header glow — **never** as large background fills.

| Incident type | Color | Clinical priority |
|---------------|-------|-------------------|
| Cardiac arrest | `#EF4444` | 1 (highest) |
| Choking | `#EA580C` | 1 |
| Anaphylaxis | `#BE123C` | 1 |
| Severe bleeding | `#DC2626` | 1 |
| Stroke | `#7C3AED` | 2 |
| Breathing difficulty | `#F97316` | 2 |
| Seizure | `#9333EA` | 2 |
| Overdose / poisoning | `#0891B2` | 2 |
| Diabetic emergency | `#D97706` | 3 |
| Childbirth emergency | `#BE185D` | 3 |
| Mental health crisis | `#4338CA` | 3 |

**Urgent meta chip** (waiting time) when priority ≤ 2:
- Background: `rgba(236, 0, 22, 0.12)`
- Border: `rgba(236, 0, 22, 0.28)`

**Header glow variable:** `--incident-glow: {typeColor}22` (hex + 22 alpha ≈ 13% opacity).

---

## 5. Typography

### Font stacks

```
UI/body:  "DB Screen Sans", "Inter", system-ui, -apple-system, sans-serif
Headlines: "DB Screen Head", "DB Screen Sans", "Inter", system-ui, sans-serif
```

Preferred weights: Sans 400/500/600/700; Head 900 (black) for titles.

### Global rendering

```css
html {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}
```

### Type scale (chrome UI only)

| Role | Size | Weight | Color | Extra |
|------|------|--------|-------|-------|
| Caption | 11px | 500 | muted | Meta, hints, timestamps, footers |
| Label | 11px | 600 | muted | `text-transform: uppercase; letter-spacing: 0.04em` |
| Body | 13px | 400 | text | Default prose |
| Body strong | 13px | 600 | text | Names, button labels |
| Title | 15px | 900 | text | Head font — brand, dock ally name |
| Headline | 16px | 900 | text | Head font — active incident type |

**Forbidden in chrome:** 9px, 10px, 14px, 17px.

### Panel section label

Label style + `margin-bottom: 8px`. Example: "Nearest ally", "Backup (2)", "Emergency services".

---

## 6. Border radius

| Token | px | Use |
|-------|-----|-----|
| Small | 4 | Buttons, chips, rank badges, vehicle pills |
| Medium | 8 | Panels, toolbar, dock, cards |
| Queue item | 6 | Queue rows |

Map markers: always circular (`50%`). No 20px pill shapes.

---

## 7. Elevation tiers

One tier per layer. Do not stack multiple shadows on the same element.

| Tier | Shadow | Radius | Use |
|------|--------|--------|-----|
| Panel | `0 12px 40px rgba(0,0,0,0.42)`, inset `0 1px 0 rgba(255,255,255,0.06)` | 8px | Side panels |
| Toolbar | `0 8px 32px rgba(0,0,0,0.4)`, inset highlight | 8px | Map toolbar |
| Card | `0 4px 20px rgba(0,0,0,0.32)`, inset `0 1px 0 rgba(255,255,255,0.05)` | 8px | Hero ally, map popups |
| Dock | `0 16px 48px rgba(0,0,0,0.55)`, inset `0 1px 0 rgba(255,255,255,0.07)` | 8px | Call card |
| Queue selected | inset ring + `0 2px 10px rgba(0,0,0,0.22)` | 6px | Selected queue row only |

### Glass panel recipe

```css
background: rgba(14, 17, 23, 0.78);
backdrop-filter: blur(20px);
-webkit-backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.09);
box-shadow: 0 12px 40px rgba(0, 0, 0, 0.42), inset 0 1px 0 rgba(255, 255, 255, 0.06);
border-radius: 8px;
overflow: hidden;
```

---

## 8. Reusable style recipes

### Card surface (base for dock, popups)

```
background: rgba(22, 26, 34, 0.92)
border: 1px solid rgba(255, 255, 255, 0.08)
border-radius: 8px
font-family: [UI stack]
padding: 16px
max-width: 480px (dock) or 380px (popup)
```

### Meta chip

```
font: caption (11px/500) → override weight 600
padding: 3px 8px
border-radius: 4px

Neutral:
  background: #12151b
  border: 1px solid rgba(255, 255, 255, 0.08)
  color: muted

Urgent (priority ≤ 2):
  background: rgba(236, 0, 22, 0.12)
  border: 1px solid rgba(236, 0, 22, 0.28)
  color: #e4e7ec
```

### Icon button

```
background: #12151b
border: 1px solid rgba(255, 255, 255, 0.08)
border-radius: 4px
color: muted
padding: 4px
cursor: pointer
display: flex; align-items: center; justify-content: center
```
Icon inside: 16px, stroke 2.

### Dismiss button (×)

```
background: none; border: none
color: muted
font-size: 16px
padding: 0
cursor: pointer
```

### Primary action button (Call)

```
background: #EC0016
color: #fff
font: body strong (13px/600)
padding: 12px 24px
border-radius: 4px
border: none
gap: 8px with 16px phone icon
```

### Outcome buttons (wrap-up)

| Variant | Background | Text | Border |
|---------|------------|------|--------|
| Will help | `rgba(52, 211, 153, 0.12)` | `#34D399` | `rgba(52, 211, 153, 0.28)` |
| Can't help | `rgba(91, 141, 239, 0.18)` | `#5B8DEF` | `rgba(255, 255, 255, 0.08)` |

Both: `flex: 1`, padding `11px 8px`, radius 4px, body strong.

### Verified badge (text only — no pill)

```
font-size: 11px; font-weight: 500
Verified:   color #34D399
Unverified: color rgba(228, 231, 236, 0.35)
```

### Toggle switch (toolbar)

```
track: 28×16px, radius 8px
  off: rgba(255, 255, 255, 0.12)
  on:  #5B8DEF
thumb: 12×12px white circle, 2px inset from edge
transition: 0.15s ease
```

---

## 9. Component specifications

### 9.1 Queue panel (left)

**Header** (padding 16px, bottom border `borderPanel`):
- Row: Title "Soteria" (title style) + live dot (6px green, pulsing)
- Subtitle: `"{n} in queue · most urgent first"` (caption)

**List** (padding `6px 8px 8px`, scrollable):
- Sorted by clinical priority, then longest waiting
- Each item is a button

**Queue item:**
```
padding: 11px 12px
border-radius: 6px
border-left: 3px solid [type color] when selected OR priority #1, else transparent
background: transparent (hover: rgba(255,255,255,0.04))
selected: background rgba(26,30,38,0.92) + inset ring shadow

Row 1: type name (body strong) + elapsed time (caption, right)
Row 2: address (caption, ellipsis)
```
No red dot. No red background for priority.

**Footer** (padding `10px 16px`, top border `borderPanel`, caption):
- `999 dispatch · shift 4`

**Empty state:** caption, padding 16px, "Queue empty".

---

### 9.2 Detail panel (right)

#### Incident header

Class: `soteria-incident-header`  
Inline: `border-left: 3px solid [type color]`, `--incident-glow: [type color]22`, padding 16px.

Content (position relative, above glow):
- Headline: incident type name
- Body muted, 2-line clamp: address
- Top-right: icon button → next incident
- Meta chips row (gap 6px, margin-top 8px): waiting time + caller phone

No "ACTIVE INCIDENT" label. No large icon circle. No gradient overlay beyond the subtle `::before` glow.

#### Nearest ally (hero card)

Elevated card + card surface:
```
padding: 12px 12px
background: card (or cardActive when focused/active)
border: 1px solid borderSubtle (accentBorder when active)
border-top: 2px solid #5B8DEF when active, else 2px transparent
```
- Name (body strong) + verified badge
- Route: caption — `"{duration} walk · {distance}"` or `route pending`

#### Backup allies (compact rows)

Divider top `borderSubtle`, padding `7px 0`, gap 8px:
- Rank badge 20×20, radius 4: number 2, 3, …  
  - focused/active: fill `#5B8DEF`, white text  
  - else: fill `accentMuted`, muted text
- Name: body strong (active) or caption (idle) — **no opacity fade below 60%**
- Verified badge + walk time (caption, right)
- "Active" label when on call: caption, color secondary, weight 600

#### Emergency services

Section label + sidebar toggle `Show on map` / `On map` (caption, weight 600).

**Service row** (full width button, padding `9px 0`):
- Icon box 20×20, service color
- Label (body strong) + callsign (caption)
- ETA right (caption, service color)
- Progress bar: 2px height, service color fill

---

### 9.3 Map toolbar

Single vertical stack — **never** separate floating chips.

1. **Emergency routes** — icon 18px Route, title + hint, toggle switch. `aria-pressed` when on. Pressed row background `rgba(91, 141, 239, 0.12)`.
2. Divider 1px `borderPanel`
3. **Reset view** — icon 18px LocateFixed, title + subtitle ("Incident & ally" or "Incident only")

Copy:
- Off: `Show emergency routes` + dynamic nearest-service hint
- On: `Emergency routes on map` + `Ambulance & other services`

---

### 9.4 Call dock (bottom center)

States flow: `ready` → `calling` → `in-call` → `wrap-up`.

| Phase | UI |
|-------|-----|
| **Ready** | Dock + ally name (title) + "Best ally · {walk}" (caption) + verified + red Call button |
| **Calling** | Blip 6px primary pulsing + "Calling…" (body strong) + name (title) + phone (caption). No phone icon circle. |
| **In-call** | Green blip + "In call" (green, body strong) + elapsed + name + phone. Card border `successBorder`. End call button (red tint). |
| **Wrap-up** | "How did the call go?" (caption) + ally info + **Will help** / **Can't help** + consequence hint (caption below) |

**Wrap-up hints:**
- Has backup ally: `Can't help will call the next nearest ally`
- No backup: `Can't help will close this incident — emergency services are responding`

Enter animation: `slideInUp` 0.18s ease-out, 6px vertical travel.

**Ring duration (mock):** 2.4–3.6 seconds per ally, seeded by ally ID with ±250ms jitter per dial.

---

### 9.5 Map entity popup

Same elevated card as hero (padding 16px, max-width 380px).

**Ally popup:** rank number in 28×28 blue square + name + label ("Best ally" / "Ally #n") + route + dismiss ×.

**Service popup:** colored icon box + label + callsign + ETA + 2px progress bar + distance.

---

### 9.6 Map markers

**Incident**
- Circle, type color, 48px (52px when selected)
- White user icon 22px
- Border `2px solid rgba(255,255,255,0.35)`
- Shadow `0 2px 8px rgba(0,0,0,0.35)`
- Selected outline: `3px solid #5B8DEF`, offset 2px

**Ally**
- Primary/active: 36px, `#5B8DEF`, double pulse ring 2.4s
- Backup: 30px, `accentMuted` fill, **60% opacity** on container (not lower)
- White star icon (13px primary, 11px backup)

**Emergency vehicle**
- Pill: service color, radius 4px, padding `5px 8px`
- White service icon 13px + caption label (weight 700) + optional ETA

**Ally call chip** (on map when ready, below marker)
- Connector: 2×10px line `#5B8DEF` at 65% opacity
- Button: primary red, radius 4px, padding `9px 16px`, shadow `0 8px 24px rgba(0,0,0,0.45)`
- Label: `Call · {walk time}`

---

### 9.7 Map environment

- Style: Mapbox `dark-v11`
- Building extrusion color: `#111827`, opacity 0.8
- Fog: color `#0a0f14`, high `#111827`, horizon blend 0.06, space `#000008`, star intensity 0.08
- Ally route line: `#5B8DEF`
- Service routes: ambulance `#EF4444`, police `#60A5FA`, fire `#F97316`, width 2.8, opacity 0.92
- Selection radius circle: `#5B8DEF` at 4% fill, 22% opacity dashed stroke

---

## 10. Motion

### liveBlip
```css
@keyframes liveBlip {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.25; }
}
```
- Call status dot: 1.2s ease infinite
- Queue live dot: 2.4s ease infinite

### pulseRing
```css
@keyframes pulseRing {
  0%   { transform: scale(0.6); opacity: 0.9; }
  70%  { transform: scale(1.9); opacity: 0; }
  100% { transform: scale(1.9); opacity: 0; }
}
```
- Primary ally marker: 2.4s, two rings offset 1.2s

### slideInUp
```css
@keyframes slideInUp {
  from { transform: translateY(6px); opacity: 0; }
  to   { transform: translateY(0);   opacity: 1; }
}
```
- Call dock: 0.18s ease-out

**Rule:** Subtle only. No bounce, no slides > 16px.

---

## 11. Copy & voice

- **Tone:** Calm, operational, plain English. No jargon the operator wouldn't say aloud.
- **Case:** Sentence case for labels. Uppercase only for 11px section labels.
- **Punctuation:** No trailing periods on button labels or chips.

### Standard strings

| Context | Copy |
|---------|------|
| Queue subtitle | `{n} in queue · most urgent first` |
| Queue footer | `999 dispatch · shift 4` |
| Queue empty | `Queue empty` |
| No allies | `No allies faster than units` |
| Routes off | `Show emergency routes` |
| Routes on | `Emergency routes on map` |
| Routes hint (on) | `Ambulance & other services` |
| Routes hint (off) | `Nearest {service} · {time} · {distance}` or `See how far emergency services are` |
| Reset view | `Reset view` |
| Reset subtitle (ally) | `Incident & ally` |
| Reset subtitle (none) | `Incident only` |
| Sidebar map toggle off | `Show on map` |
| Sidebar map toggle on | `On map` |
| Wrap-up prompt | `How did the call go?` |
| Outcome positive | `Will help` |
| Outcome negative | `Can't help` |
| Verified | `Verified` |
| Unverified | `Unverified` |
| Active ally | `Active` |
| Calling | `Calling…` |
| In call | `In call` |
| End call | `End call` |
| On scene | `On scene` |

### Avoid

- "Units only", "Try next", "ACTIVE INCIDENT"
- Credential scores, "cred"
- Non-emergency incident types (e.g. language barrier)

---

## 12. Accessibility notes

- All icon-only buttons need `aria-label` (e.g. "Next incident", "Close", "Reset view").
- Routes toggle: `aria-pressed` reflects on/off.
- Queue items: selectable buttons with clear type + address text.
- Color is never the only signal — always pair with text (ETA, label, verified).
- Live indicators use motion + color; respect `prefers-reduced-motion` if implementing fresh.

---

## 13. Do / Don't

### Do

- Use the spacing scale and six type roles only
- Float panels with 12px inset and glass treatment
- Use incident type color as thin accent (3px border, marker, glow)
- Keep map controls in one toolbar
- Explain action consequences in caption hints below buttons
- Let "Can't help" auto-route to next ally or close incident

### Don't

- Add new font sizes or arbitrary padding in chrome
- Use heavy gradients, glow halos, or bordered badge pills
- Fade backup allies below 60% opacity
- Split toolbar into mismatched floating chips
- Show uppercase shout labels in the detail header
- Ask operators to choose between "Try next" and "Units only"

---

## 14. Complete CSS reference

Copy-paste ready. Class prefix: `soteria-`.

```css
/* ── Base ── */
html {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

html, body, #root {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden;
}

/* ── Motion ── */
@keyframes pulseRing {
  0%   { transform: scale(0.6); opacity: 0.9; }
  70%  { transform: scale(1.9); opacity: 0; }
  100% { transform: scale(1.9); opacity: 0; }
}

@keyframes liveBlip {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.25; }
}

@keyframes slideInUp {
  from { transform: translateY(6px); opacity: 0; }
  to   { transform: translateY(0);   opacity: 1; }
}

/* ── Panels ── */
.soteria-panel {
  background: rgba(14, 17, 23, 0.78);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.09);
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.42),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  overflow: hidden;
}

.soteria-panel-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

/* ── Incident header ── */
.soteria-incident-header {
  position: relative;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.soteria-incident-header::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, var(--incident-glow, transparent) 0%, transparent 58%);
  pointer-events: none;
}

/* ── Queue ── */
.soteria-queue-scroll {
  padding: 6px 8px 8px;
}

.soteria-queue-item {
  width: 100%;
  border: none;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  border-radius: 6px;
  transition: background 0.15s ease, box-shadow 0.15s ease;
}

.soteria-queue-item:hover {
  background: rgba(255, 255, 255, 0.04);
}

.soteria-queue-item--selected {
  background: rgba(26, 30, 38, 0.92);
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.06),
    0 2px 10px rgba(0, 0, 0, 0.22);
}

/* ── Map toolbar ── */
.soteria-map-toolbar {
  display: flex;
  flex-direction: column;
  width: 236px;
  background: rgba(14, 17, 23, 0.82);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 8px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  overflow: hidden;
  pointer-events: auto;
}

.soteria-map-toolbar-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  width: 100%;
  transition: background 0.15s ease;
}

.soteria-map-toolbar-btn:hover {
  background: rgba(255, 255, 255, 0.04);
}

.soteria-map-toolbar-btn[aria-pressed="true"] {
  background: rgba(91, 141, 239, 0.12);
}

.soteria-map-toolbar-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.06);
}

/* ── Elevation ── */
.soteria-dock {
  box-shadow:
    0 16px 48px rgba(0, 0, 0, 0.55),
    inset 0 1px 0 rgba(255, 255, 255, 0.07);
  border-radius: 8px;
}

.soteria-elevated-card {
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.32),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

/* ── Status ── */
.soteria-live-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #34d399;
  box-shadow: 0 0 8px rgba(52, 211, 153, 0.55);
  animation: liveBlip 2.4s ease infinite;
  flex-shrink: 0;
}

/* ── Map popup wrapper (Mapbox) ── */
.soteria-popup .mapboxgl-popup-content {
  background: transparent;
  padding: 0;
  box-shadow: none;
}

.soteria-popup .mapboxgl-popup-tip {
  display: none;
}
```

---

## 15. Quick token cheat sheet

```
COLORS
  primary      #EC0016     secondary    #5B8DEF
  text         #e4e7ec     muted        rgba(228,231,236,0.5)
  bg           #0b0d12     surface      #12151b
  success      #34D399     border       rgba(255,255,255,0.08)

LAYOUT
  inset 12 · queue 272 · detail 292 · gap 16 · toolbar 236

TYPE
  caption 11/500 · body 13/400 · bodyStrong 13/600
  title 15/900 head · headline 16/900 head

SPACE
  xs 4 · sm 8 · md 16

RADIUS
  sm 4 · md 8 · queue 6
```

---

*End of spec.*
