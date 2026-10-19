import { useEffect, useMemo, useRef, useState } from 'react'

type Prio = 'high' | 'med' | 'low'
type Task = { id: number; title: string; project: string; prio: Prio; due: 'today' | 'tomorrow' | 'week'; done: boolean; subs: { t: string; d: boolean }[] }

const PROJECTS = ['Personal', 'Work', 'Health', 'Learning']
const DOT: Record<string, string> = { Personal: '#ff8a7a', Work: '#6f86e8', Health: '#4cbf91', Learning: '#c58be0' }
const PRIO: Record<Prio, string> = { high: '#ef5a4c', med: '#f0a53a', low: '#9aa0a6' }
const DUE_LABEL = { today: 'Today', tomorrow: 'Tomorrow', week: 'This week' }

const seed: Task[] = [
  { id: 1, title: 'Send Q4 roadmap to the design team', project: 'Work', prio: 'high', due: 'today', done: false, subs: [{ t: 'Update milestones', d: true }, { t: 'Export PDF', d: false }] },
  { id: 2, title: 'Book dentist appointment', project: 'Health', prio: 'med', due: 'today', done: false, subs: [] },
  { id: 3, title: 'Read two chapters of Designing Data-Intensive Apps', project: 'Learning', prio: 'low', due: 'tomorrow', done: false, subs: [] },
  { id: 4, title: '30 minute run along the river', project: 'Health', prio: 'med', due: 'today', done: true, subs: [] },
  { id: 5, title: 'Plan weekend trip to Lisbon', project: 'Personal', prio: 'low', due: 'week', done: false, subs: [{ t: 'Compare flights', d: false }, { t: 'Reserve stay', d: false }] },
]

const FILTERS = ['All', ...PROJECTS]

function useLocal<T>(key: string, init: T) {
  const [v, setV] = useState<T>(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : init } catch { return init }
  })
  useEffect(() => { localStorage.setItem(key, JSON.stringify(v)) }, [key, v])
  return [v, setV] as const
}

function Ring({ pct }: { pct: number }) {
  const r = 52, c = 2 * Math.PI * r
  return (
    <svg width="132" height="132" viewBox="0 0 132 132" className="-rotate-90">
      <circle cx="66" cy="66" r={r} fill="none" stroke="rgba(11,11,12,.07)" strokeWidth="10" />
      <circle cx="66" cy="66" r={r} fill="none" stroke="#0b0b0c" strokeWidth="10" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - pct)} style={{ transition: 'stroke-dashoffset .8s cubic-bezier(.2,.7,.2,1)' }} />
    </svg>
  )
}

export default function App() {
  const [tasks, setTasks] = useLocal<Task[]>('tasks-v2', seed)
  const [text, setText] = useState('')
  const [project, setProject] = useState('Personal')
  const [prio, setPrio] = useState<Prio>('med')
  const [filter, setFilter] = useState('All')
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState<number | null>(null)
  const [focusId, setFocusId] = useState<number | null>(1)
  const [secs, setSecs] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const [mins, setMins] = useLocal('focus-min', 48)
  const [mode, setMode] = useState(25)
  const appRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!running) return
    const i = setInterval(() => setSecs(s => s - 1), 1000)
    return () => clearInterval(i)
  }, [running])
  useEffect(() => {
    if (secs <= 0) { setRunning(false); setMins(m => m + mode); setSecs(mode * 60) }
  }, [secs, mode, setMins])

  const add = () => {
    let t = text.trim()
    if (!t) return
    let p = project, pr = prio, due: Task['due'] = 'today'
    t = t.replace(/#(\w+)/g, (_, n) => { const m = PROJECTS.find(x => x.toLowerCase() === n.toLowerCase()); if (m) p = m; return m ? '' : `#${n}` })
    t = t.replace(/!(high|med|low)\b/gi, (_, n) => { pr = n.toLowerCase(); return '' })
    t = t.replace(/\b(tomorrow|today|this week)\b/gi, (_, n) => { due = n.toLowerCase() === 'tomorrow' ? 'tomorrow' : n.toLowerCase() === 'today' ? 'today' : 'week'; return '' })
    t = t.replace(/\s+/g, ' ').trim()
    if (!t) return
    setTasks([{ id: Date.now(), title: t, project: p, prio: pr, due, done: false, subs: [] }, ...tasks])
    setText('')
  }

  const toggle = (id: number) => setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t))
  const toggleSub = (id: number, i: number) => setTasks(tasks.map(t => t.id === id ? { ...t, subs: t.subs.map((s, j) => j === i ? { ...s, d: !s.d } : s) } : t))
  const remove = (id: number) => setTasks(tasks.filter(t => t.id !== id))

  const visible = useMemo(() => tasks
    .filter(t => (filter === 'All' || t.project === filter) && t.title.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => Number(a.done) - Number(b.done)), [tasks, filter, query])

  const done = tasks.filter(t => t.done).length
  const pct = tasks.length ? done / tasks.length : 0
  const focusTask = tasks.find(t => t.id === focusId)
  const mm = String(Math.floor(secs / 60)).padStart(2, '0'), ss = String(secs % 60).padStart(2, '0')
  const week = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  const hist = [true, true, false, true, true, done > 0, false]
  const bars = [3, 5, 2, 6, 4, done + 1, 0]

  const hour = new Date().getHours()
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="mesh min-h-screen">
      {/* nav */}
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2 text-[26px] tracking-tight" style={{ fontFamily: 'var(--font-serif)' }}>
          <svg width="26" height="22" viewBox="0 0 26 22"><path d="M0 22V11C0 5 5 0 12 0s14 5 14 11v11z" fill="#0b0b0c" /></svg>
          Doen
        </div>
        <div className="hidden gap-8 text-sm text-mute sm:flex">
          <a className="transition hover:text-ink" href="#app">Today</a>
          <a className="transition hover:text-ink" href="#focus">Focus</a>
          <a className="transition hover:text-ink" href="#insights">Insights</a>
        </div>
        <button onClick={() => appRef.current?.scrollIntoView()} className="rounded-full bg-ink px-5 py-2 text-sm text-white transition hover:scale-[1.03]">Open app</button>
      </nav>

      {/* hero */}
      <header className="mx-auto flex max-w-4xl flex-col items-center px-6 pb-16 pt-16 text-center sm:pt-24">
        <p className="rise mb-6 rounded-full border border-line bg-white/60 px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-mute backdrop-blur">New · Focus timer & streaks</p>
        <h1 className="rise text-[clamp(3rem,9vw,6.5rem)] font-normal leading-[0.95] tracking-[-0.045em]" style={{ animationDelay: '.08s' }}>
          Plan your day,<br /><span className="italic" style={{ fontFamily: 'var(--font-serif)', letterSpacing: '-0.02em' }}>then actually</span> finish it.
        </h1>
        <p className="rise mt-7 max-w-xl text-lg text-mute" style={{ animationDelay: '.16s' }}>
          Type naturally. Doen sorts projects, priorities and dates for you — then helps you focus until it’s done.
        </p>

        {/* composer */}
        <div className="rise mt-12 w-full max-w-xl rounded-[28px] bg-white/80 p-5 text-left shadow-[0_20px_60px_-20px_rgba(60,40,80,.25)] ring-1 ring-black/5 backdrop-blur-xl" style={{ animationDelay: '.24s' }}>
          <div className="flex items-center gap-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8a8a8e" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
            <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()}
              placeholder="Hey Doen… call mum tomorrow #personal !high" className="w-full bg-transparent text-lg outline-none placeholder:text-black/30" />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <select value={project} onChange={e => setProject(e.target.value)} className="rounded-full bg-black/[.05] px-3 py-1.5 text-sm outline-none transition hover:bg-black/10">
              {PROJECTS.map(p => <option key={p}>{p}</option>)}
            </select>
            {(['high', 'med', 'low'] as Prio[]).map(p => (
              <button key={p} onClick={() => setPrio(p)} aria-pressed={prio === p}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition ${prio === p ? 'bg-ink text-white' : 'bg-black/[.05] hover:bg-black/10'}`}>
                <span className="h-2 w-2 rounded-full" style={{ background: PRIO[p] }} />{p}
              </button>
            ))}
            <button onClick={add} aria-label="Add task" className="ml-auto flex h-10 w-10 items-center justify-center rounded-full bg-ink text-white transition hover:scale-110 active:scale-95">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
            </button>
          </div>
        </div>
        <p className="mt-4 font-mono text-xs text-mute">Try #work · !high · tomorrow · this week</p>
      </header>

      {/* app */}
      <main id="app" ref={appRef} className="mx-auto grid max-w-6xl gap-6 px-6 pb-24 pt-8 lg:grid-cols-[1fr_380px]">
        <section className="rounded-[32px] bg-white/70 p-6 ring-1 ring-black/5 backdrop-blur-xl sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-mute">{greet}</p>
              <h2 className="text-4xl tracking-tight" style={{ fontFamily: 'var(--font-serif)' }}>{tasks.length - done} things left today</h2>
            </div>
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search…" className="w-40 rounded-full bg-black/[.05] px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20" />
          </div>

          <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm transition ${filter === f ? 'bg-ink text-white' : 'bg-black/[.05] hover:bg-black/10'}`}>
                {f !== 'All' && <span className="h-2 w-2 rounded-full" style={{ background: DOT[f] }} />}{f}
              </button>
            ))}
          </div>

          <ul className="mt-6 divide-y divide-line">
            {visible.map(t => {
              const sd = t.subs.filter(s => s.d).length
              return (
                <li key={t.id} className="group py-4">
                  <div className="flex items-center gap-4">
                    <button onClick={() => toggle(t.id)} aria-label={t.done ? 'Mark incomplete' : 'Mark complete'}
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${t.done ? 'border-ink bg-ink pop' : 'border-black/25 hover:border-ink'}`}>
                      {t.done && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5 9-10" /></svg>}
                    </button>
                    <button onClick={() => t.subs.length && setOpen(open === t.id ? null : t.id)} className="min-w-0 flex-1 text-left">
                      <span className={`block truncate text-[17px] transition ${t.done ? 'text-mute line-through' : ''}`}>{t.title}</span>
                      <span className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-mute">
                        <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full" style={{ background: DOT[t.project] }} />{t.project}</span>
                        <span>{DUE_LABEL[t.due]}</span>
                        <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full" style={{ background: PRIO[t.prio] }} />{t.prio}</span>
                        {t.subs.length > 0 && <span className="font-mono">{sd}/{t.subs.length}</span>}
                      </span>
                    </button>
                    <div className="flex gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                      {!t.done && <button onClick={() => { setFocusId(t.id); document.getElementById('focus')?.scrollIntoView({ behavior: 'smooth', block: 'center' }) }} className="rounded-full bg-black/[.05] px-3 py-1.5 text-xs transition hover:bg-ink hover:text-white">Focus</button>}
                      <button onClick={() => remove(t.id)} aria-label="Delete task" className="rounded-full px-2 text-mute transition hover:text-[#ef5a4c]">✕</button>
                    </div>
                  </div>
                  {open === t.id && (
                    <ul className="rise ml-10 mt-3 space-y-2">
                      {t.subs.map((s, i) => (
                        <li key={i}>
                          <label className="flex cursor-pointer items-center gap-3 text-sm">
                            <input type="checkbox" checked={s.d} onChange={() => toggleSub(t.id, i)} className="h-4 w-4 accent-black" />
                            <span className={s.d ? 'text-mute line-through' : ''}>{s.t}</span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              )
            })}
            {visible.length === 0 && <li className="py-16 text-center text-mute">Nothing here. Enjoy the quiet.</li>}
          </ul>
        </section>

        <aside className="flex flex-col gap-6">
          <div id="focus" className="rounded-[32px] bg-ink p-7 text-white">
            <div className="flex items-center justify-between">
              <p className="font-mono text-xs uppercase tracking-widest text-white/50">Focus session</p>
              <div className="flex gap-1 rounded-full bg-white/10 p-1 text-xs">
                {[15, 25, 50].map(m => (
                  <button key={m} onClick={() => { setMode(m); setSecs(m * 60); setRunning(false) }} className={`rounded-full px-3 py-1 transition ${mode === m ? 'bg-white text-ink' : 'text-white/70 hover:text-white'}`}>{m}m</button>
                ))}
              </div>
            </div>
            <div className="my-6 text-center text-[88px] leading-none tracking-[-0.04em] tabular-nums" style={{ fontFamily: 'var(--font-sans)', fontWeight: 400 }}>{mm}:{ss}</div>
            <p className="truncate text-center text-sm text-white/60">{focusTask ? focusTask.title : 'Pick a task and hit Focus'}</p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setRunning(!running)} className="flex-1 rounded-full bg-white py-3 text-ink transition hover:scale-[1.02] active:scale-95">{running ? 'Pause' : 'Start'}</button>
              <button onClick={() => { setRunning(false); setSecs(mode * 60) }} className="rounded-full bg-white/10 px-5 py-3 transition hover:bg-white/20">Reset</button>
            </div>
          </div>

          <div id="insights" className="rounded-[32px] bg-white/70 p-7 ring-1 ring-black/5 backdrop-blur-xl">
            <p className="font-mono text-xs uppercase tracking-widest text-mute">Today’s progress</p>
            <div className="mt-4 flex items-center gap-6">
              <div className="relative">
                <Ring pct={pct} />
                <span className="absolute inset-0 flex items-center justify-center text-3xl tracking-tight">{Math.round(pct * 100)}%</span>
              </div>
              <div className="space-y-3 text-sm">
                <div><span className="block text-2xl tracking-tight">{done}/{tasks.length}</span><span className="text-mute">completed</span></div>
                <div><span className="block text-2xl tracking-tight">{mins}m</span><span className="text-mute">focused</span></div>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] bg-white/70 p-7 ring-1 ring-black/5 backdrop-blur-xl">
            <div className="flex items-baseline justify-between">
              <p className="font-mono text-xs uppercase tracking-widest text-mute">Streak</p>
              <p className="text-2xl tracking-tight" style={{ fontFamily: 'var(--font-serif)' }}>{hist.filter(Boolean).length} days 🔥</p>
            </div>
            <div className="mt-5 flex items-end justify-between gap-2">
              {week.map((d, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-16 w-full items-end"><div className="w-full rounded-lg transition-all duration-700" style={{ height: `${Math.max(bars[i], 0.4) * 16}%`, background: hist[i] ? 'linear-gradient(#ff9fae,#ffb7a8)' : 'rgba(11,11,12,.08)' }} /></div>
                  <span className="font-mono text-[11px] text-mute">{d}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>

      <footer className="px-6 pb-10 text-center font-mono text-xs text-mute">Doen — made for finishing things.</footer>
    </div>
  )
}
