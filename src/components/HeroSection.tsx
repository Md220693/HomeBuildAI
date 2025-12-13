import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

import img1 from "@/assets/house-renovation-hero-1.jpg";
import img2 from "@/assets/milivoj-kuhar-Te48TPzdcU8-unsplash-2.jpg";
import img3 from "@/assets/interior-3.jpg";
import img4 from "@/assets/medium-shot-people-working-with-helmets-4.jpg";
import img5 from "@/assets/tiler-working-renovation-apartment-5.jpg";
import img6 from "@/assets/construction_remodel-6.jpg";
import img7 from "@/assets/tools-7.png";

import mImg1 from "@/assets/house-renovation-hero-mobile-1.png";
import mImg2 from "@/assets/milivoj-kuhar-Te48TPzdcU8-unsplash-mobile-2.jpg";
import mImg3 from "@/assets/interior-mobile-3.jpg";
import mImg4 from "@/assets/medium-shot-people-working-with-helmets-mobile-4.jpg";
import mImg5 from "@/assets/tiler-working-renovation-apartment-mobile-5.jpg";
import mImg6 from "@/assets/construction_remodel-mobile-6.jpg";
import mImg7 from "@/assets/tools-mobile-7.png";

const HeroSection = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Desktop & Mobile image arrays
  const desktopImages = [img1, img2, img3, img4, img5, img6, img7].filter(Boolean);
  const mobileImages = [mImg1, mImg2, mImg3, mImg4, mImg5, mImg6, mImg7].filter(Boolean);

  const heroImages = isMobile ? mobileImages : desktopImages;

  // Detect screen size
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Auto slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  // Preload next image
  useEffect(() => {
    const next = new Image();
    next.src = heroImages[(currentSlide + 1) % heroImages.length];
  }, [currentSlide, heroImages]);

  return (
    <section className="relative min-h-[600px] md:min-h-[700px] flex items-center overflow-hidden">
      {/* Background Slideshow */}
      <div className="absolute inset-0">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-[1400ms] ease-out ${index === currentSlide ? "opacity-100" : "opacity-0"}`}
            style={{
              backgroundImage: `url(${image})`,
              backgroundPosition: isMobile ? "center top" : "center",
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
          <div className="inline-flex items-center gap-2 bg-accent/20 backdrop-blur-sm rounded-full px-5 py-2.5 mb-8 text-sm font-semibold text-white border border-accent/30">
            <CheckCircle className="w-5 h-5 text-accent" />
            L'AI al servizio della tua casa
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-white">
            Ristrutturare casa.. <span className="text-accent">Quanto mi costi?</span>
          </h1>

          <p className="text-lg md:text-xl mb-10 text-white/95 leading-relaxed max-w-3xl mx-auto">
            Con <strong className="text-accent">HomeBuildAI</strong> ottieni subito una stima realistica dei costi.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="xl"
              className="bg-accent hover:bg-accent/90 text-white px-10 py-7"
              onClick={() => navigate("/upload")}
            >
              <Home className="w-6 h-6 mr-3" />
              Ottieni la tua stima gratuita
            </Button>

            <Button
              variant="outline"
              size="xl"
              className="bg-white/10 text-white border-white/30 px-10 py-7"
              onClick={() => navigate("/fornitori/auth")}
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
