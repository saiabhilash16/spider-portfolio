import { useMemo, type ReactElement } from 'react'

/* ==========================================================================================
 *  NOIR CITY — original layered artwork (vector). viewBox 1600 × 1000.
 *  Every <g data-layer> is animated independently (parallax / scroll camera).
 *  The whole world is defined once (#world) so glitch strips can re-use it live via <use>.
 * ========================================================================================== */

function rng(seed: number) {
  return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646 }
}

type Tower = { x: number; w: number; h: number; tiers: number; spire: number; ant: boolean }
function skyline(seed: number, x0: number, x1: number, base: number, minH: number, maxH: number, minW: number, maxW: number) {
  const r = rng(seed)
  const out: Tower[] = []
  let x = x0
  while (x < x1) {
    const w = minW + r() * (maxW - minW)
    out.push({ x, w, h: minH + Math.pow(r(), 1.4) * (maxH - minH), tiers: r() < .55 ? 1 + Math.floor(r() * 3) : 0, spire: r() < .14 ? 30 + r() * 70 : 0, ant: r() < .35 })
    x += w + r() * 6 - 2
  }
  return out.map((t) => ({ ...t, base }))
}

function towerPath(t: Tower & { base: number }) {
  // stepped "wedding-cake" silhouette
  let cx = t.x, cw = t.w, top = t.base - t.h
  const steps: [number, number, number][] = []
  for (let i = 0; i < t.tiers; i++) {
    const inset = cw * .14
    const rise = 14 + i * 6
    steps.push([cx + inset, cw - inset * 2, top - rise])
    cx += inset; cw -= inset * 2; top -= rise
  }
  // build outline going up the left side, across, down the right
  let path = `M${t.x} ${t.base} V${t.base - t.h}`
  let px = t.x, pw = t.w, ptop = t.base - t.h
  for (const [sx, sw, stop] of steps) { path += ` H${sx} V${stop}`; px = sx; pw = sw; ptop = stop }
  if (t.spire) path += ` H${px + pw / 2 - 3} L${px + pw / 2} ${ptop - t.spire} L${px + pw / 2 + 3} ${ptop} H${px + pw}`
  else path += ` H${px + pw}`
  for (let i = steps.length - 1; i >= 0; i--) {
    const prev = i === 0 ? [t.x, t.w, t.base - t.h] : steps[i - 1]
    path += ` V${prev[2]} H${(prev[0] as number) + (prev[1] as number)}`
  }
  path += ` V${t.base} Z`
  return { path, topX: px + pw / 2, topY: ptop - t.spire }
}

/* --------------------------------------- hero --------------------------------------- */
/** Original masked hero, standing, backlit. Local box 420 × 780 (feet at y=780). */
export function HeroFigure({ rim = '#ff2d4d' }: { rim?: string }) {
  return (
    <g>
      {/* long coat panels (sway is animated on these groups) */}
      <g data-coat="l" style={{ transformOrigin: '110px 400px' }}>
        <path d="M104 392 C90 520 64 650 14 782 L146 774 C138 650 136 540 140 466 Z" fill="#07070a" />
        <path d="M104 392 C90 520 64 650 14 782" stroke="#2a0d12" strokeWidth="2" fill="none" />
      </g>
      <g data-coat="r" style={{ transformOrigin: '314px 400px' }}>
        <path d="M318 392 C344 520 384 640 436 766 L288 776 C292 650 296 540 292 466 Z" fill="#07070a" />
        <path d="M318 392 C344 520 384 640 436 766" stroke={rim} strokeWidth="3" fill="none" opacity=".85" filter="url(#rimGlow)" />
      </g>
      {/* legs */}
      <path d="M120 468 L208 468 L200 600 L188 780 L134 780 L142 600 Z" fill="#0b0b10" />
      <path d="M216 468 L304 468 L292 600 L300 780 L246 780 L232 600 Z" fill="#0b0b10" />
      <path d="M296 476 L288 600 L296 776" stroke={rim} strokeWidth="2.5" fill="none" opacity=".9" filter="url(#rimGlow)" />
      {/* boots */}
      <path d="M130 740 L190 740 L194 780 L124 780 Z M244 740 L302 740 L306 780 L238 780 Z" fill="#050507" />
      {/* torso */}
      <path d="M68 212 C110 190 150 186 212 188 C274 186 316 190 356 212 C372 262 364 332 334 382 L312 470 L112 470 L92 382 C62 332 54 262 68 212 Z" fill="#0d0d13" />
      {/* armour plates — barely lit */}
      <path d="M128 232 L204 226 L200 318 L136 326 Z M296 232 L220 226 L224 318 L288 326 Z" fill="#14141c" stroke="#1d1d27" strokeWidth="2" />
      <path d="M150 350 L204 344 L202 410 L156 416 Z M274 350 L220 344 L222 410 L268 416 Z" fill="#111118" />
      {/* belt */}
      <path d="M112 452 L312 452 L314 478 L110 478 Z" fill="#050507" />
      <rect x="198" y="456" width="28" height="18" rx="3" fill={rim} opacity=".9" filter="url(#rimGlow)" />
      {/* chest emblem — original: a node with radiating links */}
      <g transform="translate(212 268)" filter="url(#rimGlow)">
        <path d="M0 -12 L10 0 L0 12 L-10 0 Z" fill={rim} />
        <path d="M0 -16 V-40 M0 16 V40 M-14 0 H-38 M14 0 H38 M10 -10 L26 -26 M-10 -10 L-26 -26 M10 10 L26 26 M-10 10 L-26 26" stroke={rim} strokeWidth="3" strokeLinecap="round" opacity=".85" />
      </g>
      {/* arms */}
      <path d="M68 214 C38 240 28 300 32 362 L42 470 C44 500 58 522 74 522 C88 518 92 498 90 470 L94 370 C98 322 102 282 108 250 Z" fill="#0b0b10" />
      <path d="M356 214 C386 240 396 300 392 362 L382 470 C380 500 366 522 350 522 C336 518 332 498 334 470 L330 370 C326 322 322 282 316 250 Z" fill="#0b0b10" />
      <path d="M362 222 C390 250 398 306 392 362 L382 470 C380 498 368 518 354 522" stroke={rim} strokeWidth="3" fill="none" filter="url(#rimGlow)" />
      {/* gauntlets */}
      <path d="M36 420 L92 420 L90 470 L40 470 Z M332 420 L388 420 L384 470 L334 470 Z" fill="#14141c" />
      <path d="M40 432 H90 M334 432 H386" stroke={rim} strokeWidth="2" opacity=".8" />
      {/* hood drape + neck */}
      <path d="M160 150 C176 190 248 190 264 150 L284 204 L140 204 Z" fill="#09090d" />
      {/* hood + mask */}
      <path d="M150 74 C150 28 178 0 212 0 C246 0 274 28 274 74 C276 112 266 144 248 164 L176 164 C158 144 148 112 150 74 Z" fill="#0a0a0f" />
      <path d="M176 44 C186 26 238 26 248 44 C258 66 256 112 244 138 C232 156 192 156 180 138 C168 112 166 66 176 44 Z" fill="#111119" />
      {/* visor */}
      <g filter="url(#visorGlow)">
        <path d="M168 76 C190 68 234 68 256 76 L250 92 C228 86 196 86 174 92 Z" fill="#ff3355" />
        <path d="M180 79 C198 74 226 74 244 79" stroke="#ffe3e8" strokeWidth="3" strokeLinecap="round" />
      </g>
      {/* rim light on hood + shoulders */}
      <g stroke={rim} fill="none" strokeLinecap="round" filter="url(#rimGlow)">
        <path d="M232 4 C258 12 274 40 274 74 C276 112 266 144 248 164" strokeWidth="3.5" />
        <path d="M264 192 C300 196 334 202 356 214" strokeWidth="4" />
        <path d="M150 74 C150 50 158 30 172 16" strokeWidth="1.5" opacity=".45" />
      </g>
    </g>
  )
}

/* --------------------------------------- world --------------------------------------- */
export function World({ heroX, lift = 0 }: { heroX: number; lift?: number }) {
  const far = useMemo(() => skyline(11, -120, 1720, 760, 120, 380, 46, 110).map((t) => ({ t, ...towerPath(t) })), [])
  const mid = useMemo(() => skyline(23, -160, 1760, 860, 160, 460, 70, 150).map((t) => ({ t, ...towerPath(t) })), [])
  const signs = useMemo(() => {
    const r = rng(77)
    return mid.filter(() => r() < .22).slice(0, 7).map((b, i) => ({ x: b.t.x + b.t.w * .18, y: b.t.base - b.t.h * (.35 + r() * .4), vertical: i % 2 === 0, word: ['HOTEL', 'OPEN', 'NOODLE', '24H', 'BAR', 'ARCADE', 'DINER'][i] }))
  }, [mid])
  const heroY = 1000 - 780 * .82 - 22 - lift
  const ringX = heroX, ringY = heroY + 90 * .82
  return (
    <g id="world">
      {/* SKY */}
      <g data-layer="sky">
        <rect x="-400" y="-300" width="2400" height="1600" fill="url(#sky)" />
        {/* smog bands */}
        <rect x="-400" y="520" width="2400" height="260" fill="url(#smog)" opacity=".7" />
      </g>
      {/* HALO — the red neon ring behind the hero's head */}
      <g data-layer="ring" style={{ transformOrigin: `${ringX}px ${ringY}px` }}>
        <circle cx={ringX} cy={ringY} r="420" fill="url(#halo)" />
        <circle cx={ringX} cy={ringY} r="236" fill="none" stroke="#ff2d4d" strokeWidth="5" filter="url(#neonGlow)" data-flicker />
        <circle cx={ringX} cy={ringY} r="236" fill="none" stroke="#ffd6dc" strokeWidth="1.5" opacity=".9" />
        <circle cx={ringX} cy={ringY} r="262" fill="none" stroke="#ff2d4d" strokeWidth="1" opacity=".35" strokeDasharray="2 10" />
      </g>
      {/* FAR SKYLINE */}
      <g data-layer="far">
        {far.map(({ t, path, topX, topY }, i) => (
          <g key={i}>
            <path d={path} fill="#16070c" />
            <path d={path} fill="url(#winFar)" opacity=".75" />
            {t.ant && <path d={`M${topX} ${topY} v-26`} stroke="#16070c" strokeWidth="2" />}
            {t.ant && <circle cx={topX} cy={topY - 27} r="2.4" fill="#ff3355" data-blink={i % 3} />}
          </g>
        ))}
      </g>
      {/* GIANT LAYERED WORD (between skylines) */}
      <g data-layer="word">
        <text x="800" y="640" textAnchor="middle" className="nx-bigword" fill="none" stroke="#ff2d4d" strokeWidth="2" opacity=".55">ENGINEER</text>
      </g>
      {/* MID SKYLINE + NEON SIGNS */}
      <g data-layer="mid">
        {mid.map(({ path }, i) => (
          <g key={i}>
            <path d={path} fill="#0a0408" />
            <path d={path} fill={i % 2 ? 'url(#winMidA)' : 'url(#winMidB)'} />
          </g>
        ))}
        {signs.map((s, i) => (
          <g key={i} data-sign={i} filter="url(#neonGlow)">
            {s.vertical ? (
              <>
                <rect x={s.x} y={s.y} width="26" height={s.word.length * 24 + 12} rx="3" fill="none" stroke="#ff2d4d" strokeWidth="2.5" />
                {[...s.word].map((c, k) => <text key={k} x={s.x + 13} y={s.y + 26 + k * 24} textAnchor="middle" className="nx-sign" fill="#ff8095">{c}</text>)}
              </>
            ) : (
              <>
                <rect x={s.x} y={s.y} width={s.word.length * 18 + 20} height="30" rx="4" fill="none" stroke={i % 3 === 1 ? '#ffb020' : '#ff2d4d'} strokeWidth="2.5" />
                <text x={s.x + 10} y={s.y + 22} className="nx-sign" fill={i % 3 === 1 ? '#ffd27a' : '#ff8095'} letterSpacing="3">{s.word}</text>
              </>
            )}
          </g>
        ))}
        {/* street-level glow */}
        <rect x="-200" y="780" width="2000" height="120" fill="url(#streetGlow)" />
      </g>
      {/* NEAR ROOFTOPS */}
      <g data-layer="near">
        <path d="M-200 1000 V840 H140 V800 H220 V840 H420 V1000 Z" fill="#040205" />
        {/* water tower (left) */}
        <g transform="translate(150 640)">
          <path d="M0 0 H90 L84 120 H6 Z" fill="#050306" />
          <path d="M-6 0 L45 -42 L96 0 Z" fill="#050306" />
          <path d="M10 120 L0 200 M80 120 L90 200 M45 120 V200 M4 160 H86" stroke="#050306" strokeWidth="6" />
          <path d="M84 6 L78 118" stroke="#ff2d4d" strokeWidth="2" opacity=".55" />
        </g>
        <path d="M1240 1000 V860 H1460 V820 H1520 V860 H1800 V1000 Z" fill="#040205" />
        <path d="M1470 820 V700 M1470 720 H1500 M1470 750 H1490" stroke="#050306" strokeWidth="5" />
        <circle cx="1470" cy="696" r="3" fill="#ff3355" data-blink="1" />
      </g>
      {/* HERO on the ledge */}
      <g data-layer="hero" style={{ transformOrigin: `${heroX}px 1000px` }}>
        <path d={`M${heroX - 330} 1000 V${1000 - 22 - lift} H${heroX + 330} V1000 Z`} fill="#030203" />
        <path d={`M${heroX - 330} ${1000 - 22 - lift} H${heroX + 330}`} stroke="#ff2d4d" strokeWidth="2" opacity=".7" filter="url(#rimGlow)" />
        <g transform={`translate(${heroX - 210 * .82} ${heroY}) scale(.82)`}>
          <HeroFigure />
        </g>
      </g>
    </g>
  )
}

/* --------------------------------------- defs --------------------------------------- */
export function Defs() {
  const winTile = (id: string, seed: number, w: number, h: number, cw: number, ch: number, lit: number, colors: string[], op: number) => {
    const r = rng(seed)
    const cells: ReactElement[] = []
    for (let y = 0; y < h; y += ch) for (let x = 0; x < w; x += cw) {
      const v = r()
      if (v < lit) cells.push(<rect key={`${x}-${y}`} x={x + cw * .25} y={y + ch * .25} width={cw * .5} height={ch * .45} fill={colors[Math.floor(r() * colors.length)]} opacity={op * (.5 + r() * .5)} />)
    }
    return <pattern id={id} width={w} height={h} patternUnits="userSpaceOnUse">{cells}</pattern>
  }
  return (
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#020103" /><stop offset=".45" stopColor="#12030a" /><stop offset=".72" stopColor="#3a0714" /><stop offset="1" stopColor="#12030a" />
      </linearGradient>
      <linearGradient id="smog" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ff2d4d" stopOpacity="0" /><stop offset=".5" stopColor="#ff2d4d" stopOpacity=".16" /><stop offset="1" stopColor="#ff2d4d" stopOpacity="0" />
      </linearGradient>
      <radialGradient id="halo">
        <stop offset="0" stopColor="#ff2d4d" stopOpacity=".55" /><stop offset=".45" stopColor="#c4122e" stopOpacity=".25" /><stop offset="1" stopColor="#c4122e" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="streetGlow" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ff2d4d" stopOpacity="0" /><stop offset="1" stopColor="#ff2d4d" stopOpacity=".28" />
      </linearGradient>
      {winTile('winFar', 5, 84, 120, 7, 10, .16, ['#ff4d64', '#ffb35c', '#ffd9a0'], .55)}
      {winTile('winMidA', 9, 120, 168, 12, 14, .13, ['#ff3355', '#ffb35c', '#fff0d0'], .85)}
      {winTile('winMidB', 13, 132, 154, 11, 14, .1, ['#ffcf7a', '#ff3355'], .8)}
      <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="6" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
      <filter id="rimGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
      <filter id="visorGlow" x="-100%" y="-200%" width="300%" height="500%">
        <feGaussianBlur stdDeviation="7" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
      {/* glitch tints for the duplicated strips */}
      <filter id="tintRed"><feColorMatrix type="matrix" values="1.6 0 0 0 .1  0 .2 0 0 0  0 0 .3 0 0  0 0 0 1 0" /></filter>
      <filter id="tintCyan"><feColorMatrix type="matrix" values=".1 0 0 0 0  0 1.2 0 0 .05  0 0 1.6 0 .1  0 0 0 1 0" /></filter>
      <filter id="tintWhite"><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .9 0" /></filter>
    </defs>
  )
}
