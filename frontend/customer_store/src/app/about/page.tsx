import Image from 'next/image'

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 md:px-8">
      <div className="mb-8 text-center">
        <h1 className="font-display text-5xl md:text-6xl font-bold text-primary tracking-tight mb-2">About Mad Rush</h1>
        <p className="text-base leading-relaxed text-secondary mb-4">No Chills, Just Mad Rush. 🔥</p>
        <span className="inline-block text-xs font-bold text-accent-purple mb-2">Fast fashion, high energy, zero chill.</span>
      </div>
      <div className="flex flex-col md:flex-row gap-8 items-center">
        <div className="flex-1">
          <Image src="/placeholder-hero.jpg" alt="Mad Rush Team" width={400} height={400} className="rounded-lg object-cover aspect-square bg-surface" />
        </div>
        <div className="flex-1">
          <h2 className="section-title mb-2">Our Story</h2>
          <p className="text-base leading-relaxed text-secondary mb-4">Mad Rush was born from the streets, inspired by the energy of fast fashion and the boldness of urban style. We believe in movement, hype, and making every drop count. Our collections are designed to help you express your personality and keep up with the rush of life.</p>
          <h2 className="section-title mb-2">Our Mission</h2>
          <p className="text-base leading-relaxed text-secondary">Empower everyone to move fast, look bold, and live with no chills. We’re here to build trust through quality, design, and a friction-free shopping experience.</p>
        </div>
      </div>
    </div>
  )
}
