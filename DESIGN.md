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
- **The four care lines (Weight Loss, Men's Health, Women's Health, Supplement) live in the header nav only.** They never appear as cards, lists, tabs or strips in the hero (user, 2026-11-19). Exception the user asked for: one supplement promo card in V1's top-right.
- **Hero copy is ours to write** (user: "we have freedom there"). Everywhere else, use the client's copy word for word.
- **MEDARO product renders (for every product image):** premium pharma macro, not packaging mock-ups. The medicine is the hero, close to camera: a soft nude lime `#D5E5AD` oval tablet with the MEDARO wordmark **debossed**, a dusty olive `#A8AF98` round scored tablet, a two-piece capsule (glossy dark olive `#343B29` half with the wordmark printed in cream, matte cream half), a frosted vial with a brushed aluminium cap anodised dark olive and a cream label carrying only the wordmark. Prompt as a real studio photograph (medium format, 100mm macro), hard warm-neutral key light from the upper left, rim light behind right, tactile detail (speckled compressed powder, crisp deboss, brushed metal, glass refraction), **shot on the dark olive stage colour `#262B1E`** so the light matches where it's placed. Upload `site/assets/logo/medaro-logo.jpg` as an image reference so the logo is the real one (crossbar-less A). The wordmark is the only text: no product names, doses, claims or icons. Render a set in **one** image (shared light, pieces not overlapping), cut out the background (3 credits), split into pieces in code; depth comes from blurred copies (`--bokeh`) in CSS, not extra renders.

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

Semantic tokens: `--color-ink`, `--color-text`, `--color-text-muted`, `--color-bg`, `--color-surface`, `--color-line`, `--color-accent`, `--color-accent-hover`, `--color-on-accent` (text on lime, stays dark in every scene; added 2026-11-19), `--color-sage`, `--color-deep`, `--color-on-dark`, `--color-on-dark-muted`, and per-line tints `--color-wl` (sage), `--color-mh` (deep), `--color-wh` (mist), `--color-sp` (lime).

**Scenes** (2026-11-19): a section can recolour the whole page while it holds the middle of the screen: `data-scene="<name>"` on the section, `:root[data-scene="<name>"] { --color-bg … }` in its stylesheet. The six page tokens (bg, surface, ink, text, text-muted, line) are registered with `@property`, so the page fades in 700ms (instant under reduced motion). First use: Men's Health in blue. Framer: page background and text colours driven by scroll (section in view).

Contrast: ink on paper ≈ 10:1, ink on lime ≈ 8.6:1, ink on sage ≈ 5.2:1, paper on deep ≈ 13:1.

### Type

- **Host Grotesk** for everything (Google Fonts, available in Framer). V1 headlines Medium 500 with tight tracking (−0.048em), like avenn; V2 headlines Regular 400 (−0.035em), like Superpower. Text Regular 400, buttons and nav 400–500.
- **Montserrat** is the logo only, never set in text.
- Desktop sizes: V1 hero 88–140 (7.2vw), V2 hero 62, lede 16–20, body 17, nav 14–15. Phone starting points for Framer: hero 48, h2 34, h3 24, lede 18, body 16.
- Line length for body copy: 60–72 characters.

### Space, layout, shape

- Spacing on a 4px base: `--space-1` (4) … `--space-11` (160).
- **The frame (user, 2026-11-19, after avenn):** `--edge` 16px, `--frame-max` 1888px, `--frame-side` = max(16px, (100% − 1888px) / 2). The glass nav sits on the frame edges and **hero content shares exactly those edges**: left blocks start where the nav bar starts, right blocks end where it ends. 32px between the nav bar and the first content row, 16px from the bottom. Big headlines use `text-box: trim-both cap alphabetic` and small optical offsets so the letters themselves (not their line boxes) sit on the edges; checked by measuring the rendered pixels at 1280, 1440 and 1920. Past 1888px (zooming out, big screens) the frame stops growing and centres; full-bleed photos still fill the screen.
- Container max 1520px, gutter 40px, 12-column grid, 24px gap. Header 84px.
- Radius: `--radius-s` 8 (V1 buttons, nav icon), `--radius-m` 16, `--radius-l` 28, `--radius-pill` 999 (V2 buttons). V1 nav bar 10, V2 hero frame 18.
- Motion: `--ease-out` cubic-bezier(0.22, 1, 0.36, 1), `--dur-fast` 160ms, `--dur-base` 260ms, `--dur-slow` 560ms. Every animation has a reduced-motion fallback.

### Breakpoints (match Framer)

Desktop ≥1200 · Tablet 810–1199 · Phone ≤809.

**HTML phase is desktop only** (review at 1440, 2x). The first screen must fit a laptop browser window (about 1440×790) as well as 1440×900 and 1920×1080. Tablet and phone are designed and built in Framer during the transfer, section by section, and shown to the user there.

## 4. Components (built Framer-ready)

| Component | Variants | Used on | Status |
|---|---|---|---|
| Header | One structure (user, 2026-11-19): **logo left · six links centred** (Weight Loss, Men's Health, Women's Health, Supplement, How Medaro Works, About Us) **· "Contact" secondary button + Get Started right. No login.** Secondary on glass = `.btn--glass` (white 14%), on the page = `.btn--outline`. **V1 (locked): `--glass` + `--smoke`**: bar 56px tall, inset 16px (on the frame), radius 12, padding 0 8 0 22, links 14px at 88% white 24px apart, Contact + lime Get Started 40px radius 8, 8px apart; smoke glass = rgb(19,19,19) ~58%, slightly darker at the top, no light edge (measured from the user's Dolomites glass-card reference). Turns light past the photo. **V2: `--plain`** on the page background; logo and CTA sit on the V2 content inset (frame edge + 48). `landing` (logo + one CTA, no links out) not started | all | V1 locked, V2 exploring |
| Footer | `full` · `landing` (legal links only, pending client answer) | all | not started |
| Button | `primary` (lime) · `dark` (ink); sizes `--s` 40, default 48, `--l` 54; `--pill` for V2. **Every lime CTA uses `--arrow`** (user, 2026-11-19, after the Verdant "Try now" button): label tile + square arrow tile (→, `#i-arrow-right`) joined by a narrow neck, leaving a round-ended notch top and bottom (5px wide, 9px deep at 48; 4×8 at 40; 5×10 at 54; inner corners 3px). Same colours as before; hover darkens the lime and nudges the arrow 3px. Other buttons (Contact, dark, outline) stay plain | all | exploring |
| Text link | `.link-underline` | all | exploring |
| Stand-in image | `.media-brief` + `assets/images/standin-*.svg`; `?briefs=on` shows the photo brief | all | exploring |
| Promo card | `components/promo-card.css`, **`--paper` (locked)**: light card, ink title, olive label `#56662F`, no shadow; radius 12 like the nav, 8px inset and 8px image radius like the nav buttons; 104px image left, caps label, two-line title, 40px round ↗ 8px from the corner | Home V1 | locked |
| Floating set | `.float-set` in V2: a square set of transparent pieces positioned in %, each on its own slow float loop (`--dur` 5.6–10s, `--amp` −10 to −26px, small tilts `--r0`/`--r1`, negative `--delay`s so they never sync), drop shadows, a warm pool of light behind; two blurred copies (`--bokeh-front` partly out of frame, `--bokeh-back` far away) for depth; still under reduced motion. Width min(46% of stage, stage − 848px, 100svh − 300px). Framer: one component, pieces as images with a loop animation each | Home V2 | exploring |
| Linked pair | Two halves joined like the lime arrow button: one piece, a round-ended notch cut in from the top and bottom where they meet (notch = grid gap wide, 18% of the height deep, 4px rounded mouth). Built as a CSS mask on `.mh__pair`. First use: Men's Health image + text tiles (user, 2026-11-19). Framer: one component, the notches as a mask/boolean shape | Home | exploring |
| Check list | the "Your care, made simple" style bullet lists. **Home Weight Loss: columns** (hairline on top, 24px line icon from the sprite, title), after Good Life | Home, landings | exploring |
| Steps | 01 / 02 / 03 process | Home, both landings | not started |
| FAQ | accordion | both landings | not started |
| Disclaimer | medical disclaimer block | Home, landings | not started |
| CTA band | closing call to action | both landings, About | not started |

## 5. Section status

Status: `exploring` (on a branch) · `approved` (on `main`) · `rejected`. Add a row when a section starts, update it on every change.

### Home (`index.html`)

| Section | Status | Branch | Notes |
|---|---|---|---|
| header | V1 locked · V2 exploring | `claude/upbeat-lamport-vxbm8d` | V1: glass + smoke (user's pick, 2026-11-19). V2: plain, aligned to the V2 content inset. |
| hero | V1 locked · V2 exploring | `claude/upbeat-lamport-vxbm8d` | Two versions (`?hero=v1|v2`). **V1 (locked by the user, 2026-11-19), after avenn**: full-bleed photo `hero-run.webp` (man and woman running side by side, low angle, olive-to-sage sky; Nano Banana 2.1, 4K), smoke glass nav, "Made for Better Health." top left with the paper supplement card top right, "Care Without the Runaround." bottom right, sentence + Get Started bottom left, everything on the frame edges. **V2, after Superpower + the floating-pens reference**: plain header, dark olive rounded stage on the frame (16px, max 1888), eyebrow "Made for Better Health.", "Expert medical care, from the comfort of home.", sentence, Get Started + "How Medaro Works" link, three facts, ticker of trust points; right, the **MEDARO range floating in macro** (debossed oval tablet, round tablet, vial, capsule, plus two blurred tablets for depth), each piece bobbing on its own loop; always clears the headline. |
| weight-loss | exploring | `claude/ecstatic-franklin-ul1zra` | **After the user's Good Life video (2026-11-19)**, measured and scaled to our frame. One 5-column grid (12px gaps) runs through the section; copy, the third column and the disclaimer text share one line (40%). Intro: product set left, running off the screen edge (stand-in `standin-weight-loss.svg`, anchored right so the boxes reach the edge at any width; real photo after approval); right: eyebrow, "Real Medical Care. / A Better Way / to Lose Weight." (4.7vw, cap height level with the tallest bottle), hairline, paragraph, Learn more (lime arrow). Then "More Than Weight Loss. A Healthier Way Forward." with the client's sentence on the 40% line, the 5 care points as columns (hairline, 24px line icon, title; no descriptions in the client copy), the two follow-on blocks (portal, ongoing care) as two mist cards (our proposal, not in the reference), the medical disclaimer at the foot. Waiting on the user's changes. |
| mens-health | exploring | `claude/ecstatic-franklin-ul1zra` | **After the user's "When we can help" reference (2026-11-19).** The whole page fades to blue while this section holds the middle of the screen (`data-scene="mens"`, user: "the color of the background will change to blue when this section will open"), back to paper when it leaves. Two blues to compare: `?blue=a` deep slate `#1D2A3A` (tiles `#283A4F`, default) and `?blue=b` denim `#24425F` (tiles `#2E5072`). Centred eyebrow, "Better Care for Men / Who Want More." (hero V1 type, 7.2vw), the lede; then two rows of square tiles (24.5% of the screen, max 462, 8px gaps, radius 12) running off both edges and sliding in opposite directions with scroll (a quarter screen of travel; row 1 on the frame edge halfway, row 2 half a tile over). Text tiles = the 5 "Care that focuses on what matters" points, **each linked to its image as one piece with the arrow button's notched join** (user: "related image and text will get linked like this"): couple + Sexual Health & Confidence, man + Hormonal Health, stride + Energy & Vitality, tablet + Performance & Well-Being, capsule + Fast, Discreet Delivery. Unrelated tiles keep the open 8px gap. **Photos fill their tile edge to edge** (the first version, kept by the user after trying a fading circle and cut-outs). Photo tiles are stand-ins cropped from the hero photo; product tiles use the MEDARO round tablet and capsule renders. Paragraph and Explore Men's Health (lime arrow) centred below. |
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

- 2026-11-19: **V1 locked**: hero V1 with the smoke nav, the run photo and the paper card ("for v1 we are using these"). Other navs (tinted, vision, dark), photos (stretch, peak stand-in) and cards (specs, frost, olive glass) removed from the page.
- 2026-11-19: Product renders must feel "sexy premium" like Good Life's tumbling debossed tablets, Good Life vials, hims' debossed tablet and printed capsule, and the floating pens: macro, tactile, dramatic light.
- 2026-11-19: V2 gets the floating-supplement idea (from the user's floating-pens reference), in our branding. References: Good Life box set, besea floating sachets, Bionoss green packaging; Seed jars on Mobbin.

- 2026-11-19: Hero references to build from: **avenn** (V1) and **Superpower** (V2). More references coming.
- 2026-11-19: Nav: "left we should have logo, center all the nav links … and on right CTA". Keep the current tinted bar as one option; explore glass looks (references: Atlas menu, liquid-glass sliders, Cosmos, Analogue, Fuser).
- 2026-11-19: "tinted is still far better than all … dont change size and corner radius, tinted one has best stuff". Tinted's geometry is fixed; explorations change the material only.
- 2026-11-19: Add a secondary button before the CTA, named "Contact" (not "Contact Support"); it replaces Contact Support in the centre links. Smoke and dark had a "weird border": removed the white hairline on dark glass.
- 2026-11-19: "those gaps feel uneven … see how nav and text etc is aligning properly [in avenn]": hero content now sits on the nav bar's edges (the frame). "when i do cmd - everything is stretching": max width 1888px, centred. Supplement card takes the nav's 12px radius.
- 2026-11-19: Hero photo: the user wants real-looking people (Nano Banana), a man and a woman, stretching or running, in our olive/sage palette, after their references (blue-sky low-angle runners, motion-blur runners, arms-overhead stretch, calm meditation). Picked concepts: run together low angle, morning stretch on a hill, golden-hour motion blur; generated the first two (cap: 2 images). **Brief for any new hero photo:** wide frame with the people smaller (about half the frame height), standing left of centre, feet around 85% down; deep tone top-left for the headline; top-right clear for the card; dark ground across the bottom fifth; no text or logos.
- 2026-11-19: Promo card: "i like paper version but dont like shadow" → paper is the default, shadow removed. Asked for a version with the SPECS card's UI and one with its colour and frost → `--specs` and `--frost`.
- 2026-11-19: Men's Health photos: "lets keep the first version we have made for this". Back to full photos filling the tile; linked pairs kept. The fading circle and the cut-outs below were tried and dropped.
- 2026-11-19 (dropped): Men's Health photos: "instead of mask fade lets make images like this with no background" (the tablet tile). The fading circle is replaced: people are cut-outs on the tile colour like the renders. Brief for the real photos: shoot or generate so the background can be removed cleanly (plain backdrop, whole figure or waist-up).
- 2026-11-19 (dropped): Men's Health photos: "show these images inside a circular mask which fades". Photo tiles now fade out in a centred circle on the tile colour; stand-ins re-cropped with the subject centred.
- 2026-11-19: Men's Health tiles: "I want this linking style for the cards here. related image and text will get linked like this" (the arrow button's join). Each care point and its image are now one notched pair.
- 2026-11-19: Men's Health: "for men heath i am thinking about this layout with blue background the color of the backgrounf will change to blue when this section will open". Built with the whole page fading to blue; two blues offered (deep slate, denim).
- 2026-11-19: Second section (Weight Loss) after the Good Life video: "make it first then i will decide what we should change". Built with my recommended choices: eyebrow kept, 5 columns with titles only (no invented descriptions), portal and aftercare blocks as two cards, disclaimer in the section.
- 2026-11-19: Lime CTA buttons: "lets make the layout like that with arrow, we dont have to change color … just ui structure wise" (Verdant reference). All `#D5E5AD` buttons (V1 nav and hero, V2 hero) are now the arrow build; colours unchanged. This replaces "no arrows" for lime CTAs only.
- 2026-11-19: Fill V1's empty top-right. Two ideas from the user: (1) a short supplement promo card like their reference card, built now; (2) a 3D supplement floating up and down, like a floating-pens-and-pills reference. **Build (2) only when the user asks.**

### Rejected

- 2026-11-19, round 1 heroes A/B/C, called "full AI slop" by the user. What to avoid from now on:
  - Putting the care lines in the hero (index list, cards, frosted strip). They stay in the nav.
  - Not reading the copy brief before designing.
  - Invented devices the references don't have: mono uppercase labels everywhere, a custom chevron on every button and row, "coming soon" pills, hover-swapping image frames.
  - Blurry gradient-blob placeholders with caption boxes stamped on them.
- 2026-11-19, round 2: the small "■ LICENSED MEDICAL PROVIDERS" tag in V1 ("remove that"), and the login icon in the nav ("why there is login i dont need that").
- 2026-11-19, nav round 1: the **frosted** (milky glass bar, dark CTA) and **liquid** (glass capsule with a bouncy sliding highlight, glowing gradient lime CTA, gradient rim) navs: "slop". Lesson: no glows, no gradient rims, no springy effects; match the reference's values and stay restrained.
- 2026-11-19, nav round 2: **smoke** (radius 22, 64px tall, hover patches) and **panel** (radius 3, corner brackets, mono chip): rejected, mainly for changing tinted's size and radius. Lesson: when the user likes something, vary only what they asked about, and take values from the reference by measuring it, not by eye.

- 2026-11-19: Packaging render (frosted jar, lime carton, olive sachet, small capsules; flat even light on light grey, pasted onto the dark stage): "looks cheap as ai gen images". Lesson: no generic cartons; macro scale, real materials, hard light, rendered on the stage colour.

### Copy flags to raise with the user

- The nav says "Supplement" (client's word); the section copy says "Supplements". We use "Supplement" in nav and hero rows for now. Suggest "Supplements".
- The hero has no CTA in the brief. We use "Get Started" (the client's label elsewhere) and scroll to How Medaro Works until told otherwise. `[LINK NEEDED]`
- The header adds a Get Started button (not in the brief's nav list). `[LINK NEEDED]`
- The brief's "Contact Support" nav item is now the "Contact" button (user's call). The page can keep the title "Contact Support".
- V1 promo card copy: label "Supplements", title "Better support for your everyday health." (client's line). Links to the Supplement section until the "Explore Supplements" URL exists. `[LINK NEEDED]`
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
| Atlas menu, liquid-glass sliders (screenshots) | Nav surfaces, round 1 (results rejected) | user |
| Dolomites glass cards (screenshot) | **Nav `--smoke` glass**: measured rgb(19,19,19) at ~58%, darker at the top | user |
| visionOS Notes and "Jupiter from Amalthea" windows (screenshots) | **Nav `--vision` glass**: measured rgb(66,66,66) at ~60%, heavy blur, desaturated, soft rim | user |
| "Signal strength" panel (screenshot) | **Nav `--dark` glass**: measured rgb(22,22,22) at ~76% | user |
| "Making Rama unmistakable" project card (screenshot) | **Promo card**: rounded card, square image left, coloured caps label, bold two-line title, round arrow button top-right | user |
| Runner and stretch photos (screenshots: arms-overhead stretch, meditation with glass chips, two blurred sprinters, golden-hour runner, low-angle runner on blue sky) | **Hero V1 photo style**: real people, outdoor, low angles against open sky, motion blur, film grain, natural light | user |
| SPECS hero (screenshot) | **Promo card `--specs` / `--frost`**: square charcoal frosted card, flush product image, white title, grey second line, small chevron | user |
| Floating GLP-1 pens and pills render (screenshot) | **V2's floating supplements**: products drifting in the light at different angles. Built with our own MEDARO packs, never the branded pens shown | user |
| Good Life tablets and vials, hims tablet/capsule/vial row (screenshots) | **Product render quality bar**: macro tablets with debossed logos and powder texture, metal-capped vials, printed capsules, hard shadows | user |
| Good Life box set, besea floating sachets, Bionoss shelf (screenshots) | **Packaging direction**: premium matte boxes and jars, sachets floating, a deep-green range | user |
| Seed (Mobbin) | **Packaging direction**: deep olive and frosted glass jars with dark lids, minimal wordmark | Mobbin |
| Cosmos, Analogue Agency, Fuser (Mobbin) | **Nav surfaces.** Dark glass pill of links between a free-standing logo and a glowing CTA (Cosmos); light frosted bars (Analogue, Fuser) | Mobbin |
| Verdant (Plainthing Studio shot) | **Lime CTA `--arrow`**: "Try now" label tile + square → tile joined by a notched neck; same notch on the "01 · Why choose us" chip | user |
| Good Life Home, second section (screen recording) | **Home Weight Loss**: product stack bleeding off the left on a light backdrop; 3-line headline from the middle column line, hairline, short paragraph, button; below, a 2-line heading and 4 hairline-topped columns (icon, title, description). Measured at 1709 wide: headline 80px (4.7vw), columns 12px apart | user |
| Lipedema Guru "When we can help" (screenshot) | **Home Men's Health**: huge centred headline, then rows of square tiles (photo / text alternating, radius ~12, 8px gaps) running off both edges, the second row offset. The user adds: the page background turns blue when the section opens | user |
| nekohealth.com | *Couldn't load (bot check). Waiting for screenshots.* | user (liked) |
