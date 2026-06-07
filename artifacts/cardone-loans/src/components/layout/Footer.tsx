import { Building2, Mail, Phone, MapPin, ExternalLink } from "lucide-react"
import { Link } from "wouter"

const PRODUCTS = ["Personal Grant", "Business Grant", "Personal Loan", "Business Loan"]
const COMPANY = [
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Our Products", href: "/#products" },
  { label: "Apply Now", href: "/apply" },
  { label: "Client Portal", href: "/login" },
  { label: "FAQs", href: "/#faq" },
  { label: "About Us", href: "/#about" },
]
const LEGAL = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
  { label: "Cookie Policy", href: "#" },
  { label: "AML Policy", href: "#" },
]

export function Footer() {
  return (
    <footer className="bg-[#0B1F3A] text-white">
      {/* Top CTA strip */}
      <div className="bg-[#1FA67A]/10 border-y border-[#1FA67A]/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold text-white text-lg">Ready to secure your capital?</p>
            <p className="text-white/60 text-sm mt-0.5">Applications processed in 2–5 business days · Funds to any African bank</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link href="/register">
              <button className="px-6 py-2.5 bg-[#D4AF37] hover:bg-[#c49d2f] text-[#0B1F3A] font-bold rounded-xl text-sm transition-colors">
                Apply Now — Free
              </button>
            </Link>
            <a href="mailto:info@cardoneloansgrants.org">
              <button className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-sm transition-colors">
                Contact Us
              </button>
            </a>
          </div>
        </div>
      </div>

      {/* Main footer body */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand — 2 cols wide */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-11 h-11 rounded-xl bg-[#D4AF37] flex items-center justify-center text-[#0B1F3A] font-display font-extrabold text-2xl">C</div>
              <div>
                <div className="font-display font-bold text-white text-lg leading-tight tracking-tight">Cardone</div>
                <div className="text-[#D4AF37] text-[10px] font-bold tracking-[0.2em] uppercase">Loans & Grants</div>
              </div>
            </div>

            <p className="text-white/55 text-sm leading-relaxed max-w-sm mb-6">
              Connecting African entrepreneurs and individuals with institutional-grade capital from the United States and Canada. Transparent, fast, and reliable funding for all 54 African nations.
            </p>

            {/* Credentials */}
            <div className="space-y-2 mb-7">
              {["US & Canada Registered Entity", "256-bit SSL Encrypted", "SWIFT Member Institution", "ISO 27001 Certified Data Handling"].map(c => (
                <div key={c} className="flex items-center gap-2 text-xs text-white/50">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1FA67A] shrink-0" />
                  {c}
                </div>
              ))}
            </div>

            {/* Social links */}
            <div className="flex gap-3">
              <a href="#" aria-label="Twitter" className="w-9 h-9 rounded-lg bg-white/10 hover:bg-[#D4AF37]/20 hover:border-[#D4AF37]/30 border border-transparent flex items-center justify-center transition-all">
                <svg className="w-4 h-4 fill-white/70" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.73-8.835L1.254 2.25H8.08l4.26 5.631 5.904-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#" aria-label="LinkedIn" className="w-9 h-9 rounded-lg bg-white/10 hover:bg-[#D4AF37]/20 hover:border-[#D4AF37]/30 border border-transparent flex items-center justify-center transition-all">
                <svg className="w-4 h-4 fill-white/70" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
              <a href="#" aria-label="Facebook" className="w-9 h-9 rounded-lg bg-white/10 hover:bg-[#D4AF37]/20 hover:border-[#D4AF37]/30 border border-transparent flex items-center justify-center transition-all">
                <svg className="w-4 h-4 fill-white/70" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="#" aria-label="YouTube" className="w-9 h-9 rounded-lg bg-white/10 hover:bg-[#D4AF37]/20 hover:border-[#D4AF37]/30 border border-transparent flex items-center justify-center transition-all">
                <svg className="w-4 h-4 fill-white/70" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-bold text-white mb-5 text-sm uppercase tracking-widest">Products</h4>
            <ul className="space-y-3.5">
              {PRODUCTS.map(p => (
                <li key={p}>
                  <Link href="/register" className="text-white/55 hover:text-[#D4AF37] transition-colors text-sm flex items-center gap-1.5 group">
                    <span className="w-1 h-1 rounded-full bg-white/20 group-hover:bg-[#D4AF37] transition-colors" />
                    {p}
                  </Link>
                </li>
              ))}
              <li className="pt-2 border-t border-white/10">
                <Link href="/apply" className="text-[#1FA67A] hover:text-[#1FA67A]/80 transition-colors text-sm font-semibold flex items-center gap-1">
                  Start Application <ExternalLink className="h-3 w-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-white mb-5 text-sm uppercase tracking-widest">Company</h4>
            <ul className="space-y-3.5">
              {COMPANY.map(l => (
                <li key={l.label}>
                  <a href={l.href} className="text-white/55 hover:text-[#D4AF37] transition-colors text-sm flex items-center gap-1.5 group">
                    <span className="w-1 h-1 rounded-full bg-white/20 group-hover:bg-[#D4AF37] transition-colors" />
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-white mb-5 text-sm uppercase tracking-widest">Contact</h4>
            <ul className="space-y-4">
              <li className="flex gap-3 text-sm text-white/55">
                <MapPin className="h-4 w-4 shrink-0 text-[#D4AF37] mt-0.5" />
                <div>
                  <span>17325 Castellammare Dr,<br />Pacific Palisades, CA 90272<br />United States</span>
                </div>
              </li>
              <li className="flex gap-3 text-sm text-white/55">
                <Phone className="h-4 w-4 shrink-0 text-[#D4AF37] mt-0.5" />
                <a href="tel:+12545289454" className="hover:text-[#D4AF37] transition-colors">+1 254-528-9454</a>
              </li>
              <li className="flex gap-3 text-sm text-white/55">
                <Mail className="h-4 w-4 shrink-0 text-[#D4AF37] mt-0.5" />
                <a href="mailto:info@cardoneloansgrants.org" className="hover:text-[#D4AF37] transition-colors break-all">
                  info@cardoneloansgrants.org
                </a>
              </li>
              <li className="mt-5 pt-4 border-t border-white/10">
                <div className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-2">Business Hours</div>
                <div className="text-xs text-white/55 space-y-1">
                  <div>Mon – Fri: 9:00 AM – 6:00 PM EST</div>
                  <div>Sat: 10:00 AM – 2:00 PM EST</div>
                  <div>Sun: Closed</div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Processing times + stats bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-6">
            {[
              { value: "2–5", label: "Business Days", sub: "Application processing" },
              { value: "14", label: "Business Days", sub: "Average disbursement" },
              { value: "47K+", label: "Clients Served", sub: "Across 54 African nations" },
              { value: "$2.8B+", label: "Capital Deployed", sub: "Since inception" },
            ].map(s => (
              <div key={s.label + s.sub} className="bg-white/5 rounded-xl p-4">
                <div className="text-[#D4AF37] font-display font-bold text-xl">{s.value}</div>
                <div className="text-white/80 text-xs font-semibold mt-0.5">{s.label}</div>
                <div className="text-white/40 text-xs">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legal disclaimer */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white/5 rounded-xl border border-white/10 p-5 mb-6">
            <p className="text-xs text-white/45 leading-relaxed">
              <strong className="text-[#D4AF37] font-semibold">Important Legal Notice: </strong>
              Cardone Loans &amp; Grants, LLC is an intermediary connecting qualified African applicants with US and Canadian institutional funding partners. We are not a bank, direct lender, credit institution, or deposit-taking entity. Capital deployment is subject to eligibility review and funding partner approval. Processing fees are non-refundable once application review has commenced pursuant to our Terms of Service. All quoted amounts are in US Dollars (USD). Local currency equivalents shown on this platform are indicative only and are subject to daily foreign exchange rate fluctuations. Past performance does not guarantee future results. Cardone Loans &amp; Grants does not guarantee approval of any application. By using this platform, you agree to our Terms of Service, Privacy Policy, and AML/KYC compliance requirements.
            </p>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/35">
            <p>&copy; {new Date().getFullYear()} Cardone Loans &amp; Grants, LLC. All rights reserved. Registered in California, USA.</p>
            <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
              {LEGAL.map(l => (
                <a key={l.label} href={l.href} className="hover:text-white/60 transition-colors">{l.label}</a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
