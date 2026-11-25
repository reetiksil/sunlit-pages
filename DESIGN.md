# DESIGN.md — Sunlit Pages Design System

## 1. Visual North Star
> *"A quiet reading room with morning sunlight and calm twilight nights."*

Every visual decision in **Sunlit Pages** is engineered to minimize cognitive load while cultivating warmth, tranquility, and immersion.
- **Organic Geometry**: Gentle corners (`14px`–`22px` radii) soften the interface without looking overly playful.
- **Generous Whitespace**: Wide breathing margins protect the reader from visual clutter and sensory saturation.
- **Zero Intrusive Pop-ups**: All interactions use fluid sheets, non-blocking drawers, or lightweight notifications that respect user focus.
- **Tactile Paper Grain**: Subtle fractal noise texture applied across both Day and Night modes evokes the tactile feel of high-grade book paper.

---

## 2. Color Tokens & WCAG Contrast Audit

All color variables live in `src/styles/globals.css` and transition smoothly over `450ms cubic-bezier(0.22, 1, 0.36, 1)` with progressive enhancement via the **View Transitions API**.

### Day Mode ("Sunny Morning")
| Token | Hex | Semantic Role | Contrast Ratio |
|---|---|---|---|
| `--bg` | `#FFF9EF` | Warm cream background | — |
| `--surface` | `#FFFFFF` | Elevated cards, sheets, panels | — |
| `--surface-soft`| `#FDF1DC` | Secondary pills, subtle hover states | — |
| `--primary` | `#F6B94C` | Warm sunshine CTA accent | `7.1:1` vs `--primary-fg` (`#3B2A0A`) |
| `--text` | `#182230` | Body copy and primary headings | `12.8:1` on `--bg` (AAA) |
| `--text-muted` | `#4B5563` | Subtitles, timestamps, metadata | `5.6:1` on `--surface-soft` (AA) |
| `--border` | `#F0E6D2` | Dividers, card boundaries, inputs | Soft subtle separation |
| `--ring` | `#8A5A00` | Keyboard focus ring | `5.6:1` on `--bg` (AA) |
| `--danger` | `#A8201A` | Destructive actions and alerts | `6.4:1` on `--bg` (AA) |

### Night Mode ("Calm Twilight")
| Token | Hex | Semantic Role | Contrast Ratio |
|---|---|---|---|
| `--bg` | `#141B2D` | Deep midnight navy | — |
| `--surface` | `#1D2742` | Elevated cards and sheets | — |
| `--surface-soft`| `#243053` | Secondary interactive containers | — |
| `--primary` | `#FFD28A` | Warm moonlight accent | `12.4:1` vs `--primary-fg` (`#1B1405`) |
| `--text` | `#E8ECF5` | Crisp legible body text | `13.8:1` on `--bg` (AAA) |
| `--text-muted` | `#9AA6BD` | Secondary text and timestamps | `5.3:1` on `--surface` (AA) |
| `--border` | `#2C3859` | Low-contrast night borders | Soft subtle separation |
| `--ring` | `#FFD28A` | Keyboard focus ring | `12.4:1` on `--bg` (AAA) |
| `--danger` | `#FFB4A9` | Alert states and error messages | `8.2:1` on `--surface` (AAA) |

---

## 3. Reader Themes (5 Calibrated Palettes)

When entering the chapter reader or local document viewer, the interface switches into specialized distraction-free themes:

| Theme | Background | Text Color | Surface / Borders | Ambience Purpose |
|---|---|---|---|---|
| **Day** | `#FFFDF8` | `#222933` | `#FFFFFF` / `#EBE3D3` | Bright natural daylight reading |
| **Sepia** | `#F4ECD8` | `#433422` | `#EDE2C8` / `#DFD2B5` | Warm, nostalgic antique paperback |
| **Paper** | `#F6F4EE` | `#2D3136` | `#ECEAE2` / `#DFDCD2` | Neutral bleached cotton paper |
| **Night** | `#161D2B` | `#D6DEEC` | `#1D273A` / `#2B3852` | Low-strain twilight atmosphere |
| **True-Dark** | `#0B0E14` | `#C8D1E0` | `#121722` / `#1E2536` | Pure deep sanctuary for OLED screens |

---

## 4. Typography Scale

- **Display & Headings**: `Fraunces` (warm old-style serif with soft variable curves) using fluid `clamp()` sizing:
  - `fluid-h1`: `clamp(1.85rem, 3.2vw + 1rem, 3rem)`
  - `fluid-h2`: `clamp(1.4rem, 2.2vw + 0.8rem, 2.1rem)`
  - `fluid-h3`: `clamp(1.15rem, 1.5vw + 0.7rem, 1.5rem)`
- **UI & Navigation**: `DM Sans` for clean, unambiguous legibility at small sizes.
- **Dedicated Reader Fonts (5 options)**:
  1. `Lora`: Balanced literary serif for serialized long-form fiction.
  2. `DM Sans`: Crisp modern sans-serif.
  3. `Merriweather`: Sturdy high-contrast editorial serif.
  4. `Atkinson Hyperlegible`: Specially crafted by the Braille Institute for low vision and dyslexia comfort.
  5. `JetBrains Mono`: Clean monospace for technical, experimental, or distraction-free focus.

---

## 5. Genre-Aware Ambient Animations

Rather than distracting high-motion animations, the reader features 10 genre-tuned minimalist storybook silhouettes:
- **Fantasy**: Gliding mythical dragon with subtle ember wisp and floating firefly motes.
- **Romance**: Paired songbirds gliding across margin breezes with drifting rose petals.
- **Mystery**: Silent night owl gliding above a low horizontal wind current.
- **Sci-Fi**: Minimal paper-voyager starship sailing across subtle twinkling stars.
- **Slice of Life**: Swaying botanical sprig with floating autumn leaves.
- **Horror**: Distant gliding raven with crescent moon and horizon mist.
- **Poetry**: Folded origami crane soaring over delicate violet currents.
- **Children**: Soaring noble griffin with drifting quill feathers and soft cumulus clouds.
- **Historical**: Distant mountain ridge horizon with a soaring falcon.
- **Neutral**: Gentle tranquil songbird floating above golden sunlight currents.

**Animation Guarantees**:
- Portaled directly to `document.body` so elements never scroll along with chapter text.
- Fullscreen preservation: Elements remain visible and active when entering fullscreen mode.
- Strict transparency: Zero color tint or background overlay on top of chosen reading themes.
- Reduced motion support: Pauses gracefully when `prefers-reduced-motion` is active or tab is hidden.

---

## 6. Audio Atmosphere Architecture

The ambient sound engine supports dual-mode serene listening:
1. **Looping Natural Soundscapes**:
   - High-fidelity natural recordings: *Forest Rain*, *Heavy Rain*, *Warm Hearth*, and *Mountain Wind*.
   - Zero-latency Web Audio playback with crossfading volume curves.
2. **Instrumental Music**:
   - Curated Scott Buckley orchestral tracks: *Filaments* (Happy/Piano), *Goliath* (Epic), *Solace* (Melancholy), *Dark Places* (Mystery).
   - Custom YouTube video and playlist URL pasting with integrated volume and play/pause controls.
   - Off-screen persistent anchor preventing browser tab throttling.

---

## 7. Component Language & Tokens

Defined in `src/styles/globals.css` under `@layer components`:
- `.btn`: Base button with subtle press feedback (`scale: 0.98`), rounded pill geometry, and focus ring.
  - `.btn-primary`: Sunshine golden fill with dark high-contrast foreground text.
  - `.btn-ghost`: Transparent interactive hover container.
  - `.btn-danger`: Accessible red tint for deletion and irreversible actions.
  - `.btn-reader`: Minimal border button adapting to active reader theme CSS variables.
- `.card`: Surface background container with `--radius` corners, subtle border, and `shadow-calm`.
- `.chip`: Pill-shaped filter badge with smooth hover state and active indicator dot.
- `.link-underline`: Underline effect that smoothly retracts on hover.
- `.nav-link`: Navigation item with a glowing sun-dot active marker.
- `.drawer-in` / `.drawer-in-left`: Smooth slide-and-fade CSS entry for bottom sheets and sidebars.
