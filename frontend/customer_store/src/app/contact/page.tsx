'use client'

import { useState } from 'react'
import { Mail, Phone, MapPin, Send, MessageSquare, Shield, Zap, Clock } from 'lucide-react'

const signalStats = [
  { label: 'Average response', value: '12 min', accent: 'text-electric-volt-green' },
  { label: 'Support agents', value: '24/7', accent: 'text-accent-red-500' },
  { label: 'Global hubs', value: '5 cities', accent: 'text-accent-purple-600' },
]

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    setTimeout(() => {
      setSubmitMessage('Signal received. The crew will hit you back shortly.')
      setFormData({ name: '', email: '', subject: '', message: '' })
      setIsSubmitting(false)
      setTimeout(() => setSubmitMessage(''), 5000)
    }, 1200)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="absolute inset-0 hero-grid opacity-10" aria-hidden="true" />
      <div className="absolute inset-0 hero-noise opacity-30" aria-hidden="true" />

      {/* Hero */}
      <section className="relative z-10 border-b border-white/10 py-20">
        <div className="container mx-auto px-4 space-y-10">
          <div className="space-y-6 text-center">
            <p className="inline-flex items-center gap-3 rounded-full border border-white/30 px-5 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
              <Zap className="h-4 w-4 text-electric-volt-green" />
              Mad Rush Support Line
            </p>
            <h1 className="text-5xl md:text-6xl font-black leading-[1.05]">
              Drop us a signal. We move as fast as you do.
            </h1>
            <p className="text-lg text-white/70 max-w-3xl mx-auto">
              Cart help, collab requests, rush order tracking—whatever you need, our ops lab is online. Pick your channel and we’ll answer with zero chill energy.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {signalStats.map((stat) => (
              <div key={stat.label} className="rounded-3xl border border-white/10 bg-neutral-950/80 p-6 text-center">
                <p className={`text-3xl font-black ${stat.accent}`}>{stat.value}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.3em] text-white/60">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Grid */}
      <section className="relative z-10 py-16">
        <div className="container mx-auto px-4 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Form */}
          <div className="rounded-[32px] border border-white/10 bg-neutral-950/90 p-8 shadow-[0_25px_60px_rgba(0,0,0,0.45)]">
            <div className="space-y-3 mb-8">
              <p className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-white/50">
                <MessageSquare className="h-4 w-4 text-electric-volt-green" />
                Inbox
              </p>
              <h2 className="text-3xl font-bold">Launch a message</h2>
              <p className="text-white/60">Give us the drop details—our ops lead will respond faster than your cart timer.</p>
            </div>

            {submitMessage && (
              <div className="mb-6 rounded-2xl border border-electric-volt-green/40 bg-electric-volt-green/10 px-4 py-3 text-electric-volt-green">
                {submitMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {['name', 'email', 'subject'].map((field) => (
                <div key={field}>
                  <label htmlFor={field} className="text-xs uppercase tracking-[0.35em] text-white/50">
                    {field} *
                  </label>
                  <input
                    id={field}
                    name={field}
                    type={field === 'email' ? 'email' : 'text'}
                    value={formData[field as keyof typeof formData]}
                    onChange={handleChange}
                    required
                    className="mt-2 w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-electric-volt-green"
                    placeholder={field === 'subject' ? 'Drop details' : `Your ${field}`}
                  />
                </div>
              ))}

              <div>
                <label htmlFor="message" className="text-xs uppercase tracking-[0.35em] text-white/50">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="mt-2 w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-electric-volt-green"
                  placeholder="What do you need help with?"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-3 rounded-2xl border border-electric-volt-green bg-electric-volt-green px-6 py-4 text-sm font-semibold uppercase tracking-[0.35em] text-black transition hover:-translate-y-1 disabled:opacity-60"
              >
                {isSubmitting ? 'SENDING...' : (
                  <>
                    <Send className="h-4 w-4" />
                    Dispatch
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div className="rounded-[32px] border border-white/10 bg-neutral-950/70 p-8">
              <p className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-white/50">
                <Shield className="h-4 w-4 text-accent-purple-500" />
                Command center
              </p>
              <h3 className="mt-3 text-2xl font-semibold">Talk to a human, not a bot.</h3>
              <p className="mt-2 text-white/70">
                Select your path—the ops team routes requests based on priority, region, and drop urgency.
              </p>
              <div className="mt-6 space-y-4">
                <div className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-electric-volt-green/20 text-electric-volt-green">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-white/50">Email</p>
                    <a href="mailto:hello@Madrush.com.ng" className="text-lg font-semibold text-white hover:text-electric-volt-green">
                      hello@Madrush.com.ng
                    </a>
                    <p className="text-sm text-white/60">Responses average 12 minutes</p>
                  </div>
                </div>

                <div className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-red-500/20 text-accent-red-500">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-white/50">Hotline</p>
                    <a href="tel:+23409152458280" className="text-lg font-semibold text-white hover:text-accent-red-500">
                      +234 0915 245 8280
                    </a>
                    <p className="text-sm text-white/60">Priority support for live drops</p>
                  </div>
                </div>

                <div className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-purple-600/20 text-accent-purple-600">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-white/50">Studio</p>
                    <p className="text-lg font-semibold text-white">Lagos, Nigeria</p>
                    <p className="text-sm text-white/60">Open studio tours every last Friday</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-neutral-950/70 p-8">
              <p className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-white/50">
                <Clock className="h-4 w-4 text-electric-volt-green" />
                Operating window
              </p>
              <div className="mt-4 space-y-2 text-white/70">
                {[{
                  label: 'Monday - Friday', value: '09:00 - 22:00 WAT'
                }, {
                  label: 'Saturday', value: '10:00 - 18:00 WAT'
                }, {
                  label: 'Sunday', value: 'Emergencies only'
                }].map((slot) => (
                  <div key={slot.label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                    <span>{slot.label}</span>
                    <span className="font-semibold text-white">{slot.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
