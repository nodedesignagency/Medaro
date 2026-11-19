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
- **Favicon:** none yet (no symbol). *[Pending: the Λ as a monogram? Ask before making one.]*

## 2. Direction *(working, until the Home hero is approved)*

- **Follow the user's references closely.** When the user names a reference for a section, build that layout faithfully and make it ours through copy, colour, imagery and finish. Don't add devices the reference doesn't have.
- **Two jobs:** trust (licensed providers, a clear process, honest qualifiers) and ease (one obvious next step on every screen).
- **Feel:** calm, premium, botanical. The client's olive greens, lime only on buttons. Big confident grotesk headlines, short copy, generous space, real photography doing the emotional work.
- **The four care lines (Weight Loss, Men's Health, Women's Health, Supplement) live in the header nav only.** They never appear as cards, lists, tabs or strips in the hero (user, 2026-11-19).
- **Hero copy is ours to write** (user: "we have freedom there"). Everywhere else, use the client's copy word for word.

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

- **Host Grotesk** for everything (Google Fonts, available in Framer). V1 headlines Medium 500 with tight tracking (−0.048em), like avenn; V2 headlines Regular 400 (−0.035em), like Superpower. Text Regular 400, buttons and nav 400–500.
- **Montserrat** is the logo only, never set in text.
- Desktop sizes: V1 hero 88–140 (7.2vw), V2 hero 62, lede 16–20, body 17, nav 14–15. Phone starting points for Framer: hero 48, h2 34, h3 24, lede 18, body 16.
- Line length for body copy: 60–72 characters.

### Space, layout, shape

- Spacing on a 4px base: `--space-1` (4) … `--space-11` (160).
- Container max 1520px, gutter 40px, 12-column grid, 24px gap. Header 84px.
- Radius: `--radius-s` 8 (V1 buttons, nav icon), `--radius-m` 16, `--radius-l` 28, `--radius-pill` 999 (V2 buttons). V1 nav bar 10, V2 hero frame 18.
- Motion: `--ease-out` cubic-bezier(0.22, 1, 0.36, 1), `--dur-fast` 160ms, `--dur-base` 260ms, `--dur-slow` 560ms. Every animation has a reduced-motion fallback.

### Breakpoints (match Framer)

Desktop ≥1200 · Tablet 810–1199 · Phone ≤809.

**HTML phase is desktop only** (review at 1440, 2x). The first screen must fit a laptop browser window (about 1440×790) as well as 1440×900 and 1920×1080. Tablet and phone are designed and built in Framer during the transfer, section by section, and shown to the user there.

## 4. Components (built Framer-ready)

| Component | Variants | Used on | Status |
|---|---|---|---|
| Header | One structure (user, 2026-11-19): **logo left · all seven links from the brief centred** (Weight Loss, Men's Health, Women's Health, Supplement, How Medaro Works, About Us, Contact Support) **· Get Started right. No login.** Over the photo (V1), three surfaces to compare with `?nav=`: `--tinted` (dark translucent bar, the current one, kept), `--frosted` (milky light glass, ink type, dark CTA), `--liquid` (floating glass capsule for the links with a highlight that slides behind the hovered link, separate glowing lime CTA). All turn light past the photo. On the page background (V2): `--plain`. `landing` (logo + one CTA, no links out) not started | all | exploring |
| Footer | `full` · `landing` (legal links only, pending client answer) | all | not started |
| Button | `primary` (lime) · `dark` (ink); sizes `--s` 40, default 48, `--l` 54; `--pill` for V2. No arrows | all | exploring |
| Text link | `.link-underline` | all | exploring |
| Stand-in image | `.media-brief` + `assets/images/standin-*.svg`; `?briefs=on` shows the photo brief | all | exploring |
| Phone (portal UI) | built in code: status bar, greeting, care update card, rows, tab bar | Home V2 | exploring |
| Check list | the "Your care, made simple" style bullet lists | Home, landings | not started |
| Steps | 01 / 02 / 03 process | Home, both landings | not started |
| FAQ | accordion | both landings | not started |
| Disclaimer | medical disclaimer block | Home, landings | not started |
| CTA band | closing call to action | both landings, About | not started |

## 5. Section status

Status: `exploring` (on a branch) · `approved` (on `main`) · `rejected`. Add a row when a section starts, update it on every change.

### Home (`index.html`)

| Section | Status | Branch | Notes |
|---|---|---|---|
| header | exploring | `claude/upbeat-lamport-vxbm8d` | Logo left, seven links centred, CTA right. V1 has three surfaces to compare (`?nav=tinted|frosted|liquid`); V2 uses `--plain`. |
| hero | exploring | `claude/upbeat-lamport-vxbm8d` | Round 2: two versions (`?hero=v1|v2`). **V1, after avenn**: full-bleed photo, glass nav, "Made for Better Health." top left, "Care Without the Runaround." bottom right (tag removed), one sentence + Get Started bottom left. Photo concept: a soft mossy peak in morning mist (the Λ as a landscape); SVG stand-in for now. **V2, after Superpower**: split header, dark olive rounded stage, eyebrow "Made for Better Health.", "Expert medical care, from the comfort of home.", sentence, Get Started + "How Medaro Works" link, three facts, ticker of trust points; right, a phone with the MEDARO patient portal and a pharmacy bottle, built in code (bottle = stand-in for a render). More reference versions coming from the user. |
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

- 2026-11-19: Hero references to build from: **avenn** (V1) and **Superpower** (V2). More references coming.
- 2026-11-19: Nav: "left we should have logo, center all the nav links … and on right CTA". Keep the current tinted bar as one option; explore glass looks (references: Atlas menu, liquid-glass sliders, Cosmos, Analogue, Fuser).

### Rejected

- 2026-11-19, round 1 heroes A/B/C, called "full AI slop" by the user. What to avoid from now on:
  - Putting the care lines in the hero (index list, cards, frosted strip). They stay in the nav.
  - Not reading the copy brief before designing.
  - Invented devices the references don't have: mono uppercase labels everywhere, a custom chevron on every button and row, "coming soon" pills, hover-swapping image frames.
  - Blurry gradient-blob placeholders with caption boxes stamped on them.
- 2026-11-19, round 2: the small "■ LICENSED MEDICAL PROVIDERS" tag in V1 ("remove that"), and the login icon in the nav ("why there is login i dont need that").

### Copy flags to raise with the user

- The nav says "Supplement" (client's word); the section copy says "Supplements". We use "Supplement" in nav and hero rows for now. Suggest "Supplements".
- The hero has no CTA in the brief. We use "Get Started" (the client's label elsewhere) and scroll to How Medaro Works until told otherwise. `[LINK NEEDED]`
- The header adds a Get Started button (not in the brief's nav list). `[LINK NEEDED]`
- V2 facts: "24/7, from home" comes from the client's "24/7 Convenient online consultations". Avoid "100% online": the FAQ says some states need a live visit.

## 7. Inspiration

| Site | What to take from it | Shared by |
|---|---|---|
| home.medvi.org | Home navigation that scrolls to each treatment section | client brief |
| forhers.com | Entry cards per treatment right under a short headline; lime-on-green accents; disclaimers set close to claims | client |
| hims.com | Same system as Hers: tiles per condition, short headlines with one coloured phrase | client |
| immortals.com | Soft gradient surfaces, rounded cards, two big entry cards in the hero, product shots on clean backgrounds | client |
| goodlifemeds.com | Full-bleed lifestyle photo hero, big light grotesk headlines, mono uppercase labels, sage and warm neutrals, product cards with "Get started / Learn more" | user (liked) |
| superpower.com | **Hero V2.** Quiet header with centred logo; dark rounded stage; product scene (tube + phone app) lit from above; three facts with hairline dividers; ticker along the bottom | user (liked) |
| avenn (screenshot) | **Hero V1.** Full-bleed photo, frosted nav bar inside it, headline split top-left / bottom-right, sentence + CTA bottom left | user |
| Atlas menu, liquid-glass sliders (screenshots) | **Nav surfaces.** Milky frosted panel with dark type; translucent capsules with a bright rim and a lighter "thumb" that moves between options | user |
| Cosmos, Analogue Agency, Fuser (Mobbin) | **Nav surfaces.** Dark glass pill of links between a free-standing logo and a glowing CTA (Cosmos); light frosted bars (Analogue, Fuser) | Mobbin |
| nekohealth.com | *Couldn't load (bot check). Waiting for screenshots.* | user (liked) |
