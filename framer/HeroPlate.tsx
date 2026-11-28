import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

/*
 * MEDARO · Weight Loss landing · hero V4: the sky plate and the couple, a 1:1
 * port of site/sections/weight-loss/hero--v4.css (.wlh4__media, .wlh4__sky,
 * .wlh4__person) on claude/youthful-noether-ftr6t5.
 *
 * The plate is one 2:1 photograph (v4-sky.webp) with the couple cut out of the
 * same render (v4-people.webp) and laid back exactly where they were shot, in %
 * of the plate. The box is a size container, so the plate can be sized like
 * the HTML:
 * - Size "Cover": width max(100cqw, ratio × 100cqh), the HTML's rule, so the
 *   plate always covers the box;
 * - Size "Fixed": width max(100cqw, ratio × Plate height), for tablet and
 *   phone, where the box is much taller than wide: the plate keeps a sensible
 *   height and sits at the box's foot, and the box's Background (the sky's top
 *   colour) carries the sky up behind the copy, with a soft fade over the seam.
 * Horizontally the plate's "Focus X" point sits on the box's "Align X" point
 * (100 / 100 = anchored to the right edge, as in the HTML), clamped so the
 * plate never leaves a gap at either side.
 * Decorative: aria-hidden, empty alt.
 */

interface Img {
    src?: string
    srcSet?: string
    alt?: string
}

interface Props {
    sky?: Img
    people?: Img
    ratio: number
    personLeft: number
    personTop: number
    personWidth: number
    personHeight: number
    size: "cover" | "fixed"
    plateHeight: number
    focusX: number
    alignX: number
    alignY: "center" | "bottom"
    background: string
    topFade: number
    style?: React.CSSProperties
}

/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight fixed
 */
export default function HeroPlate(props: Props) {
    const {
        sky,
        people,
        ratio = 2,
        personLeft = 59.556,
        personTop = 19.389,
        personWidth = 24.889,
        personHeight = 80.611,
        size = "cover",
        plateHeight = 600,
        focusX = 100,
        alignX = 100,
        alignY = "center",
        background = "#8aa59d",
        topFade = 0,
        style,
    } = props

    const W =
        size === "cover"
            ? "max(100cqw, " + ratio * 100 + "cqh)"
            : "max(100cqw, " + ratio * plateHeight + "px)"
    const H = "calc(" + W + " / " + ratio + ")"
    const left =
        "clamp(calc(100cqw - " + W + "), calc(" + alignX + "cqw - " + W + " * " + focusX / 100 + "), 0px)"
    const top = alignY === "bottom" ? "calc(100cqh - " + H + ")" : "calc(50cqh - " + H + " / 2)"

    return (
        <div
            aria-hidden="true"
            style={
                {
                    ...style,
                    position: "relative",
                    overflow: "hidden",
                    containerType: "size",
                    background,
                } as React.CSSProperties
            }
        >
            <div
                style={{
                    position: "absolute",
                    left,
                    top,
                    width: W,
                    height: H,
                }}
            >
                {sky?.src ? (
                    <img
                        src={sky.src}
                        srcSet={sky.srcSet}
                        sizes="(min-width: 1200px) 140vw, 300vw"
                        alt=""
                        draggable={false}
                        fetchPriority="high"
                        style={{
                            position: "absolute",
                            inset: 0,
                            width: "100%",
                            height: "100%",
                            display: "block",
                        }}
                    />
                ) : null}
                {people?.src ? (
                    <img
                        src={people.src}
                        srcSet={people.srcSet}
                        sizes="(min-width: 1200px) 36vw, 90vw"
                        alt=""
                        draggable={false}
                        style={{
                            position: "absolute",
                            left: personLeft + "%",
                            top: personTop + "%",
                            width: personWidth + "%",
                            height: personHeight + "%",
                            display: "block",
                        }}
                    />
                ) : null}
                {size === "fixed" && topFade > 0 ? (
                    <div
                        style={{
                            position: "absolute",
                            left: 0,
                            right: 0,
                            top: 0,
                            height: topFade,
                            background: "linear-gradient(" + background + ", transparent)",
                        }}
                    />
                ) : null}
            </div>
        </div>
    )
}

addPropertyControls(HeroPlate, {
    sky: { type: ControlType.ResponsiveImage, title: "Sky" },
    people: { type: ControlType.ResponsiveImage, title: "People" },
    size: {
        type: ControlType.Enum,
        title: "Size",
        options: ["cover", "fixed"],
        optionTitles: ["Cover", "Fixed"],
        defaultValue: "cover",
        displaySegmentedControl: true,
    },
    plateHeight: {
        type: ControlType.Number,
        title: "Plate height",
        min: 100,
        max: 3000,
        step: 1,
        unit: "px",
        defaultValue: 600,
        hidden: (p: Props) => p.size !== "fixed",
    },
    focusX: { type: ControlType.Number, title: "Focus X", min: 0, max: 100, step: 0.5, unit: "%", defaultValue: 100 },
    alignX: { type: ControlType.Number, title: "Align X", min: 0, max: 100, step: 0.5, unit: "%", defaultValue: 100 },
    alignY: {
        type: ControlType.Enum,
        title: "Align Y",
        options: ["center", "bottom"],
        optionTitles: ["Center", "Bottom"],
        defaultValue: "center",
        displaySegmentedControl: true,
    },
    background: { type: ControlType.Color, title: "Background", defaultValue: "#8aa59d" },
    topFade: {
        type: ControlType.Number,
        title: "Top fade",
        min: 0,
        max: 600,
        step: 1,
        unit: "px",
        defaultValue: 0,
        hidden: (p: Props) => p.size !== "fixed",
    },
    ratio: { type: ControlType.Number, title: "Plate ratio", min: 0.5, max: 4, step: 0.001, defaultValue: 2 },
    personLeft: { type: ControlType.Number, title: "Person left", min: 0, max: 100, step: 0.001, unit: "%", defaultValue: 59.556 },
    personTop: { type: ControlType.Number, title: "Person top", min: 0, max: 100, step: 0.001, unit: "%", defaultValue: 19.389 },
    personWidth: { type: ControlType.Number, title: "Person width", min: 0, max: 100, step: 0.001, unit: "%", defaultValue: 24.889 },
    personHeight: { type: ControlType.Number, title: "Person height", min: 0, max: 100, step: 0.001, unit: "%", defaultValue: 80.611 },
})
