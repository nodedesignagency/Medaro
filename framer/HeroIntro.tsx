import { forwardRef, type ComponentType } from "react"

/**
 * MEDARO Home hero intro (desktop, 1200px and up). Applied to the Hero section on Home.
 *
 * 1. The stage fills the whole screen, over the header, with the products big in the centre (in from blur).
 * 2. At 0.9s the stage pulls back into its frame (1.2s) and the products shrink to their place in the same move.
 * 3. The header (1.5s), "Made for" (1.7s), the sentence (1.85s), "Better Health." (1.9s) and the three
 *    cards (2.0s, 80ms apart) come in. Done at about 3.1s.
 *
 * Pure CSS keyframes rendered next to the section, so it runs from the first paint and the finished hero
 * never flashes before the script loads. Layers are found by their Framer layer names (data-framer-name):
 * keep the names Hero, Stage, Upper, Products, Scrim..., Head, Made for (cap height), Trim top, Sentence,
 * Better Health, Better Health (cap height), Care Categories and the template's Header.
 * Tablet, phone and reduced motion: no intro (the hero is shown as it is).
 * Source of record: framer/HeroIntro.tsx in the MEDARO repo.
 */
const CSS = `
/* MEDARO Home hero intro (desktop only, 1200px and up; off with reduced motion).
   1. The stage fills the whole screen (over the header), the products big in the centre, coming in from blur.
   2. The stage pulls back into its frame and the products shrink to their place, in one move.
   3. The header, "Made for", the sentence, "Better Health." and the three cards come in.
   Pure CSS keyframes, so it runs from the first paint: the finished hero never flashes before the script loads. */
@media (min-width: 1200px) and (prefers-reduced-motion: no-preference) {
  :root {
    --mi-move: cubic-bezier(0.76, 0, 0.24, 1);
    --mi-out: cubic-bezier(0.22, 1, 0.36, 1);
    /* how much the stage grows to cover the screen: 1.13 covers every screen up to 2133 x 1130 */
    --mi-cover-w: 1.13;
    --mi-cover-h: 1.13;
    --mi-cover: max(var(--mi-cover-w), var(--mi-cover-h));
  }
  [data-framer-name="Hero"] {
    position: relative;
    animation: mi-raise 2.1s linear both;
  }
  [data-framer-name="Hero"] [data-framer-name="Stage"] {
    animation: mi-stage 1.2s var(--mi-move) 0.9s both;
  }
  [data-framer-name="Hero"] [data-framer-name="Upper"] {
    animation: mi-upper 2.1s linear both;
  }
  [data-framer-name="Hero"] [data-framer-name="Products"] {
    animation: mi-products 1.1s var(--mi-out) 0.1s both;
  }
  [data-framer-name="Hero"] [data-framer-name^="Scrim"] {
    animation: mi-fade 1.2s ease-in-out 0.9s both;
  }
  [data-framer-name="Hero"] [data-framer-name="Head"] > [data-framer-name="Made for (cap height)"] > [data-framer-name="Trim top"] {
    animation: mi-line 1s var(--mi-out) 1.7s both;
  }
  [data-framer-name="Hero"] [data-framer-name="Sentence"] {
    animation: mi-soft 0.9s var(--mi-out) 1.85s both;
  }
  [data-framer-name="Hero"] [data-framer-name="Better Health"] > [data-framer-name="Better Health (cap height)"] > [data-framer-name="Trim top"] {
    animation: mi-line 1s var(--mi-out) 1.9s both;
  }
  /* Framer wraps each card instance in a display:contents div, so the card inside it is animated */
  [data-framer-name="Hero"] [data-framer-name="Care Categories"] > :not(.ssr-variant),
  [data-framer-name="Hero"] [data-framer-name="Care Categories"] > .ssr-variant > * {
    animation: mi-card 0.9s var(--mi-out) 2s both;
  }
  [data-framer-name="Hero"] [data-framer-name="Care Categories"] > :nth-child(2):not(.ssr-variant),
  [data-framer-name="Hero"] [data-framer-name="Care Categories"] > .ssr-variant:nth-child(2) > * { animation-delay: 2.08s; }
  [data-framer-name="Hero"] [data-framer-name="Care Categories"] > :nth-child(3):not(.ssr-variant),
  [data-framer-name="Hero"] [data-framer-name="Care Categories"] > .ssr-variant:nth-child(3) > * { animation-delay: 2.16s; }
  header[data-framer-name="Header"] {
    animation: mi-header 0.8s var(--mi-out) 1.5s both;
  }

  /* the hero sits over the fixed header (z-index 5) only while the stage is full screen */
  @keyframes mi-raise { from, to { z-index: 6; } }
  /* the stage's centre is the section's centre + 27px (70px header, 16px foot); on screens taller than the
     section (max 1086px) it moves to the middle of the screen */
  @keyframes mi-stage {
    from { translate: 0 calc(max(0px, 50vh - 543px) - 27px); scale: var(--mi-cover); }
    to { translate: 0 0; scale: 1; }
  }
  /* Upper holds the products box, centred in it: its centre goes to the stage's centre, then it grows.
     Products end up about 1.6x their size (1.7x at the very start), whatever the cover scale */
  @keyframes mi-upper {
    0% { translate: 0 calc((clamp(766px, 100vh, 1086px) - 86px) / 2 - 44px - 50%); scale: calc(1.7 / var(--mi-cover)); animation-timing-function: var(--mi-out); }
    43% { translate: 0 calc((clamp(766px, 100vh, 1086px) - 86px) / 2 - 44px - 50%); scale: calc(1.6 / var(--mi-cover)); animation-timing-function: var(--mi-move); }
    100% { translate: 0 0; scale: 1; }
  }
  @keyframes mi-products {
    from { opacity: 0; filter: blur(20px); }
    to { opacity: 1; filter: blur(0); }
  }
  @keyframes mi-fade { from { opacity: 0; } to { opacity: 1; } }
  @keyframes mi-line {
    from { opacity: 0; filter: blur(16px); translate: 0 30%; }
    to { opacity: 1; filter: blur(0); translate: 0 0; }
  }
  @keyframes mi-soft {
    from { opacity: 0; filter: blur(10px); translate: 0 12px; }
    to { opacity: 1; filter: blur(0); translate: 0 0; }
  }
  @keyframes mi-card {
    from { opacity: 0; translate: 0 48px; }
    to { opacity: 1; translate: 0 0; }
  }
  @keyframes mi-header {
    from { opacity: 0; translate: 0 -12px; }
    to { opacity: 1; translate: 0 0; }
  }
}
/* big screens: the stage stops at 1888 x 1000px, so it needs more scale to cover */
@media (min-width: 2134px) { :root { --mi-cover-w: 1.3; } }
@media (min-width: 2455px) { :root { --mi-cover-w: 1.45; } }
@media (min-width: 2738px) { :root { --mi-cover-w: 1.65; } }
@media (min-width: 3116px) { :root { --mi-cover-w: 2; } }
@media (min-height: 1131px) { :root { --mi-cover-h: 1.3; } }
@media (min-height: 1301px) { :root { --mi-cover-h: 1.45; } }
@media (min-height: 1451px) { :root { --mi-cover-h: 1.65; } }
@media (min-height: 1651px) { :root { --mi-cover-h: 2; } }
`

export function withHeroIntro(Component: ComponentType<any>): ComponentType<any> {
    return forwardRef<any, any>(function HeroIntro(props, ref) {
        return (
            <>
                <Component {...props} ref={ref} />
                {/* dangerouslySetInnerHTML: a plain {CSS} child can be escaped in the pre-rendered HTML (">" turns into "&gt;") */}
                <style data-medaro="hero-intro" dangerouslySetInnerHTML={{ __html: CSS }} />
            </>
        )
    })
}
