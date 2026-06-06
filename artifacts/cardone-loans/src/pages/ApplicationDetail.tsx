import { useGetApplication, getGetApplicationQueryKey } from "@workspace/api-client-react"
import { useRoute } from "wouter"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { format } from "date-fns"
import { Loader2, ArrowLeft, Building2, User, FileText, Calendar, Zap, MessageSquare } from "lucide-react"
import { Link } from "wouter"

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'approved': return <Badge variant="success" className="text-sm px-3 py-1">Approved</Badge>
    case 'rejected': return <Badge variant="destructive" className="text-sm px-3 py-1">Rejected</Badge>
    case 'under_review': return <Badge variant="secondary" className="text-sm px-3 py-1">Under Review</Badge>
    default: return <Badge variant="warning" className="text-sm px-3 py-1">Pending Review</Badge>
  }
}

export function ApplicationDetail() {
  const [, params] = useRoute("/applications/:id")
  const id = Number(params?.id)
  
  const { data: app, isLoading } = useGetApplication(id, { query: { queryKey: getGetApplicationQueryKey(id), enabled: !!id } })

  if (isLoading) return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
  if (!app) return <div className="p-12 text-center">Application not found</div>

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
      </Link>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="font-mono bg-muted px-2 py-1 rounded text-sm text-muted-foreground font-semibold">APP-{app.id}</span>
            <StatusBadge status={app.status} />
          </div>
          <h1 className="text-4xl font-display font-bold capitalize">{app.category} {app.type}</h1>
          <p className="text-muted-foreground mt-2 flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Submitted on {format(new Date(app.createdAt), 'MMMM d, yyyy')}
          </p>
        </div>
        <div className="bg-primary text-primary-foreground p-6 rounded-2xl shadow-lg text-right min-w-[200px]">
          <p className="text-primary-foreground/70 text-sm font-medium mb-1">Requested Amount</p>
          <p className="text-3xl font-display font-bold">{formatCurrency(app.amountRequested)}</p>
        </div>
      </div>

      {app.adminComment && (
        <Card className="mb-8 border-l-4 border-l-primary bg-primary/5">
          <CardContent className="p-6 flex gap-4">
            <MessageSquare className="h-6 w-6 text-primary shrink-0" />
            <div>
              <h4 className="font-bold text-foreground mb-1">Message from Underwriting Team</h4>
              <p className="text-muted-foreground">{app.adminComment}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {app.type === 'loan' && (
        <Card className="mb-8 border-accent bg-accent/5">
          <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-bold text-accent-foreground flex items-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-accent" /> 65% Pre-Approval Active
              </h3>
              <p className="text-muted-foreground text-sm max-w-lg">
                Based on our preliminary automated underwriting, this loan has secured a 65% pre-approval guarantee pending final verification.
              </p>
            </div>
            <div className="text-3xl font-display font-black text-primary bg-white px-6 py-3 rounded-xl shadow-sm border border-accent/20">
              {formatCurrency(app.amountRequested * 0.65)}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader className="bg-muted/30 border-b border-border">
            <CardTitle className="flex items-center gap-2 text-lg">
              {app.category === 'personal' ? <User className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
              {app.category === 'personal' ? 'Applicant Details' : 'Business Details'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-border">
            <div className="grid grid-cols-3 p-4">
              <span className="text-muted-foreground text-sm col-span-1">Name</span>
              <span className="font-medium col-span-2 text-right">{app.fullName || app.businessName}</span>
            </div>
            <div className="grid grid-cols-3 p-4">
              <span className="text-muted-foreground text-sm col-span-1">ID / Reg No.</span>
              <span className="font-medium col-span-2 text-right">{app.nationalId || app.registrationNumber}</span>
            </div>
            <div className="grid grid-cols-3 p-4">
              <span className="text-muted-foreground text-sm col-span-1">Contact</span>
              <span className="font-medium col-span-2 text-right">{app.phoneNumber}</span>
            </div>
            {app.category === 'personal' ? (
              <>
                <div className="grid grid-cols-3 p-4">
                  <span className="text-muted-foreground text-sm col-span-1">Employment</span>
                  <span className="font-medium col-span-2 text-right">{app.employmentStatus}</span>
                </div>
                <div className="grid grid-cols-3 p-4">
                  <span className="text-muted-foreground text-sm col-span-1">Income</span>
                  <span className="font-medium col-span-2 text-right">{app.monthlyIncome ? formatCurrency(app.monthlyIncome) : '-'} / mo</span>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-3 p-4">
                <span className="text-muted-foreground text-sm col-span-1">Annual Rev.</span>
                <span className="font-medium col-span-2 text-right">{app.annualRevenue ? formatCurrency(app.annualRevenue) : '-'}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card>
            <CardHeader className="bg-muted/30 border-b border-border">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5" /> Processing & Purpose
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Payment Reference</h4>
                <div className="bg-muted p-3 rounded-lg font-mono text-lg tracking-widest text-center border border-border">
                  {app.paymentCode || 'PENDING'}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Declared Purpose</h4>
                <p className="text-foreground leading-relaxed p-4 bg-background rounded-lg border border-border">
                  {app.purposeOfFunds}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
