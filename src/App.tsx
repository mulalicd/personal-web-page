import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import { lazy, Suspense, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { Analytics } from "@vercel/analytics/react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Secondary routes are lazy loaded so they never weigh down the public homepage bundle.
// Admin and Auth bring their own AuthProvider, so supabase-js loads only there.
const Admin = lazy(() => import("./pages/Admin"));
const Auth = lazy(() => import("./pages/Auth"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const CVStatus = lazy(() => import("./pages/CVStatus"));

const RouteFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

const queryClient = new QueryClient();

/** Every route. The router itself is supplied by the entry point (browser or prerender). */
export const AppRoutes = () => (
  <Suspense fallback={<RouteFallback />}>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/cv-status" element={<CVStatus />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Suspense>
);

/**
 * App-wide providers. `children` is the router: BrowserRouter in main.tsx,
 * StaticRouter in entry-server.tsx (Sprint 04 prerender).
 */
const App = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {children}
        <Analytics />
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
