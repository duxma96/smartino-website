// Percentage-based rects over a 900x620 floor plan canvas.
export const ROOM_DEFS = [
  {
    id: 'radna', label: 'Radna soba', left: 4.44, top: 6.45, width: 28.89, height: 41.94,
    hasAC: false, hasMusic: false, hasHumidity: false, hasPlug: true,
  },
  {
    id: 'dnevna', label: 'Dnevna soba', left: 35.56, top: 6.45, width: 60, height: 41.94,
    hasAC: true, target: 22, ambient: 27, hasMusic: true, hasHumidity: false,
  },
  {
    id: 'spavaca', label: 'Spavaća soba', left: 4.44, top: 51.61, width: 28.89, height: 41.94,
    hasAC: true, target: 21, ambient: 26, hasMusic: false, hasHumidity: false,
  },
  {
    id: 'kupatilo', label: 'Kupatilo', left: 35.56, top: 51.61, width: 28.89, height: 41.94,
    hasAC: false, hasMusic: false, hasHumidity: true,
  },
  {
    id: 'kuhinja', label: 'Kuhinja', left: 66.67, top: 51.61, width: 28.89, height: 41.94,
    hasAC: false, hasMusic: false, hasHumidity: false, hasPlug: true,
  },
]

export const round1 = (n) => Math.round(n * 10) / 10

export function fmt(ms) {
  const s = Math.max(0, Math.floor(ms / 1000))
  const m = Math.floor(s / 60)
  const ss = s % 60
  return `${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
}

export function roomCenter(r) {
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
}

// --- Illustrated blueprint layer -------------------------------------------
// Conventions follow standard architectural floor-plan drafting: interior
// partitions + exterior facade as one continuous wall weight, doorways drawn
// as a gap + door leaf + quarter-circle swing arc, windows drawn as a break
// in the exterior wall filled with three parallel "glass pane" lines.

export const CANVAS_W = 900
export const CANVAS_H = 620

export function roomPx(r) {
  return {
    x: (r.left / 100) * CANVAS_W,
    y: (r.top / 100) * CANVAS_H,
    w: (r.width / 100) * CANVAS_W,
    h: (r.height / 100) * CANVAS_H,
  }
}

// Solid wall segments (interior partitions + exterior facade), already split
// around doorway and window gaps. Vertical segments carry `x` + `y1`/`y2`;
// horizontal segments carry `y` + `x1`/`x2`.
export const WALLS = [
  // interior partitions
  { x: 310, y1: 40, y2: 220 }, // radna / dnevna, door near the bottom
  { x: 310, y1: 280, y2: 300 },
  { y: 310, x1: 40, x2: 140 }, // radna / spavaća
  { y: 310, x1: 200, x2: 300 },
  { y: 310, x1: 320, x2: 560 }, // dnevna / kupatilo+kuhinja hallway
  { y: 310, x1: 620, x2: 860 },
  { x: 590, y1: 320, y2: 420 }, // kupatilo / kuhinja
  { x: 590, y1: 480, y2: 580 },
  // exterior facade, split around the two windows on each side
  { y: 40, x1: 40, x2: 70 }, // top, left of radna window
  { y: 40, x1: 270, x2: 400 }, // top, between the two windows
  { y: 40, x1: 780, x2: 860 }, // top, right of dnevna window
  { y: 580, x1: 40, x2: 860 }, // bottom facade, no windows
  { x: 40, y1: 40, y2: 350 }, // left, above spavaća window
  { x: 40, y1: 550, y2: 580 }, // left, below spavaća window
  { x: 860, y1: 40, y2: 350 }, // right, above kuhinja window
  { x: 860, y1: 550, y2: 580 }, // right, below kuhinja window
]

// Window openings: three parallel "glass pane" lines across the wall gap.
export const WINDOWS = [
  { wall: 'top', at: 40, x1: 70, x2: 270 }, // radna
  { wall: 'top', at: 40, x1: 400, x2: 780 }, // dnevna
  { wall: 'left', at: 40, y1: 350, y2: 550 }, // spavaća
  { wall: 'right', at: 860, y1: 350, y2: 550 }, // kuhinja
]

// Door leaf + quarter-circle swing arc, drawn into the doorway gaps above.
// `hinge` is the pivot, `leafEnd` the open door tip, `arcEnd` where the arc
// meets the frame on the non-hinge side.
export const DOORS = [
  { hinge: { x: 310, y: 220 }, leafEnd: { x: 370, y: 220 }, arcEnd: { x: 310, y: 280 }, r: 60, sweep: 1 }, // radna → dnevna
  { hinge: { x: 140, y: 310 }, leafEnd: { x: 140, y: 370 }, arcEnd: { x: 200, y: 310 }, r: 60, sweep: 0 }, // radna → spavaća
  { hinge: { x: 560, y: 310 }, leafEnd: { x: 560, y: 370 }, arcEnd: { x: 620, y: 310 }, r: 60, sweep: 0 }, // dnevna → hodnik
  { hinge: { x: 590, y: 420 }, leafEnd: { x: 650, y: 420 }, arcEnd: { x: 590, y: 480 }, r: 60, sweep: 1 }, // kupatilo → kuhinja
]

// Furniture silhouettes in each room's own local 0-100 percent space, placed
// against walls the way real floor plans lay furniture out — leaving the
// room's center clear as circulation space.
export const FURNITURE_BY_ROOM = {
  radna: [
    { type: 'rect', x: 12, y: 6, w: 72, h: 15, rx: 2 }, // desk under the window
    { type: 'circle', cx: 48, cy: 32, r: 8 }, // chair
    { type: 'rect', x: 4, y: 55, w: 10, h: 40, rx: 2 }, // shelf against the side wall
  ],
  dnevna: [
    { type: 'rect', x: 3, y: 12, w: 9, h: 58, rx: 3 }, // sofa back, against the left wall
    { type: 'rect', x: 3, y: 62, w: 26, h: 13, rx: 3 }, // sofa seat, corner return
    { type: 'rect', x: 16, y: 40, w: 14, h: 16, rx: 2 }, // coffee table
    { type: 'rect', x: 89, y: 20, w: 7, h: 34, rx: 1.5 }, // tv console, against the right wall
  ],
  spavaca: [
    { type: 'rect', x: 32, y: 14, w: 62, h: 68, rx: 4 }, // bed, headboard against the right wall
    { type: 'line', x1: 82, y1: 26, x2: 82, y2: 48 }, // pillow line near the head
    { type: 'rect', x: 78, y: 15, w: 16, h: 12, rx: 2 }, // nightstand
  ],
  kupatilo: [
    { type: 'rect', x: 4, y: 10, w: 30, h: 70, rx: 8 }, // tub, against the left wall
    { type: 'rect', x: 42, y: 16, w: 26, h: 12, rx: 2 }, // sink, against the top wall
    { type: 'rect', x: 68, y: 58, w: 24, h: 30, rx: 6 }, // toilet, back corner
  ],
  kuhinja: [
    { type: 'rect', x: 6, y: 18, w: 68, h: 10, rx: 2 }, // counter, top run
    { type: 'rect', x: 6, y: 18, w: 10, h: 45, rx: 2 }, // counter, side run
    { type: 'circle', cx: 80, cy: 55, r: 11 }, // breakfast table, by the window
    { type: 'circle', cx: 80, cy: 36, r: 5 }, // chair
    { type: 'circle', cx: 80, cy: 74, r: 5 }, // chair
  ],
}

export function resolveFurniture(room) {
  const { x, y, w, h } = roomPx(room)
  const scale = h / 260
  const items = FURNITURE_BY_ROOM[room.id] || []
  return items
    .map((s) => {
      if (s.type === 'rect') {
        return { type: 'rect', x: x + (s.x / 100) * w, y: y + (s.y / 100) * h, w: (s.w / 100) * w, h: (s.h / 100) * h, rx: (s.rx || 0) * scale }
      }
      if (s.type === 'circle') {
        return { type: 'circle', cx: x + (s.cx / 100) * w, cy: y + (s.cy / 100) * h, r: s.r * scale }
      }
      if (s.type === 'line') {
        return { type: 'line', x1: x + (s.x1 / 100) * w, y1: y + (s.y1 / 100) * h, x2: x + (s.x2 / 100) * w, y2: y + (s.y2 / 100) * h }
      }
      return null
    })
    .filter(Boolean)
}

// Ceiling light position (room-local percent) — anchors the glow effect
// when a room's light turns on, instead of the mouse-tracked occupant.
export const LIGHT_POS = {
  radna: { x: 50, y: 30 },
  dnevna: { x: 50, y: 25 },
  spavaca: { x: 50, y: 30 },
  kupatilo: { x: 50, y: 35 },
  kuhinja: { x: 45, y: 30 },
}

export function resolveLightPos(room) {
  const { x, y, w, h } = roomPx(room)
  const p = LIGHT_POS[room.id] || { x: 50, y: 50 }
  return { x: x + (p.x / 100) * w, y: y + (p.y / 100) * h }
}

// Wall-mounted AC units (only rooms with hasAC) + the direction they blow
// into the room, used to animate an airflow fan while cooling.
export const AC_UNITS = {
  dnevna: { x: 90, y: 60, w: 8, h: 12, dir: 'left' }, // right wall, below the TV console
  spavaca: { x: 55, y: 3, w: 9, h: 5, dir: 'down' }, // top interior wall, clear of the window
}

function rotate(vec, deg) {
  const rad = (deg * Math.PI) / 180
  return {
    x: vec.x * Math.cos(rad) - vec.y * Math.sin(rad),
    y: vec.x * Math.sin(rad) + vec.y * Math.cos(rad),
  }
}

export function resolveAcUnit(room) {
  const unit = AC_UNITS[room.id]
  if (!unit) return null
  const { x, y, w, h } = roomPx(room)
  const scale = h / 260
  const ux = x + (unit.x / 100) * w
  const uy = y + (unit.y / 100) * h
  const uw = (unit.w / 100) * w
  const uh = (unit.h / 100) * h

  const dirVec = { down: { x: 0, y: 1 }, up: { x: 0, y: -1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } }[unit.dir]
  const edge = {
    down: { x: ux + uw / 2, y: uy + uh },
    up: { x: ux + uw / 2, y: uy },
    left: { x: ux, y: uy + uh / 2 },
    right: { x: ux + uw, y: uy + uh / 2 },
  }[unit.dir]

  const gap = 6 * scale
  const len = 42 * scale
  const start = { x: edge.x + dirVec.x * gap, y: edge.y + dirVec.y * gap }
  const flow = [-16, 0, 16].map((deg) => {
    const d = rotate(dirVec, deg)
    return { x1: start.x, y1: start.y, x2: start.x + d.x * len, y2: start.y + d.y * len }
  })

  return { unit: { x: ux, y: uy, w: uw, h: uh }, flow }
}

export const GENRES = ['Lounge', 'Jazz', 'Fokus', 'Pop']

export const WATTAGE = { light: 9, music: 14, acCooling: 950, acIdle: 55 }

// Scripted walkthrough for the "auto tour" timeline scrubber.
export const DEMO_PATH = [
  { id: 'radna', dwell: 4000 },
  { id: 'dnevna', dwell: 5500 },
  { id: 'kuhinja', dwell: 4000 },
  { id: 'kupatilo', dwell: 3000 },
  { id: 'spavaca', dwell: 5500 },
]

export const DEMO_TOTAL = DEMO_PATH.reduce((sum, seg) => sum + seg.dwell, 0)
