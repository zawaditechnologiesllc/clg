import { useGetApplications, useGetNotifications, useMarkNotificationRead } from "@workspace/api-client-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { Link } from "wouter"
import { format } from "date-fns"
import { Bell, FileText, PlusCircle, ArrowRight, Loader2, Info } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { getGetNotificationsQueryKey } from "@workspace/api-client-react"

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'approved': return <Badge variant="success">Approved</Badge>
    case 'rejected': return <Badge variant="destructive">Rejected</Badge>
    case 'under_review': return <Badge variant="secondary">Under Review</Badge>
    default: return <Badge variant="warning">Pending</Badge>
  }
}

export function UserDashboard() {
  const { data: apps, isLoading: appsLoading } = useGetApplications()
  const { data: notifications, isLoading: notifsLoading } = useGetNotifications()
  const markReadMut = useMarkNotificationRead()
  const queryClient = useQueryClient()

  const unreadCount = notifications?.filter(n => !n.read).length || 0

  const handleRead = (id: number) => {
    markReadMut.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetNotificationsQueryKey() })
      }
    })
  }

  if (appsLoading || notifsLoading) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Client Dashboard</h1>
          <p className="text-muted-foreground">Manage your applications and notifications</p>
        </div>
        <Link href="/apply">
          <Button variant="accent">
            <PlusCircle className="mr-2 h-4 w-4" /> New Application
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Applications */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" /> My Applications
          </h2>

          {!apps || apps.length === 0 ? (
            <Card className="bg-muted/30 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
                <p className="text-muted-foreground mb-6 max-w-sm">Start your first application to get access to our targeted financial products.</p>
                <Link href="/apply">
                  <Button>Start Application</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {apps.map(app => (
                <Card key={app.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  {app.type === 'loan' && app.status !== 'rejected' && (
                    <div className="bg-accent/10 px-6 py-2 border-b border-accent/20 flex justify-between items-center">
                      <span className="text-xs font-bold text-accent-foreground tracking-wider uppercase">Pre-approval Status Active</span>
                      <span className="text-sm font-bold text-primary">{formatCurrency(app.amountRequested * 0.65)} Guarantee</span>
                    </div>
                  )}
                  <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground">APP-{app.id}</span>
                        <StatusBadge status={app.status} />
                      </div>
                      <h3 className="text-lg font-bold capitalize">{app.category} {app.type}</h3>
                      <div className="text-sm text-muted-foreground mt-1">
                        Applied on {format(new Date(app.createdAt), 'MMM d, yyyy')}
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:items-end gap-2">
                      <div className="text-2xl font-display font-bold text-foreground">
                        {formatCurrency(app.amountRequested)}
                      </div>
                      <Link href={`/applications/${app.id}`}>
                        <Button variant="outline" size="sm" className="w-full sm:w-auto">
                          View Details <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar - Notifications */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" /> Notifications
            </h2>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="rounded-full px-2">{unreadCount} new</Badge>
            )}
          </div>

          <Card>
            <CardContent className="p-0 divide-y divide-border">
              {!notifications || notifications.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground text-sm">
                  You're all caught up!
                </div>
              ) : (
                notifications.map(n => (
                  <div 
                    key={n.id} 
                    className={`p-4 transition-colors ${!n.read ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-muted/50'}`}
                    onClick={() => !n.read && handleRead(n.id)}
                  >
                    <div className="flex gap-3">
                      <div className="mt-0.5 shrink-0">
                        {n.read ? (
                          <Info className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <div className="relative">
                            <Bell className="h-5 w-5 text-primary" />
                            <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-destructive"></span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className={`text-sm ${!n.read ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                          {n.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(n.createdAt), 'MMM d, h:mm a')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
