import { forwardRef, useCallback, useEffect, useRef, type ComponentType } from "react"

/**
 * MEDARO scroll parallax (2026-11-26, after the user's Good Life reference: "small parallax of image").
 * Each layer rests exactly where it was approved and only moves while its section scrolls:
 * - withHeroDepth (Home hero Products): as the hero scrolls away the products rise a little faster than the
 *   page (up to 14% of the hero's height when it has left the screen). Desktop only (1200px and up): on
 *   tablet the products sit in the flow under the sentence.
 * - withRiseIn (footer Vial): while the footer comes up the vial sits lower and rises into its place, which it
 *   reaches when the footer is fully on screen (the end of the page).
 * Uses the CSS translate property, so Framer's own transforms (rotation, centring, the float loop) stay as
 * they are. One shared scroll listener and one frame per scroll. Reduced motion: no movement.
 * Source of record: framer/Parallax.tsx in the MEDARO repo.
 */

type Item = { el: HTMLElement; update: (el: HTMLElement, vh: number, vw: number) => void }
const items = new Set<Item>()
let frame = 0
const run = () => {
    frame = 0
    const vh = window.innerHeight
    const vw = window.innerWidth
    items.forEach((item) => item.update(item.el, vh, vw))
}
const queue = () => {
    if (!frame) frame = requestAnimationFrame(run)
}
function watch(item: Item) {
    items.add(item)
    if (items.size === 1) {
        window.addEventListener("scroll", queue, { passive: true })
        window.addEventListener("resize", queue)
    }
    queue()
    return () => {
        items.delete(item)
        item.el.style.translate = ""
        if (!items.size) {
            window.removeEventListener("scroll", queue)
            window.removeEventListener("resize", queue)
            if (frame) cancelAnimationFrame(frame)
            frame = 0
        }
    }
}
const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

function parallax(update: Item["update"]) {
    return function (Component: ComponentType<any>): ComponentType<any> {
        return forwardRef<any, any>(function Parallax(props, ref) {
            const own = useRef<HTMLElement | null>(null)
            const setRef = useCallback(
                (node: HTMLElement | null) => {
                    own.current = node
                    if (typeof ref === "function") ref(node)
                    else if (ref) (ref as any).current = node
                },
                [ref]
            )
            useEffect(() => {
                const el = own.current
                if (!el || typeof window === "undefined") return
                if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
                return watch({ el, update })
            }, [])
            return <Component {...props} ref={setRef} />
        })
    }
}

const heroDepth = parallax((el, vh, vw) => {
    const section = el.closest("section")
    if (!section || vw < 1200) {
        el.style.translate = ""
        return
    }
    const r = section.getBoundingClientRect()
    const p = clamp01(-r.top / r.height)
    el.style.translate = p ? "0 " + (-0.14 * p * r.height).toFixed(1) + "px" : ""
})

const riseIn = parallax((el, vh) => {
    const footer = (el.closest("footer") || el.parentElement) as HTMLElement | null
    if (!footer) return
    const r = footer.getBoundingClientRect()
    const p = clamp01((r.bottom - vh) / r.height)
    el.style.translate = p ? "0 " + (0.35 * p * el.offsetHeight).toFixed(1) + "px" : ""
})

export function withHeroDepth(Component: ComponentType<any>): ComponentType<any> {
    return heroDepth(Component)
}

export function withRiseIn(Component: ComponentType<any>): ComponentType<any> {
    return riseIn(Component)
}
