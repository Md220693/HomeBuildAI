import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let sessionChecked = false;
    let listenerReady = false;

    const checkIfInitialized = () => {
      if (sessionChecked && listenerReady) {
        setIsInitialized(true);
        setLoading(false);
      }
    };

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (import.meta.env.DEV) {
          console.log('[useAuth] Auth state changed:', event, session?.user?.id);
        }
        setSession(session);
        setUser(session?.user ?? null);
        listenerReady = true;
        checkIfInitialized();
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (import.meta.env.DEV) {
        console.log('[useAuth] Initial session check:', session?.user?.id);
      }
      setSession(session);
      setUser(session?.user ?? null);
      sessionChecked = true;
      checkIfInitialized();
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return {
    user,
    session,
    loading,
    isInitialized,
    signOut,
    isAuthenticated: !!user,
  };
}