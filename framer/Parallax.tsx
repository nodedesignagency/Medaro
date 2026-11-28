import { forwardRef, useCallback, useEffect, useRef, type ComponentType } from "react"

/**
 * MEDARO scroll parallax (2026-11-26, after the user's Good Life reference: "small parallax of image").
 * Each layer rests exactly where it was approved and only moves while its section scrolls:
 * - withHeroDepth (Home hero Products): as the hero scrolls away the products rise a little faster than the
 *   page (up to 20% of the hero's height when it has left the screen). Desktop only (1200px and up): on
 *   tablet the products sit in the flow under the sentence.
 * - withRiseIn (footer Vial): while the footer comes up the vial sits lower and rises into its place, which it
 *   reaches when the footer is fully on screen (the end of the page).
 * - withPhotoParallax (Supplement Photo Panel, desktop): the panel's photo is sp-woman-parallax.webp, the approved
 *   crop with 172px of the render kept above and below it (9.66% of the image each side). While the panel is fully
 *   on screen the photo rests exactly on the approved crop (head whole, chin above the glass card); while it comes
 *   up from the bottom the photo sits lower and slides up into place, and while it leaves at the top it keeps
 *   sliding up (up to 14% of the panel's height, never past the spare image). Moves the image's object-position,
 *   not the panel. Also does withReveal's job (Scenes.tsx, copied 1:1), so the glass card still fades up as before.
 * Uses the CSS translate property, so Framer's own transforms (rotation, centring, the float loop) stay as
 * they are. One shared scroll listener and one frame per scroll. Reduced motion: no movement.
 * Source of record: framer/Parallax.tsx in the MEDARO repo (keep the two in step).
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
    el.style.translate = p ? "0 " + (-0.2 * p * r.height).toFixed(1) + "px" : ""
})

const riseIn = parallax((el, vh) => {
    const footer = (el.closest("footer") || el.parentElement) as HTMLElement | null
    if (!footer) return
    const r = footer.getBoundingClientRect()
    const p = clamp01((r.bottom - vh) / r.height)
    el.style.translate = p ? "0 " + (0.35 * p * el.offsetHeight).toFixed(1) + "px" : ""
})

const HEAD = 172 / 1781.1 // share of sp-woman-parallax.webp kept above the approved crop (the same below)

function slidePhoto(el: HTMLElement, vh: number) {
    const img = el.querySelector(":scope > [data-framer-background-image-wrapper] img") as HTMLImageElement | null
    if (!img) return
    if (!img.complete || !img.naturalWidth) {
        img.addEventListener("load", queue, { once: true })
        return
    }
    const nw = img.naturalWidth
    const nh = img.naturalHeight
    const W = el.clientWidth
    const H = el.clientHeight
    const s = Math.max(W / nw, H / nh)
    const sh = nh * s
    const head = HEAD * sh
    const foot = sh - head - H
    // only the tall photo, and only when it is wider than the panel needs (desktop panel shapes)
    if (nh / nw < 1.25 || foot < 0 || W / nw < H / nh) {
        img.style.objectPosition = ""
        return
    }
    const r = el.getBoundingClientRect()
    const enter = clamp01((r.bottom - vh) / r.height)
    const leave = clamp01(-r.top / r.height)
    const t = enter * Math.min(head - 2, 0.14 * H) - leave * Math.min(foot - 2, 0.14 * H)
    img.style.objectPosition = "50% " + (t - head).toFixed(1) + "px"
}

// The reveal from Scenes.tsx → withReveal, 1:1 (code files can't import each other here): when a quarter of the
// panel is on screen the glass card fades up 20px (640ms) and its rows follow 10px, 120ms + 60ms apart. Once.
function useReveal(own: { current: HTMLElement | null }) {
    useEffect(() => {
        const panel = own.current
        if (!panel) return
        const card = Array.from(panel.children).find((el) => el instanceof HTMLElement && !el.hasAttribute("data-framer-background-image-wrapper")) as HTMLElement | undefined
        if (!card) return
        const rows = Array.from(card.children).filter((el): el is HTMLElement => el instanceof HTMLElement)
        const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        if (still || !("IntersectionObserver" in window)) return
        const ease = "cubic-bezier(0.22, 1, 0.36, 1)"
        const hide = (el: HTMLElement, y: number) => {
            el.style.opacity = "0"
            el.style.transform = `translateY(${y}px)`
        }
        hide(card, 20)
        rows.forEach((row) => hide(row, 10))
        const show = () => {
            const items: Array<[HTMLElement, number]> = [[card, 0], ...rows.map((row, i) => [row, 120 + 60 * i] as [HTMLElement, number])]
            items.forEach(([el, delay]) => {
                el.style.transition = `opacity 640ms ${ease} ${delay}ms, transform 640ms ${ease} ${delay}ms`
                el.style.opacity = "1"
                el.style.transform = "translateY(0px)"
                window.setTimeout(() => {
                    el.style.transition = ""
                    el.style.transform = ""
                }, 700 + delay)
            })
        }
        const io = new IntersectionObserver((entries) => {
            if (entries.some((e) => e.isIntersecting)) {
                show()
                io.disconnect()
            }
        }, { threshold: 0.25 })
        io.observe(panel)
        return () => io.disconnect()
    }, [])
}

export function withPhotoParallax(Component: ComponentType<any>): ComponentType<any> {
    return forwardRef<any, any>(function PhotoParallax(props, ref) {
        const own = useRef<HTMLElement | null>(null)
        const setRef = useCallback(
            (node: HTMLElement | null) => {
                own.current = node
                if (typeof ref === "function") ref(node)
                else if (ref) (ref as any).current = node
            },
            [ref]
        )
        useReveal(own)
        useEffect(() => {
            const el = own.current
            if (!el || typeof window === "undefined") return
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
            return watch({ el, update: slidePhoto })
        }, [])
        return <Component {...props} ref={setRef} />
    })
}

export function withHeroDepth(Component: ComponentType<any>): ComponentType<any> {
    return heroDepth(Component)
}

export function withRiseIn(Component: ComponentType<any>): ComponentType<any> {
    return riseIn(Component)
}

// About (2026-11-26, user: "add text reveal and parallax to about page too")
// withBackdropDepth (About hero photo, desktop): the photo drifts down at 30% of the scroll while the hero leaves,
// so it moves slower than the page. Its top edge only ever opens behind the fixed 70px header (the stage starts
// under it), so no gap shows. Tablet and phone: off (the photo sits in the lower part of the stage there).
const backdropDepth = parallax((el, vh, vw) => {
    const section = el.closest("section")
    if (!section || vw < 1200) {
        el.style.translate = ""
        return
    }
    const r = section.getBoundingClientRect()
    const d = Math.min(Math.max(-r.top, 0), r.height)
    el.style.translate = d ? "0 " + (0.3 * d).toFixed(1) + "px" : ""
})

// withImagePan (About Why MEDARO photo): pans the frame's own photo inside it while it crosses the screen, around
// its set position (Framer's fill position, 28% here), up to 9% of the frame's height each way and never past the
// image, so no edge shows. Every breakpoint.
function panImage(el: HTMLElement, vh: number) {
    const img = el.querySelector(":scope > [data-framer-background-image-wrapper] img") as HTMLImageElement | null
    if (!img) return
    if (!img.complete || !img.naturalWidth) {
        img.addEventListener("load", queue, { once: true })
        return
    }
    if (!img.dataset.panBase) {
        const pos = getComputedStyle(img).objectPosition.split(" ")
        img.dataset.panX = pos[0] || "50%"
        img.dataset.panBase = pos[1] || "50%"
    }
    const W = el.clientWidth
    const H = el.clientHeight
    const s = Math.max(W / img.naturalWidth, H / img.naturalHeight)
    const slack = img.naturalHeight * s - H
    if (slack < 4) {
        img.style.objectPosition = ""
        return
    }
    const b = img.dataset.panBase
    const base = b.endsWith("%") ? (parseFloat(b) / 100) * slack : Math.max(0, -parseFloat(b) || 0)
    const r = el.getBoundingClientRect()
    const p = Math.min(1, Math.max(-1, (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2)))
    const off = Math.min(slack, Math.max(0, base + p * Math.min(0.09 * H, slack / 2)))
    img.style.objectPosition = img.dataset.panX + " " + (-off).toFixed(1) + "px"
}
const imagePan = parallax(panImage)

export function withBackdropDepth(Component: ComponentType<any>): ComponentType<any> {
    return backdropDepth(Component)
}

export function withImagePan(Component: ComponentType<any>): ComponentType<any> {
    return imagePan(Component)
}

// Weight Loss and Men's Health (2026-11-28, user: "in about page we added image parallax … it feels like its not there in
// weightloss and mens page … check every page"). Same scroll loop as above.
// - withPhotoDrift (framed photos: card photos, the Care photo, the Why MEDARO stage): the photo moves slower than the
//   page while its frame crosses the screen: a little higher as the frame comes up, exactly on its set crop when the frame
//   is centred on screen, a little lower as it leaves; 5% of the frame's height each way, at most 36px. Pans inside the
//   spare image when there is enough of it; otherwise zooms the photo just enough to cover the travel (1 + 2 × 5% at
//   most), clipped to the frame's corners. Every breakpoint.
// - withStageDrift (photos with a tight composition: the closing CTA stages, where the vial stands between the words and
//   the list): the same, 3.5% each way, at most 32px, pan only (never zoomed); still where there is no spare image.
// - withCutoutRise (cut-outs standing in a card: vials, couples, the man, the ampoule, the Home card images): while the
//   card comes up from the bottom of the screen the cut-out sits lower (up to 6% of the card's height, at most 32px) and
//   rises into its place by the time the card is centred; then it stays. It only ever moves down from its place, so the
//   card's clipping keeps cut edges hidden. Every breakpoint; does nothing if no parent clips it.
function drift(ratio: number, cap: number, zoom: boolean) {
    return (el: HTMLElement, vh: number) => {
        const wrap = el.querySelector(":scope > [data-framer-background-image-wrapper]") as HTMLElement | null
        const img = wrap ? (wrap.querySelector("img") as HTMLImageElement | null) : null
        if (!wrap || !img) return
        if (!img.complete || !img.naturalWidth) {
            img.addEventListener("load", queue, { once: true })
            return
        }
        if (!img.dataset.driftY) {
            const pos = getComputedStyle(img).objectPosition.split(" ")
            img.dataset.driftX = pos[0] || "50%"
            img.dataset.driftY = pos[1] || "50%"
        }
        const W = el.clientWidth
        const H = el.clientHeight
        if (!W || !H) return
        const s = Math.max(W / img.naturalWidth, H / img.naturalHeight)
        const slack = img.naturalHeight * s - H
        const r = el.getBoundingClientRect()
        const p = Math.min(1, Math.max(-1, (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2)))
        let amp = Math.min(ratio * H, cap)
        if (slack >= 2 * amp || !zoom) {
            amp = Math.min(amp, slack / 2)
            img.style.scale = ""
            img.style.translate = ""
            if (amp < 2) {
                img.style.objectPosition = ""
                return
            }
            const by = img.dataset.driftY || "50%"
            const frac = by.endsWith("%") ? parseFloat(by) / 100 : 0.5
            const off = Math.min(slack, Math.max(0, frac * slack + p * amp))
            img.style.objectPosition = img.dataset.driftX + " " + (-off).toFixed(1) + "px"
        } else {
            wrap.style.overflow = "hidden"
            img.style.objectPosition = ""
            img.style.scale = (1 + (2 * amp) / H).toFixed(4)
            img.style.translate = "0 " + (-p * amp).toFixed(1) + "px"
        }
    }
}
const photoDrift = parallax(drift(0.05, 36, true))
const stageDrift = parallax(drift(0.035, 32, false))

const clipBoxes = new WeakMap<HTMLElement, HTMLElement | null>()
function clipBox(el: HTMLElement): HTMLElement | null {
    let p = el.parentElement
    for (let i = 0; i < 8 && p; i++) {
        const cs = getComputedStyle(p)
        if (cs.overflow !== "visible" || cs.overflowY !== "visible") return p
        p = p.parentElement
    }
    return null
}
const cutoutRise = parallax((el, vh) => {
    if (!clipBoxes.has(el)) clipBoxes.set(el, clipBox(el))
    const box = clipBoxes.get(el)
    if (!box) return
    const r = box.getBoundingClientRect()
    if (!r.height) return
    const t = clamp01((r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2))
    const y = Math.min(0.06 * r.height, 32) * t
    el.style.translate = y > 0.1 ? "0 " + y.toFixed(1) + "px" : ""
})

export function withPhotoDrift(Component: ComponentType<any>): ComponentType<any> {
    return photoDrift(Component)
}

export function withStageDrift(Component: ComponentType<any>): ComponentType<any> {
    return stageDrift(Component)
}

export function withCutoutRise(Component: ComponentType<any>): ComponentType<any> {
    return cutoutRise(Component)
}
