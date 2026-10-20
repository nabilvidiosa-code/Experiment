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
  { n: '01', t: 'Sweet tooth', d: 'Her love for cakes is legendary — every bite is pure happiness.', c: '#ffb3d1', img: '/k/7.png' },
  { n: '02', t: 'Kind to all', d: 'She sees people for who they are, never for the rumors.', c: '#e9b8ff', img: '/k/1.png' },
  { n: '03', t: 'Bright smile', d: 'A sunny presence that makes everyone feel welcome.', c: '#ffd1a8', img: '/k/3.png' },
  { n: '04', t: 'Hard worker', d: 'Diligent and studious, yet never forgets the little joys.', c: '#b9f0d2', img: '/k/4.png' },
]

const Sparkle = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden><path d="M12 0c.6 6.2 5.8 11.4 12 12-6.2.6-11.4 5.8-12 12-.6-6.2-5.8-11.4-12-12C6.2 11.4 11.4 6.2 12 0z" /></svg>
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
      className="relative mx-auto h-[480px] w-full max-w-6xl select-none"
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
            className="absolute bottom-0 left-1/2 h-[420px] w-[270px] overflow-hidden rounded-[34px] border-[5px] border-white bg-white text-left will-change-transform md:w-[270px]"
            style={{
              background: 'linear-gradient(180deg,#ffffff,#fff5f9)',
              transform: `translate3d(calc(-50% + ${off * 200}px), ${abs * abs * 14 + abs * 22 - lift * 28}px, 0) rotate(${off * 6.5}deg) scale(${1 - Math.min(abs, 3) * 0.07 + lift * 0.04})`,
              zIndex: 100 - Math.round(abs * 10),
              opacity: Math.max(0, Math.min(1, 3.6 - abs)),
              boxShadow: `0 ${30 + lift * 20}px ${60 + lift * 30}px -24px rgba(214,51,108,${0.25 + lift * 0.3})`,
            }}
          >
            <img src={c.img} alt={c.title} draggable={false} className="absolute inset-0 h-full w-full object-cover object-top" style={{ transform: `scale(${1.05 + lift * 0.05}) translateX(${off * -8}px)` }} />
            <span className="absolute right-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-bold text-berry shadow" style={{ opacity: lift, transform: `scale(${0.6 + lift * 0.4})` }}>♡ {c.mood}</span>
          </button>
        )
      })}
    </div>
  )
}

/** Outfit diary: each entry pairs its own portrait with its text, alternating sides. */
function Diary() {
  return (
    <section id="diary" className="mx-auto max-w-6xl px-6 py-24">
      <div className="text-center">
        <span className="rounded-full bg-pink-100 px-4 py-1 text-sm font-semibold text-berry">outfit diary</span>
        <h2 className="mt-5 font-display text-5xl font-bold leading-tight md:text-6xl">Seven looks, <span className="font-script font-normal text-rose">one heart</span></h2>
      </div>
      <div className="mt-16 space-y-16 md:space-y-24">
        {looks.map((l, i) => (
          <article key={l.title} className={`flex flex-col items-center gap-8 md:gap-16 ${i % 2 ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
            <div className="group relative w-full max-w-sm shrink-0 md:w-[42%]">
              <div className="absolute inset-0 rounded-[36px] bg-pink-200/70" style={{ transform: `translate(${i % 2 ? -16 : 16}px,16px) rotate(${i % 2 ? -3 : 3}deg)` }} />
              <div className="relative aspect-[4/5] overflow-hidden rounded-[36px] border-[6px] border-white bg-white shadow-xl">
                <img src={l.img} alt={l.title} loading="lazy" className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105" />
              </div>
            </div>
            <div className="max-w-md">
              <span className="block font-display text-7xl font-bold leading-none text-pink-200">{String(i + 1).padStart(2, '0')}</span>
              <p className="mt-2 text-sm font-bold tracking-widest text-rose uppercase">{l.mood}</p>
              <h3 className="font-display text-4xl font-semibold md:text-5xl">{l.title}</h3>
              <p className="mt-3 text-lg text-plum/70">{l.sub} — a page from Kaoruko’s little wardrobe, full of ribbons, frills and soft colors.</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default function App() {
  const [current, setCurrent] = useState(3)
  return (
    <div className="min-h-screen overflow-x-clip">
      <section className="relative flex min-h-screen flex-col overflow-hidden transition-[background] duration-1000" style={{ background: `radial-gradient(ellipse at 50% 85%, ${looks[current].bg.match(/#\w+/g)![1]}55 0%, #fff0f5 60%)` }}>
        <nav className="relative z-[200] mx-auto flex max-w-6xl items-center justify-center px-6 py-6">
          <div className="hidden gap-1 rounded-full bg-white/80 p-1.5 shadow-sm backdrop-blur md:flex">
            {['Home', 'Traits', 'Diary', 'Album'].map((l, i) => (
              <a key={l} href={`#${l.toLowerCase()}`} className={`rounded-full px-5 py-2 text-sm font-semibold ${i === 0 ? 'bg-rose text-white' : 'text-plum/70 hover:text-berry'}`}>{l}</a>
            ))}
          </div>
        </nav>

        <Sparkle className="floaty absolute left-[12%] top-40 h-6 w-6 text-rose" />
        <Sparkle className="floaty absolute right-[15%] top-56 h-4 w-4 text-berry/60" />
        <Heart className="floaty absolute left-[22%] top-72 h-8 w-8 text-pink-300 [--r:-15deg]" />
        <Heart className="floaty absolute right-[10%] top-32 h-10 w-10 text-pink-300 [--r:12deg]" />
        <span className="floaty absolute left-[8%] top-56 hidden rounded-full bg-rose px-3 py-1 text-xs font-bold text-white md:block [--r:-6deg]">Sweet ♡</span>
        <span className="floaty absolute right-[8%] top-80 hidden rounded-full bg-purple-300 px-3 py-1 text-xs font-bold text-white md:block [--r:6deg]">Kind heart</span>

        <div id="home" className="relative mx-auto max-w-4xl px-6 pt-2 text-center">
          <p className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-berry shadow-sm"><Sparkle className="h-3.5 w-3.5" /> The Fragrant Flower Blooms with Dignity</p>
          <h1 className="mt-6 flex flex-col items-center font-display font-bold tracking-tight text-plum">
            <span className="block text-7xl leading-[0.9] md:text-[9.5rem]">Kaoruko</span>
            <span className="-mt-1 block font-script text-6xl font-normal leading-[1.3] text-rose md:-mt-4 md:text-8xl">Waguri</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-plum/70 md:text-lg">A little fan corner for the sweetest girl of Kikyo Academy — cakes, warm smiles and a heart that blooms for everyone.</p>
        </div>
        <div className="mt-6 px-4 pb-16"><CardFan onChange={setCurrent} /></div>
      </section>

      <div className="-rotate-2 bg-rose py-3 text-white">
        <div className="marquee flex w-max gap-8 whitespace-nowrap font-display text-2xl font-semibold">
          {[0, 1].flatMap((k) => ['Kaoruko Waguri', '♡', 'Cake lover', '✿', 'Kind heart', '♡', 'Bright smile', '✿'].map((w, i) => <span key={`${k}-${i}`}>{w}</span>))}
        </div>
      </div>

      <section id="traits" className="mx-auto max-w-6xl px-6 py-24">
        <div className="text-center">
          <span className="rounded-full bg-pink-100 px-4 py-1 text-sm font-semibold text-berry">why we adore her</span>
          <h2 className="mt-5 font-display text-5xl font-bold leading-tight md:text-6xl">Little things that make <span className="font-script font-normal text-rose">her</span></h2>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {traits.map((t, i) => (
            <div key={t.n} className="group relative flex min-h-[420px] flex-col overflow-hidden rounded-[28px] p-6 pb-48 shadow-[0_20px_40px_-25px_rgba(214,51,108,0.6)] transition-transform duration-500 hover:-translate-y-2 hover:!rotate-0" style={{ background: t.c, transform: `rotate(${i % 2 ? 2 : -2}deg)` }}>
              <span className="w-fit rounded-full bg-white/70 px-3 py-1 text-xs font-bold">{t.n}</span>
              <h3 className="mt-4 font-display text-3xl font-semibold leading-tight">{t.t}</h3>
              <p className="mt-2 text-sm font-medium text-plum/80">{t.d}</p>
              <img src={t.img} alt="" className="absolute -bottom-6 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full border-4 border-white object-cover object-top transition-transform duration-700 group-hover:-translate-y-4 group-hover:scale-110" />
            </div>
          ))}
        </div>
      </section>

      <Diary />

      <section id="album" className="bg-white py-24">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h2 className="font-display text-5xl font-bold leading-tight md:text-6xl">Polaroid <span className="font-script font-normal text-rose">album</span></h2>
          <p className="mt-3 text-plum/60">Hover a snapshot to pull it closer.</p>
          <div className="mt-14 flex flex-wrap justify-center gap-4 md:-space-x-6 md:gap-0">
            {looks.map((l, i) => (
              <figure key={l.img} className="polaroid relative w-44 bg-white p-3 pb-10 shadow-lg md:w-48" style={{ transform: `rotate(${[-8, 5, -3, 7, -6, 4, -2][i]}deg) translateY(${[0, 20, -10, 15, 0, 25, -5][i]}px)` }}>
                <span className="absolute -top-3 left-1/2 h-6 w-16 -translate-x-1/2 rotate-[-4deg] bg-pink-200/80" />
                <div className="aspect-[3/4] overflow-hidden bg-white ring-1 ring-pink-100"><img src={l.img} alt={l.title} className="h-full w-full object-cover object-top" /></div>
                <figcaption className="absolute bottom-2 inset-x-0 font-script text-sm text-berry">{l.title}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <footer className="relative overflow-hidden bg-plum py-14 text-center text-pink-100">
        <img src="/k/7.png" alt="" className="absolute -bottom-10 right-6 hidden h-64 rounded-t-full border-4 border-rose object-cover object-top md:block" />
        <p className="font-script text-3xl text-rose">Kaoruko Waguri</p>
        <p className="mt-2 text-sm text-pink-100/60">A fan-made love letter ♡</p>
      </footer>
    </div>
  )
}
