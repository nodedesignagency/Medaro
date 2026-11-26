import { forwardRef, useEffect, useRef, type ComponentType } from "react"

/*
 * Header hairline, as in the HTML (site/components/header.css → .site-header--plain.is-scrolled,
 * site/main.js → header): once the page has scrolled more than 8px, a 1px line shows under the
 * bar (box-shadow 0 1px 0, the Line colour style: ink at 14%), fading in and out over 260ms
 * cubic-bezier(0.22, 1, 0.36, 1). At the very top of the page there is no line.
 * On the Header frame of the Main layout template (all three breakpoints).
 */
const LINE = "var(--token-qZ0_8l5Po, rgba(52, 59, 41, 0.14))"

export function withScrollLine(Component: ComponentType<any>): ComponentType<any> {
    return forwardRef<any, any>(function ScrollLineOverride(props, ref) {
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
                el.style.boxShadow = next ? `0 1px 0 ${LINE}` : "0 1px 0 transparent"
            }
            update()
            window.addEventListener("scroll", update, { passive: true })
            return () => window.removeEventListener("scroll", update)
        }, [])
        return <Component {...props} ref={setRef} />
    })
}
