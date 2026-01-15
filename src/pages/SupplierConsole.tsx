import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, FileText, User, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

import SupplierNotifications from "@/components/supplier/SupplierNotifications";

const SupplierConsole = () => {
  const [activeTab, setActiveTab] = useState("leads");
  const [leads, setLeads] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    /* -------- PROFILE -------- */
    const { data: supplier } = await supabase
      .from("suppliers")
      .select("*")
      .eq("user_id", user!.id)
      .maybeSingle();

    if (!supplier) {
      navigate("/fornitori/onboarding", { replace: true });
      return;
    }

    setProfile(supplier);

    /* -------- LEADS -------- */
    const { data: leadsData } = await supabase
      .from("supplier_leads")
      .select(`
        id,
        status,
        leads (
          id,
          interview_data,
          cost_estimate_min,
          cost_estimate_max
        )
      `)
      .eq("supplier_id", supplier.id)
      .order("created_at", { ascending: false });

    setLeads(leadsData || []);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <header className="border-b bg-white">
        <div className="container py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Portale Fornitore</h1>
          <Button
            variant="outline"
            onClick={async () => {
              await supabase.auth.signOut();
              navigate("/");
            }}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* MAIN */}
      <main className="container py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 max-w-xl">
            <TabsTrigger value="leads">
              <FileText className="h-4 w-4 mr-2" />
              Lead
            </TabsTrigger>

            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifiche
            </TabsTrigger>

            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Profilo
            </TabsTrigger>
          </TabsList>

          {/* LEADS */}
          <TabsContent value="leads">
            {leads.length === 0 && (
              <Card>
                <CardContent className="py-6 text-muted-foreground text-center">
                  Nessun lead disponibile
                </CardContent>
              </Card>
            )}

            {leads.map((l) => (
              <Card key={l.id} className="mt-4">
                <CardHeader>
                  <CardTitle>
                    Lead #{l.leads.id.slice(0, 8)}
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <p>
                    <b>Zona:</b> {l.leads.interview_data?.location || "—"}
                  </p>
                  <p>
                    <b>Budget:</b>{" "}
                    €{l.leads.cost_estimate_min} – €
                    {l.leads.cost_estimate_max}
                  </p>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* NOTIFICATIONS */}
          <TabsContent value="notifications">
            <SupplierNotifications />
          </TabsContent>

          {/* PROFILE */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profilo</CardTitle>
              </CardHeader>
              <CardContent>
                <p><b>Nome:</b> {profile?.first_name}</p>
                <p><b>Cognome:</b> {profile?.last_name}</p>
                <p><b>Telefono:</b> {profile?.telefono || "—"}</p>
                <p><b>Sito:</b> {profile?.sito_web || "—"}</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default SupplierConsole;
