'use client'

import { useEffect, useMemo, useState } from 'react'

const TELEMETRY_SETS = [
  {
    headline: 'Signal Boot',
    items: [
      { label: 'Drops Live', primary: '52', secondary: 'Cities Awake' },
      { label: 'Next Sync', primary: '03:19', secondary: 'Zulu Countdown' },
      { label: 'Thermal Load', primary: '68%', secondary: 'Safe Window' },
    ],
    status: 'Calibrating neon grid…',
  },
  {
    headline: 'Drop Telemetry',
    items: [
      { label: 'Lines Armed', primary: '128', secondary: 'Tape Channels' },
      { label: 'Cities Locked', primary: '09', secondary: 'Bunkers Ready' },
      { label: 'Uplink', primary: '4.6Gb', secondary: 'No Packet Loss' },
    ],
    status: 'Pumping chroma fuel…',
  },
  {
    headline: 'Command Prompt',
    items: [
      { label: 'Squad Online', primary: '1,482', secondary: 'Rushers' },
      { label: 'Latency', primary: '11ms', secondary: 'Fracture Safe' },
      { label: 'Vault Temp', primary: '19°', secondary: 'Stable' },
    ],
    status: 'Synth typing macro…',
  },
]

export function Loading() {
  const [progress, setProgress] = useState(8)
  const [setIndex, setSetIndex] = useState(0)
  const [scanline, setScanline] = useState(0)

  const telemetry = useMemo(() => TELEMETRY_SETS[setIndex], [setIndex])

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const increment = Math.random() * 9 + 3
        const next = prev + increment
        if (next >= 100) {
          setSetIndex((idx) => (idx + 1) % TELEMETRY_SETS.length)
          return 8
        }
        return next
      })
    }, 160)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const frame = requestAnimationFrame(function animate() {
      setScanline((prev) => (prev + 2) % 100)
      requestAnimationFrame(animate)
    })
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm">
      <div className="absolute inset-0 opacity-20" aria-hidden>
        <div className="w-full h-full bg-[radial-gradient(circle,_rgba(70,192,24,0.12)_1px,_transparent_1px)] bg-[length:32px_32px]" />
      </div>

      <div className="relative flex w-full max-w-4xl flex-col gap-10 px-6 text-white">
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-gray-300/80">
            <span>{telemetry.headline}</span>
            <span>{progress.toFixed(0).padStart(3, '0')}%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full border border-white/20 bg-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#46C018] via-[#D838FF] to-[#521F75] shadow-[0_0_25px_#46C018]
                transition-[width] duration-200"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {telemetry.items.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/15 bg-white/5 px-5 py-4 shadow-[0_0_25px_rgba(72,255,135,0.08)]"
            >
              <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400">{item.label}</p>
              <p className="text-3xl font-black text-[#ADFF00]">{item.primary}</p>
              <p className="text-sm text-gray-300/90">{item.secondary}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-white/20 bg-black/60 p-6 text-left shadow-[0_0_35px_rgba(216,56,255,0.15)]">
          <p className="font-mono text-xs uppercase tracking-[0.5em] text-gray-400">Console</p>
          <p className="mt-2 font-mono text-lg text-[#ADFF00]">
            <span className="pr-2 text-pink-400">&gt;</span> deploy new rush?
          </p>
          <p className="mt-4 text-sm text-gray-300" aria-live="polite">
            {telemetry.status}
          </p>
          <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-[#D838FF] to-transparent" />
          <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
            <span>Noise floor</span>
            <span>{scanline.toString().padStart(3, '0')} dB</span>
          </div>
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'linear-gradient(transparent 96%, rgba(0,0,0,0.4) 100%)',
          backgroundSize: '100% 4px',
          animation: 'scanline 4s linear infinite',
        }}
        aria-hidden
      />

      <style jsx>{`
        @keyframes scanline {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 0 100%;
          }
        }
      `}</style>
    </div>
  )
}
