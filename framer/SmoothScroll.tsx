import * as React from "react"
import { useEffect } from "react"
import { addPropertyControls, ControlType, RenderTarget } from "framer"

/**
 * Smooth Scroll (Lenis 1.3.27), site-wide: one instance sits in the Main layout template (user, 2026-11-26:
 * "can we add smooth scroll throughout the site lenis is the one right for smooth scroll").
 * - Smooths mouse-wheel and trackpad scrolling; touch stays native (syncTouch off), so phones scroll as usual.
 * - Uses the page's own scroll, so every scroll effect keeps working (scenes, drift, the steps deck, parallax).
 * - autoToggle: stops while Framer locks the page (the menu sheet sets overflow: hidden on <html>), so the page
 *   never scrolls behind an open overlay; nothing inside #template-overlay / #overlay or [data-lenis-prevent]
 *   is smoothed, and nested scroll areas (the Top treatments row) keep their own scroll (allowNestedScroll).
 * - Loaded from jsDelivr at run time; if that fails the site simply scrolls natively.
 * - Off on the canvas and for reduced motion.
 * Source of record: framer/SmoothScroll.tsx in the MEDARO repo.
 */

const LENIS = "https://cdn.jsdelivr.net/npm/lenis@1.3.27/dist/lenis.mjs"
const CSS = `html.lenis,
html.lenis body {
  height: auto;
}
.lenis:not(.lenis-autoToggle).lenis-stopped {
  overflow: clip;
}
.lenis [data-lenis-prevent],
.lenis [data-lenis-prevent-wheel],
.lenis [data-lenis-prevent-touch],
.lenis [data-lenis-prevent-vertical],
.lenis [data-lenis-prevent-horizontal] {
  overscroll-behavior: contain;
}
.lenis.lenis-smooth iframe {
  pointer-events: none;
}
.lenis.lenis-autoToggle {
  transition-property: overflow;
  transition-duration: 1ms;
  transition-behavior: allow-discrete;
}`

interface Props {
    lerp?: number
    style?: React.CSSProperties
}

/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight fixed
 */
export default function SmoothScroll(props: Props) {
    const { lerp = 0.1 } = props
    useEffect(() => {
        if (typeof window === "undefined") return
        if (RenderTarget.current() === RenderTarget.canvas) return
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
        let lenis: any = null
        let alive = true
        const style = document.createElement("style")
        style.setAttribute("data-medaro", "lenis")
        style.textContent = CSS
        document.head.appendChild(style)
        import(/* @vite-ignore */ LENIS)
            .then((mod: any) => {
                if (!alive) return
                const Lenis = mod.default
                lenis = new Lenis({
                    lerp,
                    smoothWheel: true,
                    syncTouch: false,
                    autoRaf: true,
                    autoToggle: true,
                    allowNestedScroll: true,
                    prevent: (node: Element) => !!(node.closest && node.closest("#template-overlay, #overlay, [data-lenis-prevent]")),
                })
            })
            .catch(() => {})
        return () => {
            alive = false
            if (lenis) lenis.destroy()
            style.remove()
        }
    }, [lerp])
    return <div aria-hidden="true" style={{ ...props.style, pointerEvents: "none" }} />
}

addPropertyControls(SmoothScroll, {
    lerp: {
        type: ControlType.Number,
        title: "Lerp",
        description: "How far the page eases each frame: lower is smoother and longer (Lenis default 0.1).",
        defaultValue: 0.1,
        min: 0.03,
        max: 0.3,
        step: 0.01,
    },
})
