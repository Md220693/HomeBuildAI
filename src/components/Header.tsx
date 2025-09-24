import { Button } from "@/components/ui/button";
import buildhomeaiLogo from "@/assets/buildhomeai-logo.png";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Settings } from "lucide-react";

const Header = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <header className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
          <img 
            src={buildhomeaiLogo} 
            alt="BuildHomeAI Logo" 
            className="h-10 w-10 object-contain"
          />
          <h1 className="text-2xl font-bold text-primary">BuildHomeAI</h1>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <a href="#come-funziona" className="text-foreground hover:text-primary transition-smooth">
            Come funziona
          </a>
          <a href="#vantaggi" className="text-foreground hover:text-primary transition-smooth">
            Vantaggi
          </a>
          {user && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/admin')}
              className="text-muted-foreground hover:text-foreground"
            >
              <Settings className="w-4 h-4 mr-2" />
              Admin
            </Button>
          )}
          <Button 
            variant="professional" 
            size="sm"
            onClick={() => navigate('/upload')}
          >
            Calcola subito
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;