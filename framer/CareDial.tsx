import * as React from "react"
import { addPropertyControls, ControlType, RenderTarget } from "framer"

/*
 * MEDARO · the care dial (Weight Loss landing → Ongoing care, "Support Beyond the First Step").
 * A 1:1 port of the approved HTML: site/sections/weight-loss/ongoing--v1.css + ongoing--v1.js,
 * V1 round 7 (claude/awesome-feynman-su67d2, 61d7712), after Ada's "four easy steps" and the
 * "Your clock is ticking" dotted ring.
 *
 * The stage pins under the header while you scroll. A ring of fine dots (96 positions, the
 * ones under the nodes left out) with the icon nodes round it (four on Weight Loss: top,
 * right, bottom, left). As you scroll the dots light up one after another, clockwise from the
 * top, flat with no glow (each dot's opacity = clamp(0, --pct × 0.96 − i, 1)); a node the lit
 * dots have reached stays at full opacity and size, the ones still ahead wait at 45% and 88%.
 * The centre shows the closing lines first (the intro), then each point's title and sentence,
 * cross-fading with a 12px rise and a 4px blur. While the stage rises into place it scales
 * 0.9 → 1. Scroll room: once pinned the intro holds a fifth of a stretch (LEAD 0.2), then each
 * point gets one stretch (55% of the window), and the closed loop holds 0.4 of a stretch.
 * Reduced motion: the text swaps without moving, no scale; the dots still follow the scroll.
 * The CTA slot sits under the dial throughout.
 *
 * Colours are controls, bound in Framer to the Scene colour styles so the dial follows the
 * page's scene (Weight Loss: the page turns deep olive while the section holds the middle of
 * the screen, Scenes.tsx → "wl-ongoing"). Lit dots: "Scene Chip WL" (lime in the scene).
 * Size: Desktop / Tablet / Phone, set per breakpoint on the instance (phone hides the titles
 * outside the ring: the centre carries them). Canvas, thumbnails, server render: the intro,
 * unlit, not pinned.
 */

type ImageValue = string | { src?: string; srcSet?: string; alt?: string } | null | undefined
interface Point {
    title?: string
    text?: string
    icon?: ImageValue
}
type Size = "desktop" | "tablet" | "phone"
interface Props {
    points?: Point[]
    introTitle?: string
    introText?: string
    size?: Size
    ink?: string
    muted?: string
    lit?: string
    nodeBg?: string
    fontFamily?: string
    headerOffset?: number
    lead?: number
    stretch?: number
    cta?: React.ReactNode
    style?: React.CSSProperties
}

const ICONS = [
    "https://framerusercontent.com/images/SlQSB4wS0HIO1m1RcwBCGnAw5aI.webp", // follow-up: a desk calendar, one day marked with a heart
    "https://framerusercontent.com/images/m97P1jjfVkEp9y2Mu2JZTYghBOQ.webp", // response: a card with a pulse line
    "https://framerusercontent.com/images/pTnGIxkym06Ql2LHTjDPC2PJY.webp", // side effects: two speech bubbles
    "https://framerusercontent.com/images/UiEwfgf2NkZ1Iq5srDgXON0muLc.webp", // adjustments: three sliders
]
const DEFAULT_POINTS: Point[] = [
    { title: "Follow-up care", text: "Your care doesn’t end with a prescription.", icon: ICONS[0] },
    { title: "Your response", text: "Your provider can evaluate your response to treatment.", icon: ICONS[1] },
    { title: "Side effects", text: "Discuss any side effects with your provider.", icon: ICONS[2] },
    { title: "Adjustments", text: "Your provider can determine whether adjustments are appropriate.", icon: ICONS[3] },
]

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)"
const SIZES: Record<Size, Record<string, string>> = {
    // ongoing--v1.css, measured against the HTML at 1280, 1440 and 1920
    desktop: {
        "--md-d": "clamp(360px, calc(var(--md-h) - 290px), 700px)",
        "--md-gap": "92px",
        "--md-pt": "56px",
        "--md-node": "66px",
        "--md-icon": "62px",
        "--md-core": "0.7",
        "--md-intro": "clamp(26px, min(calc(2.3 * var(--md-vw)), calc(var(--md-d) * 0.06)), 40px)",
        "--md-title": "clamp(34px, min(calc(3.4 * var(--md-vw)), calc(var(--md-d) * 0.085)), 60px)",
        "--md-text": "clamp(15px, calc(1.15 * var(--md-vw)), 18px)",
    },
    // Framer only: the ring also gives way to the screen's width, so the side titles keep 16px+ to the edge
    tablet: {
        "--md-d": "min(clamp(360px, calc(var(--md-h) - 290px), 560px), calc(100 * var(--md-vw) - 360px))",
        "--md-gap": "72px",
        "--md-pt": "56px",
        "--md-node": "66px",
        "--md-icon": "62px",
        "--md-core": "0.72",
        "--md-intro": "clamp(22px, calc(var(--md-d) * 0.06), 32px)",
        "--md-title": "clamp(32px, calc(var(--md-d) * 0.085), 46px)",
        "--md-text": "16px",
    },
    // Framer only: the ring fills the width with the side nodes 16px+ from the screen's edge (44px each side),
    // the titles outside it are left out (the centre shows them)
    phone: {
        "--md-d": "max(240px, min(calc(100 * var(--md-vw) - 88px), calc(var(--md-h) - 250px)))",
        "--md-gap": "40px",
        "--md-pt": "28px",
        "--md-node": "54px",
        "--md-icon": "50px",
        "--md-core": "0.78",
        "--md-intro": "clamp(19px, calc(var(--md-d) * 0.062), 22px)",
        "--md-title": "clamp(26px, calc(var(--md-d) * 0.092), 32px)",
        "--md-text": "15px",
    },
}
const CANVAS_H: Record<Size, number> = { desktop: 830, tablet: 900, phone: 700 }

const CSS = `
.mdial{--pct:0;--enter:1;position:relative;width:100%;color:var(--md-ink);font-family:var(--md-font);-webkit-font-smoothing:antialiased}
.mdial *{box-sizing:border-box}
.mdial__track{position:relative}
.mdial__stage{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:var(--md-gap);padding-top:var(--md-pt);min-height:var(--md-h)}
.mdial.is-live .mdial__stage{position:sticky;top:var(--md-header);height:var(--md-h)}
.mdial__dial{position:relative;flex:none;width:var(--md-d);height:var(--md-d);transform:scale(var(--enter))}
.mdial__dots{position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none}
.mdial__base circle{fill:color-mix(in srgb, var(--md-ink) 22%, transparent)}
.mdial__lit circle{fill:var(--md-lit)}
.mdial__points{position:absolute;inset:0;margin:0;padding:0;list-style:none}
.mdial__point{position:absolute;width:0;height:0}
.mdial__node{position:absolute;left:calc(var(--md-node) / -2);top:calc(var(--md-node) / -2);display:grid;place-items:center;width:var(--md-node);height:var(--md-node);border-radius:50%;background:var(--md-bg)}
.mdial__node img{display:block;width:var(--md-icon);height:var(--md-icon);opacity:.45;transform:scale(.88);transition:opacity 500ms ${EASE},transform 600ms ${EASE}}
.mdial__point.is-active .mdial__node img,.mdial__point.is-done .mdial__node img{opacity:1;transform:none}
.mdial__label{position:absolute;width:max-content;max-width:240px}
.mdial__label[data-side="top"]{left:50%;bottom:46px;transform:translateX(-50%);text-align:center}
.mdial__label[data-side="right"]{left:50px;top:50%;transform:translateY(-50%);text-align:left}
.mdial__label[data-side="bottom"]{left:50%;top:46px;transform:translateX(-50%);text-align:center}
.mdial__label[data-side="left"]{right:50px;top:50%;transform:translateY(-50%);text-align:right}
.mdial__name{margin:0;font-size:15px;font-weight:500;line-height:1.2;color:var(--md-muted);opacity:.7;transition:color 450ms ${EASE}}
.mdial__point.is-active .mdial__name{color:var(--md-ink);opacity:1}
.mdial__sr,.mdial[data-size="phone"] .mdial__label{position:absolute!important;width:1px!important;height:1px!important;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
.mdial__core{position:absolute;left:50%;top:50%;display:grid;align-items:center;width:calc(var(--md-d) * var(--md-core));text-align:center;transform:translate(-50%,-50%)}
.mdial__state{grid-area:1/1;display:flex;flex-direction:column;align-items:center;opacity:0;transform:translateY(12px);filter:blur(4px);visibility:hidden;transition:opacity 220ms ease-out,transform 220ms ease-out,filter 220ms ease-out,visibility 0s linear 220ms}
.mdial__state.is-on{opacity:1;transform:none;filter:none;visibility:visible;transition:opacity 520ms ${EASE} 120ms,transform 680ms ${EASE} 120ms,filter 520ms ${EASE} 120ms,visibility 0s}
.mdial__title{margin:0;font-size:var(--md-title);font-weight:400;line-height:1.04;letter-spacing:-0.035em;color:var(--md-ink)}
.mdial__state--intro .mdial__title{font-size:var(--md-intro);line-height:1.15;letter-spacing:-0.025em}
.mdial__text{max-width:24em;margin:14px 0 0;font-size:var(--md-text);line-height:1.5;color:var(--md-muted);text-wrap:balance}
.mdial__cta{position:relative;flex:none;display:flex;justify-content:center}
@media (prefers-reduced-motion: reduce){.mdial__state,.mdial__state.is-on{transform:none;filter:none;transition:opacity 1ms,visibility 0s}.mdial__node img{transition:none}.mdial__dial{transform:none}}
`

function srcOf(v: ImageValue): { src?: string; srcSet?: string } {
    if (!v) return {}
    if (typeof v === "string") return { src: v }
    return { src: v.src, srcSet: v.srcSet }
}
const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

/** The dots: 96 positions round the ring (viewBox −50…50), the ones within one step of a node left out */
function dotsFor(n: number) {
    const nodes = Array.from({ length: n }, (_, k) => (k * 96) / n)
    const out: Array<{ i: number; x: string; y: string }> = []
    for (let i = 0; i < 96; i++) {
        const near = nodes.some((c) => {
            const d = Math.abs(i - c)
            return Math.min(d, 96 - d) <= 1
        })
        if (near) continue
        const a = (i / 96) * Math.PI * 2
        out.push({ i, x: (50 * Math.sin(a)).toFixed(2), y: (-50 * Math.cos(a)).toFixed(2) })
    }
    return out
}
function sideFor(k: number, n: number) {
    const deg = (k * 360) / n
    if (deg === 0) return "top"
    if (Math.abs(deg - 180) < 0.01) return "bottom"
    return deg < 180 ? "right" : "left"
}

const useIsoLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 */
export default function CareDial(props: Props) {
    const {
        points: pointsProp,
        introTitle = "Because the right treatment plan isn’t just about getting started.",
        introText = "It’s about knowing how to move forward.",
        size = "desktop",
        ink = "#F4F5EF",
        muted = "#BABCB5",
        lit = "#D5E5AD",
        nodeBg = "#262B1E",
        fontFamily = "Host Grotesk",
        headerOffset = 70,
        lead = 0.2,
        stretch = 0.55,
        cta,
        style,
    } = props
    const points = pointsProp && pointsProp.length ? pointsProp : DEFAULT_POINTS
    const n = points.length
    // Live (Preview and the published site): pinned and driven by the scroll. Canvas, thumbnails: the intro, still.
    const isCanvas = RenderTarget.current() !== RenderTarget.preview
    const dots = React.useMemo(() => dotsFor(n), [n])

    const rootRef = React.useRef<HTMLDivElement>(null)
    const trackRef = React.useRef<HTMLDivElement>(null)
    const stageRef = React.useRef<HTMLDivElement>(null)
    const [canvasW, setCanvasW] = React.useState(1168)

    // In the canvas the vw units would read the editor's window: use the frame's own width instead
    useIsoLayoutEffect(() => {
        if (!isCanvas) return
        const el = rootRef.current
        if (!el || typeof ResizeObserver === "undefined") return
        const ro = new ResizeObserver(() => setCanvasW(el.offsetWidth || 1168))
        ro.observe(el)
        setCanvasW(el.offsetWidth || 1168)
        return () => ro.disconnect()
    }, [isCanvas])

    // The scroll: the same maths as ongoing--v1.js
    React.useEffect(() => {
        if (isCanvas) return
        const root = rootRef.current
        const track = trackRef.current
        const stage = stageRef.current
        if (!root || !track || !stage) return
        const nodes = Array.from(root.querySelectorAll<HTMLElement>(".mdial__point"))
        const states = Array.from(root.querySelectorAll<HTMLElement>(".mdial__state"))
        const still = window.matchMedia("(prefers-reduced-motion: reduce)")
        root.classList.add("is-live")
        let step = 0
        let leadPx = 0
        let current = -1
        let queued = false
        const measure = () => {
            const h = stage.offsetHeight
            if (!h) return // a hidden breakpoint
            step = window.innerHeight * stretch
            leadPx = step * lead
            track.style.height = `${Math.round(h + leadPx + (n + 0.4) * step)}px` // +0.4: the closed loop holds a moment
        }
        const show = (s: number) => {
            if (s === current) return
            current = s
            states.forEach((el, i) => el.classList.toggle("is-on", i === s))
            nodes.forEach((p, i) => {
                p.classList.toggle("is-active", i === s - 1)
                p.classList.toggle("is-done", i < s - 1)
            })
        }
        const update = () => {
            queued = false
            if (!step) measure()
            if (!step) return
            const pin = parseFloat(getComputedStyle(stage).top) || 0
            const y = pin - track.getBoundingClientRect().top // how far into the pinned stretch (negative while rising)
            show(y < leadPx ? 0 : Math.min(n, 1 + Math.floor((y - leadPx) / step)))
            const p = clamp01((y - leadPx) / (n * step))
            root.style.setProperty("--pct", (p * 100).toFixed(2))
            const rise = clamp01(1 + y / (window.innerHeight * 0.6)) // 0 when 60% of a window away, 1 once pinned
            root.style.setProperty("--enter", still.matches ? "1" : (0.9 + 0.1 * rise).toFixed(4))
        }
        const queue = () => {
            if (!queued) {
                queued = true
                requestAnimationFrame(update)
            }
        }
        const remeasure = () => {
            step = 0
            measure()
            queue()
        }
        measure()
        update()
        window.addEventListener("scroll", queue, { passive: true })
        window.addEventListener("resize", remeasure)
        still.addEventListener("change", queue)
        const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(remeasure) : null
        ro?.observe(stage)
        return () => {
            window.removeEventListener("scroll", queue)
            window.removeEventListener("resize", remeasure)
            still.removeEventListener("change", queue)
            ro?.disconnect()
            root.classList.remove("is-live")
            track.style.height = ""
        }
    }, [isCanvas, n, lead, stretch])

    const vars: Record<string, string> = {
        ...SIZES[size],
        "--md-h": isCanvas ? `${CANVAS_H[size]}px` : `calc(100svh - ${headerOffset}px)`,
        "--md-vw": isCanvas ? `${((canvasW + 32) / 100).toFixed(3)}px` : "1vw",
        "--md-header": `${headerOffset}px`,
        "--md-ink": ink,
        "--md-muted": muted,
        "--md-lit": lit,
        "--md-bg": nodeBg,
        "--md-font": `"${fontFamily}", "Host Grotesk Placeholder", sans-serif`,
    }

    return (
        <div ref={rootRef} className="mdial" data-size={size} style={{ ...style, ...(vars as React.CSSProperties) }}>
            <style dangerouslySetInnerHTML={{ __html: CSS }} />
            <div ref={trackRef} className="mdial__track">
                <div ref={stageRef} className="mdial__stage">
                    <div className="mdial__dial">
                        <svg className="mdial__dots" viewBox="-50 -50 100 100" aria-hidden="true" focusable="false">
                            <g className="mdial__base">
                                {dots.map((d) => (
                                    <circle key={d.i} cx={d.x} cy={d.y} r="0.42" />
                                ))}
                            </g>
                            <g className="mdial__lit">
                                {dots.map((d) => (
                                    <circle key={d.i} cx={d.x} cy={d.y} r="0.55" style={{ opacity: `clamp(0, calc(var(--pct) * 0.96 - ${d.i}), 1)` }} />
                                ))}
                            </g>
                        </svg>

                        <ul className="mdial__points">
                            {points.map((p, k) => {
                                const a = (k / n) * Math.PI * 2
                                const img = srcOf(p.icon || ICONS[k])
                                return (
                                    <li
                                        key={k}
                                        className="mdial__point"
                                        style={{ left: `${(50 + 50 * Math.sin(a)).toFixed(3)}%`, top: `${(50 - 50 * Math.cos(a)).toFixed(3)}%` }}
                                    >
                                        <span className="mdial__node" aria-hidden="true">
                                            {img.src ? <img src={img.src} srcSet={img.srcSet} alt="" width={512} height={512} loading="lazy" decoding="async" /> : null}
                                        </span>
                                        <div className="mdial__label" data-side={sideFor(k, n)}>
                                            <h3 className="mdial__name">{p.title}</h3>
                                            <p className="mdial__sr">{p.text}</p>
                                        </div>
                                    </li>
                                )
                            })}
                        </ul>

                        <div className="mdial__core">
                            <div className="mdial__state mdial__state--intro is-on">
                                <p className="mdial__title">{introTitle}</p>
                                {introText ? <p className="mdial__text">{introText}</p> : null}
                            </div>
                            {points.map((p, k) => (
                                <div key={k} className="mdial__state" aria-hidden="true">
                                    <p className="mdial__title">{p.title}</p>
                                    {p.text ? <p className="mdial__text">{p.text}</p> : null}
                                </div>
                            ))}
                        </div>
                    </div>

                    {cta ? <div className="mdial__cta">{cta}</div> : null}
                </div>
            </div>
        </div>
    )
}

addPropertyControls(CareDial, {
    points: {
        type: ControlType.Array,
        title: "Points",
        maxCount: 6,
        control: {
            type: ControlType.Object,
            controls: {
                title: { type: ControlType.String, title: "Title" },
                text: { type: ControlType.String, title: "Text", displayTextArea: true },
                icon: { type: ControlType.ResponsiveImage, title: "Icon" },
            },
        },
        defaultValue: DEFAULT_POINTS,
    },
    introTitle: { type: ControlType.String, title: "Intro", displayTextArea: true, defaultValue: "Because the right treatment plan isn’t just about getting started." },
    introText: { type: ControlType.String, title: "Intro line", displayTextArea: true, defaultValue: "It’s about knowing how to move forward." },
    size: { type: ControlType.Enum, title: "Size", options: ["desktop", "tablet", "phone"], optionTitles: ["Desktop", "Tablet", "Phone"], defaultValue: "desktop" },
    ink: { type: ControlType.Color, title: "Ink", defaultValue: "#F4F5EF" },
    muted: { type: ControlType.Color, title: "Muted", defaultValue: "#BABCB5" },
    lit: { type: ControlType.Color, title: "Lit dots", defaultValue: "#D5E5AD" },
    nodeBg: { type: ControlType.Color, title: "Page", defaultValue: "#262B1E" },
    fontFamily: { type: ControlType.String, title: "Font", defaultValue: "Host Grotesk" },
    headerOffset: { type: ControlType.Number, title: "Header", defaultValue: 70, min: 0, max: 200, unit: "px" },
    lead: { type: ControlType.Number, title: "Intro hold", defaultValue: 0.2, min: 0, max: 2, step: 0.05 },
    stretch: { type: ControlType.Number, title: "Stretch", defaultValue: 0.55, min: 0.2, max: 1.5, step: 0.05 },
    cta: { type: ControlType.ComponentInstance, title: "CTA" },
})
