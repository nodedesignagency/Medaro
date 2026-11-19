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
- **MEDARO product imagery (user, 2026-11-19, after several rejected rounds). Magnific makes the 3D object; code makes the branding.**
  1. **One object per render.** Each product (pen, capped pen, tablet, vial…) is its own Nano Banana 2.1 render at 4K, never one scene with everything in it ("generate all one by one … all will be different and will have different motion"). Each object gets its own layer and its own float (different period, drift, tilt and phase).
  2. **Whole object, nothing cropped.** The object sits complete in its frame with empty backdrop all round ("it getting cut from above"). Pens and other long objects are rendered **upright and side-on**, then tilted in CSS; this also keeps the label straight for the code.
  3. **Blank.** Ask for no text, letters, numbers, logos or marks on pens, vials, boxes or labels: a plain matte white label sleeve. **The one exception is the debossed tablets**, which Magnific does well with the wordmark as a reference (the user: "keep the tablets they look good").
  4. Same look across the set: references are the user's image (realism, part-for-part detail) plus our earlier render (materials, light). Render on the stage backdrop with the stage light (dark olive, warm key light from the upper right), then cut out with background removal (3 credits) and trim. Reuse the stage plate; don't regenerate it.
  5. **Labels in code.** SVG drawn in the product image's own pixel coordinates, laid over the image with `mix-blend-mode: multiply` (the render's shading and paper show through) and clipped to the label sleeve with an SVG `clipPath` inset 1.5px from the silhouette; on dark labels add a soft `screen` sheen on the lit side. Text runs along a pen's axis. **Never use a CSS `mask-image` with an image file:** browsers block it when the page is opened from disk (the user's `preview.sh` opens `file://`) and the whole label vanishes. Check every change from `file://` too, not only from a local server.
  6. **Label content: clean, minimal, real** (the user's Good Life and hims vials; hims' and Superpower's GLP-1 vials on Mobbin): tiny `Rx only` (DM Mono caps) at the start, the product name in **regular** weight, one quiet dose line under it, the MEDARO wordmark **small** at the end like a maker's mark. Nothing else: no pills, bands, bold names, stripes, panels, slogans, use lines or fake small print, and never a big wordmark (the user: "those medaro branding is the culprit … bad as hell").

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
- **DM Mono** only for the small caps lines printed on product labels (after the hims vial), never in the UI.
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
| Button | `primary` (lime) · `dark` (ink); sizes `--s` 40, default 48, `--l` 54; `--pill` for V2. No arrows | all | exploring |
| Text link | `.link-underline` | all | exploring |
| Stand-in image | `.media-brief` + `assets/images/standin-*.svg`; `?briefs=on` shows the photo brief | all | exploring |
| Promo card | `components/promo-card.css`, **`--paper` (locked)**: light card, ink title, olive label `#56662F`, no shadow; radius 12 like the nav, 8px inset and 8px image radius like the nav buttons; 104px image left, caps label, two-line title, 40px round ↗ 8px from the corner | Home V1 | locked |
| Product scene | V2: `.hero-v2__scene`, a box on the right of the stage sized by the stage height and the room the copy leaves (`--copy-room` 740px), so every object stays whole; inside, `.product` objects placed with `--x --y --h --r` and floated by `.product__float` with their own `--dur --delay --fx --fy --fr`; pen labels are `.product__print` SVG clipped to the sleeve (+ `.product__sheen` on dark sleeves), no CSS image masks. Still under reduced motion. Backdrop plate covers the stage behind it | Home V2 | exploring |
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
| hero | V1 locked · V2 exploring | `claude/upbeat-lamport-vxbm8d` | Two versions (`?hero=v1|v2`). **V1 (locked by the user, 2026-11-19), after avenn**: full-bleed photo `hero-run.webp` (man and woman running side by side, low angle, olive-to-sage sky; Nano Banana 2.1, 4K), smoke glass nav, "Made for Better Health." top left with the paper supplement card top right, "Care Without the Runaround." bottom right, sentence + Get Started bottom left, everything on the frame edges. **V2, after Superpower + the user's floating-pens reference**: plain header, a rounded stage on the dark olive plate with its light beam; four separate renders float on it, each on its own loop: a white GLP-1 pen with a ridged end cap and inspection window (minimal label: Rx only, "Semaglutide", dose line, small MEDARO mark), a capped pen with a grey clip crossing behind it near the bottom (olive label, same layout in paper, "Tirzepatide"), and the white and lime debossed MEDARO tablets. All objects whole inside the stage at 1280–1920; copy clears them by 59px+ (1280) and 111px+ (1440×900). Left: eyebrow "Made for Better Health.", "Expert medical care, from the comfort of home.", sentence, Get Started + "How Medaro Works", three facts. No ticker. |
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

- 2026-11-19: Pens rendered one by one, blank, with real moulded detail (ridged cap, inspection window, clear dose window, ridged olive knob, clip): "what you made product mockup wise is better than before". Tablets kept exactly as they were.

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

- 2026-11-19: Everything generated in Magnific, branding included (pens with AI-printed MEDARO/GLP-1 bands). The user: make the 3D in Magnific, do the text "by code", "write in md files too so this does not happen again". Then the single-image scene with the front pen cut off at the top, and one image for all objects ("generate all one by one"). Rules now in Direction → MEDARO product imagery.
- 2026-11-19, code labels, three rounds: (1) lime stripe and panel, "MEDARO GLP-1", "Weight management", tiny compressed small print: "ai looking shit … make it like real product, see their copy"; (2) minimal name + use lines with a mid-size wordmark: "also not good, see 5 images i sent … copy it"; (3) hims-style giant wordmark along the label: "those medaro branding is the culprit … bad as hell"; (4) Zepbound-style label with a strength pill, "injection" and a use line: "better but not what i need … clean, minimal, real life like medicine package". Lesson: Good Life / hims minimal: name, dose, Rx only, small mark. Also: the CSS image mask made every label vanish on the user's machine (file://).

### Copy flags to raise with the user

- The nav says "Supplement" (client's word); the section copy says "Supplements". We use "Supplement" in nav and hero rows for now. Suggest "Supplements".
- The hero has no CTA in the brief. We use "Get Started" (the client's label elsewhere) and scroll to How Medaro Works until told otherwise. `[LINK NEEDED]`
- The header adds a Get Started button (not in the brief's nav list). `[LINK NEEDED]`
- The brief's "Contact Support" nav item is now the "Contact" button (user's call). The page can keep the title "Contact Support".
- V2 pack labels use only copy words: vial "GLP-1 / Weight management / Rx only / Prescribed only when medically appropriate"; bottle "Quad 4 / Sublingual formulation / Sildenafil · Vardenafil · Tadalafil · Apomorphine / Rx only / Dissolves under the tongue". Doses and NDC numbers left out: `[DATA NEEDED]` from the client if they want them on the labels.
- **Pen labels (Home V2):** "Semaglutide" and "Tirzepatide" (the two molecules the client's weight-loss copy names), a dose line, "Rx only". **Doses are stand-ins** (each molecule's standard starting strength: semaglutide 0.25 mg/0.5 mL, tirzepatide 2.5 mg/0.5 mL) so the labels read like real ones: `[DATA NEEDED]`, confirm with the client what they dispense (and whether these are compounded, which the disclaimer must then cover). No NDC numbers. If the client prefers no molecule names, fall back to the same layout without them.
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
| hims testosterone vials, Zepbound pen and vial (screenshots) | **Pack labels**: product name, strength chip, small print, big vertical wordmark, coloured flip cap, brushed collar; front-on, hard key light | user |
| Good Life tablets and vials, hims tablet/capsule/vial row (screenshots) | **Product render quality bar**: macro tablets with debossed logos and powder texture, metal-capped vials, printed capsules, hard shadows | user |
| Good Life box set, besea floating sachets, Bionoss shelf (screenshots) | **Packaging direction**: premium matte boxes and jars, sachets floating, a deep-green range | user |
| Seed (Mobbin) | **Packaging direction**: deep olive and frosted glass jars with dark lids, minimal wordmark | Mobbin |
| Cosmos, Analogue Agency, Fuser (Mobbin) | **Nav surfaces.** Dark glass pill of links between a free-standing logo and a glowing CTA (Cosmos); light frosted bars (Analogue, Fuser) | Mobbin |
| nekohealth.com | *Couldn't load (bot check). Waiting for screenshots.* | user (liked) |
