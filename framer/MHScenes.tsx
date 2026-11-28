import { forwardRef, useEffect, type ComponentType } from "react"

/*
 * MEDARO · Men's Health landing: the page's scene, as in the HTML
 * (site/main.js → scenes, sections/mens-health/ongoing.css → data-scene="mh-ongoing").
 * While the Ongoing care section (element id "mh-ongoing") crosses the middle of the
 * screen, the page turns deep navy: the "MH Scene …" colour styles are set on <body>
 * as CSS variables, registered with @property so they fade over 700ms
 * cubic-bezier(0.65, 0, 0.35, 1), like the HTML's tokens. Reduced motion: instant.
 * Only layers that use the MH Scene styles change (sections 4–8 of the page).
 * Separate from Scenes.tsx (Home and About keep their own scene set).
 */
const V = {
    bg: "--token-S1m44Gmq_",
    surface: "--token-robPRwQiG",
    ink: "--token-ha2uNlWOn",
    muted: "--token-YtENgnRj_",
    line: "--token-pJMZvn6ih",
    chip: "--token-AnceJ5h4S",
    dots: "--token-DD8DzLKdr",
}
type Values = Record<keyof typeof V, string>
// The page at rest: the Men's paper (styles.css → :root[data-page="mens-health"])
const REST: Values = {
    bg: "#edf2f8",
    surface: "#e4eaf2",
    ink: "#1f3957",
    muted: "#4a6482",
    line: "rgba(31, 57, 87, 0.14)",
    chip: "#0a6fc7",
    dots: "rgba(31, 57, 87, 0.22)",
}
// The navy scene: --p-deep, its surface (deep 90% + paper), paper text, muted = paper 74% on deep, the sky chip
const NAVY: Values = {
    bg: "#162a40",
    surface: "#2c3e52",
    ink: "#edf2f8",
    muted: "#b5bec8",
    line: "rgba(237, 242, 248, 0.16)",
    chip: "#a7d5ff",
    dots: "rgba(237, 242, 248, 0.22)",
}
const SCENES: Array<{ id: string; values: Values }> = [{ id: "mh-ongoing", values: NAVY }]

let users = 0
let stop: (() => void) | null = null

function start() {
    const body = document.body
    const keys = Object.keys(V) as Array<keyof typeof V>
    const style = document.createElement("style")
    style.dataset.medaro = "mh-scenes"
    style.textContent =
        keys.map((k) => "@property " + V[k] + ' { syntax: "<color>"; inherits: true; initial-value: ' + REST[k] + "; }").join("\n") +
        "\nbody { transition: " + keys.map((k) => V[k] + " 700ms cubic-bezier(0.65, 0, 0.35, 1)").join(", ") + "; }" +
        "\n@media (prefers-reduced-motion: reduce) { body { transition: none; } }"
    document.head.appendChild(style)
    let current: string | null = null
    let queued = false
    const apply = (values: Values) => {
        keys.forEach((k) => body.style.setProperty(V[k], values[k]))
    }
    const update = () => {
        queued = false
        const mid = window.innerHeight / 2
        let found: { id: string; values: Values } | null = null
        for (const scene of SCENES) {
            const els = document.querySelectorAll<HTMLElement>('[id="' + scene.id + '"]')
            for (const el of Array.from(els)) {
                if (!el.getClientRects().length) continue
                const r = el.getBoundingClientRect()
                if (r.top <= mid && r.bottom > mid) {
                    found = scene
                    break
                }
            }
            if (found) break
        }
        const id = found ? found.id : null
        if (id === current) return
        current = id
        apply(found ? found.values : REST)
    }
    const queue = () => {
        if (!queued) {
            queued = true
            requestAnimationFrame(update)
        }
    }
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

/** On the Men's Health sections that use the MH Scene styles (How MEDARO Works … CTA). */
export function withMhScenes(Component: ComponentType<any>): ComponentType<any> {
    return forwardRef<any, any>(function MhScenesOverride(props, ref) {
        useEffect(() => {
            users += 1
            if (users === 1) stop = start()
            return () => {
                users -= 1
                if (users === 0 && stop) {
                    stop()
                    stop = null
                }
            }
        }, [])
        return <Component {...props} ref={ref} />
    })
}
