import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Link } from "wouter"
import { motion } from "framer-motion"
import { CheckCircle2, ShieldCheck, Zap, Briefcase, User, HelpCircle, ChevronDown, ArrowRight } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/80 to-background/20 z-10 mix-blend-multiply" />
          <img 
            src={`${import.meta.env.BASE_URL}images/hero-abstract.png`} 
            alt="Abstract finance background" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 border border-accent/30 text-accent mb-6 backdrop-blur-sm"
            >
              <ShieldCheck className="h-4 w-4" />
              <span className="text-sm font-semibold tracking-wide uppercase">Trusted Global Partner</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-6xl lg:text-7xl font-display font-extrabold text-white leading-tight mb-6"
            >
              Fuel your ambition with <span className="text-accent">intelligent capital.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl leading-relaxed"
            >
              Access flexible loans and grants for personal or business growth. Experience our streamlined process with immediate pre-approval visibility.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link href="/apply" className="inline-block">
                <Button size="lg" variant="accent" className="w-full sm:w-auto text-primary group font-bold">
                  Start Your Application
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/#products" className="inline-block">
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white backdrop-blur-sm">
                  Explore Products
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 bg-white border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center text-center opacity-70">
            <div className="flex flex-col items-center gap-2">
              <ShieldCheck className="h-8 w-8 text-primary" />
              <span className="font-semibold text-sm">256-bit Encryption</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <CheckCircle2 className="h-8 w-8 text-secondary" />
              <span className="font-semibold text-sm">Fast Approvals</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Zap className="h-8 w-8 text-accent" />
              <span className="font-semibold text-sm">Instant Pre-check</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Briefcase className="h-8 w-8 text-primary" />
              <span className="font-semibold text-sm">U.S. Provider Network</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">A streamlined path to funding</h2>
            <p className="text-muted-foreground text-lg">We've removed the friction from securing capital. Four simple steps stand between you and your financial goals.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-border/60 z-0"></div>
            
            {[
              { step: "01", title: "Select Product", desc: "Choose between personal or business loans and grants tailored to your needs." },
              { step: "02", title: "Submit Details", desc: "Fill out our secure, abbreviated application form with your core information." },
              { step: "03", title: "Process Fee", desc: "Complete the minor processing fee securely via M-Pesa to initiate underwriting." },
              { step: "04", title: "Get Funded", desc: "Receive immediate pre-approval status. Final disbursement within 14 days." }
            ].map((item, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-white border-2 border-primary/10 shadow-lg shadow-primary/5 flex items-center justify-center text-xl font-display font-bold text-primary mb-6">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section id="products" className="py-24 bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Targeted financial products</h2>
            <p className="text-primary-foreground/70 text-lg">Whether you are starting a new venture or consolidating personal debt, we have a structured program for you.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Personal Grant */}
            <Card className="bg-white/5 border-white/10 text-white backdrop-blur-sm hover:bg-white/10 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center mb-4">
                  <User className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle className="text-2xl">Personal Grant</CardTitle>
                <CardDescription className="text-white/60">Non-repayable funds for personal advancement.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-white/10">
                    <span className="text-white/70">Amount Range</span>
                    <span className="font-bold text-lg">$2,000 – $10,000</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-white/10">
                    <span className="text-white/70">Processing Fee</span>
                    <span className="font-semibold text-accent">$10</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/apply" className="w-full">
                  <Button className="w-full bg-white text-primary hover:bg-white/90">Apply Now</Button>
                </Link>
              </CardFooter>
            </Card>

            {/* Business Grant */}
            <Card className="bg-white/5 border-white/10 text-white backdrop-blur-sm hover:bg-white/10 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-4">
                  <Briefcase className="h-6 w-6 text-accent" />
                </div>
                <CardTitle className="text-2xl">Business Grant</CardTitle>
                <CardDescription className="text-white/60">Catalyst capital for business operations.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-white/10">
                    <span className="text-white/70">Amount Range</span>
                    <span className="font-bold text-lg">$5,000 – $30,000</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-white/10">
                    <span className="text-white/70">Processing Fee</span>
                    <span className="font-semibold text-accent">$20</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/apply" className="w-full">
                  <Button className="w-full bg-white text-primary hover:bg-white/90">Apply Now</Button>
                </Link>
              </CardFooter>
            </Card>

            {/* Personal Loan */}
            <Card className="bg-white/5 border-white/10 text-white backdrop-blur-sm hover:bg-white/10 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center mb-4">
                  <User className="h-6 w-6 text-secondary" />
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">Personal Loan</CardTitle>
                    <CardDescription className="text-white/60 mt-2">Flexible repayment terms for significant expenses.</CardDescription>
                  </div>
                  <span className="inline-flex items-center rounded-md bg-accent/20 px-2 py-1 text-xs font-medium text-accent ring-1 ring-inset ring-accent/20">
                    65% Pre-approval
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mt-2">
                  <div className="flex justify-between items-center pb-4 border-b border-white/10">
                    <span className="text-white/70">Amount Range</span>
                    <span className="font-bold text-lg">$10,000 – $50,000</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-white/10">
                    <span className="text-white/70">Processing Fee</span>
                    <span className="font-semibold text-accent">$20</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/apply" className="w-full">
                  <Button className="w-full bg-white text-primary hover:bg-white/90">Apply Now</Button>
                </Link>
              </CardFooter>
            </Card>

            {/* Business Loan */}
            <Card className="bg-white/5 border-white/10 text-white backdrop-blur-sm hover:bg-white/10 transition-colors border-2 border-accent/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-accent text-primary text-xs font-bold px-4 py-1 rounded-bl-xl">POPULAR</div>
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-4">
                  <Briefcase className="h-6 w-6 text-accent" />
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">Business Loan</CardTitle>
                    <CardDescription className="text-white/60 mt-2">Major capital injection for enterprise expansion.</CardDescription>
                  </div>
                  <span className="inline-flex items-center rounded-md bg-accent/20 px-2 py-1 text-xs font-medium text-accent ring-1 ring-inset ring-accent/20">
                    65% Pre-approval
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mt-2">
                  <div className="flex justify-between items-center pb-4 border-b border-white/10">
                    <span className="text-white/70">Amount Range</span>
                    <span className="font-bold text-lg">$20,000 – $100,000</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-white/10">
                    <span className="text-white/70">Processing Fee</span>
                    <span className="font-semibold text-accent">$50</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/apply" className="w-full">
                  <Button variant="accent" className="w-full font-bold">Apply Now</Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 bg-background">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <HelpCircle className="h-12 w-12 text-primary mx-auto mb-4 opacity-50" />
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {[
              { q: "How long does the approval process take?", a: "Standard approval takes 2–3 business days after all documentation and processing fees are received." },
              { q: "When will the funds be disbursed?", a: "Disbursement occurs exactly 14 days after your application has been officially approved." },
              { q: "Are you a direct lender?", a: "No. Cardone Loans & Grants acts as an intermediary connecting applicants with reputable U.S.-based funding providers." },
              { q: "What does the 65% pre-approval mean?", a: "For loan products, our automated system conducts an initial check that guarantees 65% of your requested amount pending final verification." }
            ].map((faq, i) => (
              <details key={i} className="group border border-border rounded-xl bg-card overflow-hidden">
                <summary className="flex justify-between items-center font-medium cursor-pointer list-none p-6 text-lg">
                  {faq.q}
                  <span className="transition group-open:rotate-180">
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  </span>
                </summary>
                <div className="text-muted-foreground p-6 pt-0 leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
