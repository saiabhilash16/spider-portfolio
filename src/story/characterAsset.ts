import type * as THREE from 'three'
import { FLAT, STORY_ASSETS } from './scenes'
import { CHARACTER } from './character.config'

/* Loads the animated Spider-Man once (rig + the approved clips) and shares it between scenes.
 * Each scene gets its own skeleton-aware clone. The .glb can also be served wrapped in .json
 * for hosts that refuse .glb files. */
export type LoadedCharacter = { scene: THREE.Group; clips: THREE.AnimationClip[] }
let promise: Promise<LoadedCharacter | null> | null = null

export function loadCharacter(): Promise<LoadedCharacter | null> {
  if (promise) return promise
  promise = (async () => {
    // Read the model bytes ourselves (no data: URL fetches — strict hosts block those),
    // from the preview slot, the .glb, or the same bytes wrapped in .json.
    const fromDataUri = (u: string) => { const b64 = u.slice(u.indexOf(',') + 1), bin = atob(b64), out = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i); return out.buffer }
    const slots = (window as any).__slots ?? {}
    let buf: ArrayBuffer | null = slots[CHARACTER.file] ? fromDataUri(slots[CHARACTER.file]) : null
    const file = FLAT ? CHARACTER.file.split('/').pop()! : CHARACTER.file
    if (!buf) buf = await fetch(`${STORY_ASSETS}${file}`).then((r) => r.ok && !(r.headers.get('content-type') ?? '').includes('html') ? r.arrayBuffer() : null).catch(() => null)
    if (!buf) {
      const j = await fetch(`${STORY_ASSETS}${file.replace(/\.glb$/, '.json')}`).then((r) => r.ok ? r.json() : null).catch(() => null)
      if (j?.glb) buf = fromDataUri(j.glb)
    }
    if (!buf) return null
    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
    return await new Promise<LoadedCharacter | null>((res) => {
      // textures through <img> + blob: URLs (allowed everywhere) instead of fetch()-based ImageBitmaps
      const w = window as any, cib = w.createImageBitmap
      try { w.createImageBitmap = undefined } catch { /* read-only */ }
      try { new GLTFLoader().parse(buf!, '', (g) => res({ scene: g.scene, clips: g.animations }), () => res(null)) }
      finally { try { w.createImageBitmap = cib } catch { /* ignore */ } }
    })
  })()
  return promise
}

export async function cloneCharacter(): Promise<LoadedCharacter | null> {
  const c = await loadCharacter(); if (!c) return null
  const { clone } = await import('three/examples/jsm/utils/SkeletonUtils.js')
  return { scene: clone(c.scene) as THREE.Group, clips: c.clips }
}
