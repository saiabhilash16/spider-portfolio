import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { education, profile } from '../data/content'
import { asset, reducedMotion } from './shared'

gsap.registerPlugin(ScrollTrigger)

export const CTA = "LET'S SAVE THE WORLD."
export const CTA_SUB = 'Every great story starts with a connection.'
export const RESUME_URL = `${import.meta.env.BASE_URL}resume.pdf`   // place your PDF at public/resume.pdf

/** The resume (public/resume.pdf, phone number removed) ships with the site, so the button is always shown. */
export function useResume() { return true }

/* FINAL SCENE — the ending of the movie, and the site's contact section (#contact). */
export function FinalScene({ id = 'contact', headingId = 'contact-title' }: { id?: string; headingId?: string }) {
  const root = useRef<HTMLElement>(null)
  const resume = useResume()

  useLayoutEffect(() => {
    if (!root.current || reducedMotion()) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top 70%', toggleActions: 'play none none reverse' } })
      tl.fromTo('.fs-plate', { scale: 1.18, opacity: 0 }, { scale: 1.04, opacity: 1, duration: 2.2, ease: 'power2.out' })
        .fromTo('.fs-ch', { yPercent: 120, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1, stagger: .035, ease: 'power4.out' }, .3)
        .fromTo('.fs-glitch', { opacity: 0 }, { opacity: 1, duration: .06, repeat: 3, yoyo: true }, .9)
        .fromTo('.fs-sub', { opacity: 0, y: 16, filter: 'blur(8px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1 }, 1)
        .fromTo('.fs-opt', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .7, stagger: .08, ease: 'power3.out' }, 1.25)
      // slow camera drift over the city while the section is on screen
      gsap.fromTo('.fs-plate', { yPercent: -4 }, { yPercent: 4, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true } })
    }, root)
    return () => ctx.revert()
  }, [])

  const words = CTA.split(' ')
  const opts = [
    { k: 'EMAIL', v: profile.email, href: `mailto:${profile.email}`, ext: false },
    { k: 'LINKEDIN', v: 'in/abhilashm716', href: profile.linkedin, ext: true },
    { k: 'GITHUB', v: 'saiabhilash16', href: '', ext: false },          // name only, no link
    // the single-file preview carries the resume inside it (window.__slots) and downloads it from there
    ...(resume ? [{ k: 'RESUME', v: 'PDF', href: (window as any).__slots?.['resume.pdf'] ?? RESUME_URL, ext: true }] : []),
  ]
  return (
    <section ref={root} id={id} className="final relative isolate flex min-h-[100svh] items-center overflow-hidden bg-black py-[14vh] text-white" aria-labelledby={headingId}>
      {/* New York at night */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <img src={asset('skyline.jpg')} alt="" className="fs-plate absolute inset-0 h-full w-full object-cover" style={{ objectPosition: '50% 60%', filter: 'grayscale(.85) contrast(1.2) brightness(.62)' }} />
        <div className="halftone absolute inset-0 opacity-70" />
        <div className="fs-lights absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/30 to-black" />
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 26 }, (_, i) => (
            <span key={i} className="fs-mote" style={{ left: `${(i * 37) % 100}%`, top: 0, animationDuration: `${14 + (i * 7) % 16}s`, animationDelay: `${-(i * 3.1) % 20}s`, opacity: .35 + ((i * 13) % 50) / 100 }} />
          ))}
        </div>
        <div className="absolute inset-x-0 top-[52%] h-[30%] bg-[radial-gradient(60%_60%_at_50%_50%,rgba(0,0,0,.55),transparent_70%)]" />
      </div>

      <div className="relative mx-auto w-full max-w-[1500px] px-5 text-center sm:px-10">
        <h2 id={headingId} tabIndex={-1} aria-label={CTA} className="t1-display relative mx-auto max-w-[12ch] text-[clamp(64px,12.5vw,230px)] leading-[0.86] outline-none sm:max-w-none">
          <span aria-hidden className="relative inline-block t1-chroma-strong">
            {words.map((w, i) => (
              <span key={i} className="inline-block overflow-hidden whitespace-nowrap align-bottom pb-[0.04em]">
                {[...w].map((c, k) => <span key={k} className="fs-ch inline-block">{c}</span>)}{i < words.length - 1 ? ' ' : ''}
              </span>
            ))}
          </span>
          <span aria-hidden className="fs-glitch pointer-events-none absolute inset-0 translate-x-[3px] text-[#2f6bff] opacity-0 mix-blend-screen [clip-path:inset(42%_0_44%_0)]">{CTA}</span>
        </h2>
        <p className="fs-sub mx-auto mt-6 max-w-[30ch] font-cormorant text-[clamp(22px,2.4vw,36px)] italic text-[#e9e6e0]">{CTA_SUB}</p>

        <ul className={`mx-auto mt-12 grid max-w-[980px] grid-cols-1 gap-px bg-white/10 ${opts.length === 4 ? 'sm:grid-cols-4' : 'sm:grid-cols-3'}`} aria-label="Contact options">
          {opts.map((o) => (
            <li key={o.k} className="fs-opt bg-black/80">
              {o.href ? (
                <a href={o.href} {...(o.ext ? { target: '_blank', rel: 'noreferrer' } : {})} {...(o.href.startsWith('data:') ? { download: 'Sai_Abhilash_Mandava_Resume.pdf', target: undefined } : {})} className="group flex h-full flex-col items-center gap-2 px-4 py-6 transition hover:bg-[#e8202f]/15">
                  <span className="font-mono text-[10px] tracking-[0.35em] text-[#7aa2ff] group-hover:text-[#ff5a68]">{o.k}{o.ext ? ' ↗' : ''}</span>
                  <span className="break-all text-[13px] font-semibold text-white/85 sm:text-[14px]">{o.v}</span>
                </a>
              ) : (
                <div className="flex h-full flex-col items-center gap-2 px-4 py-6">
                  <span className="font-mono text-[10px] tracking-[0.35em] text-[#7aa2ff]">{o.k}</span>
                  <span className="break-all text-[13px] font-semibold text-white/85 sm:text-[14px]">{o.v}</span>
                </div>
              )}
            </li>
          ))}
        </ul>
        <p className="fs-opt mt-10 text-[12px] text-white/45">{education.degree} · {education.school} · {education.date}</p>
      </div>
    </section>
  )
}
