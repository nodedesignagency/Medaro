/* Added to the Framer project's Header.tsx (2026-11-28), next to withScrollLine: the same scroll hairline in the
   Men's Health navy, on the Header of the "Landing (Men's Health)" layout template. Framer code files can't import
   each other, so it is a copy of withScrollLine with the MH Line colour style (navy at 14%). */
import { forwardRef, useEffect, useRef, type ComponentType } from "react"

const LINE_MH = "var(--token-Ymf3sMSyb, rgba(31, 57, 87, 0.14))"

export function withScrollLineMH(Component: ComponentType<any>): ComponentType<any> {
    return forwardRef<any, any>(function ScrollLineMHOverride(props, ref) {
        const local = useRef<HTMLElement | null>(null)
        const setRef = (el: HTMLElement | null) => {
            local.current = el
            if (typeof ref === "function") ref(el)
            else if (ref) (ref as any).current = el
        }
        useEffect(() => {
            const el = local.current
            if (!el) return
            el.style.transition = "box-shadow 260ms cubic-bezier(0.22, 1, 0.36, 1)"
            let on: boolean | null = null
            const update = () => {
                const next = window.scrollY > 8
                if (next === on) return
                on = next
                el.style.boxShadow = next ? `0 1px 0 ${LINE_MH}` : "0 1px 0 transparent"
            }
            update()
            window.addEventListener("scroll", update, { passive: true })
            return () => window.removeEventListener("scroll", update)
        }, [])
        return <Component {...props} ref={setRef} />
    })
}
