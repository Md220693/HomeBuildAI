import { Button } from "@/components/ui/button";
import homeBuildAILogo from "@/assets/homebuildai-new-logo.png";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="cursor-pointer group" onClick={() => navigate('/')}>
          <img 
            src={homeBuildAILogo} 
            alt="HomeBuildAI - Il tuo alleato AI per ristrutturazioni" 
            className="h-16 md:h-20 lg:h-24 w-auto object-contain transition-all duration-300 group-hover:scale-105 group-hover:opacity-90 drop-shadow-lg"
          />
        </div>
        
        <nav className="hidden md:flex items-center bg-accent/10 rounded-2xl px-6 py-3 space-x-6 border border-accent/20 shadow-sm">
          <a href="#come-funziona" className="text-foreground/90 hover:text-accent transition-smooth font-semibold">
            Come funziona
          </a>
          <a href="#vantaggi" className="text-foreground/90 hover:text-accent transition-smooth font-semibold">
            Perché sceglierci
          </a>
          <Button 
            variant="default" 
            size="lg"
            className="bg-accent hover:bg-accent/90 text-white shadow-md"
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