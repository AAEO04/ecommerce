export default function SizeGuidePage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative bg-black text-white py-20 border-b border-white/10">
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute inset-0 hero-grid" aria-hidden="true" />
          <div className="absolute inset-0 hero-noise" aria-hidden="true" />
        </div>
        <div className="max-w-4xl mx-auto px-4 text-center relative">
          <h1 className="text-4xl md:text-6xl font-black tracking-[0.2em] text-white mb-4 uppercase" style={{ fontFamily: 'var(--font-display)' }}>
            Size Guide
          </h1>
          <p className="text-xl md:text-2xl text-electric-volt-green italic font-bold tracking-wider">
            Find Your Perfect Fit
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Introduction */}
        <div className="mb-12 text-center">
          <p className="text-base md:text-lg text-gray-300 max-w-3xl mx-auto">
            Use our comprehensive size guide to find the perfect fit for your MAD RUSH streetwear.
            All measurements are in inches unless otherwise stated.
          </p>
        </div>

        {/* Men's Tops */}
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-6 uppercase tracking-[0.2em]" style={{ fontFamily: 'var(--font-display)' }}>
            Men's Tops
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
            <table className="w-full border-collapse">
              <thead className="bg-black border-b border-electric-volt-green/30">
                <tr>
                  <th className="border-r border-white/10 px-4 py-4 text-left text-electric-volt-green font-bold uppercase tracking-[0.2em] text-sm">Size</th>
                  <th className="border-r border-white/10 px-4 py-4 text-left text-electric-volt-green font-bold uppercase tracking-[0.2em] text-sm">Chest (in)</th>
                  <th className="border-r border-white/10 px-4 py-4 text-left text-electric-volt-green font-bold uppercase tracking-[0.2em] text-sm">Length (in)</th>
                  <th className="px-4 py-4 text-left text-electric-volt-green font-bold uppercase tracking-[0.2em] text-sm">Shoulder (in)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/10 hover:bg-white/5 transition-colors">
                  <td className="border-r border-white/10 px-4 py-3 font-bold text-white">XS</td>
                  <td className="border-r border-white/10 px-4 py-3 text-gray-300">34-36</td>
                  <td className="border-r border-white/10 px-4 py-3 text-gray-300">27</td>
                  <td className="px-4 py-3 text-gray-300">16</td>
                </tr>
                <tr className="border-b border-white/10 hover:bg-white/5 transition-colors">
                  <td className="border-r border-white/10 px-4 py-3 font-bold text-white">S</td>
                  <td className="border-r border-white/10 px-4 py-3 text-gray-300">36-38</td>
                  <td className="border-r border-white/10 px-4 py-3 text-gray-300">28</td>
                  <td className="px-4 py-3 text-gray-300">17</td>
                </tr>
                <tr className="border-b border-white/10 hover:bg-white/5 transition-colors">
                  <td className="border-r border-white/10 px-4 py-3 font-bold text-white">M</td>
                  <td className="border-r border-white/10 px-4 py-3 text-gray-300">38-40</td>
                  <td className="border-r border-white/10 px-4 py-3 text-gray-300">29</td>
                  <td className="px-4 py-3 text-gray-300">18</td>
                </tr>
                <tr className="border-b border-white/10 hover:bg-white/5 transition-colors">
                  <td className="border-r border-white/10 px-4 py-3 font-bold text-white">L</td>
                  <td className="border-r border-white/10 px-4 py-3 text-gray-300">40-42</td>
                  <td className="border-r border-white/10 px-4 py-3 text-gray-300">30</td>
                  <td className="px-4 py-3 text-gray-300">19</td>
                </tr>
                <tr className="border-b border-white/10 hover:bg-white/5 transition-colors">
                  <td className="border-r border-white/10 px-4 py-3 font-bold text-white">XL</td>
                  <td className="border-r border-white/10 px-4 py-3 text-gray-300">42-44</td>
                  <td className="border-r border-white/10 px-4 py-3 text-gray-300">31</td>
                  <td className="px-4 py-3 text-gray-300">20</td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="border-r border-white/10 px-4 py-3 font-bold text-white">XXL</td>
                  <td className="border-r border-white/10 px-4 py-3 text-gray-300">44-46</td>
                  <td className="border-r border-white/10 px-4 py-3 text-gray-300">32</td>
                  <td className="px-4 py-3 text-gray-300">21</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Women's Tops */}
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-6 uppercase tracking-[0.2em]" style={{ fontFamily: 'var(--font-display)' }}>
            Women's Tops
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
            <table className="w-full border-collapse">
              <thead className="bg-black border-b border-electric-volt-green/30">
                <tr>
                  <th className="border-r border-white/10 px-4 py-4 text-left text-electric-volt-green font-bold uppercase tracking-[0.2em] text-sm">Size</th>
                  <th className="border-r border-white/10 px-4 py-4 text-left text-electric-volt-green font-bold uppercase tracking-[0.2em] text-sm">Bust (in)</th>
                  <th className="border-r border-white/10 px-4 py-4 text-left text-electric-volt-green font-bold uppercase tracking-[0.2em] text-sm">Length (in)</th>
                  <th className="px-4 py-4 text-left text-electric-volt-green font-bold uppercase tracking-[0.2em] text-sm">Shoulder (in)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/10 hover:bg-white/5 transition-colors">
                  <td className="border-r border-white/10 px-4 py-3 font-bold text-white">XS</td>
                  <td className="border-r border-white/10 px-4 py-3 text-gray-300">30-32</td>
                  <td className="border-r border-white/10 px-4 py-3 text-gray-300">25</td>
                  <td className="px-4 py-3 text-gray-300">14</td>
                </tr>
                <tr className="border-b border-white/10 hover:bg-white/5 transition-colors">
                  <td className="border-r border-white/10 px-4 py-3 font-bold text-white">S</td>
                  <td className="border-r border-white/10 px-4 py-3 text-gray-300">32-34</td>
                  <td className="border-r border-white/10 px-4 py-3 text-gray-300">26</td>
                  <td className="px-4 py-3 text-gray-300">15</td>
                </tr>
                <tr className="border-b border-white/10 hover:bg-white/5 transition-colors">
                  <td className="border-r border-white/10 px-4 py-3 font-bold text-white">M</td>
                  <td className="border-r border-white/10 px-4 py-3 text-gray-300">34-36</td>
                  <td className="border-r border-white/10 px-4 py-3 text-gray-300">27</td>
                  <td className="px-4 py-3 text-gray-300">16</td>
                </tr>
                <tr className="border-b border-white/10 hover:bg-white/5 transition-colors">
                  <td className="border-r border-white/10 px-4 py-3 font-bold text-white">L</td>
                  <td className="border-r border-white/10 px-4 py-3 text-gray-300">36-38</td>
                  <td className="border-r border-white/10 px-4 py-3 text-gray-300">28</td>
                  <td className="px-4 py-3 text-gray-300">17</td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="border-r border-white/10 px-4 py-3 font-bold text-white">XL</td>
                  <td className="border-r border-white/10 px-4 py-3 text-gray-300">38-40</td>
                  <td className="border-r border-white/10 px-4 py-3 text-gray-300">29</td>
                  <td className="px-4 py-3 text-gray-300">18</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* How to Measure */}
        <div className="rounded-3xl border border-electric-volt-green/30 bg-gradient-to-br from-electric-volt-green/10 to-purple-500/10 p-8 md:p-12 text-white mb-12 backdrop-blur-sm">
          <h2 className="text-3xl md:text-4xl font-black mb-8 uppercase tracking-[0.2em]" style={{ fontFamily: 'var(--font-display)' }}>
            How to Measure
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-black/30 rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-bold mb-3 text-electric-volt-green uppercase tracking-[0.2em]">Chest/Bust</h3>
              <p className="text-gray-300">
                Measure around the fullest part of your chest, keeping the tape measure horizontal.
              </p>
            </div>
            <div className="bg-black/30 rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-bold mb-3 text-electric-volt-green uppercase tracking-[0.2em]">Length</h3>
              <p className="text-gray-300">
                Measure from the highest point of the shoulder to the bottom hem.
              </p>
            </div>
            <div className="bg-black/30 rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-bold mb-3 text-electric-volt-green uppercase tracking-[0.2em]">Shoulder</h3>
              <p className="text-gray-300">
                Measure from one shoulder point to the other across the back.
              </p>
            </div>
            <div className="bg-black/30 rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-bold mb-3 text-electric-volt-green uppercase tracking-[0.2em]">Waist</h3>
              <p className="text-gray-300">
                Measure around your natural waistline, keeping the tape comfortably loose.
              </p>
            </div>
          </div>
        </div>

        {/* Fit Guide */}
        <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/10 mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-8 uppercase tracking-[0.2em]" style={{ fontFamily: 'var(--font-display)' }}>
            Fit Guide
          </h2>
          <div className="space-y-6">
            <div className="border-l-4 border-electric-volt-green pl-6">
              <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-[0.15em]">Regular Fit</h3>
              <p className="text-gray-300">
                Our standard fit with a relaxed, comfortable feel. Perfect for everyday wear.
              </p>
            </div>
            <div className="border-l-4 border-purple-500 pl-6">
              <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-[0.15em]">Oversized Fit</h3>
              <p className="text-gray-300">
                Deliberately larger for a streetwear aesthetic. If you prefer a fitted look, consider sizing down.
              </p>
            </div>
            <div className="border-l-4 border-hot-pink pl-6">
              <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-[0.15em]">Slim Fit</h3>
              <p className="text-gray-300">
                Closer to the body with a modern, tailored silhouette. Size up if you prefer more room.
              </p>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="text-center">
          <p className="text-gray-300 mb-6 text-lg">
            Still not sure about your size? We're here to help!
          </p>
          <a
            href="/contact"
            className="inline-block bg-electric-volt-green text-black font-bold py-4 px-8 rounded-full uppercase tracking-[0.3em] text-sm hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(173,255,0,0.5)] transition-all"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}
