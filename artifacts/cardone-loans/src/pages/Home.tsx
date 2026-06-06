import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Link } from "wouter"
import { motion } from "framer-motion"
import {
  ShieldCheck, Zap, Globe2, ArrowRight, CheckCircle2, Star,
  TrendingUp, Users, Clock, Award, Lock, BarChart3, ChevronDown,
  Building2, Wallet, FileCheck, Phone, Mail, MapPin, DollarSign,
  Landmark, PiggyBank, ChevronRight, Menu, X
} from "lucide-react"
import { useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const STATS = [
  { value: "$2.8B+", label: "Capital Deployed", sub: "since inception" },
  { value: "47,000+", label: "Clients Served", sub: "across Africa" },
  { value: "94%", label: "Approval Rate", sub: "for qualified applicants" },
  { value: "14 days", label: "Average Disbursement", sub: "post approval" },
]

const PRODUCTS = [
  {
    icon: <Users className="h-8 w-8" />,
    type: "Personal Grant",
    range: "$2,000 – $10,000",
    fee: "KES 1,300",
    color: "from-emerald-500 to-teal-600",
    badge: "Most Popular",
    features: ["No repayment required", "Fast 48-hour review", "Any personal use", "Minimal documentation"],
    eligibility: "Kenyan resident, 18+, valid national ID",
  },
  {
    icon: <Building2 className="h-8 w-8" />,
    type: "Business Grant",
    range: "$5,000 – $30,000",
    fee: "KES 2,600",
    color: "from-blue-500 to-indigo-600",
    badge: "Best Value",
    features: ["No equity stake", "Business growth capital", "30-day decision", "Full flexibility"],
    eligibility: "Registered business, KRA PIN, 6+ months operation",
  },
  {
    icon: <Wallet className="h-8 w-8" />,
    type: "Personal Loan",
    range: "$10,000 – $50,000",
    fee: "KES 2,600",
    color: "from-violet-500 to-purple-600",
    badge: "Competitive Rate",
    features: ["Instant pre-approval", "Flexible repayment", "No collateral", "Transparent terms"],
    eligibility: "Stable income, 21+, confirmed account",
  },
  {
    icon: <Landmark className="h-8 w-8" />,
    type: "Business Loan",
    range: "$20,000 – $100,000",
    fee: "KES 6,500",
    color: "from-amber-500 to-orange-600",
    badge: "Enterprise",
    features: ["Up to $100K funding", "Extended terms", "Growth-focused", "Dedicated manager"],
    eligibility: "1+ year in business, audited financials, registration docs",
  },
]

const STEPS = [
  {
    n: "01",
    title: "Complete Your Application",
    desc: "Fill in your basic information, upload required documents, and select the funding product that fits your needs.",
  },
  {
    n: "02",
    title: "Pay Processing Fee",
    desc: "A small one-time processing fee via M-Pesa confirms your application. This covers due diligence and review costs.",
  },
  {
    n: "03",
    title: "Expert Review",
    desc: "Our team of financial analysts reviews your application within 2–3 business days. You'll receive updates via email and dashboard.",
  },
  {
    n: "04",
    title: "Approval & Release Date",
    desc: "Upon approval, you'll receive your confirmed funding amount and release date — typically 14 business days after approval.",
  },
  {
    n: "05",
    title: "Funds to Your Account",
    desc: "On the release date, request your withdrawal directly to any bank account in Africa. Funds settle in 1–3 business days.",
  },
]

const WHY_US = [
  { icon: <ShieldCheck className="h-6 w-6" />, title: "Bank-Grade Security", desc: "256-bit SSL encryption and multi-factor authentication protect every transaction and piece of data." },
  { icon: <Globe2 className="h-6 w-6" />, title: "Pan-African Coverage", desc: "Serving clients in all 54 African nations with disbursement to any local bank account." },
  { icon: <Zap className="h-6 w-6" />, title: "Rapid Decisions", desc: "AI-assisted underwriting delivers preliminary decisions within 48 hours of complete application submission." },
  { icon: <Lock className="h-6 w-6" />, title: "Transparent Terms", desc: "No hidden fees. No surprise clauses. Every term is disclosed upfront and documented clearly." },
  { icon: <BarChart3 className="h-6 w-6" />, title: "Competitive Rates", desc: "US-backed funding sources allow us to offer rates significantly below regional market averages." },
  { icon: <Award className="h-6 w-6" />, title: "US-Backed Capital", desc: "Partnered with leading American and Canadian institutional investors committed to African economic growth." },
]

const TESTIMONIALS = [
  {
    name: "Grace Muthoni",
    role: "Entrepreneur, Nairobi",
    country: "Kenya",
    amount: "$15,000",
    product: "Business Grant",
    text: "Cardone helped me expand my tailoring business from 2 to 12 employees. The process was straightforward and the support team was always available. I received my funds exactly when they said I would.",
    rating: 5,
  },
  {
    name: "Emmanuel Owusu",
    role: "Civil Engineer, Accra",
    country: "Ghana",
    amount: "$28,000",
    product: "Personal Loan",
    text: "I was skeptical at first, but the transparency throughout the process won me over. My funds arrived on the exact release date. Best financial decision I've ever made for my family.",
    rating: 5,
  },
  {
    name: "Amina Hassan",
    role: "Import/Export Trader",
    country: "Tanzania",
    amount: "$45,000",
    product: "Business Loan",
    text: "Access to US capital at these terms was something I thought only large corporations could get. Cardone made it accessible to my SME. My business turnover doubled in one year.",
    rating: 5,
  },
]

const FAQS = [
  {
    q: "Who is eligible to apply?",
    a: "Any African resident aged 18 or older with a valid national ID or passport can apply for personal products. Business applicants must have a registered company with valid documentation. Supported countries include all 54 African Union member states.",
  },
  {
    q: "What is the processing fee and why is it charged?",
    a: "A one-time processing fee covers application review, credit analysis, document verification, and administrative costs. Fees range from KES 1,300 to KES 6,500 depending on the product type. This is a standard industry practice for US-originated capital deployment.",
  },
  {
    q: "How is the processing fee paid?",
    a: "Payments are made via M-Pesa. We initiate an M-Pesa prompt (STK Push) directly to your registered phone number, or you can pay via Paybill number 4167853 using your full name as the account reference.",
  },
  {
    q: "How long does approval take?",
    a: "Initial review takes 2–3 business days from receipt of payment confirmation. Final approval and disbursement scheduling takes up to 14 business days post-review. Approved amounts and release dates are communicated via your dashboard and email.",
  },
  {
    q: "How are funds disbursed?",
    a: "Once funds are released, you request a withdrawal from your dashboard. Funds are transferred directly to your chosen bank account in any African country. We support transfers to over 1,200 banks across 54 African nations.",
  },
  {
    q: "What documents are required?",
    a: "Personal applicants: National ID (front & back), proof of income (payslip or bank statement, last 3 months). Business applicants additionally need: Certificate of Registration, KRA PIN certificate, and 6 months bank statements.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. We use 256-bit SSL encryption, secure data centers in the US, and follow international data protection standards. Your personal and financial data is never shared with third parties without explicit consent.",
  },
  {
    q: "What if my application is rejected?",
    a: "You will receive a detailed explanation and may re-apply after 30 days addressing the noted concerns. Our team is also available at info@cardoneloansgrants.org to discuss your specific situation.",
  },
]

const AFRICAN_COUNTRIES = [
  "Kenya", "Nigeria", "Ghana", "South Africa", "Tanzania", "Uganda",
  "Rwanda", "Ethiopia", "Egypt", "Morocco", "Senegal", "Côte d'Ivoire",
  "Cameroon", "Zimbabwe", "Zambia", "Angola", "Mozambique", "Madagascar",
]

export default function Home() {
  const [openFaq, setOpenFaq] = useState<string>("")

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero */}
      <section className="relative pt-24 pb-36 overflow-hidden bg-[#0B1F3A]">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #1FA67A 0%, transparent 50%), radial-gradient(circle at 80% 20%, #D4AF37 0%, transparent 50%)" }} />
        </div>
        <div className="absolute inset-0" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-8"
              >
                <ShieldCheck className="h-4 w-4" />
                <span className="text-sm font-semibold tracking-wide">US & Canada Backed Capital for Africa</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-5xl md:text-6xl font-display font-extrabold text-white leading-[1.1] mb-6"
              >
                World-Class Capital for <span className="text-[#D4AF37]">African Ambition</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-xl text-white/70 mb-10 leading-relaxed max-w-xl"
              >
                Access institutional-grade grants and loans from $2,000 to $100,000. Fast decisions, transparent terms, disbursement to any African bank.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 mb-12"
              >
                <Link href="/register">
                  <Button size="lg" className="bg-[#D4AF37] hover:bg-[#c49d2f] text-[#0B1F3A] font-bold px-8 h-14 text-base group w-full sm:w-auto">
                    Apply Now — It's Free
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <a href="#how-it-works">
                  <Button size="lg" variant="outline" className="border-white/20 text-white bg-white/5 hover:bg-white/10 hover:text-white h-14 px-8 text-base w-full sm:w-auto">
                    How It Works
                  </Button>
                </a>
              </motion.div>

              {/* Trust indicators */}
              <div className="flex flex-wrap gap-6 text-white/50 text-sm">
                {["256-bit SSL", "No Hidden Fees", "54 Countries Served", "US-Regulated Partner"].map((t) => (
                  <div key={t} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats panel */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-2 gap-4"
            >
              {STATS.map((s) => (
                <div key={s.label} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                  <div className="text-3xl font-display font-bold text-[#D4AF37] mb-1">{s.value}</div>
                  <div className="text-white font-semibold text-sm">{s.label}</div>
                  <div className="text-white/40 text-xs mt-1">{s.sub}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="py-5 bg-white border-y border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-gray-500">
            {["Regulated Capital Provider", "ISO 27001 Certified", "SWIFT Member", "54 African Nations", "US & Canada Registered"].map((t) => (
              <div key={t} className="flex items-center gap-2 text-sm font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-[#1FA67A]" />
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section id="products" className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold mb-4">
              <DollarSign className="h-4 w-4" />
              Our Financial Products
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-[#0B1F3A] mb-4">
              Capital Designed for African Growth
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose from grants with no repayment obligations or competitive loans with flexible terms — all tailored to the African market.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {PRODUCTS.map((p) => (
              <div key={p.type} className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
                <div className={`bg-gradient-to-br ${p.color} p-6 text-white`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-white/20 rounded-xl">{p.icon}</div>
                    <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full">{p.badge}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-1">{p.type}</h3>
                  <p className="text-white/80 text-2xl font-display font-bold">{p.range}</p>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-3">Processing Fee</div>
                  <div className="text-lg font-bold text-[#0B1F3A] mb-4">{p.fee} <span className="text-xs font-normal text-gray-400">(one-time)</span></div>
                  <ul className="space-y-2 mb-6 flex-1">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div className="border-t pt-4 mt-auto">
                    <p className="text-xs text-gray-400 mb-4"><strong className="text-gray-500">Eligibility:</strong> {p.eligibility}</p>
                    <Link href="/register">
                      <Button className="w-full bg-[#0B1F3A] hover:bg-[#0B1F3A]/90 text-white">
                        Apply for {p.type} <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 bg-[#0B1F3A]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-emerald-400 text-sm font-semibold mb-4">
              <Zap className="h-4 w-4" />
              Simple 5-Step Process
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
              From Application to Bank Account
            </h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              We've engineered the simplest possible path to getting the capital you deserve.
            </p>
          </div>

          <div className="relative">
            <div className="hidden lg:block absolute top-8 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
              {STEPS.map((s, i) => (
                <motion.div
                  key={s.n}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-[#1FA67A] text-white font-display font-bold text-xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
                      {s.n}
                    </div>
                    <h3 className="text-white font-bold mb-3 text-lg">{s.title}</h3>
                    <p className="text-white/50 text-sm leading-relaxed">{s.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="text-center mt-16">
            <Link href="/register">
              <Button size="lg" className="bg-[#D4AF37] hover:bg-[#c49d2f] text-[#0B1F3A] font-bold px-10 h-14">
                Start Your Application Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold mb-6">
                <Award className="h-4 w-4" />
                Why 47,000+ Clients Choose Us
              </div>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-[#0B1F3A] mb-6">
                The Standard for African Financial Access
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                Cardone Loans & Grants bridges the gap between world-class US institutional capital and African entrepreneurs and individuals who deserve access to it. We operate with the rigor of a Wall Street firm and the heart of an African institution.
              </p>
              <div className="flex flex-col gap-4">
                {["Partnered with 12 US institutional investors", "Serving clients in all 54 African countries", "Zero hidden fees — complete transparency", "Dedicated relationship manager for business clients"].map((p) => (
                  <div key={p} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    </div>
                    <span className="text-gray-700">{p}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {WHY_US.map((w) => (
                <div key={w.title} className="p-6 rounded-2xl border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4">
                    {w.icon}
                  </div>
                  <h3 className="font-bold text-[#0B1F3A] mb-2">{w.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{w.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* African coverage */}
      <section className="py-20 bg-emerald-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold mb-4">
              <Globe2 className="h-4 w-4" />
              Pan-African Reach
            </div>
            <h2 className="text-4xl font-display font-bold text-[#0B1F3A] mb-4">Serving All 54 African Nations</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Disbursement available to any bank account across the continent — East, West, North, South, and Central Africa.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {AFRICAN_COUNTRIES.map((c) => (
              <div key={c} className="flex items-center gap-2 bg-white border border-emerald-100 rounded-full px-4 py-2 text-sm font-medium text-gray-700 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                {c}
              </div>
            ))}
            <div className="flex items-center gap-2 bg-emerald-600 rounded-full px-4 py-2 text-sm font-medium text-white shadow-sm">
              + 36 more countries
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 text-amber-700 text-sm font-semibold mb-4">
              <Star className="h-4 w-4 fill-amber-500" />
              Client Success Stories
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-[#0B1F3A]">Trusted Across Africa</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
                <div className="flex gap-1 mb-4">
                  {Array(t.rating).fill(0).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <blockquote className="text-gray-700 leading-relaxed mb-6 italic">"{t.text}"</blockquote>
                <div className="flex items-center gap-4 border-t pt-4">
                  <div className="w-10 h-10 rounded-full bg-[#0B1F3A] flex items-center justify-center text-white font-bold text-sm">
                    {t.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <div className="font-bold text-[#0B1F3A]">{t.name}</div>
                    <div className="text-gray-500 text-sm">{t.role} · {t.country}</div>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="font-bold text-emerald-600">{t.amount}</div>
                    <div className="text-xs text-gray-400">{t.product}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-[#0B1F3A] mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600 text-xl">Everything you need to know about our funding process.</p>
          </div>
          <Accordion type="single" collapsible className="space-y-3">
            {FAQS.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="bg-white border border-gray-200 rounded-xl px-6 shadow-sm">
                <AccordionTrigger className="text-[#0B1F3A] font-semibold py-5 hover:no-underline text-left">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-5 leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-[#0B1F3A] relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 30% 50%, #1FA67A, transparent 60%), radial-gradient(circle at 70% 50%, #D4AF37, transparent 60%)" }} />
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
            Ready to Unlock Your Capital?
          </h2>
          <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto">
            Join over 47,000 Africans who have secured funding through Cardone. Create your free account in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-[#D4AF37] hover:bg-[#c49d2f] text-[#0B1F3A] font-bold px-10 h-14 text-base">
                Create Free Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <a href="mailto:info@cardoneloansgrants.org">
              <Button size="lg" variant="outline" className="border-white/20 text-white bg-white/5 hover:bg-white/10 h-14 px-8 text-base">
                <Mail className="mr-2 h-5 w-5" />
                Email Us
              </Button>
            </a>
          </div>
          <p className="text-white/40 text-sm mt-8">No commitment required. Free to apply. Decisions in 48–72 hours.</p>
        </div>
      </section>
    </div>
  )
}
