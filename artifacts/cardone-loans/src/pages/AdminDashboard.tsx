import { useState } from "react"
import { Link } from "wouter"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { format } from "date-fns"
import {
  Loader2, Users, FileText, DollarSign, CheckCircle, Clock, XCircle,
  TrendingUp, Wallet, AlertCircle, ArrowRight, RefreshCw, ShieldCheck,
  CreditCard, Eye
} from "lucide-react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { apiRequest } from "@/lib/api"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

type AdminTab = "overview" | "applications" | "payments" | "withdrawals"

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    approved: "bg-emerald-100 text-emerald-700",
    rejected: "bg-red-100 text-red-700",
    under_review: "bg-blue-100 text-blue-700",
    pending: "bg-amber-100 text-amber-700",
  }
  const labels: Record<string, string> = { approved: "Approved", rejected: "Rejected", under_review: "Under Review", pending: "Pending" }
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${map[status] || "bg-gray-100 text-gray-600"}`}>{labels[status] || status}</span>
}

function PaymentBadge({ status }: { status: string | null }) {
  if (!status || status === "pending") return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">Awaiting Payment</span>
  if (status === "processing") return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">Processing</span>
  if (status === "completed") return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">Payment Verified</span>
  if (status === "failed") return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">Payment Failed</span>
  return null
}

function WithdrawalBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    approved: "bg-emerald-100 text-emerald-700",
    rejected: "bg-red-100 text-red-700",
    completed: "bg-gray-100 text-gray-600",
  }
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${map[status] || "bg-gray-100"}`}>{status}</span>
}

export function AdminDashboard() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<AdminTab>("overview")
  const [appFilter, setAppFilter] = useState("")
  const [wAction, setWAction] = useState<{ id: number; type: "approve" | "reject" } | null>(null)
  const [wComment, setWComment] = useState("")
  const [wLoading, setWLoading] = useState(false)
  const [payAction, setPayAction] = useState<{ id: number; type: "approve" | "reject" } | null>(null)
  const [payComment, setPayComment] = useState("")
  const [payLoading, setPayLoading] = useState(false)

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => apiRequest("GET", "/api/admin/stats"),
  })

  const { data: apps, isLoading: appsLoading, refetch: refetchApps } = useQuery({
    queryKey: ["admin-applications", appFilter],
    queryFn: () => apiRequest("GET", `/api/admin/applications${appFilter ? `?status=${appFilter}` : ""}`),
    enabled: activeTab === "applications",
  })

  const { data: payments, isLoading: paymentsLoading, refetch: refetchPayments } = useQuery({
    queryKey: ["admin-payments"],
    queryFn: () => apiRequest("GET", "/api/admin/payments"),
    enabled: activeTab === "payments",
  })

  const { data: withdrawals, isLoading: wLoading2, refetch: refetchWithdrawals } = useQuery({
    queryKey: ["admin-withdrawals"],
    queryFn: () => apiRequest("GET", "/api/admin/withdrawals"),
    enabled: activeTab === "withdrawals",
  })

  const handleWithdrawal = async (id: number, type: "approve" | "reject") => {
    if (type === "reject" && !wComment.trim()) {
      toast({ title: "Enter rejection reason", variant: "destructive" }); return
    }
    setWLoading(true)
    try {
      await apiRequest("POST", `/api/admin/withdrawals/${id}/${type}`, { comment: wComment, reason: wComment })
      toast({ title: `Withdrawal ${type}d`, description: "Client has been notified." })
      setWAction(null); setWComment("")
      refetchWithdrawals()
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally { setWLoading(false) }
  }

  const handlePaymentVerify = async (id: number, action: "approve" | "reject") => {
    if (action === "reject" && !payComment.trim()) {
      toast({ title: "Enter rejection reason", variant: "destructive" }); return
    }
    setPayLoading(true)
    try {
      await apiRequest("POST", `/api/admin/payments/${id}/verify`, { action, comment: payComment })
      toast({
        title: action === "approve" ? "Payment Verified" : "Payment Rejected",
        description: action === "approve" ? "Application moved to Under Review." : "Client notified of rejected payment.",
      })
      setPayAction(null); setPayComment("")
      refetchPayments()
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] })
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally { setPayLoading(false) }
  }

  const chartData = stats ? [
    { name: "Pending",  count: stats.pendingApplications,      fill: "#D4AF37" },
    { name: "Review",   count: stats.underReviewApplications,  fill: "#3B82F6" },
    { name: "Approved", count: stats.approvedApplications,     fill: "#1FA67A" },
    { name: "Rejected", count: stats.rejectedApplications,     fill: "#EF4444" },
  ] : []

  // Unverified payments count for badge
  const unverifiedPayments = payments?.filter((p: any) => p.paymentCode && p.paymentStatus !== "completed" && p.paymentStatus !== "failed").length ?? 0

  if (statsLoading) return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#1FA67A]" /></div>

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#0B1F3A] text-white px-4 py-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-2xl font-display font-bold mb-6">Admin Control Panel</h1>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: "Total Applications", value: stats?.totalApplications || 0, icon: <FileText className="h-5 w-5" />, color: "bg-white/10" },
              { label: "Pending Review", value: (stats?.pendingApplications || 0) + (stats?.underReviewApplications || 0), icon: <Clock className="h-5 w-5 text-amber-400" />, color: "bg-amber-500/20" },
              { label: "Approved", value: stats?.approvedApplications || 0, icon: <CheckCircle className="h-5 w-5 text-emerald-400" />, color: "bg-emerald-500/20" },
              { label: "Total Deployed", value: formatCurrency(stats?.totalApprovedAmount || 0), icon: <DollarSign className="h-5 w-5 text-[#D4AF37]" />, color: "bg-[#D4AF37]/20" },
              { label: "Pending Withdrawals", value: stats?.pendingWithdrawals || 0, icon: <Wallet className="h-5 w-5 text-red-400" />, color: "bg-red-500/20" },
            ].map(s => (
              <div key={s.label} className={`${s.color} rounded-xl p-4`}>
                <div className="flex items-center gap-2 mb-2">{s.icon}<span className="text-white/60 text-xs">{s.label}</span></div>
                <div className="text-2xl font-display font-bold text-white">{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b bg-white sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex gap-0 overflow-x-auto">
            {(["overview", "applications", "payments", "withdrawals"] as AdminTab[]).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-5 py-4 text-sm font-semibold capitalize border-b-2 whitespace-nowrap transition-colors relative ${activeTab === tab ? "border-[#1FA67A] text-[#1FA67A]" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                {tab}
                {tab === "withdrawals" && (stats?.pendingWithdrawals || 0) > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-1.5">{stats.pendingWithdrawals}</span>
                )}
                {tab === "payments" && unverifiedPayments > 0 && (
                  <span className="ml-2 bg-amber-500 text-white text-xs rounded-full px-1.5">{unverifiedPayments}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">

        {/* ── Overview ── */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-[#0B1F3A] mb-4">Application Status Distribution</h2>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, i) => <rect key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-[#0B1F3A] mb-4">Recent Applications</h2>
              <div className="space-y-3">
                {stats?.recentApplications?.slice(0, 6).map((app: any) => (
                  <Link key={app.id} href={`/admin/applications/${app.id}`}>
                    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 font-mono">APP-{app.id}</span>
                          <StatusBadge status={app.status} />
                        </div>
                        <div className="text-sm font-medium text-[#0B1F3A] capitalize mt-0.5">{app.userFullName} · {app.category} {app.type}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-[#0B1F3A] text-sm">{formatCurrency(app.amountRequested)}</div>
                        <div className="text-xs text-gray-400">{format(new Date(app.createdAt), "MMM d")}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <button onClick={() => setActiveTab("applications")} className="mt-4 w-full text-sm text-[#1FA67A] hover:underline font-medium">
                View all applications →
              </button>
            </div>
          </div>
        )}

        {/* ── Applications ── */}
        {activeTab === "applications" && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-lg font-bold text-[#0B1F3A]">All Applications</h2>
              <div className="flex flex-wrap gap-2">
                {["", "pending", "under_review", "approved", "rejected"].map(f => (
                  <button key={f} onClick={() => setAppFilter(f)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${appFilter === f ? "bg-[#0B1F3A] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                    {f === "" ? "All" : f.replace("_", " ")}
                  </button>
                ))}
                <button onClick={() => refetchApps()} className="p-1.5 rounded-full hover:bg-gray-100"><RefreshCw className="h-4 w-4 text-gray-400" /></button>
              </div>
            </div>
            {appsLoading ? (
              <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-[#1FA67A]" /></div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        {["ID", "Client", "Product", "Amount (USD)", "Approved", "Payment", "Status", "Date", "Action"].map(h =>
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>)}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {apps?.map((app: any) => (
                        <tr key={app.id} className="hover:bg-gray-50/50">
                          <td className="px-4 py-3 font-mono text-xs text-gray-400">APP-{app.id}</td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-[#0B1F3A]">{app.userFullName || app.fullName}</div>
                            <div className="text-xs text-gray-400">{app.userEmail}</div>
                          </td>
                          <td className="px-4 py-3 capitalize text-gray-600 text-xs">{app.category} {app.type}</td>
                          <td className="px-4 py-3 font-semibold text-sm">{formatCurrency(app.amountRequested)}</td>
                          <td className="px-4 py-3">{app.approvedAmount ? <span className="text-emerald-600 font-semibold text-sm">{formatCurrency(app.approvedAmount)}</span> : <span className="text-gray-300">—</span>}</td>
                          <td className="px-4 py-3"><PaymentBadge status={app.paymentStatus} /></td>
                          <td className="px-4 py-3"><StatusBadge status={app.status} /></td>
                          <td className="px-4 py-3 text-gray-400 text-xs">{format(new Date(app.createdAt), "MMM d, yyyy")}</td>
                          <td className="px-4 py-3">
                            <Link href={`/admin/applications/${app.id}`}>
                              <Button size="sm" variant="outline" className="h-7 text-xs">Review <ArrowRight className="h-3 w-3 ml-1" /></Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {apps?.length === 0 && <div className="p-8 text-center text-gray-400">No applications found.</div>}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Payments ── */}
        {activeTab === "payments" && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-[#0B1F3A]">Payment Submissions</h2>
                <p className="text-sm text-gray-500 mt-1">Review and verify M-Pesa processing fee payments submitted by applicants.</p>
              </div>
              <button onClick={() => refetchPayments()} className="p-2 rounded-full hover:bg-gray-100 self-start sm:self-auto"><RefreshCw className="h-4 w-4 text-gray-400" /></button>
            </div>

            {paymentsLoading ? (
              <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-[#1FA67A]" /></div>
            ) : (
              <div className="space-y-4">
                {payments?.map((app: any) => {
                  const needsReview = app.paymentCode && app.paymentStatus !== "completed" && app.paymentStatus !== "failed"
                  return (
                    <div key={app.id} className={`bg-white rounded-2xl border overflow-hidden transition-all ${needsReview ? "border-amber-200 shadow-sm shadow-amber-100" : "border-gray-100"}`}>
                      {needsReview && (
                        <div className="bg-amber-50 border-b border-amber-100 px-6 py-2 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-amber-500" />
                          <span className="text-amber-700 text-xs font-semibold">Awaiting Admin Payment Verification</span>
                        </div>
                      )}
                      <div className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-3">
                              <span className="font-mono text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">APP-{app.id}</span>
                              <PaymentBadge status={app.paymentStatus} />
                              <StatusBadge status={app.status} />
                            </div>
                            <div className="font-bold text-[#0B1F3A] text-lg">{app.userFullName}</div>
                            <div className="text-sm text-gray-400 mb-4">{app.userEmail}</div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-2 text-sm mb-4">
                              <div><span className="text-gray-400">Product: </span><span className="font-medium capitalize">{app.category} {app.type}</span></div>
                              <div><span className="text-gray-400">Requested: </span><span className="font-semibold">{formatCurrency(app.amountRequested)} USD</span></div>
                              <div><span className="text-gray-400">Processing Fee: </span><span className="font-semibold">KES {app.processingFeeKes ? Number(app.processingFeeKes).toLocaleString() : "—"}</span></div>
                              <div><span className="text-gray-400">Submitted: </span><span className="font-medium">{format(new Date(app.createdAt), "MMM d, yyyy")}</span></div>
                              {app.paymentCode && (
                                <div className="col-span-2">
                                  <span className="text-gray-400">M-Pesa Code: </span>
                                  <span className="font-mono font-bold text-[#0B1F3A] bg-gray-100 px-2 py-0.5 rounded text-sm">{app.paymentCode}</span>
                                </div>
                              )}
                              {app.mpesaCheckoutRequestId && (
                                <div className="col-span-2 sm:col-span-1">
                                  <span className="text-gray-400 text-xs">STK Request ID: </span>
                                  <span className="font-mono text-xs text-gray-600">{app.mpesaCheckoutRequestId}</span>
                                </div>
                              )}
                            </div>

                            {app.adminComment && app.paymentStatus === "failed" && (
                              <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-sm text-red-700 mt-2">
                                <strong>Rejection note:</strong> {app.adminComment}
                              </div>
                            )}
                          </div>

                          <div className="shrink-0 text-right">
                            <Link href={`/admin/applications/${app.id}`}>
                              <Button size="sm" variant="outline" className="mb-3 h-8 text-xs w-full sm:w-auto">
                                <Eye className="h-3 w-3 mr-1" /> Full Detail
                              </Button>
                            </Link>
                            {needsReview && (
                              <div className="flex flex-col gap-2 mt-1">
                                <Button size="sm"
                                  onClick={() => handlePaymentVerify(app.id, "approve")}
                                  disabled={payLoading && payAction?.id === app.id}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs w-full">
                                  {payLoading && payAction !== null && payAction.id === app.id && payAction.type === "approve"
                                    ? <Loader2 className="h-3 w-3 animate-spin" />
                                    : <><ShieldCheck className="h-3 w-3 mr-1" />Verify Payment</>}
                                </Button>
                                <Button size="sm" variant="outline"
                                  onClick={() => { setPayAction({ id: app.id, type: "reject" }); setPayComment("") }}
                                  className="border-red-200 text-red-600 hover:bg-red-50 h-8 text-xs w-full">
                                  Reject Payment
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Rejection input inline */}
                        {payAction !== null && payAction.id === app.id && payAction.type === "reject" && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <p className="text-sm font-medium text-gray-700 mb-2">Reason for payment rejection (sent to client):</p>
                            <input value={payComment} onChange={e => setPayComment(e.target.value)}
                              placeholder="e.g. Confirmation code not found in M-Pesa records..."
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-red-200" />
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => setPayAction(null)}>Cancel</Button>
                              <Button size="sm" disabled={payLoading}
                                onClick={() => handlePaymentVerify(app.id, "reject")}
                                className="bg-red-600 hover:bg-red-700 text-white">
                                {payLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Confirm Reject"}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {payments?.length === 0 && (
                  <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
                    <CreditCard className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No payment submissions yet.</p>
                    <p className="text-sm mt-1">Payments appear here once applicants submit their M-Pesa confirmation codes.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Withdrawals ── */}
        {activeTab === "withdrawals" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-[#0B1F3A]">Withdrawal Requests</h2>
                <p className="text-sm text-gray-500 mt-1">Review and process client fund withdrawal requests.</p>
              </div>
              <button onClick={() => refetchWithdrawals()} className="p-2 rounded-full hover:bg-gray-100"><RefreshCw className="h-4 w-4 text-gray-400" /></button>
            </div>
            {wLoading2 ? (
              <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-[#1FA67A]" /></div>
            ) : (
              <div className="space-y-4">
                {withdrawals?.map((w: any) => (
                  <div key={w.id} className={`bg-white rounded-2xl border p-6 ${w.status === "pending" ? "border-amber-200" : "border-gray-100"}`}>
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-mono text-xs text-gray-400">WD-{w.id}</span>
                          <WithdrawalBadge status={w.status} />
                        </div>
                        <div className="font-bold text-[#0B1F3A]">{w.userFullName}</div>
                        <div className="text-sm text-gray-400 mb-3">{w.userEmail}</div>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
                          <div><span className="text-gray-400">Bank: </span><span className="font-medium">{w.bankName}</span></div>
                          <div><span className="text-gray-400">Country: </span><span className="font-medium">{w.bankCountry}</span></div>
                          <div><span className="text-gray-400">Account No: </span><span className="font-medium">{w.bankAccountNumber}</span></div>
                          <div><span className="text-gray-400">Account Name: </span><span className="font-medium">{w.bankAccountName}</span></div>
                          {w.swiftCode && <div><span className="text-gray-400">SWIFT: </span><span className="font-medium">{w.swiftCode}</span></div>}
                        </div>
                        <div className="text-xs text-gray-400 mt-2">Requested {format(new Date(w.createdAt), "MMM d, yyyy h:mm a")}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-3xl font-display font-bold text-[#0B1F3A]">{formatCurrency(w.amount)}</div>
                        <div className="text-xs text-gray-400 mb-4">USD · APP-{w.applicationId}</div>
                        {w.status === "pending" && (
                          <div className="flex gap-2 justify-end">
                            <Button size="sm" onClick={() => handleWithdrawal(w.id, "approve")} disabled={wLoading}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white">
                              {wLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Approve"}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setWAction({ id: w.id, type: "reject" })}
                              className="border-red-200 text-red-600 hover:bg-red-50">
                              Reject
                            </Button>
                          </div>
                        )}
                        {w.adminComment && <p className="text-xs text-gray-400 mt-2 italic max-w-xs text-right">{w.adminComment}</p>}
                      </div>
                    </div>
                    {wAction !== null && wAction.id === w.id && wAction.type === "reject" && (
                      <div className="mt-4 pt-4 border-t">
                        <input value={wComment} onChange={e => setWComment(e.target.value)}
                          placeholder="Reason for rejection..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-red-200" />
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setWAction(null)}>Cancel</Button>
                          <Button size="sm" onClick={() => handleWithdrawal(w.id, "reject")} disabled={wLoading}
                            className="bg-red-600 hover:bg-red-700 text-white">
                            {wLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Confirm Reject"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {withdrawals?.length === 0 && (
                  <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
                    <Wallet className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No withdrawal requests yet.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
