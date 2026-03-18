import { Link, useLocation } from "wouter"
import { Button } from "@/components/ui/button"
import { useGetMe, useLogout } from "@workspace/api-client-react"
import { Building2, Menu, X, Bell } from "lucide-react"
import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { getGetMeQueryKey } from "@workspace/api-client-react"

export function Navbar() {
  const [location, setLocation] = useLocation()
  const { data: user, isLoading } = useGetMe()
  const logoutMutation = useLogout()
  const queryClient = useQueryClient()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() })
        setLocation("/")
      }
    })
  }

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)
  
  const closeMenu = () => setIsMobileMenuOpen(false)

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <div className="flex shrink-0 items-center">
            <Link href="/" onClick={closeMenu} className="flex items-center gap-2 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                <Building2 className="h-6 w-6" />
              </div>
              <span className="font-display text-xl font-bold tracking-tight text-primary">
                Cardone <span className="text-accent">Finance</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <Link href="/#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">How it works</Link>
            <Link href="/#products" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Products</Link>
            <Link href="/#faq" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">FAQ</Link>
            
            {isLoading ? (
              <div className="h-10 w-24 animate-pulse rounded-xl bg-muted"></div>
            ) : user ? (
              <div className="flex items-center gap-4">
                <Link href={user.role === 'admin' ? "/admin" : "/dashboard"} className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                  {user.role === 'admin' ? "Admin Panel" : "Dashboard"}
                </Link>
                <Button variant="outline" onClick={handleLogout} className="border-border">
                  Log out
                </Button>
                <Link href="/apply" className="inline-block">
                  <Button variant="accent">Apply Now</Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                  Log in
                </Link>
                <Link href="/register" className="inline-block">
                  <Button>Get Started</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden glass border-b border-border absolute w-full left-0 top-20 shadow-xl">
          <div className="space-y-1 px-4 pb-6 pt-2">
            <Link href="/#how-it-works" onClick={closeMenu} className="block rounded-lg px-3 py-2 text-base font-medium text-foreground hover:bg-muted">How it works</Link>
            <Link href="/#products" onClick={closeMenu} className="block rounded-lg px-3 py-2 text-base font-medium text-foreground hover:bg-muted">Products</Link>
            <Link href="/#faq" onClick={closeMenu} className="block rounded-lg px-3 py-2 text-base font-medium text-foreground hover:bg-muted">FAQ</Link>
            
            <div className="mt-4 pt-4 border-t border-border">
              {user ? (
                <div className="flex flex-col gap-3">
                  <Link href={user.role === 'admin' ? "/admin" : "/dashboard"} onClick={closeMenu} className="block rounded-lg px-3 py-2 text-base font-medium text-primary hover:bg-muted">
                    {user.role === 'admin' ? "Admin Panel" : "Dashboard"}
                  </Link>
                  <Button variant="outline" className="w-full justify-center" onClick={() => { handleLogout(); closeMenu(); }}>
                    Log out
                  </Button>
                  <Link href="/apply" onClick={closeMenu} className="block w-full">
                    <Button variant="accent" className="w-full">Apply Now</Button>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link href="/login" onClick={closeMenu} className="block">
                    <Button variant="outline" className="w-full">Log in</Button>
                  </Link>
                  <Link href="/register" onClick={closeMenu} className="block">
                    <Button className="w-full">Get Started</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
