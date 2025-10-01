import { Button } from "@/components/ui/button";
import homeBuildAILogo from "@/assets/homebuildai-new-logo.png";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-6 py-6 md:py-8 lg:py-10 flex items-center justify-between">
        <div className="cursor-pointer group" onClick={() => navigate('/')}>
          <img 
            src={homeBuildAILogo} 
            alt="HomeBuildAI - Il tuo alleato AI per ristrutturazioni" 
            className="h-28 md:h-36 lg:h-40 w-auto object-contain transition-all duration-300 group-hover:scale-105 group-hover:opacity-90 drop-shadow-2xl"
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