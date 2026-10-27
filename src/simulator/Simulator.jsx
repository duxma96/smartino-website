import { useEffect, useRef, useState } from 'react'
import {
  ROOM_DEFS, round1, fmt, roomCenter, resolveFurniture, resolveLightPos, resolveAcUnit,
  WALLS, WINDOWS, DOORS, CANVAS_W, CANVAS_H, GENRES, WATTAGE, DEMO_PATH, DEMO_TOTAL,
} from './rooms.js'
import { IconBulb, IconThermo, IconMusic, IconDrop, IconHub, IconFan, IconPlay, IconPause, IconBolt } from '../icons.jsx'
import './simulator.css'

const TICK_MS = 250
const COOL_STEP_MS = 900 // -0.1°C every ~0.9s while occupied & above target
const WARM_STEP_MS = 5000 // +0.1°C every 5s while empty & below ambient

function initPhysics() {
  const state = {}
  ROOM_DEFS.forEach((r) => {
    state[r.id] = {
      temp: r.hasAC ? r.ambient : null,
      ac: 'off',
      light: false,
      music: false,
      warmAcc: 0,
      coolAcc: 0,
      loggedIdle: true,
    }
  })
  return state
}

export default function Simulator() {
  const containerRef = useRef(null)
  const physRef = useRef(initPhysics())
  const currentRoomRef = useRef(null)
  const prevRoomRef = useRef(null)
  const startRef = useRef(performance.now())
  const autoElapsedRef = useRef(0)

  const [currentRoomId, setCurrentRoomId] = useState(null)
  const [dot, setDot] = useState({ x: 50, y: 50, visible: false })
  const [, setTick] = useState(0)
  const [log, setLog] = useState(['00:00 · Sistem spreman — pomerite miš u stan'])
  const [activeCount, setActiveCount] = useState(0)
  const [energyW, setEnergyW] = useState(0)
  const [genreByRoom, setGenreByRoom] = useState({})
  const [layout, setLayout] = useState('normal')
  const [glowIntensity, setGlowIntensity] = useState(55)
  const [isPlaying, setIsPlaying] = useState(false)
  const [autoProgressPct, setAutoProgressPct] = useState(0)

  useEffect(() => {
    currentRoomRef.current = currentRoomId
  }, [currentRoomId])

  function setRoomView(id) {
    const r = ROOM_DEFS.find((x) => x.id === id)
    if (!r) return
    const c = roomCenter(r)
    setDot({ x: c.x, y: c.y, visible: true })
    setCurrentRoomId(id)
  }

  function teleport(id) {
    setIsPlaying(false)
    setRoomView(id)
  }

  function cycleGenre(roomId) {
    const cur = genreByRoom[roomId] || GENRES[0]
    const next = GENRES[(GENRES.indexOf(cur) + 1) % GENRES.length]
    setGenreByRoom((g) => ({ ...g, [roomId]: next }))
    const time = fmt(performance.now() - startRef.current)
    const label = ROOM_DEFS.find((r) => r.id === roomId)?.label
    setLog((l) => [`${time} · ${label}: žanr → ${next}`, ...l].slice(0, 9))
  }

  function seekAuto(pct) {
    autoElapsedRef.current = (pct / 100) * DEMO_TOTAL
    setAutoProgressPct(pct)
    let acc = 0
    let seg = DEMO_PATH[0]
    for (const s of DEMO_PATH) {
      if (autoElapsedRef.current < acc + s.dwell) { seg = s; break }
      acc += s.dwell
    }
    setRoomView(seg.id)
  }

  // physics + autoplay + energy loop
  useEffect(() => {
    const id = setInterval(() => {
      const occId = currentRoomRef.current
      const newLogs = []
      let active = 0
      let watts = 0
      const time = fmt(performance.now() - startRef.current)

      ROOM_DEFS.forEach((r) => {
        const s = physRef.current[r.id]
        const occupied = occId === r.id
        s.light = occupied
        s.music = occupied && !!r.hasMusic
        if (s.light) { active += 1; watts += WATTAGE.light }
        if (s.music) { active += 1; watts += WATTAGE.music }

        if (r.hasAC) {
          if (occupied) {
            s.warmAcc = 0
            if (s.temp > r.target + 0.05) {
              s.ac = 'cooling'
              active += 1
              watts += WATTAGE.acCooling
              s.coolAcc += TICK_MS
              if (s.coolAcc >= COOL_STEP_MS) {
                s.temp = Math.max(r.target, round1(s.temp - 0.1))
                s.coolAcc = 0
              }
            } else {
              if (!s.loggedIdle) {
                newLogs.push(`${time} · ${r.label}: klima dostigla ${r.target}°C — isključena`)
                s.loggedIdle = true
              }
              s.ac = 'idle'
              watts += WATTAGE.acIdle
              s.coolAcc = 0
            }
          } else {
            s.ac = 'off'
            s.coolAcc = 0
            s.warmAcc += TICK_MS
            if (s.warmAcc >= WARM_STEP_MS) {
              if (s.temp < r.ambient - 0.05) {
                s.temp = Math.min(r.ambient, round1(s.temp + 0.1))
              }
              s.warmAcc = 0
            }
          }
        }
      })

      if (newLogs.length) setLog((l) => [...newLogs.reverse(), ...l].slice(0, 9))
      setActiveCount(active)
      setEnergyW(watts)

      if (isPlaying) {
        autoElapsedRef.current = (autoElapsedRef.current + TICK_MS) % DEMO_TOTAL
        let acc = 0
        let seg = null
        for (const s of DEMO_PATH) {
          if (autoElapsedRef.current < acc + s.dwell) { seg = s; break }
          acc += s.dwell
        }
        if (seg && currentRoomRef.current !== seg.id) setRoomView(seg.id)
        setAutoProgressPct(Math.round((autoElapsedRef.current / DEMO_TOTAL) * 100))
      }

      setTick((t) => t + 1)
    }, TICK_MS)
    return () => clearInterval(id)
  }, [isPlaying])

  // enter/exit motion-sensor log
  useEffect(() => {
    const prevId = prevRoomRef.current
    if (prevId === currentRoomId) return
    const time = fmt(performance.now() - startRef.current)
    const entries = []
    if (prevId) {
      const prevDef = ROOM_DEFS.find((r) => r.id === prevId)
      entries.push(
        `${time} · ${prevDef.label}: nema pokreta → svetlo OFF${prevDef.hasAC ? ', klima OFF' : ''}`
      )
    }
    if (currentRoomId) {
      const currDef = ROOM_DEFS.find((r) => r.id === currentRoomId)
      entries.push(
        `${time} · ${currDef.label}: pokret detektovan → svetlo ON${
          currDef.hasAC ? `, klima cilj ${currDef.target}°C` : ''
        }`
      )
      if (currDef.hasAC) physRef.current[currDef.id].loggedIdle = false
    }
    if (entries.length) setLog((l) => [...entries.reverse(), ...l].slice(0, 9))
    prevRoomRef.current = currentRoomId
  }, [currentRoomId])

  function handleMove(e) {
    if (isPlaying) setIsPlaying(false)
    const rect = containerRef.current.getBoundingClientRect()
    const px = ((e.clientX - rect.left) / rect.width) * 100
    const py = ((e.clientY - rect.top) / rect.height) * 100
    setDot({ x: px, y: py, visible: true })
    const room = ROOM_DEFS.find(
      (r) => px >= r.left && px <= r.left + r.width && py >= r.top && py <= r.top + r.height
    )
    setCurrentRoomId(room ? room.id : null)
  }

  function handleLeave() {
    if (isPlaying) return
    setDot((d) => ({ ...d, visible: false }))
    setCurrentRoomId(null)
  }

  const currentRoom = currentRoomId ? ROOM_DEFS.find((r) => r.id === currentRoomId) : null
  const currentPhys = currentRoomId ? physRef.current[currentRoomId] : null

  return (
    <section id="simulator" className="sim-section">
      <div className="container">
        <div className="section-head sim-head">
          <span className="eyebrow">Uživo</span>
          <h2>Vidite automatizaciju u akciji</h2>
          <p className="section-sub">
            Pomerajte miš kroz sobe kao da hodate po stanu odozgo, koristite kartice soba ili
            pokrenite automatski obilazak. Svetlo se pali čim uđete, klima hladi do zadate
            temperature i gasi se kad je dostigne, a čim izađete iz sobe — temperatura polako
            raste, 0.1°C na svakih 5 sekundi. Isti princip pokreće <strong>Security 1</strong>,{' '}
            <strong>Klima</strong> i <strong>Lite</strong> pakete u pravom Smartino sistemu.
          </p>
          <span className="sim-hub-badge">
            <IconHub width={16} height={16} /> HUB aktivan · {activeCount} uređaja u upotrebi
          </span>
        </div>

        <div className={`sim-body ${layout === 'enlarged' ? 'is-enlarged' : ''}`}>
          <div
            className={`sim-floor ${dot.visible ? 'has-focus' : ''}`}
            ref={containerRef}
            onMouseMove={handleMove}
            onMouseLeave={handleLeave}
            style={{ '--glow-strength': glowIntensity / 100 }}
          >
            <svg className="sim-svg sim-svg--base" viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`} preserveAspectRatio="none">
              {WALLS.map((w, i) =>
                w.x != null
                  ? <line key={`w${i}`} className="sim-wall" x1={w.x} y1={w.y1} x2={w.x} y2={w.y2} />
                  : <line key={`w${i}`} className="sim-wall" x1={w.x1} y1={w.y} x2={w.x2} y2={w.y} />
              )}

              {WINDOWS.map((win, i) => {
                if (win.wall === 'top' || win.wall === 'bottom') {
                  return [-7, 0, 7].map((off, j) => (
                    <line key={`win${i}-${j}`} className="sim-window" x1={win.x1} y1={win.at + off} x2={win.x2} y2={win.at + off} />
                  ))
                }
                return [-7, 0, 7].map((off, j) => (
                  <line key={`win${i}-${j}`} className="sim-window" x1={win.at + off} y1={win.y1} x2={win.at + off} y2={win.y2} />
                ))
              })}

              {DOORS.map((d, i) => (
                <g key={`door${i}`}>
                  <line className="sim-door-leaf" x1={d.hinge.x} y1={d.hinge.y} x2={d.leafEnd.x} y2={d.leafEnd.y} />
                  <path
                    className="sim-door-arc"
                    d={`M ${d.leafEnd.x} ${d.leafEnd.y} A ${d.r} ${d.r} 0 0 ${d.sweep} ${d.arcEnd.x} ${d.arcEnd.y}`}
                  />
                </g>
              ))}

              {ROOM_DEFS.flatMap((r) =>
                resolveFurniture(r).map((s, i) => {
                  const key = `${r.id}-${i}`
                  if (s.type === 'rect') return <rect key={key} className="sim-furniture" x={s.x} y={s.y} width={s.w} height={s.h} rx={s.rx} />
                  if (s.type === 'circle') return <circle key={key} className="sim-furniture" cx={s.cx} cy={s.cy} r={s.r} />
                  if (s.type === 'line') return <line key={key} className="sim-furniture" x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} />
                  return null
                })
              )}

              {ROOM_DEFS.filter((r) => r.hasAC).map((r) => {
                const ac = resolveAcUnit(r)
                if (!ac) return null
                const s = physRef.current[r.id]
                return (
                  <g key={`ac-${r.id}`}>
                    <rect className="sim-ac-unit" x={ac.unit.x} y={ac.unit.y} width={ac.unit.w} height={ac.unit.h} rx={2} />
                    {s.ac === 'cooling' && ac.flow.map((f, i) => (
                      <line key={i} className="sim-airflow-line" x1={f.x1} y1={f.y1} x2={f.x2} y2={f.y2} style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </g>
                )
              })}
            </svg>

            {ROOM_DEFS.map((r) => {
              const glow = resolveLightPos(r)
              return (
                <div
                  key={`glow-${r.id}`}
                  className={`sim-light-glow ${physRef.current[r.id].light ? 'is-on' : ''}`}
                  style={{ left: `${(glow.x / CANVAS_W) * 100}%`, top: `${(glow.y / CANVAS_H) * 100}%` }}
                />
              )
            })}

            {ROOM_DEFS.map((r) => {
              const s = physRef.current[r.id]
              return (
                <div
                  key={r.id}
                  className={`sim-room ${s.light ? 'is-lit' : ''} ${
                    currentRoomId === r.id ? 'is-current' : ''
                  }`}
                  style={{
                    left: `${r.left}%`,
                    top: `${r.top}%`,
                    width: `${r.width}%`,
                    height: `${r.height}%`,
                  }}
                >
                  <div className="sim-room-head">
                    <span className="sim-room-label">{r.label}</span>
                    <IconBulb
                      width={16}
                      height={16}
                      className={`sim-icon ${s.light ? 'sim-icon--on' : ''}`}
                    />
                  </div>

                  <div className="sim-room-badges">
                    {r.hasAC && (
                      <span className={`sim-chip sim-chip--ac ${s.ac}`}>
                        <IconThermo width={14} height={14} />
                        {s.temp.toFixed(1)}°C
                      </span>
                    )}
                    {r.hasHumidity && (
                      <span className="sim-chip">
                        <IconDrop width={14} height={14} /> senzor vlage
                      </span>
                    )}
                    {r.hasPlug && <span className="sim-chip">pametna utičnica</span>}
                  </div>

                  {r.hasMusic && (
                    <div className={`sim-eq ${s.music ? 'is-playing' : ''}`}>
                      <IconMusic width={14} height={14} />
                      <span className="sim-eq-bars">
                        <i /><i /><i /><i />
                      </span>
                      <span className="sim-eq-genre">{genreByRoom[r.id] || GENRES[0]}</span>
                    </div>
                  )}
                </div>
              )
            })}

            {dot.visible && (
              <div className="sim-dot" style={{ left: `${dot.x}%`, top: `${dot.y}%` }} />
            )}

            {!dot.visible && (
              <div className="sim-hint">Pomerite miš ovde da &quot;uđete&quot; u stan</div>
            )}
          </div>

          <div className="sim-log">
            <span className="sim-log-title">Automatizacija — uživo</span>
            <ul>
              {log.map((entry, i) => (
                <li key={i}>{entry}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="sim-controls">
          <div className="sim-tile">
            <span className="sim-tile-label">Raspored</span>
            <button
              type="button"
              className="sim-tile-toggle"
              onClick={() => setLayout((l) => (l === 'normal' ? 'enlarged' : 'normal'))}
            >
              {layout === 'normal' ? 'Standardno' : 'Uvećano'}
            </button>
          </div>

          <div className="sim-tile">
            <span className="sim-tile-label">Temperatura uživo</span>
            <span className="sim-tile-value">
              {currentRoom?.hasAC ? `${currentPhys.temp.toFixed(1)}°C` : '—'}
            </span>
          </div>

          <div className="sim-tile">
            <span className="sim-tile-label">HVAC</span>
            <span className="sim-tile-value sim-tile-value--icon">
              <IconFan width={18} height={18} className={currentPhys?.ac === 'cooling' ? 'is-spinning' : ''} />
              {!currentRoom?.hasAC ? 'Neaktivan' : currentPhys.ac === 'cooling' ? 'Hladi' : 'Na cilju'}
            </span>
          </div>

          <div className="sim-tile">
            <span className="sim-tile-label">Audio</span>
            {currentRoom?.hasMusic ? (
              <button type="button" className="sim-tile-toggle" onClick={() => cycleGenre(currentRoomId)}>
                {genreByRoom[currentRoomId] || GENRES[0]}
              </button>
            ) : (
              <span className="sim-tile-value">Tišina</span>
            )}
          </div>

          <div className="sim-tile">
            <span className="sim-tile-label">Potrošnja</span>
            <span className="sim-tile-value sim-tile-value--icon">
              <IconBolt width={16} height={16} /> {energyW} W
            </span>
          </div>
        </div>

        <div className="sim-timeline">
          <button
            type="button"
            className="sim-play"
            onClick={() => setIsPlaying((p) => !p)}
            aria-label={isPlaying ? 'Pauziraj obilazak' : 'Pokreni obilazak'}
          >
            {isPlaying ? <IconPause width={16} height={16} /> : <IconPlay width={16} height={16} />}
          </button>
          <span className="sim-timeline-label">Automatski obilazak stana</span>
          <input
            className="sim-range"
            type="range"
            min={0}
            max={100}
            value={autoProgressPct}
            onChange={(e) => seekAuto(Number(e.target.value))}
          />
          <span className="sim-timeline-pct">{autoProgressPct}%</span>
        </div>

        <div className="sim-raydensity">
          <span>Intenzitet osvetljenja</span>
          <input
            className="sim-range"
            type="range"
            min={0}
            max={100}
            value={glowIntensity}
            onChange={(e) => setGlowIntensity(Number(e.target.value))}
          />
        </div>

        <div className="sim-tabs">
          {ROOM_DEFS.map((r) => (
            <button
              key={r.id}
              type="button"
              className={`sim-tab ${currentRoomId === r.id ? 'is-active' : ''}`}
              onClick={() => teleport(r.id)}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="sim-legend">
          <span><IconBulb width={15} height={15} /> Svetlo po prisutnosti</span>
          <span><IconThermo width={15} height={15} /> Klima do zadate temperature</span>
          <span><IconMusic width={15} height={15} /> Muzika i žanr po sobi</span>
          <span><IconDrop width={15} height={15} /> Senzor vlage (Safe paket)</span>
          <span><IconBolt width={15} height={15} /> Procena potrošnje uživo</span>
        </div>

        <p className="sim-note">
          Ilustrovani plan stana, osvetljenje i automatski obilazak su deo iste logike koja
          pokreće pravi Smartino sistem — ovde je samo vizuelizovana radi lakšeg razumevanja.
        </p>
      </div>
    </section>
  )
}
