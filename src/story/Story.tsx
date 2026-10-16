import { useEffect, useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Scene1 } from '../tribute/Scene1'
import { FinalScene } from '../site/FinalScene'
import { SiteNav } from '../site/shared'
import { Multiverse, multiverseNav } from './Multiverse'
import { SCENES, isPreview, type SceneId } from './scenes'
import { MovieMode, type Mode } from './MovieMode'
import { NYCSwing } from './NYCSwing'

/* =====================================================================================
 *  STORY CONTROLLER — route #/
 *  Renders the approved scenes in order, one continuous scroll:
 *    1 café · 2 mask + NYC swing · 3 rooftop name reveal · 4 into the mask lens · 5 multiverse fall
 *    · 6 world A software projects · 7 world B UX case studies · 8 world C skills · 9 LET'S SAVE THE WORLD.
 *  Scenes whose artwork is missing are skipped for visitors and shown in preview (?preview).
 *  The HUD (scene label, progress, skip) belongs to the controller, not to the scenes.
 * ===================================================================================== */

type Avail = { ok: true }
async function probe(): Promise<Avail> { return { ok: true } }

export type StorySection = 'top' | 'projects' | 'cases' | 'skills' | 'contact'

let lastJumpKey: string | null = null
/** jump to a section of the story; returns false if the target is not mounted yet */
function jumpTo(section: StorySection, smooth = false) {
  lastJumpKey = null
  if (section === 'top') { scrollTo({ top: 0 }); return true }
  if (section === 'contact') {
    const el = document.querySelector<HTMLElement>('[data-scene-marker="final"]'); if (!el) return false
    scrollTo({ top: el.getBoundingClientRect().top + scrollY, behavior: smooth ? 'smooth' : 'auto' }); return true
  }
  // returning from a project / case page lands on the same item
  let key = section === 'projects' ? 'A0' : section === 'cases' ? 'B0' : 'Call'
  try { const last = sessionStorage.getItem('mv-last-world-item'); if (last && last[0] === key[0]) { key = last; sessionStorage.removeItem('mv-last-world-item') } } catch { /* ignore */ }
  lastJumpKey = key
  return multiverseNav.jump(key, smooth)
}

export function Story({ section = 'top' }: { section?: StorySection }) {
  const preview = isPreview()
  const [avail, setAvail] = useState<Avail | null>(null)
  const [scene, setScene] = useState<SceneId>('rooftop')
  const [prog, setProg] = useState(0)
  const [mode, setMode] = useState<Mode>('idle')

  useEffect(() => { scrollTo(0, 0); probe().then(setAvail) }, [])

  // route → section (on load, and when the menu is used while already on the story)
  useEffect(() => {
    if (!avail) return
    let tries = 0, t = 0, t2 = 0
    const run = () => {
      ScrollTrigger.refresh()
      if (!jumpTo(section)) { if (tries++ < 20) t = window.setTimeout(run, 100); return }
      // layout can still settle (fonts, images): land on the same item once more
      const key = lastJumpKey, y0 = scrollY
      if (key) t2 = window.setTimeout(() => { if (Math.abs(scrollY - y0) < 4) { ScrollTrigger.refresh(); multiverseNav.jump(key) } }, 1200)
    }
    t = window.setTimeout(run, section === 'top' ? 0 : 450)
    return () => { clearTimeout(t); clearTimeout(t2) }
  }, [avail, section])

  const first: SceneId = 'rooftop'

  // which scene is on screen: the last marker whose top has passed the middle of the viewport
  useEffect(() => {
    if (!avail) return
    let raf = 0
    const on = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        let cur: SceneId = first
        document.querySelectorAll<HTMLElement>('[data-scene-marker]').forEach((el) => {
          const id = el.dataset.sceneMarker as SceneId
          if (el.getBoundingClientRect().top <= innerHeight * (id === 'final' ? .5 : .02)) cur = id
        })
        setScene(cur)
        const max = document.documentElement.scrollHeight - innerHeight
        setProg(max > 0 ? scrollY / max : 0)
      })
    }
    on(); addEventListener('scroll', on, { passive: true }); addEventListener('resize', on)
    const t = setTimeout(() => { ScrollTrigger.refresh(); on() }, 400)
    return () => { removeEventListener('scroll', on); removeEventListener('resize', on); clearTimeout(t); cancelAnimationFrame(raf) }
  }, [avail, first])

  if (!avail) return <div className="min-h-screen bg-black" />

  const def = SCENES.find((s) => s.id === scene)!
  const skip = () => { multiverseNav.jump('A0') }
  const inIntro = ['cafe', 'mask', 'rooftop', 'eye', 'multiverse'].includes(scene)

  return (
    <div className="story bg-black text-white">
      <SiteNav />
      <h1 className="sr-only">Sai Abhilash Mandava — Software Engineer, UX Designer, Creative Developer</h1>

      <Scene1 first={first === 'rooftop'} preview={preview} />
      <NYCSwing />
      <Multiverse preview={preview} />
      <div className="relative z-[17]" data-scene-marker="final"><FinalScene /></div>
      <footer className="relative z-[17] border-t border-white/10 bg-black px-5 py-6 text-center text-[10px] leading-relaxed text-white/40">
        <a href="#/work" className="mb-3 inline-block border border-white/25 px-4 py-2 font-mono text-[11px] tracking-[0.3em] text-white/80 hover:border-white hover:text-white">VIEW ALL WORK</a>
        <div>Unofficial fan project. Spider-Man and related characters © Marvel. Not affiliated with or endorsed by Marvel or Sony.</div>
      </footer>

      <MovieMode onMode={setMode} />
      {/* HUD */}
      <div className="pointer-events-none fixed inset-0 z-40" aria-hidden={false}>
        {['left-3 top-3 border-l-2 border-t-2', 'right-3 top-3 border-r-2 border-t-2', 'left-3 bottom-3 border-l-2 border-b-2', 'right-3 bottom-3 border-r-2 border-b-2'].map((c) => <span key={c} className={`absolute h-4 w-4 border-white/40 transition-opacity sm:m-2 ${c} ${scene === 'final' ? 'opacity-0' : ''}`} />)}
        <span className="sr-only" aria-live="polite">{def.title}</span>
        <div className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-[#e8202f] to-[#2f6bff]" style={{ width: `${prog * 100}%` }} />
        {inIntro && mode !== 'movie' && (
          <button type="button" onClick={skip} className="pointer-events-auto absolute bottom-5 right-6 border border-white/40 bg-black/40 px-4 py-2 text-[11px] font-semibold tracking-[0.2em] backdrop-blur-sm hover:border-[#e8202f] sm:right-10">
            SKIP TO WORK →
          </button>
        )}
        {preview && (
          <div className="absolute left-1/2 top-[72px] -translate-x-1/2 border border-[#ffb547]/70 bg-black/80 px-3 py-1.5 font-mono text-[10px] tracking-[0.2em] text-[#ffb547]">
            PREVIEW MODE · scenes without artwork are visible here only
          </div>
        )}
      </div>
    </div>
  )
}
