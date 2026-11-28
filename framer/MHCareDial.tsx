import * as React from "react"
import { addPropertyControls, ControlType, RenderTarget } from "framer"

/*
 * MEDARO · Men's Health · Ongoing care, the care dial. A 1:1 port of the HTML
 * (site/sections/mens-health/ongoing.css + ongoing.js; the Weight Loss dial, V1 round 7,
 * with three nodes). Layout "Dial" (desktop):
 *   the stage pins under the header while you scroll its track; a ring of 96 fine dots
 *   (the three either side of each node left out) lights up clockwise from the top,
 *   flat, following the scroll (--pct 0–100); each node comes to full opacity and size
 *   as the dots reach it and stays lit; the centre swaps from the intro line to each
 *   point (fade, 12px rise, 4px blur). While the dial rises into view it scales 0.9 → 1.
 *   Scroll room: the intro holds 0.2 of a stretch once pinned, then one stretch (55% of
 *   the screen) per point, +0.4 so the closed loop holds a moment.
 * Layout "List" (tablet and phone, the user's rule for pinned scroll sections,
 * 2026-11-23): no pinning; the intro line, then the three points down a dotted line,
 * each node lit, its title and sentence beside it.
 * The CTA slot sits under the dial (in the pinned stage) or under the list.
 * Colours: give the MH Scene styles, so the dial follows the page's navy scene.
 * Canvas, thumbnails and screenshots: the dial at rest (intro, dots unlit).
 * Reduced motion: no scale, the centre swaps without moving; the dots still follow
 * the scroll (the reader drives it).
 */

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)"
type ImageValue = string | { src?: string; srcSet?: string; alt?: string } | null | undefined
interface Point {
    name?: string
    text?: string
    icon?: ImageValue
}
interface Props {
    layout?: "dial" | "list"
    intro?: string
    points?: Point[]
    cta?: React.ReactNode
    header?: number
    stretch?: number
    lead?: number
    fontFamily?: string
    ink?: string
    muted?: string
    disc?: string
    dots?: string
    lit?: string
    listNode?: number
    listName?: number
    listIntro?: number
    listTop?: number
    listGap?: number
    listCta?: number
    style?: React.CSSProperties
}

const ICONS = [
    "https://framerusercontent.com/images/Dt8WvmahUK92UPr6NagnBZbRmLo.webp",
    "https://framerusercontent.com/images/3iXZ1kh81NZjvrs2ITnKCtJc0A.webp",
    "https://framerusercontent.com/images/Ds7mI4fM5a5PDRbBAQzzTha6CB0.webp",
]
const DEFAULT_POINTS: Point[] = [
    { name: "Questions", text: "Appropriate follow-up care can help address questions." },
    { name: "Your response", text: "Appropriate follow-up care can help evaluate your response." },
    { name: "Changes to your treatment", text: "Appropriate follow-up care can help determine whether changes to your treatment are needed." },
]
const DEFAULT_INTRO = "Because better care means looking beyond the prescription."

const srcOf = (img: ImageValue, i: number) => {
    if (typeof img === "string" && img) return img
    if (img && typeof img === "object" && img.src) return img.src
    return ICONS[i % ICONS.length]
}
const clamp = (lo: number, v: number, hi: number) => Math.min(hi, Math.max(lo, v))
const isLive = () => RenderTarget.current() === RenderTarget.preview

// The 96 places round the ring (radius 50 in a -50…50 box), clockwise from 12 o'clock
const RING = Array.from({ length: 96 }, (_, i) => {
    const a = (i * 3.75 * Math.PI) / 180
    return { i, x: +(50 * Math.sin(a)).toFixed(2), y: +(-50 * Math.cos(a)).toFixed(2) }
})
const nodeIndex = (k: number, n: number) => Math.round((k * 96) / n) % 96
const near = (i: number, n: number) => {
    for (let k = 0; k < n; k++) {
        const d = Math.abs(i - nodeIndex(k, n))
        if (Math.min(d, 96 - d) <= 1) return true
    }
    return false
}

const CSS = [
    ".mhd{position:relative;width:100%}",
    ".mhd__stage{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:72px;padding-top:56px}",
    ".mhd.is-live .mhd__stage{position:sticky}",
    ".mhd__dial{position:relative;flex:none}",
    ".mhd__dots{position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none}",
    ".mhd__base circle{fill:var(--mhd-dots)}",
    ".mhd__lit circle{fill:var(--mhd-lit);opacity:clamp(0, calc(var(--pct) * 0.96 - var(--i)), 1)}",
    ".mhd__points{position:absolute;inset:0;margin:0;padding:0;list-style:none}",
    ".mhd__point{position:absolute;width:0;height:0}",
    ".mhd__node{position:absolute;left:-33px;top:-33px;display:grid;place-items:center;width:66px;height:66px;border-radius:50%;background:var(--mhd-disc)}",
    ".mhd__node img{width:62px;height:62px;opacity:0.45;transform:scale(0.88);transition:opacity 500ms " + EASE + ",transform 600ms " + EASE + "}",
    ".mhd__point.is-active .mhd__node img,.mhd__point.is-done .mhd__node img{opacity:1;transform:none}",
    ".mhd__label{position:absolute;width:max-content;max-width:240px}",
    ".mhd__point--0 .mhd__label{left:50%;bottom:46px;transform:translateX(-50%);text-align:center}",
    ".mhd__point--1 .mhd__label{left:50px;top:50%;transform:translateY(-50%)}",
    ".mhd__point--2 .mhd__label{right:50px;top:50%;transform:translateY(-50%);text-align:right}",
    ".mhd__name{margin:0;font-size:15px;font-weight:500;line-height:1.2;color:var(--mhd-muted);transition:color 450ms " + EASE + "}",
    ".mhd__point.is-active .mhd__name{color:var(--mhd-ink)}",
    ".mhd__point:not(.is-active) .mhd__name{opacity:0.7}",
    ".mhd__sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;margin:0}",
    ".mhd__core{position:absolute;left:50%;top:50%;display:grid;align-items:center;text-align:center;transform:translate(-50%,-50%)}",
    ".mhd__state{grid-area:1/1;display:flex;flex-direction:column;align-items:center;opacity:0;transform:translateY(12px);filter:blur(4px);visibility:hidden;transition:opacity 220ms ease-out,transform 220ms ease-out,filter 220ms ease-out,visibility 0s linear 220ms}",
    ".mhd__state.is-on{opacity:1;transform:none;filter:none;visibility:visible;transition:opacity 520ms " + EASE + " 120ms,transform 680ms " + EASE + " 120ms,filter 520ms " + EASE + " 120ms,visibility 0s}",
    ".mhd__title{margin:0;font-weight:400;line-height:1.04;letter-spacing:-0.035em;color:var(--mhd-ink);text-wrap:balance}",
    ".mhd__intro .mhd__title{line-height:1.15;letter-spacing:-0.025em}",
    ".mhd__line{max-width:24em;margin:14px 0 0;line-height:1.5;color:var(--mhd-muted);text-wrap:balance}",
    "@media (prefers-reduced-motion: reduce){.mhd__state,.mhd__state.is-on{transform:none;filter:none;transition:opacity 1ms,visibility 0s}.mhd__node img{transition:none}.mhd__dial{transform:none!important}}",
    /* List (tablet, phone) */
    ".mhl{display:flex;flex-direction:column;align-items:center;width:100%}",
    ".mhl__intro{margin:0;max-width:16em;text-align:center;font-weight:400;line-height:1.15;letter-spacing:-0.025em;color:var(--mhd-ink);text-wrap:balance}",
    ".mhl__points{position:relative;display:grid;gap:var(--mhl-gap);width:100%;max-width:520px;margin:var(--mhl-top) 0 0;padding:0;list-style:none}",
    ".mhl__rail{position:absolute;left:calc(var(--mhl-node) / 2 - 1.5px);top:calc(var(--mhl-node) + 8px);bottom:calc(8px - var(--mhl-gap));width:3px;background-image:radial-gradient(circle, var(--mhd-lit) 1.5px, transparent 1.7px);background-size:3px 9px;background-repeat:repeat-y;background-position:center top}",
    ".mhl__point{position:relative;display:grid;grid-template-columns:var(--mhl-node) 1fr;column-gap:20px;align-items:start}",
    ".mhl__node{display:grid;place-items:center;width:var(--mhl-node);height:var(--mhl-node);border-radius:50%;background:var(--mhd-disc)}",
    ".mhl__node img{width:calc(var(--mhl-node) - 4px);height:calc(var(--mhl-node) - 4px)}",
    ".mhl__text{padding-top:calc(var(--mhl-node) / 2 - 12px)}",
    ".mhl__name{margin:0;font-size:var(--mhl-name);font-weight:400;line-height:1.15;letter-spacing:-0.02em;color:var(--mhd-ink)}",
    ".mhl__line{margin:8px 0 0;font-size:16px;line-height:1.5;color:var(--mhd-muted);text-wrap:pretty}",
    ".mhl__cta{margin-top:var(--mhl-cta)}",
].join("\n")

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 */
export default function MHCareDial(props: Props) {
    const {
        layout = "dial",
        intro = DEFAULT_INTRO,
        points: pointsProp,
        cta,
        header = 70,
        stretch = 0.55,
        lead: leadShare = 0.2,
        fontFamily = "Host Grotesk",
        ink = "#1F3957",
        muted = "#4A6482",
        disc = "#EDF2F8",
        dots = "rgba(31, 57, 87, 0.22)",
        lit = "#A7D5FF",
        listNode = 56,
        listName = 22,
        listIntro = 28,
        listTop = 48,
        listGap = 36,
        listCta = 56,
        style,
    } = props
    const points = (pointsProp && pointsProp.length ? pointsProp : DEFAULT_POINTS).slice(0, 3)
    const n = points.length
    const live = isLive()

    const vars: Record<string, string> = {
        "--mhd-ink": ink,
        "--mhd-muted": muted,
        "--mhd-disc": disc,
        "--mhd-dots": dots,
        "--mhd-lit": lit,
    }
    const font = '"' + fontFamily + '", "Helvetica Neue", Arial, sans-serif'
    const isDial = layout !== "list"

    const trackRef = React.useRef<HTMLDivElement>(null)
    const stageRef = React.useRef<HTMLDivElement>(null)
    const dialRef = React.useRef<HTMLDivElement>(null)
    const [vp, setVp] = React.useState({ w: 1440, h: 900 })
    const [state, setState] = React.useState(0)

    const h = vp.h - header
    const d = clamp(360, h - 270, 700)

    React.useEffect(() => {
        if (!live || !isDial) return
        const set = () => setVp({ w: window.innerWidth, h: window.innerHeight })
        set()
        window.addEventListener("resize", set)
        return () => window.removeEventListener("resize", set)
    }, [live, isDial])

    React.useEffect(() => {
        if (!live || !isDial) return
        const track = trackRef.current
        const stage = stageRef.current
        const dial = dialRef.current
        if (!track || !stage || !dial) return
        const still = window.matchMedia("(prefers-reduced-motion: reduce)")
        let step = 0
        let lead = 0
        let current = -1
        const measure = () => {
            const sh = stage.offsetHeight
            if (!sh) return
            step = window.innerHeight * stretch
            lead = step * leadShare
            track.style.height = sh + lead + (n + 0.4) * step + "px"
        }
        let queued = false
        const update = () => {
            queued = false
            if (!step) return
            const y = header - track.getBoundingClientRect().top
            const s = y < lead ? 0 : Math.min(n, 1 + Math.floor((y - lead) / step))
            if (s !== current) {
                current = s
                setState(s)
            }
            const p = clamp(0, (y - lead) / (n * step), 1)
            dial.style.setProperty("--pct", (p * 100).toFixed(2))
            const rise = clamp(0, 1 + y / (window.innerHeight * 0.6), 1)
            dial.style.transform = "scale(" + (still.matches ? 1 : (0.9 + 0.1 * rise).toFixed(4)) + ")"
        }
        const queue = () => {
            if (!queued) {
                queued = true
                requestAnimationFrame(update)
            }
        }
        const remeasure = () => {
            measure()
            queue()
        }
        measure()
        update()
        window.addEventListener("scroll", queue, { passive: true })
        window.addEventListener("resize", remeasure)
        const fonts = (document as any).fonts
        if (fonts && fonts.ready) fonts.ready.then(remeasure)
        const ro = new ResizeObserver(remeasure)
        ro.observe(stage)
        return () => {
            window.removeEventListener("scroll", queue)
            window.removeEventListener("resize", remeasure)
            ro.disconnect()
        }
    }, [live, isDial, header, stretch, leadShare, n])

    if (!isDial) {
        const listVars: Record<string, string> = {
            "--mhl-node": listNode + "px",
            "--mhl-name": listName + "px",
            "--mhl-intro": listIntro + "px",
            "--mhl-top": listTop + "px",
            "--mhl-gap": listGap + "px",
            "--mhl-cta": listCta + "px",
        }
        return <CareList points={points} intro={intro} cta={cta} style={{ ...style, ...(vars as any), ...(listVars as any), fontFamily: font }} />
    }

    const vw = vp.w / 100
    const titleFs = clamp(34, Math.min(3.4 * vw, d * 0.085), 60)
    const introFs = clamp(26, Math.min(2.3 * vw, d * 0.06), 40)
    const lineFs = clamp(15, 1.15 * vw, 18)
    const pos = [
        { x: 0, y: -1 },
        { x: 0.866, y: 0.5 },
        { x: -0.866, y: 0.5 },
    ]

    return (
        <div className={"mhd" + (live ? " is-live" : "")} style={{ ...style, ...(vars as any), fontFamily: font }}>
            <style>{CSS}</style>
            <div ref={trackRef} className="mhd__track">
                <div ref={stageRef} className="mhd__stage" style={{ top: header, height: live ? h : undefined, minHeight: h }}>
                    <div ref={dialRef} className="mhd__dial" style={{ width: d, height: d, transform: "scale(" + (live ? 0.9 : 1) + ")", ["--pct" as any]: 0 }}>
                        <svg className="mhd__dots" viewBox="-50 -50 100 100" aria-hidden="true" focusable="false">
                            <g className="mhd__base">
                                {RING.filter((r) => !near(r.i, n)).map((r) => (
                                    <circle key={r.i} cx={r.x} cy={r.y} r={0.42} />
                                ))}
                            </g>
                            <g className="mhd__lit">
                                {RING.filter((r) => !near(r.i, n)).map((r) => (
                                    <circle key={r.i} cx={r.x} cy={r.y} r={0.55} style={{ ["--i" as any]: r.i }} />
                                ))}
                            </g>
                        </svg>
                        <ul className="mhd__points">
                            {points.map((pt, k) => (
                                <li
                                    key={k}
                                    className={"mhd__point mhd__point--" + k + (k === state - 1 ? " is-active" : "") + (k < state - 1 ? " is-done" : "")}
                                    style={{ left: 50 + pos[k].x * 50 + "%", top: 50 + pos[k].y * 50 + "%" }}
                                >
                                    <span className="mhd__node" aria-hidden="true">
                                        <img src={srcOf(pt.icon, k)} alt="" width={512} height={512} loading="lazy" decoding="async" />
                                    </span>
                                    <div className="mhd__label">
                                        <h3 className="mhd__name">{pt.name}</h3>
                                        <p className="mhd__sr">{pt.text}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <div className="mhd__core" style={{ width: d * 0.7 }}>
                            <div className={"mhd__state mhd__intro" + (state === 0 ? " is-on" : "")}>
                                <p className="mhd__title" style={{ fontSize: introFs }}>
                                    {intro}
                                </p>
                            </div>
                            {points.map((pt, k) => (
                                <div key={k} className={"mhd__state" + (state === k + 1 ? " is-on" : "")} aria-hidden="true">
                                    <p className="mhd__title" style={{ fontSize: titleFs }}>
                                        {pt.name}
                                    </p>
                                    <p className="mhd__line" style={{ fontSize: lineFs }}>
                                        {pt.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                    {cta ? <div className="mhd__cta">{cta}</div> : null}
                </div>
            </div>
        </div>
    )
}

function CareList(props: { points: Point[]; intro: string; cta?: React.ReactNode; style: React.CSSProperties }) {
    const { points, intro, cta, style } = props
    return (
        <div className="mhl" style={style}>
            <style>{CSS}</style>
            <p className="mhl__intro" style={{ fontSize: "var(--mhl-intro)" }}>
                {intro}
            </p>
            <ul className="mhl__points">
                {points.map((pt, k) => (
                    <li key={k} className="mhl__point">
                        {k < points.length - 1 ? <span className="mhl__rail" aria-hidden="true" /> : null}
                        <span className="mhl__node" aria-hidden="true">
                            <img src={srcOf(pt.icon, k)} alt="" width={512} height={512} loading="lazy" decoding="async" />
                        </span>
                        <div className="mhl__text">
                            <h3 className="mhl__name">{pt.name}</h3>
                            <p className="mhl__line">{pt.text}</p>
                        </div>
                    </li>
                ))}
            </ul>
            {cta ? <div className="mhl__cta">{cta}</div> : null}
        </div>
    )
}

addPropertyControls(MHCareDial, {
    layout: { type: ControlType.Enum, title: "Layout", options: ["dial", "list"], optionTitles: ["Dial", "List"], defaultValue: "dial", displaySegmentedControl: true },
    intro: { type: ControlType.String, title: "Intro", defaultValue: DEFAULT_INTRO, displayTextArea: true },
    points: {
        type: ControlType.Array,
        title: "Points",
        maxCount: 3,
        control: {
            type: ControlType.Object,
            controls: {
                name: { type: ControlType.String, title: "Name" },
                text: { type: ControlType.String, title: "Text", displayTextArea: true },
                icon: { type: ControlType.ResponsiveImage, title: "Icon" },
            },
        },
        defaultValue: DEFAULT_POINTS,
    },
    cta: { type: ControlType.ComponentInstance, title: "CTA" },
    header: { type: ControlType.Number, title: "Header", defaultValue: 70, min: 0, max: 200, unit: "px", hidden: (p: Props) => p.layout === "list" },
    stretch: { type: ControlType.Number, title: "Stretch", defaultValue: 0.55, min: 0.2, max: 1.5, step: 0.05, hidden: (p: Props) => p.layout === "list" },
    lead: { type: ControlType.Number, title: "Lead", defaultValue: 0.2, min: 0, max: 1, step: 0.05, hidden: (p: Props) => p.layout === "list" },
    fontFamily: { type: ControlType.String, title: "Font", defaultValue: "Host Grotesk" },
    ink: { type: ControlType.Color, title: "Ink", defaultValue: "#1F3957" },
    muted: { type: ControlType.Color, title: "Muted", defaultValue: "#4A6482" },
    disc: { type: ControlType.Color, title: "Disc", defaultValue: "#EDF2F8" },
    dots: { type: ControlType.Color, title: "Dots", defaultValue: "rgba(31, 57, 87, 0.22)" },
    lit: { type: ControlType.Color, title: "Lit", defaultValue: "#A7D5FF" },
    listNode: { type: ControlType.Number, title: "List node", defaultValue: 56, min: 32, max: 96, unit: "px", hidden: (p: Props) => p.layout !== "list" },
    listName: { type: ControlType.Number, title: "List title", defaultValue: 22, min: 14, max: 40, unit: "px", hidden: (p: Props) => p.layout !== "list" },
    listIntro: { type: ControlType.Number, title: "List intro", defaultValue: 28, min: 16, max: 56, unit: "px", hidden: (p: Props) => p.layout !== "list" },
    listTop: { type: ControlType.Number, title: "Intro gap", defaultValue: 48, min: 0, max: 120, unit: "px", hidden: (p: Props) => p.layout !== "list" },
    listGap: { type: ControlType.Number, title: "Point gap", defaultValue: 36, min: 8, max: 96, unit: "px", hidden: (p: Props) => p.layout !== "list" },
    listCta: { type: ControlType.Number, title: "CTA gap", defaultValue: 56, min: 0, max: 120, unit: "px", hidden: (p: Props) => p.layout !== "list" },
})
