import homeBuildAILogo from "@/assets/homebuildai-logo.png";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-16">
      <div className="container">
        <div className="grid md:grid-cols-3 gap-12">
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <img 
                src={homeBuildAILogo} 
                alt="HomeBuildAI - Il tuo alleato AI per ristrutturazioni" 
                className="h-12 w-auto object-contain"
              />
            </div>
            <p className="text-primary-foreground/90 leading-relaxed mb-6">
              Il tuo alleato intelligente per ristrutturazioni. 
              <strong className="text-accent-light">Rapido, gratuito ed efficace</strong> - 
              basato su oltre 15.000 preventivi reali.
            </p>
            <div className="flex items-center gap-4 text-sm text-primary-foreground/80">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-accent-light rounded-full"></div>
                <span>100% gratuito</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-accent-light rounded-full"></div>
                <span>Nessun impegno</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold mb-6 text-accent-light">I nostri servizi</h4>
            <ul className="space-y-3 text-primary-foreground/80">
              <li className="hover:text-primary-foreground transition-smooth cursor-pointer">✨ Analisi planimetrie con AI</li>
              <li className="hover:text-primary-foreground transition-smooth cursor-pointer">📊 Stime basate su 15.000+ preventivi</li>
              <li className="hover:text-primary-foreground transition-smooth cursor-pointer">📋 Capitolato tecnico dettagliato</li>
              <li className="hover:text-primary-foreground transition-smooth cursor-pointer">🤝 Network di 500+ partner qualificati</li>
              <li className="hover:text-primary-foreground transition-smooth cursor-pointer">⚡ Risultati in 5 minuti</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-6 text-accent-light">Supporto e informazioni</h4>
            <ul className="space-y-3 text-primary-foreground/80">
              <li><a href="#vantaggi" className="hover:text-primary-foreground transition-smooth">Perché sceglierci</a></li>
              <li><a href="#come-funziona" className="hover:text-primary-foreground transition-smooth">Come funziona</a></li>
              <li className="hover:text-primary-foreground transition-smooth cursor-pointer">Contatti</li>
              <li className="hover:text-primary-foreground transition-smooth cursor-pointer">Privacy Policy</li>
              <li className="hover:text-primary-foreground transition-smooth cursor-pointer">Termini di Servizio</li>
              <li>
                <a 
                  href="/admin/auth" 
                  className="text-xs text-primary-foreground/50 hover:text-primary-foreground/80 transition-smooth"
                >
                  Admin
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-primary-foreground/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-primary-foreground/60">
              &copy; 2024 HomeBuildAI. Tutti i diritti riservati.
            </p>
            <div className="flex items-center gap-6 text-sm text-primary-foreground/60">
              <span>🇮🇹 Made in Italy</span>
              <span>🛡️ Dati protetti</span>
              <span>⚡ Powered by AI</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;