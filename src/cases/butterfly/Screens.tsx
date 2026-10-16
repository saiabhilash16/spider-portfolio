import type { ReactNode } from 'react'
import { StatusBar } from '../common/Phone'
import { CATEGORIES, PLACES, SAMPLE_REVIEWS, type Category, type Place } from './data'
import { ButterflyMark } from './Logo'
import { MapView } from './MapView'
import { Scene } from './Scenes'

/* Butterfly app — high-fidelity concept screens (320 × 692 design size). */

export type ScreenId = 'home' | 'explore' | 'map' | 'place' | 'add' | 'success' | 'profile'
export type AppState = {
  screen: ScreenId
  placeId: string
  saved: string[]
  shared: Place[]
}
export type Go = (screen: ScreenId, placeId?: string) => void
type Props = { s: AppState; go?: Go; toggleSave?: (id: string) => void; share?: () => void }

const allPlaces = (s: AppState) => [...s.shared, ...PLACES]
const find = (s: AppState, id: string) => allPlaces(s).find((p) => p.id === id) ?? PLACES[0]

/* ------------------------------- shared bits ------------------------------- */
function Star({ size = 12 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden><path d="M10 1.5l2.6 5.6 6 .7-4.5 4.1 1.2 6L10 15l-5.3 2.9 1.2-6L1.4 7.8l6-.7z" fill="#FFB547" /></svg>
}
function GemBadge({ small = false }: { small?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-[#2F6BFF] font-semibold text-white ${small ? 'px-1.5 py-[1px] text-[9px]' : 'px-2 py-0.5 text-[10px]'}`}>
      <ButterflyMark size={small ? 9 : 11} className="[&_path]:fill-white [&_rect]:fill-white" /> Hidden gem
    </span>
  )
}
function Chip({ children, on = false, onClick }: { children: ReactNode; on?: boolean; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} tabIndex={onClick ? 0 : -1}
      className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${on ? 'bg-[#0B1530] text-white' : 'bg-white text-[#0B1530] ring-1 ring-[#E3E8F0]'}`}>
      {children}
    </button>
  )
}
const Icon = {
  home: <path d="M3 10l7-6 7 6v7a1 1 0 0 1-1 1h-4v-5H8v5H4a1 1 0 0 1-1-1z" />,
  explore: <><circle cx="10" cy="10" r="7" /><path d="M13 7l-2 4-4 2 2-4z" /></>,
  map: <><path d="M2 5l5-2 6 2 5-2v12l-5 2-6-2-5 2z" /><path d="M7 3v12M13 5v12" /></>,
  profile: <><circle cx="10" cy="7" r="3.5" /><path d="M3.5 17c1.2-3.2 3.6-4.5 6.5-4.5s5.3 1.3 6.5 4.5" /></>,
  heart: <path d="M10 17s-6.5-4-6.5-8.5A3.5 3.5 0 0 1 10 6a3.5 3.5 0 0 1 6.5 2.5C16.5 13 10 17 10 17z" />,
  search: <><circle cx="9" cy="9" r="5.5" /><path d="M13 13l4 4" /></>,
  pin: <><path d="M10 18s-6-5.5-6-10a6 6 0 0 1 12 0c0 4.5-6 10-6 10z" /><circle cx="10" cy="8" r="2" /></>,
  back: <path d="M12 4l-6 6 6 6" />,
  camera: <><rect x="2.5" y="5.5" width="15" height="11" rx="2.5" /><circle cx="10" cy="11" r="3" /><path d="M7 5.5l1.2-2h3.6l1.2 2" /></>,
  route: <><circle cx="5" cy="15" r="2" /><circle cx="15" cy="5" r="2" /><path d="M7 15h5a3 3 0 0 0 0-6H8a3 3 0 0 1 0-6h5" /></>,
}
function I({ d, size = 20, filled = false }: { d: ReactNode; size?: number; filled?: boolean }) {
  return <svg width={size} height={size} viewBox="0 0 20 20" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{d}</svg>
}

function TabBar({ s, go }: Props) {
  const tab = (id: ScreenId, label: string, icon: ReactNode) => {
    const on = s.screen === id || (id === 'explore' && s.screen === 'place')
    return (
      <button type="button" onClick={() => go?.(id)} tabIndex={go ? 0 : -1} aria-label={label}
        className={`flex w-14 flex-col items-center gap-0.5 text-[9.5px] font-semibold ${on ? 'text-[#2F6BFF]' : 'text-[#8A97AD]'}`}>
        <I d={icon} size={21} />{label}
      </button>
    )
  }
  return (
    <nav className="absolute inset-x-0 bottom-0 flex h-[78px] items-start justify-around border-t border-[#E9EDF3] bg-white/95 px-2 pt-2 backdrop-blur">
      {tab('home', 'Home', Icon.home)}
      {tab('explore', 'Explore', Icon.explore)}
      <button type="button" onClick={() => go?.('add')} tabIndex={go ? 0 : -1} aria-label="Add a discovery"
        className="-mt-5 flex h-[54px] w-[54px] items-center justify-center rounded-full bg-gradient-to-br from-[#5A8CFF] to-[#1F4FE0] text-white shadow-[0_10px_24px_-6px_rgba(47,107,255,0.7)] ring-4 ring-white">
        <svg width="22" height="22" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M10 4v12M4 10h12" /></svg>
      </button>
      {tab('map', 'Map', Icon.map)}
      {tab('profile', 'Me', Icon.profile)}
    </nav>
  )
}

function PlaceCard({ p, s, go, wide = false }: { p: Place; s: AppState; go?: Go; wide?: boolean }) {
  return (
    <button type="button" onClick={() => go?.('place', p.id)} tabIndex={go ? 0 : -1}
      className={`shrink-0 overflow-hidden rounded-[18px] bg-white text-left shadow-[0_8px_20px_-12px_rgba(11,21,48,0.35)] ring-1 ring-[#EEF1F6] ${wide ? 'w-full' : 'w-[196px]'}`}>
      <div className="relative">
        <Scene kind={p.scene} className={`block w-full ${wide ? 'h-[120px]' : 'h-[118px]'}`} />
        <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[9.5px] font-semibold text-[#0B1530]">{p.categories.join(' · ')}</span>
        {p.hidden && <span className="absolute right-2 top-2"><GemBadge small /></span>}
        {s.saved.includes(p.id) && <span className="absolute bottom-2 right-2 rounded-full bg-white p-1 text-[#E5484D]"><I d={Icon.heart} size={12} filled /></span>}
      </div>
      <div className="px-3 pb-3 pt-2">
        <div className="truncate text-[13px] font-semibold text-[#0B1530]">{p.name}</div>
        <div className="mt-0.5 flex items-center gap-1 text-[11px] text-[#5B6B85]"><Star /> <b className="text-[#0B1530]">{p.rating.toFixed(1)}</b> · {p.miles} mi</div>
        {wide && <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-[#5B6B85]">{p.description}</p>}
      </div>
    </button>
  )
}

/* --------------------------------- screens --------------------------------- */
export function HomeScreen({ s, go }: Props) {
  const near = [...PLACES].sort((a, b) => a.miles - b.miles).slice(0, 4)
  const gems = allPlaces(s).filter((p) => p.hidden)
  return (
    <div className="relative h-full bg-[#F7F2EA]">
      <StatusBar />
      <div className="h-[calc(100%-46px)] overflow-y-auto pb-24 [scrollbar-width:none]">
        <div className="flex items-center justify-between px-5 pt-1">
          <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#5B6B85]"><I d={Icon.pin} size={14} /> Baltimore, MD</div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0B1530] text-[12px] font-bold text-white">S</div>
        </div>
        <h1 className="px-5 pt-3 font-fraunces text-[27px] font-semibold leading-[1.08] tracking-[-0.01em] text-[#0B1530]">
          Discover what others found <em className="text-[#2F6BFF]">along the way</em>
        </h1>
        <div className="mx-5 mt-4 flex h-11 items-center gap-2 rounded-2xl bg-white px-3.5 text-[12px] text-[#8A97AD] ring-1 ring-[#E3E8F0]">
          <I d={Icon.search} size={16} /> Search cafés, food, hikes or hidden gems
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none]">
          <Chip on>All</Chip>{CATEGORIES.map((c) => <Chip key={c}>{c}</Chip>)}
        </div>
        <Section title="Near you" go={go} to="explore" />
        <div className="flex gap-3 overflow-x-auto px-5 pb-1 [scrollbar-width:none]">{near.map((p) => <PlaceCard key={p.id} p={p} s={s} go={go} />)}</div>
        <Section title="Hidden gems" badge go={go} to="map" />
        <div className="space-y-2.5 px-5">
          {gems.slice(0, 3).map((p) => (
            <button key={p.id} type="button" onClick={() => go?.('place', p.id)} tabIndex={go ? 0 : -1}
              className="flex w-full items-center gap-3 rounded-2xl bg-white p-2 text-left ring-1 ring-[#EEF1F6]">
              <Scene kind={p.scene} className="h-14 w-14 shrink-0 rounded-xl" />
              <div className="min-w-0">
                <div className="truncate text-[12.5px] font-semibold text-[#0B1530]">{p.name}</div>
                <div className="text-[10.5px] text-[#5B6B85]">by @{p.by} · {p.id.startsWith('new') ? 'Just now' : `${p.miles} mi`}</div>
              </div>
              <span className="ml-auto flex items-center gap-0.5 pr-1 text-[11px] font-semibold text-[#0B1530]"><Star size={11} />{p.rating.toFixed(1)}</span>
            </button>
          ))}
        </div>
      </div>
      <TabBar s={s} go={go} />
    </div>
  )
}
function Section({ title, badge, go, to }: { title: string; badge?: boolean; go?: Go; to: ScreenId }) {
  return (
    <div className="flex items-center justify-between px-5 pb-2.5 pt-5">
      <h2 className="flex items-center gap-2 text-[15px] font-bold text-[#0B1530]">{title}{badge && <ButterflyMark size={16} />}</h2>
      <button type="button" onClick={() => go?.(to)} tabIndex={go ? 0 : -1} className="text-[11px] font-semibold text-[#2F6BFF]">See all</button>
    </div>
  )
}

export function ExploreScreen({ s, go }: Props) {
  return (
    <div className="relative h-full bg-[#F7F2EA]">
      <StatusBar />
      <div className="px-5">
        <h1 className="font-fraunces text-[26px] font-semibold text-[#0B1530]">Explore</h1>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Chip on>≤ 5 mi</Chip><Chip>4.5★ +</Chip><Chip>Scenic</Chip><Chip>Coffee</Chip>
        </div>
        <div className="mt-3 flex items-center justify-between rounded-2xl bg-white px-3 py-2.5 ring-1 ring-[#E3E8F0]">
          <span className="flex items-center gap-2 text-[12px] font-semibold text-[#0B1530]"><ButterflyMark size={16} /> Only hidden gems</span>
          <span className="relative h-6 w-10 rounded-full bg-[#2F6BFF]"><span className="absolute right-0.5 top-0.5 h-5 w-5 rounded-full bg-white" /></span>
        </div>
      </div>
      <div className="mt-3 h-[calc(100%-46px-140px)] space-y-3 overflow-y-auto px-5 pb-24 [scrollbar-width:none]">
        {allPlaces(s).filter((p) => p.hidden).map((p) => <PlaceCard key={p.id} p={p} s={s} go={go} wide />)}
      </div>
      <TabBar s={s} go={go} />
    </div>
  )
}

export function MapScreen({ s, go }: Props) {
  const p = find(s, s.placeId || 'ridge')
  return (
    <div className="relative h-full">
      <MapView places={allPlaces(s).filter((x) => x.map)} selected={p.id} onSelect={go ? (id) => go('map', id) : undefined} compact viewBox="300 40 560 660" className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-white/90 to-white/0 pb-6"><StatusBar /></div>
      <div className="absolute left-4 right-4 top-[52px] flex h-10 items-center gap-2 rounded-2xl bg-white px-3 text-[11.5px] text-[#8A97AD] shadow-md"><I d={Icon.search} size={15} /> Search this area</div>
      <div className="absolute left-4 right-4 top-[100px] flex gap-1.5 overflow-hidden"><Chip on>Hidden gems</Chip><Chip>Scenic</Chip><Chip>Coffee</Chip></div>
      {/* bottom sheet — matches the spec: name, rating, categories, distance, View Place */}
      <div className="absolute inset-x-3 bottom-[90px] flex gap-3 rounded-[20px] bg-white p-2.5 shadow-[0_14px_30px_-10px_rgba(11,21,48,0.45)]">
        <Scene kind={p.scene} className="h-[86px] w-[86px] shrink-0 rounded-[14px]" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13.5px] font-bold text-[#0B1530]">{p.name}</div>
          <div className="mt-0.5 flex items-center gap-1 text-[11px] text-[#5B6B85]"><Star /> <b className="text-[#0B1530]">{p.rating.toFixed(1)}</b> · {p.categories.join(' · ')}</div>
          <div className="text-[11px] text-[#5B6B85]">{p.miles} miles away</div>
          <button type="button" onClick={() => go?.('place', p.id)} tabIndex={go ? 0 : -1} className="mt-1.5 rounded-full bg-[#0B1530] px-3 py-1 text-[11px] font-semibold text-white">View place</button>
        </div>
      </div>
      <TabBar s={s} go={go} />
    </div>
  )
}

export function PlaceScreen({ s, go, toggleSave }: Props) {
  const p = find(s, s.placeId)
  const saved = s.saved.includes(p.id)
  return (
    <div className="relative h-full bg-white">
      <div className="h-full overflow-y-auto pb-28 [scrollbar-width:none]">
        <div className="relative">
          <Scene kind={p.scene} className="block h-[300px] w-full" />
          <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/35 to-transparent"><StatusBar dark /></div>
          <div className="absolute left-4 right-4 top-[50px] flex justify-between">
            <button type="button" onClick={() => go?.('explore')} tabIndex={go ? 0 : -1} aria-label="Back" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#0B1530]"><I d={Icon.back} size={18} /></button>
            <button type="button" onClick={() => toggleSave?.(p.id)} tabIndex={go ? 0 : -1} aria-label={saved ? 'Unsave' : 'Save'} aria-pressed={saved}
              className={`flex h-9 w-9 items-center justify-center rounded-full bg-white/90 ${saved ? 'text-[#E5484D]' : 'text-[#0B1530]'}`}><I d={Icon.heart} size={18} filled={saved} /></button>
          </div>
          <div className="absolute bottom-3 left-4 flex gap-1.5">{[0, 1, 2].map((i) => <span key={i} className={`h-1.5 rounded-full ${i ? 'w-1.5 bg-white/60' : 'w-4 bg-white'}`} />)}</div>
        </div>
        <div className="-mt-4 rounded-t-[24px] bg-white px-5 pt-5">
          <div className="flex flex-wrap items-center gap-1.5">
            {p.hidden && <GemBadge />}
            {p.categories.map((c) => <span key={c} className="rounded-full bg-[#EAF2FF] px-2 py-0.5 text-[10px] font-semibold text-[#2F6BFF]">{c}</span>)}
          </div>
          <h1 className="mt-2 font-fraunces text-[24px] font-semibold leading-tight text-[#0B1530]">{p.name}</h1>
          <div className="mt-1 flex items-center gap-1 text-[12px] text-[#5B6B85]"><Star size={13} /> <b className="text-[#0B1530]">{p.rating.toFixed(1)}</b> ({p.reviews}) · {p.miles} mi away</div>
          {p.by && (
            <div className="mt-3 flex items-center gap-2 text-[11.5px] text-[#5B6B85]">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#8EC5FF] to-[#2F6BFF] text-[10px] font-bold text-white">{p.by[0].toUpperCase()}</span>
              Discovered by <b className="text-[#0B1530]">@{p.by}</b>
            </div>
          )}
          {/* QUICK TIP — the signature element */}
          <div className="mt-4 rounded-2xl border border-[#CFE0FF] bg-[#F2F7FF] p-3.5">
            <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#2F6BFF]">Quick tip</div>
            <p className="mt-1 text-[12.5px] font-medium leading-snug text-[#0B1530]">{p.tip}</p>
          </div>
          <p className="mt-4 text-[12.5px] leading-relaxed text-[#3A4760]">{p.description}</p>
          <div className="mt-5 text-[13px] font-bold text-[#0B1530]">Reviews</div>
          {SAMPLE_REVIEWS.map((r) => (
            <div key={r.user} className="mt-2.5 border-b border-[#EEF1F6] pb-2.5">
              <div className="flex items-center justify-between text-[11px]"><b className="text-[#0B1530]">@{r.user}</b><span className="flex">{Array.from({ length: r.stars }, (_, i) => <Star key={i} size={10} />)}</span></div>
              <p className="mt-1 text-[11.5px] leading-snug text-[#3A4760]">{r.text}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 flex gap-2 border-t border-[#EEF1F6] bg-white px-4 pb-7 pt-3">
        <button type="button" tabIndex={go ? 0 : -1} className="flex-1 rounded-full bg-[#0B1530] py-3 text-[12.5px] font-semibold text-white"><span className="inline-flex items-center gap-1.5"><I d={Icon.route} size={15} /> Directions</span></button>
        <button type="button" tabIndex={go ? 0 : -1} className="rounded-full px-4 py-3 text-[12.5px] font-semibold text-[#0B1530] ring-1 ring-[#E3E8F0]">Review</button>
      </div>
    </div>
  )
}

export function AddScreen({ s, go, share }: Props) {
  return (
    <div className="relative h-full bg-[#F7F2EA]">
      <StatusBar />
      <div className="flex items-center justify-between px-5">
        <button type="button" onClick={() => go?.('home')} tabIndex={go ? 0 : -1} className="text-[12px] font-semibold text-[#5B6B85]">Cancel</button>
        <span className="text-[13px] font-bold text-[#0B1530]">New discovery</span>
        <span className="w-10" />
      </div>
      <div className="h-[calc(100%-46px-24px-96px)] space-y-3 overflow-y-auto px-5 pt-3 [scrollbar-width:none]">
        <div className="relative overflow-hidden rounded-2xl">
          <Scene kind="sunset" className="block h-[150px] w-full" />
          <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-[#0B1530]"><I d={Icon.camera} size={12} /> Change photo</span>
        </div>
        <Field label="Name"><span className="text-[#0B1530]">Sunset Rock</span></Field>
        <div>
          <Label>Category</Label>
          <div className="mt-1 flex flex-wrap gap-1.5">{(['Scenic', 'Hiking', 'Nature', 'Coffee', 'Food'] as Category[]).map((c, i) => <Chip key={c} on={i === 0}>{c}</Chip>)}</div>
        </div>
        <div>
          <Label>Location</Label>
          <div className="relative mt-1 h-[86px] overflow-hidden rounded-2xl ring-1 ring-[#E3E8F0]">
            <MapView places={[]} compact className="absolute inset-0 h-full w-full scale-150" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full text-[#2F6BFF]"><I d={Icon.pin} size={30} filled /></span>
            <span className="absolute bottom-1.5 left-2 rounded-full bg-white px-2 py-0.5 text-[9.5px] font-semibold text-[#0B1530]">Using your location · drag to adjust</span>
          </div>
        </div>
        <Field label="Description" tall><span className="text-[#0B1530]">Small viewpoint halfway through the trail with an amazing sunset view.</span></Field>
        <Field label="Quick tip" required tall><span className="text-[#0B1530]">Visit around 6 PM for the best view.</span></Field>
        <label className="flex items-start gap-2 rounded-2xl bg-white p-3 text-[11px] leading-snug text-[#3A4760] ring-1 ring-[#E3E8F0]">
          <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded bg-[#2F6BFF] text-white"><svg width="10" height="10" viewBox="0 0 10 10"><path d="M1.5 5l2.3 2.3L8.5 2.5" stroke="#fff" strokeWidth="1.6" fill="none" /></svg></span>
          This spot is publicly accessible — not private property.
        </label>
        <div className="h-4" />
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-[#F7F2EA] px-5 pb-8 pt-3">
        <button type="button" onClick={share} tabIndex={go ? 0 : -1} className="w-full rounded-full bg-gradient-to-r from-[#3B7BFF] to-[#1F4FE0] py-3.5 text-[13px] font-bold text-white shadow-[0_12px_24px_-10px_rgba(47,107,255,0.8)]">Share discovery</button>
      </div>
    </div>
  )
}
function Label({ children, required }: { children: ReactNode; required?: boolean }) {
  return <div className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#5B6B85]">{children}{required && <span className="ml-1 text-[#2F6BFF]">• required</span>}</div>
}
function Field({ label, children, required, tall }: { label: string; children: ReactNode; required?: boolean; tall?: boolean }) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      <div className={`mt-1 rounded-2xl bg-white px-3.5 text-[12px] leading-snug ring-1 ${required ? 'ring-[#9DBDFF]' : 'ring-[#E3E8F0]'} ${tall ? 'py-2.5' : 'flex h-10 items-center'}`}>{children}</div>
    </div>
  )
}

export function SuccessScreen({ s, go }: Props) {
  const p = s.shared[0] ?? PLACES[1]
  return (
    <div className="relative flex h-full flex-col items-center bg-gradient-to-b from-[#EAF2FF] to-[#F7F2EA] px-6 text-center">
      <StatusBar />
      <div className="relative mt-14">
        <div className="absolute inset-0 -m-6 animate-ping rounded-full bg-[#2F6BFF]/10" />
        <ButterflyMark size={84} className="bf-flutter relative" />
      </div>
      <h1 className="mt-6 font-fraunces text-[28px] font-semibold text-[#0B1530]">Discovery shared!</h1>
      <p className="mt-2 text-[12.5px] leading-snug text-[#5B6B85]">Explorers nearby can now find <b className="text-[#0B1530]">{p.name}</b> in New Discoveries and on the map.</p>
      <div className="mt-6 w-full"><PlaceCard p={p} s={s} wide /></div>
      <button type="button" onClick={() => go?.('home')} tabIndex={go ? 0 : -1} className="mt-auto mb-10 w-full rounded-full bg-[#0B1530] py-3.5 text-[13px] font-bold text-white">Back to discovering</button>
    </div>
  )
}

export function ProfileScreen({ s, go }: Props) {
  const mine = allPlaces(s).filter((p) => p.by === 'sai')
  return (
    <div className="relative h-full bg-[#F7F2EA]">
      <StatusBar />
      <div className="flex flex-col items-center px-5 pt-3 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#8EC5FF] to-[#1F4FE0] text-[28px] font-bold text-white ring-4 ring-white">S</div>
        <div className="mt-2 font-fraunces text-[22px] font-semibold text-[#0B1530]">Sai</div>
        <div className="text-[11.5px] text-[#5B6B85]">Baltimore, MD · Trail & café explorer</div>
        <div className="mt-4 grid w-full grid-cols-3 rounded-2xl bg-white py-3 ring-1 ring-[#E3E8F0]">
          {[[mine.length, 'Discoveries'], [6, 'Reviews'], [s.saved.length, 'Saved']].map(([n, l]) => (
            <div key={l as string}><div className="text-[17px] font-bold text-[#0B1530]">{n}</div><div className="text-[10px] text-[#5B6B85]">{l}</div></div>
          ))}
        </div>
      </div>
      <div className="mt-4 flex gap-4 border-b border-[#E3E8F0] px-5 text-[12px] font-semibold"><span className="border-b-2 border-[#2F6BFF] pb-2 text-[#0B1530]">Discoveries</span><span className="text-[#8A97AD]">Reviews</span><span className="text-[#8A97AD]">Saved</span></div>
      <div className="grid grid-cols-2 gap-2.5 px-5 pt-3">
        {mine.map((p) => (
          <button key={p.id} type="button" onClick={() => go?.('place', p.id)} tabIndex={go ? 0 : -1} className="overflow-hidden rounded-2xl bg-white text-left ring-1 ring-[#EEF1F6]">
            <Scene kind={p.scene} className="block h-[90px] w-full" />
            <div className="truncate px-2.5 py-2 text-[11.5px] font-semibold text-[#0B1530]">{p.name}</div>
          </button>
        ))}
      </div>
      <TabBar s={s} go={go} />
    </div>
  )
}

export function AppScreen(props: Props) {
  switch (props.s.screen) {
    case 'home': return <HomeScreen {...props} />
    case 'explore': return <ExploreScreen {...props} />
    case 'map': return <MapScreen {...props} />
    case 'place': return <PlaceScreen {...props} />
    case 'add': return <AddScreen {...props} />
    case 'success': return <SuccessScreen {...props} />
    case 'profile': return <ProfileScreen {...props} />
  }
}

export const staticState = (screen: ScreenId, placeId = 'ridge'): AppState => ({ screen, placeId, saved: ['sunset'], shared: [] })
