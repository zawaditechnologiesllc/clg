import { useState } from "react"
import { useRoute, Link, useLocation } from "wouter"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { format } from "date-fns"
import {
  Loader2, ArrowLeft, CheckCircle2, XCircle, User, Building2, FileText,
  Wallet, Clock, DollarSign, Landmark, Unlock, AlertTriangle
} from "lucide-react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { apiRequest } from "@/lib/api"

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
    rejected: "bg-red-100 text-red-700 border-red-200",
    under_review: "bg-blue-100 text-blue-700 border-blue-200",
    pending: "bg-amber-100 text-amber-700 border-amber-200",
  }
  const labels: Record<string, string> = { approved: "Approved", rejected: "Rejected", under_review: "Under Review", pending: "Pending" }
  return <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${map[status] || "bg-gray-100 text-gray-600"}`}>{labels[status] || status}</span>
}

export function AdminApplicationDetail() {
  const [, params] = useRoute("/admin/applications/:id")
  const id = Number(params?.id)
  const [, navigate] = useLocation()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const [action, setAction] = useState<"approve" | "reject" | null>(null)
  const [reason, setReason] = useState("")
  const [approvedAmount, setApprovedAmount] = useState("")
  const [releaseDate, setReleaseDate] = useState("")
  const [loading, setLoading] = useState(false)
  const [releaseLoading, setReleaseLoading] = useState(false)

  const { data: app, isLoading, refetch } = useQuery({
    queryKey: ["admin-application", id],
    queryFn: () => apiRequest("GET", `/api/admin/applications/${id}`),
    enabled: !!id,
  })

  const handleApprove = async () => {
    if (!reason.trim()) { toast({ title: "Add approval note", variant: "destructive" }); return }
    if (!approvedAmount || isNaN(parseFloat(approvedAmount))) { toast({ title: "Enter approved amount", variant: "destructive" }); return }
    if (!releaseDate) { toast({ title: "Set a release date", variant: "destructive" }); return }
    setLoading(true)
    try {
      await apiRequest("POST", `/api/admin/applications/${id}/approve`, { reason, approvedAmount: parseFloat(approvedAmount), releaseDateStr: releaseDate })
      toast({ title: "Application approved!", description: "Client has been notified." })
      queryClient.invalidateQueries({ queryKey: ["admin-application", id] })
      refetch()
      setAction(null)
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    if (!reason.trim()) { toast({ title: "Enter rejection reason", variant: "destructive" }); return }
    setLoading(true)
    try {
      await apiRequest("POST", `/api/admin/applications/${id}/reject`, { reason })
      toast({ title: "Application rejected", description: "Client has been notified." })
      refetch()
      setAction(null)
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleRelease = async () => {
    setReleaseLoading(true)
    try {
      await apiRequest("POST", `/api/admin/applications/${id}/release`, {})
      toast({ title: "Funds released!", description: "Client can now request a withdrawal." })
      refetch()
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setReleaseLoading(false)
    }
  }

  if (isLoading) return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#1FA67A]" /></div>
  if (!app) return <div className="p-8 text-center text-gray-500">Application not found.</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#0B1F3A] text-white px-4 py-6">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/admin"><Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10"><ArrowLeft className="h-4 w-4 mr-1" /> Admin</Button></Link>
            <span className="text-white/30">/</span>
            <span className="text-sm text-white/60">APP-{id}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-display font-bold capitalize">{app.category} {app.type}</h1>
                <StatusBadge status={app.status} />
              </div>
              <p className="text-white/60">APP-{app.id} · Submitted {format(new Date(app.createdAt), "MMM d, yyyy")}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-display font-bold text-[#D4AF37]">{formatCurrency(app.amountRequested)}</div>
              <div className="text-white/50 text-sm">Amount Requested</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
        {/* Financial Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Pre-Approved", value: app.preapprovedAmount ? formatCurrency(app.preapprovedAmount) : "—", color: "text-[#0B1F3A]" },
            { label: "Approved Amount", value: app.approvedAmount ? formatCurrency(app.approvedAmount) : "Pending", color: "text-emerald-600" },
            { label: "Release Date", value: app.releaseDate ? format(new Date(app.releaseDate), "MMM d, yyyy") : "Not Set", color: "text-[#0B1F3A]" },
            { label: "Funds Status", value: app.isReleased ? "Released" : "Held", color: app.isReleased ? "text-emerald-600" : "text-amber-600" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="text-xs text-gray-400 mb-1">{s.label}</div>
              <div className={`font-bold text-lg ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Applicant Info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-[#0B1F3A] mb-4 flex items-center gap-2"><User className="h-5 w-5 text-[#1FA67A]" /> Applicant Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            {[
              ["Client Email", app.userEmail],
              ["Full Name", app.fullName || app.userFullName],
              ["National ID", app.nationalId],
              ["Phone Number", app.phoneNumber],
              ["Employment Status", app.employmentStatus],
              ["Monthly Income", app.monthlyIncome ? formatCurrency(app.monthlyIncome) : "—"],
            ].map(([k, v]) => v ? (
              <div key={k}>
                <div className="text-gray-400">{k}</div>
                <div className="font-medium text-[#0B1F3A] mt-0.5">{String(v)}</div>
              </div>
            ) : null)}
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="text-gray-400 text-sm mb-1">Purpose of Funds</div>
            <div className="text-[#0B1F3A]">{app.purposeOfFunds || "—"}</div>
          </div>
        </div>

        {/* Business Info (if applicable) */}
        {app.businessName && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold text-[#0B1F3A] mb-4 flex items-center gap-2"><Building2 className="h-5 w-5 text-[#1FA67A]" /> Business Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              {[
                ["Business Name", app.businessName],
                ["Registration No.", app.registrationNumber],
                ["KRA PIN", app.kraPin],
                ["Business Type", app.businessType],
                ["Annual Revenue", app.annualRevenue ? formatCurrency(app.annualRevenue) : "—"],
                ["Owner Details", app.ownerDetails],
              ].map(([k, v]) => v ? (
                <div key={k}>
                  <div className="text-gray-400">{k}</div>
                  <div className="font-medium text-[#0B1F3A] mt-0.5">{String(v)}</div>
                </div>
              ) : null)}
            </div>
          </div>
        )}

        {/* Payment Info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-[#0B1F3A] mb-4 flex items-center gap-2"><Wallet className="h-5 w-5 text-[#1FA67A]" /> Payment Information</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {[
              ["Processing Fee (KES)", app.processingFeeKes ? `KES ${parseInt(app.processingFeeKes).toLocaleString()}` : "—"],
              ["Payment Status", app.paymentStatus],
              ["Confirmation Code", app.paymentCode || "—"],
              ["M-Pesa Reference", app.mpesaCheckoutRequestId || "—"],
            ].map(([k, v]) => (
              <div key={k}>
                <div className="text-gray-400">{k}</div>
                <div className="font-medium text-[#0B1F3A] mt-0.5 capitalize">{String(v)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Payout Method */}
        {app.payoutBankName && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold text-[#0B1F3A] mb-4 flex items-center gap-2"><Landmark className="h-5 w-5 text-[#1FA67A]" /> Payout Bank Account</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              {[
                ["Country", app.payoutBankCountry],
                ["Bank Name", app.payoutBankName],
                ["Account Number", app.payoutBankAccountNumber],
                ["Account Name", app.payoutBankAccountName],
                ["SWIFT Code", app.payoutSwiftCode || "—"],
              ].map(([k, v]) => (
                <div key={k}>
                  <div className="text-gray-400">{k}</div>
                  <div className="font-medium text-[#0B1F3A] mt-0.5">{String(v)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Admin Actions */}
        {app.status === "under_review" && !action && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold text-[#0B1F3A] mb-4">Admin Decision</h2>
            <div className="flex gap-3">
              <Button onClick={() => { setAction("approve"); setApprovedAmount(String(app.amountRequested)); }} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">
                <CheckCircle2 className="mr-2 h-4 w-4" /> Approve Application
              </Button>
              <Button onClick={() => setAction("reject")} variant="outline" className="flex-1 border-red-200 text-red-600 hover:bg-red-50">
                <XCircle className="mr-2 h-4 w-4" /> Reject Application
              </Button>
            </div>
          </div>
        )}

        {action === "approve" && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
            <h2 className="font-bold text-[#0B1F3A] mb-4 flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-emerald-600" /> Approve Application</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Approved Amount (USD) *</Label>
                  <Input type="number" value={approvedAmount} onChange={e => setApprovedAmount(e.target.value)} placeholder="Final approved amount" className="mt-1.5 h-11" />
                </div>
                <div>
                  <Label>Fund Release Date *</Label>
                  <Input type="date" value={releaseDate} onChange={e => setReleaseDate(e.target.value)} className="mt-1.5 h-11"
                    min={new Date().toISOString().split("T")[0]} />
                </div>
              </div>
              <div>
                <Label>Approval Note (shown to client) *</Label>
                <Textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Congratulations! Your application has been approved..." rows={3} className="mt-1.5" />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setAction(null)} className="flex-1">Cancel</Button>
                <Button onClick={handleApprove} disabled={loading} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Approval"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {action === "reject" && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
            <h2 className="font-bold text-[#0B1F3A] mb-4 flex items-center gap-2"><XCircle className="h-5 w-5 text-red-600" /> Reject Application</h2>
            <div className="space-y-4">
              <div>
                <Label>Rejection Reason (shown to client) *</Label>
                <Textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Explain why the application cannot be approved at this time..." rows={4} className="mt-1.5" />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setAction(null)} className="flex-1">Cancel</Button>
                <Button onClick={handleReject} disabled={loading} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Rejection"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Release Funds (for approved but unreleased) */}
        {app.status === "approved" && !app.isReleased && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <Clock className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-[#0B1F3A] mb-1">Funds Scheduled for Release</h3>
                <p className="text-amber-700 text-sm mb-4">
                  Scheduled: <strong>{app.releaseDate ? format(new Date(app.releaseDate), "MMMM d, yyyy") : "Date not set"}</strong>.
                  You can manually release funds before the scheduled date.
                </p>
                <Button onClick={handleRelease} disabled={releaseLoading} className="bg-amber-600 hover:bg-amber-700 text-white">
                  {releaseLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Unlock className="h-4 w-4 mr-2" />}
                  Release Funds Now
                </Button>
              </div>
            </div>
          </div>
        )}

        {app.status === "approved" && app.isReleased && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <div>
              <div className="font-semibold text-emerald-800">Funds Released</div>
              <div className="text-sm text-emerald-600">Client can request withdrawal. Available: {formatCurrency(app.availableBalance || 0)}</div>
            </div>
          </div>
        )}

        {/* Admin Comment */}
        {app.adminComment && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold text-[#0B1F3A] mb-2">Admin Note</h2>
            <p className="text-gray-600 italic">"{app.adminComment}"</p>
          </div>
        )}
      </div>
    </div>
  )
}
