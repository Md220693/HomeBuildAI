import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
  requireRole?: 'admin' | 'supplier';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireOnboarding = true,
  requireRole
}) => {
  const { user, isInitialized } = useAuth();
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [hasRequiredRole, setHasRequiredRole] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (import.meta.env.DEV) {
        console.log('[ProtectedRoute] Checking onboarding status', { 
          user: user?.id,
          isInitialized,
          currentPath: location.pathname 
        });
      }

      if (!isInitialized) {
        if (import.meta.env.DEV) {
          console.log('[ProtectedRoute] Auth not initialized yet, waiting...');
        }
        return;
      }

      if (!user) {
        if (import.meta.env.DEV) {
          console.log('[ProtectedRoute] No user after initialization');
        }
        setCheckingStatus(false);
        return;
      }

      try {
      
        if (requireRole) {
          if (import.meta.env.DEV) {
            console.log('[ProtectedRoute] Checking role:', requireRole);
          }
          const { data: roleData, error: roleError } = await supabase
            .rpc('has_role', { 
              _user_id: user.id, 
              _role: requireRole 
            });

          if (roleError) {
            console.error('[ProtectedRoute] Error checking role:', roleError);
          }

          const hasRole = roleData || false;
          if (import.meta.env.DEV) {
            console.log('[ProtectedRoute] Has required role:', hasRole);
          }
          setHasRequiredRole(hasRole);

      
          if (requireRole === 'admin') {
            setCheckingStatus(false);
            return;
          }
        } else {
      
          setHasRequiredRole(true);
        }

    
        if (requireRole === 'supplier' || !requireRole) {
          if (import.meta.env.DEV) {
            console.log('[ProtectedRoute] Fetching onboarding status for user:', user.id);
          }
          const { data, error } = await supabase
            .from('suppliers')
            .select('onboarding_completato')
            .eq('user_id', user.id)
            .maybeSingle();

          if (error) {
            console.error('[ProtectedRoute] Error checking onboarding status:', error);
          }

          const completed = data?.onboarding_completato || false;
          if (import.meta.env.DEV) {
            console.log('[ProtectedRoute] Onboarding status:', completed);
          }
          setHasCompletedOnboarding(completed);
        }
      } catch (error) {
        console.error('[ProtectedRoute] Error in status check:', error);
      } finally {
        setCheckingStatus(false);
      }
    };

    checkOnboardingStatus();
  }, [user, isInitialized, location.pathname, requireRole]);

  if (!isInitialized || checkingStatus) {
    if (import.meta.env.DEV) {
      console.log('[ProtectedRoute] Loading...', { isInitialized, checkingStatus });
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (import.meta.env.DEV) {
      console.log('[ProtectedRoute] No user, redirecting to auth');
    }
    const authPath = requireRole === 'admin' ? '/admin/auth' : '/fornitori/auth';
    return <Navigate to={authPath} replace />;
  }


  if (requireRole && !hasRequiredRole) {
    if (import.meta.env.DEV) {
      console.log('[ProtectedRoute] User does not have required role, redirecting');
    }
    if (requireRole === 'admin') {
      return <Navigate to="/admin/auth" replace />;
    } else if (requireRole === 'supplier') {
      return <Navigate to="/fornitori/auth" replace />;
    }
  }


  if (location.pathname === '/fornitori/onboarding') {
    if (import.meta.env.DEV) {
      console.log('[ProtectedRoute] On onboarding page, allowing access');
    }
    return <>{children}</>;
  }


  if (requireOnboarding && !hasCompletedOnboarding) {
    if (import.meta.env.DEV) {
      console.log('[ProtectedRoute] Onboarding required but not completed, redirecting');
    }
    return <Navigate to="/fornitori/onboarding" replace />;
  }

  if (import.meta.env.DEV) {
    console.log('[ProtectedRoute] All checks passed, rendering children');
  }
  return <>{children}</>;
};

export default ProtectedRoute;