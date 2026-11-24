import * as React from "react"
import { useEffect, useRef, useState } from "react"
import { addPropertyControls, ControlType } from "framer"

/*
 * MEDARO · Home · Weight Loss: the mirror cut-out on its stone platform and the
 * slanted partition, as in the HTML (site/sections/home/weight-loss.css →
 * .wl__stage, .wl__photo, .wl__backdrop, .wl__floor), ported 1:1.
 *
 * The component's box is the figure's box. With R = its height:
 * - the image's visual top (y 48 of 2026: the mirror's top edge, his head) sits
 *   on the box's top, the platform's front top edge (y 1788) 12px above its
 *   foot, so the image is (R − 12) × 2026 / 1740 tall;
 * - the mirror stand's back foot (x 1903 of 3240) sits at "Foot" % of the box's
 *   width (0 = the box's left edge, the frame line on desktop); the platform
 *   runs on past the screen edge (the section clips it).
 * The partition is full bleed, from the section's top: it measures the
 * nearest section (its width and how far this box sits from its top and left),
 * so it lines up in the canvas, the preview and on the site; before that it
 * falls back to 100vw, "Section top" and "Inset".
 * Two layers share one box and one gradient: the backdrop (with the lime glow)
 * behind the figure, the floor in front of it, masked to below the edge, so the
 * platform stands behind the partition. The edge passes the image point
 * (3090, 1988), 200px down the platform's front face, and drops 6.5% of the
 * screen width across it (183.72deg).
 * Colours mix the Scene BG style, so the partition follows the page's scene
 * colours like the HTML's color-mix with --color-bg.
 */

const BG = "var(--token-omqVycP9K, #f4f5ef)" // Scene BG (paper at rest)
const SAGE = "#a8af98" // the client's Dusty Olive
const LIME = "#d5e5ad" // the client's Soft Nude Lime

const SURFACE_MID = `color-mix(in srgb, ${BG} 96%, ${SAGE})`
const SURFACE_EDGE = `color-mix(in srgb, ${BG} 80%, ${SAGE})`
const FLOOR = `color-mix(in srgb, ${BG} 89%, ${SAGE})`
const FLOOR_FADE = `color-mix(in srgb, ${BG} 95%, ${SAGE})`
const EDGE = "var(--wl-edge)"

// one gradient whose lines run parallel to the edge (the slope of 6.5% of the width)
const SURFACE = [
    // soft key light from the upper right
    "radial-gradient(ellipse 46% 58% at 84% 14%, color-mix(in srgb, #fff 46%, transparent), transparent 72%)",
    `linear-gradient(183.72deg, ${BG} 0, ${BG} calc(${EDGE} * 0.32), ${SURFACE_MID} calc(${EDGE} * 0.74), ${SURFACE_EDGE} calc(${EDGE} - 2px), ${FLOOR} calc(${EDGE} + 3px), ${FLOOR_FADE} calc(${EDGE} + var(--wl-band) * 0.35), ${BG} calc(${EDGE} + var(--wl-band)))`,
].join(", ")

// the glow above the edge, strongest on the edge 70% across, fading up and left
const GLOW = `radial-gradient(ellipse 58% 62% at 70% calc(100% - var(--wl-band) - var(--wl-slant) * 0.3), color-mix(in srgb, ${LIME} 52%, transparent) 0, color-mix(in srgb, ${LIME} 20%, transparent) 46%, transparent 100%)`

const FLOOR_MASK = `linear-gradient(183.72deg, transparent calc(${EDGE} - 1px), #000 calc(${EDGE} + 4px))`

interface Measure {
    width: number // the section's width (the screen)
    left: number // this box's left edge from the section's left edge
    top: number // this box's top edge from the section's top edge
}

interface Props {
    image?: { src?: string; srcSet?: string; alt?: string }
    foot: number
    sectionTop: number
    inset: number
    style?: React.CSSProperties
}

function findSection(el: HTMLElement): HTMLElement | null {
    return (
        (el.closest("section") as HTMLElement | null) ||
        (el.closest("#weight-loss") as HTMLElement | null) ||
        (el.closest('[data-framer-name="Weight Loss"]') as HTMLElement | null)
    )
}

/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight fixed
 * @framerIntrinsicWidth 600
 * @framerIntrinsicHeight 460
 */
export default function WeightLossStage(props: Props) {
    const { image, foot = 0, sectionTop = 144, inset = 16, style } = props
    const ref = useRef<HTMLDivElement>(null)
    const [m, setM] = useState<Measure | null>(null)

    useEffect(() => {
        const el = ref.current
        if (!el) return
        const section = findSection(el)
        if (!section) return
        let frame = 0
        const measure = () => {
            frame = 0
            if (!el.offsetWidth || !section.offsetWidth) return
            const r = el.getBoundingClientRect()
            const s = section.getBoundingClientRect()
            const scale = r.width / el.offsetWidth || 1 // the canvas zoom
            const next = {
                width: s.width / scale,
                left: (r.left - s.left) / scale,
                top: (r.top - s.top) / scale,
            }
            setM((prev) =>
                prev && Math.abs(prev.width - next.width) < 0.5 && Math.abs(prev.left - next.left) < 0.5 && Math.abs(prev.top - next.top) < 0.5
                    ? prev
                    : next
            )
        }
        const queue = () => {
            if (!frame) frame = requestAnimationFrame(measure)
        }
        measure()
        const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(queue) : null
        ro?.observe(el)
        ro?.observe(section)
        window.addEventListener("resize", queue)
        return () => {
            if (frame) cancelAnimationFrame(frame)
            ro?.disconnect()
            window.removeEventListener("resize", queue)
        }
    }, [])

    const W = m ? m.width : null
    const slant = W ? `${0.065 * W}px` : "6.5vw"
    const band = W ? `${Math.min(200, Math.max(120, 0.11 * W))}px` : "clamp(120px, 11vw, 200px)"
    const top = m ? m.top : sectionTop

    // the edge meets the left screen edge this far under the box's foot
    // (0.070601 × R − 13.887px; R = the box's height, 100% in `bottom`)
    const layer: React.CSSProperties = {
        position: "absolute",
        top: -top,
        bottom: "calc(-1 * (100% * 0.070601 - 13.887px + var(--wl-slant) + var(--wl-band)))",
        // before measuring: the box starts on the frame line (the page inset, or centred past 1888px)
        left: m ? -m.left : `calc(-1 * max(${inset}px, (100vw - 1888px) / 2))`,
        width: W ? W : "100vw",
        pointerEvents: "none",
        ["--wl-edge" as any]: "calc(100% - var(--wl-slant) - var(--wl-band))",
    }

    const src = image?.src

    return (
        <div
            ref={ref}
            style={{
                ...style,
                position: "relative",
                overflow: "visible",
                ["--wl-slant" as any]: slant,
                ["--wl-band" as any]: band,
            }}
        >
            <div aria-hidden="true" style={{ ...layer, background: `${GLOW}, ${SURFACE}` }} />
            {src ? (
                <img
                    src={src}
                    srcSet={image?.srcSet}
                    alt={image?.alt ?? ""}
                    draggable={false}
                    style={{
                        position: "absolute",
                        left: `${foot}%`,
                        top: "calc((100% - 12px) * -48 / 1740)",
                        height: "calc((100% - 12px) * 2026 / 1740)",
                        width: "auto",
                        maxWidth: "none",
                        transform: "translateX(-58.735%)",
                        display: "block",
                        userSelect: "none",
                    }}
                />
            ) : null}
            <div aria-hidden="true" style={{ ...layer, background: SURFACE, WebkitMaskImage: FLOOR_MASK, maskImage: FLOOR_MASK }} />
        </div>
    )
}

addPropertyControls(WeightLossStage, {
    image: { type: ControlType.ResponsiveImage, title: "Image" },
    foot: {
        type: ControlType.Number,
        title: "Foot",
        min: -50,
        max: 100,
        step: 0.5,
        unit: "%",
        defaultValue: 0,
        description: "Where the mirror stand's foot sits, % of the box's width.",
    },
    sectionTop: {
        type: ControlType.Number,
        title: "Section top",
        min: 0,
        max: 2000,
        step: 1,
        defaultValue: 144,
        description: "Fallback before measuring: px from the section's top to this box.",
    },
    inset: {
        type: ControlType.Number,
        title: "Inset",
        min: 0,
        max: 200,
        step: 1,
        defaultValue: 16,
        description: "Fallback before measuring: px from the screen's left edge to this box.",
    },
})
