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
- **MEDARO product imagery: recreate the user's reference, don't reinterpret it.** When the user hands over an image ("gave exact thing what i wanted"), upload it to Magnific as an image reference and prompt "recreate this as closely as possible; change only the branding and colours", together with the official logo (`site/assets/logo/medaro-logo.jpg`) as a second reference. Keep it **one coherent photograph** (same light, scale and shadows); never assemble a scene from separate renders. For motion, split that one render into a clean backdrop plate (Nano Banana edit of the same image: "remove the objects, keep the backdrop and light") and a background-removed cut-out of the products, and float the cut-out over the plate where it was shot. Words on products: only MEDARO and short line names (e.g. GLP-1); no doses, NDC, claims or small print.

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
| Header | One structure (user, 2026-11-19): **logo left · six links centred** (Weight Loss, Men's Health, Women's Health, Supplement, How Medaro Works, About Us) **· "Contact" secondary button + Get Started right. No login.** Secondary on glass = `.btn--glass` (white 14%), on the page = `.btn--outline`. **V1 (locked): `--glass` + `--smoke`**: bar 56px tall, inset 16px (on the frame), radius 12, padding 0 8 0 22, links 14px at 88% white 24px apart, Contact + lime Get Started 40px radius 8, 8px apart; smoke glass = rgb(19,19,19) ~58%, slightly darker at the top, no light edge (measured from the user's Dolomites glass-card reference). Turns light past the photo. **V2: `--plain`** on the page background; logo and CTA sit on the V2 content inset (frame edge + 48). **`--landing`** (weight-loss.html, exploring): the same bar, the logo as plain text (not a link) and one Get Started to the intake, no other links (client rule). Surface: smoke on a dark hero; **`--deep`** (opaque deep olive) on a light hero, where smoke glass reads as flat grey and the lime CTA would wash out | all | V1 locked, V2 exploring, landing exploring |
| Footer | `full` · `landing` (legal links only, pending client answer) | all | not started |
| Button | `primary` (lime) · `dark` (ink); sizes `--s` 40, default 48, `--l` 54; `--pill` for V2. No arrows | all | exploring |
| Text link | `.link-underline` | all | exploring |
| Rolling link | `.link-roll` (styles.css + main.js): on hover every letter slides up and an identical copy rolls in from below, left to right (280ms per letter, 16ms apart), rolling back on leave; after the user's hover recording (2026-11-20, from `claude/ecstatic-franklin-ul1zra`). Text split into letters with the font's kerning kept; the word stays whole for screen readers. **On every nav link in every hero version (header links, and the V3 menu links), and on the footer links when the footer is built.** Reduced motion: no roll. Framer: a link component with two stacked text layers and a staggered per-letter hover | all | exploring |
| Stand-in image | `.media-brief` + `assets/images/standin-*.svg`; `?briefs=on` shows the photo brief | all | exploring |
| Promo card | `components/promo-card.css`, **`--paper` (locked)**: light card, ink title, olive label `#56662F`, no shadow; radius 12 like the nav, 8px inset and 8px image radius like the nav buttons; 104px image left, caps label, two-line title, 40px round ↗ 8px from the corner | Home V1 | locked |
| Product photo | V2: `.hero-v2__media` covers the stage like object-fit: cover (width max(100cqw, 179.17cqh), anchored right, slides right on narrower stages so the copy stays clear), holding the backdrop plate, a left scrim for the copy, and the products cut-out floating on a 7s loop (−1.6cqh, −0.6°), still under reduced motion. The stage background is the plate's left edge under the scrim, so no strip ever shows | Home V2 | exploring |
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
| header | V1 locked · V2 exploring | `claude/upbeat-lamport-vxbm8d` | V1: glass + smoke (user's pick, 2026-11-19). V2: plain, aligned to the V2 content inset. |
| hero | V1 locked · V2 exploring | `claude/upbeat-lamport-vxbm8d` | Two versions (`?hero=v1|v2`). **V1 (locked by the user, 2026-11-19), after avenn**: full-bleed photo `hero-run.webp` (man and woman running side by side, low angle, olive-to-sage sky; Nano Banana 2.1, 4K), smoke glass nav, "Made for Better Health." top left with the paper supplement card top right, "Care Without the Runaround." bottom right, sentence + Get Started bottom left, everything on the frame edges. **V2, after Superpower + the user's floating-pens reference**: plain header, a rounded stage that is one product photograph: two MEDARO GLP-1 pens crossing diagonally (lime and olive label bands with the wordmark, "GLP-1"), a white and a lime round tablet with the wordmark debossed, a diagonal light beam on dark olive; the products float slowly. Left: eyebrow "Made for Better Health.", "Expert medical care, from the comfort of home.", sentence, Get Started + "How Medaro Works", three facts. No ticker. Every line of copy clears the products by 41px+ from 1280 to 1920. |
| weight-loss | — | | |
| mens-health | — | | |
| womens-health | — | | Coming Soon |
| supplements | — | | |
| how-it-works | — | | |
| footer | — | | |

### Weight Loss landing (`weight-loss.html`)

| Section | Status | Branch | Notes |
|---|---|---|---|
| header | exploring | `claude/serene-bardeen-hqmuk8` | `--landing`: logo (not a link) + Get Started → `#intake-weight-loss` `[LINK NEEDED]`. Deep olive bar on V1/V3, smoke on V2. |
| hero | exploring | `claude/serene-bardeen-hqmuk8` | Three versions (`?hero=v1|v2|v3`), all on the hims weight-loss hero's bones (headline left; sentence + CTA right, cap tops level; pictures across the foot of the first screen) and pushed away from it with a Mobbin reference each. Client copy word for word: eyebrow (sentence case), the two-sentence headline with "Weight Loss Is Hard." in muted olive and the answer in ink, the sentence, Get Started. **V1 after Savor**: paper warming to mist, four photos of different heights standing on the bottom edge (people and product alternate; never a steady rise or fall, so nothing reads as a chart). **V2 after Seed**: full-bleed deep olive, three cards (pens · people, wider · debossed tablet on a lighter olive panel). **V3 after Loom**: light sage deepening to Dusty Olive (our answer to hims' tan wash), two large cards (people wide · pens); ink CTA because lime disappears on light sage. Images are stand-ins from earlier renders (stretch and run photos, the GLP-1 pens, the debossed tablet); briefs in `data-brief`. Headline W on 16px, intro cap top level with the headline's, checked at 1280, 1440 (790 and 900 tall) and 1920. |
| smarter-way | next | | "A Smarter Way to Lose Weight." and its six points: its own section right after the hero (user, 2026-11-23). Every qualifier stays word for word. |

### About (`about.html`) · Contact (`contact.html`) · Men's Health (`mens-health.html`) · Legal

Not started.

## 6. Decisions log

Write what the user said, in their words where possible, with the date.

### Process

- 2026-11-19: Desktop only in HTML. Confirmed sections move to `main`; when the user says "move to Framer", the responsive versions are built in Framer during the transfer.
- 2026-11-19: `main` created from the setup (docs, copy, logo, Home placeholder). No sections on it yet.
- 2026-11-19: A few images will need to be created; how is still to be decided with the user. Until then image slots show a soft palette wash and a one-line brief (hide briefs with `?briefs=off`).
- 2026-11-19: Client palette shared on a call: button `#D5E5AD` Soft Nude Lime ("not the light green"), text `#343B29` Dark Olive Green, `#A8AF98` Dusty Olive. The user told the client we'd explore 2–3 colour options after the first version.

### Likes

- 2026-11-23: Weight Loss hero: "i like the ui of hero here [hims weight loss: headline left, sentence + CTA right, a row of image cards below] … however it will look copy if we use that", so alternatives from Mobbin that keep "a hint of this as base": V1 after Savor, V2 after Seed, V3 after Loom. The hims device of a pill breaking out of the card stays out, as do result chips (hims' "↓ 32 lbs*": never, no invented numbers).
- 2026-11-23: The client's hero brief puts "A Smarter Way to Lose Weight." and six bullets inside the hero. User: "the highlighted part should be separate section after hero". Agreed: the hero keeps eyebrow, headline, sentence and Get Started; the list becomes section 2.
- 2026-11-20: Link hover: "make the links hover animation like this for footer … and nav bar", then "change this to all hero versions in all branch … only the links animation". `.link-roll` added on every branch to all nav links (V1 and V2 header links, V3 menu links); footer links get it when the footer is built.

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
- 2026-11-19: Composited V2 scenes, all rejected: the floating jar/carton/sachet set, the macro tablets + vial + capsule cluster, the labelled vial + Quad 4 bottle with HTML labels, the blurred "bokeh" tablets, the ticker ("remove that bottom marquee"), and a hims-style canister (not what was asked). The user: "gave exact thing what i wanted and you are making it worse and worse". Lesson: when the user gives an exact reference, recreate THAT image (uploaded as the reference), in one coherent render; scale, light and composition come from the reference, only branding changes. Capsules: never ("capsule is worst").
- 2026-11-19: Macro set with AI-printed labels (vial with only "MEDARO" on it): "ours still looks ai … they have proper branding and stuff, we need that". The debossed tablet passed. Lesson: containers need designed labels with real hierarchy, composited as HTML over blank-label renders.

### Copy flags to raise with the user

- Weight Loss hero: the eyebrow "DOCTOR-GUIDED WEIGHT LOSS" is set in sentence case ("Doctor-guided weight loss"), quiet, not as a caps label. Headline keeps the client's title case.
- Weight Loss stand-in imagery shows MEDARO-branded GLP-1 pens. MEDARO doesn't make the medication (a licensed pharmacy fills it), so confirm with the client whether branded pens are acceptable before the final renders; plain unbranded pens are the safe default.
- The nav says "Supplement" (client's word); the section copy says "Supplements". We use "Supplement" in nav and hero rows for now. Suggest "Supplements".
- The hero has no CTA in the brief. We use "Get Started" (the client's label elsewhere) and scroll to How Medaro Works until told otherwise. `[LINK NEEDED]`
- The header adds a Get Started button (not in the brief's nav list). `[LINK NEEDED]`
- The brief's "Contact Support" nav item is now the "Contact" button (user's call). The page can keep the title "Contact Support".
- V2 pack labels use only copy words: vial "GLP-1 / Weight management / Rx only / Prescribed only when medically appropriate"; bottle "Quad 4 / Sublingual formulation / Sildenafil · Vardenafil · Tadalafil · Apomorphine / Rx only / Dissolves under the tongue". Doses and NDC numbers left out: `[DATA NEEDED]` from the client if they want them on the labels.
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
| hims.com weight loss hero (screenshot) | **Weight Loss hero base**: warm wash from white to tan, headline left, sentence + white pill CTA right, three big rounded cards across the foot (product · person · product). Not copied: the pill breaking out of the card, the result chip | user (liked) |
| Savor (Mobbin) | **Weight Loss hero V1**: split headline/CTA, photos of different heights along the bottom | Mobbin |
| Seed hero "Whole body health starts in the gut" (Mobbin) | **Weight Loss hero V2**: deep green, headline left, sentence right, a row of lighter-green product cards | Mobbin |
| Loom shop (Mobbin) | **Weight Loss hero V3**: big headline over two large rounded image cards | Mobbin |
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
| hims testosterone vials, Zepbound pen and vial (screenshots) | **Pack labels**: product name, strength chip, small print, big vertical wordmark, coloured flip cap, brushed collar; front-on, hard key light | user |
| Good Life tablets and vials, hims tablet/capsule/vial row (screenshots) | **Product render quality bar**: macro tablets with debossed logos and powder texture, metal-capped vials, printed capsules, hard shadows | user |
| Good Life box set, besea floating sachets, Bionoss shelf (screenshots) | **Packaging direction**: premium matte boxes and jars, sachets floating, a deep-green range | user |
| Seed (Mobbin) | **Packaging direction**: deep olive and frosted glass jars with dark lids, minimal wordmark | Mobbin |
| Cosmos, Analogue Agency, Fuser (Mobbin) | **Nav surfaces.** Dark glass pill of links between a free-standing logo and a glowing CTA (Cosmos); light frosted bars (Analogue, Fuser) | Mobbin |
| nekohealth.com | *Couldn't load (bot check). Waiting for screenshots.* | user (liked) |
