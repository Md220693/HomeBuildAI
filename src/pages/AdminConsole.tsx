import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminStats } from "@/hooks/useAdminStats";
import { HelpTooltip, HelpSection } from '@/components/ui/help-tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Database, Users, Euro, FileText, Bell, Code, Brain } from "lucide-react";
import Header from "@/components/Header";
import AdminApiManager from "@/components/admin/AdminApiManager";
import AdminModuleController from "@/components/admin/AdminModuleController";
import AdminLeadsTable from "@/components/admin/AdminLeadsTable";
import AdminSuppliersTable from "@/components/admin/AdminSuppliersTable";
import AdminPricingRules from "@/components/admin/AdminPricingRules";
import AdminPaymentLogs from "@/components/admin/AdminPaymentLogs";
import AdminNotifications from "@/components/admin/AdminNotifications";

const AdminConsole = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();
  const stats = useAdminStats();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Pannello Amministratore</h1>
              <p className="text-muted-foreground">Gestisci tutte le funzionalità dell'applicazione</p>
            </div>
            <Button 
              onClick={() => navigate('/admin/ai-trainer')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              size="lg"
            >
              <Brain className="w-5 h-5 mr-2" />
              AI Trainer
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              API
            </TabsTrigger>
            <TabsTrigger value="modules" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Moduli
            </TabsTrigger>
            <TabsTrigger value="leads" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Lead
            </TabsTrigger>
            <TabsTrigger value="suppliers" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Fornitori
            </TabsTrigger>
            <TabsTrigger value="pricing" className="flex items-center gap-2">
              <Euro className="h-4 w-4" />
              Prezzi
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifiche
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Lead Totali</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.loading ? "..." : stats.totalLeads.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats.loading ? "Caricamento..." : 
                     `${stats.leadsGrowth >= 0 ? '+' : ''}${stats.leadsGrowth}% dal mese scorso`}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Fornitori Attivi</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.loading ? "..." : stats.activeSuppliers}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats.loading ? "Caricamento..." : 
                     `${stats.suppliersGrowth >= 0 ? '+' : ''}${stats.suppliersGrowth}% dal mese scorso`}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Ricavi Mensili</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.loading ? "..." : `€${stats.monthlyRevenue.toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats.loading ? "Caricamento..." : 
                     `${stats.revenueGrowth >= 0 ? '+' : ''}${stats.revenueGrowth}% dal mese scorso`}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Tasso Conversione</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.loading ? "..." : `${stats.conversionRate}%`}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats.loading ? "Caricamento..." : 
                     `${stats.conversionGrowth >= 0 ? '+' : ''}${stats.conversionGrowth}% dal mese scorso`}
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Sistema Status</CardTitle>
                <CardDescription>Stato attuale dei servizi e moduli</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Database Supabase</span>
                    <span className="text-green-600 font-medium">Operativo</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Edge Functions</span>
                    <span className="text-green-600 font-medium">Operativo</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>AI Interview</span>
                    <span className="text-green-600 font-medium">Operativo</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>PDF Generation</span>
                    <span className="text-green-600 font-medium">Operativo</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Email Service</span>
                    <span className="text-yellow-600 font-medium">Non Configurato</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Stripe Payments</span>
                    <span className="text-yellow-600 font-medium">Non Configurato</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api">
            <AdminApiManager />
          </TabsContent>

          <TabsContent value="modules">
            <AdminModuleController />
          </TabsContent>

          <TabsContent value="leads">
            <AdminLeadsTable />
          </TabsContent>

          <TabsContent value="suppliers">
            <AdminSuppliersTable />
          </TabsContent>

          <TabsContent value="pricing">
            <AdminPricingRules />
          </TabsContent>

          <TabsContent value="notifications">
            <AdminNotifications />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminConsole;