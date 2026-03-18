import { useState } from "react"
import { useAdminGetStats } from "@workspace/api-client-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { Link } from "wouter"
import { format } from "date-fns"
import { Loader2, Users, FileText, DollarSign, Activity, CheckCircle, Clock, XCircle } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export function AdminDashboard() {
  const { data: stats, isLoading } = useAdminGetStats()

  if (isLoading) return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
  if (!stats) return null

  const chartData = [
    { name: 'Pending', count: stats.pendingApplications, fill: 'hsl(var(--warning))' },
    { name: 'Review', count: stats.underReviewApplications, fill: 'hsl(var(--secondary))' },
    { name: 'Approved', count: stats.approvedApplications, fill: 'hsl(var(--success))' },
    { name: 'Rejected', count: stats.rejectedApplications, fill: 'hsl(var(--destructive))' },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold">Admin Portal</h1>
        <p className="text-muted-foreground">Overview of all platform activity and underwriting queue.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-primary text-primary-foreground border-none">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-primary-foreground/70 text-sm font-medium mb-1">Total Volume</p>
                <h3 className="text-3xl font-display font-bold">{stats.totalApplications}</h3>
              </div>
              <div className="p-2 bg-white/10 rounded-lg"><FileText className="h-5 w-5" /></div>
            </div>
            <div className="mt-4 flex gap-4 text-sm text-primary-foreground/80 border-t border-white/10 pt-4">
              <span>{stats.totalLoans} Loans</span>
              <span>{stats.totalGrants} Grants</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-muted-foreground text-sm font-medium mb-1">Needs Review</p>
                <h3 className="text-3xl font-display font-bold text-warning-foreground">{stats.pendingApplications}</h3>
              </div>
              <div className="p-2 bg-warning/20 rounded-lg"><Clock className="h-5 w-5 text-warning-foreground" /></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-muted-foreground text-sm font-medium mb-1">Approved</p>
                <h3 className="text-3xl font-display font-bold text-success">{stats.approvedApplications}</h3>
              </div>
              <div className="p-2 bg-success/20 rounded-lg"><CheckCircle className="h-5 w-5 text-success" /></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-muted-foreground text-sm font-medium mb-1">Rejected</p>
                <h3 className="text-3xl font-display font-bold text-destructive">{stats.rejectedApplications}</h3>
              </div>
              <div className="p-2 bg-destructive/20 rounded-lg"><XCircle className="h-5 w-5 text-destructive" /></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Chart */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Applications Table */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Applications Queue</CardTitle>
            <Button variant="outline" size="sm">View All</Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground font-medium border-y border-border">
                  <tr>
                    <th className="px-6 py-3">ID / Date</th>
                    <th className="px-6 py-3">Applicant</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Amount</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {stats.recentApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-mono font-medium text-foreground">APP-{app.id}</div>
                        <div className="text-xs text-muted-foreground">{format(new Date(app.createdAt), 'MMM d, yy')}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium">{app.userFullName}</div>
                        <div className="text-xs text-muted-foreground">{app.userEmail}</div>
                      </td>
                      <td className="px-6 py-4 capitalize font-medium">
                        {app.category} {app.type}
                      </td>
                      <td className="px-6 py-4 font-bold">
                        {formatCurrency(app.amountRequested)}
                      </td>
                      <td className="px-6 py-4">
                         {app.status === 'pending' && <Badge variant="warning">Pending</Badge>}
                         {app.status === 'under_review' && <Badge variant="secondary">Reviewing</Badge>}
                         {app.status === 'approved' && <Badge variant="success">Approved</Badge>}
                         {app.status === 'rejected' && <Badge variant="destructive">Rejected</Badge>}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/admin/applications/${app.id}`}>
                          <Button size="sm" variant="outline">Review</Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {stats.recentApplications.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">No recent applications found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
