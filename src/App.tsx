import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Upload from "./pages/Upload";
import Interview from "./pages/Interview";
import ContactVerification from "./pages/ContactVerification";
import Capitolato from "./pages/Capitolato";
import SupplierAuth from "./pages/SupplierAuth";
import SupplierOnboarding from "./pages/SupplierOnboarding";
import SupplierDashboard from "./pages/SupplierDashboard";
import AdminConsole from "./pages/AdminConsole";
import AdminAuth from "./pages/AdminAuth";
import AITrainer from "./pages/AITrainer";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import ComeFunzionaPage from "@/pages/ComeFunziona";
import PercheSceglierciPage from "@/pages/PercheSceglierci";
import Header from "@/components/Header"; 

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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
          
          {/* Supplier Routes */}
          <Route path="/fornitori/auth" element={<SupplierAuth />} />
          <Route path="/fornitori/onboarding" element={
            <ProtectedRoute requireRole="supplier">
              <SupplierOnboarding />
            </ProtectedRoute>
          } />
          <Route path="/fornitori/dashboard" element={
            <ProtectedRoute requireRole="supplier">
              <SupplierDashboard />
            </ProtectedRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin/auth" element={<AdminAuth />} />
          <Route path="/admin" element={
            <ProtectedRoute requireRole="admin" requireOnboarding={false}>
              <AdminConsole />
            </ProtectedRoute>
          } />
          <Route path="/admin/ai-trainer" element={
            <ProtectedRoute requireRole="admin" requireOnboarding={false}>
              <AITrainer />
            </ProtectedRoute>
          } />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </main>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
