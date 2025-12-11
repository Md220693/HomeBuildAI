import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Images (optimized with fallbacks)
import img1 from "@/assets/house-renovation-hero-1.jpg";
import img2 from "@/assets/milivoj-kuhar-Te48TPzdcU8-unsplash-2.jpg";
import img3 from "@/assets/interior-3.jpg";
import img4 from "@/assets/medium-shot-people-working-with-helmets-4.jpg";
import img5 from "@/assets/tiler-working-renovation-apartment-5.jpg";
import img6 from "@/assets/construction_remodel-6.jpg";
import img7 from "@/assets/tools-7.png";

const HeroSection = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Optimized array (filters undefined + preloads next)
  const heroImages = [img1, img2, img3, img4, img5, img6, img7].filter(Boolean);

  // Auto-play with smooth transitions
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [heroImages.length]);

  // Preload next image for smoother transition
  useEffect(() => {
    const nextImage = new Image();
    nextImage.src = heroImages[(currentSlide + 1) % heroImages.length];
  }, [currentSlide, heroImages]);

  return (
    <section className="relative min-h-[600px] md:min-h-[700px] flex items-center overflow-hidden">
      {/* Background Slideshow */}
      <div className="absolute inset-0">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`
              absolute inset-0 bg-cover bg-center bg-no-repeat 
              transition-opacity duration-[1400ms] ease-out
              will-change-transform will-change-opacity 
              ${index === currentSlide ? "opacity-100" : "opacity-0"}
            `}
            style={{
              backgroundImage: `url(${image})`,
              transform: index === currentSlide ? "scale(1)" : "scale(1.05)",
              transition: "opacity 1.4s ease-out, transform 4s ease-out",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70"></div>
          </div>
        ))}
      </div>

      {/* CONTENT */}
      <div className="container relative z-10 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-accent/20 backdrop-blur-sm rounded-full px-5 py-2.5 mb-8 text-sm font-semibold text-white border border-accent/30 animate-fade-in">
            <CheckCircle className="w-5 h-5 text-accent" />
            L'AI al servizio della tua casa
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-white drop-shadow-2xl animate-slide-up">
            Ristrutturare casa.. <span className="text-accent">Quanto mi costi?</span>
          </h1>

          {/* Description */}
          <div className="animate-fade-in-delay">
            <p className="text-lg md:text-xl mb-10 text-white/95 leading-relaxed max-w-3xl mx-auto drop-shadow-lg">
              Con <strong className="text-accent">HomeBuildAI</strong> utilizzi tutta la potenza
              AI per ottenere immediatamente una stima realistica dei costi di ristrutturazione.
              <strong className="text-accent"> Compri casa e sei fuorisede?</strong> HomeBuildAI ti supporta!
              <strong className="text-accent"> Vuoi ristrutturare ma non sai da dove partire?</strong> 
              HomeBuildAI ti guida in modo semplice, rapido e <strong className="text-accent font-bold">GRATUITO!</strong>
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up-delay">
            <Button
              variant="default"
              size="xl"
              className="bg-accent hover:bg-accent/90 text-white shadow-2xl text-lg px-10 py-7 group transition-all duration-300 hover:scale-105 hover:shadow-3xl"
              onClick={() => navigate("/upload")}
            >
              <Home className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform duration-300" />
              Ottieni la tua stima gratuita
            </Button>

            <Button
              variant="outline"
              size="xl"
              className="bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20 shadow-xl text-lg px-10 py-7 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              onClick={() => navigate("/fornitori/auth")}
            >
              Sei un'impresa? Unisciti a noi
            </Button>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
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
