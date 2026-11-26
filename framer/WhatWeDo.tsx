import { forwardRef, useEffect, useRef, type ComponentType } from "react"

/*
 * About · What We Do, as in the HTML (site/sections/about/what-we-do.css + main.js → reveal):
 * the first time a quarter of the row is on screen, the cards rise in one after another
 * (opacity 0 → 1, translateY 28px → 0, 800ms, 90ms apart) and each person rises into its card
 * a beat later (translateY 8% → 0, 1100ms, 90ms × i + 140ms). On hover the person grows 2% from
 * the card's foot (700ms). cubic-bezier(0.22, 1, 0.36, 1). Reduced motion: still.
 * On the Cards frame (its direct children are the cards; the person layer is named "Person").
 */
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)"

export function withWwdCards(Component: ComponentType<any>): ComponentType<any> {
    return forwardRef<any, any>(function WwdCardsOverride(props, ref) {
        const local = useRef<HTMLElement | null>(null)
        const setRef = (el: HTMLElement | null) => {
            local.current = el
            if (typeof ref === "function") ref(el)
            else if (ref) (ref as any).current = el
        }
        useEffect(() => {
            const row = local.current
            if (!row) return
            const cards = Array.from(row.children).filter((el): el is HTMLElement => el instanceof HTMLElement)
            const person = (card: HTMLElement) => card.querySelector('[data-framer-name="Person"]') as HTMLElement | null
            const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches
            const offs: Array<() => void> = []
            cards.forEach((card) => {
                const p = person(card)
                if (!p) return
                p.style.transformOrigin = "50% 100%"
                const enter = () => { if (still) return; p.style.transition = `transform 700ms ${EASE}`; p.style.transform = "scale(1.02)" }
                const leave = () => { p.style.transition = `transform 700ms ${EASE}`; p.style.transform = "" }
                card.addEventListener("pointerenter", enter)
                card.addEventListener("pointerleave", leave)
                offs.push(() => { card.removeEventListener("pointerenter", enter); card.removeEventListener("pointerleave", leave) })
            })
            if (still || !("IntersectionObserver" in window)) return () => offs.forEach((off) => off())
            cards.forEach((card) => {
                card.style.opacity = "0"
                card.style.transform = "translateY(28px)"
                const p = person(card)
                if (p) p.style.transform = "translateY(8%)"
            })
            const timers: number[] = []
            const io = new IntersectionObserver((entries) => {
                if (!entries.some((e) => e.isIntersecting)) return
                io.disconnect()
                cards.forEach((card, i) => {
                    const d = i * 90
                    card.style.transition = `opacity 800ms ${EASE} ${d}ms, transform 800ms ${EASE} ${d}ms`
                    card.style.opacity = "1"
                    card.style.transform = "translateY(0px)"
                    const p = person(card)
                    if (p) { p.style.transition = `transform 1100ms ${EASE} ${d + 140}ms`; p.style.transform = "translateY(0%)" }
                    timers.push(window.setTimeout(() => {
                        card.style.transition = ""
                        card.style.transform = ""
                        if (p && p.style.transform === "translateY(0%)") { p.style.transition = ""; p.style.transform = "" }
                    }, d + 1300))
                })
            }, { threshold: 0.25 })
            io.observe(row)
            return () => { io.disconnect(); timers.forEach((t) => window.clearTimeout(t)); offs.forEach((off) => off()) }
        }, [])
        return <Component {...props} ref={setRef} />
    })
}
