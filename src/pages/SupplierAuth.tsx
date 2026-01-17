import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function SupplierAuth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // SIGN UP
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (error) {
      toast({ variant: "destructive", title: error.message });
      return;
    }

    toast({
      title: "Controlla la tua email",
      description: "Ti abbiamo inviato un link di verifica",
    });
  };

  // SIGN IN
  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      toast({ variant: "destructive", title: error.message });
      return;
    }

    navigate("/fornitori/dashboard");
  };

  // PASSWORD RESET
  const handleResetPassword = async () => {
    if (!email) {
      toast({
        variant: "destructive",
        title: "Insert email first",
      });
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast({ variant: "destructive", title: error.message });
      return;
    }

    toast({
      title: "Email sent",
      description: "Check your inbox to reset password",
    });
  };

  return (
    <Card className="max-w-md mx-auto mt-10">
      <CardHeader>
        <CardTitle>Supplier Access</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="signin">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="signin">Login</TabsTrigger>
            <TabsTrigger value="signup">Signup</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form onSubmit={handleSignin} className="space-y-4">
              <Label>Email</Label>
              <Input value={email} onChange={e => setEmail(e.target.value)} />
              <Label>Password</Label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} />
              <Button disabled={loading} className="w-full">Login</Button>
              <Button type="button" variant="link" onClick={handleResetPassword}>
                Forgot password?
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-4">
              <Label>Email</Label>
              <Input value={email} onChange={e => setEmail(e.target.value)} />
              <Label>Password</Label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} />
              <Button disabled={loading} className="w-full">
                Create account
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
