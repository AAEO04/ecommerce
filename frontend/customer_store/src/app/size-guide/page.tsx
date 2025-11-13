export default function SizeGuidePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Size Guide</h1>
          <p className="text-xl text-gray-300 italic">Find Your Perfect Fit</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Introduction */}
        <div className="mb-12 text-center">
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Use our comprehensive size guide to find the perfect fit for your MAD RUSH streetwear. 
            All measurements are in inches unless otherwise stated.
          </p>
        </div>

        {/* Men's Tops */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Men's Tops</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead className="bg-gray-900 text-white">
                <tr>
                  <th className="border border-gray-300 px-4 py-3 text-left">Size</th>
                  <th className="border border-gray-300 px-4 py-3 text-left">Chest (in)</th>
                  <th className="border border-gray-300 px-4 py-3 text-left">Length (in)</th>
                  <th className="border border-gray-300 px-4 py-3 text-left">Shoulder (in)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 font-semibold">XS</td>
                  <td className="border border-gray-300 px-4 py-3">34-36</td>
                  <td className="border border-gray-300 px-4 py-3">27</td>
                  <td className="border border-gray-300 px-4 py-3">16</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 font-semibold">S</td>
                  <td className="border border-gray-300 px-4 py-3">36-38</td>
                  <td className="border border-gray-300 px-4 py-3">28</td>
                  <td className="border border-gray-300 px-4 py-3">17</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 font-semibold">M</td>
                  <td className="border border-gray-300 px-4 py-3">38-40</td>
                  <td className="border border-gray-300 px-4 py-3">29</td>
                  <td className="border border-gray-300 px-4 py-3">18</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 font-semibold">L</td>
                  <td className="border border-gray-300 px-4 py-3">40-42</td>
                  <td className="border border-gray-300 px-4 py-3">30</td>
                  <td className="border border-gray-300 px-4 py-3">19</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 font-semibold">XL</td>
                  <td className="border border-gray-300 px-4 py-3">42-44</td>
                  <td className="border border-gray-300 px-4 py-3">31</td>
                  <td className="border border-gray-300 px-4 py-3">20</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 font-semibold">XXL</td>
                  <td className="border border-gray-300 px-4 py-3">44-46</td>
                  <td className="border border-gray-300 px-4 py-3">32</td>
                  <td className="border border-gray-300 px-4 py-3">21</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Women's Tops */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Women's Tops</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead className="bg-gray-900 text-white">
                <tr>
                  <th className="border border-gray-300 px-4 py-3 text-left">Size</th>
                  <th className="border border-gray-300 px-4 py-3 text-left">Bust (in)</th>
                  <th className="border border-gray-300 px-4 py-3 text-left">Length (in)</th>
                  <th className="border border-gray-300 px-4 py-3 text-left">Shoulder (in)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 font-semibold">XS</td>
                  <td className="border border-gray-300 px-4 py-3">30-32</td>
                  <td className="border border-gray-300 px-4 py-3">25</td>
                  <td className="border border-gray-300 px-4 py-3">14</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 font-semibold">S</td>
                  <td className="border border-gray-300 px-4 py-3">32-34</td>
                  <td className="border border-gray-300 px-4 py-3">26</td>
                  <td className="border border-gray-300 px-4 py-3">15</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 font-semibold">M</td>
                  <td className="border border-gray-300 px-4 py-3">34-36</td>
                  <td className="border border-gray-300 px-4 py-3">27</td>
                  <td className="border border-gray-300 px-4 py-3">16</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 font-semibold">L</td>
                  <td className="border border-gray-300 px-4 py-3">36-38</td>
                  <td className="border border-gray-300 px-4 py-3">28</td>
                  <td className="border border-gray-300 px-4 py-3">17</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 font-semibold">XL</td>
                  <td className="border border-gray-300 px-4 py-3">38-40</td>
                  <td className="border border-gray-300 px-4 py-3">29</td>
                  <td className="border border-gray-300 px-4 py-3">18</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* How to Measure */}
        <div className="bg-gradient-to-r from-green-500 to-purple-500 rounded-2xl p-8 text-white mb-12">
          <h2 className="text-3xl font-bold mb-6">How to Measure</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold mb-3">Chest/Bust</h3>
              <p className="text-gray-100">
                Measure around the fullest part of your chest, keeping the tape measure horizontal.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">Length</h3>
              <p className="text-gray-100">
                Measure from the highest point of the shoulder to the bottom hem.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">Shoulder</h3>
              <p className="text-gray-100">
                Measure from one shoulder point to the other across the back.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">Waist</h3>
              <p className="text-gray-100">
                Measure around your natural waistline, keeping the tape comfortably loose.
              </p>
            </div>
          </div>
        </div>

        {/* Fit Guide */}
        <div className="bg-gray-50 rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Fit Guide</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Regular Fit</h3>
              <p className="text-gray-700">
                Our standard fit with a relaxed, comfortable feel. Perfect for everyday wear.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Oversized Fit</h3>
              <p className="text-gray-700">
                Deliberately larger for a streetwear aesthetic. If you prefer a fitted look, consider sizing down.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Slim Fit</h3>
              <p className="text-gray-700">
                Closer to the body with a modern, tailored silhouette. Size up if you prefer more room.
              </p>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="mt-12 text-center">
          <p className="text-gray-700 mb-4">
            Still not sure about your size? We're here to help!
          </p>
          <a
            href="/contact"
            className="inline-block bg-gradient-to-r from-green-500 to-purple-500 text-white font-bold py-3 px-8 rounded-lg hover:from-green-600 hover:to-purple-600 transition-all"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}
