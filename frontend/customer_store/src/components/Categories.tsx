'use client'
import React from 'react';
// AFTER
import { Hoodie } from 'lucide-react'; // Or the specific icon you need
import { Shirt } from 'lucide-react';
import { Zap } from 'lucide-react';


const categories = [
  { name: 'T-Shirts', icon: <Shirt /> },
  { name: 'Hoodies', icon: <Hoodie /> },
  { name: 'New Drops', icon: <Zap /> },
]

export function Categories() {
  return (
    <section className="py-12">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-6 text-white">Browse by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div
              key={category.name}
              className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:border-accent-purple transition-colors"
            >
              <div className="text-accent-purple mb-4">{React.cloneElement(category.icon, { size: 40 })}</div>
              <h3 className="text-lg font-semibold text-white">{category.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
