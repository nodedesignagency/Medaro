import * as React from "react"
import { addPropertyControls, ControlType, RenderTarget } from "framer"

/*
 * MEDARO · How Medaro Works, the steps deck. A 1:1 port of the HTML
 * (site/components/steps.css + site/main.js → steps), after the user's Givingli
 * reference: the stage pins while you scroll; the big number rolls like an
 * odometer (01 → 02 → 03), each next card rises from below the screen at scroll
 * speed and lands on the one before, covered cards step back (up 22px, 5%
 * smaller, 22% darker per card on top) so their top edge peeks out; halfway up,
 * the text changes line by line (60/120ms, slide 28px and fade with a 4px blur).
 * Scroll room: 35% of the screen per step plus the rise. Reduced motion: cards
 * and text switch at once.
 * Tablet and phone (not designed in the HTML): the same deck in one column,
 * number above the card, text below.
 */

type ImageValue = string | { src?: string; srcSet?: string; alt?: string } | null | undefined
interface Step {
    image?: ImageValue
    title?: string
    text?: string
}
interface Props {
    steps?: Step[]
    ink?: string
    muted?: string
    cardColor?: string
    fontFamily?: string
    headerOffset?: number
    style?: React.CSSProperties
}

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)"
const DUR = 700
const IMAGES = [
    "https://framerusercontent.com/images/YPEb3bZ1majy3MIqhQtpxAwm8.webp",
    "https://framerusercontent.com/images/rbDROCsH1yyr9ILkbzoi3o.webp",
    "https://framerusercontent.com/images/WQKhI26hJ8dti3MOpV00qtEcls.webp",
]
const DEFAULT_STEPS: Step[] = [
    { title: "Tell Us About Yourself", text: "Complete a quick online health assessment to help us understand your medical history, needs, and treatment goals." },
    { title: "Get Expert Medical Guidance", text: "A licensed medical provider reviews your information and determines the most appropriate treatment options for you. If medically appropriate, a prescription may be issued." },
    { title: "Get Your Treatment Delivered", text: "If prescribed, your medication can be shipped discreetly to your door through a licensed pharmacy, so you can begin your treatment plan with confidence." },
]

const clamp = (lo: number, v: number, hi: number) => Math.min(hi, Math.max(lo, v))
const srcOf = (img: ImageValue, i: number) => {
    if (typeof img === "string" && img) return img
    if (img && typeof img === "object" && img.src) return img.src
    return IMAGES[i % IMAGES.length]
}
const useIsoLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 */
export default function StepsDeck(props: Props) {
    const { steps: stepsProp, ink = "#262B1E", muted = "#343B29", cardColor = "#262B1E", fontFamily = "Host Grotesk", headerOffset = 72, style } = props
    const steps = stepsProp && stepsProp.length ? stepsProp : DEFAULT_STEPS
    const n = steps.length
    // Live (Preview and the published site): the scroll deck. Canvas, thumbnails, screenshots: step 1, still.
    const isCanvas = RenderTarget.current() !== RenderTarget.preview

    const rootRef = React.useRef<HTMLDivElement>(null)
    const trackRef = React.useRef<HTMLDivElement>(null)
    const stageRef = React.useRef<HTMLDivElement>(null)
    const innerRef = React.useRef<HTMLDivElement>(null)
    const cellRef = React.useRef<HTMLDivElement>(null)
    const cardRefs = React.useRef<Array<HTMLDivElement | null>>([])
    const [vw, setVw] = React.useState(1440)
    const [still, setStill] = React.useState(false)
    const [active, setActive] = React.useState(0)

    // Sizes follow the window like the HTML's vw clamps (in the canvas: the frame's width)
    useIsoLayoutEffect(() => {
        if (isCanvas) {
            const el = rootRef.current
            if (!el || typeof ResizeObserver === "undefined") return
            const ro = new ResizeObserver(() => setVw(el.offsetWidth || 1440))
            ro.observe(el)
            setVw(el.offsetWidth || 1440)
            return () => ro.disconnect()
        }
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
        const sync = () => {
            setVw(window.innerWidth)
            setStill(mq.matches)
        }
        sync()
        window.addEventListener("resize", sync)
        mq.addEventListener("change", sync)
        return () => {
            window.removeEventListener("resize", sync)
            mq.removeEventListener("change", sync)
        }
    }, [isCanvas])

    const wide = vw >= 1200
    const phone = vw < 810
    const cardW = wide ? clamp(440, vw * 0.334, 640) : phone ? Math.max(240, vw - 48) : Math.min(vw - 96, 520)
    const colGap = clamp(48, vw * 0.055, 104)
    const numSize = wide ? clamp(120, vw * 0.094, 184) : phone ? 72 : 96
    const h3Size = wide ? clamp(36, vw * 0.032, 60) : phone ? 30 : 36
    const pSize = wide ? clamp(16, vw * 0.012, 19) : 16
    const topGap = wide ? clamp(80, vw * 0.078, 136) : phone ? 56 : 72
    const bottomGap = wide ? clamp(64, vw * 0.056, 104) : phone ? 48 : 64

    // The scroll: the same maths as main.js → steps
    React.useEffect(() => {
        if (isCanvas) return
        const root = rootRef.current
        const track = trackRef.current
        const stage = stageRef.current
        const inner = innerRef.current
        const cell = cellRef.current
        if (!root || !track || !stage || !inner || !cell) return
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
        let dwell = 0
        let rise = 0
        let queued = false
        let current = -1
        const measure = () => {
            const vh = window.innerHeight
            const sR = stage.getBoundingClientRect()
            const cR = cell.getBoundingClientRect()
            const iR = inner.getBoundingClientRect()
            rise = Math.max(240, vh - (cR.top - sR.top) + 32)
            dwell = vh * 0.35
            track.style.height = `${vh + n * dwell + (n - 1) * rise}px`
            // the card sits topGap under the heading and the CTA bottomGap under the card,
            // not half a screen away (steps.css: --steps-slack)
            const top = wide ? cR.top : iR.top
            const bottom = wide ? cR.bottom : iR.bottom
            root.style.marginTop = `${(topGap - (top - sR.top)).toFixed(1)}px`
            root.style.marginBottom = `${(bottomGap - (sR.bottom - bottom)).toFixed(1)}px`
        }
        const update = () => {
            queued = false
            const r = track.getBoundingClientRect()
            const range = n * dwell + (n - 1) * rise
            const y = Math.min(range, Math.max(0, -r.top))
            const t = [1]
            for (let k = 1; k < n; k++) {
                const start = k * dwell + (k - 1) * rise
                let v = Math.min(1, Math.max(0, (y - start) / rise))
                if (mq.matches) v = v >= 0.5 ? 1 : 0
                t.push(v)
            }
            let depth = 0
            for (let k = n - 1; k >= 0; k--) {
                const card = cardRefs.current[k]
                if (card) {
                    card.style.transform = `translateY(${((1 - t[k]) * rise - depth * 22).toFixed(2)}px) scale(${(1 - depth * 0.05).toFixed(4)})`
                    card.style.filter = `brightness(${(1 - depth * 0.22).toFixed(4)})`
                }
                depth += t[k] * (k > 0 ? 1 : 0)
            }
            const a = t.reduce((acc, v, k) => (k > 0 && v >= 0.5 ? k : acc), 0)
            if (a !== current) {
                current = a
                setActive(a)
            }
        }
        const queue = () => {
            if (!queued) {
                queued = true
                requestAnimationFrame(update)
            }
        }
        const refresh = () => {
            measure()
            update()
        }
        refresh()
        const fonts = (document as any).fonts
        if (fonts && fonts.ready) fonts.ready.then(refresh).catch(() => {})
        window.addEventListener("scroll", queue, { passive: true })
        window.addEventListener("resize", refresh)
        window.addEventListener("load", refresh)
        mq.addEventListener("change", queue)
        return () => {
            window.removeEventListener("scroll", queue)
            window.removeEventListener("resize", refresh)
            window.removeEventListener("load", refresh)
            mq.removeEventListener("change", queue)
        }
    }, [isCanvas, n, wide, topGap, bottomGap, cardW, headerOffset])

    const shown = isCanvas ? 0 : active
    const font = `"${fontFamily}", "Helvetica Neue", Arial, sans-serif`
    const textStyle = (state: string, line: number): React.CSSProperties => {
        const delay = state === "active" ? (line === 0 ? 60 : 120) : 0
        return {
            opacity: state === "active" ? 1 : 0,
            transform: state === "after" ? "translateY(28px)" : state === "before" ? "translateY(-28px)" : "none",
            filter: state === "active" ? "none" : "blur(4px)",
            transition: still
                ? "none"
                : `opacity ${DUR * 0.6}ms ${EASE} ${delay}ms, transform ${DUR}ms ${EASE} ${delay}ms, filter ${DUR * 0.6}ms ${EASE} ${delay}ms`,
        }
    }

    return (
        <div ref={rootRef} style={{ ...style, position: "relative", width: "100%", fontFamily: font, fontSize: 17 }}>
            <div ref={trackRef} style={{ position: "relative", height: isCanvas ? "auto" : `calc(100svh + ${(n - 1) * 70}svh)` }}>
                <div
                    ref={stageRef}
                    style={{
                        position: isCanvas ? "relative" : "sticky",
                        top: 0,
                        height: isCanvas ? "auto" : "100svh",
                        display: "grid",
                        placeItems: "center",
                        paddingTop: isCanvas ? 40 : headerOffset,
                        paddingBottom: isCanvas ? 40 : 0,
                        boxSizing: "border-box",
                    }}
                >
                    <div
                        ref={innerRef}
                        style={
                            wide
                                ? { display: "grid", gridTemplateColumns: `minmax(0, 1fr) ${cardW}px minmax(0, 1fr)`, columnGap: colGap, alignItems: "center", width: "min(100% - 32px, 1888px)" }
                                : { display: "grid", gridTemplateColumns: `${cardW}px`, rowGap: 24, justifyContent: "center", width: "100%" }
                        }
                    >
                        {/* The number: "0" stays, the second digit rolls */}
                        <div
                            aria-hidden="true"
                            style={{
                                gridColumn: 1,
                                gridRow: 1,
                                justifySelf: wide ? "center" : "start",
                                // one column: clear of the covered cards, which step up 22px each
                                marginBottom: wide ? 0 : (n - 1) * 22 + 12,
                                display: "flex",
                                height: "1em",
                                overflow: "hidden",
                                fontSize: numSize,
                                fontWeight: 500,
                                lineHeight: 1,
                                letterSpacing: "-0.05em",
                                fontVariantNumeric: "tabular-nums",
                                color: ink,
                            }}
                        >
                            <span>0</span>
                            <span style={{ display: "flex", flexDirection: "column", transform: `translateY(${-shown}em)`, transition: still ? "none" : `transform ${DUR}ms ${EASE}` }}>
                                {steps.map((_, i) => (
                                    <span key={i} style={{ height: "1em" }}>
                                        {i + 1}
                                    </span>
                                ))}
                            </span>
                        </div>
                        {/* The cards, stacked in one cell */}
                        <div ref={cellRef} aria-hidden="true" style={{ gridColumn: wide ? 2 : 1, gridRow: wide ? 1 : 2, display: "grid", width: cardW }}>
                            {steps.map((s, k) => (
                                <div
                                    key={k}
                                    ref={(el) => {
                                        cardRefs.current[k] = el
                                    }}
                                    style={{
                                        gridArea: "1 / 1",
                                        position: "relative",
                                        zIndex: k + 1,
                                        display: isCanvas && k > 0 ? "none" : "block",
                                        width: "100%",
                                        aspectRatio: "1.62",
                                        overflow: "hidden",
                                        borderRadius: 16,
                                        background: cardColor,
                                        boxShadow: "0 2px 4px rgba(20, 24, 14, 0.12), 0 32px 64px -24px rgba(20, 24, 14, 0.5)",
                                        transformOrigin: "50% 0",
                                        transform: k === 0 || isCanvas ? "none" : "translateY(100svh)",
                                        willChange: "transform",
                                    }}
                                >
                                    <img src={srcOf(s.image, k)} alt="" draggable={false} style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
                                </div>
                            ))}
                        </div>
                        {/* The text: all steps stay in the page as an ordered list for screen readers */}
                        <ol
                            style={{
                                gridColumn: wide ? 3 : 1,
                                gridRow: wide ? 1 : 3,
                                display: "grid",
                                alignItems: "center",
                                margin: 0,
                                padding: 0,
                                listStyle: "none",
                                maxWidth: wide ? "23em" : undefined,
                                width: wide ? undefined : cardW,
                            }}
                        >
                            {steps.map((s, k) => {
                                const state = k < shown ? "before" : k > shown ? "after" : "active"
                                return (
                                    <li key={k} aria-current={state === "active" ? "step" : undefined} style={{ gridArea: "1 / 1", pointerEvents: state === "active" ? "auto" : "none" }}>
                                        <h3 style={{ margin: 0, fontSize: h3Size, fontWeight: 500, lineHeight: 1.02, letterSpacing: "-0.035em", textWrap: "balance", color: ink, ...textStyle(state, 0) } as React.CSSProperties}>
                                            {s.title}
                                        </h3>
                                        <p style={{ margin: `${wide ? 22 : 16}px 0 0`, fontSize: pSize, lineHeight: 1.5, color: muted, textWrap: "pretty", ...textStyle(state, 1) } as React.CSSProperties}>
                                            {s.text}
                                        </p>
                                    </li>
                                )
                            })}
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    )
}

addPropertyControls(StepsDeck, {
    steps: {
        type: ControlType.Array,
        title: "Steps",
        control: {
            type: ControlType.Object,
            controls: {
                image: { type: ControlType.ResponsiveImage, title: "Image" },
                title: { type: ControlType.String, title: "Title" },
                text: { type: ControlType.String, title: "Text", displayTextArea: true },
            },
        },
        defaultValue: DEFAULT_STEPS,
    },
    ink: { type: ControlType.Color, title: "Ink", defaultValue: "#262B1E" },
    muted: { type: ControlType.Color, title: "Muted", defaultValue: "#343B29" },
    cardColor: { type: ControlType.Color, title: "Card", defaultValue: "#262B1E" },
    fontFamily: { type: ControlType.String, title: "Font", defaultValue: "Host Grotesk" },
    headerOffset: { type: ControlType.Number, title: "Header", defaultValue: 72, min: 0, max: 200, unit: "px" },
})
