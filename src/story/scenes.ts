/* =====================================================================================
 *  THE STORY — approved scene order (do not reorder).
 *  Each scene declares the artwork it needs. A scene whose required artwork is missing is
 *  DISABLED for visitors and only rendered in preview mode (add ?preview to the URL).
 * ===================================================================================== */
export type SceneId = 'cafe' | 'mask' | 'rooftop' | 'eye' | 'multiverse' | 'projects' | 'cases' | 'skills' | 'final'

export type SceneDef = {
  id: SceneId
  n: number
  title: string
  /** what the scene needs before visitors can see it */
  needs: string[]
  /** how availability is decided */
  gate: 'cafe-clips' | 'not-built' | 'always'
  /** honest note about the current state */
  note?: string
}

export const SCENES: SceneDef[] = [
  {
    id: 'cafe', n: 1, title: 'THE CAFÉ', gate: 'cafe-clips',
    needs: ['Clips c01–c06 (MP4) in assets/tribute/cafe/clips/ → converted with `npm run clips`'],
    note: 'No on-screen text during this scene; the HUD label is hidden while it plays.',
  },
  {
    id: 'mask', n: 2, title: 'THE MASK & NYC SWING', gate: 'not-built',
    needs: ['C09–C10 mask on · C11 looks at the skyline · C12 web shot', 'swing/0001…0120.webp — full-body swing (transparent)', 'C14 web release + jump · C15 landing', 'canyon-01…04.jpg building plates'],
    note: 'Built when the footage exists (Phase 4).',
  },
  {
    id: 'rooftop', n: 3, title: 'ROOFTOP NAME REVEAL', gate: 'always',
    needs: ['rooftop.jpg + standing-back.png (Spider-Man standing, from behind) + landing clip — until then the existing city plate + hero.png are used'],
    note: 'Interim artwork: skyline.jpg + front-facing hero.png.',
  },
  { id: 'eye', n: 4, title: 'INTO THE MASK LENS', gate: 'always', needs: ['face-front.png ≥ 2400 px for a sharp lens (current one is soft)', 'orbit clip (behind → face), optional'] },
  {
    id: 'multiverse', n: 5, title: 'THE MULTIVERSE FALL', gate: 'always',
    needs: ['multiverse/fall/0001…0096.webp — Spider-Man falling backward (transparent). Until then the camera falls alone.'],
  },
  { id: 'projects', n: 6, title: 'SOFTWARE PROJECTS', gate: 'always', needs: ['swing frames (Spider-Man travelling between worlds) — optional, camera travels alone until then'] },
  { id: 'cases', n: 7, title: 'UX CASE STUDIES', gate: 'always', needs: [] },
  { id: 'skills', n: 8, title: 'SKILLS & TECHNOLOGIES', gate: 'always', needs: [] },
  { id: 'final', n: 9, title: "LET'S SAVE THE WORLD.", gate: 'always', needs: [] },
]

/** preview mode: add ?preview to the URL (the shareable preview file sets window.__forcePreview) */
export const isPreview = () => typeof location !== 'undefined' && (new URLSearchParams(location.search).has('preview') || !!(window as any).__forcePreview)
/** VITE_FLAT=1 builds a site with every file next to index.html (for a plain GitHub upload) */
export const FLAT = import.meta.env.VITE_FLAT === '1'
export const STORY_ASSETS = FLAT ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}assets/tribute/`

/** Loads a JSON file; returns null if it is missing (dev servers may answer with index.html). */
export async function loadJson<T>(url: string): Promise<T | null> {
  try {
    const r = await fetch(url, { cache: 'no-cache' })
    if (!r.ok || !(r.headers.get('content-type') ?? '').includes('json')) return null
    return (await r.json()) as T
  } catch { return null }
}

/** True if a file exists with the expected content type (guards against SPA fallbacks). */
export async function fileExists(url: string, type: string) {
  try {
    const r = await fetch(url, { method: 'HEAD', cache: 'no-cache' })
    return r.ok && (r.headers.get('content-type') ?? '').includes(type)
  } catch { return false }
}
