import Image from 'next/image'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="mb-8 flex justify-center">
            <Image src="/brand-circle.png" alt="Mad Rush Logo" width={400} height={400} className="w-80 h-auto" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-gray-900">About MAD RUSH</h1>
          <p className="text-2xl text-gray-700 italic mb-4">No Chills just Mad Rush</p>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Fast fashion, high energy, zero chill. We're redefining streetwear culture.
          </p>
        </div>
      </div>

      {/* Our Story Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
            <p className="text-lg text-gray-700 mb-4 leading-relaxed">
              MAD RUSH was born from the streets, inspired by the energy of urban culture and the boldness of modern streetwear. 
              We believe in movement, hype, and making every drop count.
            </p>
            <p className="text-lg text-gray-700 mb-4 leading-relaxed">
              Our collections are designed to help you express your unique personality and keep up with the rush of life. 
              From bold graphics to vibrant colors, every piece tells a story of energy and passion.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              We're not just selling clothes – we're building a community of individuals who live life at full speed, 
              with no chills and all the rush.
            </p>
          </div>
          <div className="bg-black rounded-2xl p-8 text-white">
            <h3 className="text-3xl font-bold mb-4">Why MAD RUSH?</h3>
            <ul className="space-y-4"> 
              <li className="flex items-start">
                <span className="text-2xl mr-3">🔥</span>
                <div>
                  <strong className="block text-red-500 text-xl">Bold Designs</strong>
                  <p className="text-gray-100">Eye-catching graphics that make a statement</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-2xl mr-3"> ✔️</span>
                <div>
                  <strong className="block text-purple-500 text-xl">Premium Quality</strong>
                  <p className="text-gray-100">Durable materials built to last</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-2xl mr-3">💚</span>
                <div>
                  <strong className="block text-green-500 text-xl">Community First</strong>
                  <p className="text-gray-100">Join a movement of passionate individuals</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Mission Section */}
        <div className="bg-black text-white rounded-2xl p-12 mb-16">
          <h2 className="text-4xl font-bold mb-6 text-center">Our Mission</h2>
          <p className="text-xl text-gray-300 text-center max-w-3xl mx-auto leading-relaxed">
            To empower everyone to move fast, look bold, and live with no chills. 
            We're here to build trust through quality, design, and a friction-free shopping experience 
            that keeps you ahead of the curve.
          </p>
        </div>

        {/* Values Section */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🚀</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Innovation</h3>
            <p className="text-gray-700">
              Constantly pushing boundaries with fresh designs and cutting-edge styles
            </p>
          </div>
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">❤️</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Passion</h3>
            <p className="text-gray-700">
              Every piece is crafted with love and attention to detail
            </p>
          </div>
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🌟</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Authenticity</h3>
            <p className="text-gray-700">
              Stay true to yourself and express your unique style
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
