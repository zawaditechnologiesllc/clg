import { Link, useLocation } from "wouter"
import { Button } from "@/components/ui/button"
import { useGetMe, useLogout } from "@workspace/api-client-react"
import { Menu, X, ChevronDown } from "lucide-react"
import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { getGetMeQueryKey } from "@workspace/api-client-react"

export function Navbar() {
  const [location, setLocation] = useLocation()
  const { data: user, isLoading } = useGetMe()
  const logoutMutation = useLogout()
  const queryClient = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() })
        queryClient.clear()
        setLocation("/")
      }
    })
  }

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#0B1F3A] border-b border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#D4AF37] flex items-center justify-center">
              <span className="text-[#0B1F3A] font-bold text-lg font-display">C</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-white font-display font-bold text-base tracking-tight">Cardone</span>
              <span className="text-white/40 text-xs">Loans & Grants</span>
            </div>
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-8">
            <a href="/#products" className="text-white/60 hover:text-white text-sm font-medium transition-colors">Products</a>
            <a href="/#how-it-works" className="text-white/60 hover:text-white text-sm font-medium transition-colors">How It Works</a>
            <a href="/#faq" className="text-white/60 hover:text-white text-sm font-medium transition-colors">FAQ</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isLoading ? (
              <div className="h-9 w-32 rounded-lg bg-white/10 animate-pulse" />
            ) : user ? (
              <>
                <Link href={user.role === "admin" ? "/admin" : "/dashboard"}>
                  <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">
                    {user.role === "admin" ? "Admin Panel" : "My Dashboard"}
                  </Button>
                </Link>
                {user.role !== "admin" && (
                  <Link href="/apply">
                    <Button size="sm" className="bg-[#D4AF37] hover:bg-[#c49d2f] text-[#0B1F3A] font-bold">Apply Now</Button>
                  </Link>
                )}
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-white/40 hover:text-white hover:bg-white/10">
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-[#D4AF37] hover:bg-[#c49d2f] text-[#0B1F3A] font-bold">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10">
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-[#0B1F3A] border-t border-white/10 px-4 pb-4">
          <div className="pt-3 space-y-1">
            {[["/#products", "Products"], ["/#how-it-works", "How It Works"], ["/#faq", "FAQ"]].map(([h, l]) => (
              <a key={h} href={h} onClick={() => setIsOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 text-sm font-medium">{l}</a>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
            {user ? (
              <>
                <Link href={user.role === "admin" ? "/admin" : "/dashboard"} onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10">
                    {user.role === "admin" ? "Admin Panel" : "My Dashboard"}
                  </Button>
                </Link>
                {user.role !== "admin" && (
                  <Link href="/apply" onClick={() => setIsOpen(false)}>
                    <Button className="w-full bg-[#D4AF37] hover:bg-[#c49d2f] text-[#0B1F3A] font-bold">Apply Now</Button>
                  </Link>
                )}
                <Button variant="ghost" onClick={() => { handleLogout(); setIsOpen(false) }}
                  className="w-full justify-start text-white/40 hover:text-white hover:bg-white/10">Sign Out</Button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full text-white/70 hover:text-white hover:bg-white/10">Sign In</Button>
                </Link>
                <Link href="/register" onClick={() => setIsOpen(false)}>
                  <Button className="w-full bg-[#D4AF37] hover:bg-[#c49d2f] text-[#0B1F3A] font-bold">Create Account</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
