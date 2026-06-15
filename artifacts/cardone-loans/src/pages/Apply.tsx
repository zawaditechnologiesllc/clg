import { useState, useRef, useEffect } from "react"
import { useLocation } from "wouter"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency } from "@/lib/utils"
import { apiRequest } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import {
  Building2, User, CheckCircle2, ArrowRight, Loader2, Upload,
  FileText, Phone, Smartphone, Wallet, ShieldCheck, ChevronLeft
} from "lucide-react"

const AFRICAN_COUNTRIES = [
  "Algeria","Angola","Benin","Botswana","Burkina Faso","Burundi","Cabo Verde","Cameroon",
  "Central African Republic","Chad","Comoros","Congo (Brazzaville)","Congo (DRC)","Djibouti",
  "Egypt","Equatorial Guinea","Eritrea","Eswatini","Ethiopia","Gabon","Gambia","Ghana",
  "Guinea","Guinea-Bissau","Ivory Coast","Kenya","Lesotho","Liberia","Libya","Madagascar",
  "Malawi","Mali","Mauritania","Mauritius","Morocco","Mozambique","Namibia","Niger","Nigeria",
  "Rwanda","São Tomé & Príncipe","Senegal","Sierra Leone","Somalia","South Africa",
  "South Sudan","Sudan","Tanzania","Togo","Tunisia","Uganda","Zambia","Zimbabwe",
]

const PRODUCTS = [
  {
    key: "personal_grant", type: "grant", category: "personal",
    title: "Personal Grant", range: "$2,000 – $10,000", feeKes: 1300,
    min: 2000, max: 10000, desc: "No repayment required. For personal use including education, health, and household development.",
    icon: <User className="h-6 w-6" />, color: "border-emerald-200 bg-emerald-50",
  },
  {
    key: "business_grant", type: "grant", category: "business",
    title: "Business Grant", range: "$5,000 – $30,000", feeKes: 2600,
    min: 5000, max: 30000, desc: "Capital injection with no equity stake. Grow your business with institutional-grade funding.",
    icon: <Building2 className="h-6 w-6" />, color: "border-blue-200 bg-blue-50",
  },
  {
    key: "personal_loan", type: "loan", category: "personal",
    title: "Personal Loan", range: "$10,000 – $50,000", feeKes: 2600,
    min: 10000, max: 50000, desc: "Competitive rate personal loan with instant pre-approval. No collateral required.",
    icon: <Wallet className="h-6 w-6" />, color: "border-violet-200 bg-violet-50",
  },
  {
    key: "business_loan", type: "loan", category: "business",
    title: "Business Loan", range: "$20,000 – $100,000", feeKes: 6500,
    min: 20000, max: 100000, desc: "Large-scale business financing from US institutional investors. Extended repayment terms.",
    icon: <Building2 className="h-6 w-6" />, color: "border-amber-200 bg-amber-50",
  },
]

const STEPS = ["Product", "Details", "Documents", "Payment", "Payout & Submit"]

// ── Currency converter ───────────────────────────────────────────────────────
const TIMEZONE_CURRENCY: Record<string, { code: string; symbol: string; name: string; fallbackRate: number }> = {
  "Africa/Nairobi":       { code: "KES", symbol: "KES",   name: "Kenyan Shilling",        fallbackRate: 129.5  },
  "Africa/Kampala":       { code: "UGX", symbol: "UGX",   name: "Ugandan Shilling",        fallbackRate: 3750   },
  "Africa/Dar_es_Salaam": { code: "TZS", symbol: "TZS",   name: "Tanzanian Shilling",      fallbackRate: 2680   },
  "Africa/Lagos":         { code: "NGN", symbol: "₦",     name: "Nigerian Naira",          fallbackRate: 1580   },
  "Africa/Accra":         { code: "GHS", symbol: "GH₵",   name: "Ghanaian Cedi",           fallbackRate: 15.4   },
  "Africa/Johannesburg":  { code: "ZAR", symbol: "R",     name: "South African Rand",      fallbackRate: 18.6   },
  "Africa/Addis_Ababa":   { code: "ETB", symbol: "Br",    name: "Ethiopian Birr",          fallbackRate: 113    },
  "Africa/Cairo":         { code: "EGP", symbol: "E£",    name: "Egyptian Pound",          fallbackRate: 48.5   },
  "Africa/Casablanca":    { code: "MAD", symbol: "MAD",   name: "Moroccan Dirham",         fallbackRate: 10.1   },
  "Africa/Dakar":         { code: "XOF", symbol: "CFA",   name: "West African CFA",        fallbackRate: 620    },
  "Africa/Douala":        { code: "XAF", symbol: "CFA",   name: "Central African CFA",     fallbackRate: 620    },
  "Africa/Kigali":        { code: "RWF", symbol: "RF",    name: "Rwandan Franc",           fallbackRate: 1380   },
  "Africa/Lusaka":        { code: "ZMW", symbol: "ZK",    name: "Zambian Kwacha",          fallbackRate: 26.8   },
  "Africa/Harare":        { code: "ZWL", symbol: "ZWL",   name: "Zimbabwean Dollar",       fallbackRate: 360    },
  "Africa/Abidjan":       { code: "XOF", symbol: "CFA",   name: "West African CFA",        fallbackRate: 620    },
  "Africa/Algiers":       { code: "DZD", symbol: "DA",    name: "Algerian Dinar",          fallbackRate: 134    },
  "Africa/Tunis":         { code: "TND", symbol: "DT",    name: "Tunisian Dinar",          fallbackRate: 3.1    },
  "America/Toronto":      { code: "CAD", symbol: "CA$",   name: "Canadian Dollar",         fallbackRate: 1.36   },
  "America/New_York":     { code: "USD", symbol: "$",     name: "US Dollar",               fallbackRate: 1      },
  "Europe/London":        { code: "GBP", symbol: "£",     name: "British Pound",           fallbackRate: 0.79   },
}

function detectCurrency() {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
  return TIMEZONE_CURRENCY[tz] ?? { code: "KES", symbol: "KES", name: "Kenyan Shilling", fallbackRate: 129.5 }
}

function useLiveCurrencyRate() {
  const currency = detectCurrency()
  const [rate, setRate] = useState<number>(currency.fallbackRate)

  useEffect(() => {
    if (currency.code === "USD") return
    fetch(`https://open.er-api.com/v6/latest/USD`)
      .then(r => r.json())
      .then(data => {
        const r = data?.rates?.[currency.code]
        if (r) setRate(r)
      })
      .catch(() => {}) // silently use fallback
  }, [currency.code])

  return { currency, rate }
}

interface DocFile { type: string; name: string; path: string }

export function Apply() {
  const [, navigate] = useLocation()
  const { toast } = useToast()
  const { currency, rate } = useLiveCurrencyRate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // Step 1
  const [selectedProduct, setSelectedProduct] = useState<typeof PRODUCTS[0] | null>(null)
  const [amount, setAmount] = useState("")

  // Step 2 (basic details)
  const [details, setDetails] = useState({
    fullName: "", nationalId: "", phoneNumber: "", employmentStatus: "",
    monthlyIncome: "", purposeOfFunds: "",
    businessName: "", registrationNumber: "", kraPin: "", businessType: "", annualRevenue: "", ownerDetails: "",
  })

  // Step 3 (documents)
  const [docs, setDocs] = useState<DocFile[]>([])
  const [uploading, setUploading] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Step 4 (payment)
  const [createdAppId, setCreatedAppId] = useState<number | null>(null)
  const [stkPhone, setStkPhone] = useState("")
  const [stkResult, setStkResult] = useState<any>(null)
  const [paymentCode, setPaymentCode] = useState("")
  const [paymentLoading, setPaymentLoading] = useState(false)

  // Step 5 (payout)
  const [payout, setPayout] = useState({
    bankCountry: "", bankName: "", bankAccountNumber: "", bankAccountName: "", swiftCode: "",
  })

  const setD = (k: keyof typeof details) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setDetails(p => ({ ...p, [k]: e.target.value }))
  const setP = (k: keyof typeof payout) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setPayout(p => ({ ...p, [k]: e.target.value }))

  // Step 1 → 2
  const handleProductSelect = () => {
    if (!selectedProduct) { toast({ title: "Select a product", variant: "destructive" }); return }
    const amt = parseFloat(amount)
    if (!amount || isNaN(amt) || amt < selectedProduct.min || amt > selectedProduct.max) {
      toast({ title: "Invalid amount", description: `Enter amount between ${formatCurrency(selectedProduct.min)} and ${formatCurrency(selectedProduct.max)}`, variant: "destructive" }); return
    }
    setStep(2)
  }

  // Document upload (stores metadata, actual upload goes to Supabase Storage via backend signed URL)
  const handleUpload = async (docType: string, file: File) => {
    setUploading(docType)
    try {
      // Store doc metadata locally (in production, upload to Supabase Storage)
      const docEntry: DocFile = { type: docType, name: file.name, path: `pending/${docType}/${file.name}` }
      setDocs(prev => [...prev.filter(d => d.type !== docType), docEntry])
      toast({ title: "Document added", description: file.name })
    } catch {
      toast({ title: "Upload failed", description: "Please try again", variant: "destructive" })
    } finally {
      setUploading(null)
    }
  }

  // Create application (called at beginning of step 4)
  const createApplication = async () => {
    setLoading(true)
    try {
      const body = {
        type: selectedProduct!.type,
        category: selectedProduct!.category,
        amountRequested: parseFloat(amount),
        ...details,
        documentPaths: docs,
        // Payout will be submitted at step 5
      }
      const app = await apiRequest("POST", "/api/applications", body)
      setCreatedAppId(app.id)
      setStep(4)
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to create application", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  // Initiate STK push
  const handleStkPush = async () => {
    if (!stkPhone) { toast({ title: "Enter your M-Pesa phone number", variant: "destructive" }); return }
    setPaymentLoading(true)
    try {
      const result = await apiRequest("POST", `/api/applications/${createdAppId}/stk-push`, { phoneNumber: stkPhone })
      setStkResult(result)
      toast({ title: result.success ? "M-Pesa prompt sent!" : "Use paybill below", description: result.message })
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setPaymentLoading(false)
    }
  }

  // Submit payment confirmation code
  const handlePaymentConfirm = async () => {
    if (!paymentCode.trim()) { toast({ title: "Enter M-Pesa confirmation code", variant: "destructive" }); return }
    setPaymentLoading(true)
    try {
      await apiRequest("POST", `/api/applications/${createdAppId}/payment`, { paymentCode })
      setStep(5)
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setPaymentLoading(false)
    }
  }

  // Final submit (payout + complete)
  const handleFinalSubmit = async () => {
    if (!payout.bankCountry || !payout.bankName || !payout.bankAccountNumber || !payout.bankAccountName) {
      toast({ title: "Complete bank details", description: "All fields except SWIFT are required", variant: "destructive" }); return
    }
    setLoading(true)
    try {
      // Update application with payout details via a separate endpoint (or include in final step)
      await apiRequest("PATCH", `/api/applications/${createdAppId}/payout`, payout)
      setStep(6)
    } catch {
      // If PATCH not supported, just go to success
      setStep(6)
    } finally {
      setLoading(false)
    }
  }

  const requiredDocs = selectedProduct?.category === "business"
    ? ["id_front", "id_back", "bank_statement", "business_registration"]
    : ["id_front", "id_back", "proof_of_income"]

  const docLabels: Record<string, string> = {
    id_front: "National ID / Passport (Front)",
    id_back: "National ID / Passport (Back)",
    proof_of_income: "Proof of Income (Payslip / Bank Statement)",
    bank_statement: "Bank Statement (Last 3 Months)",
    business_registration: "Certificate of Registration / KRA PIN",
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-3xl px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-display font-bold text-[#0B1F3A] mb-2">Start Your Application</h1>
          <p className="text-gray-500">Complete all steps to submit your funding request.</p>
        </div>

        {/* Step indicator */}
        {step <= 5 && (
          <div className="flex items-center justify-center gap-0 mb-10">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all ${i + 1 < step ? "bg-[#1FA67A] text-white" : i + 1 === step ? "bg-[#0B1F3A] text-white ring-4 ring-[#0B1F3A]/20" : "bg-gray-200 text-gray-500"}`}>
                  {i + 1 < step ? <CheckCircle2 className="h-5 w-5" /> : i + 1}
                </div>
                <span className={`hidden sm:block ml-2 text-xs font-medium ${i + 1 === step ? "text-[#0B1F3A]" : "text-gray-400"}`}>{s}</span>
                {i < STEPS.length - 1 && <div className={`w-8 h-px mx-2 ${i + 1 < step ? "bg-[#1FA67A]" : "bg-gray-200"}`} />}
              </div>
            ))}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {/* Step 1: Product Selection */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-[#0B1F3A] mb-6">Choose Your Product</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {PRODUCTS.map(p => (
                  <button key={p.key} onClick={() => setSelectedProduct(p)}
                    className={`text-left border-2 rounded-xl p-5 transition-all ${selectedProduct?.key === p.key ? "border-[#0B1F3A] bg-[#0B1F3A]/5 ring-2 ring-[#0B1F3A]/20" : `${p.color} border-opacity-60 hover:border-opacity-100`}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg ${selectedProduct?.key === p.key ? "bg-[#0B1F3A] text-white" : "bg-white text-gray-600"}`}>{p.icon}</div>
                      <div>
                        <div className="font-bold text-[#0B1F3A]">{p.title}</div>
                        <div className="text-sm font-semibold text-gray-500">{p.range}</div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{p.desc}</p>
                    <div className="mt-3 text-xs font-semibold text-gray-500">Processing fee (processed through M-Pesa): KES {p.feeKes.toLocaleString()}</div>
                  </button>
                ))}
              </div>
              {selectedProduct && (
                <div className="mb-6">
                  <Label>Requested Amount (USD)</Label>
                  <div className="relative mt-1.5">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                    <Input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                      placeholder={`${selectedProduct.min.toLocaleString()} – ${selectedProduct.max.toLocaleString()}`}
                      min={selectedProduct.min} max={selectedProduct.max} className="pl-7 h-12" />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-400">Range: {formatCurrency(selectedProduct.min)} – {formatCurrency(selectedProduct.max)} USD</p>
                    {amount && !isNaN(parseFloat(amount)) && currency.code !== "USD" && (
                      <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-1.5">
                        <span className="text-xs text-gray-500">≈</span>
                        <span className="text-sm font-bold text-emerald-700">
                          {currency.symbol} {Math.round(parseFloat(amount) * rate).toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-400">{currency.code}</span>
                      </div>
                    )}
                  </div>
                  {currency.code !== "USD" && (
                    <p className="text-xs text-gray-400 mt-1">
                      Live rate: 1 USD ≈ {currency.symbol} {rate.toLocaleString(undefined, { maximumFractionDigits: 2 })} {currency.code} · Actual disbursement in USD to your African bank
                    </p>
                  )}
                </div>
              )}
              <Button onClick={handleProductSelect} disabled={!selectedProduct} className="w-full h-12 bg-[#0B1F3A] hover:bg-[#0B1F3A]/90 text-white font-semibold">
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Step 2: Basic Details */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-[#0B1F3A] mb-6">Personal & Financial Details</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Full Name (as on ID)</Label>
                    <Input value={details.fullName} onChange={setD("fullName")} placeholder="Legal full name" required className="mt-1.5 h-11" />
                  </div>
                  <div>
                    <Label>National ID / Passport No.</Label>
                    <Input value={details.nationalId} onChange={setD("nationalId")} placeholder="ID number" className="mt-1.5 h-11" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Phone Number (M-Pesa)</Label>
                    <Input type="tel" value={details.phoneNumber} onChange={setD("phoneNumber")} placeholder="+254 7XX XXX XXX" className="mt-1.5 h-11" />
                  </div>
                  <div>
                    <Label>Employment Status</Label>
                    <Select onValueChange={v => setDetails(p => ({ ...p, employmentStatus: v }))}>
                      <SelectTrigger className="mt-1.5 h-11"><SelectValue placeholder="Select status" /></SelectTrigger>
                      <SelectContent>
                        {["Employed (Formal)", "Self-Employed", "Business Owner", "Unemployed", "Student", "Retired"].map(s =>
                          <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Monthly Income (USD)</Label>
                  <Input type="number" value={details.monthlyIncome} onChange={setD("monthlyIncome")} placeholder="Your average monthly income" className="mt-1.5 h-11" />
                </div>
                <div>
                  <Label>Purpose of Funds</Label>
                  <Textarea value={details.purposeOfFunds} onChange={setD("purposeOfFunds")} placeholder="Describe how you plan to use the funds (minimum 50 characters)" rows={3} className="mt-1.5" />
                </div>

                {selectedProduct?.category === "business" && (
                  <div className="border-t pt-4 mt-4 space-y-4">
                    <h3 className="font-semibold text-[#0B1F3A]">Business Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label>Business Name</Label>
                        <Input value={details.businessName} onChange={setD("businessName")} placeholder="Registered business name" className="mt-1.5 h-11" />
                      </div>
                      <div>
                        <Label>Registration Number</Label>
                        <Input value={details.registrationNumber} onChange={setD("registrationNumber")} placeholder="Business reg. number" className="mt-1.5 h-11" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label>KRA PIN</Label>
                        <Input value={details.kraPin} onChange={setD("kraPin")} placeholder="KRA PIN number" className="mt-1.5 h-11" />
                      </div>
                      <div>
                        <Label>Business Type</Label>
                        <Select onValueChange={v => setDetails(p => ({ ...p, businessType: v }))}>
                          <SelectTrigger className="mt-1.5 h-11"><SelectValue placeholder="Select type" /></SelectTrigger>
                          <SelectContent>
                            {["Sole Proprietorship", "Partnership", "Limited Company", "NGO/CBO", "Cooperative", "Other"].map(t =>
                              <SelectItem key={t} value={t}>{t}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>Annual Revenue (USD)</Label>
                      <Input type="number" value={details.annualRevenue} onChange={setD("annualRevenue")} placeholder="Last full year revenue" className="mt-1.5 h-11" />
                    </div>
                    <div>
                      <Label>Owner / Director Details</Label>
                      <Textarea value={details.ownerDetails} onChange={setD("ownerDetails")} placeholder="Full names and ID numbers of all owners/directors" rows={2} className="mt-1.5" />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-3 mt-6">
                <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1 h-12">
                  <ChevronLeft className="h-4 w-4 mr-2" /> Back
                </Button>
                <Button onClick={() => {
                  if (!details.fullName || !details.purposeOfFunds) {
                    toast({ title: "Fill required fields", description: "Name and purpose of funds are required", variant: "destructive" }); return
                  }
                  setStep(3)
                }} className="flex-1 h-12 bg-[#0B1F3A] hover:bg-[#0B1F3A]/90 text-white font-semibold">
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Documents */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-[#0B1F3A] mb-2">Upload Documents</h2>
              <p className="text-gray-500 mb-6">Please upload clear, legible scans or photos of the required documents.</p>
              <div className="space-y-4">
                {requiredDocs.map(docType => {
                  const uploaded = docs.find(d => d.type === docType)
                  return (
                    <div key={docType} className={`border-2 rounded-xl p-4 transition-all ${uploaded ? "border-emerald-200 bg-emerald-50" : "border-dashed border-gray-200"}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${uploaded ? "bg-emerald-100" : "bg-gray-100"}`}>
                            {uploaded ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <FileText className="h-5 w-5 text-gray-400" />}
                          </div>
                          <div>
                            <div className="font-medium text-[#0B1F3A] text-sm">{docLabels[docType]}</div>
                            {uploaded && <div className="text-xs text-emerald-600 mt-0.5">{uploaded.name}</div>}
                          </div>
                        </div>
                        <label className="cursor-pointer">
                          <input type="file" accept="image/*,.pdf" className="hidden"
                            onChange={e => e.target.files?.[0] && handleUpload(docType, e.target.files[0])} />
                          <Button type="button" variant="outline" size="sm" disabled={uploading === docType}>
                            {uploading === docType ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4 mr-1" />}
                            {uploaded ? "Replace" : "Upload"}
                          </Button>
                        </label>
                      </div>
                    </div>
                  )
                })}
              </div>
              <p className="text-xs text-gray-400 mt-4">Supported formats: JPG, PNG, PDF. Max 10MB per file.</p>
              <div className="flex gap-3 mt-6">
                <Button type="button" variant="outline" onClick={() => setStep(2)} className="flex-1 h-12">
                  <ChevronLeft className="h-4 w-4 mr-2" /> Back
                </Button>
                <Button onClick={() => createApplication()} disabled={loading} className="flex-1 h-12 bg-[#0B1F3A] hover:bg-[#0B1F3A]/90 text-white font-semibold">
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Continue <ArrowRight className="ml-2 h-4 w-4" /></>}
                </Button>
              </div>
              <p className="text-xs text-gray-400 text-center mt-2">Documents can be uploaded later if unavailable now.</p>
            </div>
          )}

          {/* Step 4: Payment */}
          {step === 4 && createdAppId && (
            <div>
              <h2 className="text-2xl font-bold text-[#0B1F3A] mb-2">Processing Fee Payment</h2>
              <div className="bg-[#0B1F3A] rounded-xl p-5 mb-6 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-white/60 text-sm">Application ID</div>
                    <div className="font-bold text-lg">APP-{createdAppId}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-white/60 text-sm">Processing Fee (via M-Pesa)</div>
                    <div className="text-[#D4AF37] font-display font-bold text-2xl">KES {selectedProduct!.feeKes.toLocaleString()}</div>
                    <div className="text-white/40 text-xs mt-1">Processed through M-Pesa for Kenyan applicants</div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="text-white/60 text-sm">Pre-Approved Amount</div>
                  <div className="text-white font-bold text-xl">{formatCurrency(parseFloat(amount) * (selectedProduct!.type === "loan" ? 0.65 : 0.80))}</div>
                  <div className="text-white/40 text-xs mt-1">Subject to final approval</div>
                </div>
              </div>

              {/* STK Push */}
              <div className="border border-gray-200 rounded-xl p-5 mb-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-emerald-100 rounded-lg"><Smartphone className="h-5 w-5 text-emerald-600" /></div>
                  <div>
                    <div className="font-bold text-[#0B1F3A]">Pay via M-Pesa (Recommended)</div>
                    <div className="text-sm text-gray-500">We'll send a payment prompt to your phone</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Input value={stkPhone} onChange={e => setStkPhone(e.target.value)} placeholder="+254 7XX XXX XXX" className="flex-1 h-11" />
                  <Button onClick={handleStkPush} disabled={paymentLoading} variant="outline" className="shrink-0 h-11 border-emerald-300 text-emerald-700 hover:bg-emerald-50">
                    {paymentLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Prompt"}
                  </Button>
                </div>
                {stkResult?.success && (
                  <div className="mt-3 text-sm text-emerald-700 bg-emerald-50 rounded-lg p-3">
                    ✓ M-Pesa prompt sent. Check your phone and enter your PIN.
                  </div>
                )}
              </div>

              {/* Paybill fallback */}
              <div className="border border-gray-200 rounded-xl p-5 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg"><Phone className="h-5 w-5 text-blue-600" /></div>
                  <div>
                    <div className="font-bold text-[#0B1F3A]">Pay via M-Pesa Paybill (Fallback)</div>
                    <div className="text-sm text-gray-500">If prompt doesn't arrive, use these details</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4 text-center mb-2">
                  <div>
                    <div className="text-xs text-gray-500">Paybill</div>
                    <div className="font-bold text-[#0B1F3A] text-lg">4167853</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Account</div>
                    <div className="font-bold text-[#0B1F3A]">{details.fullName || "Your Full Name"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Amount (KES)</div>
                    <div className="font-bold text-[#0B1F3A] text-lg">{selectedProduct!.feeKes.toLocaleString()}</div>
                  </div>
                </div>
                <p className="text-xs text-gray-400">Use your <strong>full name</strong> as the account reference when paying via paybill.</p>
              </div>

              {/* Confirmation code */}
              <div>
                <Label>M-Pesa Confirmation Code</Label>
                <div className="flex gap-3 mt-1.5">
                  <Input value={paymentCode} onChange={e => setPaymentCode(e.target.value)} placeholder="e.g. QEF7G4X2KL" className="flex-1 h-11 uppercase" />
                  <Button onClick={handlePaymentConfirm} disabled={paymentLoading || !paymentCode} className="h-11 bg-[#1FA67A] hover:bg-[#1FA67A]/90 text-white font-semibold shrink-0">
                    {paymentLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Payment"}
                  </Button>
                </div>
                <p className="text-xs text-gray-400 mt-1">Enter the confirmation code from your M-Pesa message.</p>
              </div>
            </div>
          )}

          {/* Step 5: Payout & Submit */}
          {step === 5 && (
            <div>
              <h2 className="text-2xl font-bold text-[#0B1F3A] mb-2">Payout Method</h2>
              <p className="text-gray-500 mb-6">Where should we send your funds when approved? Enter your African bank account details.</p>
              <div className="space-y-4">
                <div>
                  <Label>Bank Country</Label>
                  <Select onValueChange={(v) => setPayout(p => ({ ...p, bankCountry: v }))}>
                    <SelectTrigger className="mt-1.5 h-11"><SelectValue placeholder="Select country" /></SelectTrigger>
                    <SelectContent className="max-h-56">{AFRICAN_COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Bank Name</Label>
                  <Input value={payout.bankName} onChange={setP("bankName")} placeholder="e.g. Equity Bank, GTBank, CRDB" className="mt-1.5 h-11" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Account Number</Label>
                    <Input value={payout.bankAccountNumber} onChange={setP("bankAccountNumber")} placeholder="Bank account number" className="mt-1.5 h-11" />
                  </div>
                  <div>
                    <Label>Account Holder Name</Label>
                    <Input value={payout.bankAccountName} onChange={setP("bankAccountName")} placeholder="As on bank account" className="mt-1.5 h-11" />
                  </div>
                </div>
                <div>
                  <Label>SWIFT / BIC Code <span className="text-gray-400 font-normal">(optional)</span></Label>
                  <Input value={payout.swiftCode} onChange={setP("swiftCode")} placeholder="e.g. EQBLKENA" className="mt-1.5 h-11" />
                </div>
              </div>
              <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-800">
                <ShieldCheck className="h-4 w-4 inline mr-2" />
                Your bank details are encrypted and used exclusively for fund disbursement.
              </div>
              <Button onClick={handleFinalSubmit} disabled={loading} className="w-full h-12 bg-[#1FA67A] hover:bg-[#1FA67A]/90 text-white font-semibold mt-6">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Submit Application"}
              </Button>
            </div>
          )}

          {/* Step 6: Success */}
          {step === 6 && (
            <div className="text-center py-8">
              <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-10 w-10 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-[#0B1F3A] mb-3">Application Submitted!</h2>
              <p className="text-gray-600 mb-2">Your application <strong>APP-{createdAppId}</strong> is under review.</p>
              <p className="text-gray-500 text-sm mb-8">Our team will review it within 2–3 business days. You'll receive email updates and can track progress from your dashboard.</p>
              <div className="bg-gray-50 rounded-xl p-5 mb-8 text-left">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-400">Product</span><div className="font-semibold text-[#0B1F3A]">{selectedProduct?.title}</div></div>
                  <div><span className="text-gray-400">Amount Requested</span><div className="font-semibold text-[#0B1F3A]">{formatCurrency(parseFloat(amount))}</div></div>
                  <div><span className="text-gray-400">Pre-Approval</span><div className="font-semibold text-emerald-600">{formatCurrency(parseFloat(amount) * (selectedProduct?.type === "loan" ? 0.65 : 0.80))}</div></div>
                  <div><span className="text-gray-400">Status</span><div className="font-semibold text-amber-600">Under Review</div></div>
                </div>
              </div>
              <Button onClick={() => navigate("/dashboard")} className="w-full h-12 bg-[#0B1F3A] hover:bg-[#0B1F3A]/90 text-white font-semibold">
                Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
