import { forwardRef, useEffect, useRef, type ComponentType } from "react"

/*
 * MEDARO scenes, as in the HTML (site/main.js → scenes, styles.css → @property):
 * while a scene section crosses the middle of the screen, the page colours change
 * to that section's colours and fade over 700ms (cubic-bezier(0.65, 0, 0.35, 1)).
 * The colours are Framer colour styles ("Scene …"), set on <body> as CSS variables
 * and registered with @property so they animate. Reduced motion: instant.
 * Only nodes that use the Scene styles change (the nav and hero use their own).
 */
const V = {
    bg: "--token-omqVycP9K",
    surface: "--token-B3whSEq1c",
    ink: "--token-Etgict0r_",
    muted: "--token-oVMPym_0S",
    line: "--token-te4av1lRG",
    chipMen: "--token-tC_SmF5VE",
    chipWomen: "--token-PWxc2SHSe",
    chipSteps: "--token-r73HWnpI9",
}
type Values = Record<keyof typeof V, string>
const DEFAULT: Values = { bg: "#f4f5ef", surface: "#e7eadf", ink: "#343b29", muted: "#5e6551", line: "rgba(52, 59, 41, 0.14)", chipMen: "#343b29", chipWomen: "#343b29", chipSteps: "#343b29" }
const SCENES: Array<{ id: string; values: Values }> = [
    { id: "mens-health", values: { bg: "#1d2a3a", surface: "#283a4f", ink: "#f4f5ef", muted: "#bcc0c0", line: "rgba(244, 245, 239, 0.18)", chipMen: "#8cc8ff", chipWomen: "#f4f5ef", chipSteps: "#f4f5ef" } },
    { id: "womens-health", values: { bg: "#efd9d8", surface: "#e6c6c7", ink: "#3a2127", muted: "#654d51", line: "rgba(58, 33, 39, 0.18)", chipMen: "#3a2127", chipWomen: "#bb1b50", chipSteps: "#3a2127" } },
    // Light green, built like the Women's blush (user, 2026-11-23: "light greenish color like our color theme"); was sage #a8af98 with a rust chip
    { id: "how-it-works", values: { bg: "#e2ecd3", surface: "#d3e0bf", ink: "#262b1e", muted: "#4f5942", line: "rgba(38, 43, 30, 0.16)", chipMen: "#262b1e", chipWomen: "#262b1e", chipSteps: "#2e6b12" } },
]

let users = 0
let stop: (() => void) | null = null

function startScenes() {
    const body = document.body
    const keys = Object.keys(V) as Array<keyof typeof V>
    const style = document.createElement("style")
    style.dataset.medaro = "scenes"
    style.textContent =
        keys.map((k) => `@property ${V[k]} { syntax: "<color>"; inherits: true; initial-value: ${DEFAULT[k]}; }`).join("\n") +
        `\nbody { transition: ${keys.map((k) => `${V[k]} 700ms cubic-bezier(0.65, 0, 0.35, 1)`).join(", ")}; }` +
        "\n@media (prefers-reduced-motion: reduce) { body { transition: none; } }"
    document.head.appendChild(style)
    let current: string | null = null
    let queued = false
    const apply = (values: Values) => { keys.forEach((k) => body.style.setProperty(V[k], values[k])) }
    const update = () => {
        queued = false
        const mid = window.innerHeight / 2
        let found: { id: string; values: Values } | null = null
        for (const scene of SCENES) {
            const els = document.querySelectorAll<HTMLElement>(`[id="${scene.id}"]`)
            for (const el of Array.from(els)) {
                if (!el.getClientRects().length) continue
                const r = el.getBoundingClientRect()
                if (r.top <= mid && r.bottom > mid) { found = scene; break }
            }
            if (found) break
        }
        const id = found ? found.id : null
        if (id === current) return
        current = id
        apply(found ? found.values : DEFAULT)
    }
    const queue = () => { if (!queued) { queued = true; requestAnimationFrame(update) } }
    update()
    window.addEventListener("scroll", queue, { passive: true })
    window.addEventListener("resize", queue)
    return () => {
        window.removeEventListener("scroll", queue)
        window.removeEventListener("resize", queue)
        keys.forEach((k) => body.style.removeProperty(V[k]))
        style.remove()
    }
}

/** On the scene sections (Men's Health, Women's Health, How Medaro Works). */
export function withScenes(Component: ComponentType<any>): ComponentType<any> {
    return forwardRef<any, any>(function ScenesOverride(props, ref) {
        useEffect(() => {
            users += 1
            if (users === 1) stop = startScenes()
            return () => {
                users -= 1
                if (users === 0 && stop) { stop(); stop = null }
            }
        }, [])
        return <Component {...props} ref={ref} />
    })
}

/*
 * Tile drift, as in the HTML (site/main.js → drift), desktop only (≥1200; tablet and
 * phone run the rows as a ticker). On the Tiles frame: its first row slides left, the
 * second right and half a tile over, a quarter screen of travel over the section's
 * scroll; halfway through, the tiles start on the frame edge. Reduced motion: rows
 * rest at the halfway point.
 */
export function withDrift(Component: ComponentType<any>): ComponentType<any> {
    return forwardRef<any, any>(function DriftOverride(props, ref) {
        const local = useRef<HTMLElement | null>(null)
        const setRef = (el: HTMLElement | null) => {
            local.current = el
            if (typeof ref === "function") ref(el)
            else if (ref) (ref as any).current = el
        }
        useEffect(() => {
            const box = local.current
            if (!box) return
            const still = window.matchMedia("(prefers-reduced-motion: reduce)")
            let queued = false
            const rows = () => Array.from(box.children).filter((el): el is HTMLElement => el instanceof HTMLElement)
            const update = () => {
                queued = false
                const list = rows()
                if (window.innerWidth < 1200) { list.forEach((row) => { row.style.transform = "" }); return }
                const vh = window.innerHeight
                const b = box.getBoundingClientRect()
                list.forEach((row, i) => {
                    const first = row.firstElementChild as HTMLElement | null
                    if (!first) return
                    const drift = i % 2 === 0 ? -1 : 1
                    const phase = i % 2 === 0 ? 0 : 0.5
                    const over = Math.max(0, row.scrollWidth - b.width)
                    const pitch = first.getBoundingClientRect().width + (parseFloat(getComputedStyle(row).columnGap) || 0)
                    const side = Math.max(16, (b.width - 1888) / 2)
                    const centre = Math.round(over / 2 / pitch) * pitch - side + pitch * phase
                    const travel = Math.min(b.width * 0.25, over)
                    let p = still.matches ? 0.5 : (vh - b.top) / (vh + b.height)
                    p = Math.min(1, Math.max(0, p))
                    const x = centre + travel * (p - 0.5) * (drift < 0 ? 1 : -1)
                    row.style.transform = `translate3d(${(-x).toFixed(1)}px, 0, 0)`
                    row.style.willChange = "transform"
                })
            }
            const queue = () => { if (!queued) { queued = true; requestAnimationFrame(update) } }
            update()
            window.addEventListener("scroll", queue, { passive: true })
            window.addEventListener("resize", queue)
            window.addEventListener("load", queue)
            still.addEventListener("change", queue)
            return () => {
                window.removeEventListener("scroll", queue)
                window.removeEventListener("resize", queue)
                window.removeEventListener("load", queue)
                still.removeEventListener("change", queue)
            }
        }, [])
        return <Component {...props} ref={setRef} />
    })
}

/*
 * Reveal, as in the HTML (site/main.js → reveal, supplements.css): when a quarter of
 * the photo panel is on screen, the glass card fades up 20px (640ms) and its rows
 * follow 10px, 120ms + 60ms apart (cubic-bezier(0.22, 1, 0.36, 1)). Once. Reduced
 * motion: shown at once. On the Photo Panel frames (desktop and tablet/phone copy).
 */
export function withReveal(Component: ComponentType<any>): ComponentType<any> {
    return forwardRef<any, any>(function RevealOverride(props, ref) {
        const local = useRef<HTMLElement | null>(null)
        const setRef = (el: HTMLElement | null) => {
            local.current = el
            if (typeof ref === "function") ref(el)
            else if (ref) (ref as any).current = el
        }
        useEffect(() => {
            const panel = local.current
            if (!panel) return
            const card = Array.from(panel.children).find((el) => el instanceof HTMLElement && !el.hasAttribute("data-framer-background-image-wrapper")) as HTMLElement | undefined
            if (!card) return
            const rows = Array.from(card.children).filter((el): el is HTMLElement => el instanceof HTMLElement)
            const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches
            if (still || !("IntersectionObserver" in window)) return
            const ease = "cubic-bezier(0.22, 1, 0.36, 1)"
            const hide = (el: HTMLElement, y: number) => { el.style.opacity = "0"; el.style.transform = `translateY(${y}px)` }
            hide(card, 20)
            rows.forEach((row) => hide(row, 10))
            const show = () => {
                const items: Array<[HTMLElement, number]> = [[card, 0], ...rows.map((row, i) => [row, 120 + 60 * i] as [HTMLElement, number])]
                items.forEach(([el, delay]) => {
                    el.style.transition = `opacity 640ms ${ease} ${delay}ms, transform 640ms ${ease} ${delay}ms`
                    el.style.opacity = "1"
                    el.style.transform = "translateY(0px)"
                    window.setTimeout(() => { el.style.transition = ""; el.style.transform = "" }, 700 + delay)
                })
            }
            const io = new IntersectionObserver((entries) => {
                if (entries.some((e) => e.isIntersecting)) { show(); io.disconnect() }
            }, { threshold: 0.25 })
            io.observe(panel)
            return () => io.disconnect()
        }, [])
        return <Component {...props} ref={setRef} />
    })
}
