# MEDARO design system

The single source of truth for how MEDARO looks and behaves. Every branch reads it before designing and updates it in the same push when the user approves, rejects or prefers something. Values marked *provisional* may change until the Home hero is approved; **token names are fixed now** so parallel branches stay compatible.

---

## 1. Brand

- **Name:** MEDARO, always in capitals (the client writes it that way in body copy too).
- **Tagline:** Made for Better Health.
- **Logo:** wordmark only, no symbol. Montserrat Regular, uppercase, tight optical spacing, **the A has no crossbar** (reads as Λ). Black on light, white on dark. Files in `site/assets/logo/`; in pages use the sprite `<svg><use href="#wordmark"/></svg>` (viewBox `194 74 4413 712`, ratio ≈ 6.2 : 1).
  - Minimum width: 88px on screen.
  - Clear space: at least the height of the letters on every side.
  - Never typeset it, stretch it, outline it, add effects or recolour it outside ink/white.
- **Favicon:** none yet (no symbol). *[Pending: the M or the Λ as a monogram? Ask before making one.]*

## 2. Direction

*Pending: the user is sending inspiration sites. Write the agreed direction here in a few lines once the Home hero is approved.*

Starting point (to test against the inspiration, not decided):
- Category: direct-to-consumer telehealth (weight loss, men's and women's health, supplements). The client points at home.medvi.org for the scroll navigation on Home.
- The site has to do two jobs: **trust** (licensed providers, clear process, honest qualifiers) and **ease** (one obvious next step on every screen).
- The logo is quiet, geometric and thin. The design should give it room, not compete with it.

## 3. Tokens

Defined in `site/styles.css`. These become Framer colour and text styles in Phase 2.

### Colour *(provisional)*

| Token | Value | Use |
|---|---|---|
| `--color-ink` | `#0e0f0f` | Headlines, logo, primary button |
| `--color-text` | `#1f2121` | Body text |
| `--color-text-muted` | `#5a5f5e` | Secondary text, captions (≥4.5:1 on `--color-bg`) |
| `--color-bg` | `#ffffff` | Page |
| `--color-surface` | `#f5f5f3` | Alternate sections, cards on white |
| `--color-line` | `rgba(14, 15, 15, 0.12)` | Hairlines, borders |
| `--color-accent` | *TBD* | One brand accent, chosen with the hero |
| `--color-on-dark` | `#f7f7f5` | Text on dark sections |
| `--color-wl` / `--color-mh` / `--color-wh` / `--color-sp` | *TBD* | Optional per-line tints (Weight Loss, Men's, Women's, Supplements) |

### Type *(provisional)*

- `--font-display`: Montserrat for now (matches the logo). `--font-body`: Montserrat for now. Both may change with the direction.
- Scale (desktop / phone): hero 72/44, h2 48/32, h3 28/22, lede 20/18, body 17/16, small 14, caps 12 (tracking 0.12em).
- Line length for body copy: 60–72 characters.

### Space, layout, shape

- Spacing on a 4px base: `--space-1` (4) … `--space-11` (160).
- Container max 1440px, gutter 40px desktop / 20px phone, 12-column grid, 24px gap.
- Radius: `--radius-s` 8, `--radius-m` 16, `--radius-l` 24, `--radius-pill` 999.
- Motion: `--ease-out` cubic-bezier(0.22, 1, 0.36, 1), `--dur-fast` 160ms, `--dur-base` 240ms, `--dur-slow` 480ms. Every animation has a reduced-motion fallback.

### Breakpoints (match Framer)

Desktop ≥1200 · Tablet 810–1199 · Phone ≤809. Review at 1440 and 390 (2x).

## 4. Components (built Framer-ready)

| Component | Variants | Used on | Status |
|---|---|---|---|
| Header | `full` (Home, About, Contact: scroll links + page links) · `landing` (logo only + one CTA, no links out) | all | not started |
| Footer | `full` · `landing` (legal links only, pending client answer) | all | not started |
| Button | `primary` · `secondary` · `ghost` · with arrow | all | not started |
| Eyebrow | the small label above headings | all | not started |
| Check list | the "Your care, made simple" style bullet lists | Home, landings | not started |
| Steps | 01 / 02 / 03 process | Home, both landings | not started |
| FAQ | accordion | both landings | not started |
| Disclaimer | medical disclaimer block | Home, landings | not started |
| CTA band | closing call to action | both landings, About | not started |
| Treatment card | one per line (Weight Loss, Men's, Women's, Supplements) | Home | not started |

## 5. Section status

Status: `exploring` (on a branch) · `approved` (on `main`) · `rejected`. Add a row when a section starts, update it on every change.

### Home (`index.html`)

| Section | Status | Branch | Notes |
|---|---|---|---|
| header | — | | |
| hero | — | | Next up. Waiting for inspiration. |
| weight-loss | — | | |
| mens-health | — | | |
| womens-health | — | | Coming Soon |
| supplements | — | | |
| how-it-works | — | | |
| footer | — | | |

### About (`about.html`) · Contact (`contact.html`) · Weight Loss (`weight-loss.html`) · Men's Health (`mens-health.html`) · Legal

Not started.

## 6. Decisions log

Write what the user said, in their words where possible, with the date.

### Likes

- *(none yet)*

### Rejected

- *(none yet)*

## 7. Inspiration

| Site | What to take from it | Shared |
|---|---|---|
| home.medvi.org | Home navigation that scrolls to each treatment section (client's request) | client brief |
