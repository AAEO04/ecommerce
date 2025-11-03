export function Newsletter(){
  return (
    <div className="p-8 bg-neutral-900 rounded-lg border border-neutral-800">
      <h3 className="text-2xl font-bold text-white mb-4">Join the Mad Rush</h3>
      <p className="text-neutral-400 mb-6">Get the latest drops, deals, and style guides straight to your inbox.</p>
      <form className="flex flex-col gap-4">
        <label htmlFor="email-newsletter" className="block text-sm font-medium text-neutral-300">Email address</label>
        <div className="flex gap-4">
          <input
            id="email-newsletter"
            type="email"
            placeholder="Enter your email"
            className="flex-grow px-4 py-2 rounded-md bg-neutral-800 text-white border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-accent-purple"
          />
          <button
            type="submit"
            className="px-6 py-2 rounded-md bg-accent-green text-white font-semibold hover:bg-accent-green-700 transition-colors"
          >
            Subscribe
          </button>
        </div>
      </form>
    </div>
  )
}
