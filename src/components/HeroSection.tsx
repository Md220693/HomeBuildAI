import { Button } from "@/components/ui/button";
import { Home, Zap, Target, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-gradient-hero text-primary-foreground py-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-dark/10 to-transparent"></div>
      <div className="absolute top-20 left-10 w-32 h-32 bg-accent/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 right-10 w-48 h-48 bg-primary-light/10 rounded-full blur-3xl"></div>
      
      <div className="container relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Trust badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 text-sm font-medium">
            <CheckCircle className="w-4 h-4 text-accent-light" />
            Basato su oltre 15.000 preventivi reali
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Scopri quanto ti costa
            <span className="text-accent-light block bg-gradient-to-r from-accent-light to-accent bg-clip-text text-transparent">
              ristrutturare casa tua, ora
            </span>
          </h1>
          
          <p className="text-lg md:text-xl mb-4 text-primary-foreground/90 leading-relaxed max-w-3xl mx-auto">
            <strong className="text-accent-light">HomeBuildAI combina AI + dataset reali + competenza di settore</strong> per darti stime affidabili fin da subito. 
            <strong className="text-accent-light">Rapido, gratuito ed efficace.</strong>
          </p>
          
          <div className="flex items-center justify-center gap-6 mb-8 text-sm text-primary-foreground/80">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-accent-light" />
              <span>5 minuti per la stima</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-accent-light" />
              <span>100% gratuito</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-accent-light" />
              <span>Nessun impegno</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              variant="hero" 
              size="xl" 
              className="group text-lg px-8 py-4 h-auto shadow-2xl hover:shadow-accent/25"
              onClick={() => navigate('/upload')}
            >
              <Home className="group-hover:rotate-12 transition-bounce w-5 h-5" />
              Ottieni la tua stima gratuita
            </Button>
            <Button 
              variant="outline" 
              size="xl" 
              className="bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm text-lg px-8 py-4 h-auto"
              onClick={() => navigate('/fornitori/auth')}
            >
              Sei un'impresa? Unisciti a noi
            </Button>
          </div>
          
          {/* Process preview with progress indicator */}
          <div className="relative">
            <div className="grid md:grid-cols-3 gap-8 mt-16">
              <div className="text-center p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-smooth group">
                <div className="relative">
                  <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-smooth">
                    <Zap className="h-8 w-8 text-accent-light" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                </div>
                <h3 className="text-xl font-semibold mb-3">Carica planimetria + foto</h3>
                <p className="text-primary-foreground/70 text-sm leading-relaxed">Planimetria dell'immobile e foto di tutte le stanze</p>
                <p className="text-accent-light text-xs mt-2 font-medium">⏱️ 2 minuti</p>
              </div>
              
              <div className="text-center p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-smooth group">
                <div className="relative">
                  <div className="w-16 h-16 bg-primary-light/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-smooth">
                    <Target className="h-8 w-8 text-primary-light" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary-light text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                </div>
                <h3 className="text-xl font-semibold mb-3">Interview guidata</h3>
                <p className="text-primary-foreground/70 text-sm leading-relaxed">L'AI ti fa le domande giuste per capire le tue esigenze</p>
                <p className="text-primary-light text-xs mt-2 font-medium">⏱️ 3 minuti</p>
              </div>
              
              <div className="text-center p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-smooth group">
                <div className="relative">
                  <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-smooth">
                    <CheckCircle className="h-8 w-8 text-accent-light" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                </div>
                <h3 className="text-xl font-semibold mb-3">Stima personalizzata</h3>
                <p className="text-primary-foreground/70 text-sm leading-relaxed">Preventivo dettagliato e capitolato professionale</p>
                <p className="text-accent-light text-xs mt-2 font-medium">📧 Subito via email</p>
              </div>
            </div>
            
            {/* Connecting lines for desktop */}
            <div className="hidden md:block absolute top-1/2 left-1/4 w-1/4 h-px bg-gradient-to-r from-accent-light/50 to-primary-light/50 transform -translate-y-1/2"></div>
            <div className="hidden md:block absolute top-1/2 right-1/4 w-1/4 h-px bg-gradient-to-r from-primary-light/50 to-accent-light/50 transform -translate-y-1/2"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;