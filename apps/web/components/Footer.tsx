import Link from "next/link";

export default function Footer() {
  return (
    <footer className="py-12 px-6 bg-slate-900 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <Link
              href="/"
              className="text-xl font-bold bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4"
            >
              Tourify
            </Link>
            <p className="text-gray-400 mt-2">
              Beautiful onboarding tours for modern apps
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3">Product</h4>
            <div className="space-y-2 text-gray-400 flex flex-col">
              <Link
                href="/#features"
                className="hover:text-white transition duration-300"
              >
                Features
              </Link>
              {/* <Link
                href="#"
                className="hover:text-white transition duration-300"
              >
                Pricing
              </Link> */}
              <Link
                href="/documentation"
                className="hover:text-white transition duration-300"
              >
                Documentation
              </Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Company</h4>
            <div className="space-y-2 text-gray-400 flex flex-col">
              <Link
                href="#"
                className="hover:text-white transition duration-300"
              >
                About
              </Link>
              {/* <Link
                href="#"
                className="hover:text-white transition duration-300"
              >
                Blog
              </Link>
              <Link
                href="#"
                className="hover:text-white transition duration-300"
              >
                Careers
              </Link> */}
            </div>
          </div>
          {/* <div>
            <h4 className="font-semibold text-white mb-3">Legal</h4>
            <div className="space-y-2 text-gray-400 flex flex-col">
              <Link
                href="#"
                className="hover:text-white transition duration-300"
              >
                Privacy
              </Link>
              <Link
                href="#"
                className="hover:text-white transition duration-300"
              >
                Terms
              </Link>
              <Link
                href="#"
                className="hover:text-white transition duration-300"
              >
                Security
              </Link>
            </div>
          </div> */}
        </div>
        <div className="text-center text-gray-400 pt-8 border-t border-white/10">
          © 2025 Tourify. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
