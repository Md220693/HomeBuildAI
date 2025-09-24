import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { InterviewPromptTab } from '@/components/ai-trainer/InterviewPromptTab';
import { PriceCalibrationTab } from '@/components/ai-trainer/PriceCalibrationTab';
import { KnowledgeBaseTab } from '@/components/ai-trainer/KnowledgeBaseTab';

const AITrainer = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        navigate('/admin/auth');
        return;
      }

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profile?.role !== 'admin') {
          navigate('/');
          return;
        }

        setIsAdmin(true);
      } catch (error) {
        console.error('Error checking admin status:', error);
        navigate('/');
      } finally {
        setCheckingAdmin(false);
      }
    };

    if (!loading) {
      checkAdminStatus();
    }
  }, [user, loading, navigate]);

  if (loading || checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            AI Trainer
          </h1>
          <p className="text-lg text-muted-foreground">
            Configura e addestra il sistema AI per migliorare interviste e preventivi
          </p>
        </div>

        <Tabs defaultValue="interview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="interview" className="text-sm">
              Intervista & Prompt
            </TabsTrigger>
            <TabsTrigger value="pricing" className="text-sm">
              Prezzi & Calibrazione
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="text-sm">
              Knowledge Base
            </TabsTrigger>
          </TabsList>

          <TabsContent value="interview">
            <Card>
              <CardHeader>
                <CardTitle>Gestione Prompt e Domande Intervista</CardTitle>
                <CardDescription>
                  Modifica i prompt di sistema e configura le domande per l'intervista automatica
                </CardDescription>
              </CardHeader>
              <CardContent>
                <InterviewPromptTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing">
            <Card>
              <CardHeader>
                <CardTitle>Prezzi e Calibrazione</CardTitle>
                <CardDescription>
                  Gestisci listino prezzi, moltiplicatori geografici e storico preventivi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PriceCalibrationTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="knowledge">
            <Card>
              <CardHeader>
                <CardTitle>Knowledge Base e Impostazioni</CardTitle>
                <CardDescription>
                  Aggiungi documenti alla knowledge base e configura le impostazioni AI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <KnowledgeBaseTab />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AITrainer;