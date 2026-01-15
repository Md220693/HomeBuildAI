import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useSupplierGuard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (loading) return;

    // ❌ Not logged in → supplier auth
    if (!user) {
      navigate("/fornitori/auth", { replace: true });
      return;
    }

    const run = async () => {
      const { data, error } = await supabase
        .from("suppliers")
        .select("onboarding_completato")
        .eq("user_id", user.id)
        .maybeSingle();

      // ❌ No supplier profile or onboarding not completed
      if (error || !data || !data.onboarding_completato) {
        navigate("/fornitori/onboarding", { replace: true });
        return;
      }

      // ✅ All good → allow dashboard render
      setChecking(false);
    };

    run();
  }, [user, loading, navigate]);

  return { checking };
}
