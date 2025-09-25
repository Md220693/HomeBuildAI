import { Button } from "@/components/ui/button";
import homeBuildAILogo from "@/assets/homebuildai-logo.png";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-4 cursor-pointer group bg-gradient-to-r from-background/50 to-background/30 backdrop-blur-sm rounded-2xl px-6 py-3 border border-border/50 shadow-card hover:shadow-elegant transition-smooth" onClick={() => navigate('/')}>
          <img 
            src={homeBuildAILogo} 
            alt="HomeBuildAI - Il tuo alleato AI per ristrutturazioni" 
            className="h-20 w-auto object-contain transition-smooth group-hover:scale-105"
          />
          <div className="hidden sm:block">
            <div className="text-xl font-bold text-foreground">HomeBuildAI</div>
            <div className="text-sm text-muted-foreground">Il tuo alleato AI</div>
          </div>
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