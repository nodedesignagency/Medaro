import * as React from "react"
import { useId, useState } from "react"
import { addPropertyControls, ControlType } from "framer"

/*
 * MEDARO · Weight Loss landing · "One Price. Every Dose.": the switch and the
 * card, a 1:1 port of site/sections/weight-loss/pricing.css + pricing.js
 * (.wlprice__switch, .wlprice__card) on claude/youthful-noether-ftr6t5.
 * The heading, its line and the small print stay on the canvas.
 *
 * - The switch: a paper pill track, two radios (arrow keys switch), the chosen
 *   side an ink pill with lime words sliding between them (420ms).
 * - One white card in two halves. Left, the product on mist (first) or the
 *   buttons' lime (second), fading 520ms: name, the flattened vial (drop shadow
 *   baked into the image, so the image carries 157/1100 of padding round the
 *   render), "From", the price, the ticks. The chosen block fades in with a
 *   10px rise (420 / 560ms after 120ms); the other fades out (260ms).
 * - Right: the weight and the slider (ink up to the thumb, mist after), the
 *   result box filling the space, the CTA (a slot: the project's Button).
 * - The result is weight × the product's Rate, rounded. THE RATES ARE MOCK
 *   VALUES (user, 2026-11-27: "add random mock weight for now"): 0.15 and 0.20
 *   are placeholders, not client data; replace them with the client's figures
 *   and basis before the page goes live. With Rate 0 the result shows "XX".
 *   The client's own qualifier sits right under the figure.
 * - Sizes are the HTML's clamp()s with vw, so they match it at every width.
 *   The component is a container: under 860px wide the halves get tighter
 *   padding (tablet), under 600px they stack (phone).
 * - Reduced motion: no slide, no rise; colours and blocks change at once.
 */

const INK = "var(--token-aQt9fk7Bc, #343b29)"
const INK_SOFT = "var(--token-IpbJCbyFf, #5e6551)"
const ACCENT = "var(--token-epuFYn0ha, #d5e5ad)"
const MIST = "var(--token-g_3gOAZz6, #e7eadf)"
const PAPER = "var(--token-cn9KjIwvW, #f4f5ef)"
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)"
const PAD = 157 / 1100 // the vial image's baked shadow padding, as a share of the render's height

interface Img {
    src?: string
    srcSet?: string
    alt?: string
}

interface Props {
    nameA: string
    priceA: string
    rateA: number
    vialA?: Img
    nameB: string
    priceB: string
    rateB: number
    vialB?: Img
    ticks: string[]
    from: string
    legend: string
    weightLabel: string
    unit: string
    min: number
    max: number
    start: number
    resultLead: string
    resultWith: string
    qualifier: string
    cta?: React.ReactNode
    fontFamily: string
    style?: React.CSSProperties
}

const CSS = [
    ".wlpc{container-type:inline-size;container-name:wlpc;display:flex;flex-direction:column;align-items:center;width:100%;padding-top:clamp(32px,3vw,48px);font-family:var(--wlpc-ff);color:" + INK + ";-webkit-font-smoothing:antialiased}",
    ".wlpc *{box-sizing:border-box;margin:0}",
    // the switch
    ".wlpc-switch{position:relative;display:grid;grid-template-columns:1fr 1fr;padding:5px;border:0;border-radius:999px;background:" + PAPER + ";min-inline-size:0}",
    ".wlpc-switch legend{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;padding:0}",
    ".wlpc-switch input{position:absolute;opacity:0;pointer-events:none;width:1px;height:1px}",
    ".wlpc-switch label{position:relative;z-index:1;display:grid;place-items:center;min-width:188px;height:48px;padding:0 28px;border-radius:999px;font-size:17px;font-weight:500;letter-spacing:-0.01em;line-height:1;color:" + INK_SOFT + ";cursor:pointer;transition:color 260ms " + EASE + ";user-select:none}",
    ".wlpc-switch label:hover{color:" + INK + "}",
    ".wlpc-switch input:checked + label{color:" + ACCENT + "}",
    ".wlpc-switch input:focus-visible + label{outline:2px solid " + INK + ";outline-offset:3px}",
    ".wlpc-thumb{position:absolute;top:5px;bottom:5px;left:5px;width:calc(50% - 5px);border-radius:999px;background:" + INK + ";transition:transform 420ms " + EASE + "}",
    ".wlpc[data-product='b'] .wlpc-thumb{transform:translateX(100%)}",
    // the card
    ".wlpc-card{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));width:min(100%,1040px);margin-top:24px;overflow:hidden;border-radius:12px;background:#fff;color:" + INK + "}",
    ".wlpc-product{--panel:" + MIST + ";--tick-bg:" + ACCENT + ";--tick-ink:" + INK + ";position:relative;display:grid;background:var(--panel);transition:background-color 520ms " + EASE + "}",
    ".wlpc[data-product='b'] .wlpc-product{--panel:" + ACCENT + ";--tick-bg:" + INK + ";--tick-ink:" + ACCENT + "}",
    ".wlpc-item{grid-area:1/1;display:flex;flex-direction:column;align-items:center;padding:40px 40px 44px;text-align:center;transition:opacity 260ms ease-out,transform 260ms ease-out,visibility 0s linear 260ms}",
    ".wlpc-item:not(.is-on){opacity:0;transform:translateY(10px);visibility:hidden}",
    ".wlpc-item.is-on{transition:opacity 420ms " + EASE + " 120ms,transform 560ms " + EASE + " 120ms,visibility 0s}",
    ".wlpc-name{font-size:clamp(26px,2vw,32px);font-weight:500;line-height:1.1;letter-spacing:-0.02em}",
    ".wlpc-vial{--vh:clamp(240px,19.5vw,320px);display:block;height:calc(var(--vh) * (1 + 2 * " + PAD + "));width:auto;margin:calc(24px - var(--vh) * " + PAD + ") calc(var(--vh) * -" + PAD + ") calc(var(--vh) * -" + PAD + ");pointer-events:none;user-select:none}",
    ".wlpc-from{margin-top:24px;font-size:15px;line-height:1.5;color:" + INK_SOFT + "}",
    ".wlpc-price{margin-top:2px;font-size:clamp(36px,2.8vw,46px);font-weight:500;line-height:1.05;letter-spacing:-0.03em;font-variant-numeric:tabular-nums}",
    ".wlpc-ticks{display:grid;gap:10px;margin-top:24px;padding:0;list-style:none;text-align:left}",
    ".wlpc-ticks li{display:grid;grid-template-columns:22px 1fr;gap:12px;align-items:start;font-size:15px;line-height:1.45}",
    ".wlpc-tick{display:grid;place-items:center;width:22px;height:22px;margin-top:-1px;border-radius:50%;background:var(--tick-bg);color:var(--tick-ink);transition:background-color 520ms " + EASE + ",color 520ms " + EASE + "}",
    ".wlpc-tick svg{width:14px;height:14px;display:block}",
    // the calculator
    ".wlpc-calc{display:flex;flex-direction:column;padding:40px}",
    ".wlpc-weight{display:flex;align-items:baseline;justify-content:space-between;gap:16px}",
    ".wlpc-weight label{font-size:18px;font-weight:500;letter-spacing:-0.01em;line-height:1.5}",
    ".wlpc-weight output{font-size:clamp(44px,3.4vw,56px);font-weight:500;line-height:1;letter-spacing:-0.03em;font-variant-numeric:tabular-nums;white-space:nowrap}",
    ".wlpc-unit{margin-left:6px;font-size:16px;font-weight:400;letter-spacing:0;color:" + INK_SOFT + "}",
    ".wlpc-range{--fill:40%;width:100%;height:28px;margin:20px 0 36px;background:transparent;appearance:none;-webkit-appearance:none;cursor:pointer;display:block;padding:0}",
    ".wlpc-range::-webkit-slider-runnable-track{height:6px;border-radius:3px;background:linear-gradient(to right," + INK + " var(--fill)," + MIST + " var(--fill))}",
    ".wlpc-range::-moz-range-track{height:6px;border-radius:3px;background:" + MIST + "}",
    ".wlpc-range::-moz-range-progress{height:6px;border-radius:3px;background:" + INK + "}",
    ".wlpc-range::-webkit-slider-thumb{width:28px;height:28px;margin-top:-11px;border:2px solid " + INK + ";border-radius:50%;background:#fff;box-shadow:0 2px 6px rgb(38 43 30 / 0.18);-webkit-appearance:none;appearance:none;transition:transform 160ms " + EASE + "}",
    ".wlpc-range::-moz-range-thumb{width:24px;height:24px;border:2px solid " + INK + ";border-radius:50%;background:#fff;box-shadow:0 2px 6px rgb(38 43 30 / 0.18)}",
    ".wlpc-range:active::-webkit-slider-thumb{transform:scale(1.08)}",
    ".wlpc-range:focus-visible{outline:none}",
    ".wlpc-range:focus-visible::-webkit-slider-thumb{outline:2px solid " + INK + ";outline-offset:3px}",
    ".wlpc-range:focus-visible::-moz-range-thumb{outline:2px solid " + INK + ";outline-offset:3px}",
    ".wlpc-result{display:flex;flex-direction:column;align-items:center;justify-content:center;flex:1;padding:32px 24px 30px;border-radius:12px;background:" + MIST + ";text-align:center}",
    ".wlpc-lead{font-size:16px;line-height:1.5;color:" + INK_SOFT + "}",
    ".wlpc-value{margin-top:10px;font-size:clamp(52px,4.2vw,72px);font-weight:500;line-height:1;letter-spacing:-0.03em;font-variant-numeric:tabular-nums}",
    ".wlpc-value[data-empty]{color:color-mix(in srgb," + INK_SOFT + " 70%," + MIST + ")}",
    ".wlpc-with{margin-top:12px;font-size:18px;font-weight:500;letter-spacing:-0.01em;line-height:1.5}",
    ".wlpc-qualifier{max-width:30em;margin-top:14px;font-size:13px;line-height:1.45;color:" + INK_SOFT + ";text-wrap:pretty}",
    ".wlpc-cta{width:100%;margin-top:28px}",
    ".wlpc-cta > *{width:100% !important}",
    // tablet: the same two halves, tighter
    "@container wlpc (max-width: 860px){.wlpc-item{padding:32px 24px 36px}.wlpc-calc{padding:32px 28px}.wlpc-weight label{font-size:16px}.wlpc-ticks li{font-size:14px}}",
    // phone: stacked, the switch full width
    "@container wlpc (max-width: 600px){.wlpc-switch{width:100%;max-width:420px}.wlpc-switch label{min-width:0;padding:0 12px;font-size:16px}.wlpc-card{grid-template-columns:minmax(0,1fr)}.wlpc-item{padding:28px 22px 30px}.wlpc-vial{--vh:220px}.wlpc-calc{padding:26px 20px 22px}.wlpc-weight label{font-size:16px}.wlpc-range{margin:16px 0 24px}.wlpc-result{padding:26px 18px 24px}.wlpc-cta{margin-top:20px}}",
    "@media (prefers-reduced-motion: reduce){.wlpc-thumb,.wlpc-product,.wlpc-tick{transition:none}.wlpc-item,.wlpc-item.is-on{transform:none !important;transition:opacity 1ms,visibility 0s}}",
].join("\n")

function Check() {
    return (
        <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <path
                d="M3.5 8.4 6.6 11.4 12.5 4.8"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}

/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 */
export default function PricingCalculator(props: Props) {
    const {
        nameA = "Semaglutide",
        priceA = "$99/mo+",
        rateA = 0.15,
        vialA,
        nameB = "Tirzepatide",
        priceB = "$159/mo+",
        rateB = 0.2,
        vialB,
        ticks = [],
        from = "From",
        legend = "Choose a medication",
        weightLabel = "Your current weight",
        unit = "lbs",
        min = 120,
        max = 400,
        start = 200,
        resultLead = "You could lose up to",
        resultWith = "with",
        qualifier = "",
        cta,
        fontFamily = "Host Grotesk",
        style,
    } = props

    const uid = "wlpc" + useId().replace(/[^a-zA-Z0-9]/g, "")
    const [which, setWhich] = useState<"a" | "b">("a")
    const [weight, setWeight] = useState(() => Math.min(max, Math.max(min, start)))

    const products = [
        { key: "a" as const, name: nameA, price: priceA, rate: rateA, vial: vialA },
        { key: "b" as const, name: nameB, price: priceB, rate: rateB, vial: vialB },
    ]
    const current = products.find((p) => p.key === which) || products[0]
    const fill = max > min ? ((weight - min) / (max - min)) * 100 : 0
    const hasRate = Number.isFinite(current.rate) && current.rate > 0
    const result = hasRate ? String(Math.round(weight * current.rate)) : "XX"
    const ff = '"' + fontFamily + '", "Host Grotesk", "Helvetica Neue", Arial, sans-serif'

    return (
        <div
            className="wlpc"
            data-product={which}
            style={{ ...style, ["--wlpc-ff" as any]: ff }}
        >
            <style>{CSS}</style>

            <fieldset className="wlpc-switch">
                <legend>{legend}</legend>
                <span className="wlpc-thumb" aria-hidden="true" />
                {products.map((p) => (
                    <React.Fragment key={p.key}>
                        <input
                            type="radio"
                            id={uid + "-" + p.key}
                            name={uid + "-product"}
                            value={p.key}
                            checked={which === p.key}
                            onChange={() => setWhich(p.key)}
                        />
                        <label htmlFor={uid + "-" + p.key}>{p.name}</label>
                    </React.Fragment>
                ))}
            </fieldset>

            <div className="wlpc-card">
                <div className="wlpc-product">
                    {products.map((p) => (
                        <div
                            key={p.key}
                            className={"wlpc-item" + (p.key === which ? " is-on" : "")}
                            aria-hidden={p.key === which ? undefined : true}
                        >
                            <h3 className="wlpc-name">{p.name}</h3>
                            {p.vial?.src ? (
                                <img
                                    className="wlpc-vial"
                                    src={p.vial.src}
                                    srcSet={p.vial.srcSet}
                                    sizes="(min-width: 600px) 160px, 140px"
                                    alt=""
                                    draggable={false}
                                    loading="lazy"
                                />
                            ) : null}
                            <p className="wlpc-from">{from}</p>
                            <p className="wlpc-price">{p.price}</p>
                            <ul className="wlpc-ticks">
                                {ticks.map((t, i) => (
                                    <li key={i}>
                                        <span className="wlpc-tick" aria-hidden="true">
                                            <Check />
                                        </span>
                                        {t}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="wlpc-calc">
                    <div className="wlpc-weight">
                        <label htmlFor={uid + "-weight"}>{weightLabel}</label>
                        <output htmlFor={uid + "-weight"}>
                            <span>{weight}</span>
                            <span className="wlpc-unit">{unit}</span>
                        </output>
                    </div>
                    <input
                        className="wlpc-range"
                        type="range"
                        id={uid + "-weight"}
                        min={min}
                        max={max}
                        step={1}
                        value={weight}
                        aria-valuetext={weight + " pounds"}
                        onChange={(e) => setWeight(Number(e.currentTarget.value))}
                        style={{ ["--fill" as any]: fill + "%" }}
                    />
                    <div className="wlpc-result" aria-live="polite">
                        <p className="wlpc-lead">{resultLead}</p>
                        <p className="wlpc-value" data-empty={hasRate ? undefined : ""}>
                            <span>{result}</span>
                            <span className="wlpc-unit">{unit}</span>
                        </p>
                        <p className="wlpc-with">
                            {resultWith} <span>{current.name}</span>
                        </p>
                        {qualifier ? <p className="wlpc-qualifier">{qualifier}</p> : null}
                    </div>
                    {cta ? <div className="wlpc-cta">{cta}</div> : null}
                </div>
            </div>
        </div>
    )
}

addPropertyControls(PricingCalculator, {
    nameA: { type: ControlType.String, title: "Name 1", defaultValue: "Semaglutide" },
    priceA: { type: ControlType.String, title: "Price 1", defaultValue: "$99/mo+" },
    rateA: {
        type: ControlType.Number,
        title: "Rate 1 (MOCK)",
        description: "Share of body weight shown as the result. 0.15 is a MOCK value: replace with the client's figure.",
        min: 0,
        max: 1,
        step: 0.01,
        defaultValue: 0.15,
    },
    vialA: { type: ControlType.ResponsiveImage, title: "Vial 1" },
    nameB: { type: ControlType.String, title: "Name 2", defaultValue: "Tirzepatide" },
    priceB: { type: ControlType.String, title: "Price 2", defaultValue: "$159/mo+" },
    rateB: {
        type: ControlType.Number,
        title: "Rate 2 (MOCK)",
        description: "0.20 is a MOCK value: replace with the client's figure.",
        min: 0,
        max: 1,
        step: 0.01,
        defaultValue: 0.2,
    },
    vialB: { type: ControlType.ResponsiveImage, title: "Vial 2" },
    ticks: {
        type: ControlType.Array,
        title: "Ticks",
        control: { type: ControlType.String, displayTextArea: true },
        defaultValue: [
            "Clear, upfront pricing with no unexpected surprises.",
            "Licensed medical providers guiding your treatment.",
            "Fast, discreet medication delivery when prescribed and available.",
        ],
    },
    from: { type: ControlType.String, title: "From", defaultValue: "From" },
    legend: { type: ControlType.String, title: "Switch label", defaultValue: "Choose a medication" },
    weightLabel: { type: ControlType.String, title: "Weight label", defaultValue: "Your current weight" },
    unit: { type: ControlType.String, title: "Unit", defaultValue: "lbs" },
    min: { type: ControlType.Number, title: "Min", defaultValue: 120, min: 0, max: 1000, step: 1 },
    max: { type: ControlType.Number, title: "Max", defaultValue: 400, min: 0, max: 1000, step: 1 },
    start: { type: ControlType.Number, title: "Start", defaultValue: 200, min: 0, max: 1000, step: 1 },
    resultLead: { type: ControlType.String, title: "Result lead", defaultValue: "You could lose up to" },
    resultWith: { type: ControlType.String, title: "Result with", defaultValue: "with" },
    qualifier: {
        type: ControlType.String,
        title: "Qualifier",
        displayTextArea: true,
        defaultValue:
            "Weight-loss results vary by person, medication, adherence, and other health factors. No specific amount or rate of weight loss can be guaranteed.",
    },
    cta: { type: ControlType.ComponentInstance, title: "CTA" },
    fontFamily: { type: ControlType.String, title: "Font", defaultValue: "Host Grotesk" },
})
