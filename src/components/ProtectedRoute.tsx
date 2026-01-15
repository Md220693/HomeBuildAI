import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
  requireRole?: "admin" | "supplier";
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireOnboarding = true,
  requireRole,
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  const [checkingStatus, setCheckingStatus] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [hasRequiredRole, setHasRequiredRole] = useState(false);

  useEffect(() => {
    const runChecks = async () => {
      console.log("[ProtectedRoute] Running checks", {
        user: user?.id,
        loading,
        path: location.pathname,
        requireRole,
      });

      // ⏳ wait until auth finishes
      if (loading) return;

      // ❌ not logged in
      if (!user) {
        setCheckingStatus(false);
        return;
      }

      try {
        /* ---------- ROLE CHECK ---------- */
        if (requireRole) {
          const { data, error } = await supabase.rpc("has_role", {
            _user_id: user.id,
            _role: requireRole,
          });

          if (error) {
            console.error("[ProtectedRoute] Role check error", error);
            setHasRequiredRole(false);
          } else {
            setHasRequiredRole(Boolean(data));
          }

          // admin does NOT need onboarding
          if (requireRole === "admin") {
            setCheckingStatus(false);
            return;
          }
        } else {
          setHasRequiredRole(true);
        }

        /* ---------- ONBOARDING CHECK ---------- */
        if (requireOnboarding && requireRole !== "admin") {
          const { data, error } = await supabase
            .from("suppliers")
            .select("onboarding_completato")
            .eq("user_id", user.id)
            .maybeSingle();

          if (error) {
            console.error("[ProtectedRoute] Onboarding check error", error);
          }

          setHasCompletedOnboarding(Boolean(data?.onboarding_completato));
        }
      } catch (err) {
        console.error("[ProtectedRoute] Guard error", err);
      } finally {
        setCheckingStatus(false);
      }
    };

    runChecks();
  }, [user, loading, requireRole, requireOnboarding, location.pathname]);

  /* ---------- LOADING ---------- */
  if (loading || checkingStatus) {
    console.log("[ProtectedRoute] Loading…");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  /* ---------- NOT AUTHENTICATED ---------- */
  if (!user) {
    const redirect = requireRole === "admin"
      ? "/admin/auth"
      : "/fornitori/auth";

    return <Navigate to={redirect} replace />;
  }

  /* ---------- ROLE DENIED ---------- */
  if (requireRole === "admin" && !hasRequiredRole) {
    return <Navigate to="/admin/auth" replace />;
  }

  if (requireRole === "supplier" && !hasRequiredRole) {
    return <Navigate to="/fornitori/auth" replace />;
  }

  /* ---------- ALLOW ONBOARDING PAGE ---------- */
  if (location.pathname === "/fornitori/onboarding") {
    return <>{children}</>;
  }

  /* ---------- ONBOARDING REQUIRED ---------- */
  if (requireOnboarding && !hasCompletedOnboarding) {
    return <Navigate to="/fornitori/onboarding" replace />;
  }

  /* ---------- SUCCESS ---------- */
  console.log("[ProtectedRoute] Access granted");
  return <>{children}</>;
};

export default ProtectedRoute;
