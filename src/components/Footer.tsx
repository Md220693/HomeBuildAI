import buildhomeaiLogo from "@/assets/buildhomeai-logo.png";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src={buildhomeaiLogo} 
                alt="BuildHomeAI Logo" 
                className="h-8 w-8 object-contain"
              />
              <h3 className="text-xl font-bold">BuildHomeAI</h3>
            </div>
            <p className="text-primary-foreground/80 leading-relaxed">
              AI + competenza del settore edilizio per stime affidabili 
              basate su migliaia di preventivi reali.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Servizi</h4>
            <ul className="space-y-2 text-primary-foreground/80">
              <li>Analisi planimetrie con AI</li>
              <li>Stime basate su dati reali</li>
              <li>Capitolato tecnico dettagliato</li>
              <li>Rete partner qualificati</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Supporto</h4>
            <ul className="space-y-2 text-primary-foreground/80">
              <li>FAQ</li>
              <li>Contatti</li>
              <li>Privacy Policy</li>
              <li>Termini di Servizio</li>
              <li>
                <a 
                  href="/admin/auth" 
                  className="hover:text-primary-foreground transition-smooth"
                >
                  Admin Login
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-primary-foreground/60">
          <p>&copy; 2024 BuildHomeAI. Tutti i diritti riservati.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;