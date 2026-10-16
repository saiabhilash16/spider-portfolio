/* Scene 1 compositor — one full-screen pass.
 *  skyline (depth-parallax camera, B&W + halftone + fog + light sweep)
 *  → colour glitch strips (same plate, full colour, shifted)
 *  → hero (full colour, zooms toward the face, depth relief)
 *  → eye close-up: a sharper, pixel-aligned version of the same lens blended in while zooming (no image jump)
 *  → lens reflection layer (clipped by the lens matte)
 *  → RGB displacement, slice glitch, grain, scanlines, vignette            */

export const vert = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }
`

export const frag = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform vec2 uRes; uniform float uTime; uniform vec2 uMouse; uniform float uDpr;

uniform sampler2D tSky;  uniform vec2 uSkySize;  uniform sampler2D tSkyD; uniform float uHasSkyD; uniform vec2 uSkyFocus;
uniform sampler2D tHero; uniform vec2 uHeroSize; uniform sampler2D tHeroD; uniform float uHasHeroD;
uniform sampler2D tMask; uniform float uHasMask; uniform vec4 uCrop;   // eye close-up = upscaled crop of hero, uCrop = (x,y,w,h) in hero image space (top-left origin)
uniform sampler2D tLens; uniform float uHasLens; uniform vec2 uLensC;   // lens matte (same framing as the close-up), lens centre in crop space
uniform sampler2D tRefl; uniform vec2 uReflSize; uniform float uReflect; // what the lens reflects (Scene 2 hand-off)
uniform sampler2D tFg; uniform vec2 uFgSize; uniform float uHasFg;

uniform float uTrafficY; uniform float uSynthTraffic; uniform float uMaxZoom; uniform float uTraffic, uReveal, uHeroIn, uPush, uMaskMix, uGlitch, uStrips, uSweep, uMono, uHalftone, uGrain;
uniform float uHeroX, uHeroH; uniform vec2 uFace;
uniform float uPortal;   // 0..1 — the lens reflection fractures and becomes the multiverse portal

float hash(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float luma(vec3 c){ return dot(c, vec3(.299,.587,.114)); }
float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y); }
float fbm(vec2 p){ float v = 0., a = .5; for (int i = 0; i < 4; i++){ v += a * vnoise(p); p *= 2.03; a *= .5; } return v; }
/* distance to the nearest Voronoi cell edge — the 'cracks' of reality */
float cracks(vec2 p){
  vec2 i = floor(p), f = fract(p); float d1 = 8., d2 = 8.;
  for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++){
    vec2 g = vec2(float(x), float(y)); vec2 o = vec2(hash(i + g), hash(i + g + 17.));
    float d = length(g + o - f); if (d < d1){ d2 = d1; d1 = d; } else if (d < d2) d2 = d;
  }
  return d2 - d1;
}
vec2 cover(vec2 uv, vec2 img, float zoom, vec2 focus){
  float sa = uRes.x / uRes.y, ia = img.x / img.y;
  vec2 s = sa > ia ? vec2(1., ia / sa) : vec2(sa / ia, 1.);
  return (uv - focus) * s / zoom + focus;
}

/* ------------------------------ skyline ------------------------------ */
vec3 skyColor(vec2 uv, float shift){
  // depth-parallax camera: near pixels move/zoom more than far pixels
  float zoom = 1.04 + uPush * .18;
  vec2 cu = cover(uv + vec2(shift, 0.), uSkySize, zoom, uSkyFocus);
  float d = uHasSkyD > .5 ? texture2D(tSkyD, cu).r : smoothstep(1., .2, cu.y) * .7; // fallback: lower = nearer
  vec2 cam = uMouse * vec2(.018, .01) + vec2(sin(uTime * .05) * .006, 0.);
  cu += cam * (d - .35);
  cu = uSkyFocus + (cu - uSkyFocus) / (1. + uPush * .22 * d);
  return texture2D(tSky, cu).rgb;
}
vec3 skyline(vec2 uv){
  vec3 c = skyColor(uv, 0.);
  float l = luma(c);
  // B&W cinematic grade
  float g = smoothstep(.02, .85, l);
  g = pow(g, .9);
  vec3 mono = vec3(g) * vec3(.93, .96, 1.02);
  // halftone print in the mid-tones
  float cell = 5. * uDpr;
  mat2 r = mat2(.7071, -.7071, .7071, .7071);
  vec2 f = fract(r * gl_FragCoord.xy / cell) - .5;
  float dotR = sqrt(clamp(g, 0., 1.)) * .65;
  float ht = 1. - smoothstep(dotR - .08, dotR + .08, length(f));
  mono = mix(mono, vec3(ht) * .95, uHalftone * smoothstep(.1, .5, g) * smoothstep(.95, .6, g));
  vec3 col = mix(c, mono, uMono);
  // light sweep across the city (scroll-driven)
  float sweep = exp(-pow((uv.x - uv.y * .35) - (uSweep * 2.2 - .6), 2.) * 40.);
  col += sweep * vec3(.55, .62, .75) * .35;
  // atmospheric fog from the street
  col = mix(col, vec3(.62, .66, .74), smoothstep(.5, 0., uv.y) * .22);
  return col;
}

/* colourful alternate-world strips: same plate, full colour, hue-pushed & shifted */
vec3 altWorld(vec2 uv, float k){
  vec3 c = skyColor(uv, (k - 1.) * .05);
  if (k < .5) return c.brg * vec3(1.3, .7, 1.4) + vec3(.15, 0., .2);   // magenta/violet
  if (k < 1.5) return vec3(c.r * 1.5 + .1, c.g * .35, c.b * .6);       // red print
  return c.gbr * vec3(.6, 1.2, 1.5);                                   // cyan
}
float stripAt(vec2 uv){
  for (int i = 0; i < 3; i++){
    float fi = float(i);
    float y = .2 + fi * .26 + sin(uTime * .35 + fi * 2.) * .025;
    float h = (.02 + .05 * hash(vec2(fi, floor(uTime * 1.3 + fi)))) * uStrips;
    if (abs(uv.y - y) < h) return fi;
  }
  return -1.;
}

/* distant traffic: moving head/tail-light points along the far streets (visible before the city is lit) */
vec3 traffic(vec2 uv){
  vec3 c = vec3(0.);
  for (int i = 0; i < 3; i++){
    float fi = float(i);
    float y = uTrafficY + fi * .045;
    float dir = mod(fi, 2.) < .5 ? 1. : -1.;
    float x = fract(uv.x * (14. + fi * 6.) + uTime * dir * (.35 + fi * .12));
    float id = floor(uv.x * (14. + fi * 6.) + uTime * dir * (.35 + fi * .12));
    float on = step(.45, hash(vec2(id, fi)));
    float pt = smoothstep(.0025 + fi * .0006, .0, abs(uv.y - y)) * smoothstep(.18, .0, abs(x - .5)) * on;
    c += pt * (dir > 0. ? vec3(1., .18, .12) : vec3(1., .92, .75)) * 1.4;
  }
  return c;
}
/* floating particles at two depths (foreground depth cue) */
vec3 motes(vec2 uv){
  vec3 c = vec3(0.);
  float asp = uRes.x / uRes.y;
  for (int L = 0; L < 2; L++){
    float fl = float(L);
    vec2 q = vec2(uv.x * asp, uv.y) * (5. + fl * 7.) + vec2(uTime * .03, uTime * (.05 + fl * .03)) + uMouse * (.5 - fl * .3) + vec2(0., uPush * (2. - fl));
    vec2 id = floor(q), f = fract(q) - .5;
    float r = hash(id + fl * 9.);
    vec2 o = (vec2(hash(id + 1.), hash(id + 2.)) - .5) * .7;
    float size = mix(.09, .035, fl);
    float m = step(.8, r) * smoothstep(size, 0., length(f - o));
    c += m * mix(vec3(.55, .7, 1.), vec3(1., .5, .55), step(.93, r)) * (.35 + .25 * sin(uTime * 1.5 + r * 30.));
  }
  return c;
}

/* -------------------------------- hero -------------------------------- */
float gLens = 0.;   // white-lens mask at the current pixel (set by hero(), used by the portal)
vec4 hero(vec2 uv){
  vec2 p = vec2(uv.x, 1. - uv.y) * uRes;
  float zoom = 1. + pow(uPush, 2.4) * (uMaxZoom - 1.);
  float h0 = uRes.y * uHeroH, h = h0 * zoom, w = h * uHeroSize.x / uHeroSize.y;
  vec2 faceRest = vec2(uHeroX * uRes.x - uMouse.x * 14., uRes.y - h0 * (1. - uFace.y) + (1. - uHeroIn) * uRes.y * .3);
  vec2 faceNow = mix(faceRest, vec2(.5 * uRes.x, .5 * uRes.y), smoothstep(.4, .9, uPush)); // stays on the right while the title is up
  vec2 hu = (p - (faceNow - uFace * vec2(w, h))) / vec2(w, h);
  if (hu.x < 0. || hu.x > 1. || hu.y < 0. || hu.y > 1.) return vec4(0.);
  vec2 tu = vec2(hu.x, 1. - hu.y);
  if (uHasHeroD > .5) tu += uMouse * vec2(-.004, .003) * (texture2D(tHeroD, tu).r - .5);
  vec4 c = texture2D(tHero, tu);
  // eye close-up: same pixels, higher quality — mapped through the crop rectangle so it lines up exactly
  vec2 iu = vec2(tu.x, 1. - tu.y);                       // hero image space, top-left origin
  vec2 mu = (iu - uCrop.xy) / uCrop.zw;                  // close-up space, top-left origin
  float inCrop = step(0., mu.x) * step(mu.x, 1.) * step(0., mu.y) * step(mu.y, 1.);
  if (inCrop > 0.){
    vec2 e = min(mu, 1. - mu);
    float edge = smoothstep(0., .08, min(e.x, e.y));     // soft border back to the hero texture
    vec2 gu = vec2(mu.x, 1. - mu.y);
    if (uHasMask > .5) c.rgb = mix(c.rgb, texture2D(tMask, gu).rgb, uMaskMix * edge);
    if (uHasLens > .5) gLens = texture2D(tLens, gu).r * edge;
    // reflection inside the lens
    if (uHasLens > .5 && uReflect > 0.){
      float lens = texture2D(tLens, gu).r * edge;
      vec2 lu = (mu - uLensC) * vec2(uCrop.z / uCrop.w * uHeroSize.x / uHeroSize.y, 1.);
      float r2 = dot(lu, lu);
      vec2 ru = .5 + lu * (.9 - r2 * .9) + uMouse * vec2(.02, -.012) + vec2(uTime * .004, 0.);  // convex-lens warp
      ru = cover(ru, uReflSize, 1., vec2(.5));
      vec3 refl = texture2D(tRefl, ru).rgb;
      refl = mix(vec3(luma(refl)), refl, .7) * vec3(.8, .92, 1.1);   // cool glass tint
      float fres = .55 + .45 * smoothstep(.0, .25, sqrt(r2));
      vec3 lensCol = 1. - (1. - c.rgb * .8) * (1. - refl * fres * .85);  // screen the reflection over the pale lens
      lensCol += exp(-pow((lu.x + lu.y * .6) * 9. + .6, 2.)) * .25;      // specular streak
      c.rgb = mix(c.rgb, lensCol, lens * uReflect);
    }
  }
  c.rgb = mix(vec3(luma(c.rgb)), c.rgb, 1.15) * (1. + .12 * uSweep);   // rich colour
  return vec4(c.rgb, c.a * uHeroIn);
}

/* ----------------------------- composite ----------------------------- */
vec3 scene(vec2 uv){
  vec3 c = skyline(uv);
  float s = stripAt(uv);
  if (s >= 0.) c = altWorld(uv + vec2((hash(vec2(s, floor(uTime * 8.))) - .5) * .03, 0.), s);
  // 'the city emerges': only the brightest lights at first, then everything
  float thr = mix(.75, -.2, uReveal);
  vec3 raw = skyColor(uv, 0.);
  float lit = smoothstep(thr, thr + .18, luma(raw));
  c = mix(raw * lit * uTraffic * .9, c, smoothstep(.35, 1., uReveal));
  c *= mix(1., uReveal, .25);
  c += traffic(uv) * (1. - uPush) * smoothstep(.0, .3, uTraffic) * uSynthTraffic;
  vec4 h = hero(uv);
  c = mix(c, h.rgb, h.a);
  if (uHasFg > .5){
    vec2 fu = cover(uv + uMouse * vec2(-.03, .015) , uFgSize, 1.05 + uPush * .6, vec2(.5, .2));
    vec4 fg = texture2D(tFg, fu);
    c = mix(c, fg.rgb, fg.a * (1. - uMaskMix));
  }
  c += motes(uv) * (1. - uMaskMix) * uTraffic;
  return c;
}

void main(){
  vec2 uv = vUv; float t = uTime, g = uGlitch;
  float asp = uRes.x / uRes.y;
  vec2 pc = (uv - .5) * vec2(asp, 1.);
  float pr = length(pc);
  // portal: the reflection swirls inward before it breaks
  if (uPortal > 0.){
    float sw = pow(smoothstep(.25, 1., uPortal), 2.) * 5. * exp(-pr * 1.8);   // swirl starts once the lens is full of energy
    float cs = cos(sw), sn = sin(sw);
    vec2 q = mat2(cs, -sn, sn, cs) * pc * (1. + uPortal * .35);
    uv = q / vec2(asp, 1.) + .5;
    g = max(g, uPortal * .35 * (1. - uPortal));
  }
  // slice glitch
  float band = floor(uv.y * mix(14., 48., hash(vec2(floor(t * 12.), 1.))));
  uv.x += (hash(vec2(band, floor(t * 18.))) - .5) * .16 * g * step(1. - g * .8, hash(vec2(band, floor(t * 9.) + 4.)));
  // block pixelation
  vec2 blk = floor(uv * vec2(24., 14.));
  if (hash(blk + floor(t * 10.)) < g * .22) uv = (floor(uv * 70.) + .5) / 70.;
  // RGB displacement
  vec3 col;
  float rgb = .002 + g * .03;
  if (g > .04){ col.r = scene(uv + vec2(rgb, 0.)).r; col.b = scene(uv - vec2(rgb, rgb * .3)).b; col.g = scene(uv).g; }
  else col = scene(uv);
  float lensHere = gLens * uHasLens;
  // portal: reality fractures, purple / magenta energy pours through the cracks, an orange ring opens
  if (uPortal > 0.){
    float ang = atan(pc.y, pc.x);
    float e = fbm(vec2(ang * 1.6 + t * .4, pr * 4. - t * 1.6)) ;
    vec3 energy = mix(vec3(.30, .06, .62), vec3(1., .18, .70), e) + vec3(.18, .35, 1.) * pow(e, 4.) * 2.;
    // 1) the reflection INSIDE THE WHITE LENS turns into dimensional energy first
    float lensE = lensHere * smoothstep(0., .35, uPortal);
    // 2) cracks start at the lens and spread outward;  3) the opening grows out of the lens
    float R = smoothstep(.3, 1., uPortal) * 1.25 * max(asp, 1.);           // grows past the screen edge
    float crack = 1. - smoothstep(0., .05, cracks(pc * 6. + vec2(0., t * .05)));
    float spread = smoothstep(.12, .7, uPortal) * 1.4 * max(asp, 1.);     // how far the fracture has travelled from the lens
    float crackZone = (1. - lensHere) * smoothstep(spread + .2, spread - .2, pr) * smoothstep(.1, .3, uPortal) * smoothstep(R - .1, R + .1, pr);
    col += crack * crackZone * mix(vec3(1., .55, .15), vec3(.85, .3, 1.), e) * 1.6;     // light leaking through cracks
    float inside = max(lensE, smoothstep(R, R - .12, pr));
    col = mix(col, energy * (.6 + .6 * smoothstep(0., max(R, .3), pr)), inside);
    col += vec3(1., .55, .2) * lensHere * (1. - smoothstep(.0, .35, uPortal)) * uPortal * 2.;   // the glass flares as it changes
    float ring = exp(-pow((pr - R) * 9., 2.)) * smoothstep(.0, .08, R);
    col += vec3(1., .5, .12) * ring * 1.8;                                   // orange dimensional rim
    col += vec3(1., .45, .1) * exp(-pr * 6.) * uPortal * .4;
  }
  // finish
  col *= .93 + .07 * sin(gl_FragCoord.y * 1.5);
  col += (hash(gl_FragCoord.xy + t) - .5) * uGrain;
  vec2 d = vUv - .5; col *= 1. - dot(d, d) * .95;
  gl_FragColor = vec4(col, 1.);
}
`
