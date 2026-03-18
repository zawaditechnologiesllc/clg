import { useState } from "react"
import { useLocation } from "wouter"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useCreateApplication, useSubmitPayment } from "@workspace/api-client-react"
import { CreateApplicationRequestType, CreateApplicationRequestCategory } from "@workspace/api-client-react"
import { formatCurrency } from "@/lib/utils"
import { Building2, User, ChevronRight, Loader2, CheckCircle2, ArrowRight } from "lucide-react"

// Product definitions
const PRODUCTS = {
  personal_grant: { type: 'grant', category: 'personal', title: 'Personal Grant', min: 2000, max: 10000, fee: 10, icon: User },
  business_grant: { type: 'grant', category: 'business', title: 'Business Grant', min: 5000, max: 30000, fee: 20, icon: Building2 },
  personal_loan: { type: 'loan', category: 'personal', title: 'Personal Loan', min: 10000, max: 50000, fee: 20, icon: User },
  business_loan: { type: 'loan', category: 'business', title: 'Business Loan', min: 20000, max: 100000, fee: 50, icon: Building2 },
}

export function Apply() {
  const [step, setStep] = useState(1)
  const [, setLocation] = useLocation()
  
  // State
  const [selectedProduct, setSelectedProduct] = useState<keyof typeof PRODUCTS | null>(null)
  const [appData, setAppData] = useState<any>({ amountRequested: 0 })
  const [createdAppId, setCreatedAppId] = useState<number | null>(null)
  const [paymentCode, setPaymentCode] = useState("")
  
  // Mutations
  const createMut = useCreateApplication()
  const paymentMut = useSubmitPayment()

  const productDef = selectedProduct ? PRODUCTS[selectedProduct] : null

  const handleProductSelect = (key: keyof typeof PRODUCTS) => {
    setSelectedProduct(key)
    setAppData({ ...appData, amountRequested: PRODUCTS[key].min })
    setStep(2)
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!productDef) return

    const payload = {
      type: productDef.type as CreateApplicationRequestType,
      category: productDef.category as CreateApplicationRequestCategory,
      ...appData,
      amountRequested: Number(appData.amountRequested)
    }

    createMut.mutate({ data: payload }, {
      onSuccess: (data) => {
        setCreatedAppId(data.id)
        setStep(3)
      }
    })
  }

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!createdAppId) return

    paymentMut.mutate({
      id: createdAppId,
      data: { paymentCode }
    }, {
      onSuccess: () => {
        setStep(4)
      }
    })
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Progress Tracker */}
        <div className="mb-12">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-border -z-10 rounded-full"></div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary -z-10 rounded-full transition-all duration-500" style={{ width: `${((step - 1) / 3) * 100}%` }}></div>
            
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${step >= i ? 'bg-primary text-white shadow-lg' : 'bg-card border-2 border-border text-muted-foreground'}`}>
                {step > i ? <CheckCircle2 className="w-5 h-5" /> : i}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-3 text-xs font-medium text-muted-foreground">
            <span className={step >= 1 ? "text-primary" : ""}>Select</span>
            <span className={step >= 2 ? "text-primary ml-4" : ""}>Details</span>
            <span className={step >= 3 ? "text-primary mr-2" : ""}>Payment</span>
            <span className={step >= 4 ? "text-primary" : ""}>Complete</span>
          </div>
        </div>

        {/* STEP 1: Select Product */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-display font-bold">Select a Product</h1>
              <p className="text-muted-foreground mt-2">Choose the right financial vehicle for your goals.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(Object.entries(PRODUCTS) as [keyof typeof PRODUCTS, typeof PRODUCTS[keyof typeof PRODUCTS]][]).map(([key, prod]) => {
                const Icon = prod.icon
                return (
                  <Card 
                    key={key} 
                    className="cursor-pointer group hover:border-primary transition-all duration-300 relative overflow-hidden"
                    onClick={() => handleProductSelect(key)}
                  >
                    {prod.type === 'loan' && (
                      <div className="absolute top-0 right-0 bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-bl-lg z-10">
                        65% PRE-APPROVAL
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <CardTitle className="text-xl group-hover:text-primary transition-colors">{prod.title}</CardTitle>
                          <CardDescription className="uppercase tracking-wider text-xs font-semibold mt-1">
                            {formatCurrency(prod.min)} - {formatCurrency(prod.max)}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Processing Fee</span>
                        <span className="font-bold">{formatCurrency(prod.fee)}</span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* STEP 2: Details */}
        {step === 2 && productDef && (
          <Card className="animate-in fade-in slide-in-from-right-8 duration-500">
            <CardHeader className="border-b border-border bg-muted/30">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl">{productDef.title} Application</CardTitle>
                  <CardDescription>Please provide accurate information for quick processing.</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setStep(1)}>Back</Button>
              </div>
            </CardHeader>
            <CardContent className="pt-8">
              <form onSubmit={handleFormSubmit} className="space-y-6">
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Requested Amount ($)</label>
                  <Input 
                    type="number" 
                    min={productDef.min} 
                    max={productDef.max} 
                    required 
                    value={appData.amountRequested}
                    onChange={e => setAppData({...appData, amountRequested: e.target.value})}
                    className="text-lg font-bold"
                  />
                  <p className="text-xs text-muted-foreground">Between {formatCurrency(productDef.min)} and {formatCurrency(productDef.max)}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Full Name</label>
                    <Input required value={appData.fullName || ''} onChange={e => setAppData({...appData, fullName: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Phone Number</label>
                    <Input required value={appData.phoneNumber || ''} onChange={e => setAppData({...appData, phoneNumber: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">National ID / Passport</label>
                    <Input required value={appData.nationalId || ''} onChange={e => setAppData({...appData, nationalId: e.target.value})} />
                  </div>
                  
                  {productDef.category === 'personal' ? (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Employment Status</label>
                        <Input required value={appData.employmentStatus || ''} onChange={e => setAppData({...appData, employmentStatus: e.target.value})} placeholder="Employed, Self-employed, etc." />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Monthly Income ($)</label>
                        <Input type="number" required value={appData.monthlyIncome || ''} onChange={e => setAppData({...appData, monthlyIncome: Number(e.target.value)})} />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Business Name</label>
                        <Input required value={appData.businessName || ''} onChange={e => setAppData({...appData, businessName: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Registration Number</label>
                        <Input required value={appData.registrationNumber || ''} onChange={e => setAppData({...appData, registrationNumber: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Annual Revenue ($)</label>
                        <Input type="number" required value={appData.annualRevenue || ''} onChange={e => setAppData({...appData, annualRevenue: Number(e.target.value)})} />
                      </div>
                    </>
                  )}
                </div>

                <div className="space-y-2 pt-4 border-t border-border">
                  <label className="text-sm font-semibold">Purpose of Funds</label>
                  <textarea 
                    className="w-full min-h-[100px] rounded-xl border-2 border-border bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10"
                    required
                    value={appData.purposeOfFunds || ''}
                    onChange={e => setAppData({...appData, purposeOfFunds: e.target.value})}
                    placeholder="Briefly describe how you plan to use these funds..."
                  />
                </div>

                <Button type="submit" size="lg" className="w-full mt-8" disabled={createMut.isPending}>
                  {createMut.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Continue to Payment"}
                  {!createMut.isPending && <ChevronRight className="ml-2 h-5 w-5" />}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* STEP 3: Payment */}
        {step === 3 && productDef && createdAppId && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 animate-in fade-in slide-in-from-right-8 duration-500">
            <Card className="md:col-span-3 border-primary/20 shadow-xl shadow-primary/5">
              <CardHeader className="bg-primary text-primary-foreground rounded-t-xl">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Zap className="h-6 w-6 text-accent" />
                  M-Pesa Payment Instructions
                </CardTitle>
                <CardDescription className="text-primary-foreground/80">
                  Complete the processing fee to finalize your application.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-8">
                <ol className="space-y-4 mb-8 list-decimal list-inside text-muted-foreground marker:text-primary font-medium">
                  <li className="pl-2">Go to M-Pesa menu on your phone</li>
                  <li className="pl-2">Select <strong>Lipa na M-Pesa</strong></li>
                  <li className="pl-2">Select <strong>Paybill</strong></li>
                  <li className="pl-2">Enter Business Number: <strong className="text-foreground text-lg tracking-wider">4167853</strong></li>
                  <li className="pl-2">Enter Account Number: <strong className="text-foreground text-lg bg-muted px-2 py-1 rounded">APP-{createdAppId}</strong></li>
                  <li className="pl-2">Enter Amount: <strong className="text-primary text-lg">{formatCurrency(productDef.fee)}</strong></li>
                  <li className="pl-2">Enter your M-Pesa PIN and confirm</li>
                  <li className="pl-2">Wait for the confirmation SMS with the transaction code</li>
                </ol>

                <form onSubmit={handlePaymentSubmit} className="bg-muted/50 p-6 rounded-xl border border-border">
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-foreground">Enter M-Pesa Transaction Code</label>
                    <Input 
                      required 
                      value={paymentCode} 
                      onChange={e => setPaymentCode(e.target.value.toUpperCase())} 
                      placeholder="e.g. QKT5B9XX7L" 
                      className="font-mono text-lg uppercase tracking-widest bg-white"
                    />
                  </div>
                  <Button type="submit" size="lg" className="w-full mt-4" disabled={paymentMut.isPending}>
                    {paymentMut.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify & Submit Application"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="md:col-span-2 space-y-6">
              <Card className="bg-muted/30">
                <CardHeader>
                  <CardTitle className="text-lg">Application Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="text-muted-foreground">Product</span>
                    <span className="font-semibold text-right">{productDef.title}</span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-semibold text-right">{formatCurrency(appData.amountRequested)}</span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="text-muted-foreground">App ID</span>
                    <span className="font-mono text-right">APP-{createdAppId}</span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-foreground font-bold">Total Due Now</span>
                    <span className="text-primary font-bold text-xl">{formatCurrency(productDef.fee)}</span>
                  </div>
                </CardContent>
              </Card>

              {productDef.type === 'loan' && (
                <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 text-sm">
                  <strong className="text-accent-foreground block mb-1 flex items-center gap-1">
                    <Zap className="h-4 w-4" /> Pre-approval Notice
                  </strong>
                  Upon successful payment verification, you will receive an immediate 65% pre-approval decision for {formatCurrency(appData.amountRequested * 0.65)}.
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 4: Success */}
        {step === 4 && productDef && (
          <div className="animate-in zoom-in-95 duration-700 max-w-2xl mx-auto text-center mt-12">
            <div className="w-24 h-24 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle2 className="w-12 h-12 text-success" />
            </div>
            <h1 className="text-4xl font-display font-bold mb-4">Application Submitted Successfully!</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Your reference number is <strong>APP-{createdAppId}</strong>. We have received your processing fee.
            </p>

            {productDef.type === 'loan' && (
              <Card className="border-accent bg-accent/5 shadow-xl mb-10 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-2 h-full bg-accent"></div>
                <CardContent className="p-8">
                  <h3 className="text-accent-foreground font-bold text-xl mb-2 uppercase tracking-widest text-sm">Instant Decision</h3>
                  <div className="text-4xl font-display font-extrabold text-primary mb-4">
                    {formatCurrency(appData.amountRequested * 0.65)}
                  </div>
                  <p className="text-muted-foreground text-lg">
                    Congratulations! You are <strong>65% pre-approved</strong> based on our initial automated criteria.
                  </p>
                </CardContent>
              </Card>
            )}

            <div className="bg-muted p-6 rounded-2xl mb-8 text-left">
              <h4 className="font-bold mb-4">What happens next?</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">1</div>
                  <p className="text-muted-foreground text-sm">Our underwriting team will review your complete profile within <strong>2-3 business days</strong>.</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">2</div>
                  <p className="text-muted-foreground text-sm">You will receive an email and dashboard notification regarding final approval.</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">3</div>
                  <p className="text-muted-foreground text-sm">Upon final approval, funds will be disbursed exactly <strong>14 days</strong> later to your provided accounts.</p>
                </li>
              </ul>
            </div>

            <Link href="/dashboard">
              <Button size="lg" className="w-full sm:w-auto">Go to My Dashboard</Button>
            </Link>
          </div>
        )}

      </div>
    </div>
  )
}
