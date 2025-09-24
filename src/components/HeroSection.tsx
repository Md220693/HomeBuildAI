import { Button } from "@/components/ui/button";
import { Home, Zap, Target, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-gradient-hero text-primary-foreground py-20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-dark/10 to-transparent"></div>
      
      <div className="container relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Ristrutturazione Smart con
            <span className="text-accent-light block">Intelligenza Artificiale</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-primary-foreground/90 leading-relaxed">
            Carica planimetrie e foto, rispondi a un'intervista AI personalizzata e ricevi 
            un capitolato dettagliato con stima costi in pochi minuti.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              variant="hero" 
              size="xl" 
              className="group"
              onClick={() => navigate('/upload')}
            >
              <Home className="group-hover:rotate-12 transition-bounce" />
              Inizia la tua ristrutturazione
            </Button>
            <Button variant="outline" size="xl" className="bg-white/10 text-white border-white/30 hover:bg-white/20">
              Vedi esempio
            </Button>
          </div>
          
          {/* Features highlight */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-lg">
              <Zap className="h-12 w-12 text-accent-light mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Veloce</h3>
              <p className="text-primary-foreground/80">Risultati in pochi minuti</p>
            </div>
            
            <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-lg">
              <Target className="h-12 w-12 text-accent-light mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Preciso</h3>
              <p className="text-primary-foreground/80">Stime basate su AI avanzata</p>
            </div>
            
            <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-lg">
              <CheckCircle className="h-12 w-12 text-accent-light mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Professionale</h3>
              <p className="text-primary-foreground/80">Capitolato dettagliato incluso</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;