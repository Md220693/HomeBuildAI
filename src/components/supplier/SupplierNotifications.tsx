import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Notification {
  id: string;
  type: string;
  payload: {
    title: string;
    body: string;
  };
  read: boolean;
  created_at: string;
}

const SupplierNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setNotifications(data || []);
    };

    fetchNotifications();

    // Real-time subscription
    const channel = supabase
      .channel(`supplier-notifications-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifiche
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {notifications.length === 0 && (
            <p className="text-muted-foreground">Nessuna notifica</p>
          )}

          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 border rounded ${n.read ? "bg-muted" : "bg-white"}`}
            >
              <div className="flex justify-between items-center">
                <p className="font-medium">{n.payload.title}</p>
                {!n.read && <Badge>Nuova</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">{n.payload.body}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(n.created_at).toLocaleString("it-IT")}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default SupplierNotifications;
