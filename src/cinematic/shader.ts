/* One full-screen fragment shader composites the whole intro:
 *   B&W ink/halftone city  →  giant layered word  →  full-colour hero
 *   →  visor close-up  →  portal "through the lens"  →  colour city
 * plus slice glitch, RGB split, block pixelation, scanlines, grain, vignette.
 * All timing values (uniforms) are driven by a scrubbed GSAP timeline.      */

export const vert = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`

export const frag = /* glsl */ `
precision highp float;
varying vec2 vUv;

uniform vec2  uRes;         // canvas size in px
uniform float uTime;
uniform vec2  uMouse;       // -1..1
uniform float uDpr;

uniform sampler2D tCity;    uniform vec2 uCitySize;
uniform sampler2D tSky;     uniform vec2 uSkySize;
uniform sampler2D tHero;    uniform vec2 uHeroSize;
uniform sampler2D tWord;    uniform vec2 uWordSize;
uniform sampler2D tVisor;   uniform vec2 uVisorSize;
uniform sampler2D tMask;

uniform float uReveal;      // 0..1 intro fade/ink-in
uniform float uHeroIn;      // 0..1 hero rises in
uniform float uPush;        // 0..1 camera push toward the visor (scene 1)
uniform float uCloseup;     // 0..1 cut to the visor close-up
uniform float uPortal;      // 0..1 zoom through the lens
uniform float uColor;       // 0..1 colour bleeds back into the world
uniform float uGlitch;      // 0..1 glitch intensity
uniform float uWordShift;   // parallax of the giant word
uniform float uStrips;      // 0..1 how open the alternate-world strips are
uniform float uHeroX;       // hero anchor x (0..1)
uniform float uMobile;
uniform vec2  uVisorPt;     // visor position inside the hero image (0..1)

float hash(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float luma(vec3 c) { return dot(c, vec3(.299, .587, .114)); }

/* "cover" fit an image into the screen, with zoom about a focus point */
vec2 coverUv(vec2 uv, vec2 img, float zoom, vec2 focus) {
  float sa = uRes.x / uRes.y, ia = img.x / img.y;
  vec2 s = sa > ia ? vec2(1.0, ia / sa) : vec2(sa / ia, 1.0);
  return (uv - focus) * s / zoom + focus;
}

/* ---- layer: black & white comic city (ink edges + halftone) ---- */
vec3 cityBW(vec2 uv) {
  vec2 par = uMouse * vec2(.008, .006) + vec2(sin(uTime * .05) * .012, cos(uTime * .04) * .006);
  vec2 cu = coverUv(uv + par, uCitySize, 1.06 + uPush * .22 + uCloseup * .3, vec2(.5, .55));
  vec3 c = texture2D(tCity, cu).rgb;
  float l = luma(c);
  // ink edges (cheap Sobel-like)
  vec2 px = 1.5 / uRes;
  float e = abs(luma(texture2D(tCity, cu + vec2(px.x, 0.)).rgb) - luma(texture2D(tCity, cu - vec2(px.x, 0.)).rgb))
          + abs(luma(texture2D(tCity, cu + vec2(0., px.y)).rgb) - luma(texture2D(tCity, cu - vec2(0., px.y)).rgb));
  float con = smoothstep(.0, .75, pow(clamp(l * 1.7, 0., 1.), .55)); // lift the night city into a grey comic print
  // halftone dots (rotated 45°)
  float cell = 5.5 * uDpr;
  mat2 r = mat2(.7071, -.7071, .7071, .7071);
  vec2 g = r * gl_FragCoord.xy / cell;
  vec2 f = fract(g) - .5;
  float dotR = sqrt(clamp(con, 0., 1.)) * .62;
  float ht = 1. - smoothstep(dotR - .08, dotR + .08, length(f));
  float bw = mix(con, ht * .95, .45);
  bw *= 1. - smoothstep(.06, .3, e) * .85;               // ink lines
  bw = .16 + bw * .8;
  return vec3(bw) * vec3(.94, .95, 1.0);
}

/* hero placement: returns uv inside the hero image (or <0 outside) */
vec2 heroUv(vec2 uv, out float inside) {
  vec2 p = vec2(uv.x, 1.0 - uv.y) * uRes;                // px, top-down
  float zoom = 1.0 + pow(uPush, 2.2) * 7.0;
  float h0 = uRes.y * mix(.96, .56, uMobile);
  float h = h0 * zoom;
  float w = h * uHeroSize.x / uHeroSize.y;
  vec2 rest = vec2(uHeroX * uRes.x + uMouse.x * -10., mix(uRes.y - h0 * (1. - uVisorPt.y), uRes.y * .25, uMobile) + (1. - uHeroIn) * uRes.y * .35);
  vec2 center = vec2(.5 * uRes.x, .46 * uRes.y);
  vec2 anchor = mix(rest, center, smoothstep(0., .6, uPush));
  vec2 tl = anchor - uVisorPt * vec2(w, h);
  vec2 hu = (p - tl) / vec2(w, h);
  inside = step(0., hu.x) * step(hu.x, 1.) * step(0., hu.y) * step(hu.y, 1.);
  return vec2(hu.x, 1.0 - hu.y);
}

/* ---- alternate environments seen through glitch strips (colour-graded variants of the city) ---- */
vec3 altEnv(vec2 uv, float k) {
  vec2 cu = coverUv(uv + vec2(k * .07 - .1, 0.), uCitySize, 1.15 + k * .1, vec2(.5, .55));
  vec3 c = texture2D(tCity, cu).rgb;
  float l = luma(c);
  float cell = 4.0 * uDpr;
  vec2 f = fract(gl_FragCoord.xy / cell) - .5;
  float dots = 1. - smoothstep(.25, .35, length(f));
  if (k < .5) {                       // multiverse: magenta → violet → blue
    vec3 g = mix(vec3(.22, .02, .45), vec3(1., .2, .75), smoothstep(.0, .5, l));
    g = mix(g, vec3(.35, .75, 1.), smoothstep(.45, .95, l));
    return g + dots * .08;
  } else if (k < 1.5) {               // pop-art: red/blue halftone print
    vec3 g = mix(vec3(.05, .1, .55), vec3(.95, .12, .18), smoothstep(.05, .45, l));
    return mix(g, vec3(1., .95, .85), dots * smoothstep(.3, .9, l));
  }
  return vec3(.02, .05, .08) + vec3(.1, .95, 1.) * smoothstep(.1, .8, l) * (.6 + dots * .4);   // neon blueprint
}

/* returns strip index (0,1,2) or -1 */
float stripAt(vec2 uv) {
  float t = uTime;
  float open = uStrips;
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    float y = .18 + fi * .27 + sin(t * .4 + fi * 2.1) * .03;
    float h = (.025 + .05 * hash(vec2(fi, floor(t * 1.5 + fi)))) * open;
    float jitter = step(.85, hash(vec2(fi, floor(t * 7.)))) * .02;
    if (abs(uv.y - y - jitter) < h) return fi;
  }
  return -1.;
}

vec3 scene1(vec2 uv) {
  vec3 c = cityBW(uv);
  float si = stripAt(uv);
  if (si >= 0.) {
    vec2 su = uv + vec2((hash(vec2(si, floor(uTime * 8.))) - .5) * .03, 0.);
    c = altEnv(su, si);
    // bright edge lines on strips
  }
  // depth haze: cold fog rising from the street
  c = mix(c, vec3(.55, .6, .7), smoothstep(.55, .0, uv.y) * .18);
  // giant layered word behind the hero (text texture, white)
  vec2 wu = coverUv(uv + vec2(uWordShift, 0.), uWordSize, 1.0 + uPush * .5, vec2(.5, .5));
  vec4 w = texture2D(tWord, wu);
  c = mix(c, vec3(.98), w.a * .92 * uReveal * (1. - uPush));
  // hero in full colour
  float inside;
  vec2 hu = heroUv(uv, inside);
  vec4 h = texture2D(tHero, hu) * inside;
  vec3 hc = h.rgb / max(h.a, 1e-3);
  hc = mix(vec3(luma(hc)), hc, 1.25);                      // a touch more saturation
  c = mix(c, hc, h.a * uHeroIn);
  return c;
}

/* ---- foreground parallax: near/far rain + floating dust (moves faster than the city) ---- */
vec3 foreground(vec2 uv, vec3 c) {
  float asp = uRes.x / uRes.y;
  for (int L = 0; L < 2; L++) {
    float fl = float(L);
    float depth = 1. + fl * 1.6;                         // near layer moves more
    vec2 p = vec2(uv.x * asp, uv.y) * (26. + fl * 30.);
    p += uMouse * vec2(-.6, .3) * (2. - fl) + vec2(uPush * (2. - fl) * 3., 0.);
    p.y += uTime * (9. + fl * 6.) / depth;
    p.x += p.y * .18;                                      // slant
    vec2 id = floor(p);
    float r = hash(id + fl * 17.);
    vec2 f = fract(p);
    float streak = step(.93, r) * smoothstep(.06, .0, abs(f.x - .5)) * smoothstep(0., .5, f.y) * smoothstep(1., .5, f.y);
    c += streak * mix(.22, .1, fl);
  }
  // dust motes catching cyan light
  vec2 q = vec2(uv.x * asp, uv.y) * 9. + vec2(uTime * .05, uTime * .03) + uMouse * .4;
  vec2 qi = floor(q); vec2 qf = fract(q) - .5;
  float m = step(.86, hash(qi + 3.)) * smoothstep(.06, .0, length(qf + (vec2(hash(qi), hash(qi + 1.)) - .5) * .6));
  c += m * vec3(.4, .85, 1.) * .5 * (.6 + .4 * sin(uTime * 2. + hash(qi) * 6.28));
  return c;
}

vec3 sceneVisor(vec2 uv) {
  float z = 1.0 + uCloseup * .08 + uPortal * 0.0;
  vec2 vu = coverUv(uv, uVisorSize, z, vec2(.5));
  vec3 c = texture2D(tVisor, vu).rgb;
  // portal: the lens shape grows; inside it the colour city appears
  float ps = 1.0 + pow(uPortal, 2.4) * 22.0;
  vec2 mu = (vu - .5) / ps + .5;
  float m = texture2D(tMask, mu).a * step(0., mu.x) * step(mu.x, 1.) * step(0., mu.y) * step(mu.y, 1.);
  float inMask = m * smoothstep(0., .12, uPortal);
  vec3 sky = texture2D(tSky, coverUv(uv, uSkySize, 1.35 - uPortal * .3, vec2(.5, .5))).rgb;
  // warm amber lens tint that fades as we pass through
  sky = mix(sky * vec3(1.25, .82, .45), sky * 1.08, smoothstep(.35, 1., uPortal));
  return mix(c, sky, inMask);
}

vec3 composite(vec2 uv) {
  // only evaluate the layers that are on screen
  if (uCloseup < .5) return foreground(uv, scene1(uv));
  if (uPortal < .92 || uColor < .01) return sceneVisor(uv);
  vec3 c = sceneVisor(uv);
  vec3 sky = texture2D(tSky, coverUv(uv + uMouse * vec2(.006, .004), uSkySize, 1.05 + (1. - uColor) * .2, vec2(.5))).rgb;
  return mix(c, sky * 1.05, smoothstep(.92, 1.0, uPortal) * uColor);
}

void main() {
  vec2 uv = vUv;
  float t = uTime;
  float g = uGlitch;

  // ---- slice glitch: horizontal bands jump sideways ----
  float band = floor(uv.y * mix(14., 46., hash(vec2(floor(t * 12.), 3.))) );
  float rb = hash(vec2(band, floor(t * 18.)));
  float shift = (rb - .5) * .16 * g * step(1. - g * .85, hash(vec2(band, floor(t * 9.) + 7.)));
  uv.x += shift;

  // ---- block pixelation ----
  vec2 blk = floor(uv * vec2(24., 14.));
  if (hash(blk + floor(t * 10.)) < g * .28) {
    float q = 60.0;
    uv = (floor(uv * q) + .5) / q;
  }

  // ---- RGB split ----
  float rgb = (.0025 + g * .028) * (1. + .5 * sin(t * 40.));
  vec3 col;
  if (g > .04) {
    col.r = composite(uv + vec2(rgb, 0.)).r;
    col.g = composite(uv).g;
    col.b = composite(uv - vec2(rgb, rgb * .3)).b;
  } else {
    col = composite(uv);
  }

  // flash colour bars during strong glitches
  float bar = step(.985 - g * .08, hash(vec2(floor(uv.y * 60.), floor(t * 20.))));
  col = mix(col, vec3(.13, .83, .93), bar * g * .55);

  // ---- film finish ----
  col *= .92 + .08 * sin(gl_FragCoord.y * 1.6);           // scanlines
  col += (hash(gl_FragCoord.xy + t) - .5) * .06;          // grain
  vec2 d = vUv - .5;
  col *= 1. - dot(d, d) * .9;                             // vignette
  col *= uReveal;                                         // fade from black
  gl_FragColor = vec4(col, 1.0);
}
`
