import { Button } from "@/components/ui/button";
import homeBuildAILogo from "@/assets/homebuildai-new-logo.png";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Home, Calculator, Star, ArrowRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const headerRef = useRef<HTMLHeadElement>(null);

  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const progress = Math.min(scrollY / 100, 1);
      setScrollProgress(progress);
      setIsScrolled(scrollY > 10);
    };

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', onScroll, { passive: true });
    
    handleScroll();
    
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogoClick = () => {
    if (location.pathname === '/') {
      if (window.scrollY > 100) {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      } else {
        navigate('/');
      }
    } else {
      navigate('/');
    }
  };

  const navItems = isHomePage ? [
    { href: "#come-funziona", label: "Come funziona", icon: Calculator },
    { href: "#vantaggi", label: "Perché sceglierci", icon: Star },
  ] : [];

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.includes(href.replace('#', ''));
  };

  const bgOpacity = Math.min(scrollProgress * 0.95, 0.95);
  const blurAmount = Math.min(scrollProgress * 20, 20);
  const shadowIntensity = Math.min(scrollProgress * 2, 2);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/upload')) return 'Carica Documenti';
    if (path.includes('/interview')) return 'Intervista AI';
    if (path.includes('/report')) return 'Report';
    return '';
  };

  const pageTitle = getPageTitle();

  return (
    <>
      <motion.header 
        ref={headerRef}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          backgroundColor: `rgba(255, 255, 255, ${bgOpacity})`,
          backdropFilter: `blur(${blurAmount}px)`,
          boxShadow: scrollProgress > 0.1 
            ? `0 8px 32px rgba(0, 0, 0, ${0.1 * shadowIntensity}), 0 1px 0 rgba(0, 0, 0, ${0.05 * shadowIntensity})`
            : 'none',
          borderBottom: scrollProgress > 0.1 
            ? `1px solid rgba(0, 0, 0, ${0.1 * scrollProgress})`
            : 'none',
        }}
      >
        <div className="container mx-auto px-6 py-3 lg:py-4">
          <div className="flex items-center justify-between">
            
            {/* Logo and Page Title */}
            <div className="flex items-center gap-4">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="cursor-pointer group relative"
                onClick={handleLogoClick}
              >
                <img 
                  src={homeBuildAILogo} 
                  alt="HomeBuildAI - Il tuo alleato AI per ristrutturazioni" 
                  className="h-14 md:h-16 lg:h-18 w-auto object-contain transition-all duration-300 drop-shadow-lg"
                  style={{
                    filter: `drop-shadow(0 4px 8px rgba(0, 0, 0, ${0.2 * scrollProgress}))`
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-accent/10 to-primary/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm -z-10"></div>
              </motion.div>
              
              {/* Show page title on non-home pages */}
              {!isHomePage && pageTitle && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="hidden md:block"
                >
                  <div className="h-8 w-px bg-gray-300 mx-2"></div>
                  <span className="text-lg font-semibold text-gray-700">
                    {pageTitle}
                  </span>
                </motion.div>
              )}
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {/* Only show nav items on home page */}
              {navItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.a
                    key={item.href}
                    href={item.href}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 group relative overflow-hidden ${
                      scrollProgress > 0.1 
                        ? 'text-foreground/80 hover:text-accent' 
                        : 'text-white hover:text-accent'
                    }`}
                    style={{
                      color: scrollProgress > 0.1 
                        ? undefined 
                        : `rgba(255, 255, 255, ${1 - (scrollProgress * 0.8)})`
                    }}
                  >
                    <div 
                      className="absolute inset-0 rounded-2xl transition-all duration-300"
                      style={{
                        backgroundColor: scrollProgress > 0.1 
                          ? `rgba(var(--accent), ${0.05 + (scrollProgress * 0.05)})`
                          : `rgba(255, 255, 255, ${0.05 * (1 - scrollProgress)})`,
                      }}
                    ></div>
                    
                    <Icon className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                    <span>{item.label}</span>
                    
                    <AnimatePresence>
                      {isActive(item.href) && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-accent rounded-full"
                        />
                      )}
                    </AnimatePresence>
                  </motion.a>
                );
              })}
              
              {/* CTA Button - Different text based on page */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <Button 
                  variant="default" 
                  size="lg"
                  className="bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent text-white shadow-2xl rounded-2xl px-8 py-6 font-bold group transition-all duration-300 hover:scale-105 hover:shadow-3xl border-0"
                  onClick={() => {
                    if (isHomePage) {
                      navigate('/upload');
                    } else {
                      // On other pages, go back to home
                      navigate('/');
                    }
                  }}
                >
                  {isHomePage ? (
                    <>
                      <Calculator className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
                      Inizia gratis
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  ) : (
                    <>
                      <Home className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
                      Torna alla Home
                    </>
                  )}
                </Button>
              </motion.div>
            </nav>

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="lg:hidden p-3 rounded-2xl backdrop-blur-sm border transition-all duration-300"
              style={{
                backgroundColor: scrollProgress > 0.1 
                  ? 'rgba(255, 255, 255, 0.1)' 
                  : `rgba(255, 255, 255, ${0.1 * (1 - scrollProgress)})`,
                borderColor: scrollProgress > 0.1 
                  ? 'rgba(var(--border), 0.5)' 
                  : `rgba(255, 255, 255, ${0.2 + (0.3 * (1 - scrollProgress))})`,
                color: scrollProgress > 0.1 
                  ? 'var(--foreground)' 
                  : `rgba(255, 255, 255, ${1 - (scrollProgress * 0.8)})`,
              }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-6 h-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden bg-white/95 backdrop-blur-xl border-t border-border/50 shadow-2xl"
            >
              <div className="container mx-auto px-6 py-6 space-y-4">
                {/* Only show nav items on home page */}
                {navItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.a
                      key={item.href}
                      href={item.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-4 px-4 py-4 rounded-2xl font-semibold text-foreground/80 hover:text-accent hover:bg-accent/5 transition-all duration-300 group"
                    >
                      <Icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                      <span>{item.label}</span>
                    </motion.a>
                  );
                })}
                
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="pt-4 border-t border-border/30"
                >
                  <Button 
                    variant="default" 
                    size="lg"
                    className="w-full bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent text-white shadow-2xl rounded-2xl py-6 font-bold group transition-all duration-300"
                    onClick={() => {
                      if (isHomePage) {
                        navigate('/upload');
                      } else {
                        navigate('/');
                      }
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    {isHomePage ? (
                      <>
                        <Calculator className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
                        Inizia gratis
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                      </>
                    ) : (
                      <>
                        <Home className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
                        Torna alla Home
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Spacer for fixed header */}
      <div className="h-20 lg:h-24"></div>
    </>
  );
};

export default Header;