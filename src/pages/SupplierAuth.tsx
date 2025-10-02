import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, Mail, Lock, Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import Header from "@/components/Header";

const authSchema = z.object({
  email: z.string().email("Email non valida"),
  password: z.string().min(6, "La password deve essere di almeno 6 caratteri")
});

const SupplierAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailConfirmRequired, setEmailConfirmRequired] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/fornitori/dashboard';

  useEffect(() => {
    const checkEmailConfirmSetting = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-system-setting', {
          body: { setting_key: 'supplier_email_confirmation_required' }
        });
        
        if (!error && data?.success) {
          setEmailConfirmRequired(data.setting_value === 'true');
        }
      } catch (error) {
        console.error('Error fetching email confirmation setting:', error);
      }
    };

    checkEmailConfirmSetting();
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = authSchema.parse({ email, password });
      setIsLoading(true);

      const { data, error } = await supabase.functions.invoke('signup-supplier', {
        body: { 
          email: validatedData.email, 
          password: validatedData.password 
        }
      });

      if (error || !data?.success) {
        const errorMessage = error?.message || data?.error || 'Errore sconosciuto';
        
        if (errorMessage.includes('already registered') || errorMessage.includes('User already registered')) {
          toast({
            variant: "destructive",
            title: "Account già esistente",
            description: "Questo indirizzo email è già registrato. Prova ad accedere."
          });
        } else {
          throw new Error(errorMessage);
        }
        return;
      }

      if (data.email_confirm_required) {
        toast({
          title: "Registrazione completata!",
          description: "Controlla la tua email per confermare l'account, poi potrai accedere."
        });
      } else {
        toast({
          title: "Registrazione completata!",
          description: "Account creato con successo. Puoi ora accedere con le tue credenziali."
        });
      }

    } catch (error) {
      console.error('Sign up error:', error);
      if (error instanceof z.ZodError) {
        toast({
          variant: "destructive",
          title: "Dati non validi",
          description: error.errors[0]?.message
        });
      } else {
        toast({
          variant: "destructive",
          title: "Errore nella registrazione",
          description: error instanceof Error ? error.message : "Riprova più tardi"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = authSchema.parse({ email, password });
      setIsLoading(true);

      const { error } = await supabase.auth.signInWithPassword({
        email: validatedData.email,
        password: validatedData.password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast({
            variant: "destructive",
            title: "Credenziali non valide",
            description: "Email o password non corretti"
          });
        } else {
          throw error;
        }
        return;
      }

      toast({
        title: "Accesso effettuato!",
        description: "Benvenuto nella tua area riservata"
      });

      navigate(redirectTo);

    } catch (error) {
      console.error('Sign in error:', error);
      if (error instanceof z.ZodError) {
        toast({
          variant: "destructive", 
          title: "Dati non validi",
          description: error.errors[0]?.message
        });
      } else {
        toast({
          variant: "destructive",
          title: "Errore nell'accesso",
          description: error instanceof Error ? error.message : "Riprova più tardi"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <main className="container py-12">
        <div className="max-w-md mx-auto">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Torna alla home
            </Button>
          </div>

          <Card className="shadow-elegant">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
                <Building className="h-6 w-6 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl">Area Fornitori BuildHomeAI</CardTitle>
              <CardDescription>
                Accedi alla tua area fornitori BuildHomeAI
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Accedi</TabsTrigger>
                  <TabsTrigger value="signup">Registrati</TabsTrigger>
                </TabsList>
                
                <TabsContent value="signin" className="space-y-4">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signin-email"
                          type="email"
                          placeholder="tua@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signin-password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      variant="hero"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Accesso in corso...
                        </>
                      ) : (
                        "Accedi"
                      )}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup" className="space-y-4">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email Aziendale</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="info@tuaazienda.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="Minimo 6 caratteri"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      variant="hero"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Registrazione...
                        </>
                      ) : (
                        "Registrati"
                      )}
                    </Button>
                  </form>
                  
                  <p className="text-xs text-muted-foreground text-center">
                    Registrandoti accetti i nostri termini di servizio
                  </p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default SupplierAuth;