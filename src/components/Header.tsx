import { Button } from "@/components/ui/button";
import homeBuildAILogo from "@/assets/homebuildai-new-logo.png";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-6 py-5 md:py-6 lg:py-7 flex items-center justify-between">
        <div className="cursor-pointer group" onClick={() => navigate('/')}>
          <img 
            src={homeBuildAILogo} 
            alt="HomeBuildAI - Il tuo alleato AI per ristrutturazioni" 
            className="h-20 md:h-22 lg:h-24 w-auto object-contain transition-smooth group-hover:opacity-80 drop-shadow-md"
          />
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#come-funziona" className="text-foreground/90 hover:text-primary transition-smooth font-semibold">
            Come funziona
          </a>
          <a href="#vantaggi" className="text-foreground/90 hover:text-primary transition-smooth font-semibold">
            Perché sceglierci
          </a>
          <Button 
            variant="hero" 
            size="lg"
            onClick={() => navigate('/upload')}
          >
            Inizia gratis
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;