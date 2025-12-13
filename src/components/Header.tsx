import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import homeBuildAILogo from "@/assets/homebuildai-new-logo.png";
import { Menu, X, Home, Calculator, Star, ArrowRight } from "lucide-react";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isHomePage = location.pathname === "/";

  // Detect scrolling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // NEW: Real page navigation
  const navItems = [
    { to: "/come-funziona", label: "Come funziona", icon: Calculator },
    { to: "/vantaggi", label: "Perché sceglierci", icon: Star },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 h-20 lg:h-24 border-b transition-all duration-300
          ${
            isScrolled
              ? "bg-white shadow-md border-gray-200"
              : "bg-white/70 backdrop-blur-sm"
          }`}
      >
        <div className="container mx-auto px-6 h-full flex items-center justify-between">
          
          {/* Logo + Page Title */}
          <div className="flex items-center gap-4">
            <img
              src={homeBuildAILogo}
              alt="HomeBuildAI"
              className="h-14 w-auto cursor-pointer"
              onClick={() => {
                navigate("/");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <Link
                  key={index}
                  to={item.to}
                  className={`flex items-center gap-2 font-semibold transition
                    ${
                      location.pathname === item.to
                        ? "text-accent"
                        : "text-gray-700 hover:text-accent"
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}

            <Button
              className="bg-accent text-white px-6 py-3 font-bold rounded-xl flex items-center gap-2"
              onClick={() => navigate(isHomePage ? "/upload" : "/")}
            >
              {isHomePage ? (
                <>
                  <Calculator className="w-5 h-5" />
                  Inizia gratis
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <Home className="w-5 h-5" />
                  Torna alla Home
                </>
              )}
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-3 rounded-xl border bg-white/95 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white shadow-md border-t">
            <div className="px-6 py-6 space-y-4 flex flex-col items-center">

              {navItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={index}
                    to={item.to}
                    className="flex items-center gap-3 text-gray-700 font-semibold py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}

              <Button
                className="w-full bg-accent text-white py-3 font-bold rounded-xl flex items-center justify-center gap-2"
                onClick={() => {
                  navigate(isHomePage ? "/upload" : "/");
                  setIsMobileMenuOpen(false);
                }}
              >
                {isHomePage ? (
                  <>
                    <Calculator className="w-5 h-5" />
                    Inizia gratis
                  </>
                ) : (
                  <>
                    <Home className="w-5 h-5" />
                    Torna alla Home
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
