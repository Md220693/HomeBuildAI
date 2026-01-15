import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleUpdatePassword = async () => {
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      toast({ variant: "destructive", title: error.message });
      return;
    }

    toast({ title: "Password updated" });
    navigate("/fornitori/auth");
  };

  return (
    <div className="max-w-md mx-auto mt-10 space-y-4">
      <Input
        type="password"
        placeholder="New password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <Button onClick={handleUpdatePassword} className="w-full">
        Update Password
      </Button>
    </div>
  );
}
