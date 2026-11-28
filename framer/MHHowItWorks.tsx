import * as React from "react"
import { addPropertyControls, ControlType, RenderTarget } from "framer"

/*
 * MEDARO · Men's Health · How MEDARO Works. A 1:1 port of the HTML
 * (site/sections/mens-health/how-it-works.css + how-it-works.js), after the user's
 * StemWave recording: the steps take turns; the open one is a white card with its
 * text, a thin line fills along its foot for 7s, then the next step opens and the
 * photo changes with it (cross-fade 900ms, a slow 1 → 1.04 push-in), round and round.
 * Click (or Enter/Space) opens a step and starts its line again.
 * Holds still: off screen (less than 45% of the section showing), while the mouse
 * is on the list, while the keyboard is in it, and under reduced motion (no line,
 * no turning: the steps open when chosen).
 *
 * Two components share one state, so the list and the photo can sit in different
 * columns (desktop) or apart (tablet and phone):
 *   default export MHSteps    the list (numbers, titles, the open card, the line)
 *   MHStepPhotos              the photo, one per step
 * Instances with the same Group work together. Instances that are not on screen
 * (other breakpoints) never drive the timer.
 * Canvas, thumbnails and screenshots: step 1 open, still.
 */

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)"

/* ---------- Shared state: the open step per group ---------- */
type Group = { active: number; epoch: number }
const groups: Record<string, Group> = {}
const listeners = new Set<() => void>()
const getGroup = (g: string): Group => groups[g] || (groups[g] = { active: 0, epoch: 0 })
const setGroup = (g: string, next: Group) => {
    groups[g] = next
    listeners.forEach((l) => l())
}
const subscribe = (l: () => void) => {
    listeners.add(l)
    return () => {
        listeners.delete(l)
    }
}
function useGroup(g: string): Group {
    return React.useSyncExternalStore(
        subscribe,
        () => getGroup(g),
        () => getGroup(g)
    )
}

const isLive = () => RenderTarget.current() === RenderTarget.preview
const useIsoLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect

/* ---------- The list ---------- */
interface Step {
    title?: string
    text?: string
}
interface StepsProps {
    group?: string
    steps?: Step[]
    duration?: number
    fontFamily?: string
    numberColor?: string
    titleColor?: string
    textColor?: string
    cardColor?: string
    hoverColor?: string
    lineColor?: string
    radius?: number
    inset?: number
    numberColumn?: number
    titleMin?: number
    titleVw?: number
    titleMax?: number
    numberMin?: number
    numberVw?: number
    numberMax?: number
    textSize?: number
    style?: React.CSSProperties
}

const DEFAULT_STEPS: Step[] = [
    { title: "Tell Us About Yourself", text: "Complete a confidential online assessment covering your medical history, symptoms, and treatment goals." },
    { title: "Get Expert Medical Guidance", text: "A licensed healthcare provider reviews your information, evaluates your needs, and discusses appropriate treatment options." },
    { title: "Move Forward With Your Treatment", text: "If an appropriate medication is prescribed, home delivery may be available through a licensed pharmacy." },
]

const STEPS_CSS = [
    ".mhs{position:relative;width:100%}",
    ".mhs__steps{list-style:none;margin:0;padding:0;display:grid;align-content:start}",
    ".mhs__step{position:relative;border-radius:var(--mhs-r);background-color:rgba(255,255,255,0);transition:background-color 420ms " + EASE + "}",
    ".mhs__step.is-active{background-color:var(--mhs-card)}",
    ".mhs__step:not(.is-active):hover{background-color:var(--mhs-hover)}",
    ".mhs__h{margin:0;font:inherit}",
    ".mhs__btn{display:grid;grid-template-columns:var(--mhs-numw) 1fr;align-items:baseline;width:100%;margin:0;padding:22px var(--mhs-pad);border:0;border-radius:var(--mhs-r);background:none;font:inherit;color:inherit;text-align:left;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:padding-bottom 460ms " + EASE + "}",
    ".mhs__btn:focus-visible{outline:2px solid var(--mhs-line);outline-offset:2px}",
    ".mhs__step.is-active .mhs__btn{padding-bottom:12px}",
    ".mhs__num{font-size:var(--mhs-numfs);font-weight:500;line-height:1.55;letter-spacing:0.02em;font-variant-numeric:tabular-nums;color:var(--mhs-num)}",
    ".mhs__name{font-size:var(--mhs-titlefs);font-weight:400;line-height:1.15;letter-spacing:-0.02em;color:var(--mhs-title)}",
    ".mhs__panel{display:grid;grid-template-rows:0fr;visibility:hidden;transition:grid-template-rows 460ms " + EASE + ",visibility 0s 460ms}",
    ".mhs__step.is-active .mhs__panel{grid-template-rows:1fr;visibility:visible;transition:grid-template-rows 460ms " + EASE + "}",
    ".mhs__panel>div{min-height:0;overflow:hidden}",
    ".mhs__text{margin:0;padding:0 var(--mhs-pad) 28px calc(var(--mhs-pad) + var(--mhs-numw));font-size:var(--mhs-textfs);line-height:1.5;color:var(--mhs-text);text-wrap:balance;opacity:0;transition:opacity 200ms " + EASE + "}",
    ".mhs__step.is-active .mhs__text{opacity:1;transition:opacity 360ms " + EASE + " 140ms}",
    ".mhs__progress{position:absolute;left:var(--mhs-pad);right:var(--mhs-pad);bottom:0;height:2px;border-radius:2px;background:var(--mhs-line);transform:scaleX(0);transform-origin:left center;opacity:0;pointer-events:none}",
    ".mhs.is-auto .mhs__step.is-active .mhs__progress{opacity:1;animation:mhs-progress var(--mhs-dur) linear forwards}",
    ".mhs.is-auto.is-paused .mhs__step.is-active .mhs__progress{animation-play-state:paused}",
    "@keyframes mhs-progress{to{transform:scaleX(1)}}",
    "@media (prefers-reduced-motion: reduce){.mhs__step,.mhs__btn,.mhs__panel,.mhs__step.is-active .mhs__panel,.mhs__text,.mhs__step.is-active .mhs__text{transition:none}}",
].join("\n")

const pad2 = (n: number) => (n < 10 ? "0" + n : String(n))

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 */
export default function MHSteps(props: StepsProps) {
    const {
        group = "mh-how-it-works",
        steps: stepsProp,
        duration = 7,
        fontFamily = "Host Grotesk",
        numberColor = "#0A6FC7",
        titleColor = "#1F3957",
        textColor = "#4A6482",
        cardColor = "#FFFFFF",
        hoverColor = "rgba(255, 255, 255, 0.5)",
        lineColor = "#0A6FC7",
        radius = 12,
        inset = 28,
        numberColumn = 44,
        titleMin = 20,
        titleVw = 1.6,
        titleMax = 28,
        numberMin = 14,
        numberVw = 1,
        numberMax = 17,
        textSize = 16,
        style,
    } = props
    const steps = stepsProp && stepsProp.length ? stepsProp : DEFAULT_STEPS
    const n = steps.length
    const live = isLive()
    const state = useGroup(group)
    const active = live ? Math.min(state.active, n - 1) : 0
    const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "")

    const rootRef = React.useRef<HTMLDivElement>(null)
    const listRef = React.useRef<HTMLOListElement>(null)
    const [holds, setHolds] = React.useState<string[]>(["view"])
    const [reduce, setReduce] = React.useState(false)
    const [minH, setMinH] = React.useState<number | undefined>(undefined)

    const hold = React.useCallback((why: string, on: boolean) => {
        setHolds((h) => {
            const has = h.indexOf(why) >= 0
            if (on === has) return h
            return on ? h.concat(why) : h.filter((x) => x !== why)
        })
    }, [])

    const show = React.useCallback(
        (i: number, restart: boolean) => {
            const cur = getGroup(group)
            const next = ((i % n) + n) % n
            setGroup(group, { active: next, epoch: restart ? cur.epoch + 1 : cur.epoch })
        },
        [group, n]
    )

    // Reduced motion
    React.useEffect(() => {
        if (!live) return
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
        const set = () => setReduce(mq.matches)
        set()
        mq.addEventListener("change", set)
        return () => mq.removeEventListener("change", set)
    }, [live])

    // Off screen: hold (45% of the section must show, as in the HTML)
    React.useEffect(() => {
        if (!live) return
        const el = rootRef.current
        if (!el) return
        const target = (el.closest("section") as HTMLElement) || el
        if (!("IntersectionObserver" in window)) {
            hold("view", false)
            return
        }
        const io = new IntersectionObserver(([entry]) => hold("view", !entry.isIntersecting), { threshold: 0.45 })
        io.observe(target)
        return () => io.disconnect()
    }, [live, hold])

    // The list keeps the height of its tallest state: every title closed but one,
    // the longest text open (closed rows are 10px taller than the open one)
    useIsoLayoutEffect(() => {
        const root = rootRef.current
        const list = listRef.current
        if (!root || !list) return
        const reserve = () => {
            const items = Array.from(list.querySelectorAll<HTMLElement>(".mhs__step"))
            if (!items.length) return
            let names = 0
            let texts = 0
            items.forEach((item) => {
                const btn = item.querySelector<HTMLElement>(".mhs__btn")
                const text = item.querySelector<HTMLElement>(".mhs__text")
                if (!btn || !text) return
                names += btn.getBoundingClientRect().height - parseFloat(getComputedStyle(btn).paddingBottom) + 22
                texts = Math.max(texts, text.getBoundingClientRect().height)
            })
            setMinH(Math.ceil(names - 10 + texts) + 2)
        }
        reserve()
        let lastW = root.clientWidth
        const ro = new ResizeObserver(() => {
            if (root.clientWidth === lastW) return
            lastW = root.clientWidth
            reserve()
        })
        ro.observe(root)
        const fonts = (document as any).fonts
        if (fonts && fonts.ready) fonts.ready.then(reserve)
        return () => ro.disconnect()
    }, [n, titleMin, titleVw, titleMax, textSize, inset, numberColumn])

    const paused = holds.length > 0
    const auto = live && !reduce
    const cls = "mhs" + (auto ? " is-auto" : "") + (paused ? " is-paused" : "")

    const vars: Record<string, string> = {
        "--mhs-num": numberColor,
        "--mhs-title": titleColor,
        "--mhs-text": textColor,
        "--mhs-card": cardColor,
        "--mhs-hover": hoverColor,
        "--mhs-line": lineColor,
        "--mhs-r": radius + "px",
        "--mhs-pad": inset + "px",
        "--mhs-numw": numberColumn + "px",
        "--mhs-dur": duration + "s",
        "--mhs-titlefs": "clamp(" + titleMin + "px, " + titleVw + "vw, " + titleMax + "px)",
        "--mhs-numfs": "clamp(" + numberMin + "px, " + numberVw + "vw, " + numberMax + "px)",
        "--mhs-textfs": textSize + "px",
    }

    return (
        <div
            ref={rootRef}
            className={cls}
            style={{ ...style, ...(vars as any), fontFamily: '"' + fontFamily + '", "Helvetica Neue", Arial, sans-serif' }}
        >
            <style>{STEPS_CSS}</style>
            <ol
                ref={listRef}
                className="mhs__steps"
                style={{ minHeight: minH }}
                onPointerEnter={(e) => {
                    if (e.pointerType === "mouse") hold("pointer", true)
                }}
                onPointerLeave={() => hold("pointer", false)}
                onFocus={(e) => {
                    if ((e.target as HTMLElement).matches(":focus-visible")) hold("focus", true)
                }}
                onBlur={(e) => {
                    if (!listRef.current || !listRef.current.contains(e.relatedTarget as Node)) hold("focus", false)
                }}
                onAnimationEnd={(e) => {
                    if (e.animationName === "mhs-progress") show(active + 1, false)
                }}
            >
                {steps.map((s, i) => {
                    const on = i === active
                    const bid = "mhs-" + uid + "-b" + i
                    const pid = "mhs-" + uid + "-p" + i
                    return (
                        <li key={i} className={"mhs__step" + (on ? " is-active" : "")}>
                            <h3 className="mhs__h">
                                <button className="mhs__btn" type="button" id={bid} aria-expanded={on} aria-controls={pid} onClick={() => show(i, true)}>
                                    <span className="mhs__num">{pad2(i + 1)}</span>
                                    <span className="mhs__name">{s.title}</span>
                                </button>
                            </h3>
                            <div className="mhs__panel" id={pid} role="region" aria-labelledby={bid}>
                                <div>
                                    <p className="mhs__text">{s.text}</p>
                                </div>
                            </div>
                            <span className="mhs__progress" aria-hidden="true" key={on ? "on-" + state.epoch + "-" + state.active : "off"} />
                        </li>
                    )
                })}
            </ol>
        </div>
    )
}

addPropertyControls(MHSteps, {
    group: { type: ControlType.String, title: "Group", defaultValue: "mh-how-it-works" },
    steps: {
        type: ControlType.Array,
        title: "Steps",
        control: {
            type: ControlType.Object,
            controls: {
                title: { type: ControlType.String, title: "Title" },
                text: { type: ControlType.String, title: "Text", displayTextArea: true },
            },
        },
        defaultValue: DEFAULT_STEPS,
    },
    duration: { type: ControlType.Number, title: "Step time", defaultValue: 7, min: 2, max: 20, step: 0.5, unit: "s" },
    fontFamily: { type: ControlType.String, title: "Font", defaultValue: "Host Grotesk" },
    numberColor: { type: ControlType.Color, title: "Number", defaultValue: "#0A6FC7" },
    titleColor: { type: ControlType.Color, title: "Title", defaultValue: "#1F3957" },
    textColor: { type: ControlType.Color, title: "Text", defaultValue: "#4A6482" },
    cardColor: { type: ControlType.Color, title: "Card", defaultValue: "#FFFFFF" },
    hoverColor: { type: ControlType.Color, title: "Hover", defaultValue: "rgba(255, 255, 255, 0.5)" },
    lineColor: { type: ControlType.Color, title: "Line", defaultValue: "#0A6FC7" },
    radius: { type: ControlType.Number, title: "Radius", defaultValue: 12, min: 0, max: 40, unit: "px" },
    inset: { type: ControlType.Number, title: "Inset", defaultValue: 28, min: 8, max: 48, unit: "px" },
    numberColumn: { type: ControlType.Number, title: "Number col", defaultValue: 44, min: 24, max: 80, unit: "px" },
    titleMin: { type: ControlType.Number, title: "Title min", defaultValue: 20, min: 12, max: 48, unit: "px" },
    titleVw: { type: ControlType.Number, title: "Title vw", defaultValue: 1.6, min: 0, max: 8, step: 0.05 },
    titleMax: { type: ControlType.Number, title: "Title max", defaultValue: 28, min: 12, max: 64, unit: "px" },
    numberMin: { type: ControlType.Number, title: "Number min", defaultValue: 14, min: 10, max: 32, unit: "px" },
    numberVw: { type: ControlType.Number, title: "Number vw", defaultValue: 1, min: 0, max: 4, step: 0.05 },
    numberMax: { type: ControlType.Number, title: "Number max", defaultValue: 17, min: 10, max: 32, unit: "px" },
    textSize: { type: ControlType.Number, title: "Text size", defaultValue: 16, min: 12, max: 24, unit: "px" },
})

/* ---------- The photo ---------- */
type ImageValue = string | { src?: string; srcSet?: string; alt?: string } | null | undefined
interface PhotosProps {
    group?: string
    image1?: ImageValue
    image2?: ImageValue
    image3?: ImageValue
    y1?: number
    y2?: number
    y3?: number
    duration?: number
    radius?: number
    background?: string
    style?: React.CSSProperties
}

const PHOTOS = [
    // Magnific (Nano Banana 2.1, 4K 4:3), the hero's home man; AI-generated person
    "https://framerusercontent.com/images/GSsDx7oouluKhchbDOhCY6ZvALM.webp",
    "https://framerusercontent.com/images/OQXSE7TF3b2iC16fsW8KdZUhyC4.webp",
    "https://framerusercontent.com/images/JvcWz84wBykOF4a7MIpT9RXf8U.webp",
]
const srcOf = (img: ImageValue, i: number) => {
    if (typeof img === "string" && img) return { src: img, srcSet: undefined as string | undefined }
    if (img && typeof img === "object" && img.src) return { src: img.src, srcSet: img.srcSet }
    return { src: PHOTOS[i], srcSet: undefined as string | undefined }
}

const PHOTOS_CSS = [
    ".mhp{position:relative;overflow:hidden;isolation:isolate}",
    ".mhp__shot{position:absolute;inset:0;margin:0;opacity:0;transition:opacity 0s 900ms}",
    ".mhp__shot.is-active{z-index:1;opacity:1;transition:opacity 900ms " + EASE + "}",
    ".mhp__photo{position:absolute;inset:0;display:block;width:100%;height:100%;object-fit:cover;transform:scale(1);transition:transform 0s 900ms}",
    ".mhp.is-live .mhp__shot.is-active .mhp__photo{transform:scale(1.04);transition:transform var(--mhp-push) cubic-bezier(0.3, 0.2, 0.4, 1)}",
    "@media (prefers-reduced-motion: reduce){.mhp__shot,.mhp__shot.is-active{transition:opacity 200ms linear}.mhp.is-live .mhp__photo,.mhp.is-live .mhp__shot.is-active .mhp__photo{transform:none;transition:none}}",
].join("\n")

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */
export function MHStepPhotos(props: PhotosProps) {
    const { group = "mh-how-it-works", image1, image2, image3, y1 = 35, y2 = 30, y3 = 30, duration = 7, radius = 12, background = "#DFE4EA", style } = props
    const live = isLive()
    const state = useGroup(group)
    const active = live ? Math.min(state.active, 2) : 0
    const imgs = [image1, image2, image3].map(srcOf)
    const ys = [y1, y2, y3]
    return (
        <div
            className={"mhp" + (live ? " is-live" : "")}
            aria-hidden="true"
            style={{ ...style, borderRadius: radius, background, ["--mhp-push" as any]: duration + 2 + "s" }}
        >
            <style>{PHOTOS_CSS}</style>
            {imgs.map((img, i) => (
                <figure key={i} className={"mhp__shot" + (i === active ? " is-active" : "")}>
                    <img className="mhp__photo" src={img.src} srcSet={img.srcSet} sizes="(min-width: 1200px) 50vw, 100vw" alt="" loading={i === 0 ? "eager" : "lazy"} decoding="async" style={{ objectPosition: "50% " + ys[i] + "%" }} />
                </figure>
            ))}
        </div>
    )
}

addPropertyControls(MHStepPhotos, {
    group: { type: ControlType.String, title: "Group", defaultValue: "mh-how-it-works" },
    image1: { type: ControlType.ResponsiveImage, title: "Photo 1" },
    y1: { type: ControlType.Number, title: "Photo 1 y", defaultValue: 35, min: 0, max: 100, unit: "%" },
    image2: { type: ControlType.ResponsiveImage, title: "Photo 2" },
    y2: { type: ControlType.Number, title: "Photo 2 y", defaultValue: 30, min: 0, max: 100, unit: "%" },
    image3: { type: ControlType.ResponsiveImage, title: "Photo 3" },
    y3: { type: ControlType.Number, title: "Photo 3 y", defaultValue: 30, min: 0, max: 100, unit: "%" },
    duration: { type: ControlType.Number, title: "Step time", defaultValue: 7, min: 2, max: 20, step: 0.5, unit: "s" },
    radius: { type: ControlType.Number, title: "Radius", defaultValue: 12, min: 0, max: 40, unit: "px" },
    background: { type: ControlType.Color, title: "Background", defaultValue: "#DFE4EA" },
})
