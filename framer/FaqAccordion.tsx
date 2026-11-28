import * as React from "react"
import { addPropertyControls, ControlType, RenderTarget } from "framer"

/*
 * MEDARO · FAQ accordion (both landing pages). A 1:1 port of the approved HTML
 * (site/components/faq.css + faq.js, round 2 after the Mahadeva template's FAQ, in MEDARO's style):
 * rows between hairlines (the first with a rule on top too), 28px above and below the question
 * (Host Grotesk 400, clamp(20px, 1.6vw, 28px), −0.02em), the answer under it (clamp(16px, 1.12vw,
 * 18px), 1.55, muted, 60ch). One open at a time, the first open on arrival, clicking the open one
 * closes it. The mark is two 1 × 17px hairlines: the upright one quarter-turns onto the flat one
 * (plus → minus by moving) on the answer's clock (grid rows 0fr → 1fr, 560ms, cubic-bezier(0.65,
 * 0, 0.35, 1)). Buttons carry aria-expanded / aria-controls, answers are regions labelled by
 * their question; a closed answer is hidden from screen readers. Reduced motion: no travel.
 * Colours are controls (Weight Loss: the Scene styles, so the list follows the page's scenes).
 * Size: Desktop / Tablet / Phone, set per breakpoint on the instance.
 */

interface Item {
    question?: string
    answer?: string
}
type Size = "desktop" | "tablet" | "phone"
interface Props {
    items?: Item[]
    openFirst?: boolean
    size?: Size
    ink?: string
    muted?: string
    line?: string
    fontFamily?: string
    style?: React.CSSProperties
}

const DEFAULT_ITEMS: Item[] = [
    { question: "Do I need an in-person appointment?", answer: "Many steps can take place online. Your provider will determine whether a virtual evaluation is appropriate or whether additional testing or an in-person assessment is necessary." },
    { question: "Is a prescription guaranteed?", answer: "No. Prescriptions are issued only when a licensed healthcare provider determines that treatment is medically appropriate." },
    { question: "Does everyone qualify for GLP-1 treatment?", answer: "No. Eligibility depends on individual medical factors, prescribing criteria, and treatment availability." },
    { question: "Will I lose weight quickly?", answer: "Weight-loss results vary by person, medication, adherence, and other health factors. No specific amount or rate of weight loss can be guaranteed." },
    { question: "Can medication be delivered to my home?", answer: "When available and prescribed, medications may be fulfilled through a licensed pharmacy offering home delivery." },
    { question: "What if GLP-1 treatment isn’t right for me?", answer: "Your provider may discuss alternative weight-management approaches depending on your individual health needs." },
    { question: "Are GLP-1 medications safe?", answer: "FDA-approved GLP-1 medications have established prescribing information describing their benefits, risks, and approved uses. They can cause side effects and are not appropriate for everyone. A licensed healthcare provider should evaluate your medical history before treatment." },
]

const SIZES: Record<Size, Record<string, string>> = {
    desktop: { "--fq-q": "clamp(20px, calc(1.6 * var(--fq-vw)), 28px)", "--fq-a": "clamp(16px, calc(1.12 * var(--fq-vw)), 18px)", "--fq-pad": "28px", "--fq-gap": "24px" },
    tablet: { "--fq-q": "22px", "--fq-a": "17px", "--fq-pad": "26px", "--fq-gap": "24px" },
    phone: { "--fq-q": "19px", "--fq-a": "16px", "--fq-pad": "22px", "--fq-gap": "16px" },
}
const EASE_IO = "cubic-bezier(0.65, 0, 0.35, 1)"
const CSS = `
.mfaq{width:100%;color:var(--fq-ink);font-family:var(--fq-font);-webkit-font-smoothing:antialiased}
.mfaq *{box-sizing:border-box}
.mfaq__item{border-bottom:1px solid var(--fq-line)}
.mfaq__item:first-of-type{border-top:1px solid var(--fq-line)}
.mfaq__h{margin:0;font:inherit}
.mfaq__q{display:flex;align-items:center;justify-content:space-between;gap:var(--fq-gap);width:100%;margin:0;padding:var(--fq-pad) 0;border:0;background:none;color:var(--fq-ink);font-family:inherit;font-size:var(--fq-q);font-weight:400;line-height:1.2;letter-spacing:-0.02em;text-align:left;cursor:pointer;user-select:none;-webkit-tap-highlight-color:transparent}
.mfaq__q:focus-visible{outline:2px solid currentColor;outline-offset:6px;border-radius:2px}
.mfaq__mark{position:relative;flex:none;width:24px;height:24px}
.mfaq__mark::before,.mfaq__mark::after{content:"";position:absolute;left:50%;top:50%;width:1px;height:17px;margin:-8.5px 0 0 -0.5px;border-radius:1px;background:currentColor}
.mfaq__mark::before{transform:rotate(90deg)}
.mfaq__mark::after{transition:transform 560ms ${EASE_IO}}
.mfaq__q[aria-expanded="true"] .mfaq__mark::after{transform:rotate(90deg)}
.mfaq__a{display:grid;grid-template-rows:0fr;transition:grid-template-rows 560ms ${EASE_IO}}
.mfaq__a.is-open{grid-template-rows:1fr}
.mfaq__inner{min-height:0;overflow:hidden;visibility:hidden;transition:visibility 0s linear 560ms}
.mfaq__a.is-open .mfaq__inner{visibility:visible;transition-delay:0s}
.mfaq__p{max-width:60ch;margin:0;padding:0 0 var(--fq-pad);font-size:var(--fq-a);line-height:1.55;color:var(--fq-muted);text-wrap:pretty}
@media (prefers-reduced-motion: reduce){.mfaq__a,.mfaq__inner,.mfaq__mark::after{transition-duration:1ms}}
`

const useIsoLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 */
export default function FaqAccordion(props: Props) {
    const { items: itemsProp, openFirst = true, size = "desktop", ink = "#343B29", muted = "#5E6551", line = "rgba(52, 59, 41, 0.14)", fontFamily = "Host Grotesk", style } = props
    const items = itemsProp && itemsProp.length ? itemsProp : DEFAULT_ITEMS
    const isCanvas = RenderTarget.current() === RenderTarget.canvas
    const [open, setOpen] = React.useState<number>(openFirst ? 0 : -1)
    const uid = React.useId().replace(/[^a-zA-Z0-9_-]/g, "")
    const rootRef = React.useRef<HTMLDivElement>(null)
    const [canvasW, setCanvasW] = React.useState(718)

    React.useEffect(() => setOpen(openFirst ? 0 : -1), [openFirst])
    // In the canvas the vw units would read the editor's window: estimate the screen from the list's width (7 of 12 columns)
    useIsoLayoutEffect(() => {
        if (!isCanvas) return
        const el = rootRef.current
        if (!el || typeof ResizeObserver === "undefined") return
        const ro = new ResizeObserver(() => setCanvasW(el.offsetWidth || 718))
        ro.observe(el)
        setCanvasW(el.offsetWidth || 718)
        return () => ro.disconnect()
    }, [isCanvas])

    const vars: Record<string, string> = {
        ...SIZES[size],
        "--fq-vw": isCanvas ? `${((canvasW * 2) / 100).toFixed(3)}px` : "1vw",
        "--fq-ink": ink,
        "--fq-muted": muted,
        "--fq-line": line,
        "--fq-font": `"${fontFamily}", "Host Grotesk Placeholder", sans-serif`,
    }

    return (
        <div ref={rootRef} className="mfaq" style={{ ...style, ...(vars as React.CSSProperties) }}>
            <style dangerouslySetInnerHTML={{ __html: CSS }} />
            {items.map((it, i) => {
                const isOpen = open === i
                const qId = `mfaq-${uid}-q${i}`
                const aId = `mfaq-${uid}-a${i}`
                return (
                    <div className="mfaq__item" key={i}>
                        <h3 className="mfaq__h">
                            <button type="button" className="mfaq__q" id={qId} aria-expanded={isOpen} aria-controls={aId} onClick={() => setOpen(isOpen ? -1 : i)}>
                                <span>{it.question}</span>
                                <span className="mfaq__mark" aria-hidden="true" />
                            </button>
                        </h3>
                        <div className={isOpen ? "mfaq__a is-open" : "mfaq__a"} id={aId} role="region" aria-labelledby={qId}>
                            <div className="mfaq__inner">
                                <p className="mfaq__p">{it.answer}</p>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

addPropertyControls(FaqAccordion, {
    items: {
        type: ControlType.Array,
        title: "Questions",
        control: {
            type: ControlType.Object,
            controls: {
                question: { type: ControlType.String, title: "Question" },
                answer: { type: ControlType.String, title: "Answer", displayTextArea: true },
            },
        },
        defaultValue: DEFAULT_ITEMS,
    },
    openFirst: { type: ControlType.Boolean, title: "First open", defaultValue: true },
    size: { type: ControlType.Enum, title: "Size", options: ["desktop", "tablet", "phone"], optionTitles: ["Desktop", "Tablet", "Phone"], defaultValue: "desktop" },
    ink: { type: ControlType.Color, title: "Ink", defaultValue: "#343B29" },
    muted: { type: ControlType.Color, title: "Muted", defaultValue: "#5E6551" },
    line: { type: ControlType.Color, title: "Line", defaultValue: "rgba(52, 59, 41, 0.14)" },
    fontFamily: { type: ControlType.String, title: "Font", defaultValue: "Host Grotesk" },
})
