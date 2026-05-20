import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-8 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2">
            <h2
              className="text-4xl font-bold text-green-400"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              Carbon MRV
            </h2>

            <p className="mt-6 text-slate-400 leading-relaxed max-w-md">
              AI-powered climate finance platform transforming agricultural
              land into verified carbon wealth.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-5">Platform</h3>

            <div className="space-y-3 text-slate-400">
              <Link href="/" className="block hover:text-white transition">
                Home
              </Link>
              <Link
                href="/marketplace"
                className="block hover:text-white transition"
              >
                Marketplace
              </Link>
              <Link
                href="/calculator"
                className="block hover:text-white transition"
              >
                Calculator
              </Link>
              <Link href="/blog" className="block hover:text-white transition">
                Blog
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-5">Company</h3>

            <div className="space-y-3 text-slate-400">
              <Link href="/about" className="block hover:text-white transition">
                About
              </Link>
              <Link
                href="/contact"
                className="block hover:text-white transition"
              >
                Contact
              </Link>
              <Link
                href="/certificates"
                className="block hover:text-white transition"
              >
                Certificates
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-5">Legal</h3>

            <div className="space-y-3 text-slate-400">
              <Link
                href="/privacy-policy"
                className="block hover:text-white transition"
              >
                Privacy Policy
              </Link>
              <Link href="/terms" className="block hover:text-white transition">
                Terms of Service
              </Link>
              <Link
                href="/compliance"
                className="block hover:text-white transition"
              >
                Compliance
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm">
          <p>© 2026 Carbon MRV. All rights reserved.</p>

          <p className="mt-4 md:mt-0">
            Climate Technology • Carbon Finance • Sustainability
          </p>
        </div>
      </div>
    </footer>
  );
}
