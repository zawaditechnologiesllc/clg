import { Building2, Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground pt-16 pb-8 border-t-4 border-accent">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          
          {/* Brand & About */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-primary">
                <Building2 className="h-5 w-5" />
              </div>
              <span className="font-display text-xl font-bold tracking-tight text-white">
                Cardone <span className="text-accent">Finance</span>
              </span>
            </div>
            <p className="text-primary-foreground/70 text-sm max-w-sm leading-relaxed">
              Empowering individuals and businesses with fast, reliable access to capital. Your trusted partner in financial growth and stability.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-white mb-4 text-lg">Quick Links</h4>
            <ul className="space-y-3">
              <li><a href="/#how-it-works" className="text-primary-foreground/70 hover:text-accent transition-colors text-sm">How it Works</a></li>
              <li><a href="/#products" className="text-primary-foreground/70 hover:text-accent transition-colors text-sm">Our Products</a></li>
              <li><a href="/apply" className="text-primary-foreground/70 hover:text-accent transition-colors text-sm">Apply Now</a></li>
              <li><a href="/login" className="text-primary-foreground/70 hover:text-accent transition-colors text-sm">Client Portal</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-white mb-4 text-lg">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-primary-foreground/70">
                <MapPin className="h-5 w-5 shrink-0 text-accent" />
                <span>17325 Castellammare Dr,<br />Pacific Palisades, CA 90272</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-primary-foreground/70">
                <Phone className="h-5 w-5 shrink-0 text-accent" />
                <span>+1 254-528-9454</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-primary-foreground/70">
                <Mail className="h-5 w-5 shrink-0 text-accent" />
                <a href="mailto:info@cardoneloansgrants.org" className="hover:text-accent transition-colors">info@cardoneloansgrants.org</a>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-primary-foreground/10 text-center space-y-4">
          <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-sm text-primary-foreground/80 max-w-4xl mx-auto">
            <strong className="text-accent block mb-1">Important Disclaimer</strong>
            Cardone Loans & Grants acts as an intermediary connecting applicants with U.S.-based funding providers. We are not a direct lender.
          </div>
          <p className="text-primary-foreground/50 text-sm">
            &copy; {new Date().getFullYear()} Cardone Loans & Grants. All rights reserved. <br/>
            cardoneloansgrants.org
          </p>
        </div>
      </div>
    </footer>
  )
}
