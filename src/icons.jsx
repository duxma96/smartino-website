const base = {
  width: 26,
  height: 26,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export const IconBulb = (p) => (
  <svg {...base} {...p}>
    <path d="M9 18h6" />
    <path d="M10 21h4" />
    <path d="M12 3a6 6 0 0 0-3.6 10.8c.6.45 1.1 1.15 1.2 1.95v.25h4.8v-.25c.1-.8.6-1.5 1.2-1.95A6 6 0 0 0 12 3Z" />
  </svg>
)

export const IconDrop = (p) => (
  <svg {...base} {...p}>
    <path d="M12 3s6 6.5 6 11a6 6 0 1 1-12 0c0-4.5 6-11 6-11Z" />
  </svg>
)

export const IconShield = (p) => (
  <svg {...base} {...p}>
    <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" />
  </svg>
)

export const IconCamera = (p) => (
  <svg {...base} {...p}>
    <rect x="3" y="7" width="14" height="11" rx="2.5" />
    <path d="M17 10.5l4-2.2v7.4l-4-2.2" />
    <circle cx="10" cy="12.5" r="2.6" />
  </svg>
)

export const IconThermo = (p) => (
  <svg {...base} {...p}>
    <path d="M12 14.5V5a2 2 0 1 0-4 0v9.5a4 4 0 1 0 4 0Z" />
    <path d="M12 9h2" />
  </svg>
)

export const IconKey = (p) => (
  <svg {...base} {...p}>
    <circle cx="8" cy="15" r="4" />
    <path d="M11 12l8-8" />
    <path d="M16 7l2.5 2.5" />
    <path d="M13.5 9.5L16 12" />
  </svg>
)

export const IconHub = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="2.4" />
    <path d="M12 3v4.2M12 16.8V21M3 12h4.2M16.8 12H21" />
    <path d="M5.6 5.6l3 3M15.4 15.4l3 3M18.4 5.6l-3 3M8.6 15.4l-3 3" />
  </svg>
)

export const IconPhone = (p) => (
  <svg {...base} {...p}>
    <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
    <path d="M11 18.5h2" />
  </svg>
)

export const IconLayers = (p) => (
  <svg {...base} {...p}>
    <path d="M12 3l9 4.8-9 4.8-9-4.8L12 3Z" />
    <path d="M3 13.2l9 4.8 9-4.8" />
  </svg>
)

export const IconArrowRight = (p) => (
  <svg {...base} {...p}>
    <path d="M5 12h14" />
    <path d="M13 6l6 6-6 6" />
  </svg>
)

export const IconMail = (p) => (
  <svg {...base} {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2.5" />
    <path d="M3.5 6.5L12 13l8.5-6.5" />
  </svg>
)

export const IconInstagram = (p) => (
  <svg {...base} {...p}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17" cy="7" r="0.8" fill="currentColor" stroke="none" />
  </svg>
)

export const IconMusic = (p) => (
  <svg {...base} {...p}>
    <path d="M9 18V5l11-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="17" cy="16" r="3" />
  </svg>
)

export const IconFan = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="1.6" />
    <path d="M12 12c0-3.5 1.5-7 4-7s2 4-1 6" />
    <path d="M12 12c-3.5 0-7-1.5-7-4s4-2 6 1" />
    <path d="M12 12c0 3.5-1.5 7-4 7s-2-4 1-6" />
  </svg>
)

export const IconPlay = (p) => (
  <svg {...base} {...p}>
    <path d="M8 5.5v13l11-6.5-11-6.5Z" fill="currentColor" stroke="none" />
  </svg>
)

export const IconPause = (p) => (
  <svg {...base} {...p}>
    <rect x="7" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none" />
    <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none" />
  </svg>
)

export const IconBolt = (p) => (
  <svg {...base} {...p}>
    <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" fill="currentColor" stroke="none" />
  </svg>
)
