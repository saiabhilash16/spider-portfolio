/* =========================================================================
 * SCENE 1 CONFIG — all artwork + composition lives here.
 * Swap images by dropping files into public/assets/tribute/scene1/
 * (same filenames) and adjust the numbers below. No animation code changes.
 * ========================================================================= */
export const SCENE1 = {
  assets: {
    skyline: 'skyline.jpg',            // REQUIRED  ≥ 3840×2160  wide New York skyline / street at night
    skylineDepth: 'skyline-depth.png', // optional  same size, grayscale, white = near (enables true parallax)
    hero: 'hero.png',                  // REQUIRED  ≥ 2400×3200  hero cut-out, TRANSPARENT background
    heroDepth: 'hero-depth.png',       // optional  same size depth map for subtle 3D relief
    eye: 'eye-closeup.jpg',            // close-up of the left lens. Currently DERIVED from hero.png (crop + upscale) so it lines up exactly.
    lensMatte: 'lens-matte.png',       // white = lens glass, same framing as eye-closeup.jpg (hand-traced)
    reflection: 'reflection.jpg',      // what the lens reflects. Empty → the skyline. Scene 2: the snowy café.
    foreground: 'foreground.png',      // optional  ≥ 3840×2160  out-of-focus foreground (ledge, railing, steam), TRANSPARENT
  },
  composition: {
    heroX: 0.66,          // hero centre on screen (0 = left, 1 = right) — desktop
    heroXMobile: 0.5,
    heroHeight: 0.88,     // hero height as a fraction of screen height
    heroHeightMobile: 0.36,
    eye: { x: 0.424, y: 0.48 }, // centre of the LEFT lens inside hero.png (0..1, measured) — the camera flies here
    skylineFocus: { x: 0.5, y: 0.55 },
    trafficY: 0.2,           // height of the distant traffic lights on screen (0 = bottom)
    syntheticTraffic: false, // the skyline photo has real traffic lights; the darkness reveal uses them instead
    lens: { w: 0.107, h: 0.184 },                                  // left lens size as a fraction of hero.png (measured)
    closeupCrop: [0.3018, 0.3693, 0.2643, 0.264] as [number, number, number, number], // eye-closeup.jpg = this rect of hero.png (x, y, w, h)
    lensInCrop: { x: 0.463, y: 0.419 },                            // lens centre inside eye-closeup.jpg
    lensFill: 0.8,           // final lens size as a fraction of the screen (zoom is computed from this)
  },
  look: {
    backgroundMono: 1.0,  // 1 = black-and-white world behind a full-colour hero (reference look)
    halftone: 0.45,
    grain: 0.06,
  },
  copy: {
    overline: 'SCENE 03 — ABOVE NEW YORK',
    roles: ['SOFTWARE ENGINEER', 'UX DESIGNER', 'CREATIVE DEVELOPER'],
    disclaimer: 'Unofficial fan project. Spider-Man and related characters © Marvel. Not affiliated with or endorsed by Marvel or Sony.',
  },
}
