import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { prefersReducedMotion } from '../three/runtime'

/** A small original butterfly that flutters across when the Butterfly case study opens. */
export function Butterfly() {
  const el = useRef<SVGSVGElement>(null)
  useLayoutEffect(() => {
    if (!el.current || prefersReducedMotion) return
    const wings = el.current.querySelectorAll('.wing')
    const ctx = gsap.context(() => {
      gsap.to(wings, { scaleX: 0.25, duration: 0.14, yoyo: true, repeat: -1, ease: 'sine.inOut', transformOrigin: '50% 50%' })
      gsap.fromTo(el.current, { x: -80, y: 60, rotate: -20, opacity: 0 },
        { keyframes: [
            { x: 120, y: -10, rotate: 10, opacity: 1, duration: 1.1, ease: 'sine.inOut' },
            { x: 260, y: 20, rotate: -6, duration: 1.0, ease: 'sine.inOut' },
            { x: 340, y: -30, rotate: 8, duration: 1.0, ease: 'sine.inOut' },
          ] })
    }, el)
    return () => ctx.revert()
  }, [])
  return (
    <svg ref={el} width="54" height="44" viewBox="0 0 54 44" className="absolute top-6 left-6 pointer-events-none" aria-hidden>
      <defs>
        <linearGradient id="morpho" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#93C5FD" />
          <stop offset="0.55" stopColor="#3B82F6" />
          <stop offset="1" stopColor="#1E3A8A" />
        </linearGradient>
      </defs>
      <g className="wing">
        <path d="M27 22 C 14 2, 0 6, 4 18 C 6 26, 18 26, 27 22 Z" fill="url(#morpho)" />
        <path d="M27 22 C 18 28, 8 36, 14 40 C 20 43, 25 32, 27 22 Z" fill="#1D4ED8" />
        <path d="M27 22 C 40 2, 54 6, 50 18 C 48 26, 36 26, 27 22 Z" fill="url(#morpho)" />
        <path d="M27 22 C 36 28, 46 36, 40 40 C 34 43, 29 32, 27 22 Z" fill="#1D4ED8" />
      </g>
      <rect x="25.8" y="12" width="2.4" height="20" rx="1.2" fill="#1C1C1E" />
    </svg>
  )
}
