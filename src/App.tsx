import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Upload from "./pages/Upload";
import Interview from "./pages/Interview";
import Capitolato from "./pages/Capitolato";
import SupplierAuth from "./pages/SupplierAuth";
import SupplierOnboarding from "./pages/SupplierOnboarding";
import SupplierDashboard from "./pages/SupplierDashboard";
import AdminConsole from "./pages/AdminConsole";
import AdminAuth from "./pages/AdminAuth";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/interview" element={<Interview />} />
          <Route path="/capitolato" element={<Capitolato />} />
          
          {/* Supplier Routes */}
          <Route path="/fornitori/auth" element={<SupplierAuth />} />
          <Route path="/fornitori/onboarding" element={
            <ProtectedRoute>
              <SupplierOnboarding />
            </ProtectedRoute>
          } />
          <Route path="/fornitori/dashboard" element={
            <ProtectedRoute>
              <SupplierDashboard />
            </ProtectedRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin/auth" element={<AdminAuth />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminConsole />
            </ProtectedRoute>
          } />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
