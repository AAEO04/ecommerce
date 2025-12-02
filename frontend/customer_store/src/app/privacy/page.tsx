export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-black text-white py-20">
            <div className="container mx-auto px-4 max-w-4xl">
                <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
                <div className="space-y-6 text-gray-300">
                    <p>Last updated: December 2, 2025</p>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">1. Information We Collect</h2>
                        <p>We collect information you provide directly to us when you create an account, make a purchase, or contact us.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">2. How We Use Your Information</h2>
                        <p>We use the information we collect to process your orders, communicate with you, and improve our services.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">3. Data Security</h2>
                        <p>We implement appropriate security measures to protect your personal information.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">4. Contact Us</h2>
                        <p>If you have any questions about this Privacy Policy, please contact us.</p>
                    </section>
                </div>
            </div>
        </div>
    )
}
