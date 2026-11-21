# MEDARO in Framer (Phase 2)

Log of what has moved from `main` (HTML) into Framer, how it was built, and what is still open. Read it with `DESIGN.md` before touching the Framer project.

- **Project:** "Distinct Plans", `https://framer.com/projects/Distinct-Plans--b3CLkkhNhQ4uVM34vJeq-6wOR4` (user, 2026-11-21: "see main we have hero and nav there move that to framer ok make responsive too").
- **Framer branch:** edits went straight to the project's `main` (the project was empty; no Framer branch was created). **Not published.** Publishing only when the user asks.
- **Source:** `origin/main` at `a58c3f4` (hero V4 + menu header, approved 2026-11-20/21).

## Status

| Piece | Framer | Breakpoints | Notes |
|---|---|---|---|
| Colour styles | done | n/a | Folder "MEDARO Colours": Ink, Ink Soft, Accent, Accent Hover, Sage, Paper, Mist, Mist Hover (`#D4D7CB`, the HTML's `color-mix` hover), Deep, Line, Stage (`#171B11`), White, Label Grey (`#6B6B68`) |
| Text styles | done | desktop / tablet / phone | Folder "MEDARO Text Styles": Hero Lede 14 (phone 15), Card Title 28 (tablet 22, phone 24), Card Line 14 (13), Menu Title 22, Menu Link 28 (phone 26), Menu Label 11 caps, Treatment Name 15. Host Grotesk throughout |
| Header (layout template "Main") | done | 1200 / 810 / 390 | Fixed, 70px, Paper. Logo (wordmark SVG, links to `/`) + Get Started (Button, Dark, 44px) + round menu button. Content inset: 64px desktop, 48 tablet, 28 phone (= stage edge + stage padding at each size) |
| Menu sheet | done | all | Fixed overlay on the menu button: 42% olive scrim (dismissible, blocks scroll), Paper sheet 460px wide, 8px from the screen edges, radius 18 (phone: full width minus 16). Slides in from the right (0.42s ease-out), rows rise in with a 32ms stagger. Menu + close on a hairline, Explore (6 Menu Link instances), Top treatments row (4 Treatment Card instances, scrolls sideways), Contact (Outline) + Get Started (Dark) |
| Home hero | done | 1200 / 810 / 390 | See "Hero" below |
| Stage light | done | all | Code file `StageLight.ts` (shader), our approved `dust` look ported 1:1 from `site/components/stage-light.js`, with cover-fit anchored right inside the shader so it crops exactly like the plate. Controls: Rays 1, Haze 0.55, Dust 1, Sharpness 0.5, Speed 1, Grain 0.03, Intro 2.4s. The plate image sits under it as the loading fallback |

## Components (folder "MEDARO Components")

- **Button**: variants Dark (Ink, Paper text) and Outline (1px ink 24%), pill, 48px (header instance 44). Hover: Dark → Deep, Outline → solid ink border. Pressed variants exist. Controls: Label, Link.
- **Category Tile**: variants Weight Loss (Microdose vial, 122% of the card, at 74% / 73%, 9°), Men's Health and Women's Health (portraits, 122%, at 80% / 66%); white, radius 12, padding 22/24/24, name + line top left (text block 58% wide, name never wraps), 40px Mist arrow bottom left. Hover: product lifts 4px (vial turns 2° more), arrow circle → Accent, arrow nudges 2px. Controls: Name, Line, Link.
- **Treatment Card**: variants Microdose, Quad 4 (ampoule with the dark-ink print), Multidose, Supplements (blank white tablet, no Rx badge); 168×196 Mist, radius 14, Rx badge, name at the foot. Hover: slightly darker card, product up 3px. Controls: Name, Link.
- **Menu Link**: 28px label + arrow, padding 9/14, radius 12; hover: Mist row, arrow nudges 3px, label rolls up (see Open items).

## Hero

- Section 100vh (min 766, max 1086), padding 70 / 16 / 16; Stage max 1888, radius 18, padding 44 / 48 / 48. Same frame as the HTML.
- Backdrop: plate, Stage Light shader, three scrims (the HTML's radial-left, top and bottom gradients as separate layers).
- Headline: "Made for" (h1) and "Better Health." as two autofit texts, widths 38.95% and 57.8% of the content width (their share of the one-line "Made for Better Health."), so both lines share one size that scales with the screen like the HTML's `--fs`.
  - **Calibration (measured against `main` at 1440×900):** `lineHeight 0.7em` boxes the letters cap-top to baseline, but Framer clips text to its box, so both texts have `overflow: visible` (otherwise the top bar of the B and the ascenders vanish). Framer sets the glyphs about 10px higher in the box than Chrome does, so the Head group sits `top: 10px`; Made for `fontSizeScale 102%`, Better Health `101%`, right-aligned, wrapper `paddingBottom 36px` (baseline 32px above the cards). Result: cap heights within 1px, edges within 2–4px of the HTML at 1280, 1440 and 1920.
- Products: one box (`aspectRatio 0.62`, pinned top/bottom from the top of "Made for" to the top of "Better Health.", centred). Each object is a wrapper (position %, size %, tilt) with an inner Float layer carrying a mirrored loop (own period 3.1–4.1s, drift and turn), so the float never fights the tilt.
- Cards: Care Categories nav, 21% of the stage (160–208px), three Category Tile instances.
- **Tablet (810–1199):** the hero stops being one screen tall: Made for (56.6% wide) and the sentence on top, the products in the flow below (440px tall), Better Health (84%) right-aligned, then the three cards as full-width rows (150px). The side-by-side card row was tried at 810 and dropped: at 232px wide the names ran under the products.
- **Phone (≤809):** the same order; frame edge 10, stage padding 28 / 18 / 18, radius 16; Made for 63% and Better Health 94% (about 55px), sentence 15px, products 330px, cards full width at 140px.

## Images

Uploaded to the Framer project (source files on `main` unless noted):

- `stage-plate.webp`, `tablet-white-blank.webp`, `tablet-oval-lime-blank.webp` as they are.
- `man-a-faded.webp`, `woman-a-faded.webp`: the portraits with the card's fade baked into the alpha (opaque to 58% of the height, gone at 96%, as the CSS mask on `main`).
- **The packs are flattened** (print and sheen composited onto the render, one transparent image each), because Framer has no SVG-over-image blend stack: `vial-microdose.webp`, `vial-multidose.webp` (render + print multiplied onto the opaque label + sheen screened), `ampoule-quad4-glass.webp` (hero) and `ampoule-quad4-ink.webp` (menu card). The ampoule prints sit on transparent glass, where blend modes can't be flattened directly: a screened print equals white at alpha = print alpha × luminance, a multiplied ink print equals the ink colour at alpha = print alpha × (1 − luminance); composited "over" the cut-out, so the glass stays see-through. **If a label changes on `main` (`tools/pack-print.py`), re-flatten and re-upload.**

## Links (`[LINK NEEDED]`)

Framer rejects links to pages or sections that don't exist yet, so these are unlinked for now: header and menu Get Started (HTML: `#how-it-works`), menu Weight Loss, Men's Health, Women's Health, Supplement, How Medaro Works (Home sections not transferred yet), About Us (`about.html`), Contact (`contact.html`), the three hero cards (`weight-loss.html`, `mens-health.html`, `#womens-health`) and the four Top treatments cards. The logo links to `/`. Link each as its page or section arrives; menu links should also close the sheet (Close Overlay on tap).

## Open items

- **Rolling link:** Framer can't stagger a hover per letter without splitting the label into letter layers, so Menu Link rolls the whole word (two stacked labels in a clip, 0.28s, same curve). The per-letter roll needs a code override; ask the user before adding one.
- **Headline semantics:** Framer doesn't allow aria-label on text, so the h1 is "Made for" and "Better Health." is a paragraph; the hero section carries `aria-label="Made for Better Health."`.
- **Reduced motion:** site setting on (Framer turns off appear and loop effects for people who ask for less motion). The shader keeps running; it has no reduced-motion input yet.
- Page metadata: Home title "MEDARO · Made for Better Health" and the client's sentence as description. The site-wide title is still Framer's default, and no noindex is set (the HTML draft uses noindex). Decide before publishing.
