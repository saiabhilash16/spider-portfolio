/* =========================================================================
 * TEMPORARY ARTWORK — original vector illustrations of the hero.
 * Replace HERO with the final hero image (transparent PNG) when it arrives;
 * every effect, transition and layout keeps working with the new art.
 * ========================================================================= */

const INK = '#05070d'

/** Waist-up hero portrait, 1000 × 1300, transparent background. */
export function heroSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1300" width="1000" height="1300">
  <defs>
    <linearGradient id="suit" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#2b3449"/><stop offset=".45" stop-color="#161b28"/><stop offset="1" stop-color="#07090f"/>
    </linearGradient>
    <radialGradient id="hood" cx=".38" cy=".3" r=".8">
      <stop offset="0" stop-color="#2a3246"/><stop offset=".6" stop-color="#121621"/><stop offset="1" stop-color="#06080d"/>
    </radialGradient>
    <radialGradient id="face" cx=".4" cy=".35" r=".75">
      <stop offset="0" stop-color="#343d55"/><stop offset=".55" stop-color="#171c29"/><stop offset="1" stop-color="#090b12"/>
    </radialGradient>
    <linearGradient id="visor" x1="0" y1="0" x2="1" y2=".3">
      <stop offset="0" stop-color="#ffe2a0"/><stop offset=".3" stop-color="#ffb547"/><stop offset=".7" stop-color="#ff8a1f"/><stop offset="1" stop-color="#b8400a"/>
    </linearGradient>
    <linearGradient id="plate" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#36405a"/><stop offset="1" stop-color="#141925"/>
    </linearGradient>
    <filter id="gc" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="ga" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <pattern id="hex" width="28" height="48" patternUnits="userSpaceOnUse" patternTransform="scale(1.1)">
      <path d="M14 0 L28 8 L28 24 L14 32 L0 24 L0 8 Z M14 32 L14 48" fill="none" stroke="#ffffff" stroke-opacity=".05" stroke-width="1.5"/>
    </pattern>
  </defs>

  <!-- torso -->
  <path d="M0 1300 L0 1050 C40 905 130 818 262 782 C340 760 392 724 420 662 L580 662 C608 724 660 760 738 782 C870 818 960 905 1000 1050 L1000 1300 Z" fill="url(#suit)" stroke="${INK}" stroke-width="9"/>
  <path d="M0 1300 L0 1050 C40 905 130 818 262 782 C340 760 392 724 420 662 L580 662 C608 724 660 760 738 782 C870 818 960 905 1000 1050 L1000 1300 Z" fill="url(#hex)"/>
  <!-- shoulder armor -->
  <g stroke="${INK}" stroke-width="8">
    <path d="M70 960 C80 860 170 800 300 790 C330 830 330 900 300 950 C220 960 140 975 70 960 Z" fill="url(#plate)"/>
    <path d="M930 960 C920 860 830 800 700 790 C670 830 670 900 700 950 C780 960 860 975 930 960 Z" fill="url(#plate)"/>
  </g>
  <!-- chest plates -->
  <g stroke="${INK}" stroke-width="7">
    <path d="M318 868 L482 846 L474 1000 L334 1022 Z" fill="url(#plate)"/>
    <path d="M682 868 L518 846 L526 1000 L666 1022 Z" fill="url(#plate)"/>
    <path d="M360 1060 L480 1046 L478 1150 L372 1166 Z" fill="#1a2030"/>
    <path d="M640 1060 L520 1046 L522 1150 L628 1166 Z" fill="#1a2030"/>
  </g>
  <path d="M330 878 L470 860" stroke="#ffffff" stroke-opacity=".25" stroke-width="4"/>
  <!-- neck -->
  <path d="M410 700 C425 610 440 570 452 548 L548 548 C560 570 575 610 590 700 Z" fill="#0d1018" stroke="${INK}" stroke-width="7"/>
  <!-- circuit lines -->
  <g fill="none" stroke="#22d3ee" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" filter="url(#gc)">
    <polyline points="500,906 560,866 700,852 800,800 880,830"/>
    <polyline points="500,906 440,866 300,852 200,800 120,830"/>
    <polyline points="500,930 500,1040 462,1090 462,1300"/>
    <polyline points="500,930 500,1040 538,1090 538,1300"/>
    <polyline points="250,980 250,1120 210,1170 210,1300"/>
    <polyline points="750,980 750,1120 790,1170 790,1300"/>
    <path d="M420 700 C460 724 540 724 580 700"/>
  </g>
  <g fill="#22d3ee" filter="url(#gc)">
    <circle cx="700" cy="852" r="7"/><circle cx="300" cy="852" r="7"/><circle cx="462" cy="1090" r="6"/><circle cx="538" cy="1090" r="6"/>
  </g>
  <!-- emblem: a node with eight links (original) -->
  <g transform="translate(500 906)" filter="url(#gc)">
    <polygon points="0,-22 16,-16 22,0 16,16 0,22 -16,16 -22,0 -16,-16" fill="#22d3ee"/>
    <g stroke="#22d3ee" stroke-width="4" stroke-linecap="round">
      <line x1="0" y1="-30" x2="0" y2="-52"/><line x1="0" y1="30" x2="0" y2="52"/><line x1="-30" y1="0" x2="-52" y2="0"/><line x1="30" y1="0" x2="52" y2="0"/>
      <line x1="22" y1="-22" x2="38" y2="-38"/><line x1="-22" y1="-22" x2="-38" y2="-38"/><line x1="22" y1="22" x2="38" y2="38"/><line x1="-22" y1="22" x2="-38" y2="38"/>
    </g>
    <circle r="7" fill="#e6fbff"/>
  </g>
  <!-- hood -->
  <path d="M322 470 C312 296 398 188 500 184 C602 188 688 296 678 470 C672 566 626 654 566 706 L434 706 C374 654 328 566 322 470 Z" fill="url(#hood)" stroke="${INK}" stroke-width="9"/>
  <!-- mask / face -->
  <path d="M388 420 C388 316 438 262 500 262 C562 262 612 316 612 420 C612 512 572 590 500 612 C428 590 388 512 388 420 Z" fill="url(#face)" stroke="${INK}" stroke-width="6"/>
  <!-- cyan mask seams -->
  <g fill="none" stroke="#22d3ee" stroke-width="3.5" stroke-linecap="round" filter="url(#gc)">
    <path d="M500 272 L500 368"/>
    <path d="M404 452 C418 510 446 556 484 584"/>
    <path d="M596 452 C582 510 554 556 516 584"/>
  </g>
  <!-- wraparound amber visor -->
  <g filter="url(#ga)">
    <path d="M378 410 L404 380 C450 362 550 362 596 380 L622 410 L600 446 C552 462 448 462 400 446 Z" fill="url(#visor)" stroke="${INK}" stroke-width="7"/>
  </g>
  <path d="M410 388 C460 374 540 374 590 388" stroke="#fff6dc" stroke-width="5" stroke-linecap="round" opacity=".85"/>
  <path d="M430 432 L470 398 M548 436 L582 404" stroke="#fff6dc" stroke-width="3" opacity=".45"/>
  <path d="M500 372 L500 456" stroke="#7a2a05" stroke-width="3" opacity=".6"/>
  <!-- rim light (cyan, from behind-right) + warm bounce (left) -->
  <g fill="none" stroke-linecap="round" filter="url(#gc)">
    <path d="M604 214 C664 282 690 380 676 482 C668 566 630 640 584 694" stroke="#5eead4" stroke-width="6"/>
    <path d="M740 784 C872 820 960 906 998 1046" stroke="#5eead4" stroke-width="6"/>
    <path d="M600 300 C612 340 614 380 612 420" stroke="#a5f3fc" stroke-width="3" opacity=".8"/>
  </g>
  <g fill="none" stroke="#ffb547" stroke-linecap="round" opacity=".55">
    <path d="M334 360 C322 420 326 500 350 570" stroke-width="4"/>
    <path d="M262 782 C150 812 60 880 20 980" stroke-width="3"/>
  </g>
</svg>`
}

/** Extreme close-up of the visor, 1600 × 900. The lens reflects the city. */
export function visorSvg() {
  const bldg = Array.from({ length: 26 }, (_, i) => {
    const x = 120 + i * 52
    const h = 60 + ((i * 37) % 9) * 22 + (i % 3) * 30
    const lights = Array.from({ length: Math.floor(h / 26) }, (_, k) =>
      `<rect x="${x + 10 + (k % 2) * 16}" y="${470 - h + 10 + k * 22}" width="7" height="9" fill="${k % 4 ? '#fff2c4' : '#a5f3fc'}" opacity="${0.5 + (k % 3) * 0.2}"/>`).join('')
    return `<rect x="${x}" y="${470 - h}" width="44" height="${h}" fill="#2a1406" opacity=".75"/>${lights}`
  }).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" width="1600" height="900">
  <defs>
    <radialGradient id="fab" cx=".5" cy=".5" r=".8"><stop offset="0" stop-color="#1c2232"/><stop offset="1" stop-color="#05070c"/></radialGradient>
    <linearGradient id="lens" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffd27a"/><stop offset=".45" stop-color="#ff9d2e"/><stop offset=".8" stop-color="#d4560e"/><stop offset="1" stop-color="#6b2205"/>
    </linearGradient>
    <clipPath id="lc"><path d="M40 470 L200 250 C520 170 1080 170 1400 250 L1560 470 L1420 690 C1080 770 520 770 180 690 Z"/></clipPath>
    <pattern id="weave" width="18" height="18" patternUnits="userSpaceOnUse"><path d="M0 9 H18 M9 0 V18" stroke="#ffffff" stroke-opacity=".035"/></pattern>
    <filter id="g" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="9" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <rect width="1600" height="900" fill="url(#fab)"/>
  <rect width="1600" height="900" fill="url(#weave)"/>
  <g fill="none" stroke="#22d3ee" stroke-width="4" filter="url(#g)" opacity=".9">
    <path d="M800 0 V160"/><path d="M260 900 C320 800 400 760 520 744"/><path d="M1340 900 C1280 800 1200 760 1080 744"/>
  </g>
  <path d="M40 470 L200 250 C520 170 1080 170 1400 250 L1560 470 L1420 690 C1080 770 520 770 180 690 Z" fill="#05070d"/>
  <g clip-path="url(#lc)">
    <rect width="1600" height="900" fill="url(#lens)"/>
    <g transform="translate(0 40)">${bldg}</g>
    <rect y="510" width="1600" height="300" fill="#4a1a04" opacity=".35"/>
    <path d="M120 230 C500 300 1100 300 1480 230" stroke="#fff6dc" stroke-width="14" opacity=".55" fill="none"/>
    <path d="M300 640 L520 300 M380 650 L560 330" stroke="#fff6dc" stroke-width="6" opacity=".18"/>
    <ellipse cx="1180" cy="330" rx="90" ry="28" fill="#fff6dc" opacity=".25"/>
    <path d="M800 200 V760" stroke="#5a1f04" stroke-width="5" opacity=".6"/>
  </g>
  <path d="M40 470 L200 250 C520 170 1080 170 1400 250 L1560 470 L1420 690 C1080 770 520 770 180 690 Z" fill="none" stroke="#05070d" stroke-width="22"/>
  <path d="M60 470 L210 262 C520 184 1080 184 1390 262 L1540 470" fill="none" stroke="#5eead4" stroke-width="4" opacity=".7" filter="url(#g)"/>
</svg>`
}

/** White-on-transparent visor shape (same outline as the close-up) — the "portal" mask. */
export function visorMaskSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" width="1600" height="900">
  <path d="M40 470 L200 250 C520 170 1080 170 1400 250 L1560 470 L1420 690 C1080 770 520 770 180 690 Z" fill="#ffffff"/>
</svg>`
}

/** Where the visor sits inside the hero image (0–1, origin top-left) — the zoom target. */
export const HERO_VISOR = { x: 0.5, y: 0.318 }
