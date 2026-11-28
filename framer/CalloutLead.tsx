import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

/*
 * CalloutLead: the Men's Health science section's label line (site/sections/mens-health/science.css → .mhsci__lead and
 * .mhsci__curve, Nervana's callout), 1:1. Round dots 1.8px wide every 7px in the label's colour at 60%, counted from the
 * curve's start, then an 80 × 24 dotted curve (dasharray 0 7) that bends down (above the ampoule's middle) or up (below it)
 * and trails off. Side "Left" runs to the right with the curve at its right end; "Right" is mirrored. Extend: how far it
 * runs past its own box at the curve's end (into the gap, to just short of the glass). Bend "None": a plain dotted line.
 */
interface Props { side: "left" | "right"; bend: "down" | "up" | "none"; extend: number; color: string; style?: React.CSSProperties }

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight fixed
 */
export default function CalloutLead({ side, bend, extend, color, style }: Props) {
  const curve = bend === "none" ? 0 : 80
  const left = side === "left"
  const flip = left ? (bend === "up" ? "scaleY(-1)" : "none") : bend === "up" ? "scale(-1, -1)" : "scaleX(-1)"
  return (
    <div aria-hidden="true" style={{ ...style, position: "relative", overflow: "visible" }}>
      <div style={{
        position: "absolute", top: "50%", height: 2, marginTop: -1,
        left: left ? 0 : -extend, width: `calc(100% + ${extend}px)`,
        boxSizing: "border-box", color, opacity: 0.6,
        paddingRight: left ? curve : 0, paddingLeft: left ? 0 : curve,
        background: `radial-gradient(circle, currentColor 0.9px, transparent 1.2px) ${left ? "100%" : "0"} 50% / 7px 2px repeat-x`,
        backgroundClip: "content-box", backgroundOrigin: "content-box",
      }}>
        {curve ? (
          <svg viewBox="0 0 80 24" width={80} height={24} focusable="false" style={{
            position: "absolute", top: 0, [left ? "right" : "left"]: 0, overflow: "visible", fill: "none", stroke: "currentColor",
            strokeWidth: 2, strokeLinecap: "round", strokeDasharray: "0 7", transformOrigin: "50% 1px", transform: flip,
            WebkitMaskImage: "linear-gradient(to right, #000 30%, rgba(0, 0, 0, 0.2))", maskImage: "linear-gradient(to right, #000 30%, rgba(0, 0, 0, 0.2))",
          } as React.CSSProperties}>
            <path d="M3.5 1H24C48 1 64 5 79 19" />
          </svg>
        ) : null}
      </div>
    </div>
  )
}

CalloutLead.defaultProps = { side: "left", bend: "down", extend: 0, color: "#0A6FC7" }

addPropertyControls(CalloutLead, {
  side: { type: ControlType.Enum, title: "Side", options: ["left", "right"], optionTitles: ["Left", "Right"], defaultValue: "left" },
  bend: { type: ControlType.Enum, title: "Bend", options: ["down", "up", "none"], optionTitles: ["Down", "Up", "None"], defaultValue: "down" },
  extend: { type: ControlType.Number, title: "Extend", min: 0, max: 300, step: 1, defaultValue: 0 },
  color: { type: ControlType.Color, title: "Color", defaultValue: "#0A6FC7" },
})
