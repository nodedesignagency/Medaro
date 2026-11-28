import { forwardRef, useEffect, useRef, type ComponentType } from "react"
import { RenderTarget } from "framer"

/*
 * Weight Loss · three steps: the pinned panel and its card wheel, a 1:1 port of the HTML
 * (site/sections/weight-loss/steps.css + steps.js, round 5, after the user's
 * "Built for every stage of growth" recording).
 *
 * On the "Steps Track" frame. Desktop only: it runs while the "Steps Panel" inside is
 * position: sticky (the Desktop breakpoint); tablet and phone set the panel relative and
 * show the canvas' static layout, so everything here is reset.
 *
 * - The panel keeps the canvas' width (100%, max 1288) and is 2.125 : 1, never taller than
 *   the window under the 70px header (− 32px), pinned centred in the window under it.
 * - The cards are (panel height − 2 × 46) tall and 1.07 × that wide, 46px from the panel's
 *   top and right edges; the deck is a card plus 46px wide.
 * - The track gets one stretch of scroll per step (60% of the window) on top of the panel.
 * - Crossing into the next stretch turns the wheel: each "Step Card" rotates by
 *   (its index − the step) × −36° about a hub 2.24 card-widths right of its centre
 *   (transform-origin 274% 50%), as a 1s transition, cubic-bezier(0.7, 0, 0.2, 1): the card
 *   showing swings up and out past the top right, the next swings in from the bottom right.
 *   Back the other way when you scroll up. Transitions switch on a frame after load, so
 *   nothing swings when the page opens. Reduced motion: the card just changes.
 */
const HEADER = 70
const GAP = 32
const RATIO = 2.125
const INSET = 46
const CARD_RATIO = 1.07
const STEP = 0.6
const ANGLE = -36
const EASE = "cubic-bezier(0.7, 0, 0.2, 1)"

const shown = (el: Element) => (el as HTMLElement).getClientRects().length > 0

export function withStepsWheel(Component: ComponentType<any>): ComponentType<any> {
    return forwardRef<any, any>(function StepsWheel(props, ref) {
        const local = useRef<HTMLElement | null>(null)
        const setRef = (el: HTMLElement | null) => {
            local.current = el
            if (typeof ref === "function") ref(el)
            else if (ref) (ref as any).current = el
        }
        useEffect(() => {
            if (RenderTarget.current() === RenderTarget.canvas) return
            const track = local.current
            if (!track) return
            const still = window.matchMedia("(prefers-reduced-motion: reduce)")
            let panel: HTMLElement | null = null
            let deck: HTMLElement | null = null
            let cards: HTMLElement[] = []
            let step = 0
            let active = -1
            let live = false
            let queued = false
            let ready = false
            let raf = 0

            const find = () => {
                panel = (Array.from(track.querySelectorAll<HTMLElement>('[data-framer-name="Steps Panel"]')).find(shown) as HTMLElement) || null
                deck = panel ? (Array.from(panel.querySelectorAll<HTMLElement>('[data-framer-name="Steps Deck"]')).find(shown) as HTMLElement) || null : null
                cards = deck ? Array.from(deck.querySelectorAll<HTMLElement>('[data-framer-name="Step Card"]')).filter(shown) : []
            }
            const reset = () => {
                track.style.height = ""
                if (panel) { panel.style.height = ""; panel.style.top = "" }
                if (deck) deck.style.width = ""
                cards.forEach((c) => {
                    c.style.width = ""; c.style.height = ""; c.style.transform = ""; c.style.transformOrigin = ""; c.style.transition = ""
                    c.removeAttribute("aria-current")
                })
                active = -1
            }
            const measure = () => {
                find()
                const was = live
                live = window.innerWidth >= 1200 && !!panel && cards.length > 1 && getComputedStyle(panel).position === "sticky"
                if (!live || !panel) { if (was) reset(); else active = -1; return }
                const vh = window.innerHeight
                panel.style.height = ""
                const w = panel.getBoundingClientRect().width
                const h = Math.min(w / RATIO, vh - HEADER - GAP)
                const ch = h - 2 * INSET
                const cw = ch * CARD_RATIO
                panel.style.height = h + "px"
                panel.style.top = HEADER + (vh - HEADER - h) / 2 + "px"
                if (deck) deck.style.width = cw + INSET + "px"
                cards.forEach((c) => {
                    c.style.width = cw + "px"
                    c.style.height = ch + "px"
                    c.style.transformOrigin = "274% 50%"
                    c.style.transition = ready && !still.matches ? "transform 1000ms " + EASE : "none"
                })
                step = vh * STEP
                track.style.height = h + cards.length * step + "px"
                if (!was) active = -1
            }
            const show = (i: number) => {
                if (i === active) return
                active = i
                cards.forEach((c, k) => {
                    c.style.transform = "rotate(" + (k - i) * ANGLE + "deg)"
                    if (k === i) c.setAttribute("aria-current", "step")
                    else c.removeAttribute("aria-current")
                })
            }
            const update = () => {
                queued = false
                if (!live || !panel || !step) return
                const pin = parseFloat(panel.style.top) || 0
                const y = pin - track.getBoundingClientRect().top
                show(Math.min(cards.length - 1, Math.max(0, Math.floor(y / step))))
            }
            const queue = () => { if (!queued) { queued = true; raf = requestAnimationFrame(update) } }
            const remeasure = () => { measure(); queue() }

            measure()
            update()
            const r1 = requestAnimationFrame(() => {
                raf = requestAnimationFrame(() => {
                    ready = true
                    if (live && !still.matches) cards.forEach((c) => { c.style.transition = "transform 1000ms " + EASE })
                })
            })
            window.addEventListener("scroll", queue, { passive: true })
            window.addEventListener("resize", remeasure)
            window.addEventListener("load", remeasure)
            still.addEventListener("change", remeasure)
            return () => {
                cancelAnimationFrame(r1)
                cancelAnimationFrame(raf)
                window.removeEventListener("scroll", queue)
                window.removeEventListener("resize", remeasure)
                window.removeEventListener("load", remeasure)
                still.removeEventListener("change", remeasure)
                reset()
            }
        }, [])
        return <Component {...props} ref={setRef} />
    })
}
