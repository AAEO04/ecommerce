import Image from 'next/image'
import { Flame, CheckCircle2, Heart, Rocket, Star, Zap, Target } from 'lucide-react'

const stats = [
  { label: 'Drops shipped', value: '120K+', accent: 'text-electric-volt-green' },
  { label: 'Rush community', value: '85 countries', accent: 'text-accent-red-500' },
  { label: 'Avg. fulfilment', value: '24H', accent: 'text-accent-purple-600' },
]

const pillars = [
  {
    title: 'Voltage Design Lab',
    description: 'Matte textures, reflective seams, limited-run pigment baths. Engineered chaos you can wear.',
    icon: Flame,
    accent: 'text-accent-red-500'
  },
  {
    title: 'Trust Over Hype',
    description: 'Encrypted checkout, lightning-fast logistics and human support that actually responds.',
    icon: CheckCircle2,
    accent: 'text-electric-volt-green'
  },
  {
    title: 'Community Pulse',
    description: 'Drops co-created with stylists, dancers, riders, coders—the people moving culture forward.',
    icon: Heart,
    accent: 'text-accent-purple-600'
  }
]

const timeline = [
  { year: '2019', title: 'Prototype Days', copy: 'Garage screen prints, pop-up raves, and a handful of midnight orders.' },
  { year: '2021', title: 'Kinetic Chaos', copy: 'First “Rush Lab” capsule sells out in 3 minutes. International shipping goes live.' },
  { year: '2024', title: 'Hyper Rush Era', copy: 'Integrated fit tech, encrypted cart flows, sensory packaging, and a global crew.' },
]

export default function AboutPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="absolute inset-0 hero-grid opacity-20" aria-hidden="true" />
      <div className="absolute inset-0 hero-noise opacity-30" aria-hidden="true" />

      <div className="relative z-10 space-y-24 py-20">
        {/* Hero */}
        <section className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-6">
              <p className="inline-flex items-center gap-3 rounded-full border border-white/30 px-5 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-white/70">
                <Zap className="h-4 w-4 text-electric-volt-green" />
                Mad Rush Collective
              </p>
              <h1 className="text-5xl md:text-6xl font-black leading-[1.05]">
                Built for velocity. Fueled by community. No chills, just RUSH.
              </h1>
              <p className="text-lg text-white/70">
                We’re a Lagos-born, globally wired studio crafting kinetic streetwear with encrypted experiences, tactile fabrics, and limited-run drip that mirrors movement.
              </p>
              <div className="flex flex-wrap gap-6">
                {stats.map((stat) => (
                  <div key={stat.label} className="space-y-1">
                    <p className={`text-3xl font-black ${stat.accent}`}>{stat.value}</p>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/60">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-gradient-to-br from-neutral-900 via-black to-neutral-900 p-10">
              <div className="absolute inset-0 opacity-30 mix-blend-screen">
                <Image src="/brand-circle.png" alt="Mad Rush" fill className="object-cover" />
              </div>
              <div className="relative space-y-4">
                <p className="text-sm uppercase tracking-[0.5em] text-white/50">Drop 07 dossier</p>
                <p className="text-3xl font-bold">“When the city doesn’t sleep, neither do our ideas.”</p>
                <p className="text-white/70 text-sm">— Creative Director, MAD RUSH</p>
              </div>
            </div>
          </div>
        </section>

        {/* Story + Pillars */}
        <section className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <h2 className="text-4xl font-black">From underground signal to kinetic house.</h2>
              <p className="text-white/70 text-lg">
                MAD RUSH started as a rogue run of tees at midnight pop-ups. We layered reflective foils by hand, shipped packages from bike messengers, and laced each order with hand-written hype notes.
              </p>
              <p className="text-white/60">
                Today, we operate a distributed design lab that merges tactile craft with digital rituals—3D draping, encrypted checkout motions, scent-enhanced packaging, and verified provenance for every drop.
              </p>
            </div>
            <div className="space-y-4">
              {pillars.map((pillar) => (
                <div key={pillar.title} className="flex gap-4 rounded-2xl border border-white/10 bg-neutral-950/80 p-5">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 ${pillar.accent}`}>
                    <pillar.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{pillar.title}</h3>
                    <p className="text-white/70">{pillar.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="container mx-auto px-4">
          <div className="rounded-[40px] border border-white/10 bg-gradient-to-r from-neutral-950 via-black to-neutral-900 p-12 text-center">
            <p className="inline-flex items-center justify-center gap-3 rounded-full border border-white/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-white/70">
              <Target className="h-4 w-4 text-accent-purple-500" />
              Mission brief
            </p>
            <h2 className="mt-6 text-4xl md:text-5xl font-black">Empower the rush.</h2>
            <p className="mt-4 text-white/70 text-lg max-w-3xl mx-auto">
              We build frictionless retail and high-energy garments for people who move fast. Every interaction—from tap-to-cart animations to the scent inside the mailer—should feel like a performance.
            </p>
          </div>
        </section>

        {/* Timeline */}
        <section className="container mx-auto px-4">
          <h3 className="text-2xl font-semibold mb-8 uppercase tracking-[0.3em] text-white/60">Glitch timeline</h3>
          <div className="grid gap-6 md:grid-cols-3">
            {timeline.map((item) => (
              <div key={item.year} className="rounded-3xl border border-white/10 bg-neutral-950/80 p-6">
                <p className="text-electric-volt-green text-sm tracking-[0.4em]">{item.year}</p>
                <h4 className="mt-3 text-xl font-semibold">{item.title}</h4>
                <p className="mt-2 text-white/70 text-sm">{item.copy}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Values */}
        <section className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-black">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-electric-volt-green/60">
                <Rocket className="h-8 w-8 text-black" />
              </div>
              <h3 className="text-2xl font-bold">Innovation loops</h3>
              <p className="text-black/70">Rapid prototyping, community-sourced samples, and sensory packaging cues.</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-black">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent-red-500/70">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold">Obsessive passion</h3>
              <p className="text-black/70">Every seam, CTA, and soundtrack is tuned for emotional velocity.</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-black">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent-purple-600/70">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold">Radical authenticity</h3>
              <p className="text-black/70">We don’t chase trends—we scale subcultures with transparency.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
