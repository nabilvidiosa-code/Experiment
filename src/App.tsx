import React, { useEffect, useRef, useState } from 'react'

type Look = { img: string; title: string; sub: string; bg: string; mood: string }

const looks: Look[] = [
  { img: '/k/3.png', title: 'Sunny Pinafore', sub: 'Twin-bun weekend', bg: 'linear-gradient(160deg,#ffe3cc,#ffb38a)', mood: 'Playful' },
  { img: '/k/4.png', title: 'Mint Ribbon', sub: 'Ponytail breeze', bg: 'linear-gradient(160deg,#dcfce7,#a7e8c4)', mood: 'Fresh' },
  { img: '/k/2.png', title: 'Lace & Glasses', sub: 'Gothic sweetheart', bg: 'linear-gradient(160deg,#e9d5ff,#c4a3f5)', mood: 'Dreamy' },
  { img: '/k/1.png', title: 'Cozy Knit', sub: 'Soft pink sweater', bg: 'linear-gradient(160deg,#ffd6e7,#ff9ec7)', mood: 'Gentle' },
  { img: '/k/7.png', title: 'Kikyo Blush', sub: 'Uniform smile', bg: 'linear-gradient(160deg,#ffc2d9,#f472b6)', mood: 'Shy' },
  { img: '/k/5.png', title: 'Windswept', sub: 'Looking back', bg: 'linear-gradient(160deg,#fecdd3,#fb7185)', mood: 'Wistful' },
  { img: '/k/6.png', title: 'Chain Frills', sub: 'Party night', bg: 'linear-gradient(160deg,#ddd6fe,#a78bfa)', mood: 'Bold' },
]

const traits = [
  { n: '01', t: 'Sweet tooth', d: 'Her love for cakes is legendary — every bite is pure happiness.', c: '#ffd9e8', img: '/k/7.png' },
  { n: '02', t: 'Kind to all', d: 'She sees people for who they are, never for the rumors.', c: '#f0defc', img: '/k/1.png' },
  { n: '03', t: 'Bright smile', d: 'A sunny presence that makes everyone feel welcome.', c: '#ffe7d6', img: '/k/3.png' },
  { n: '04', t: 'Hard worker', d: 'Diligent and studious, yet never forgets the little joys.', c: '#dbf5e7', img: '/k/4.png' },
]

const Sparkle = ({ className = '', style }: { className?: string; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor" aria-hidden><path d="M12 0c.6 6.2 5.8 11.4 12 12-6.2.6-11.4 5.8-12 12-.6-6.2-5.8-11.4-12-12C6.2 11.4 11.4 6.2 12 0z" /></svg>
)
const Heart = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden><path d="M12 21s-7.5-4.6-10-9.3C.3 8.4 2.3 4 6.3 4c2.2 0 3.6 1.2 5.7 3.4C14.1 5.2 15.5 4 17.7 4c4 0 6 4.4 4.3 7.7C19.5 16.4 12 21 12 21z" /></svg>
)

/** Card fan driven by a smoothed float position (lerped every frame) for buttery motion. */
function CardFan({ onChange }: { onChange: (i: number) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const target = useRef(3)
  const pos = useRef(3)
  const [p, setP] = useState(3)
  const [sm, setSm] = useState(() => innerWidth < 640)
  useEffect(() => { const f = () => setSm(innerWidth < 640); addEventListener('resize', f); return () => removeEventListener('resize', f) }, [])
  const sx = useRef(0)
  const max = looks.length - 1
  const clamp = (v: number) => Math.min(max, Math.max(0, v))

  useEffect(() => {
    let raf = 0
    const tick = () => {
      const diff = target.current - pos.current
      pos.current += diff * 0.1
      if (Math.abs(diff) < 0.0005) pos.current = target.current
      setP(pos.current)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  // Hovering: cursor's horizontal position across the fan maps smoothly to the focused card.
  const last = useRef(3)
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const prog = Math.min(1, Math.max(0, (e.clientX - r.left - r.width * 0.1) / (r.width * 0.8)))
    target.current = prog * max
    const idx = Math.round(target.current)
    if (idx !== last.current) { last.current = idx; onChange(idx) }
  }
  const go = (i: number) => { target.current = clamp(i); last.current = i; onChange(i) }

  return (
    <div
      ref={ref}
      onPointerMove={(e) => e.pointerType === 'mouse' && onMove(e)}
      onPointerLeave={() => go(Math.round(target.current))}
      onTouchStart={(e) => { sx.current = e.touches[0].clientX }}
      onTouchEnd={(e) => { const d = e.changedTouches[0].clientX - sx.current; if (Math.abs(d) > 40) go(Math.round(target.current) + (d < 0 ? 1 : -1)) }}
      className="relative mx-auto h-[380px] w-full max-w-6xl select-none sm:h-[480px]"
      aria-label="Kaoruko outfit cards — scroll to browse"
    >
      {looks.map((c, i) => {
        const off = i - p
        const abs = Math.abs(off)
        const lift = Math.max(0, 1 - abs)
        return (
          <button
            key={c.title}
            onClick={() => go(i)}
            className="absolute bottom-0 left-1/2 h-[330px] w-[210px] overflow-hidden rounded-[28px] border-[4px] border-white bg-white text-left will-change-transform sm:h-[420px] sm:w-[270px] sm:rounded-[34px] sm:border-[5px]"
            style={{
              background: 'linear-gradient(180deg,#ffffff,#fff5f9)',
              transform: `translate3d(calc(-50% + ${off * (sm ? 120 : 200)}px), ${abs * abs * 14 + abs * 22 - lift * 28}px, 0) rotate(${off * 6.5}deg) scale(${1 - Math.min(abs, 3) * 0.07 + lift * 0.04})`,
              zIndex: 100 - Math.round(abs * 10),
              opacity: Math.max(0, Math.min(1, 3.6 - abs)),
              boxShadow: `0 ${30 + lift * 20}px ${60 + lift * 30}px -24px rgba(214,51,108,${0.25 + lift * 0.3})`,
            }}
          >
            <img src={c.img} alt={c.title} draggable={false} className="absolute inset-0 h-full w-full object-cover object-top" style={{ transform: `scale(${1.05 + lift * 0.05}) translateX(${off * -8}px)` }} />
            <span className="breathe absolute right-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-bold text-berry shadow" style={{ opacity: lift, transform: `scale(${0.6 + lift * 0.4})` }}>♡ {c.mood}</span>
          </button>
        )
      })}
    </div>
  )
}


/** Soft falling cherry petals (canvas) + a pointer-following glow whose hue drifts with the cursor. */
function Petals() {
  const cv = useRef<HTMLCanvasElement>(null)
  const glow = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const c = cv.current!, ctx = c.getContext('2d')!
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(2, devicePixelRatio || 1)
    let W = 0, H = 0
    const resize = () => { W = innerWidth; H = innerHeight; c.width = W * dpr; c.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0) }
    resize()
    const sprites = ['#ffc6dd', '#ffb3d1', '#ffe1ec'].map((col) => {
      const o = document.createElement('canvas'); o.width = o.height = 48
      const g = o.getContext('2d')!
      const gr = g.createLinearGradient(8, 8, 40, 40); gr.addColorStop(0, '#fff'); gr.addColorStop(0.45, col); gr.addColorStop(1, col)
      g.fillStyle = gr; g.beginPath(); g.moveTo(24, 4)
      g.bezierCurveTo(44, 8, 46, 32, 24, 44); g.bezierCurveTo(2, 32, 4, 8, 24, 4)
      g.moveTo(24, 4); g.fill()
      g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.moveTo(24, 2); g.lineTo(19, 9); g.lineTo(29, 9); g.fill()
      return o
    })
    const n = W < 700 ? 12 : 22
    const mk = (fresh: boolean) => ({
      x: Math.random() * W, y: fresh ? -30 : Math.random() * H, sz: 12 + Math.random() * 14,
      vy: 0.25 + Math.random() * 0.45, ph: Math.random() * 6.28, amp: 0.3 + Math.random() * 0.5,
      rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.02, vx: 0, a: 0.28 + Math.random() * 0.3,
      sp: sprites[(Math.random() * 3) | 0],
    })
    const ps = Array.from({ length: n }, () => mk(false))
    const m = { x: -999, y: -999, gx: W / 2, gy: H / 2, tx: W / 2, ty: H / 2 }
    const move = (e: PointerEvent) => { m.x = m.tx = e.clientX; m.y = m.ty = e.clientY }
    addEventListener('pointermove', move); addEventListener('resize', resize)
    let raf = 0, t = 0
    const tick = () => {
      t += 0.012
      ctx.clearRect(0, 0, W, H)
      for (const p of ps) {
        const dx = p.x - m.x, dy = p.y - m.y, d2 = dx * dx + dy * dy
        if (d2 < 14000) { const d = Math.sqrt(d2) || 1; p.vx += (dx / d) * 0.35; p.vr += (dx > 0 ? 1 : -1) * 0.0015 }
        p.vx *= 0.96; p.vr *= 0.985
        p.x += Math.sin(t + p.ph) * p.amp + p.vx; p.y += p.vy; p.rot += p.vr + 0.004
        if (p.y > H + 30 || p.x < -40 || p.x > W + 40) Object.assign(p, mk(true))
        ctx.save(); ctx.globalAlpha = p.a; ctx.translate(p.x, p.y); ctx.rotate(p.rot)
        ctx.scale(1, 0.55 + 0.45 * Math.abs(Math.cos(t * 1.4 + p.ph)))
        ctx.drawImage(p.sp, -p.sz / 2, -p.sz / 2, p.sz, p.sz); ctx.restore()
      }
      m.gx += (m.tx - m.gx) * 0.06; m.gy += (m.ty - m.gy) * 0.06
      if (glow.current) {
        const hue = 345 - (m.gx / W) * 70
        glow.current.style.background = `radial-gradient(440px circle at ${m.gx}px ${m.gy}px, hsl(${hue} 90% 84% / .15), transparent 62%)`
      }
      if (!reduce) raf = requestAnimationFrame(tick)
    }
    tick()
    return () => { cancelAnimationFrame(raf); removeEventListener('pointermove', move); removeEventListener('resize', resize) }
  }, [])
  return (
    <>
      <div ref={glow} aria-hidden className="pointer-events-none fixed inset-0 z-[4]" />
      <canvas ref={cv} aria-hidden className="pointer-events-none fixed inset-0 z-[5] h-full w-full" />
    </>
  )
}

function DiaryCard({ l, i }: { l: Look; i: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const flip = i % 2 === 1
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current!, r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5
    el.style.setProperty('--rx', `${-y * 8}deg`); el.style.setProperty('--ry', `${x * 10}deg`)
    el.style.setProperty('--sx', `${(x + 0.5) * 100}%`)
  }
  const reset = () => { const el = ref.current!; el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg') }
  return (
    <div data-reveal={flip ? 'right' : 'left'} className="group relative w-full max-w-sm shrink-0 md:w-[42%]">
      <div className="plate absolute inset-0 rounded-[32px] bg-pink-200/60" style={{ ['--tx' as string]: `${flip ? -14 : 14}px`, ['--rot' as string]: `${flip ? -2.5 : 2.5}deg` }} />
      <div ref={ref} onPointerMove={onMove} onPointerLeave={reset} className="tilt relative">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[32px] border-[6px] border-white bg-white shadow-[0_24px_50px_-28px_rgba(214,51,108,.55)] transition-shadow duration-500 group-hover:shadow-[0_34px_60px_-28px_rgba(214,51,108,.7)]">
          <img src={l.img} alt={l.title} loading="lazy" className="h-full w-full object-cover object-top transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]" />
          <div className="shine pointer-events-none absolute inset-0" />
        </div>
        <span className={`floaty absolute -top-3 rounded-full bg-white px-3 py-1 text-xs font-bold text-berry shadow-sm ${flip ? '-left-3' : '-right-3'}`} style={{ ['--r' as string]: flip ? '-4deg' : '4deg' }}>♡ {l.mood}</span>
        <Heart className="pop absolute -bottom-3 h-7 w-7 text-rose drop-shadow-sm" />
      </div>
    </div>
  )
}

/** Outfit diary: each entry pairs its own portrait with its text, alternating sides. */
function Diary() {
  return (
    <section id="diary" className="mx-auto max-w-6xl px-5 py-16 sm:px-6 sm:py-24">
      <div className="text-center">
        <span data-reveal className="inline-block rounded-full bg-pink-100 px-4 py-1 text-sm font-semibold text-berry">outfit diary</span>
        <h2 data-reveal style={{ ['--d' as string]: '120ms' }} className="mt-5 font-display text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">Seven looks, <span className="font-script font-normal text-rose">one heart</span></h2>
      </div>
      <div className="mt-16 space-y-16 md:space-y-24">
        {looks.map((l, i) => (
          <article key={l.title} className={`group/a flex flex-col items-center gap-8 md:gap-16 ${i % 2 ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
            <DiaryCard l={l} i={i} />
            <div data-reveal style={{ ['--d' as string]: '180ms' }} className="max-w-md">
              <span className="block font-display text-7xl font-bold leading-none text-pink-200 transition-all duration-500 group-hover/a:translate-x-2 group-hover/a:text-pink-300">{String(i + 1).padStart(2, '0')}</span>
              <p className="mt-2 text-sm font-bold tracking-widest text-rose uppercase">{l.mood}</p>
              <h3 className="font-display text-3xl font-semibold sm:text-4xl md:text-5xl">{l.title}</h3>
              <span className="mt-3 block h-[3px] w-12 origin-left rounded-full bg-rose/70 transition-all duration-500 group-hover/a:w-28" />
              <p className="mt-3 text-lg text-plum/70">{l.sub} — a page from Kaoruko’s little wardrobe, full of ribbons, frills and soft colors.</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

const tiltMove = (e: React.PointerEvent<HTMLElement>) => {
  const el = e.currentTarget, r = el.getBoundingClientRect()
  el.style.setProperty('--ry', `${((e.clientX - r.left) / r.width - 0.5) * 12}deg`)
  el.style.setProperty('--rx', `${((e.clientY - r.top) / r.height - 0.5) * -12}deg`)
}
const tiltLeave = (e: React.PointerEvent<HTMLElement>) => { e.currentTarget.style.setProperty('--rx', '0deg'); e.currentTarget.style.setProperty('--ry', '0deg') }

/** Scroll progress (0..1) of an element through the viewport, written to --p for parallax. */
function useScrollVar() {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    let raf = 0
    const run = () => {
      const el = ref.current; if (!el) return
      const r = el.getBoundingClientRect()
      el.style.setProperty('--p', String(Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight + r.height)))))
    }
    const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(run) }
    run(); addEventListener('scroll', on, { passive: true })
    return () => { removeEventListener('scroll', on); cancelAnimationFrame(raf) }
  }, [])
  return ref
}

const profile = [
  ['School', 'Kikyo Private Academy'], ['Year', '2nd-year honor student'], ['Height', '148 cm · 4\u203210\u2033'],
  ['Hair', 'Waist-long, wavy blackish-purple'], ['Eyes', 'Large, deep blue-black'], ['Loves', 'Cake & kind words'],
]

function Intro() {
  const ref = useScrollVar()
  return (
    <section id="about" ref={ref} className="intro relative isolate overflow-hidden py-16 sm:py-24">
      {/* giant background name, drifts with scroll */}
      <div aria-hidden className="intro-bg pointer-events-none absolute inset-x-0 top-10 select-none text-center font-display text-[22vw] font-bold leading-[0.8] text-rose/15">KAORUKO</div>
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 sm:px-6 lg:grid-cols-[1.05fr_1fr]">
        {/* visual column */}
        <div data-reveal="left" className="relative mx-auto h-[460px] w-full max-w-[460px] sm:h-[560px]">
          <div className="absolute inset-y-0 left-6 w-[62%] rounded-[36px] bg-gradient-to-b from-rose to-berry shadow-[0_30px_60px_-30px_rgba(214,51,108,.8)]" />
          <div aria-hidden className="intro-kanji absolute left-10 top-6 flex flex-col font-display text-7xl font-bold leading-[1.05] text-white/90">
            {'和栗薫子'.split('').map((c) => <span key={c}>{c}</span>)}
          </div>
          <img src="/k/7.png" alt="Kaoruko Waguri in her Kikyo uniform" className="intro-main absolute bottom-0 right-0 h-[88%] w-[78%] rounded-[32px] border-[6px] border-white object-cover object-top shadow-2xl" />
          <figure className="intro-mini floaty absolute -right-2 top-4 w-24 rotate-6 bg-white p-1.5 shadow-lg [--r:6deg]"><img src="/k/1.png" alt="" className="aspect-square w-full object-cover object-top" /></figure>
          <figure className="intro-mini floaty absolute -left-2 bottom-24 w-24 bg-white p-1.5 shadow-lg [--r:-7deg] [animation-delay:-2.5s]"><img src="/k/3.png" alt="" className="aspect-square w-full object-cover object-top" /></figure>
        </div>

        {/* text column */}
        <div>
          <span data-reveal className="inline-block rounded-full bg-pink-100 px-4 py-1 text-sm font-semibold text-berry">meet her</span>
          <h2 data-reveal style={{ ['--d' as string]: '100ms' }} className="mt-5 font-display text-4xl font-bold leading-[1.05] sm:text-5xl md:text-6xl">The girl behind <span className="font-script font-normal text-rose">the smile</span></h2>
          <p data-reveal style={{ ['--d' as string]: '200ms' }} className="mt-5 border-l-4 border-rose pl-4 text-lg italic leading-relaxed text-plum/75">Petite, bright and endlessly kind — a scholarship girl at an elite academy who carries far more than she ever lets show.</p>
          <dl className="mt-8 grid grid-cols-2 gap-3">
            {profile.map(([k, v], i) => (
              <div key={k} data-reveal style={{ ['--d' as string]: `${250 + i * 70}ms` }} className="chip rounded-2xl bg-white/80 p-3 shadow-sm ring-1 ring-pink-100">
                <dt className="text-[11px] font-bold uppercase tracking-widest text-berry/70">{k}</dt>
                <dd className="mt-0.5 font-display text-base font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* life at Kikyo */}
      <div className="relative mx-auto mt-14 max-w-6xl px-5 sm:mt-20 sm:px-6">
        <p data-reveal className="mx-auto max-w-2xl text-center leading-relaxed text-plum/70">Kikyo Academy is home to refined young ladies from wealthy families, who look down on neighbouring Chidori Public High and its rowdy reputation. Kaoruko doesn&rsquo;t fit the elite mould at all.</p>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {[
            { t: 'The Scholarship Student', d: 'From a humble, ordinary family, she attends ultra-expensive Kikyo only through a full academic scholarship. To keep it she works tirelessly to stay at the very top of her class — one slip could cost her tuition.', img: '/k/4.png', tag: 'Top of her class' },
            { t: 'Hidden Resilience', d: 'Behind the bright smile, home life is heavy. With her mother often hospitalised, she runs the household, cares for little brother Kosuke, keeps top grades and works part-time at a local teishoku restaurant.', img: '/k/5.png', tag: 'Stronger than she looks' },
          ].map((c, i) => (
            <article key={c.t} data-reveal={i ? 'right' : 'left'} onPointerMove={tiltMove} onPointerLeave={tiltLeave} className="life tilt group relative overflow-hidden rounded-[28px] border-2 border-berry/80 bg-white p-5 pr-28 shadow-[0_20px_40px_-28px_rgba(214,51,108,.7)] sm:p-6 sm:pr-36">
              <div aria-hidden className="shine pointer-events-none absolute inset-0" />
              <span className="inline-block bg-berry px-3 py-1 font-display text-sm font-semibold text-white">{c.t}</span>
              <p className="mt-3 text-sm leading-relaxed text-plum/80">{c.d}</p>
              <p className="mt-4 font-script text-rose">{c.tag} ♡</p>
              <img src={c.img} alt="" className="life-img absolute -right-4 bottom-0 h-full w-28 sm:w-36 object-cover object-top [mask-image:linear-gradient(to_right,transparent,#000_35%)]" />
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

const snaps = [
  { img: '/k/1.png', cap: 'cozy days', x: 30, y: 6, r: -6, w: 230 },
  { img: '/k/2.png', cap: 'dreamy lace', x: 52, y: 14, r: 7, w: 220 },
  { img: '/k/7.png', cap: 'kikyo blush', x: 38, y: 42, r: -3, w: 250 },
  { img: '/k/3.png', cap: 'sunny bun', x: 8, y: 30, r: -10, w: 190 },
  { img: '/k/4.png', cap: 'mint breeze', x: 73, y: 40, r: 9, w: 195 },
  { img: '/k/5.png', cap: 'looking back', x: 60, y: 60, r: 4, w: 200 },
  { img: '/k/6.png', cap: 'party night', x: 14, y: 62, r: 6, w: 185 },
]

function Album() {
  const ref = useScrollVar()
  return (
    <section id="album" ref={ref} className="scrap relative overflow-hidden py-16 sm:py-24">
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="text-center">
          <span data-reveal className="inline-block rounded-full bg-white px-4 py-1 text-sm font-semibold text-berry shadow-sm">scrapbook</span>
          <h2 data-reveal style={{ ['--d' as string]: '100ms' }} className="mt-5 font-display text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">Polaroid <span className="font-script font-normal text-rose">album</span></h2>
          <p data-reveal style={{ ['--d' as string]: '180ms' }} className="mt-3 text-plum/60">Hover a snapshot to lift it off the page.</p>
        </div>

        <div className="relative mt-12 grid grid-cols-2 gap-6 md:block md:h-[820px]">
          {/* decorative scraps (desktop) */}
          <div aria-hidden className="hidden md:block">
            <div data-reveal className="absolute left-0 top-0 w-56 rotate-[-3deg] rounded-xl bg-white/90 p-4 text-xs leading-relaxed text-plum/70 shadow-md">
              <p className="mb-1 bg-berry px-2 py-0.5 font-display text-sm font-semibold text-white w-fit">Kaoruko Waguri</p>
              Second-year at Kikyo. Loves cake, works hard, smiles for everyone.
            </div>
            <div data-reveal className="absolute right-0 top-2 rotate-[4deg] rounded-md bg-white px-3 py-2 shadow-md">
              <div className="flex h-10 items-end gap-[2px]">{Array.from({ length: 26 }, (_, i) => <span key={i} className="bg-plum" style={{ width: [1, 2, 3][(i * 7) % 3], height: '100%' }} />)}</div>
              <p className="mt-1 text-center text-[10px] tracking-[.3em] text-plum/60">148 · KIKYO · 02</p>
            </div>
            <p data-reveal className="absolute bottom-6 left-2 font-script text-5xl leading-tight text-berry/80 rotate-[-6deg]">she blooms<br /><span className="text-rose">with dignity</span></p>
            <div data-reveal className="absolute bottom-10 right-0 w-52 rotate-[3deg] rounded-xl border-2 border-berry bg-white p-3 text-xs text-plum/70 shadow-md"><p className="font-display text-sm font-semibold text-berry">♡ fan note</p>Every outfit, a new mood — but always the same warm heart.</div>
            <span className="scrap-dot absolute left-[24%] top-[20%] h-14 w-14 rounded-full bg-pink-200/70" />
            <span className="scrap-dot absolute right-[18%] top-[34%] h-10 w-10 rounded-full bg-purple-200/70 [animation-delay:-3s]" />
            <span className="absolute left-[46%] top-[2%] h-5 w-28 rotate-[8deg] bg-[repeating-linear-gradient(45deg,#ffc6dd_0_8px,#fff_8px_16px)] opacity-80" />
          </div>

          {snaps.map((p, i) => (
            <div key={p.img} data-reveal="zoom" className="snap-pos md:absolute" style={{ left: `${p.x}%`, top: `${p.y}%`, ['--d' as string]: `${i * 110}ms`, ['--sp' as string]: `${(i % 3) - 1}` }}>
              <figure className="snap polaroid relative mx-auto bg-white p-3 pb-11 shadow-lg md:mx-0" style={{ width: p.w, maxWidth: '100%', transform: `rotate(${p.r}deg)` }}>
                <span className="absolute -top-3 left-1/2 h-6 w-16 -translate-x-1/2 rotate-[-4deg] bg-pink-200/80" />
                {i % 3 === 1 && <span className="clip absolute -right-2 -top-4 h-10 w-4 rounded-full border-[3px] border-rose" />}
                <div className="aspect-[4/5] overflow-hidden ring-1 ring-pink-100"><img src={p.img} alt={p.cap} className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105" /></div>
                <figcaption className="absolute inset-x-0 bottom-2.5 text-center font-script text-base text-berry">{p.cap}</figcaption>
              </figure>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function App() {
  const [current, setCurrent] = useState(3)
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }), { threshold: 0.15, rootMargin: '0px 0px -40px 0px' })
    document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  return (
    <div className="min-h-screen overflow-x-clip">
      <Petals />
      <section className="relative isolate flex min-h-screen flex-col overflow-hidden transition-[background] duration-1000" style={{ background: `radial-gradient(ellipse at 50% 85%, ${looks[current].bg.match(/#\w+/g)![1]}55 0%, #fff0f5 60%)` }}>

        {/* ambient: soft drifting glows + twinkling sparkles */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="blob absolute -left-20 top-10 h-80 w-80 rounded-full bg-pink-300/40" />
          <div className="blob absolute -right-16 top-40 h-96 w-96 rounded-full bg-purple-200/50 [animation-delay:-6s]" />
          <div className="blob absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-rose-200/40 [animation-delay:-12s]" />
          {[[12, 22, 0], [86, 18, 1.2], [80, 52, 0.6], [50, 8, 1.8]].map(([x, y, d], i) => (
            <Sparkle key={i} className="twinkle absolute h-4 w-4 text-rose" style={{ left: `${x}%`, top: `${y}%`, ['--d' as string]: `${d}s` }} />
          ))}
        </div>
        <span className="rise absolute left-[9%] top-[46%] hidden md:block [--d:1100ms]"><span className="floaty block rounded-full bg-white px-3 py-1 text-xs font-bold text-berry shadow-sm [--r:-6deg]">Sweet ♡</span></span>
        <span className="rise absolute right-[9%] top-[38%] hidden md:block [--d:1250ms]"><span className="floaty block rounded-full bg-white px-3 py-1 text-xs font-bold text-purple-500 shadow-sm [--r:6deg]">Kind heart ✿</span></span>

        <div id="home" className="relative mx-auto max-w-4xl px-5 pt-10 sm:px-6 sm:pt-14 text-center">
          <p className="rise inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 [--d:150ms] text-xs font-semibold text-berry shadow-sm sm:text-sm"><Sparkle className="spin h-3.5 w-3.5" /> The Fragrant Flower Blooms with Dignity</p>
          <h1 className="mt-6 flex flex-col items-center font-display font-bold tracking-tight text-plum">
            <span className="rise block text-6xl leading-[0.9] [--d:300ms] sm:text-7xl md:text-[9.5rem]">Kaoruko</span>
            <span className="rise -mt-1 block [--d:500ms] md:-mt-4"><span className="shimmer block px-4 font-script text-5xl font-normal leading-[1.3] sm:text-6xl md:text-8xl">Waguri</span></span>
          </h1>
          <p className="rise mx-auto mt-4 max-w-xl [--d:700ms] text-base leading-relaxed text-plum/70 md:text-lg">A little fan corner for the sweetest girl of Kikyo Academy — cakes, warm smiles and a heart that blooms for everyone.</p>
        </div>
        <div className="fan-in mt-6 px-4 pb-10"><CardFan onChange={setCurrent} /></div>
        <div aria-hidden className="cue mx-auto mb-6 h-9 w-5 rounded-full border-2 border-berry/40 p-1"><div className="mx-auto h-2 w-1 rounded-full bg-berry/60" /></div>
      </section>

      <div className="border-y border-pink-200/70 bg-white/60 py-3 text-berry/80 backdrop-blur">
        <div className="marquee flex w-max gap-8 whitespace-nowrap font-display text-2xl font-semibold">
          {[0, 1].flatMap((k) => ['Kaoruko Waguri', '♡', 'Cake lover', '✿', 'Kind heart', '♡', 'Bright smile', '✿'].map((w, i) => <span key={`${k}-${i}`}>{w}</span>))}
        </div>
      </div>

      <section id="traits" className="mx-auto max-w-6xl px-5 py-16 sm:px-6 sm:py-24">
        <div className="text-center">
          <span data-reveal className="inline-block rounded-full bg-pink-100 px-4 py-1 text-sm font-semibold text-berry">why we adore her</span>
          <h2 data-reveal style={{ ['--d' as string]: '120ms' }} className="mt-5 font-display text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">Little things that make <span className="font-script font-normal text-rose">her</span></h2>
        </div>
        <div className="mt-10 grid gap-6 sm:mt-14 sm:grid-cols-2 lg:grid-cols-4">
          {traits.map((t, i) => (
            <div key={t.n} data-reveal style={{ ['--d' as string]: `${i * 120}ms` }}>
            <div className="trait-bob" style={{ ['--bd' as string]: `${-i * 1.1}s` }}>
            <div onPointerMove={tiltMove} onPointerLeave={tiltLeave} className="trait group relative flex min-h-[420px] flex-col overflow-hidden rounded-[28px] p-6 pb-48 shadow-[0_20px_40px_-25px_rgba(214,51,108,0.6)]" style={{ background: t.c, ['--rot' as string]: `${i % 2 ? 2 : -2}deg` }}>
              <div aria-hidden className="shine pointer-events-none absolute inset-0 z-10" />
              <span className="trait-num w-fit rounded-full bg-white/70 px-3 py-1 text-xs font-bold">{t.n}</span>
              <h3 className="mt-4 font-display text-3xl font-semibold leading-tight">{t.t}</h3>
              <p className="mt-2 text-sm font-medium text-plum/80">{t.d}</p>
              <span aria-hidden className="trait-ring absolute -bottom-6 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full border-2 border-white/80" />
              <img src={t.img} alt="" className="trait-img absolute -bottom-6 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full border-4 border-white object-cover object-top" />
              {[[18, 62, 0], [78, 55, 80], [70, 30, 160]].map(([x, y, d], k) => (
                <Sparkle key={k} className="burst absolute h-4 w-4 text-white" style={{ left: `${x}%`, top: `${y}%`, ['--bd' as string]: `${d}ms` }} />
              ))}
              <Heart className="burst absolute right-6 top-6 h-5 w-5 text-berry" />
            </div>
            </div>
            </div>
          ))}
        </div>
      </section>

      <Diary />

      <Intro />
      <Album />

      <footer className="relative overflow-hidden bg-plum py-14 text-center text-pink-100">
        <img src="/k/7.png" alt="" data-reveal className="absolute -bottom-10 right-6 hidden h-64 rounded-t-full border-4 border-rose object-cover object-top md:block" />
        <p data-reveal className="font-script text-3xl text-rose">Kaoruko Waguri</p>
        <p className="mt-2 text-sm text-pink-100/60">A fan-made love letter ♡</p>
      </footer>
    </div>
  )
}
