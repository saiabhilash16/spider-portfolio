import * as THREE from 'three'

/* Screen anchors: DOM cards that follow a 3D point.
 * The 3D scene projects each point every frame and moves the card — crisp, accessible text
 * (real DOM, keyboard-focusable) that still feels attached to the 3D world.            */
export type ScreenAnchor = {
  el: HTMLElement
  pos: THREE.Vector3
  refDist: number     // distance at which scale = 1
  minScale: number
  maxScale: number
  fadeFrom: number    // start fading beyond this distance
  fadeTo: number
}
export const anchors = new Map<string, ScreenAnchor>()

export function registerAnchor(id: string, el: HTMLElement | null, opts: Omit<ScreenAnchor, 'el'>) {
  if (el) anchors.set(id, { el, ...opts })
  else anchors.delete(id)
}
