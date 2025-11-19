'use client';

import { useEffect, useMemo, useState } from 'react'

interface BurstParticle {
  angle: number
  distance: number
  color: string
  size: number
  duration: number
}

interface Burst {
  id: number
  x: number
  y: number
  createdAt: number
  particles: BurstParticle[]
}

const BRAND_COLORS = ['#ADFF00', '#46C018', '#D838FF', '#FF3B5C']

export function BurstOnClick() {
  const [bursts, setBursts] = useState<Burst[]>([])

  const handleClick = useMemo(
    () => (e: MouseEvent) => {
      const particleCount = 16
      const particles = Array.from({ length: particleCount }, (_, i) => ({
        angle: (360 / particleCount) * i + Math.random() * 10,
        distance: 40 + Math.random() * 80,
        color: BRAND_COLORS[Math.floor(Math.random() * BRAND_COLORS.length)],
        size: 6 + Math.random() * 6,
        duration: 0.6 + Math.random() * 0.4,
      }))

      const newBurst: Burst = {
        id: Date.now() + Math.random(),
        x: e.clientX,
        y: e.clientY,
        createdAt: performance.now(),
        particles,
      }

      setBursts((prev) => [...prev.slice(-5), newBurst])

      setTimeout(() => {
        setBursts((prev) => prev.filter((b) => b.id !== newBurst.id))
      }, 900)
    },
    []
  )

  useEffect(() => {
    window.addEventListener('pointerdown', handleClick)
    return () => window.removeEventListener('pointerdown', handleClick)
  }, [handleClick])

  return (
    <>
      {bursts.map((burst) => (
        <div key={burst.id} className="pointer-events-none">
          <span
            className="burst-ring"
            style={{
              left: burst.x,
              top: burst.y,
            }}
          />
          {burst.particles.map((particle, i) => {
            const radians = (particle.angle * Math.PI) / 180
            const tx = Math.cos(radians) * particle.distance
            const ty = Math.sin(radians) * particle.distance

            return (
              <span
                key={`${burst.id}-${i}`}
                className="burst-particle"
                style={{
                  left: burst.x,
                  top: burst.y,
                  width: particle.size,
                  height: particle.size,
                  background: particle.color,
                  boxShadow: `0 0 25px ${particle.color}`,
                  animationDuration: `${particle.duration}s`,
                  transform: `translate(${tx}px, ${ty}px)`,
                }}
              />
            )
          })}
        </div>
      ))}

      <style jsx>{`
        .burst-particle {
          position: fixed;
          border-radius: 999px;
          mix-blend-mode: screen;
          animation-name: burstParticle;
          animation-timing-function: cubic-bezier(0.19, 1, 0.22, 1);
          animation-fill-mode: forwards;
          z-index: 9998;
        }

        .burst-ring {
          position: fixed;
          width: 12px;
          height: 12px;
          border: 2px solid rgba(173, 255, 0, 0.6);
          border-radius: 999px;
          transform: translate(-50%, -50%);
          animation: burstRing 0.55s ease-out forwards;
          mix-blend-mode: screen;
          z-index: 9997;
        }

        @keyframes burstParticle {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(0.2);
          }
          60% {
            opacity: 0.95;
          }
          100% {
            opacity: 0;
            transform: translate(var(--tx, 0), var(--ty, 0)) scale(0.05);
          }
        }

        @keyframes burstRing {
          0% {
            opacity: 0.7;
            transform: translate(-50%, -50%) scale(0.2);
          }
          80% {
            opacity: 0.3;
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(3.6);
          }
        }
      `}</style>
    </>
  )
}
