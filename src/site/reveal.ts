import { useLayoutEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { reducedMotion } from './shared'

gsap.registerPlugin(ScrollTrigger)

/** Scroll-driven reveals for every element tagged with data-rv inside `root`.
 *  title → characters rise · up → fade/rise · wipe → clip-path wipe (data-dir="l"|"r") · par → parallax drift */
export function useReveals(root: RefObject<HTMLElement | null>, deps: unknown[] = []) {
  useLayoutEffect(() => {
    if (!root.current || reducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-rv="title"]').forEach((el) => {
        gsap.from(el.querySelectorAll('.rv-ch'), { yPercent: 115, duration: 0.9, ease: 'power4.out', stagger: 0.025, scrollTrigger: { trigger: el, start: 'top 88%' } })
      })
      gsap.utils.toArray<HTMLElement>('[data-rv="up"]').forEach((el) => {
        gsap.from(el, { opacity: 0, y: 40, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' } })
      })
      gsap.utils.toArray<HTMLElement>('[data-rv="wipe"]').forEach((el) => {
        const r = el.dataset.dir === 'r'
        gsap.fromTo(el, { clipPath: r ? 'inset(0% 0% 0% 100%)' : 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.inOut', scrollTrigger: { trigger: el, start: 'top 80%' } })
      })
      gsap.utils.toArray<HTMLElement>('[data-rv="par"]').forEach((el) => {
        const k = Number(el.dataset.k ?? 12)
        gsap.fromTo(el, { yPercent: -k }, { yPercent: k, ease: 'none', scrollTrigger: { trigger: el.parentElement ?? el, start: 'top bottom', end: 'bottom top', scrub: true } })
      })
    }, root)
    requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
