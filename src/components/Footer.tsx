import homeBuildAILogo from "@/assets/homebuildai-new-logo.png";
import { motion } from "framer-motion";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-white relative overflow-hidden">
      
      {/* Top Border */}
      <div className="h-1 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700"></div>
      
      <div className="container relative py-12">
        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-10 mb-12">
          
          {/* Company Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="lg:col-span-1"
          >
            <div className="mb-6">
              <img 
                src={homeBuildAILogo} 
                alt="HomeBuildAI - Il tuo alleato AI per ristrutturazioni" 
                className="h-10 w-auto object-contain mb-4"
              />
              <p className="text-gray-300 leading-relaxed mb-6 text-sm">
                Il tuo alleato intelligente per ristrutturazioni.
                <br /><br />
                <strong className="text-white font-medium">Rapido, gratuito ed efficace</strong> - basato su oltre 15.000 preventivi reali.
              </p>
            </div>
            <div className="space-y-2 text-gray-300 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span>100% gratuito</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                <span>Nessun impegno</span>
              </div>
            </div>
          </motion.div>
          
          {/* I nostri servizi */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h4 className="font-semibold text-gray-100 mb-6 text-lg">
              I nostri servizi
            </h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-gray-600 rounded-full mt-1.5"></div>
                <span>Analisi planimetrie con AI</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-gray-600 rounded-full"></div>
                <span>Stime basate su 15.000+ preventivi</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-gray-600 rounded-full"></div>
                <span>Capitolato tecnico dettagliato</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-gray-600 rounded-full"></div>
                <span>Network di 500+ partner qualificati</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-gray-600 rounded-full"></div>
                <span>Risultati in 5 minuti</span>
              </li>
            </ul>
          </motion.div>
          
          {/* Supporto e informazioni */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h4 className="font-semibold text-gray-100 mb-6 text-lg">
              Supporto e informazioni
            </h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li>
                <a 
                  href="#vantaggi"
                  className="hover:text-white transition-colors duration-200"
                >
                  Perché sceglierci
                </a>
              </li>
              <li>
                <a 
                  href="#come-funziona"
                  className="hover:text-white transition-colors duration-200"
                >
                  Come funziona
                </a>
              </li>
              <li>
                <span className="cursor-default">Privacy Policy</span>
              </li>
              <li>
                <span className="cursor-default">Termini di Servizio</span>
              </li>
              <li className="pt-2">
                <span className="text-gray-500 text-xs">Admin</span>
              </li>
            </ul>
          </motion.div>
        </div>
        
        {/* Bottom Section with Contacts */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="border-t border-gray-800 pt-8"
        >
          {/* Copyright and Made in Italy */}
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-6">
            <p className="text-gray-500 text-sm">
              © 2024 HomeBuildAI. Tutti i diritti riservati.
            </p>
            
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <span className="text-red-400">♥</span>
                Made in Italy
              </span>
              <span>•</span>
              <span>Dati protetti</span>
              <span>•</span>
              <span>Powered by AI</span>
            </div>
          </div>
          
          {/* Company Details - Centered as in image */}
          <div className="border-t border-gray-800 pt-6">
            <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8 text-sm text-gray-500">
              <div className="text-center md:text-left">
                <span>PIVA: IT06190260874</span>
              </div>
              <div className="hidden md:block">•</div>
              <div className="text-center md:text-left">
                <span>Email: info@homebuildai.site</span>
              </div>
              <div className="hidden md:block">•</div>
              <div className="text-center md:text-left">
                <span>Tel: +39 350 002 8628</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;