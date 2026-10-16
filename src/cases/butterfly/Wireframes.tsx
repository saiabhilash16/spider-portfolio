import type { ReactNode } from 'react'

/* Low-fidelity wireframes: structure and priorities before any visual design. */
const B = ({ h, w = '100%', label, dark = false, round = 10, className = '' }: { h: number; w?: string | number; label?: string; dark?: boolean; round?: number; className?: string }) => (
  <div className={`flex items-center justify-center text-[10px] font-semibold uppercase tracking-wider ${dark ? 'bg-[#9AA5B5] text-white' : 'bg-[#E1E6ED] text-[#7A8699]'} ${className}`}
    style={{ height: h, width: w, borderRadius: round }}>{label}</div>
)
const Line = ({ w }: { w: string }) => <div className="h-2 rounded bg-[#CBD3DE]" style={{ width: w }} />
const Note = ({ n, children }: { n: number; children: ReactNode }) => (
  <span className="absolute z-10 flex h-5 w-5 items-center justify-center rounded-full bg-[#2F6BFF] text-[10px] font-bold text-white ring-2 ring-white" style={{}}>{n}<span className="sr-only">{children}</span></span>
)

function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="relative h-[460px] w-[214px] shrink-0 overflow-hidden rounded-[30px] border-[6px] border-[#C5CDD8] bg-white p-3">
      <div className="mx-auto mb-2 h-3 w-14 rounded-full bg-[#C5CDD8]" />
      {children}
      <div className="absolute inset-x-0 bottom-0 flex h-12 items-center justify-around border-t-2 border-dashed border-[#D5DCE5] bg-white px-3">
        {[0, 1, 2, 3, 4].map((i) => <div key={i} className={i === 2 ? 'h-8 w-8 rounded-full bg-[#9AA5B5]' : 'h-4 w-4 rounded bg-[#D5DCE5]'} />)}
      </div>
    </div>
  )
}

export const WIREFRAMES: { title: string; notes: string[]; frame: ReactNode }[] = [
  {
    title: 'Home',
    notes: ['Location context first — "what is near me?"', 'One search bar for every kind of place', 'Hidden gems get their own row, not buried in results'],
    frame: (
      <Frame>
        <div className="relative space-y-2">
          <div className="relative"><span className="-left-1 -top-1"><Note n={1}>location</Note></span><div className="ml-6"><Line w="45%" /></div></div>
          <Line w="85%" /><Line w="65%" />
          <div className="relative"><span className="absolute -left-1 top-2"><Note n={2}>search</Note></span><B h={30} round={12} label="search" /></div>
          <div className="flex gap-1.5">{[0, 1, 2, 3].map((i) => <B key={i} h={16} w={38} round={8} />)}</div>
          <Line w="30%" />
          <div className="flex gap-2"><B h={110} w="62%" label="photo card" /><B h={110} w="38%" /></div>
          <div className="relative"><span className="absolute -left-1 -top-1"><Note n={3}>gems</Note></span><div className="ml-6"><Line w="35%" /></div></div>
          {[0, 1].map((i) => <div key={i} className="flex gap-2"><B h={34} w={34} /><div className="flex-1 space-y-1.5 pt-1"><Line w="80%" /><Line w="50%" /></div></div>)}
        </div>
      </Frame>
    ),
  },
  {
    title: 'Map',
    notes: ['Pins carry meaning: hidden gems use the butterfly glyph', 'Filters float above the map, one tap away', 'A preview sheet keeps the map visible'],
    frame: (
      <Frame>
        <div className="relative h-[380px] rounded-xl bg-[repeating-linear-gradient(45deg,#EEF1F5_0_10px,#F6F8FB_10px_20px)]">
          <div className="absolute left-2 right-2 top-2"><B h={26} round={10} label="search area" dark /></div>
          <div className="absolute left-2 top-11 flex gap-1"><span className="absolute -left-2 -top-2"><Note n={2}>filters</Note></span>{[0, 1, 2].map((i) => <B key={i} h={14} w={40} round={7} dark />)}</div>
          {[[40, 120], [120, 90], [150, 170], [70, 210]].map(([x, y], i) => (
            <div key={i} className="absolute" style={{ left: x, top: y }}>
              {i === 0 && <span className="absolute -left-5 -top-3"><Note n={1}>pins</Note></span>}
              <div className="h-5 w-5 rotate-45 rounded-[50%_50%_50%_0] bg-[#9AA5B5]" />
            </div>
          ))}
          <div className="absolute bottom-3 left-2 right-2 flex gap-2 rounded-xl bg-white p-2 shadow">
            <span className="absolute -left-2 -top-2"><Note n={3}>sheet</Note></span>
            <B h={50} w={50} /><div className="flex-1 space-y-1.5 pt-1"><Line w="90%" /><Line w="60%" /><B h={14} w={60} round={7} dark /></div>
          </div>
        </div>
      </Frame>
    ),
  },
  {
    title: 'Place details',
    notes: ['Large photo — show what it actually looks like', 'Quick Tip sits above the description', 'Credit the explorer who found it'],
    frame: (
      <Frame>
        <div className="-mx-3 -mt-5"><span className="absolute left-2 top-8"><Note n={1}>photo</Note></span><B h={150} round={0} label="photo" /></div>
        <div className="mt-3 space-y-2">
          <Line w="70%" /><Line w="40%" />
          <div className="relative flex items-center gap-2"><span className="absolute -left-1"><Note n={3}>credit</Note></span><div className="ml-6 h-4 w-4 rounded-full bg-[#CBD3DE]" /><Line w="45%" /></div>
          <div className="relative mt-4 rounded-xl border-2 border-dashed border-[#9AB8F5] bg-[#F3F7FF] p-2">
            <span className="absolute -left-2 -top-2"><Note n={2}>tip</Note></span>
            <div className="text-[9px] font-bold tracking-widest text-[#6E8FD6]">QUICK TIP</div><div className="mt-1 space-y-1"><Line w="95%" /><Line w="60%" /></div>
          </div>
          <Line w="100%" /><Line w="90%" /><Line w="70%" />
        </div>
      </Frame>
    ),
  },
  {
    title: 'Add a discovery',
    notes: ['Photo first — it is the reason to share', 'Location auto-fills; drag the pin on a trail', 'Tip is required; a public-access check protects privacy'],
    frame: (
      <Frame>
        <div className="space-y-2">
          <div className="relative"><span className="absolute -left-1 -top-1"><Note n={1}>photo</Note></span><B h={90} label="+ photo" /></div>
          <B h={24} round={8} label="name" />
          <div className="flex gap-1.5">{[0, 1, 2].map((i) => <B key={i} h={16} w={42} round={8} />)}</div>
          <div className="relative"><span className="absolute -left-1 -top-1"><Note n={2}>location</Note></span><B h={56} label="map · drag pin" /></div>
          <B h={34} round={8} label="description" />
          <div className="relative"><span className="absolute -left-1 -top-1"><Note n={3}>tip</Note></span><div className="rounded-lg border-2 border-dashed border-[#9AB8F5]"><B h={30} round={6} label="quick tip *" /></div></div>
          <B h={28} round={14} label="share discovery" dark />
        </div>
      </Frame>
    ),
  },
]
