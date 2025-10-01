import { Button } from "@/components/ui/button";
import { Home, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import renovationHero from "@/assets/house-renovation-hero.jpg";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[600px] md:min-h-[700px] flex items-center">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${renovationHero})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70"></div>
      </div>
      
      {/* Content */}
      <div className="container relative z-10 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Trust badge */}
          <div className="inline-flex items-center gap-2 bg-accent/20 backdrop-blur-sm rounded-full px-5 py-2.5 mb-8 text-sm font-semibold text-white border border-accent/30">
            <CheckCircle className="w-5 h-5 text-accent" />
            L'AI al servizio della tua casa
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-white drop-shadow-2xl">
            Ristrutturare casa.. <span className="text-accent">Quanto mi costi?</span>
          </h1>
          
          <p className="text-lg md:text-xl mb-10 text-white/95 leading-relaxed max-w-3xl mx-auto drop-shadow-lg">
            Con <strong className="text-accent">HomeBuildAI</strong> utilizzi tutta la potenza AI per avere una valutazione immediata di quanto potrebbe costarti la ristrutturazione. <strong className="text-accent">Compri casa e sei fuorisede?</strong> HomeBuildAI è un alleato fedele! <strong className="text-accent">Vuoi ristrutturare casa tua ma non sai da dove cominciare?</strong> HomeBuildAI ti aiuta ad orientarti in maniera semplice, rapida, efficace e <strong className="text-accent font-bold">GRATUITA!</strong>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="default" 
              size="xl" 
              className="bg-accent hover:bg-accent/90 text-white shadow-2xl text-lg px-10 py-7 group"
              onClick={() => navigate('/upload')}
            >
              <Home className="w-6 h-6" />
              Ottieni la tua stima gratuita
            </Button>
            <Button 
              variant="outline" 
              size="xl"
              className="bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20 shadow-xl text-lg px-10 py-7"
              onClick={() => navigate('/fornitori/auth')}
            >
              Sei un'impresa? Unisciti a noi
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;