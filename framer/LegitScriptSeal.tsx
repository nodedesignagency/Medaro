import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

/*
 * LegitScript seal (client, 2026-11-25), the code LegitScript gives for standard sites, as is:
 * the seal image loads from LegitScript (never a copy, so it always shows LegitScript's
 * current seal) and links to the site's validation page in a new tab. 73 × 79, never scaled
 * ("We do not recommend scaling the image via CSS as it may become hard to read").
 */

interface Props {
    href: string
    src: string
    title: string
    alt: string
    style?: React.CSSProperties
}

/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight fixed
 */
export default function LegitScriptSeal(props: Props) {
    const {
        href = "https://www.legitscript.com/websites/?checker_keywords=mymedaro.com",
        src = "https://static.legitscript.com/seals/52586936.png",
        title = "Verify LegitScript Approval for www.mymedaro.com",
        alt = "Verify Approval for www.mymedaro.com",
        style,
    } = props
    return (
        <a href={href} target="_blank" title={title} style={{ ...style, display: "block", width: 73, height: 79, lineHeight: 0 }}>
            <img src={src} alt={alt} width={73} height={79} style={{ display: "block", width: 73, height: 79 }} />
        </a>
    )
}

addPropertyControls(LegitScriptSeal, {
    href: { type: ControlType.String, title: "Link", defaultValue: "https://www.legitscript.com/websites/?checker_keywords=mymedaro.com" },
    src: { type: ControlType.String, title: "Seal URL", defaultValue: "https://static.legitscript.com/seals/52586936.png" },
    title: { type: ControlType.String, title: "Title", defaultValue: "Verify LegitScript Approval for www.mymedaro.com" },
    alt: { type: ControlType.String, title: "Alt", defaultValue: "Verify Approval for www.mymedaro.com" },
})
