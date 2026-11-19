# MEDARO design system

The single source of truth for how MEDARO looks and behaves. Every branch reads it before designing and updates it in the same push when the user approves, rejects or prefers something. Values marked *provisional* may change until the Home hero is approved; **token names are fixed** so parallel branches stay compatible.

---

## 1. Brand

- **Name:** MEDARO, always in capitals (the client writes it that way in body copy too).
- **Tagline:** Made for Better Health.
- **Logo:** wordmark only, no symbol. Montserrat Regular, uppercase, tight optical spacing, **the A has no crossbar** (reads as Λ). Ink on light, paper/white on dark. Files in `site/assets/logo/`; in pages use the sprite `<svg><use href="#wordmark"/></svg>` (viewBox `194 74 4413 712`, ratio ≈ 6.2 : 1).
  - Header size: 20px tall (≈124px wide). Minimum width: 88px on screen.
  - Clear space: at least the height of the letters on every side.
  - Never typeset it, stretch it, outline it, add effects or recolour it outside ink/paper.
- **Chevron (`#chev`):** the logo's crossbar-less A (Λ) turned on its side, same narrow angle. It is the site's only arrow: buttons, links, rows, cards. Points right by default; `.chev--up` / `.chev--down` rotate it.
- **Favicon:** none yet (no symbol). *[Pending: the Λ as a monogram? Ask before making one.]*

## 2. Direction *(working, until the Home hero is approved)*

- **Two jobs:** trust (licensed providers, a clear process, honest qualifiers) and ease (one obvious next step on every screen).
- **Feel:** calm, botanical, clinical-but-warm. Light olive paper, the client's olive greens, lime only where you act (buttons, hover). Big light headlines that echo the thin wordmark; small mono labels like a prescription label; generous space; rounded photo frames.
- **Photography carries the warmth** (as on Good Life, Superpower, Neko): real people in natural light, at home, calm and unposed; unbranded products on natural surfaces. See the compliance rules in `CLAUDE.md` (no before/after, no scales, no branded drugs).
- **Home is an index.** Its sections are MEDARO's four lines of care, and the header's in-page links scroll to them (the client's home.medvi.org request). The hero should say so.

## 3. Tokens

Defined in `site/styles.css`. These become Framer colour and text styles in Phase 2.

### Colour

Raw colours sit in palette blocks (`--p-*`) at the top of `styles.css`; everything else uses the semantic tokens, so a palette swap recolours the whole site. **Palette A is the client's** (shared on a call, 2026-11-19). The user promised the client **2–3 colour options** once the first version is done: add them as `:root[data-palette="b"]`, `"c"`, list them in `<html data-palettes="a,b,c">`, and review with `?palette=b`.

| Palette token | A (client) | Role |
|---|---|---|
| `--p-ink` | `#343B29` Dark Olive Green | Headlines, text, logo |
| `--p-ink-soft` | `#5E6551` (derived) | Secondary text (5.6:1 on paper) |
| `--p-accent` | `#D5E5AD` Soft Nude Lime | Buttons and hover fills ("not the light green") |
| `--p-accent-hover` | `#C8DB98` (derived) | Button hover |
| `--p-sage` | `#A8AF98` Dusty Olive | Surfaces, image tone. **Never text on it except ink** (paper on sage is 2:1) |
| `--p-paper` | `#F4F5EF` (derived) | Page background |
| `--p-mist` | `#E7EADF` (derived) | Cards, alternate sections |
| `--p-deep` | `#262B1E` (derived) | Dark sections and cards |

Semantic tokens: `--color-ink`, `--color-text`, `--color-text-muted`, `--color-bg`, `--color-surface`, `--color-line`, `--color-accent`, `--color-accent-hover`, `--color-sage`, `--color-deep`, `--color-on-dark`, `--color-on-dark-muted`, and per-line tints `--color-wl` (sage), `--color-mh` (deep), `--color-wh` (mist), `--color-sp` (lime).

Contrast: ink on paper ≈ 10:1, ink on lime ≈ 8.6:1, ink on sage ≈ 5.2:1, paper on deep ≈ 13:1.

### Type

- **Host Grotesk** for display and text (Google Fonts, available in Framer). Headlines in **Light 300** (`--weight-display`) with tight tracking (−0.05em at display sizes), so they sit with the thin wordmark. Text in Regular 400, buttons and nav in Medium 500.
- **Geist Mono** for labels (`.label`): 12px, uppercase, +0.06em. Eyebrows, tags, captions: the vernacular of a prescription label. Labels are always anchored to something (a row, a card, a heading), never floating alone.
- **Montserrat** is the logo only, never set in text.
- Desktop scale: display 100–112 (hero), h2 56, h3 30, lede 20, body 17, small 14, label 12. Phone starting points for Framer: display 48, h2 34, h3 24, lede 18, body 16.
- Line length for body copy: 60–72 characters.

### Space, layout, shape

- Spacing on a 4px base: `--space-1` (4) … `--space-11` (160).
- Container max 1520px, gutter 40px, 12-column grid, 24px gap. Header 84px.
- Radius: `--radius-s` 8, `--radius-m` 16, `--radius-l` 28 (photo frames, cards), `--radius-pill` 999 (buttons, nav pill, tags).
- Motion: `--ease-out` cubic-bezier(0.22, 1, 0.36, 1), `--dur-fast` 160ms, `--dur-base` 260ms, `--dur-slow` 560ms. Every animation has a reduced-motion fallback.

### Breakpoints (match Framer)

Desktop ≥1200 · Tablet 810–1199 · Phone ≤809.

**HTML phase is desktop only** (review at 1440, 2x). The first screen must fit a laptop browser window (about 1440×790) as well as 1440×900 and 1920×1080. Tablet and phone are designed and built in Framer during the transfer, section by section, and shown to the user there.

## 4. Components (built Framer-ready)

| Component | Variants | Used on | Status |
|---|---|---|---|
| Header | `full`: logo · in-page index in one pill (scroll links) · page links (About Us, Contact Support). `landing`: logo only + one CTA, no links out | all | `full` exploring |
| Footer | `full` · `landing` (legal links only, pending client answer) | all | not started |
| Button | `primary` (lime) · `dark` (ink) · `ghost` (outline), all pill, with `#chev` | all | exploring |
| Link with chevron | `.link-arrow` | all | exploring |
| Label | `.label` mono caps | all | exploring |
| Image slot | `.ph` (+ `--deep`, `--light`, `--lime`) with `data-brief`: review-only stand-in until photos exist | all | exploring |
| Care index row | name · tag · chevron, lime fill sweeps in on hover (hero A) | Home | exploring |
| Care card | big (image, tag, name, headline, round lime button) · slim (name, tag, thumb) (hero B) | Home | exploring |
| Check list | the "Your care, made simple" style bullet lists | Home, landings | not started |
| Steps | 01 / 02 / 03 process (a real sequence, so numbers are right here) | Home, both landings | not started |
| FAQ | accordion | both landings | not started |
| Disclaimer | medical disclaimer block | Home, landings | not started |
| CTA band | closing call to action | both landings, About | not started |

## 5. Section status

Status: `exploring` (on a branch) · `approved` (on `main`) · `rejected`. Add a row when a section starts, update it on every change.

### Home (`index.html`)

| Section | Status | Branch | Notes |
|---|---|---|---|
| header | exploring | `claude/upbeat-lamport-vxbm8d` | Full variant. Sticky; turns solid with a hairline once you scroll. |
| hero | exploring | `claude/upbeat-lamport-vxbm8d` | Three versions (`?hero=a|b|c`). **A, Care index**: headline and the four lines of care as a big list; hovering a line changes the portrait photo and shows that line's headline. **B, Care cards**: headline on top, two big cards (Weight Loss, Men's Health) and two slim ones (Women's Health, Supplement), after the client's refs. **C, Portrait**: one big photo, headline over it, frosted strip with the four lines, after the user's refs. All photos are stand-ins (`.ph`) until images are decided. |
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

### Process

- 2026-11-19: Desktop only in HTML. Confirmed sections move to `main`; when the user says "move to Framer", the responsive versions are built in Framer during the transfer.
- 2026-11-19: `main` created from the setup (docs, copy, logo, Home placeholder). No sections on it yet.
- 2026-11-19: A few images will need to be created; how is still to be decided with the user. Until then image slots show a soft palette wash and a one-line brief (hide briefs with `?briefs=off`).
- 2026-11-19: Client palette shared on a call: button `#D5E5AD` Soft Nude Lime ("not the light green"), text `#343B29` Dark Olive Green, `#A8AF98` Dusty Olive. The user told the client we'd explore 2–3 colour options after the first version.

### Likes

- *(none yet)*

### Rejected

- *(none yet)*

### Copy flags to raise with the user

- The nav says "Supplement" (client's word); the section copy says "Supplements". We use "Supplement" in nav and hero rows for now. Suggest "Supplements".
- The hero has no CTA in the brief. We use "Get Started" (the client's label elsewhere) and scroll to How Medaro Works until told otherwise. `[LINK NEEDED]`
- Row tags in the hero are the client's own phrases, shortened: "GLP-1 treatment options", "Sexual health & confidence", "Everyday wellness".

## 7. Inspiration

| Site | What to take from it | Shared by |
|---|---|---|
| home.medvi.org | Home navigation that scrolls to each treatment section | client brief |
| forhers.com | Entry cards per treatment right under a short headline; lime-on-green accents; disclaimers set close to claims | client |
| hims.com | Same system as Hers: tiles per condition, short headlines with one coloured phrase | client |
| immortals.com | Soft gradient surfaces, rounded cards, two big entry cards in the hero, product shots on clean backgrounds | client |
| goodlifemeds.com | Full-bleed lifestyle photo hero, big light grotesk headlines, mono uppercase labels, sage and warm neutrals, product cards with "Get started / Learn more" | user (liked) |
| superpower.com | Rounded inset hero photo under a quiet header, big clean grotesk, calm white space, frosted UI over photos | user (liked) |
| nekohealth.com | *Couldn't load (bot check). Waiting for screenshots.* | user (liked) |
