import * as THREE from 'three'
import { caseStudies, projects } from '../data/content'
import { registerAnchor } from '../three/anchors'
import { holdById, useUI } from '../three/runtime'
import { CASE_SIGNS, type SpecialId } from '../three/world'

export type OpenFn = (kind: 'project' | 'case', id: string) => void

function ProjectHolo({ holdId, index, onOpen }: { holdId: SpecialId; index: number; onOpen: OpenFn }) {
  const ui = useUI()
  const h = holdById(holdId)
  const p = projects[index]
  const active = ui.holdId === holdId
  const compact = typeof window !== 'undefined' && window.innerWidth < 768
  // On phones the hologram docks to the bottom of the screen so it is always fully readable.
  if (compact)
    return (
      <div className="fixed inset-x-3 bottom-3" style={{ visibility: active ? 'visible' : 'hidden' }}>
        <div className={`holo holo--compact ${active ? 'holo--on' : ''}`} style={{ ['--accent' as any]: p.accent }} aria-hidden={!active}>
          <div className="text-[10px] tracking-[0.3em] text-[var(--accent)] font-semibold">PROJECT {p.index}</div>
          <h3 className="font-display text-[34px] leading-[0.95] mt-1 text-white">{p.title}</h3>
          <p className="mt-2 text-[14px] text-slate-300 leading-snug">{p.tagline}</p>
          {p.result && <div className="mt-2 text-[14px] font-semibold text-[var(--accent)]">▲ {p.result}</div>}
          <button className="btn-primary mt-3 !py-2.5" tabIndex={active ? 0 : -1} onClick={() => onOpen('project', p.id)}>Explore Project →</button>
        </div>
      </div>
    )
  return (
    <div className="absolute left-0 top-0 will-change-transform" style={{ visibility: 'hidden' }}
      ref={(el) => registerAnchor(`holo-${holdId}`, el, {
        pos: new THREE.Vector3(-h.side * 1, h.target.y + 3.5, h.target.z - 20),
        refDist: 12, minScale: 0.55, maxScale: 1, fadeFrom: 400, fadeTo: 500,
      })}>
      <div className={`holo ${active ? 'holo--on' : ''}`} style={{ ['--accent' as any]: p.accent }} aria-hidden={!active}>
        <div className="holo__scan" />
        <div className="text-[11px] tracking-[0.3em] text-[var(--accent)] font-semibold">PROJECT {p.index}</div>
        <h3 className="font-display text-[44px] leading-[0.95] mt-2 text-white">{p.title}</h3>
        <p className="mt-3 text-[15px] text-slate-300 leading-snug">{p.tagline}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">{p.tech.map((t) => <span key={t} className="chip">{t}</span>)}</div>
        {p.result && <div className="mt-4 text-[15px] font-semibold text-[var(--accent)]">▲ {p.result}</div>}
        <button className="btn-primary mt-5" tabIndex={active ? 0 : -1} onClick={() => onOpen('project', p.id)}>Explore Project →</button>
      </div>
    </div>
  )
}

function CaseSign({ i, onOpen }: { i: number; onOpen: OpenFn }) {
  const ui = useUI()
  const cs = caseStudies[i]
  const s = CASE_SIGNS[i]
  const live = ui.chapter === 'cases' || ui.chapter === 'education'
  return (
    <div className="absolute left-0 top-0 will-change-transform" style={{ visibility: 'hidden' }}
      ref={(el) => registerAnchor(`sign-${i}`, el, {
        pos: s.position.clone(), refDist: 30, minScale: 0.3, maxScale: 1, fadeFrom: 160, fadeTo: 260,
      })}>
      <div className="sign" style={{ ['--accent' as any]: cs.accent, opacity: live ? 'var(--fade)' : 0 }}>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[10px] tracking-[0.28em] text-[var(--accent)] font-semibold">CASE STUDY 0{i + 1}</span>
          <span className="tag">Concept Case Study</span>
        </div>
        <h3 className="font-display text-[46px] leading-none mt-2 text-white">{cs.title}</h3>
        <p className="text-[14px] text-slate-300 mt-1">{cs.oneLiner}</p>
        <p className="text-[11px] text-slate-400 mt-2 uppercase tracking-widest">{cs.mood}</p>
        <button className="btn-ghost mt-3 !py-2" tabIndex={live ? 0 : -1} onClick={() => onOpen('case', cs.id)}>Open case study →</button>
      </div>
    </div>
  )
}

export function WorldLabels({ onOpen }: { onOpen: OpenFn }) {
  return (
    <div className="fixed inset-0 z-10 pointer-events-none overflow-hidden [&_button]:pointer-events-auto">
      <ProjectHolo holdId="project-portal" index={0} onOpen={onOpen} />
      <ProjectHolo holdId="project-commerce" index={1} onOpen={onOpen} />
      {caseStudies.map((_, i) => <CaseSign key={i} i={i} onOpen={onOpen} />)}
    </div>
  )
}
