import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "@/hooks/useAuth";

import Index from "./pages/Index";
import Upload from "./pages/Upload";
import Interview from "./pages/Interview";
import ContactVerification from "./pages/ContactVerification";
import Capitolato from "./pages/Capitolato";
import SupplierAuth from "./pages/SupplierAuth";
import SupplierOnboarding from "./pages/SupplierOnboarding";
//import SupplierDashboard from "./pages/SupplierDashboard";
import AdminConsole from "./pages/AdminConsole";
import AdminAuth from "./pages/AdminAuth";
import AITrainer from "./pages/AITrainer";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import ComeFunzionaPage from "@/pages/ComeFunziona";
import PercheSceglierciPage from "@/pages/PercheSceglierci";
import Header from "@/components/Header";
import ResetPassword from "./pages/ResetPassword";
import AuthCallback from "./pages/AuthCallback";
import SupplierConsole from "./pages/SupplierConsole";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider> {/* ✅ THIS WAS MISSING */}
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Header />
          <main className="pt-20 lg:pt-24">
            <Routes>
              <Route path="/come-funziona" element={<ComeFunzionaPage />} />
              <Route path="/vantaggi" element={<PercheSceglierciPage />} />
              <Route path="/" element={<Index />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/interview" element={<Interview />} />
              <Route path="/contact-verification" element={<ContactVerification />} />
              <Route path="/capitolato" element={<Capitolato />} />
              <Route path="/fornitori/auth" element={<SupplierAuth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/auth/callback" element={<AuthCallback />} />

              {/* Supplier */}
              <Route path="/fornitori/onboarding" element={<SupplierOnboarding />} />
              <Route path="/fornitori/dashboard" element={<SupplierConsole />} />
              

              {/* Admin */}
              <Route path="/admin/auth" element={<AdminAuth />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireRole="admin" requireOnboarding={false}>
                    <AdminConsole />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/ai-trainer"
                element={
                  <ProtectedRoute requireRole="admin" requireOnboarding={false}>
                    <AITrainer />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
