import * as React from "react"
import { addPropertyControls, ControlType, RenderTarget } from "framer"

/*
 * About · Our Mission heading, a 1:1 port of site/sections/about/mission--v1.css + main.js → reveal.
 * One h2, one phrase per line, with two illustrated icons set bare between the words
 * ("Better ♥ care." / "Fewer barriers." / "More ☀ possibilities."). The icons start shut
 * (0 wide, the two spaces pulled together by -0.13em margins); the first time a quarter of
 * the heading is on screen each icon box opens to 0.92em over 900ms, the words part, and the
 * icon grows from a quarter size, turning from tilt − 24° to its resting tilt (opacity 400ms),
 * 160ms apart after 120ms. Ease cubic-bezier(0.22, 1, 0.36, 1). Once.
 * Size: clamp(Min, (component width + Inset) × Size%, Max), i.e. the HTML's
 * clamp(56px, 6.6vw, 128px) when Inset is the head's side padding (64 + 64 on desktop).
 * Canvas: shown open. Reduced motion: shown at once, no transition. The icons are aria-hidden;
 * the words (with their real spaces) are the heading's text.
 */

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)"

type Img = { src?: string; srcSet?: string; alt?: string } | undefined

interface Props {
    line1Start: string
    line1End: string
    line2: string
    line3Start: string
    line3End: string
    icon1?: Img
    icon2?: Img
    tilt1: number
    tilt2: number
    font?: React.CSSProperties
    min: number
    size: number
    max: number
    inset: number
    lineHeight: number
    tracking: number
    color: string
    style?: React.CSSProperties
}

function Icon({ img, index, tilt, open, still }: { img: Img; index: number; tilt: number; open: boolean; still: boolean }) {
    const delay = index * 160 + 120
    const t = still ? "none" : undefined
    return (
        <span
            aria-hidden="true"
            style={{
                display: "inline-block",
                width: open ? "0.92em" : 0,
                height: "0.92em",
                marginLeft: open ? "0.02em" : "-0.13em",
                marginRight: open ? "0.02em" : "-0.13em",
                verticalAlign: "-0.12em",
                transition: t ?? `width 900ms ${EASE} ${delay}ms, margin 900ms ${EASE} ${delay}ms`,
            }}
        >
            {img?.src ? (
                <img
                    src={img.src}
                    srcSet={img.srcSet}
                    alt=""
                    draggable={false}
                    style={{
                        display: "block",
                        width: "0.92em",
                        height: "100%",
                        maxWidth: "none",
                        objectFit: "contain",
                        transform: open ? `rotate(${tilt}deg)` : `scale(0.25) rotate(${tilt - 24}deg)`,
                        opacity: open ? 1 : 0,
                        transition: t ?? `transform 900ms ${EASE} ${delay}ms, opacity 400ms ${EASE} ${delay}ms`,
                    }}
                />
            ) : null}
        </span>
    )
}

/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 */
export default function MissionTitle(props: Props) {
    const {
        line1Start = "Better",
        line1End = "care.",
        line2 = "Fewer barriers.",
        line3Start = "More",
        line3End = "possibilities.",
        icon1,
        icon2,
        tilt1 = -8,
        tilt2 = 6,
        font,
        min = 56,
        size = 6.6,
        max = 128,
        inset = 128,
        lineHeight = 1.02,
        tracking = -0.047,
        color = "#343B29",
        style,
    } = props
    const ref = React.useRef<HTMLHeadingElement>(null)
    const isCanvas = RenderTarget.current() === RenderTarget.canvas
    const [open, setOpen] = React.useState(isCanvas)
    const [still, setStill] = React.useState(isCanvas)

    React.useEffect(() => {
        if (isCanvas) return
        const el = ref.current
        if (!el) return
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        if (reduced || !("IntersectionObserver" in window)) {
            setStill(reduced)
            setOpen(true)
            return
        }
        const io = new IntersectionObserver(
            (entries) => {
                if (entries.some((e) => e.isIntersecting)) {
                    setOpen(true)
                    io.disconnect()
                }
            },
            { threshold: 0.25 }
        )
        io.observe(el)
        return () => io.disconnect()
    }, [isCanvas])

    const line: React.CSSProperties = { display: "block" }

    return (
        <div style={{ ...style, containerType: "inline-size" } as React.CSSProperties}>
            <h2
                ref={ref}
                style={{
                    margin: 0,
                    fontWeight: 400,
                    ...font,
                    fontSize: `clamp(${min}px, calc((100cqw + ${inset}px) * ${size / 100}), ${max}px)`,
                    lineHeight,
                    letterSpacing: `${tracking}em`,
                    textAlign: "center",
                    color,
                }}
            >
                <span style={line}>
                    {line1Start} <Icon img={icon1} index={0} tilt={tilt1} open={open} still={still} /> {line1End}
                </span>
                <span style={line}>{line2}</span>
                <span style={line}>
                    {line3Start} <Icon img={icon2} index={1} tilt={tilt2} open={open} still={still} /> {line3End}
                </span>
            </h2>
        </div>
    )
}

addPropertyControls(MissionTitle, {
    line1Start: { type: ControlType.String, title: "Line 1", defaultValue: "Better" },
    icon1: { type: ControlType.ResponsiveImage, title: "Icon 1" },
    tilt1: { type: ControlType.Number, title: "Tilt 1", defaultValue: -8, min: -45, max: 45, step: 1, unit: "°" },
    line1End: { type: ControlType.String, title: "Line 1 end", defaultValue: "care." },
    line2: { type: ControlType.String, title: "Line 2", defaultValue: "Fewer barriers." },
    line3Start: { type: ControlType.String, title: "Line 3", defaultValue: "More" },
    icon2: { type: ControlType.ResponsiveImage, title: "Icon 2" },
    tilt2: { type: ControlType.Number, title: "Tilt 2", defaultValue: 6, min: -45, max: 45, step: 1, unit: "°" },
    line3End: { type: ControlType.String, title: "Line 3 end", defaultValue: "possibilities." },
    font: { type: ControlType.Font, title: "Font", controls: "basic", defaultFontType: "sans-serif" },
    min: { type: ControlType.Number, title: "Min", defaultValue: 56, min: 12, max: 200, step: 1, unit: "px" },
    size: { type: ControlType.Number, title: "Size", defaultValue: 6.6, min: 1, max: 20, step: 0.1, unit: "%", description: "Of the screen width (component width + Inset)" },
    max: { type: ControlType.Number, title: "Max", defaultValue: 128, min: 12, max: 240, step: 1, unit: "px" },
    inset: { type: ControlType.Number, title: "Inset", defaultValue: 128, min: 0, max: 400, step: 1, unit: "px" },
    lineHeight: { type: ControlType.Number, title: "Line height", defaultValue: 1.02, min: 0.8, max: 2, step: 0.01 },
    tracking: { type: ControlType.Number, title: "Tracking", defaultValue: -0.047, min: -0.2, max: 0.2, step: 0.001, unit: "em" },
    color: { type: ControlType.Color, title: "Color", defaultValue: "#343B29" },
})
