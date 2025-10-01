import { Button } from "@/components/ui/button";
import { Home, Zap, Target, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import homeBuildAILogo from "@/assets/homebuildai-new-logo.png";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-background py-20 md:py-32">
      <div className="container">
        <div className="max-w-5xl mx-auto text-center">
          {/* Logo prominente nella hero */}
          <div className="flex justify-center mb-8">
            <img 
              src={homeBuildAILogo} 
              alt="HomeBuildAI - Il tuo alleato AI per ristrutturazioni" 
              className="h-20 md:h-24 lg:h-28 w-auto object-contain drop-shadow-lg"
            />
          </div>
          
          {/* Trust badge */}
          <div className="inline-flex items-center gap-2 bg-accent/10 rounded-full px-4 py-2 mb-6 text-sm font-medium text-accent">
            <CheckCircle className="w-4 h-4" />
            L'AI al servizio della tua casa
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-foreground">
            Ristrutturare casa.. <span className="text-primary">Quanto mi costi?</span>
          </h1>
          
          <p className="text-lg md:text-xl mb-8 text-muted-foreground leading-relaxed max-w-4xl mx-auto">
            Con <strong className="text-accent">HomeBuildAI</strong> utilizzi tutta la potenza AI per avere una valutazione immediata di quanto potrebbe costarti la ristrutturazione. <strong className="text-primary">Compri casa e sei fuorisede?</strong> HomeBuildAI è un alleato fedele! <strong className="text-primary">Vuoi ristrutturare casa tua ma non sai da dove cominciare?</strong> HomeBuildAI ti aiuta ad orientarti in maniera semplice, rapida, efficace e <strong className="text-accent">GRATUITA!</strong>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              variant="hero" 
              size="xl" 
              className="group"
              onClick={() => navigate('/upload')}
            >
              <Home className="w-5 h-5" />
              Ottieni la tua stima gratuita
            </Button>
            <Button 
              variant="outline" 
              size="xl"
              onClick={() => navigate('/fornitori/auth')}
            >
              Sei un'impresa? Unisciti a noi
            </Button>
          </div>
          
          {/* Process preview */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <div className="text-center p-6 bg-card rounded-lg border border-border shadow-card hover:shadow-md transition-smooth group">
              <div className="relative inline-block">
                <div className="w-16 h-16 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-smooth">
                  <Zap className="h-8 w-8 text-accent" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm">1</div>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">Carica foto e planimetria</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Bastano delle foto fatte bene con il tuo smartphone e la planimetria dell'immobile!</p>
              <p className="text-accent text-xs mt-2 font-medium">⏱️ 2 minuti</p>
            </div>
            
            <div className="text-center p-6 bg-card rounded-lg border border-border shadow-card hover:shadow-md transition-smooth group">
              <div className="relative inline-block">
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-smooth">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm">2</div>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">Interview guidata</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">L'AI ti fa le domande giuste per capire le tue esigenze</p>
              <p className="text-primary text-xs mt-2 font-medium">⏱️ 3 minuti</p>
            </div>
            
            <div className="text-center p-6 bg-card rounded-lg border border-border shadow-card hover:shadow-md transition-smooth group">
              <div className="relative inline-block">
                <div className="w-16 h-16 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-smooth">
                  <CheckCircle className="h-8 w-8 text-accent" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm">3</div>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">Stima personalizzata</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Preventivo dettagliato e capitolato professionale</p>
              <p className="text-accent text-xs mt-2 font-medium">📧 Subito via email</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;