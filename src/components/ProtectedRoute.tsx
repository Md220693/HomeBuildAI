import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireOnboarding = true 
}) => {
  const { user, isInitialized } = useAuth();
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      console.log('[ProtectedRoute] Checking onboarding status', { 
        user: user?.id,
        isInitialized,
        currentPath: location.pathname 
      });

      if (!isInitialized) {
        console.log('[ProtectedRoute] Auth not initialized yet, waiting...');
        return;
      }

      if (!user) {
        console.log('[ProtectedRoute] No user after initialization');
        setCheckingStatus(false);
        return;
      }

      try {
        console.log('[ProtectedRoute] Fetching onboarding status for user:', user.id);
        const { data, error } = await supabase
          .from('suppliers')
          .select('onboarding_completato')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('[ProtectedRoute] Error checking onboarding status:', error);
        }

        const completed = data?.onboarding_completato || false;
        console.log('[ProtectedRoute] Onboarding status:', completed);
        setHasCompletedOnboarding(completed);
      } catch (error) {
        console.error('[ProtectedRoute] Error in onboarding check:', error);
      } finally {
        setCheckingStatus(false);
      }
    };

    checkOnboardingStatus();
  }, [user, isInitialized, location.pathname]);

  if (!isInitialized || checkingStatus) {
    console.log('[ProtectedRoute] Loading...', { isInitialized, checkingStatus });
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
    console.log('[ProtectedRoute] No user, redirecting to auth');
    return <Navigate to="/fornitori/auth" replace />;
  }

  // Se siamo sulla pagina di onboarding, permettiamo l'accesso
  if (location.pathname === '/fornitori/onboarding') {
    console.log('[ProtectedRoute] On onboarding page, allowing access');
    return <>{children}</>;
  }

  // Se richiediamo onboarding completato e non è completato, reindirizziamo
  if (requireOnboarding && !hasCompletedOnboarding) {
    console.log('[ProtectedRoute] Onboarding required but not completed, redirecting');
    return <Navigate to="/fornitori/onboarding" replace />;
  }

  console.log('[ProtectedRoute] All checks passed, rendering children');
  return <>{children}</>;
};

export default ProtectedRoute;