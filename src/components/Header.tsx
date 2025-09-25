import { Button } from "@/components/ui/button";
import homeBuildAILogo from "@/assets/homebuildai-logo.png";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => navigate('/')}>
          <img 
            src={homeBuildAILogo} 
            alt="HomeBuildAI - Il tuo alleato AI per ristrutturazioni" 
            className="h-12 w-auto object-contain transition-smooth group-hover:scale-105"
          />
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#come-funziona" className="text-foreground/80 hover:text-primary transition-smooth font-medium">
            Come funziona
          </a>
          <a href="#vantaggi" className="text-foreground/80 hover:text-primary transition-smooth font-medium">
            Perché sceglierci
          </a>
          <Button 
            variant="hero" 
            size="sm"
            onClick={() => navigate('/upload')}
            className="shadow-lg hover:shadow-xl"
          >
            Inizia gratis
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;