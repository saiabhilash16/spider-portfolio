import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
import { profile } from '../data/content'
import { HERO_VISOR, heroSvg, visorMaskSvg, visorSvg } from './art'
import { frag, vert } from './shader'
import cityUrl from './assets/city-street.jpg'
import skyUrl from './assets/city-skyline.jpg'

gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin)

/* =====================================================================================
 *  CINEMATIC INTRO — scene 1 of the new hybrid experience (route #/ ).
 *  Chapters: 01 Origin (colour hero vs B&W city) → 02 Lens (visor close-up)
 *            → 03 Signal (zoom through the visor into the colour city + CTAs)
 *  The original 3D city stays available at #/city.
 * ===================================================================================== */

const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
const isMobile = () => window.innerWidth < 768
const SCROLL_SCREENS = 2.5 // Scene 1 only for now; Scenes 2–3 extend this

const svgUrl = (svg: string) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
function loadImage(src: string) {
  return new Promise<HTMLImageElement>((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src })
}
async function rasterize(svg: string, w: number, h: number) {
  const img = await loadImage(svgUrl(svg))
  const c = document.createElement('canvas'); c.width = w; c.height = h
  c.getContext('2d')!.drawImage(img, 0, 0, w, h)
  return c
}
/** Giant word that sits BEHIND the hero (layered typography). */
async function wordCanvas() {
  try { await document.fonts.load('400 200px Anton') } catch { /* fallback font */ }
  const c = document.createElement('canvas'); c.width = 2400; c.height = 1350
  const g = c.getContext('2d')!
  g.font = '400 640px Anton, Impact, "Arial Narrow", sans-serif'
  g.textAlign = 'center'; g.textBaseline = 'middle'
  g.fillStyle = '#fff'
  g.fillText('ORIGIN', 1560, 640)
  g.lineWidth = 6; g.strokeStyle = '#ef4444'
  g.globalAlpha = .55
  g.strokeText('ORIGIN', 1560 + 26, 640 + 26)   // offset outline echo
  return c
}

export function CinematicIntro() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const root = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)
  const [chapter, setChapter] = useState(0)
  const [progress, setProgress] = useState(0)
  const U = useRef<Record<string, { value: unknown }> | null>(null)

  useEffect(() => { document.title = 'Sai Abhilash Mandava — UI/UX Software Engineer'; window.scrollTo(0, 0) }, [])

  /* ---------------- WebGL setup ---------------- */
  useEffect(() => {
    const canvas = canvasRef.current!
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' })
    const dpr = Math.min(window.devicePixelRatio, isMobile() ? 1.5 : 2)
    renderer.setPixelRatio(dpr)
    const scene = new THREE.Scene()
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const blank = new THREE.Texture()
    const uniforms: Record<string, { value: unknown }> = {
      uRes: { value: new THREE.Vector2() }, uTime: { value: 0 }, uMouse: { value: new THREE.Vector2() }, uDpr: { value: dpr },
      tCity: { value: blank }, uCitySize: { value: new THREE.Vector2(16, 9) },
      tSky: { value: blank }, uSkySize: { value: new THREE.Vector2(16, 9) },
      tHero: { value: blank }, uHeroSize: { value: new THREE.Vector2(1000, 1300) },
      tWord: { value: blank }, uWordSize: { value: new THREE.Vector2(2400, 1350) },
      tVisor: { value: blank }, uVisorSize: { value: new THREE.Vector2(1600, 900) },
      tMask: { value: blank },
      uReveal: { value: 0 }, uHeroIn: { value: 0 }, uPush: { value: 0 }, uCloseup: { value: 0 }, uPortal: { value: 0 },
      uColor: { value: 0 }, uStrips: { value: 0 }, uGlitch: { value: 0 }, uWordShift: { value: 0 },
      uHeroX: { value: isMobile() ? .5 : .66 }, uMobile: { value: isMobile() ? 1 : 0 },
      uVisorPt: { value: new THREE.Vector2(HERO_VISOR.x, HERO_VISOR.y) },
    }
    U.current = uniforms
    const mat = new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: frag, uniforms, depthTest: false })
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat))

    const resize = () => {
      const w = window.innerWidth, h = window.innerHeight
      renderer.setSize(w, h, false)
      ;(uniforms.uRes.value as THREE.Vector2).set(w * dpr, h * dpr)
      uniforms.uHeroX.value = isMobile() ? .5 : .66
      uniforms.uMobile.value = isMobile() ? 1 : 0
    }
    resize(); window.addEventListener('resize', resize)

    const mouse = new THREE.Vector2(), target = new THREE.Vector2()
    const onMove = (e: PointerEvent) => target.set((e.clientX / innerWidth) * 2 - 1, (e.clientY / innerHeight) * 2 - 1)
    if (!reduced) window.addEventListener('pointermove', onMove)

    // textures
    let cancelled = false
    const tex = (src: CanvasImageSource, size?: [number, number], key?: string) => {
      const t = src instanceof HTMLCanvasElement ? new THREE.CanvasTexture(src) : new THREE.Texture(src as HTMLImageElement)
      t.needsUpdate = true; t.colorSpace = THREE.SRGBColorSpace
      t.minFilter = THREE.LinearMipmapLinearFilter; t.generateMipmaps = true
      t.anisotropy = renderer.capabilities.getMaxAnisotropy()
      if (key && size) (uniforms[key].value as THREE.Vector2).set(size[0], size[1])
      return t
    }
    // FINAL ASSET SLOTS — if these files exist in /public/assets/scene1/, they replace the placeholders
    const slot = (name: string, fallback: () => Promise<CanvasImageSource & { width: number; height: number }>) =>
      loadImage(`${import.meta.env.BASE_URL}assets/scene1/${name}`).catch(fallback)
    Promise.all([
      slot('city-bg.jpg', () => loadImage(cityUrl)), loadImage(skyUrl),
      slot('hero.png', () => rasterize(heroSvg(), 1500, 1950)), rasterize(visorSvg(), 2400, 1350), rasterize(visorMaskSvg(), 1600, 900), wordCanvas(),
    ]).then(([city, sky, hero, visor, mask, word]) => {
      if (cancelled) return
      uniforms.tCity.value = tex(city, [city.width, city.height], 'uCitySize')
      uniforms.tSky.value = tex(sky, [sky.width, sky.height], 'uSkySize')
      uniforms.tHero.value = tex(hero, [hero.width, hero.height], 'uHeroSize')
      uniforms.tVisor.value = tex(visor, [visor.width, visor.height], 'uVisorSize')
      uniforms.tMask.value = tex(mask)
      uniforms.tWord.value = tex(word, [word.width, word.height], 'uWordSize')
      setReady(true)
    })

    let raf = 0, last = performance.now()
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, .05); last = now
      uniforms.uTime.value = (uniforms.uTime.value as number) + dt
      mouse.lerp(target, 1 - Math.exp(-4 * dt))
      ;(uniforms.uMouse.value as THREE.Vector2).copy(mouse)
      renderer.render(scene, cam)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    // expose for testing
    ;(window as any).__cine = { uniforms }
    return () => {
      cancelled = true; cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize); window.removeEventListener('pointermove', onMove)
      renderer.dispose(); mat.dispose()
    }
  }, [])

  /* ---------------- Opening sequence (time-based) + scroll timeline ---------------- */
  useLayoutEffect(() => {
    if (!ready || !U.current) return
    const u = U.current
    const G = reduced ? 0 : 1
    const ctx = gsap.context(() => {
      /* --- opening: fade in, glitch the hero in, reveal type --- */
      const open = gsap.timeline({ defaults: { ease: 'power3.out' } })
      open.to(u.uReveal, { value: 1, duration: reduced ? .01 : 1.4 })
        .to(u.uStrips, { value: G, duration: .12, ease: 'none' }, .5)
        .to(u.uGlitch, { value: .9 * G, duration: .08, ease: 'none' }, .6)
        .to(u.uHeroIn, { value: 1, duration: reduced ? .01 : 1.1, ease: 'expo.out' }, .62)
        .to(u.uGlitch, { value: 0, duration: .5, ease: 'power2.out' }, .72)
        .to(u.uStrips, { value: .28 * G, duration: .6, ease: 'power2.inOut' }, .8)
        .from('.c1-eyebrow', { opacity: 0, y: 14, duration: .6 }, .9)
        .from('.c1-name .ch', { yPercent: 115, opacity: 0, rotate: 6, stagger: .035, duration: .9, ease: 'expo.out' }, 1.0)
        .to('.c1-role', { duration: reduced ? .01 : 1.2, scrambleText: { text: 'UI/UX SOFTWARE ENGINEER', chars: 'X/\\|#01<>', speed: .6 } }, 1.5)
        .from('.c1-meta', { opacity: 0, y: 10, duration: .6, stagger: .1 }, 1.7)
        .from('.c-chrome', { opacity: 0, duration: .8 }, 1.2)

      /* --- idle micro-glitches: strips flare open, RGB split --- */
      if (!reduced) {
        const idle = () => {
          if ((u.uGlitch.value as number) < .05 && (u.uPush.value as number) < .02)
            gsap.timeline()
              .to(u.uGlitch, { value: .3 + Math.random() * .35, duration: .05 })
              .to(u.uStrips, { value: '+=.35', duration: .06 }, 0)
              .to(u.uGlitch, { value: 0, duration: .28 })
              .to(u.uStrips, { value: '-=.35', duration: .3 }, .06)
          gsap.delayedCall(2.5 + Math.random() * 3, idle)
        }
        gsap.delayedCall(4, idle)
      }

      /* --- scroll-scrubbed: camera pushes in, type splits apart, strips widen --- */
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: track.current, start: 'top top', end: 'bottom bottom', scrub: reduced ? true : 1,
          onUpdate: (st) => { setProgress(st.progress); setChapter(0) },
        },
      })
      tl.to(u.uPush, { value: reduced ? .1 : .42, duration: 1, ease: 'power1.in' }, 0)
        .to(u.uWordShift, { value: -.08, duration: 1 }, 0)
        .to('.c1-name-a', { xPercent: -18, duration: 1 }, 0)
        .to('.c1-name-b', { xPercent: 10, duration: 1 }, 0)
        .to('.c1-text', { opacity: 0, y: -40, duration: .35, ease: 'power2.in' }, .55)
        .to(u.uStrips, { value: .9 * G, duration: .35, ease: 'power2.in' }, .6)
        .to(u.uGlitch, { value: .8 * G, duration: .08 }, .9)
        .to('.c1-next', { opacity: 1, duration: .1 }, .9)
    }, root)
    return () => ctx.revert()
  }, [ready])

  const skip = () => {
    const max = document.documentElement.scrollHeight - innerHeight
    window.scrollTo({ top: max, behavior: 'auto' })
  }
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') skip() }
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k)
  }, [])

  const chapters = ['ORIGIN', 'LENS', 'MULTIVERSE']
  const name = 'ABHILASH'

  return (
    <div ref={root} className="cine bg-black text-white">
      <canvas ref={canvasRef} className="fixed inset-0 h-full w-full" aria-hidden />

      {/* ---------- chrome: brand, chapter marker, skip, corner brackets, progress ---------- */}
      <div className="c-chrome pointer-events-none fixed inset-0 z-20">
        <span className="cine-corner left-4 top-4 border-l-2 border-t-2 sm:left-6 sm:top-6" />
        <span className="cine-corner right-4 top-4 border-r-2 border-t-2 sm:right-6 sm:top-6" />
        <span className="cine-corner bottom-4 left-4 border-b-2 border-l-2 sm:bottom-6 sm:left-6" />
        <span className="cine-corner bottom-4 right-4 border-b-2 border-r-2 sm:bottom-6 sm:right-6" />
        <header className="pointer-events-auto absolute inset-x-0 top-0 flex items-center justify-between px-7 pt-6 sm:px-10 sm:pt-8">
          <a href="#/" className="flex items-center gap-2 font-display-x text-[15px] tracking-[0.2em]">
            <span className="inline-block h-2.5 w-2.5 rotate-45 bg-[#ef4444] shadow-[0_0_12px_#ef4444]" /> SAI · MANDAVA
          </a>
          <div className="hidden font-mono text-[11px] tracking-[0.3em] text-white/70 md:block" aria-live="polite">
            0{chapter + 1} / 03 — <span className="text-[#ef4444]">{chapters[chapter]}</span>
          </div>
          <nav className="flex items-center gap-2 text-[12px] font-semibold tracking-[0.12em]">
            <a href="#/projects" className="hidden rounded-full px-3 py-2 hover:text-[#22D3EE] sm:inline">WORK</a>
            <a href="#/cases" className="hidden rounded-full px-3 py-2 hover:text-[#22D3EE] sm:inline">CASE STUDIES</a>
            {progress < .97 && <button onClick={skip} className="rounded-full border border-white/40 px-4 py-2 backdrop-blur hover:border-[#22D3EE] hover:text-[#22D3EE]">SKIP INTRO →</button>}
          </nav>
        </header>
        <div className="absolute bottom-7 left-10 right-10 hidden items-center gap-4 sm:flex">
          <span className="font-mono text-[10px] tracking-[0.3em] text-white/60">SINCE 2021</span>
          <div className="relative h-px flex-1 bg-white/20">
            <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#ef4444] via-white to-[#3b82f6]" style={{ width: `${progress * 100}%`, height: 2, top: -0.5 }} />
            {[.3, .6].map((m) => <span key={m} className="absolute top-1/2 h-2 w-px -translate-y-1/2 bg-white/50" style={{ left: `${m * 100}%` }} />)}
          </div>
          <span className="font-mono text-[10px] tracking-[0.3em] text-white/60">{Math.round(progress * 100).toString().padStart(3, '0')}</span>
        </div>
        {progress < .02 && ready && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.4em] text-white/70 sm:bottom-14">
            <span className="cine-pulse">SCROLL</span>
          </div>
        )}
      </div>

      {/* ---------- 01 ORIGIN ---------- */}
      <section className="c1-text pointer-events-none fixed z-10 left-7 right-7 bottom-[12vh] sm:left-10 sm:right-auto sm:bottom-[13vh] sm:max-w-[700px]" aria-label="Introduction">
        <div className="c1-eyebrow flex items-center gap-3 font-mono text-[11px] tracking-[0.35em] text-white/85">
          <span className="h-px w-8 bg-[#ef4444]" />CHAPTER 01 — ORIGIN
        </div>
        <h1 className="mt-3 font-display-x leading-[0.84]">
          <span className="c1-name c1-name-a block overflow-hidden text-[clamp(30px,4.2vw,58px)] tracking-[0.06em] text-[#ef4444]">
            {[...'SAI'].map((c, i) => <span key={i} className="ch inline-block">{c}</span>)}
          </span>
          <span className="c1-name block overflow-hidden text-[clamp(66px,11.5vw,176px)] text-white cine-chroma">
            {[...name].map((c, i) => <span key={i} className="ch inline-block">{c}</span>)}
          </span>
          <span className="c1-name c1-name-b block overflow-hidden text-[clamp(40px,6.4vw,98px)] text-[#3b82f6] cine-chroma">
            {[...'MANDAVA'].map((c, i) => <span key={i} className="ch inline-block">{c}</span>)}
          </span>
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="c1-role font-mono text-[13px] font-semibold tracking-[0.28em] text-white"> </span>
        </div>
        <p className="c1-meta mt-2 max-w-[460px] text-[15px] leading-relaxed text-white/85 [text-shadow:0_2px_12px_rgba(0,0,0,0.9)]">
          Design Engineer · AI — {profile.intro}
        </p>
        <div className="c1-meta pointer-events-auto mt-5 flex flex-wrap gap-3">
          <a href="#/projects" className="bg-[#ef4444] px-5 py-3 font-display-x text-[16px] tracking-[0.1em] text-white [clip-path:polygon(0_0,100%_0,94%_100%,0_100%)] hover:bg-white hover:text-black">EXPLORE MY WORK</a>
          <a href="#/case/butterfly" className="border border-white/50 bg-black/40 px-5 py-3 font-display-x text-[16px] tracking-[0.1em] backdrop-blur hover:border-[#3b82f6] hover:text-[#93c5fd]">CASE STUDIES</a>
        </div>
      </section>
      <div className="c1-next pointer-events-none fixed inset-0 z-10 flex items-center justify-center opacity-0">
        <div className="bg-black/70 px-6 py-4 text-center font-mono text-[12px] tracking-[0.3em] backdrop-blur">
          SCENE 2 — THE LENS · <span className="text-[#3b82f6]">IN PRODUCTION</span>
        </div>
      </div>

      {!ready && <div className="fixed inset-0 z-30 flex items-center justify-center bg-black font-mono text-[11px] tracking-[0.4em] text-white/60"><span className="cine-pulse">LOADING SIGNAL…</span></div>}

      <div className="fixed bottom-2 right-3 z-20 font-mono text-[9px] tracking-[0.2em] text-white/35">TEMPORARY ARTWORK</div>

      {/* scroll track */}
      <div ref={track} style={{ height: `${(SCROLL_SCREENS + 1) * 100}vh` }} aria-hidden />
    </div>
  )
}
