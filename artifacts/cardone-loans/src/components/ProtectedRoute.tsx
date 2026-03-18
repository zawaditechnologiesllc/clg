import { useGetMe } from "@workspace/api-client-react"
import { useLocation } from "wouter"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { data: user, isLoading, error } = useGetMe({
    query: {
      retry: false
    }
  })
  const [, setLocation] = useLocation()

  useEffect(() => {
    if (!isLoading) {
      if (error || !user) {
        setLocation("/login")
      } else if (requireAdmin && user.role !== 'admin') {
        setLocation("/dashboard")
      }
    }
  }, [user, isLoading, error, setLocation, requireAdmin])

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-medium animate-pulse">Authenticating...</p>
      </div>
    )
  }

  if (error || !user || (requireAdmin && user.role !== 'admin')) {
    return null
  }

  return <>{children}</>
}
