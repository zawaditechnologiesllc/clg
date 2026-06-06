import { useState, useEffect } from "react"
import { Link, useLocation } from "wouter"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Eye, EyeOff, ShieldCheck, CheckCircle2, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiRequest } from "@/lib/api"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const AFRICAN_COUNTRIES = [
  "Algeria","Angola","Benin","Botswana","Burkina Faso","Burundi","Cabo Verde","Cameroon",
  "Central African Republic","Chad","Comoros","Congo (Brazzaville)","Congo (DRC)","Djibouti",
  "Egypt","Equatorial Guinea","Eritrea","Eswatini","Ethiopia","Gabon","Gambia","Ghana",
  "Guinea","Guinea-Bissau","Ivory Coast","Kenya","Lesotho","Liberia","Libya","Madagascar",
  "Malawi","Mali","Mauritania","Mauritius","Morocco","Mozambique","Namibia","Niger","Nigeria",
  "Rwanda","São Tomé & Príncipe","Senegal","Sierra Leone","Somalia","South Africa",
  "South Sudan","Sudan","Tanzania","Togo","Tunisia","Uganda","Zambia","Zimbabwe",
]

function AuthLayout({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="hidden lg:flex lg:w-2/5 bg-[#0B1F3A] flex-col justify-between p-12">
        <Link href="/">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37] flex items-center justify-center">
              <span className="text-[#0B1F3A] font-bold text-lg">C</span>
            </div>
            <span className="text-white font-display font-bold text-xl">Cardone</span>
          </div>
        </Link>
        <div>
          <div className="text-[#D4AF37] text-6xl font-display font-bold mb-4">"</div>
          <p className="text-white/80 text-xl leading-relaxed mb-8 italic">
            Access to American institutional capital transformed my business. Cardone made it possible when no local bank would.
          </p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold">A</div>
            <div>
              <div className="text-white font-semibold">Amina Hassan</div>
              <div className="text-white/50 text-sm">Import/Export Trader · Tanzania</div>
            </div>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-6">
            {[["$2.8B+", "Capital Deployed"], ["47K+", "Clients Served"], ["94%", "Approval Rate"], ["54", "Countries"]].map(([v, l]) => (
              <div key={l}>
                <div className="text-[#D4AF37] font-display font-bold text-2xl">{v}</div>
                <div className="text-white/50 text-sm">{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 text-white/30 text-sm">
          <ShieldCheck className="h-4 w-4" />
          <span>256-bit SSL Encrypted · Regulated Capital Provider</span>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link href="/" className="lg:hidden flex items-center gap-2 mb-8 text-[#0B1F3A] font-bold">
              <div className="w-8 h-8 rounded-lg bg-[#0B1F3A] flex items-center justify-center">
                <span className="text-[#D4AF37] font-bold">C</span>
              </div>
              Cardone Loans & Grants
            </Link>
            <h1 className="text-3xl font-display font-bold text-[#0B1F3A]">{title}</h1>
            <p className="text-gray-500 mt-2">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}

export function Login() {
  const [, navigate] = useLocation()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [needsConfirm, setNeedsConfirm] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await apiRequest("POST", "/api/auth/login", { email, password })
      if (data.user.role === "admin") navigate("/admin")
      else navigate("/dashboard")
    } catch (err: any) {
      if (err?.requiresConfirmation) setNeedsConfirm(true)
      toast({ title: "Login failed", description: err.message || "Invalid credentials", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const resendConfirmation = async () => {
    try {
      await apiRequest("POST", "/api/auth/resend-confirmation", { email })
      toast({ title: "Email sent", description: "A new confirmation link has been sent." })
    } catch {
      toast({ title: "Error", description: "Failed to resend.", variant: "destructive" })
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your Cardone account">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Label htmlFor="email">Email address</Label>
          <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required className="mt-1.5 h-12" />
        </div>
        <div>
          <div className="flex justify-between mb-1.5">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="text-sm text-[#1FA67A] hover:underline">Forgot password?</Link>
          </div>
          <div className="relative">
            <Input id="password" type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required className="h-12 pr-12" />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {needsConfirm && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm">
            <p className="text-amber-800 font-medium mb-2">Email not confirmed</p>
            <p className="text-amber-700 mb-3">Please confirm your email before logging in.</p>
            <button type="button" onClick={resendConfirmation} className="text-amber-800 underline font-semibold">Resend confirmation email</button>
          </div>
        )}
        <Button type="submit" disabled={loading} className="w-full h-12 bg-[#0B1F3A] hover:bg-[#0B1F3A]/90 text-white font-semibold text-base">
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign In"}
        </Button>
        <p className="text-center text-gray-500 text-sm">
          Don't have an account?{" "}
          <Link href="/register" className="text-[#1FA67A] font-semibold hover:underline">Create account</Link>
        </p>
      </form>
    </AuthLayout>
  )
}

export function Register() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [step, setStep] = useState<1 | 2>(1)
  const [form, setForm] = useState({
    fullName: "", email: "", password: "", confirmPassword: "", phoneNumber: "",
    bankCountry: "", bankName: "", bankAccountNumber: "", bankAccountName: "", swiftCode: "",
  })
  const setField = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }))

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" }); return
    }
    if (form.password.length < 8) {
      toast({ title: "Password too short", description: "Minimum 8 characters", variant: "destructive" }); return
    }
    setStep(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await apiRequest("POST", "/api/auth/register", {
        email: form.email, password: form.password, fullName: form.fullName,
        phoneNumber: form.phoneNumber || undefined,
        bankCountry: form.bankCountry || undefined, bankName: form.bankName || undefined,
        bankAccountNumber: form.bankAccountNumber || undefined,
        bankAccountName: form.bankAccountName || undefined,
        swiftCode: form.swiftCode || undefined,
      })
      setSuccess(true)
    } catch (err: any) {
      toast({ title: "Registration failed", description: err.message || "Please try again", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <AuthLayout title="Check your email" subtitle="Almost there — one more step">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          </div>
          <h3 className="text-xl font-bold text-[#0B1F3A] mb-3">Confirm Your Email</h3>
          <p className="text-gray-600 mb-6">
            We've sent a confirmation link to <strong>{form.email}</strong>. Click the link to activate your account.
          </p>
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800 mb-6">
            <strong>Don't see it?</strong> Check your spam folder. The link expires in 24 hours.
          </div>
          <Link href="/login">
            <Button className="w-full bg-[#0B1F3A] hover:bg-[#0B1F3A]/90 h-12">Go to Sign In</Button>
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Create your account" subtitle="Join 47,000+ Africans accessing US capital">
      <div className="flex items-center gap-2 mb-2">
        <div className={`flex-1 h-1.5 rounded-full ${step >= 1 ? "bg-[#1FA67A]" : "bg-gray-200"}`} />
        <div className={`flex-1 h-1.5 rounded-full ${step >= 2 ? "bg-[#1FA67A]" : "bg-gray-200"}`} />
      </div>
      <p className="text-xs text-gray-400 mb-5">Step {step} of 2 — {step === 1 ? "Personal Details" : "Payout Bank Account"}</p>

      {step === 1 ? (
        <form onSubmit={handleStep1} className="space-y-4">
          <div>
            <Label>Full Name</Label>
            <Input value={form.fullName} onChange={setField("fullName")} placeholder="As on your national ID" required className="mt-1.5 h-12" />
          </div>
          <div>
            <Label>Email Address</Label>
            <Input type="email" value={form.email} onChange={setField("email")} placeholder="you@example.com" required className="mt-1.5 h-12" />
          </div>
          <div>
            <Label>Phone Number (M-Pesa)</Label>
            <Input type="tel" value={form.phoneNumber} onChange={setField("phoneNumber")} placeholder="+254 7XX XXX XXX" className="mt-1.5 h-12" />
          </div>
          <div>
            <Label>Password</Label>
            <div className="relative mt-1.5">
              <Input type={showPw ? "text" : "password"} value={form.password} onChange={setField("password")} placeholder="Min. 8 characters" required className="h-12 pr-12" />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <div>
            <Label>Confirm Password</Label>
            <Input type="password" value={form.confirmPassword} onChange={setField("confirmPassword")} placeholder="Repeat password" required className="mt-1.5 h-12" />
          </div>
          <Button type="submit" className="w-full h-12 bg-[#0B1F3A] hover:bg-[#0B1F3A]/90 text-white font-semibold">
            Continue to Bank Details →
          </Button>
          <p className="text-center text-gray-500 text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-[#1FA67A] font-semibold hover:underline">Sign in</Link>
          </p>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-800">
            <strong>Your payout account.</strong> Funds will be sent here when you request a withdrawal. You can update this later.
          </div>
          <div>
            <Label>Bank Country</Label>
            <Select onValueChange={(v) => setForm(p => ({ ...p, bankCountry: v }))}>
              <SelectTrigger className="mt-1.5 h-12">
                <SelectValue placeholder="Select African country" />
              </SelectTrigger>
              <SelectContent className="max-h-56">
                {AFRICAN_COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Bank Name</Label>
            <Input value={form.bankName} onChange={setField("bankName")} placeholder="e.g. Equity Bank, GTBank" className="mt-1.5 h-12" />
          </div>
          <div>
            <Label>Account Number</Label>
            <Input value={form.bankAccountNumber} onChange={setField("bankAccountNumber")} placeholder="Your bank account number" className="mt-1.5 h-12" />
          </div>
          <div>
            <Label>Account Holder Name</Label>
            <Input value={form.bankAccountName} onChange={setField("bankAccountName")} placeholder="Name as on bank account" className="mt-1.5 h-12" />
          </div>
          <div>
            <Label>SWIFT / BIC Code <span className="text-gray-400 font-normal">(optional)</span></Label>
            <Input value={form.swiftCode} onChange={setField("swiftCode")} placeholder="e.g. EQBLKENA" className="mt-1.5 h-12" />
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1 h-12">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 h-12 bg-[#1FA67A] hover:bg-[#1FA67A]/90 text-white font-semibold">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create Account"}
            </Button>
          </div>
          <p className="text-xs text-gray-400 text-center">Bank details can be skipped and added later from your profile.</p>
        </form>
      )}
    </AuthLayout>
  )
}

export function ConfirmEmail() {
  const [, navigate] = useLocation()
  const { toast } = useToast()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token")
    if (!token) { setStatus("error"); setMessage("Invalid confirmation link."); return }
    apiRequest("POST", "/api/auth/confirm-email", { token })
      .then(data => { setStatus("success"); setMessage(data.message) })
      .catch(err => { setStatus("error"); setMessage(err.message || "Confirmation failed") })
  }, [])

  return (
    <AuthLayout title="Email Confirmation" subtitle="Verifying your account">
      <div className="text-center py-8">
        {status === "loading" && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-[#1FA67A]" />
            <p className="text-gray-600">Confirming your email address...</p>
          </div>
        )}
        {status === "success" && (
          <>
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-[#0B1F3A] mb-3">Email Confirmed!</h3>
            <p className="text-gray-600 mb-6">{message}</p>
            <Link href="/login"><Button className="w-full bg-[#0B1F3A] hover:bg-[#0B1F3A]/90 h-12">Sign In to Your Account</Button></Link>
          </>
        )}
        {status === "error" && (
          <>
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="h-10 w-10 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-[#0B1F3A] mb-3">Confirmation Failed</h3>
            <p className="text-gray-600 mb-6">{message}</p>
            <Link href="/register"><Button variant="outline" className="w-full h-12">Register Again</Button></Link>
          </>
        )}
      </div>
    </AuthLayout>
  )
}

export function ForgotPassword() {
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await apiRequest("POST", "/api/auth/forgot-password", { email })
      setSent(true)
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to send reset email", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Reset Password" subtitle="We'll send you a secure reset link">
      {sent ? (
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-[#0B1F3A] mb-3">Check Your Email</h3>
          <p className="text-gray-600 mb-6">If <strong>{email}</strong> is registered, you'll receive a reset link within a few minutes.</p>
          <Link href="/login"><Button variant="outline" className="w-full h-12">Back to Sign In</Button></Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="fp-email">Email Address</Label>
            <Input id="fp-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required className="mt-1.5 h-12" />
          </div>
          <Button type="submit" disabled={loading} className="w-full h-12 bg-[#0B1F3A] hover:bg-[#0B1F3A]/90 text-white font-semibold">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send Reset Link"}
          </Button>
          <Link href="/login" className="flex items-center justify-center gap-2 text-gray-500 text-sm hover:text-gray-700">
            <ArrowLeft className="h-4 w-4" /> Back to Sign In
          </Link>
        </form>
      )}
    </AuthLayout>
  )
}

export function ResetPassword() {
  const [, navigate] = useLocation()
  const { toast } = useToast()
  const [password, setPassword] = useState("")
  const [confirmPw, setConfirmPw] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const token = new URLSearchParams(window.location.search).get("token")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPw) { toast({ title: "Passwords don't match", variant: "destructive" }); return }
    if (password.length < 8) { toast({ title: "Password too short", description: "Min. 8 characters", variant: "destructive" }); return }
    setLoading(true)
    try {
      await apiRequest("POST", "/api/auth/reset-password", { token, password })
      toast({ title: "Password reset!", description: "You can now log in with your new password." })
      navigate("/login")
    } catch (err: any) {
      toast({ title: "Reset failed", description: err.message || "Link may be expired", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <AuthLayout title="Invalid Link" subtitle="">
        <div className="text-center">
          <p className="text-gray-600 mb-4">This reset link is invalid or has expired.</p>
          <Link href="/forgot-password"><Button className="w-full h-12">Request New Link</Button></Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Set New Password" subtitle="Choose a strong password for your account">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Label>New Password</Label>
          <div className="relative mt-1.5">
            <Input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters" required className="h-12 pr-12" />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>
        <div>
          <Label>Confirm New Password</Label>
          <Input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Repeat new password" required className="mt-1.5 h-12" />
        </div>
        <Button type="submit" disabled={loading} className="w-full h-12 bg-[#0B1F3A] hover:bg-[#0B1F3A]/90 text-white font-semibold">
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Reset Password"}
        </Button>
      </form>
    </AuthLayout>
  )
}
