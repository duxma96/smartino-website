import { useEffect, useState } from 'react'
import logo from './assets/logo.png'
import install1 from './assets/install-1.jpg'
import install2 from './assets/install-2.jpg'
import install3 from './assets/install-3.jpg'
import apartmentTop from './assets/apartment-top.png'
import {
  IconBulb, IconDrop, IconShield, IconCamera, IconThermo, IconKey,
  IconHub, IconPhone, IconLayers, IconArrowRight, IconMail, IconInstagram,
} from './icons.jsx'
import Simulator from './simulator/PhotoSimulator.jsx'
import './App.css'

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
  { n: '01', title: 'Razgovor i uvid', text: 'Upoznamo vaš prostor, navike i prioritete — bilo da je u pitanju novogradnja ili već useljen stan.' },
  { n: '02', title: 'Predlog rešenja', text: 'Predlažemo pakete ili kombinaciju paketa koja ima smisla za vas, uz jasnu ponudu i cenu.' },
  { n: '03', title: 'Instalacija', text: 'Montiramo i povezujemo opremu, podešavamo HUB i aplikaciju — sistem testiramo pre nego što vam ga predamo.' },
  { n: '04', title: 'Podrška i nadogradnja', text: 'Tu smo i posle — sistem se lako proširuje novim paketima kako vam rastu potrebe.' },
]

const NAV_LINKS = [
  { href: '#paketi', label: 'Paketi' },
  { href: '#kako-radimo', label: 'Kako radimo' },
  { href: '#simulator', label: 'Uživo' },
  { href: '#o-nama', label: 'O nama' },
  { href: '#kontakt', label: 'Kontakt' },
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
  return (
    <section id="top" className="hero">
      <div className="hero-glow" aria-hidden="true" />
      <div className="container hero-grid">
        <div className="hero-copy">
          <span className="eyebrow">Pametna automatizacija doma</span>
          <h1>
            Vaš dom.<br />
            <span className="text-lime">Pametniji.</span> Bezbedniji.<br />
            Prilagođen vama.
          </h1>
          <p className="hero-lead">
            Smartino osmišljava i instalira modularne sisteme za pametan dom — rasvetu, bezbednost,
            video nadzor, klimu i kontrolu pristupa — sve upravljivo sa jednog mesta, preko telefona,
            tableta ili daljinskog upravljača.
          </p>
          <div className="hero-actions">
            <a href="#paketi" className="btn btn-primary">
              Pogledajte pakete <IconArrowRight width={18} height={18} />
            </a>
            <a href="#kontakt" className="btn btn-ghost">Zakažite besplatan razgovor</a>
          </div>
          <div className="hero-stats">
            <div><strong>6</strong><span>modularnih paketa</span></div>
            <div><strong>1</strong><span>HUB za ceo sistem</span></div>
            <div><strong>iOS/Android</strong><span>upravljanje s telefona</span></div>
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

function TrustStrip() {
  const items = [
    { icon: IconLayers, text: 'Modularni paketi — počnite gde želite' },
    { icon: IconHub, text: 'Jedan HUB upravlja celim sistemom' },
    { icon: IconPhone, text: 'Kontrola s telefona, tableta ili daljinca' },
    { icon: IconShield, text: 'Lako nadogradivo kako rastu vaše potrebe' },
  ]
  return (
    <section className="trust-strip">
      <div className="container trust-grid">
        {items.map((it, i) => (
          <div className="trust-item" key={i}>
            <it.icon width={22} height={22} />
            <span>{it.text}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

function About() {
  return (
    <section id="o-nama" className="about">
      <div className="container about-grid">
        <div>
          <span className="eyebrow">O nama</span>
          <h2>Pametan dom, bez nepotrebne komplikacije</h2>
        </div>
        <div className="about-copy">
          <p>
            Smartino projektuje i instalira sisteme za pametan dom — za novogradnju i za već useljene
            stanove i kuće. Umesto jednog velikog, skupog rešenja, nudimo pakete koje birate po potrebi:
            krenete od jednog, pa nadograđujete kad i koliko poželite.
          </p>
          <p>
            Svi paketi rade zajedno kao jedinstven sistem, preko jednog pametnog HUB-a po stambenoj
            jedinici. Ako imate specifičnu ideju ili prostor koji odudara od standarda — sastavljamo
            personalizovano rešenje prilagođeno vama.
          </p>
        </div>
      </div>
    </section>
  )
}

function Packages() {
  return (
    <section id="paketi" className="packages">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Ponuda</span>
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
          <span className="eyebrow">Proces</span>
          <h2>Kako izgleda saradnja</h2>
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
        <h2>Spremni da nadogradite svoj dom?</h2>
        <p>Recite nam kakav prostor imate i šta vas najviše zanima — javljamo se s predlogom rešenja.</p>
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
          <h2>Popričajmo o vašem prostoru</h2>
          <p className="section-sub">
            Pišite nam šta imate na umu — broj soba, da li je novogradnja ili postojeći stan, i koji
            paketi vas najviše zanimaju. Odgovaramo sa predlogom rešenja i orijentacionom cenom.
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
            Koji paket vas zanima?
            <select name="paket" defaultValue="">
              <option value="" disabled>Izaberite paket</option>
              {PACKAGES.map((p) => <option key={p.id} value={p.name}>{p.name} — {p.tagline}</option>)}
              <option value="Nisam siguran/na">Nisam siguran/na — treba mi savet</option>
            </select>
          </label>
          <label>
            Poruka
            <textarea name="poruka" rows={4} placeholder="Recite nam nešto o vašem prostoru..." required />
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
        <TrustStrip />
        <About />
        <Packages />
        <HowWeWork />
        <Simulator />
        <Work />
        <CtaBanner />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
