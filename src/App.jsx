import { useEffect, useState } from 'react'
import logo from './assets/logo.png'
import install1 from './assets/install-1.jpg'
import install2 from './assets/install-2.jpg'
import install3 from './assets/install-3.jpg'
import apartmentTop from './assets/apartment-top.png'
import {
  IconBulb, IconDrop, IconShield, IconCamera, IconThermo, IconKey,
  IconArrowRight, IconMail, IconInstagram,
} from './icons.jsx'
import Simulator from './simulator/PhotoSimulator.jsx'
import './App.css'
import './automation.css'

const PACKAGES = [
  {
    id: 'lite',
    icon: IconBulb,
    name: 'Lite',
    tagline: 'Osnovni komfor',
    forWho: 'Idealan za korisnike koji žele osnovu pametnog doma i jednostavno upravljanje svakodnevnim funkcijama.',
    includes: [
      'Automatizacija rasvete (uključivanje/isključivanje preko aplikacije)',
      'Upravljanje roletnama i zavesama',
      'Mobilna aplikacija za Android/iOS',
      'Daljinska kontrola van doma, preko interneta',
    ],
    devices: ['Pametni HUB', 'Pametni prekidači', 'Pametni dimeri', 'Kontroleri scena', 'Kontroleri roletni'],
  },
  {
    id: 'safe',
    icon: IconDrop,
    name: 'Safe',
    tagline: 'Osnovna zaštita',
    forWho: 'Za korisnike koji žele dodatni nivo sigurnosti od nepredviđenih situacija — curenja vode i požara.',
    includes: [
      'Senzori za detekciju poplave/vlage (kupatilo, kuhinja, terasa, ostava...)',
      'Senzori dima',
    ],
    devices: ['Pametni HUB', 'Senzori detekcije vode', 'Senzori detekcije dima', 'Senzori detekcije CO2'],
  },
  {
    id: 'security1',
    icon: IconShield,
    name: 'Security 1',
    tagline: 'Pametna bezbednost',
    forWho: 'Osnovna zaštita od provale i nadzor kretanja unutar doma, uz automatsko paljenje/gašenje svetla po prisutnosti.',
    includes: [
      'Senzori za vrata i prozore — obaveštenje o neočekivanom otvaranju',
      'Senzori pokreta u odsustvu iz stana',
    ],
    devices: ['Pametni HUB', 'Senzori otvorenih vrata/prozora', 'Senzori pokreta'],
  },
  {
    id: 'security2',
    icon: IconCamera,
    name: 'Security 2',
    tagline: 'Video nadzor i sigurnost',
    forWho: 'Za one koji žele kompletno rešenje za nadzor i uvid u dešavanja u i oko doma, u svakom trenutku.',
    includes: [
      'Sve iz Security 1 paketa',
      'IP kamere',
      'Pristup kamerama u realnom vremenu, van doma',
    ],
    devices: ['Pametni HUB', 'Senzori otvorenih vrata/prozora', 'Senzori pokreta', 'Pametne IP kamere'],
  },
  {
    id: 'klima',
    icon: IconThermo,
    name: 'Klima',
    tagline: 'Pametno grejanje i hlađenje',
    forWho: 'Za korisnike koji žele efikasnije upravljanje temperaturom i niže račune kroz automatizaciju grejanja i hlađenja.',
    includes: [
      'Zamena klasičnih ventila pametnim termostatskim glavama',
      'Upravljanje klimom univerzalnim IR daljincem',
      'Kontrola kotlova i drugih sistema grejanja',
    ],
    devices: ['Pametni HUB', 'Termostatske glave', 'Univerzalni IR daljinci', 'Senzori temperature', 'Pametni releji'],
  },
  {
    id: 'access',
    icon: IconKey,
    name: 'Access',
    tagline: 'Pametna kontrola ulaza',
    forWho: 'Maksimalna kontrola pristupa domu, bez ključeva — odličan izbor i za stanove koji se izdaju.',
    includes: [
      'Pametna brava',
      'Ulazak PIN kodom',
      'Ulazak otiskom prsta',
    ],
    devices: ['Pametni HUB', 'Pametna brava'],
  },
]

const STEPS = [
  { n: '01', title: 'Saslušamo', text: 'Pitamo kako radite i gde se vreme gubi. Bez obaveze i bez tehničkih izraza.' },
  { n: '02', title: 'Predložimo', text: 'Jasno: šta automatizujemo prvo, šta kasnije i koliko to košta.' },
  { n: '03', title: 'Napravimo i probamo', text: 'Prvo jedan mali posao, da vidite razliku. Tek onda sledeći.' },
  { n: '04', title: 'Ostanemo uz vas', text: 'Podrška, izmene i novi poslovi kako firma raste.' },
]

const PAIN = [
  { title: 'Ručno prepisivanje', text: 'Isti podaci iz mejla u Excel, iz Excela u ponudu, iz ponude u račun.' },
  { title: 'Zaboravljeni rokovi', text: 'Garancije, javljanje klijentima, ponude koje niko nije pratio.' },
  { title: 'Poruke svuda', text: 'Viber, mejl, papirići. Niko ne zna šta je tačno dogovoreno.' },
  { title: 'Nema pregleda', text: 'Koliko smo sati potrošili, šta je naplaćeno, gde smo stali.' },
]

const EXAMPLES = [
  {
    id: 'servis', label: 'Servisi i izvođači',
    items: [
      { tag: 'Ponude', title: 'Ponuda za 5 minuta', text: 'Stavke iz vašeg cenovnika, popust, PDF u vašem izgledu. Klijent ništa ne vidi dok vi ne odobrite.', gain: 'Ušteda: sati nedeljno' },
      { tag: 'Teren', title: 'Plan ekipe i zadaci', text: 'Ko je gde ove nedelje, fotografije sa terena i sati uz svaki posao, sve sa telefona.', gain: 'Ušteda: manje poziva i pitanja' },
      { tag: 'Posle prodaje', title: 'Garancije i servis', text: 'Sistem sam pamti kad garancija ističe i podseti vas i klijenta na vreme.', gain: 'Ušteda: nijedan propušten rok' },
    ],
  },
  {
    id: 'kancelarija', label: 'Kancelarija i administracija',
    items: [
      { tag: 'Dokumenta', title: 'Dokumenta se sama popunjavaju', text: 'Ugovori, zapisnici i potvrde iz jednog šablona, sa podacima koji već postoje u sistemu.', gain: 'Ušteda: nema prepisivanja' },
      { tag: 'Evidencije', title: 'Iz tabele u aplikaciju', text: 'Excel koji niko ne sme da dira postaje jednostavna aplikacija sa ulogama: ko šta sme da vidi.', gain: 'Ušteda: manje grešaka' },
      { tag: 'Podsetnici', title: 'Obaveštenja koja stižu sama', text: 'Rokovi, uplate, isteci ugovora: poruka stiže pravoj osobi, a ne ostaje u nečijoj glavi.', gain: 'Ušteda: mir u glavi' },
    ],
  },
  {
    id: 'prodaja', label: 'Prodaja i trgovina',
    items: [
      { tag: 'Upiti', title: 'Svaki upit ima svoje mesto', text: 'Sa sajta, mejla ili telefona upit upada u jednu tablu sa fazama. Vidi se ko ga vodi i šta je sledeće.', gain: 'Ušteda: nijedan izgubljen upit' },
      { tag: 'Narudžbine', title: 'Nabavka po porudžbini', text: 'Lista za poručivanje po dobavljaču se pravi iz prihvaćene ponude, uz status poručeno / stiglo.', gain: 'Ušteda: manje ručnog spiska' },
      { tag: 'Izveštaji', title: 'Pregled bez računanja', text: 'Šta je prodato, šta je naplaćeno i šta čeka, na jednoj stranici umesto u tri fajla.', gain: 'Ušteda: odluke na osnovu brojki' },
    ],
  },
]

const MODULES = [
  { title: 'Kontakti', text: 'Kupci, firme, saradnici, istorija.' },
  { title: 'Ponude', text: 'Cenovnik, PDF, verzije, deljenje.' },
  { title: 'Prodaja', text: 'Tabla sa fazama i podsetnici.' },
  { title: 'Projekti', text: 'Zadaci, sati, fotografije, dokumenta.' },
  { title: 'Kalendar i tim', text: 'Planer ekipe, odmori, statistika.' },
  { title: 'Servis i garancija', text: 'Zahtevi, termini, istek garancije.' },
  { title: 'Razgovori', text: 'Chat i brza glasanja u timu.' },
  { title: 'Uloge', text: 'Svako vidi samo ono što sme.' },
]

// Aplikacija je uvek na poddomenu app. adrese na kojoj je sajt otvoren, pa se pri promeni domena ovde ništa ne menja.
function getPortalUrl() {
  const host = window.location.hostname.replace(/^www\./, '')
  const isLocal = host === 'localhost' || /^[\d.]+$/.test(host)
  return isLocal ? 'https://app.smartino.rs' : `${window.location.protocol}//app.${host}`
}

const PORTAL_URL = getPortalUrl()

const NAV_LINKS = [
  { href: '#primeri', label: 'Automatizacija' },
  { href: '#kako-radimo', label: 'Kako radimo' },
  { href: '#platforma', label: 'Platforma' },
  { href: '#pametni-dom', label: 'Pametni dom' },
  { href: '#simulator', label: 'Uživo' },
  { href: '#kontakt', label: 'Kontakt' },
]

const FAQ = [
  { q: 'Šta je Smartino platforma?', a: 'To je aplikacija u kojoj vodimo Vaš posao od prvog upita do garancije: ponudu, termine, radove, fotografije i servis. Vi preko svog naloga vidite samo ono što se tiče Vašeg projekta.' },
  { q: 'Kako da dobijem pristup svom projektu?', a: 'Pošaljemo Vam pozivnicu i dodamo Vas na projekat. Nalog ne morate sami da pravite, a pristup traje dok traje garancija i još mesec dana posle nje.' },
  { q: 'Šta vidim kad se prijavim?', a: 'Vidite svoje projekte i dokle se stiglo, ponude koje smo Vam podelili, zakazane termine, servisne zahteve i uputstva za Vaš sistem.' },
  { q: 'Da li mogu da pogledam ponudu bez naloga?', a: 'Možete. Ponudu Vam šaljemo kao poseban link koji se otvara bez prijave, pa je možete pogledati i sa telefona.' },
  { q: 'Da li aplikacija radi na telefonu?', a: 'Radi. Otvara se u pregledaču, a možete je dodati i na početni ekran telefona, pa se otvara kao obična aplikacija.' },
  { q: 'Kako da prijavim kvar ili problem?', a: 'Javite nam se telefonom ili mejlom, ili nam pišite u razgovoru sa nama u aplikaciji. Zahtev upisujemo u servis, a Vi na svom nalogu vidite otvorene zahteve i termin dolaska.' },
  { q: 'Da li su moji podaci bezbedni?', a: 'Podaci se svakodnevno kopiraju, a prijava je moguća samo uz pozivnicu. Svaki kupac vidi isključivo svoje projekte i ponude.' },
]

function useScrolled(threshold = 12) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])
  return scrolled
}

function Header() {
  const scrolled = useScrolled()
  const [open, setOpen] = useState(false)

  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="container header-row">
        <a href="#top" className="brand">
          <img src={logo} alt="Smartino" className="brand-mark" />
          <span className="brand-name">Smartino</span>
        </a>

        <nav className={`main-nav ${open ? 'is-open' : ''}`}>
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}>{l.label}</a>
          ))}
          <a href={PORTAL_URL} className="btn btn-ghost nav-cta nav-login">
            Prijava
          </a>
          <a href="#kontakt" className="btn btn-primary nav-cta" onClick={() => setOpen(false)}>
            Zakažite konsultaciju
          </a>
        </nav>

        <button
          className={`nav-toggle ${open ? 'is-open' : ''}`}
          aria-label="Meni"
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  )
}

function Hero() {
  const flow = [
    { n: '1', text: 'Klijent popuni upit na sajtu', small: 'do sada: poruka na Viberu' },
    { auto: true, text: 'Upit sam ulazi u listu kontakata', small: 'automatski' },
    { auto: true, text: 'Pravi se nacrt ponude iz cenovnika', small: 'automatski' },
    { n: '2', text: 'Vi pregledate i odobrite', small: 'jedan klik' },
    { auto: true, text: 'PDF stiže klijentu, podsetnik za javljanje za 3 dana', small: 'automatski' },
  ]
  return (
    <section id="top" className="hero">
      <div className="hero-glow" aria-hidden="true" />
      <div className="container hero-grid">
        <div className="hero-copy">
          <span className="eyebrow">Automatizacija za firme i domove</span>
          <h1>
            Posao koji radite svaki dan —{' '}
            <span className="text-lime">neka se radi sam.</span>
          </h1>
          <p className="hero-lead">
            Ponude, podsetnici, evidencije, prepisivanje iz jednog fajla u drugi. Pogledamo kako vaša
            firma zaista radi i ubrzamo sve što se stalno ponavlja. Isti princip koristimo da pametne
            domove učinimo jednostavnim.
          </p>
          <div className="hero-actions">
            <a href="#kontakt" className="btn btn-primary">
              Besplatan razgovor <IconArrowRight width={18} height={18} />
            </a>
            <a href="#primeri" className="btn btn-ghost">Pogledajte primere</a>
          </div>
        </div>

        <div className="flow-card" aria-label="Primer toka: od upita do ponude">
          <h3>Primer: od upita do ponude</h3>
          {flow.map((f, i) => (
            <div key={i} className={`flow-step ${f.auto ? 'is-auto' : ''}`}>
              <b>{f.auto ? '✓' : f.n}</b>
              <div>{f.text}<small>{f.small}</small></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Pain() {
  return (
    <section className="pain">
      <div className="container">
        <span className="eyebrow">Poznato?</span>
        <h2>Koliko vremena odlazi na isto, iznova</h2>
        <p className="section-sub">
          U većini malih firmi ista četiri problema pojedu najviše sati. Dobra vest: baš to je
          najlakše automatizovati.
        </p>
        <div className="pain-grid">
          {PAIN.map((p) => (
            <div className="pain-card" key={p.title}>
              <strong>{p.title}</strong>
              <span>{p.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Examples() {
  const [tab, setTab] = useState(EXAMPLES[0].id)
  const active = EXAMPLES.find((e) => e.id === tab)
  return (
    <section id="primeri" className="examples">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Šta automatizujemo</span>
          <h2>Primeri po vrsti posla</h2>
          <p className="section-sub">
            Ovo nisu gotovi paketi, nego pravac. Svaku firmu prvo saslušamo, pa složimo samo ono što joj treba.
          </p>
        </div>
        <div className="tabs" role="tablist">
          {EXAMPLES.map((e) => (
            <button key={e.id} role="tab" aria-selected={tab === e.id} className={`tab ${tab === e.id ? 'is-on' : ''}`} onClick={() => setTab(e.id)}>
              {e.label}
            </button>
          ))}
        </div>
        <div className="example-grid">
          {active.items.map((it) => (
            <article className="example-card" key={it.title}>
              <span className="example-tag">{it.tag}</span>
              <h3>{it.title}</h3>
              <p>{it.text}</p>
              <div className="example-gain">{it.gain}</div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function Calculator() {
  const [people, setPeople] = useState(3)
  const [hours, setHours] = useState(2)
  const [pct, setPct] = useState(40)
  const month = Math.round(people * hours * 21 * (pct / 100))
  const days = Math.round((month * 12) / 8)
  return (
    <section id="racunica" className="calc-section">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Okvirna računica</span>
          <h2>Koliko bi vam se vratilo sati?</h2>
          <p className="section-sub">
            Pomerite klizače. Ovo je grubo, samo da vidite red veličine. Prave brojke dobijamo kad pogledamo vaš posao.
          </p>
        </div>
        <div className="calc">
          <div className="calc-box">
            <label className="calc-row">
              <span>Ljudi koji rade administraciju <output>{people}</output></span>
              <input type="range" min="1" max="20" value={people} onChange={(e) => setPeople(+e.target.value)} />
            </label>
            <label className="calc-row">
              <span>Sati dnevno na ponavljajuće poslove (po osobi) <output>{hours}</output></span>
              <input type="range" min="0.5" max="6" step="0.5" value={hours} onChange={(e) => setHours(+e.target.value)} />
            </label>
            <label className="calc-row">
              <span>Koliko od toga može da se automatizuje <output>{pct}%</output></span>
              <input type="range" min="10" max="80" step="5" value={pct} onChange={(e) => setPct(+e.target.value)} />
            </label>
          </div>
          <div className="calc-box calc-result">
            <div className="calc-big">{month} h</div>
            <p>sati mesečno koji se vraćaju timu</p>
            <hr />
            <div className="calc-big calc-big-sm">{days} radnih dana</div>
            <p>godišnje, za posao koji donosi novac</p>
            <small>Računica pretpostavlja 21 radni dan mesečno. To je ilustracija, ne obećanje.</small>
          </div>
        </div>
      </div>
    </section>
  )
}

function Platform() {
  return (
    <section id="platforma" className="platform">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Smartino platforma</span>
          <h2>Alat koji koristimo i mi, i vi možete</h2>
          <p className="section-sub">
            Aplikacija koju smo napravili za sopstvenu firmu: od ponude do garancije na jednom mestu.
            Uključujete samo module koji vam trebaju.
          </p>
        </div>
        <div className="module-grid">
          {MODULES.map((m) => (
            <div className="module" key={m.title}>
              <b>{m.title}</b>
              <span>{m.text}</span>
            </div>
          ))}
        </div>
        <div className="hero-actions">
          <a href={PORTAL_URL} className="btn btn-ghost">Prijava u aplikaciju</a>
        </div>
      </div>
    </section>
  )
}

function SmartHome() {
  return (
    <section id="pametni-dom" className="smart-home">
      <div className="container hero-grid">
        <div>
          <span className="eyebrow">Pametni dom</span>
          <h2>Automatizacija počinje kod kuće</h2>
          <p className="section-sub">
            Isto razmišljanje primenjujemo na stanove i kuće: svetlo, klima, bezbednost i ulaz rade
            sami, a vi upravljate sa telefona. Šest modularnih paketa, jedan HUB, jedna aplikacija.
          </p>
          <div className="hero-actions">
            <a href="#paketi" className="btn btn-primary">
              Pogledajte pakete <IconArrowRight width={18} height={18} />
            </a>
            <a href="#simulator" className="btn btn-ghost">Isprobajte simulator uživo</a>
          </div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <HeroApartment />
        </div>
      </div>
    </section>
  )
}

// Stan odozgo (isti kao u simulatoru): dnevna soba + trpezarija "svetle", ostalo je zatamnjeno,
// a staklene oznake pokazuju šta Smartino tu radi. Koordinate su u pikselima slike (831x679).
const HERO_CHIPS = [
  { icon: IconBulb, title: 'Svetlo', text: 'Dnevna soba · uključeno', x: -4, y: 52, delay: 0 },
  { icon: IconThermo, title: '21°C', text: 'Spavaća · klima hladi', x: 66, y: 6, delay: 0.8 },
  { icon: IconCamera, title: 'Kamera', text: 'Ulaz · uživo', x: 58, y: 88, delay: 1.6, live: true },
  { icon: IconKey, title: 'Vrata', text: 'Zaključana', x: 80, y: 46, delay: 2.4 },
]

function HeroApartment() {
  return (
    <div className="hero-plan">
      <div className="hero-plan-card">
        <img src={apartmentTop} alt="" draggable="false" />
        <svg viewBox="0 0 831 679" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <radialGradient id="hero-warm">
              <stop offset="0" stopColor="#ffe9b0" stopOpacity="0.9" />
              <stop offset="0.55" stopColor="#ffcb6b" stopOpacity="0.45" />
              <stop offset="1" stopColor="#ffcb6b" stopOpacity="0" />
            </radialGradient>
            <filter id="hero-soft"><feGaussianBlur stdDeviation="9" /></filter>
            <mask id="hero-night">
              <rect width="831" height="679" fill="white" />
              <g filter="url(#hero-soft)" fill="black">
                <rect x="228" y="420" width="360" height="190" />
                <rect x="385" y="462" width="200" height="148" />
              </g>
            </mask>
            <clipPath id="hero-living">
              <rect x="228" y="420" width="360" height="190" />
            </clipPath>
          </defs>
          <rect width="831" height="679" fill="#050a1c" opacity="0.6" mask="url(#hero-night)" />
          <g clipPath="url(#hero-living)">
            <ellipse className="hero-glow-pulse" cx="400" cy="520" rx="260" ry="150" fill="url(#hero-warm)" />
          </g>
        </svg>
      </div>

      {HERO_CHIPS.map((c) => (
        <div key={c.title} className="hero-chip" style={{ left: `${c.x}%`, top: `${c.y}%`, animationDelay: `${c.delay}s` }}>
          <span className="hero-chip-icon"><c.icon width={16} height={16} /></span>
          <span className="hero-chip-text">
            <b>{c.title}{c.live && <i className="hero-chip-live" />}</b>
            <small>{c.text}</small>
          </span>
        </div>
      ))}
    </div>
  )
}

function Packages() {
  return (
    <section id="paketi" className="packages">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Pametni dom · ponuda</span>
          <h2>Šest paketa, jedan sistem</h2>
          <p className="section-sub">
            Svaki paket rešava jednu potrebu i radi samostalno. Kombinujte ih po želji — svi se
            povezuju na isti HUB i istu aplikaciju.
          </p>
        </div>

        <div className="package-grid">
          {PACKAGES.map((pkg) => (
            <article className="package-card" key={pkg.id}>
              <div className="package-icon"><pkg.icon width={24} height={24} /></div>
              <h3>{pkg.name}</h3>
              <p className="package-tagline">{pkg.tagline}</p>
              <p className="package-forwho">{pkg.forWho}</p>
              <ul className="package-includes">
                {pkg.includes.map((line, i) => <li key={i}>{line}</li>)}
              </ul>
              <div className="package-devices">
                <span>Uređaji</span>
                <p>{pkg.devices.join(' · ')}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function HowWeWork() {
  return (
    <section id="kako-radimo" className="how">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Kako radimo</span>
          <h2>Od razgovora do rezultata, u malim koracima</h2>
        </div>
        <div className="how-grid">
          {STEPS.map((s) => (
            <div className="how-step" key={s.n}>
              <span className="how-n">{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Faq() {
  return (
    <section id="pitanja" className="faq">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Česta pitanja</span>
          <h2>Šta treba da znate o našoj platformi</h2>
        </div>
        <div className="faq-list">
          {FAQ.map((f) => (
            <details className="faq-item" key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

function Work() {
  const photos = [install1, install2, install3]
  return (
    <section className="work">
      <div className="container work-grid">
        <div className="work-copy">
          <span className="eyebrow">Sa terena</span>
          <h2>Deo naših instalacija</h2>
          <p>
            Od senzora do sigurnosnih kamera — svaki uređaj postavljamo i povezujemo tako da radi
            neprimetno, u pozadini vašeg svakodnevnog života.
          </p>
        </div>
        <div className="work-photos">
          {photos.map((src, i) => (
            <div className="work-photo" key={i}>
              <img src={src} alt="Smartino instalacija" loading="lazy" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CtaBanner() {
  return (
    <section className="cta-banner">
      <div className="container cta-banner-inner">
        <h2>Spremni da ubrzate posao ili nadogradite dom?</h2>
        <p>Recite nam šta vas najviše zamara ili kakav prostor imate — javljamo se s predlogom rešenja.</p>
        <a href="#kontakt" className="btn btn-primary">
          Kontaktirajte nas <IconArrowRight width={18} height={18} />
        </a>
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section id="kontakt" className="contact">
      <div className="container contact-grid">
        <div>
          <span className="eyebrow">Kontakt</span>
          <h2>Ispričajte nam šta vas najviše zamara</h2>
          <p className="section-sub">
            Dovoljno je da opišete jedan posao koji radite stalno, ili prostor koji želite da učinite
            pametnim. Odgovaramo sa predlogom šta se tu može ubrzati i orijentacionom cenom.
          </p>

          <div className="contact-links">
            <a className="contact-link" href="mailto:office@smartino.rs">
              <IconMail width={20} height={20} />
              office@smartino.rs
            </a>
            <a className="contact-link" href="https://instagram.com/smartino.rs" target="_blank" rel="noreferrer">
              <IconInstagram width={20} height={20} />
              @smartino.rs
            </a>
          </div>
        </div>

        <form
          className="contact-form"
          action="mailto:office@smartino.rs"
          method="post"
          encType="text/plain"
        >
          <label>
            Ime i prezime
            <input type="text" name="ime" required />
          </label>
          <label>
            Email
            <input type="email" name="email" required />
          </label>
          <label>
            Šta vas zanima?
            <select name="paket" defaultValue="">
              <option value="" disabled>Izaberite temu</option>
              <option value="Automatizacija posla">Automatizacija posla u firmi</option>
              <option value="Smartino platforma">Smartino platforma (ponude, projekti, servis)</option>
              {PACKAGES.map((p) => <option key={p.id} value={p.name}>{p.name} — {p.tagline}</option>)}
              <option value="Nisam siguran/na">Nisam siguran/na — treba mi savet</option>
            </select>
          </label>
          <label>
            Poruka
            <textarea name="poruka" rows={4} placeholder="Koji posao radite stalno, ili kakav prostor imate?" required />
          </label>
          <button type="submit" className="btn btn-primary">
            Pošaljite upit <IconArrowRight width={18} height={18} />
          </button>
        </form>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-row">
        <a href="#top" className="brand">
          <img src={logo} alt="Smartino" className="brand-mark" />
          <span className="brand-name">Smartino</span>
        </a>
        <nav className="footer-nav">
          {NAV_LINKS.map((l) => <a key={l.href} href={l.href}>{l.label}</a>)}
        </nav>
        <p className="footer-copy">© {new Date().getFullYear()} Smartino. Sva prava zadržana.</p>
      </div>
    </footer>
  )
}

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Pain />
        <Examples />
        <Calculator />
        <HowWeWork />
        <Platform />
        <SmartHome />
        <Packages />
        <Simulator />
        <Work />
        <Faq />
        <CtaBanner />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
