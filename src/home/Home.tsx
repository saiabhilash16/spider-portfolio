import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { caseStudies, profile, projects } from '../data/content'
import { Defs, World } from './Artwork'

gsap.registerPlugin(ScrollTrigger)

/* =====================================================================================
 *  HOMEPAGE — cinematic noir intro (route #/).
 *  One pinned scene; scroll drives a "camera" through layered vector artwork:
 *    sky / halo / far skyline / giant word / mid skyline+neon / near rooftops / hero
 *  + canvas rain & embers, live glitch strips (<use href="#world">), editorial type,
 *    lighting transition, and chapter cards that lead into the rest of the portfolio.
 * ===================================================================================== */

const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* ---------- rain + embers (canvas, parallax by depth) ---------- */
function useParticles(canvas: React.RefObject<HTMLCanvasElement | null>, speed: React.MutableRefObject<number>) {
  useEffect(() => {
    const c = canvas.current; if (!c || reduced) return
    const g = c.getContext('2d')!
    const dpr = Math.min(devicePixelRatio, 1.5)
    let W = 0, H = 0
    const resize = () => { W = c.width = innerWidth * dpr; H = c.height = innerHeight * dpr }
    resize(); addEventListener('resize', resize)
    const mobile = innerWidth < 768
    const rain = Array.from({ length: mobile ? 90 : 220 }, () => ({ x: Math.random(), y: Math.random(), z: .3 + Math.random() * .7 }))
    const embers = Array.from({ length: mobile ? 22 : 50 }, () => ({ x: Math.random(), y: Math.random(), z: .4 + Math.random() * .6, p: Math.random() * 6.28 }))
    let raf = 0, last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, .05); last = now
      g.clearRect(0, 0, W, H)
      const boost = 1 + speed.current * 3
      g.lineCap = 'round'
      for (const d of rain) {
        d.y += dt * (1.1 + d.z * 1.6) * boost; d.x += dt * .12 * d.z
        if (d.y > 1.05) { d.y = -.05; d.x = Math.random() }
        if (d.x > 1) d.x -= 1
        const len = (10 + d.z * 26) * dpr * boost
        g.strokeStyle = `rgba(255,${150 + d.z * 60},${170 + d.z * 60},${.06 + d.z * .16})`
        g.lineWidth = d.z * 1.4 * dpr
        g.beginPath(); g.moveTo(d.x * W, d.y * H); g.lineTo(d.x * W - len * .14, d.y * H - len); g.stroke()
      }
      for (const e of embers) {
        e.y -= dt * .04 * (1 + e.z) * boost; e.p += dt * 2
        if (e.y < -.05) { e.y = 1.05; e.x = Math.random() }
        const x = (e.x + Math.sin(e.p) * .006) * W, y = e.y * H, r = (1 + e.z * 2.4) * dpr
        const a = .35 + .45 * Math.sin(e.p * 1.7)
        g.fillStyle = `rgba(255,${60 + e.z * 60},80,${Math.max(0, a) * e.z})`
        g.shadowColor = '#ff2d4d'; g.shadowBlur = 12 * dpr
        g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill()
      }
      g.shadowBlur = 0
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', resize) }
  }, [canvas, speed])
}

export function Home() {
  const root = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const particles = useRef<HTMLCanvasElement>(null)
  const scrollSpeed = useRef(0)
  const [mobile, setMobile] = useState(() => typeof window !== 'undefined' && innerWidth < 768)
  const [progress, setProgress] = useState(0)
  useParticles(particles, scrollSpeed)

  useEffect(() => {
    document.title = 'Sai Abhilash Mandava — UI/UX Software Engineer'
    window.scrollTo(0, 0)
    const on = () => setMobile(innerWidth < 768)
    addEventListener('resize', on); return () => removeEventListener('resize', on)
  }, [])

  const heroX = mobile ? 800 : 1090

  useLayoutEffect(() => {
    const q = (s: string) => root.current!.querySelectorAll(s)
    const L = (n: string) => root.current!.querySelector(`[data-layer="${n}"]`)
    const ctx = gsap.context(() => {
      /* ---------------- 1. opening: lights flicker on, hero emerges, type reveals ---------------- */
      const open = gsap.timeline({ defaults: { ease: 'power3.out' } })
      if (!reduced) {
        open.from('.nx-svg', { opacity: 0, duration: 1.2 })
          // neon halo stutters on like a real tube
          .fromTo(L('ring'), { opacity: 0 }, { keyframes: [{ opacity: .8, duration: .06 }, { opacity: .1, duration: .1 }, { opacity: 1, duration: .05 }, { opacity: .3, duration: .12 }, { opacity: 1, duration: .5 }] }, .3)
          .from(L('hero'), { y: 60, opacity: 0, duration: 1.4, ease: 'expo.out' }, .6)
          .from(L('far'), { y: 40, duration: 2 }, 0)
          .from(L('mid'), { y: 70, duration: 2 }, 0)
          .from('.nx-eyebrow', { opacity: 0, x: -20, duration: .7 }, 1)
          .from('.nx-first', { yPercent: 110, duration: 1, ease: 'expo.out' }, 1.05)
          .from('.nx-last .nx-ch', { yPercent: 115, duration: 1, stagger: .04, ease: 'expo.out' }, 1.15)
          .from('.nx-role > *', { opacity: 0, y: 14, stagger: .08, duration: .6 }, 1.6)
          .from('.nx-cta > *', { opacity: 0, y: 14, stagger: .08, duration: .6 }, 1.8)
          .from('.nx-chrome', { opacity: 0, duration: 1 }, 1.4)
      }

      /* ---------------- 2. ambient life ---------------- */
      if (!reduced) {
        gsap.to('[data-coat="l"]', { skewX: 2.5, rotate: -1.2, duration: 2.6, yoyo: true, repeat: -1, ease: 'sine.inOut' })
        gsap.to('[data-coat="r"]', { skewX: -3.5, rotate: 1.6, duration: 2.2, yoyo: true, repeat: -1, ease: 'sine.inOut' })
        gsap.to(L('hero'), { y: -4, duration: 3, yoyo: true, repeat: -1, ease: 'sine.inOut' })
        q('[data-sign]').forEach((el, i) => {
          gsap.timeline({ repeat: -1, repeatDelay: 2 + i * 1.3, delay: i * .7 })
            .to(el, { opacity: .25, duration: .05 }).to(el, { opacity: 1, duration: .05 }).to(el, { opacity: .4, duration: .08 }).to(el, { opacity: 1, duration: .1 })
        })
        q('[data-blink]').forEach((el, i) => gsap.to(el, { opacity: .15, duration: .6, repeat: -1, yoyo: true, delay: i * .3, ease: 'steps(1)' }))
        // idle glitch bursts on the strips
        const burst = () => {
          if (scrollSpeed.current < .05) glitch(.5 + Math.random() * .4)
          gsap.delayedCall(2.8 + Math.random() * 3.2, burst)
        }
        gsap.delayedCall(3.2, burst)
      }

      /* ---------------- 3. mouse parallax ---------------- */
      const depth: [string, number][] = [['sky', 4], ['ring', 8], ['far', 10], ['word', 16], ['mid', 18], ['near', 34], ['hero', 26]]
      const movers = depth.map(([n, d]) => [gsap.quickTo(L(n), 'x', { duration: 1.2, ease: 'power3' }), d] as const)
      const onMove = (e: PointerEvent) => { const nx = e.clientX / innerWidth - .5; movers.forEach(([to, d]) => to(-nx * d)) }
      if (!reduced) addEventListener('pointermove', onMove)

      /* ---------------- 4. SCROLL CAMERA (pinned) ---------------- */
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: stage.current, start: 'top top', end: () => `+=${innerHeight * 2.4}`, pin: true, scrub: reduced ? true : 1.1,
          onUpdate: (st) => {
            setProgress(st.progress)
            scrollSpeed.current = Math.min(1, Math.abs(st.getVelocity()) / 2500)
          },
        },
      })
      const s = (n: string) => L(n)!
      tl
        // dolly in: each layer at its own depth
        .to(s('sky'), { scale: 1.06, transformOrigin: '50% 60%', duration: 1 }, 0)
        .to(s('ring'), { scale: 1.35, duration: .6 }, 0)
        .to(s('far'), { y: -28, scale: 1.05, transformOrigin: '50% 80%', duration: 1 }, 0)
        .to(s('word'), { xPercent: -14, opacity: .15, duration: .6 }, 0)
        .to(s('mid'), { y: -56, scale: 1.12, transformOrigin: '50% 90%', duration: 1 }, 0)
        .to(s('near'), { y: 120, scale: 1.35, transformOrigin: '50% 100%', duration: .7 }, 0)
        .to(s('hero'), { scale: reduced ? 1.05 : 1.32, y: 40, duration: .6, ease: 'power1.in' }, 0)
        // editorial type separates and leaves
        .to('.nx-first', { xPercent: -25, opacity: 0, duration: .35 }, .05)
        .to('.nx-last', { xPercent: 12, opacity: 0, duration: .4 }, .08)
        .to('.nx-role, .nx-cta, .nx-eyebrow', { y: -40, opacity: 0, duration: .25 }, .05)
        // lighting transition: the halo blows out, the city goes dark, then red light floods back
        .to('.nx-flash', { opacity: reduced ? 0 : .55, duration: .04 }, .48)
        .call(() => glitch(1), [], .48)
        .to('.nx-flash', { opacity: 0, duration: .08 }, .52)
        .to(s('far'), { opacity: .35, duration: .1 }, .5)
        .to('.nx-grade', { opacity: 1, duration: .25 }, .5)
        .to(s('hero'), { scale: reduced ? 1.05 : 1.12, y: 140, duration: .4, ease: 'power2.inOut' }, .55)
        // chapter cards rise in
        .fromTo('.nx-pathhead', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .12 }, .62)
        .fromTo('.nx-card', { opacity: 0, y: 80, rotateX: 18 }, { opacity: 1, y: 0, rotateX: 0, stagger: .06, duration: .18, ease: 'power3.out' }, .66)
        .to({}, { duration: .1 }, .9)
    }, root)

    /* glitch: 4 strips of the live world, offset + tinted, plus RGB-split on the type */
    function glitch(power: number) {
      if (reduced) return
      const strips = root.current!.querySelectorAll<SVGGElement>('.nx-strip')
      const tl = gsap.timeline()
      strips.forEach((st, i) => {
        const rect = st.querySelector('rect')!
        const y = Math.random() * 900, h = 8 + Math.random() * 70 * power
        rect.setAttribute('y', String(y)); rect.setAttribute('height', String(h))
        tl.set(st, { opacity: 1, x: (Math.random() - .5) * 120 * power }, i * .02)
          .set(st, { x: (Math.random() - .5) * 60 * power }, .06 + i * .02)
          .set(st, { opacity: 0 }, .14 + i * .03)
      })
      tl.add(() => root.current?.classList.add('nx-rgb'), 0).add(() => root.current?.classList.remove('nx-rgb'), .22)
    }
    return () => ctx.revert()
  }, [mobile])

  const first = 'Sai Abhilash'
  const last = 'MANDAVA'
  return (
    <div ref={root} className="nx bg-[#030203] text-white">
      <div ref={stage} className="relative h-[100svh] w-full overflow-hidden">
        {/* ---------- the world ---------- */}
        <svg className="nx-svg absolute inset-0 h-full w-full" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMax slice" role="img"
          aria-label="Illustration: an original masked hero standing on a rooftop, backlit by a red neon halo over a night city">
          <Defs />
          <World heroX={heroX} lift={mobile ? 150 : 0} />
          {/* live glitch strips: the same world, shifted and tinted */}
          {['tintRed', 'tintCyan', 'tintWhite', 'tintRed'].map((f, i) => (
            <g key={i} className="nx-strip" opacity="0">
              <clipPath id={`clip${i}`}><rect x="-400" y="0" width="2400" height="40" /></clipPath>
              <g clipPath={`url(#clip${i})`}><use href="#world" filter={`url(#${f})`} /></g>
            </g>
          ))}
        </svg>
        <canvas ref={particles} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden />
        {/* grade + flash + vignette + scanlines */}
        <div className="nx-grade pointer-events-none absolute inset-0 opacity-0" />
        <div className="nx-flash pointer-events-none absolute inset-0 bg-[#ff2d4d] opacity-0 mix-blend-screen" />
        <div className="pointer-events-none absolute inset-0 nx-vignette" />
        <div className="pointer-events-none absolute inset-0 nx-scan" />

        {/* ---------- chrome ---------- */}
        <header className="nx-chrome absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-5 sm:px-10 sm:py-7">
          <a href="#/" className="flex items-center gap-2.5 font-[Anton] text-[15px] tracking-[0.22em]" aria-label="Home">
            <span className="nx-logo" aria-hidden /> SAI · MANDAVA
          </a>
          <nav aria-label="Primary" className="flex items-center gap-1 text-[12px] font-semibold tracking-[0.16em] sm:gap-2">
            <a className="nx-link hidden sm:inline-block" href="#/projects">WORK</a>
            <a className="nx-link hidden sm:inline-block" href="#/cases">CASE STUDIES</a>
            <a className="nx-link hidden md:inline-block" href="#/contact">CONTACT</a>
            <a className="nx-btn nx-btn--sm" href={`mailto:${profile.email}`}>LET'S TALK</a>
          </nav>
        </header>
        <div className="nx-chrome pointer-events-none absolute bottom-6 left-5 right-5 z-20 flex items-center gap-4 sm:left-10 sm:right-10">
          <span className="font-mono text-[10px] tracking-[0.3em] text-white/50">EST. 2021</span>
          <div className="relative h-px flex-1 bg-white/15"><div className="absolute -top-px left-0 h-[3px] bg-[#ff2d4d] shadow-[0_0_12px_#ff2d4d]" style={{ width: `${progress * 100}%` }} /></div>
          <span className="font-mono text-[10px] tracking-[0.3em] text-white/50">{progress < .05 ? 'SCROLL' : String(Math.round(progress * 100)).padStart(3, '0')}</span>
        </div>

        {/* ---------- editorial typography ---------- */}
        <section className="absolute z-10 left-5 right-5 bottom-[11svh] sm:left-10 sm:right-auto sm:bottom-auto sm:top-[22vh] sm:max-w-[min(960px,62vw)]" aria-label="Introduction">
          <div className="nx-eyebrow mb-3 flex items-center gap-3 font-mono text-[11px] tracking-[0.35em] text-[#ff5a70]">
            <span className="h-px w-10 bg-[#ff2d4d] shadow-[0_0_8px_#ff2d4d]" />PORTFOLIO — VOL. 01
          </div>
          <h1 className="leading-none">
            <span className="block overflow-hidden pb-1"><span className="nx-first block font-fraunces text-[clamp(30px,4.4vw,64px)] font-medium italic tracking-[-0.01em] text-white/90">{first}</span></span>
            <span className="nx-last block overflow-hidden whitespace-nowrap font-[Anton] text-[clamp(64px,12vw,200px)] leading-[0.86] tracking-[0.01em]">
              {[...last].map((c, i) => <span key={i} className="nx-ch inline-block">{c}</span>)}
            </span>
          </h1>
          <div className="nx-role mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[clamp(13px,1.15vw,16px)] font-semibold tracking-[0.18em]">
            <span>UI/UX SOFTWARE ENGINEER</span><span className="text-[#ff2d4d]">/</span><span>DESIGN ENGINEER</span><span className="text-[#ff2d4d]">/</span><span>AI</span>
          </div>
          <p className="nx-role mt-3 hidden max-w-[460px] text-[15px] sm:block leading-relaxed text-white/70"><span>{profile.intro}</span></p>
          <div className="nx-cta mt-7 flex flex-wrap gap-3">
            <a href="#/projects" className="nx-btn">EXPLORE MY WORK <span aria-hidden>→</span></a>
            <a href="#/case/butterfly" className="nx-btn nx-btn--ghost">CASE STUDIES</a>
          </div>
        </section>

        {/* ---------- chapter cards (arrive at the end of the scroll) ---------- */}
        <section className="absolute inset-x-5 bottom-[9svh] z-10 sm:inset-x-10 sm:bottom-[12vh]" aria-label="Choose a chapter" style={{ perspective: 900 }}>
          <div className="nx-pathhead mb-4 flex items-end justify-between opacity-0">
            <h2 className="font-[Anton] text-[clamp(30px,4vw,56px)] leading-none">CHOOSE YOUR <span className="text-[#ff2d4d] nx-glowtext">PATH</span></h2>
            <span className="hidden font-mono text-[11px] tracking-[0.3em] text-white/50 sm:block">03 CHAPTERS</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
            {[
              { n: '01', t: 'Projects', d: `${projects.length} engineering builds — AI, full stack, design systems.`, href: '#/projects', tag: projects[0].tech.slice(0, 3).join(' · ') },
              { n: '02', t: 'UX Case Studies', d: `${caseStudies.length} concept case studies — from Butterfly to Pause.`, href: '#/case/butterfly', tag: caseStudies.slice(0, 3).map((c) => c.title).join(' · ') },
              { n: '03', t: 'Contact', d: 'Open to roles in UI/UX engineering, front-end and AI products.', href: '#/contact', tag: 'Email · LinkedIn · GitHub' },
            ].map((c) => (
              <a key={c.n} href={c.href} className="nx-card opacity-0">
                <span className="nx-card__n">{c.n}</span>
                <span className="block font-[Anton] text-[26px] leading-none tracking-[0.02em] sm:text-[30px]">{c.t.toUpperCase()}</span>
                <span className="mt-2 block text-[14px] leading-snug text-white/70">{c.d}</span>
                <span className="mt-4 flex items-center justify-between font-mono text-[10px] tracking-[0.2em] text-[#ff7a8c]">{c.tag}<span className="nx-card__arrow" aria-hidden>→</span></span>
              </a>
            ))}
          </div>
        </section>
      </div>
      <p className="px-5 py-3 text-center font-mono text-[10px] tracking-[0.2em] text-white/30">ORIGINAL ARTWORK · CODE-DRAWN VECTOR LAYERS</p>
    </div>
  )
}
