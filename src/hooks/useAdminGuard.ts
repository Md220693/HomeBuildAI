import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export const useAdminGuard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      if (loading) return;

      if (!user) {
        navigate("/admin-auth");
        return;
      }

      const { data: isAdmin, error } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });

      if (error || !isAdmin) {
        toast.error("Non hai i permessi per accedere all'area amministratore");
        await supabase.auth.signOut();
        navigate("/");
      }
    };

    checkAdmin();
  }, [user, loading, navigate]);
};
