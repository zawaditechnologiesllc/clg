import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Layout
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Pages
import Home from "@/pages/Home";
import { Login, Register } from "@/pages/Auth";
import { Apply } from "@/pages/Apply";
import { UserDashboard } from "@/pages/Dashboard";
import { ApplicationDetail } from "@/pages/ApplicationDetail";
import { AdminDashboard } from "@/pages/AdminDashboard";
import { AdminApplicationDetail } from "@/pages/AdminApplicationDetail";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          
          {/* Protected User Routes */}
          <Route path="/apply">
            {() => (
              <ProtectedRoute>
                <Apply />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/dashboard">
            {() => (
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/applications/:id">
            {() => (
              <ProtectedRoute>
                <ApplicationDetail />
              </ProtectedRoute>
            )}
          </Route>

          {/* Protected Admin Routes */}
          <Route path="/admin">
            {() => (
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/admin/applications/:id">
            {() => (
              <ProtectedRoute requireAdmin>
                <AdminApplicationDetail />
              </ProtectedRoute>
            )}
          </Route>

          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
