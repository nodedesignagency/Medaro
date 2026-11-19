# MEDARO website

Website for MEDARO, an online health brand: people complete an online intake, a licensed provider from an independent medical group reviews it, and if treatment is appropriate a licensed pharmacy ships it. Lines: **Weight Loss** (GLP-1), **Men's Health** (ED, the compounded "Quad 4"), **Women's Health** (coming soon), **Supplements**. Tagline: **Made for Better Health.** We are the design agency.

Read `DESIGN.md` before designing anything. It holds the design system, the section status per page, and everything the user has liked or rejected. Keep both files current: when the user approves, rejects or prefers something, write it down in the same push.

## How we work

- **Phase 1 is HTML**: fast static drafts in `/site` so we can review and change things quickly.
- **Phase 2 is Framer**, through the Framer MCP, only once `main` holds approved pages and the user has created the Framer file and says "move to Framer". Never touch Framer before that.
- **Page by page, section by section.** Mostly one page at a time, but any session may work on any page. Show each section before moving on. For key sections (heroes, the first fold of each landing page) offer 2–3 versions.
- **Alignment:** every section sits on the frame (`--frame-side`, see `DESIGN.md` → Space, layout, shape): content edges line up with the nav bar's edges, and nothing stretches past 1888px. Check edges by measuring rendered pixels, not by eye.
- **Desktop only in the HTML phase.** Don't build or check tablet or phone layouts until Framer. Before handing anything over, check it in a browser at 1440 wide (and at 1280 and 1920 to make sure the desktop range holds); fix overflow, overlaps and broken wraps. Also check at 2x pixel density: the user reviews on a Retina Mac.
- Use skills when they help (list below). Load `anthropic-skills:frontend-design` before starting a new section's visual direction.

## Branches: `main` is approved work only

- **`main`** holds only sections the user has approved. It is what the client will see, and what goes to Framer.
- **The user runs several chats at once, each on its own branch** (the branch the session gives you, `claude/…`). Explore freely there: different sections, different styles. Stay inside your own section's files so parallel branches don't collide (see "Files").
- **Never push to `main` unless the user explicitly approves a section in this chat** ("confirm this section", "approve the hero", "move to main"). Approval in another chat does not count.
- **To promote an approved section to `main`**:
  1. `git fetch origin main`, then work on a fresh checkout of `main` (a worktree is easiest: `git worktree add ../medaro-main origin/main`).
  2. Copy across only that section: its HTML block between `<!-- SECTION:<page>/<name> START -->` and `<!-- SECTION:<page>/<name> END -->`, its stylesheet `site/sections/<page>/<name>.css`, its `<link>` in the head, any script or asset listed in its START marker, and any component it uses from `site/components/`.
  3. If the user picked one of several versions (`hero--a`, `hero--b`), promote only that one and drop the suffix: it becomes `hero`.
  4. Only bring shared files (`styles.css`, `main.js`, assets) if the approved section needs those changes. Say which shared changes you carried over.
  5. Update the section status table in `DESIGN.md` on `main` too.
  6. Commit as `Approve <page>/<section> (from <branch>)`, push `main`, then tell the user what changed on `main`.
- To pick up newly approved work (or token changes) in an exploration branch, merge `origin/main` into it.

## After every push: give the git pull

Every message that follows a push ends with the exact command and the commit the user should see, like Arcovia:

```bash
cd ~/Desktop/medaro-preview && ./preview.sh <branch>
```

`preview.sh` fetches, switches to the branch, pulls (fast-forward only) and opens `site/index.html`. Other pages or review switches: `./preview.sh <branch> weight-loss.html`, `./preview.sh <branch> "index.html?hero=v2"`. With no branch it opens `main`. The user's local clone is `~/Desktop/medaro-preview`; the first time only:

```bash
git clone https://github.com/nodedesignagency/Medaro.git ~/Desktop/medaro-preview
```

## Files

- `site/index.html` (Home), `about.html`, `contact.html`, `weight-loss.html`, `mens-health.html`, `legal/<slug>.html`. One HTML file per page. Sections are wrapped in `<!-- SECTION:<page>/<name> START · styles: … · scripts: … -->` and `<!-- SECTION:<page>/<name> END -->`.
- `site/styles.css`: **all tokens** (colour, type scale, spacing, radius, shadows, motion), base styles and the small shared pieces (buttons, eyebrow, links, container). Token names are fixed in `DESIGN.md`; change values only with a note there.
- `site/components/<name>.css`: blocks used on more than one page and built as Framer components: header, footer, steps, faq, cta-band, disclaimer, check-list, treatment card.
- `site/sections/<page>/<name>.css`: one stylesheet per section (e.g. `sections/home/hero.css`). Asset paths inside start with `../../assets/`.
- `site/main.js`: small shared JS (header, scroll links, FAQ, version switcher).
- `site/assets/logo/`: the client's official wordmark. `wordmark.svg` is cropped tight to the letters (black), `wordmark-white.svg` for dark backgrounds, `medaro-logo-original.svg` and `.jpg` exactly as delivered. Pages inline it from the sprite as `#wordmark` (`currentColor`). **Use these, never typeset "MEDARO" for the logo.**
- `site/assets/images/`: photography and renders, compressed (WebP/AVIF, ≤300 KB each, hero ≤500 KB).
- `site/versions/<name>/`: frozen snapshots the user asked to keep for comparison. Never edit them and never promote them to `main`; open with `./preview.sh <branch> versions/<name>/index.html`.
- `content/`: the client's copy as Markdown, word for word: `home.md`, `about.md`, `weight-loss.md`, `mens-health.md`. Originals in `content/source/` (`medaro-copy.pdf` and `legal/*.pdf`, 11 legal documents).
- `review/`: screenshots and videos for review. Git-ignored; send them to the user, don't commit them.

**Versions inside one branch:** when offering versions of a section, give each its own block and stylesheet (`SECTION:home/hero--v1`, `sections/home/hero--v1.css`, same for `--v2`) and mark the wrapper `data-version="hero:v1"`. `main.js` shows one at a time, chosen with `?hero=v2`, and adds a small review switcher in the corner (hidden with `?review=0`). The switcher is review-only and never goes to Framer. If a version needs its own header, put the header inside the same wrapper.

Use the same class names everywhere (BEM-ish: `.hero__title`, `.btn--primary`). Reusable parts (header, footer, buttons, steps, FAQ, CTA band, disclaimer, cards) must be built the way Framer will need them: one structure, variants by modifier, no page-specific hacks.

## Pages and scope

| Page | File | Copy | Nav |
|---|---|---|---|
| Home | `index.html` | `content/home.md` | Full header: **logo left · six links centred · "Contact" secondary button + Get Started right, no login**. Weight Loss · Men's Health · Women's Health · Supplement · How Medaro Works **scroll** to sections on Home (like home.medvi.org). About Us and the Contact button **open pages** (Contact goes to the Contact Support page). |
| About Us | `about.html` | `content/about.md` | Full header |
| Contact Support | `contact.html` | **[COPY NEEDED]** | Full header |
| Weight Loss landing | `weight-loss.html` | `content/weight-loss.md` | **No links to Home or any other page.** Logo is not a link. Every CTA goes to the Weight Loss intake form. |
| Men's Health landing | `mens-health.html` | `content/mens-health.md` | **No links to Home or any other page.** Every CTA goes to the Men's Health (ED) intake form. |
| Legal (11) | `legal/<slug>.html` | `content/source/legal/*.pdf` | Footer links. Docs have placeholders like `[BRAND_NAME]`, `[EFFECTIVE_DATE]`: keep them visible until the client fills them. |

Women's Health shows **Coming Soon** (no link). Intake form URLs, the Supplements link and the hero CTA are unknown: use `#intake-weight-loss`, `#intake-mens-health`, `#supplements-link` and mark `[LINK NEEDED]`.

## Copy and compliance (telehealth: this matters)

- **Read the copy brief before designing a section.** The four care lines (Weight Loss, Men's Health, Women's Health, Supplement) live in the header nav only, never in the hero, except where the user asks for something specific (V1 has one supplement promo card at their request).
- **When the user gives a reference, follow it closely**; don't invent extra devices. The first round of heroes was rejected as "AI slop" (see `DESIGN.md` → Rejected).
- Hero copy is ours to write (the user said so); everywhere else, use the client's copy from `content/` word for word. You may change case and layout, not words. If a design needs shorter copy, propose the cut to the user; never edit silently. Missing copy: a short placeholder marked `[COPY NEEDED]`. No lorem ipsum.
- **Never remove or soften a qualifier or disclaimer** ("when medically appropriate", "if prescribed", "has not been demonstrated", "not FDA-approved", "results vary"). Disclaimers stay visible near the claims they qualify, not only in the footer.
- **Never invent** numbers, prices, pounds lost, percentages, patient counts, ratings, reviews, testimonials, doctor names or credentials, "as seen in" logos, or certification badges. Placeholders only, marked `[DATA NEEDED]`.
- Quad 4 is a proposed compounded formulation: never call it FDA-approved, never imply speed or duration claims the copy explicitly denies.
- Imagery: no before/after bodies, no scales or measuring tapes as "results", no branded drug packaging (Ozempic, Wegovy, Mounjaro, Zepbound, Viagra, Cialis are trademarks), no lab coats implying a real MEDARO doctor unless the client supplies the person. Generic vials, sublingual tablets, plain unbranded packaging and lifestyle photography are fine.
- Accessibility is part of compliance for a health site: WCAG 2.2 AA contrast, keyboard focus, semantic headings, `prefers-reduced-motion` respected.

## Open questions (ask the user, then move the answer into the right section)

- Intake form URLs (weight loss, men's health) and the Supplements link.
- Contact Support page copy (email, phone, hours, form?).
- Landing-page footer: may it link to Privacy / Terms? (Ad platforms and state laws usually require it, even when the page has no other links.)
- Photography and product renders: **images are made after the user confirms a design** (user, 2026-11-19). Until then use stand-ins (`assets/images/standin-*.svg`, or UI built in code) and write the photo brief in `data-brief`.
- Body/UI typeface: the logo is Montserrat; is there a brand palette or font beyond the logo?

## Skills and tools

Use these when the task calls for them:

- `anthropic-skills:frontend-design`: before setting the visual direction of a new section or page.
- `anthropic-skills:emil-design-eng`, `anthropic-skills:better-interface`: polish and review passes before showing a section.
- `anthropic-skills:animate`, `anthropic-skills:interaction-design`: scroll reveals, nav behaviour, hover and press states. `anthropic-skills:find-animation-opportunities` to look for gaps.
- `anthropic-skills:accessibility`: audit each page before it is promoted to `main`.
- `anthropic-skills:beautiful-shadows`: card, button and media elevation.
- `anthropic-skills:mobile-native`: during the Framer transfer only, for the phone layouts (the landing pages get paid mobile traffic).
- `anthropic-skills:break-ui`: stress-test components with long copy before promotion.
- `run` / Playwright: screenshots for review.
- MCP: **Mobbin** for reference screens and sections; **Magnific** to generate or edit imagery (ask the user before spending credits); **Figma** if the user shares a Figma link; **Framer** for Phase 2 only.

## Design direction

See `DESIGN.md`. Breakpoints match Framer: desktop ≥1200, tablet 810–1199, phone ≤809. **HTML is desktop only** (review size 1440, 2x). The user confirms desktop sections, they move to `main`, and the **responsive versions (tablet and phone) are built in Framer during the transfer**, not in HTML. Still build desktop so it can adapt: real grid, no fixed-pixel tricks that can't collapse, no copy baked into images.

## Phase 2 (Framer) rules, only once the user says "move to Framer"

- Work only in the Framer project the user names. Never touch their other Framer projects.
- Order: text and colour styles from the tokens first, then components (header, footer, buttons, steps, FAQ, CTA band, disclaimer, cards), then pages, section by section from `main` only.
- **Responsive happens here.** For every component and section, build the tablet (810–1199) and phone (≤809) breakpoints as it is transferred, using the phone type scale in `DESIGN.md`. Show the user the phone and tablet versions before moving to the next section.
- Home nav scroll links become section anchors; landing pages get the minimal header with no links out.
- Tell the user before anything destructive, like deleting pages or overwriting styles.

## Checking pages in the container

Chromium and Playwright are pre-installed. Serve `site/` with `python3 -m http.server`, screenshot at 1440 (deviceScaleFactor 2 for anything the user sees; 1280 and 1920 for your own range check), and send screenshots from `review/`. For WebGL, launch Chromium with `--use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist`.

Network: launch Chromium with `proxy: { server: process.env.HTTPS_PROXY, bypass: '<-loopback>,localhost,127.0.0.1' }` so Google Fonts load and localhost isn't sent to the proxy (it returns a 405 page otherwise). The same launch can screenshot reference sites the user shares; save them to `review/inspo/`. Sites behind a bot check (nekohealth.com) won't load: ask the user for screenshots instead of working around it.

Product imagery: follow "MEDARO product imagery" in `DESIGN.md` → Direction. **Magnific makes the 3D product, code makes the branding.** One render per object (never one scene for everything), each object whole in its frame (never cropped), pens upright and tilted in CSS, rendered **blank** (no text, logos or numbers; debossed tablets are the only exception). Cut out with background removal (3 credits); each object floats on its own. **All label text and branding is SVG in code**, clean but structured with one strong colour block, after the user's Superpower, Face Formula and Immortals references (hairlines along the label, product name, a solid colour tab with the dose, small MEDARO mark + Rx only, one use line: `DESIGN.md` → Direction, rule 6), printed with multiply and clipped with an SVG clipPath. **Every word must be readable in the hero** (nothing under about 6.5px on screen at 1440): cut what would be smaller. Never a big wordmark, tiny text, hairline "fields", slogans or invented small print, and never a CSS `mask-image` with an image (it vanishes when the page is opened from disk). Check pages from `file://` as well as from the server: that is how the user previews.

Images: Magnific (Freepik) is connected on a paid plan. Stock downloads and generations cost credits (a free-licence stock photo is 40), so ask the user before spending any.
