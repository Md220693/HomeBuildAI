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
  const { user, loading: authLoading } = useAuth();
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) {
        setCheckingStatus(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('suppliers')
          .select('onboarding_completato')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error checking onboarding status:', error);
        }

        setHasCompletedOnboarding(data?.onboarding_completato || false);
      } catch (error) {
        console.error('Error in onboarding check:', error);
      } finally {
        setCheckingStatus(false);
      }
    };

    if (!authLoading) {
      checkOnboardingStatus();
    }
  }, [user, authLoading]);

  if (authLoading || checkingStatus) {
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
    return <Navigate to="/fornitori/auth" replace />;
  }

  // Se siamo sulla pagina di onboarding, permettiamo l'accesso
  if (location.pathname === '/fornitori/onboarding') {
    return <>{children}</>;
  }

  // Se richiediamo onboarding completato e non è completato, reindirizziamo
  if (requireOnboarding && !hasCompletedOnboarding) {
    return <Navigate to="/fornitori/onboarding" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;