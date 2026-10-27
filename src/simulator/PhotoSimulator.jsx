import { useEffect, useMemo, useRef, useState } from 'react'
import { IconMusic, IconFan, IconPlay, IconPause, IconBolt, IconThermo } from '../icons.jsx'
import plan from '../assets/apartment-top.png'
import './photo-simulator.css'

// Slika je 831x679 px — sve koordinate ispod su u pikselima te slike.
const W = 831
const H = 679

// ac: ciljna temperatura + pozicija klima uređaja na zidu (x, y) i smer duvanja u stepenima.
// music: soba je deo zone u kojoj muzika prati korisnika.
const ROOMS = [
  { id: 'spavaca1', name: 'Spavaća 1', rects: [[222, 40, 153, 192]], ambient: 26, ac: { target: 21, x: 224, y: 150, angle: 0 } },
  { id: 'kupatilo1', name: 'Kupatilo', rects: [[382, 44, 108, 104]], ambient: 25 },
  { id: 'spavaca2', name: 'Spavaća 2', rects: [[498, 42, 152, 108], [440, 150, 212, 82]], ambient: 26, glow: 0.2, ac: { target: 21, x: 648, y: 110, angle: 180 } },
  { id: 'hodnik', name: 'Hodnik', rects: [[322, 232, 118, 68], [382, 150, 58, 82], [322, 300, 80, 120]], ambient: 25 },
  { id: 'spavaca3', name: 'Spavaća 3', rects: [[135, 250, 178, 158]], ambient: 26, glow: 0.2, ac: { target: 21, x: 138, y: 330, angle: 0 } },
  { id: 'kupatilo2', name: 'Kupatilo 2', rects: [[440, 250, 146, 66]], ambient: 25 },
  { id: 'kuhinja', name: 'Kuhinja', rects: [[402, 322, 192, 140]], ambient: 26, music: { x: 490, y: 429 } },
  { id: 'dnevna', name: 'Dnevna soba', rects: [[228, 420, 157, 190], [150, 420, 78, 58], [150, 584, 78, 26], [385, 420, 17, 42]], ambient: 27, ac: { target: 22, x: 152, y: 545, angle: 0 }, music: { x: 300, y: 432 } },
  { id: 'trpezarija', name: 'Trpezarija', rects: [[385, 462, 200, 148]], ambient: 26, music: { x: 568, y: 596 } },
  { id: 'ostava', name: 'Ostava', rects: [[600, 250, 100, 70]], ambient: 25 },
  { id: 'vesernica', name: 'Veš mašina', rects: [[598, 322, 124, 134]], ambient: 25 },
  { id: 'terasa', name: 'Terasa', rects: [[588, 458, 138, 180]], ambient: 24 },
  { id: 'balkon', name: 'Balkon', rects: [[100, 478, 128, 106]], ambient: 24 },
]

// Vrata i otvoreni prolazi: [soba A, soba B, x, y, w, h]. Između soba se prelazi samo kroz ove pravougaonike.
// Označeno ručno po slici (2026-10-23).
const GATES = [
  ['spavaca1', 'hodnik', 368, 148, 24, 56],
  ['kupatilo1', 'spavaca2', 436, 140, 60, 20], // kupatilo je u sklopu spavaće 2
  ['spavaca2', 'hodnik', 430, 150, 20, 54],
  ['spavaca3', 'hodnik', 306, 254, 28, 54],
  ['kupatilo2', 'hodnik', 432, 254, 18, 44],
  ['kupatilo2', 'ostava', 582, 252, 26, 46],
  ['hodnik', 'kuhinja', 396, 356, 14, 48],
  ['hodnik', 'dnevna', 328, 410, 58, 18],
  ['kuhinja', 'dnevna', 398, 420, 14, 38],
  ['kuhinja', 'trpezarija', 420, 446, 172, 20],
  ['kuhinja', 'vesernica', 588, 364, 16, 44],
  ['dnevna', 'trpezarija', 379, 466, 12, 130],
  ['dnevna', 'balkon', 222, 470, 22, 92],
  ['trpezarija', 'terasa', 580, 468, 16, 128],
]

const TOUR = ['hodnik', 'dnevna', 'trpezarija', 'kuhinja', 'kupatilo2', 'spavaca3', 'hodnik', 'spavaca1', 'hodnik', 'spavaca2', 'hodnik', 'vesernica', 'terasa']
const GENRES = ['Isključena', 'Lounge', 'Jazz', 'Pop', 'Klasika']
const BY_ID = Object.fromEntries(ROOMS.map((r) => [r.id, r]))

const inRect = (p, [x, y, w, h], pad = 0) => p.x >= x - pad && p.x <= x + w + pad && p.y >= y - pad && p.y <= y + h + pad
const hit = (p) => ROOMS.find((r) => r.rects.some((rc) => inRect(p, rc))) ?? null
const center = (r) => { const [x, y, w, h] = r.rects[0]; return { x: x + w / 2, y: y + h / 2 } }
const round1 = (n) => Math.round(n * 10) / 10
const clamp01 = (n) => Math.min(1, Math.max(0, n))
const pct = (v, total) => `${(v / total) * 100}%`
const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

// Najbliža tačka unutar sobe (unija pravougaonika) datoj tački — tu "stane" tačka kad udari u zid.
function nearest(room, p) {
  let best = null
  let bestD = Infinity
  for (const [x, y, w, h] of room.rects) {
    const q = { x: Math.min(x + w, Math.max(x, p.x)), y: Math.min(y + h, Math.max(y, p.y)) }
    const d = (q.x - p.x) ** 2 + (q.y - p.y) ** 2
    if (d < bestD) { bestD = d; best = q }
  }
  return best
}

const passesGate = (a, b, q) =>
  GATES.some(([ga, gb, x, y, w, h]) => ((ga === a && gb === b) || (ga === b && gb === a)) && inRect(q, [x, y, w, h]))

// Konus vazduha iz klime: trougao od uređaja do dalje ivice + tri linije strujanja.
function coneGeom({ x, y, angle }) {
  const a = (angle * Math.PI) / 180
  const dx = Math.cos(a)
  const dy = Math.sin(a)
  const nx = -dy
  const ny = dx
  const len = 150
  const spread = 62
  const ex = x + dx * len
  const ey = y + dy * len
  return {
    x2: ex, y2: ey,
    poly: `${x + nx * 5},${y + ny * 5} ${ex + nx * spread},${ey + ny * spread} ${ex - nx * spread},${ey - ny * spread} ${x - nx * 5},${y - ny * 5}`,
    lines: [-1, 0, 1].map((k) => {
      const tx = ex + nx * spread * 0.55 * k
      const ty = ey + ny * spread * 0.55 * k
      return `M${x} ${y} Q${x + dx * len * 0.55 + nx * 12 * k} ${y + dy * len * 0.55 + ny * 12 * k} ${tx} ${ty}`
    }),
  }
}

const DEBUG = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('debug')

export default function PhotoSimulator() {
  const wrapRef = useRef(null)
  const dotRef = useRef(null)
  const startRef = useRef(Date.now())
  const tickRef = useRef(0)
  const prevRoom = useRef(null)
  const curRef = useRef(null) // soba u kojoj je tačka (bez React render-a na svaki pomeraj miša)
  const targetRef = useRef(null)
  const rafRef = useRef(0)
  const playingRef = useRef(false)
  const reachedRef = useRef(false)

  const [roomId, setRoomId] = useState(null)
  const [playing, setPlaying] = useState(false)
  const [step, setStep] = useState(0)
  const [genreIdx, setGenreIdx] = useState(1)
  const [acEnabled, setAcEnabled] = useState(true)
  const [temps, setTemps] = useState(() => Object.fromEntries(ROOMS.map((r) => [r.id, r.ambient])))
  const [log, setLog] = useState([{ t: 0, text: 'Sistem spreman — pomerite miš u stan' }])

  const room = roomId ? BY_ID[roomId] : null
  playingRef.current = playing
  const roomRef = useRef(null)
  roomRef.current = roomId
  const acRef = useRef(true)
  acRef.current = acEnabled

  const temp = room ? temps[room.id] : null
  const cooling = !!(acEnabled && room?.ac && temp > room.ac.target)
  const atTarget = !!(acEnabled && room?.ac && temp <= room.ac.target)
  const musicOn = !!(room?.music && genreIdx > 0)
  const watts = (room ? (room.id === 'hodnik' ? 8 : 12) : 0) + (cooling ? 900 : 0) + (atTarget ? 40 : 0) + (musicOn ? 15 : 0)

  const pushLog = (text) => {
    const t = Math.round((Date.now() - startRef.current) / 1000)
    setLog((l) => [{ t, text }, ...l].slice(0, 7))
  }

  const setDot = (p) => {
    const el = dotRef.current
    if (!el) return
    el.style.left = pct(p.x, W)
    el.style.top = pct(p.y, H)
    el.style.opacity = '1'
  }
  const hideDot = () => { if (dotRef.current) dotRef.current.style.opacity = '0' }

  // Dnevnik automatizacije: ulazak/izlazak iz sobe.
  useEffect(() => {
    const prev = prevRoom.current
    if (prev === roomId) return
    prevRoom.current = roomId
    reachedRef.current = false
    const p = prev ? BY_ID[prev] : null
    const r = roomId ? BY_ID[roomId] : null
    const follows = !!(p?.music && r?.music && genreIdx > 0)
    if (p) {
      const off = ['svetlo OFF', p.ac && 'klima OFF', p.music && !follows && 'muzika OFF'].filter(Boolean)
      pushLog(`${p.name}: nema pokreta → ${off.join(', ')}`)
    }
    if (r) {
      const extra = [
        r.ac && acEnabled && `klima cilj ${r.ac.target}°C`,
        r.music && genreIdx > 0 && (follows ? `muzika te prati (${GENRES[genreIdx]})` : `muzika ${GENRES[genreIdx]}`),
      ].filter(Boolean)
      pushLog(`${r.name}: pokret detektovan → svetlo ON${extra.length ? ', ' + extra.join(', ') : ''}`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId])

  // Kad klima dostigne ciljnu temperaturu, jednom to zabeleži u dnevniku.
  useEffect(() => {
    if (atTarget && !reachedRef.current) {
      reachedRef.current = true
      pushLog(`${room.name}: ${room.ac.target}°C dostignuto → klima u stanju mirovanja`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [atTarget, roomId])

  // Temperatura: klima hladi dok je soba zauzeta, inače se soba polako vraća na ambijent.
  useEffect(() => {
    const id = setInterval(() => {
      const n = ++tickRef.current
      const occ = roomRef.current
      setTemps((prev) => {
        const next = { ...prev }
        for (const r of ROOMS) {
          const t = prev[r.id]
          if (r.id === occ && r.ac && acRef.current && t > r.ac.target) next[r.id] = round1(t - 0.1)
          else if ((r.id !== occ || !acRef.current) && n % 6 === 0 && t < r.ambient) next[r.id] = round1(t + 0.1)
        }
        return next
      })
    }, 900)
    return () => clearInterval(id)
  }, [])

  // Automatski obilazak — tačka direktno skoči u sledeću sobu.
  useEffect(() => {
    if (!playing) return
    const id = TOUR[step]
    curRef.current = id
    setRoomId(id)
    setDot(center(BY_ID[id]))
    const t = setTimeout(() => setStep((s) => (s + 1) % TOUR.length), 2800)
    return () => clearTimeout(t)
  }, [playing, step])

  useEffect(() => () => cancelAnimationFrame(rafRef.current), [])

  // Pomeraj tačke: unutar iste sobe prati miš 1:1, između soba prolazi samo kroz vrata.
  const follow = (t) => {
    let cur = curRef.current
    const tr = hit(t)
    let p = t
    if (!cur) {
      if (!tr) return
      cur = tr.id
    } else if (tr?.id !== cur) {
      const q = nearest(BY_ID[cur], t)
      if (tr && passesGate(cur, tr.id, q)) cur = tr.id
      else p = q
    }
    setDot(p)
    if (cur !== curRef.current) {
      curRef.current = cur
      setRoomId(cur)
    }
  }

  const onMove = (e) => {
    if (playingRef.current) {
      setPlaying(false)
      curRef.current = null // preuzimanje: tačka ide tamo gde je miš
    }
    const b = wrapRef.current.getBoundingClientRect()
    targetRef.current = { x: ((e.clientX - b.left) / b.width) * W, y: ((e.clientY - b.top) / b.height) * H }
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0
        follow(targetRef.current)
      })
    }
  }

  const onLeave = () => {
    if (playingRef.current) return
    curRef.current = null
    setRoomId(null)
    hideDot()
  }

  const teleport = (id) => {
    setPlaying(false)
    curRef.current = id
    setRoomId(id)
    setDot(center(BY_ID[id]))
  }

  const cone = useMemo(() => Object.fromEntries(ROOMS.filter((r) => r.ac).map((r) => [r.id, coneGeom(r.ac)])), [])
  const coolK = room?.ac && acEnabled ? clamp01((room.ambient - temp) / (room.ambient - room.ac.target)) : 0

  return (
    <section id="simulator" className="ps-page">
      <div className="ps-head">
        <span className="ps-eyebrow">Uživo</span>
        <h2>Vidite automatizaciju u akciji</h2>
        <p>Pomerajte miš kroz stan — kao u pravom stanu, kroz zidove se ne prolazi, samo kroz vrata. Svetlo se pali čim uđete, klima hladi do zadate temperature, a muzika vas prati iz sobe u sobu.</p>
      </div>

      <div className="ps-grid">
        <div ref={wrapRef} className="ps-plan" onPointerMove={onMove} onPointerLeave={onLeave}>
          <img src={plan} alt="Prikaz stana odozgo" draggable="false" />

          <svg viewBox={`0 0 ${W} ${H}`} className="ps-overlay" aria-hidden="true">
            <defs>
              <radialGradient id="ps-warm">
                <stop offset="0" stopColor="#ffe9b0" stopOpacity="0.95" />
                <stop offset="0.5" stopColor="#ffcb6b" stopOpacity="0.5" />
                <stop offset="1" stopColor="#ffcb6b" stopOpacity="0" />
              </radialGradient>
              <filter id="ps-soft" x="-10%" y="-10%" width="120%" height="120%">
                <feGaussianBlur stdDeviation="5" />
              </filter>
              {ROOMS.map((r) => (
                <clipPath id={`ps-clip-${r.id}`} key={r.id}>
                  {r.rects.map(([x, y, w, h], i) => <rect key={i} x={x} y={y} width={w} height={h} />)}
                </clipPath>
              ))}
              {ROOMS.filter((r) => r.ac).map((r) => (
                <linearGradient key={r.id} id={`ps-cone-${r.id}`} gradientUnits="userSpaceOnUse" x1={r.ac.x} y1={r.ac.y} x2={cone[r.id].x2} y2={cone[r.id].y2}>
                  <stop offset="0" stopColor="#d4ecff" stopOpacity="0.75" />
                  <stop offset="1" stopColor="#8cc8ff" stopOpacity="0" />
                </linearGradient>
              ))}
            </defs>

            {/* Noćni režim: sve sobe su zatamnjene dok u njima nema nikoga */}
            <g filter="url(#ps-soft)">
              {ROOMS.map((r) => r.rects.map(([x, y, w, h], i) => (
                <rect key={r.id + i} x={x} y={y} width={w} height={h} rx="6" className="ps-dim" style={{ opacity: r.id === roomId ? 0 : 0.6 }} />
              )))}
            </g>

            {/* Toplo svetlo sa plafona */}
            {ROOMS.map((r) => {
              const c = center(r)
              const [, , w, h] = r.rects[0]
              return (
                <g key={r.id} clipPath={`url(#ps-clip-${r.id})`}>
                  <ellipse cx={c.x} cy={c.y} rx={w * 0.85} ry={h * 0.85} fill="url(#ps-warm)" className="ps-glow" style={{ opacity: r.id === roomId ? (r.glow ?? 0.55) : 0 }} />
                </g>
              )
            })}

            {/* Hladan odsjaj: jači što je soba više rashlađena */}
            <g filter="url(#ps-soft)">
              {room?.ac && coolK > 0 && room.rects.map(([x, y, w, h], i) => (
                <rect key={i} x={x} y={y} width={w} height={h} rx="6" className="ps-cool" style={{ opacity: 0.1 + coolK * 0.22 }} />
              ))}
            </g>

            {/* Klima: uređaj, konus vazduha i strujanje dok hladi */}
            {ROOMS.filter((r) => r.ac).map((r) => {
              const on = r.id === roomId && cooling
              const idle = r.id === roomId && atTarget
              return (
                <g key={r.id}>
                  <g clipPath={`url(#ps-clip-${r.id})`}>
                    <polygon points={cone[r.id].poly} fill={`url(#ps-cone-${r.id})`} className="ps-cone" style={{ opacity: on ? 1 : 0 }} />
                    {on && cone[r.id].lines.map((d, i) => (
                      <path key={i} d={d} className="ps-air" style={{ animationDelay: `${i * 0.25}s` }} />
                    ))}
                  </g>
                  <rect x={r.ac.x - 5} y={r.ac.y - 14} width="10" height="28" rx="3" className="ps-ac" />
                  <circle cx={r.ac.x} cy={r.ac.y - 8} r="2.4" className={`ps-led ${on ? 'is-on' : idle ? 'is-idle' : ''}`} />
                </g>
              )
            })}

            {/* Muzika: zvučnik u sobi u kojoj ste, talasi se šire dok svira */}
            {ROOMS.filter((r) => r.music).map((r) => {
              const play = r.id === roomId && musicOn
              return (
                <g key={r.id} className="ps-speaker" style={{ opacity: play ? 1 : 0 }}>
                  {[0, 1, 2].map((i) => (
                    <circle key={i} cx={r.music.x} cy={r.music.y} r="8" className="ps-wave" style={{ animationDelay: `${i * 0.6}s` }} />
                  ))}
                  <circle cx={r.music.x} cy={r.music.y} r="7" className="ps-speaker-core" />
                </g>
              )
            })}

            {DEBUG && (
              <g>
                {ROOMS.map((r) => r.rects.map(([x, y, w, h], i) => (
                  <rect key={r.id + i} x={x} y={y} width={w} height={h} fill="none" stroke="#3ddc84" strokeWidth="1.5" />
                )))}
                {GATES.map(([, , x, y, w, h], i) => (
                  <rect key={i} x={x} y={y} width={w} height={h} fill="rgba(255,60,60,.45)" stroke="#ff3c3c" />
                ))}
              </g>
            )}
          </svg>

          {/* Oznake soba */}
          {ROOMS.map((r) => {
            const [x, y] = r.rects[0]
            const active = r.id === roomId
            const t = temps[r.id]
            const isCool = r.ac && active && cooling
            return (
              <div
                key={r.id}
                className={`ps-chip ${active ? 'is-active' : ''} ${isCool ? 'is-cool' : ''}`}
                style={{ left: pct(x + 6, W), top: pct(y + 6, H) }}
              >
                <span>{r.name}</span>
                {(r.ac || active) && (
                  <b><IconThermo width={10} height={10} />{t.toFixed(1)}°{r.ac && active && atTarget ? ' ✓' : ''}</b>
                )}
              </div>
            )
          })}

          {/* Pločica „svira“ pored zvučnika */}
          {musicOn && (
            <div className="ps-music" style={{ left: pct(room.music.x + 16, W), top: pct(room.music.y - 14, H) }}>
              <i /><i /><i /><i />
              <span>{GENRES[genreIdx]}</span>
            </div>
          )}

          {/* Vi ste ovde — pozicija se postavlja direktno preko ref-a, bez React render-a */}
          <div ref={dotRef} className="ps-dot" />
        </div>

        <aside className="ps-side">
          <div className="ps-tiles">
            <div className="ps-tile">
              <IconThermo width={16} height={16} />
              <span>Temperatura</span>
              <strong>{room ? `${temp.toFixed(1)}°C` : '—'}</strong>
            </div>
            <button className={`ps-tile ps-tile-btn ${cooling ? 'is-on' : ''}`} onClick={() => setAcEnabled((v) => !v)}>
              <IconFan width={16} height={16} className={cooling ? 'ps-spin' : ''} />
              <span>Klima · klik uklj/isklj</span>
              <strong>{!acEnabled ? 'isključena' : room?.ac ? (cooling ? `hladi → ${room.ac.target}°` : `održava ${room.ac.target}°`) : 'nema u sobi'}</strong>
            </button>
            <button className={`ps-tile ps-tile-btn ${musicOn ? 'is-on' : ''}`} onClick={() => setGenreIdx((g) => (g + 1) % GENRES.length)}>
              <IconMusic width={16} height={16} />
              <span>Muzika · klik menja</span>
              <strong>{genreIdx === 0 ? 'isključena' : room?.music ? GENRES[genreIdx] : `${GENRES[genreIdx]} (čeka vas)`}</strong>
            </button>
            <div className={`ps-tile ${watts ? 'is-on' : ''}`}>
              <IconBolt width={16} height={16} />
              <span>Potrošnja</span>
              <strong>{watts} W</strong>
            </div>
          </div>

          <div className="ps-controls">
            <button className="ps-play" onClick={() => { setStep(0); setPlaying((p) => !p) }}>
              {playing ? <IconPause width={14} height={14} /> : <IconPlay width={14} height={14} />}
              {playing ? 'Zaustavi obilazak' : 'Pokreni automatski obilazak'}
            </button>
          </div>

          <div className="ps-rooms">
            {ROOMS.map((r) => (
              <button key={r.id} className={r.id === roomId ? 'is-active' : ''} onClick={() => teleport(r.id)}>{r.name}</button>
            ))}
          </div>

          <div className="ps-log">
            <h3>Automatizacija — uživo</h3>
            {log.map((l, i) => (
              <p key={`${l.t}-${i}`}><time>{mmss(l.t)}</time> · {l.text}</p>
            ))}
          </div>
        </aside>
      </div>

      <p className="ps-credit">Model stana: SrMonteiro na Sketchfab-u (CC Attribution).</p>
    </section>
  )
}
