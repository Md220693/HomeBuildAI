import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, CheckCircle, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import renovationHero from "@/assets/house-renovation-hero-1.jpg";
import renovationHero2 from "@/assets/milivoj-kuhar-Te48TPzdcU8-unsplash-2.jpg"; // Add your images
import renovationHero3 from "@/assets/interior-3.jpg";
import renovationHero4 from "@/assets/medium-shot-people-working-with-helmets-4.jpg";
import renovationHero5 from "@/assets/tiler-working-renovation-apartment-5.jpg";
import renovationHero6 from "@/assets/construction_remodel-6.jpg";
import renovationHero7 from "@/assets/tools-7.png";

const HeroSection = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);


  const heroImages = [
    renovationHero,
    renovationHero2 || renovationHero, // Fallback to first image if others don't exist
    renovationHero3 || renovationHero,
    renovationHero4 || renovationHero,
    renovationHero5 || renovationHero,
    renovationHero6 || renovationHero,
    renovationHero7 || renovationHero,
  ].filter(Boolean);


  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isAutoPlaying && heroImages.length > 1) {
      interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % heroImages.length);
      }, 5000);
    }
    
    return () => clearInterval(interval);
  }, [isAutoPlaying, heroImages.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  return (
    <section className="relative min-h-[600px] md:min-h-[700px] flex items-center overflow-hidden">
      {/* Slideshow Background Images */}
      <div className="absolute inset-0">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ backgroundImage: `url(${image})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70"></div>
          </div>
        ))}
      </div>
      
      {/* Slide Navigation Arrows (only show if multiple images) */}
      {heroImages.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 w-12 h-12 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center transition-all duration-300 group backdrop-blur-sm"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 w-12 h-12 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center transition-all duration-300 group backdrop-blur-sm"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </button>
        </>
      )}

      {/* Auto-play toggle */}
      {heroImages.length > 1 && (
        <button
          onClick={toggleAutoPlay}
          className="absolute bottom-8 right-8 z-20 w-10 h-10 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm"
          aria-label={isAutoPlaying ? "Pause slideshow" : "Play slideshow"}
        >
          {isAutoPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5" />
          )}
        </button>
      )}

      {/* Slide Indicators/Dots */}
      {heroImages.length > 1 && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex items-center gap-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-accent scale-125' 
                  : 'bg-white/60 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Slide Counter */}
      {heroImages.length > 1 && (
        <div className="absolute top-8 right-8 z-20 bg-black/40 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm font-medium">
          {currentSlide + 1} / {heroImages.length}
        </div>
      )}
      
      {/* Content */}
      <div className="container relative z-10 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Trust badge with fade animation */}
          <div 
            className="inline-flex items-center gap-2 bg-accent/20 backdrop-blur-sm rounded-full px-5 py-2.5 mb-8 text-sm font-semibold text-white border border-accent/30 animate-fade-in"
          >
            <CheckCircle className="w-5 h-5 text-accent" />
            L'AI al servizio della tua casa
          </div>
          
          {/* Main title with slide transition */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-white drop-shadow-2xl animate-slide-up">
            Ristrutturare casa.. <span className="text-accent">Quanto mi costi?</span>
          </h1>
          
          {/* Description with staggered animation */}
          <div className="animate-fade-in-delay">
            <p className="text-lg md:text-xl mb-10 text-white/95 leading-relaxed max-w-3xl mx-auto drop-shadow-lg">
              Con <strong className="text-accent">HomeBuildAI</strong> utilizzi tutta la potenza AI per avere una valutazione immediata di quanto potrebbe costarti la ristrutturazione. <strong className="text-accent">Compri casa e sei fuorisede?</strong> HomeBuildAI è un alleato fedele! <strong className="text-accent">Vuoi ristrutturare casa tua ma non sai da dove cominciare?</strong> HomeBuildAI ti aiuta ad orientarti in maniera semplice, rapida, efficace e <strong className="text-accent font-bold">GRATUITA!</strong>
            </p>
          </div>
          
          {/* CTA Buttons with hover animations */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up-delay">
            <Button 
              variant="default" 
              size="xl" 
              className="bg-accent hover:bg-accent/90 text-white shadow-2xl text-lg px-10 py-7 group transition-all duration-300 hover:scale-105 hover:shadow-3xl"
              onClick={() => navigate('/upload')}
            >
              <Home className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform duration-300" />
              Ottieni la tua stima gratuita
            </Button>
            <Button 
              variant="outline" 
              size="xl"
              className="bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20 shadow-xl text-lg px-10 py-7 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              onClick={() => navigate('/fornitori/auth')}
            >
              Sei un'impresa? Unisciti a noi
            </Button>
          </div>
        </div>
      </div>

      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(30px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fadeIn 1s ease-out;
        }
        
        .animate-fade-in-delay {
          animation: fadeIn 1s ease-out 0.3s both;
        }
        
        .animate-slide-up {
          animation: slideUp 1s ease-out 0.1s both;
        }
        
        .animate-slide-up-delay {
          animation: slideUp 1s ease-out 0.5s both;
        }
      `}</style>
    </section>
  );
};

export default HeroSection;