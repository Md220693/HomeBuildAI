import { Button } from "@/components/ui/button";
import buildhomeaiLogo from "@/assets/buildhomeai-logo.png";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

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
          <Button 
            variant="professional" 
            size="sm"
            onClick={() => navigate('/upload')}
          >
            Inizia ora
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;