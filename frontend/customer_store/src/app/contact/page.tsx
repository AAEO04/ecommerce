export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto py-12 px-4 md:px-8">
      <div className="mb-8 text-center">
        <h1 className="font-display text-5xl md:text-6xl font-bold text-primary tracking-tight mb-2">Contact Us</h1>
        <p className="text-base leading-relaxed text-secondary mb-4">Got questions, feedback, or just want to say hey? We’re here for the rush.</p>
        <span className="inline-block text-xs font-bold text-accent-purple mb-2">No Chills, Just Mad Rush.</span>
      </div>
      <form className="card space-y-6">
        <div>
          <label htmlFor="name" className="form-label">Name</label>
          <input id="name" name="name" type="text" className="form-input" placeholder="Your name" />
        </div>
        <div>
          <label htmlFor="email" className="form-label">Email</label>
          <input id="email" name="email" type="email" className="form-input" placeholder="you@email.com" />
        </div>
        <div>
          <label htmlFor="message" className="form-label">Message</label>
          <textarea id="message" name="message" className="form-input" rows={4} placeholder="Type your message here..." />
        </div>
        <button type="submit" className="btn btn-accent w-full py-4 font-bold">Send Message</button>
      </form>
      <div className="mt-8 text-center text-xs text-secondary">
        <span>Or email us directly: <a href="mailto:hello@madrush.com" className="text-accent-purple underline">hello@madrush.com</a></span>
      </div>
    </div>
  )
}
