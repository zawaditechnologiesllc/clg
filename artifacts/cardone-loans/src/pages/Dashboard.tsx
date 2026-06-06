import { useState } from "react"
import { useGetApplications, useGetNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from "@workspace/api-client-react"
import { ExtendedApplication } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatCurrency } from "@/lib/utils"
import { Link } from "wouter"
import { format } from "date-fns"
import {
  Bell, FileText, PlusCircle, ArrowRight, Loader2, Info, Wallet,
  CheckCircle2, Clock, TrendingUp, DollarSign, X, Landmark, ShieldCheck
} from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { getGetNotificationsQueryKey, getGetApplicationsQueryKey } from "@workspace/api-client-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { apiRequest } from "@/lib/api"

const AFRICAN_COUNTRIES = [
  "Algeria","Angola","Benin","Botswana","Burkina Faso","Burundi","Cabo Verde","Cameroon",
  "Central African Republic","Chad","Comoros","Congo (Brazzaville)","Congo (DRC)","Djibouti",
  "Egypt","Equatorial Guinea","Eritrea","Eswatini","Ethiopia","Gabon","Gambia","Ghana",
  "Guinea","Guinea-Bissau","Ivory Coast","Kenya","Lesotho","Liberia","Libya","Madagascar",
  "Malawi","Mali","Mauritania","Mauritius","Morocco","Mozambique","Namibia","Niger","Nigeria",
  "Rwanda","São Tomé & Príncipe","Senegal","Sierra Leone","Somalia","South Africa",
  "South Sudan","Sudan","Tanzania","Togo","Tunisia","Uganda","Zambia","Zimbabwe",
]

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    approved: { label: "Approved", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    rejected: { label: "Rejected", className: "bg-red-100 text-red-700 border-red-200" },
    under_review: { label: "Under Review", className: "bg-blue-100 text-blue-700 border-blue-200" },
    pending: { label: "Pending Payment", className: "bg-amber-100 text-amber-700 border-amber-200" },
  }
  const s = map[status] || { label: status, className: "bg-gray-100 text-gray-600" }
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${s.className}`}>{s.label}</span>
}

export function UserDashboard() {
  const { data: rawApps, isLoading: appsLoading } = useGetApplications()
  const apps = rawApps as ExtendedApplication[] | undefined
  const { data: notifications, isLoading: notifsLoading } = useGetNotifications()
  const markReadMut = useMarkNotificationRead()
  const markAllMut = useMarkAllNotificationsRead()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null)
  const [withdrawLoading, setWithdrawLoading] = useState(false)
  const [withdrawForm, setWithdrawForm] = useState({
    amount: "", bankCountry: "", bankName: "", bankAccountNumber: "", bankAccountName: "", swiftCode: "",
  })

  const unreadCount = notifications?.filter(n => !n.read).length || 0
  const totalBalance = apps?.reduce((sum, a) => sum + (a.isReleased ? (a.availableBalance || 0) : 0), 0) || 0
  const approvedApps = apps?.filter(a => a.status === "approved") || []
  const pendingCount = apps?.filter(a => a.status === "pending" || a.status === "under_review").length || 0

  const handleRead = (id: number) => {
    markReadMut.mutate({ id }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetNotificationsQueryKey() })
    })
  }

  const handleMarkAllRead = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(markAllMut as any).mutate(undefined, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetNotificationsQueryKey() })
    })
  }

  const openWithdraw = (appId: number) => {
    const app = apps?.find((a: ExtendedApplication) => a.id === appId)
    setSelectedAppId(appId)
    setWithdrawForm(f => ({ ...f, amount: String(app?.availableBalance || "") }))
    setWithdrawOpen(true)
  }

  const handleWithdraw = async () => {
    const { amount, bankCountry, bankName, bankAccountNumber, bankAccountName } = withdrawForm
    if (!amount || !bankCountry || !bankName || !bankAccountNumber || !bankAccountName) {
      toast({ title: "Fill all required fields", variant: "destructive" }); return
    }
    setWithdrawLoading(true)
    try {
      await apiRequest("POST", "/api/withdrawals", {
        applicationId: selectedAppId,
        amount: parseFloat(amount),
        bankCountry: withdrawForm.bankCountry,
        bankName: withdrawForm.bankName,
        bankAccountNumber: withdrawForm.bankAccountNumber,
        bankAccountName: withdrawForm.bankAccountName,
        swiftCode: withdrawForm.swiftCode,
      })
      toast({ title: "Withdrawal submitted!", description: "Our team will process it within 1–3 business days." })
      setWithdrawOpen(false)
      queryClient.invalidateQueries({ queryKey: getGetApplicationsQueryKey() })
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setWithdrawLoading(false)
    }
  }

  if (appsLoading || notifsLoading) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#1FA67A]" /></div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#0B1F3A] text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-display font-bold">Client Dashboard</h1>
              <p className="text-white/60 text-sm mt-1">Manage your applications and funds</p>
            </div>
            <Link href="/apply">
              <Button className="bg-[#D4AF37] hover:bg-[#c49d2f] text-[#0B1F3A] font-bold">
                <PlusCircle className="mr-2 h-4 w-4" /> New Application
              </Button>
            </Link>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-white/50 text-xs mb-1">Available Balance</div>
              <div className="text-2xl font-display font-bold text-[#D4AF37]">{formatCurrency(totalBalance)}</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-white/50 text-xs mb-1">Total Applications</div>
              <div className="text-2xl font-display font-bold">{apps?.length || 0}</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-white/50 text-xs mb-1">Approved</div>
              <div className="text-2xl font-display font-bold text-emerald-400">{approvedApps.length}</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-white/50 text-xs mb-1">Under Review</div>
              <div className="text-2xl font-display font-bold text-amber-400">{pendingCount}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Applications */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-[#0B1F3A] flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#1FA67A]" /> My Applications
            </h2>

            {!apps || apps.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-[#0B1F3A] mb-2">No applications yet</h3>
                <p className="text-gray-400 mb-6">Apply for a grant or loan to access up to $100,000 in funding.</p>
                <Link href="/apply"><Button className="bg-[#0B1F3A] hover:bg-[#0B1F3A]/90">Start Application</Button></Link>
              </div>
            ) : (
              <div className="space-y-4">
                {apps.map(app => (
                  <div key={app.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    {/* Status bar */}
                    {app.status === "approved" && (
                      <div className={`px-6 py-2.5 flex justify-between items-center text-sm font-medium ${app.isReleased ? "bg-emerald-500 text-white" : "bg-amber-50 text-amber-700 border-b border-amber-100"}`}>
                        <div className="flex items-center gap-2">
                          {app.isReleased ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                          {app.isReleased ? "Funds Available for Withdrawal" : `Funds Release: ${app.releaseDate ? format(new Date(app.releaseDate), "MMM d, yyyy") : "Date TBD"}`}
                        </div>
                        {app.isReleased && (app.availableBalance ?? 0) > 0 && (
                          <span className="font-bold">{formatCurrency(app.availableBalance ?? 0)}</span>
                        )}
                      </div>
                    )}
                    <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-500">APP-{app.id}</span>
                          <StatusBadge status={app.status} />
                        </div>
                        <h3 className="text-lg font-bold text-[#0B1F3A] capitalize">{app.category} {app.type}</h3>
                        <div className="text-sm text-gray-400 mt-1">Applied {format(new Date(app.createdAt), "MMM d, yyyy")}</div>
                        {app.status === "approved" && app.approvedAmount && (
                          <div className="mt-2 text-sm">
                            <span className="text-gray-500">Approved: </span>
                            <span className="font-bold text-emerald-600">{formatCurrency(app.approvedAmount)}</span>
                          </div>
                        )}
                        {app.adminComment && (
                          <p className="text-sm text-gray-500 mt-1 italic">"{app.adminComment}"</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-3">
                        <div className="text-right">
                          <div className="text-2xl font-display font-bold text-[#0B1F3A]">{formatCurrency(app.amountRequested)}</div>
                          <div className="text-xs text-gray-400">Requested</div>
                        </div>
                        <div className="flex gap-2">
                          {app.isReleased && (app.availableBalance || 0) > 0 && (
                            <Button size="sm" onClick={() => openWithdraw(app.id)} className="bg-[#1FA67A] hover:bg-[#1FA67A]/90 text-white font-semibold">
                              <Wallet className="mr-1.5 h-4 w-4" /> Withdraw
                            </Button>
                          )}
                          <Link href={`/applications/${app.id}`}>
                            <Button variant="outline" size="sm">
                              Details <ArrowRight className="ml-1.5 h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#0B1F3A] flex items-center gap-2">
                <Bell className="h-5 w-5 text-[#1FA67A]" /> Notifications
                {unreadCount > 0 && <span className="ml-1 text-xs font-bold bg-red-500 text-white rounded-full px-2 py-0.5">{unreadCount}</span>}
              </h2>
              {unreadCount > 0 && (
                <button onClick={handleMarkAllRead} className="text-xs text-[#1FA67A] hover:underline">Mark all read</button>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {!notifications || notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                  {[...notifications].reverse().map(n => (
                    <div key={n.id}
                      className={`p-4 cursor-pointer transition-colors ${!n.read ? "bg-blue-50 hover:bg-blue-100/50" : "hover:bg-gray-50"}`}
                      onClick={() => !n.read && handleRead(n.id)}>
                      <div className="flex gap-3">
                        <div className="shrink-0 mt-0.5">
                          {n.read
                            ? <Info className="h-4 w-4 text-gray-300" />
                            : <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />}
                        </div>
                        <div>
                          <p className={`text-sm leading-relaxed ${!n.read ? "font-medium text-[#0B1F3A]" : "text-gray-500"}`}>{n.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{format(new Date(n.createdAt), "MMM d, h:mm a")}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Withdraw Dialog */}
      <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#0B1F3A] flex items-center gap-2">
              <Wallet className="h-5 w-5 text-[#1FA67A]" /> Request Withdrawal
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {selectedAppId && (() => {
              const app = apps?.find((a: ExtendedApplication) => a.id === selectedAppId)
              return app ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-emerald-700">Available Balance</span>
                    <span className="font-bold text-emerald-700">{formatCurrency(app.availableBalance || 0)}</span>
                  </div>
                </div>
              ) : null
            })()}
            <div>
              <Label>Withdrawal Amount (USD)</Label>
              <Input value={withdrawForm.amount} onChange={e => setWithdrawForm(f => ({ ...f, amount: e.target.value }))}
                type="number" placeholder="Amount to withdraw" className="mt-1.5 h-11" />
            </div>
            <div className="border-t pt-4">
              <p className="text-sm font-semibold text-[#0B1F3A] mb-3 flex items-center gap-2">
                <Landmark className="h-4 w-4" /> Destination Bank Account
              </p>
              <div className="space-y-3">
                <div>
                  <Label>Bank Country</Label>
                  <Select onValueChange={v => setWithdrawForm(f => ({ ...f, bankCountry: v }))}>
                    <SelectTrigger className="mt-1.5 h-10"><SelectValue placeholder="Select country" /></SelectTrigger>
                    <SelectContent className="max-h-48">{AFRICAN_COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Bank Name</Label>
                  <Input value={withdrawForm.bankName} onChange={e => setWithdrawForm(f => ({ ...f, bankName: e.target.value }))} placeholder="e.g. Equity Bank" className="mt-1.5 h-10" />
                </div>
                <div>
                  <Label>Account Number</Label>
                  <Input value={withdrawForm.bankAccountNumber} onChange={e => setWithdrawForm(f => ({ ...f, bankAccountNumber: e.target.value }))} placeholder="Bank account number" className="mt-1.5 h-10" />
                </div>
                <div>
                  <Label>Account Holder Name</Label>
                  <Input value={withdrawForm.bankAccountName} onChange={e => setWithdrawForm(f => ({ ...f, bankAccountName: e.target.value }))} placeholder="Name on account" className="mt-1.5 h-10" />
                </div>
                <div>
                  <Label>SWIFT Code <span className="text-gray-400 font-normal">(optional)</span></Label>
                  <Input value={withdrawForm.swiftCode} onChange={e => setWithdrawForm(f => ({ ...f, swiftCode: e.target.value }))} placeholder="e.g. EQBLKENA" className="mt-1.5 h-10" />
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
              <ShieldCheck className="h-4 w-4 shrink-0 text-gray-400 mt-0.5" />
              Withdrawal requests are reviewed within 1–3 business days. Funds are transferred directly to your bank.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWithdrawOpen(false)}>Cancel</Button>
            <Button onClick={handleWithdraw} disabled={withdrawLoading} className="bg-[#1FA67A] hover:bg-[#1FA67A]/90 text-white">
              {withdrawLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Withdrawal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
