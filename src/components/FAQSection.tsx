import { useState, useEffect, useRef } from "react";
import { ChevronDown, Shield, Clock, Calculator, HelpCircle, MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  
  const startAutoCloseTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    timerRef.current = setTimeout(() => {
      setOpenIndex(null);
    }, 5000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleFAQClick = (index: number) => {
    if (openIndex === index) {
      setOpenIndex(null);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    } else {
      setOpenIndex(index);
      startAutoCloseTimer();
    }
  };

  const faqs = [
    {
      question: "È davvero gratuito?",
      answer: "Sì, completamente gratuito! HomeBuildAI ti fornisce stime e capitolati senza costi nascosti. Guadagniamo solo se decidi di collaborare con le nostre imprese partner, ma non c'è alcun obbligo.",
      icon: Shield,
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-500/10 to-emerald-500/5"
    },
    {
      question: "Posso usare HomeBuildAI senza planimetria o foto?",
      answer: "No, HomeBuildAI funziona solo con planimetrie e foto dell'immobile. Questi documenti sono obbligatori perché permettono all'AI di analizzare accuratamente lo spazio e generare stime affidabili. Servono almeno 1 planimetria e 4-6 foto delle stanze.",
      icon: HelpCircle,
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-500/10 to-cyan-500/5"
    },
    {
      question: "Quanto sono accurate le vostre stime?",
      answer: "Le nostre stime sono basate su migliaia di preventivi reali e algoritmi di AI avanzati. Offriamo una stima indicativa con un range di affidabilità, ma per un preventivo vincolante è sempre necessario un sopralluogo tecnico. HomeBuildAI è un intermediario tecnologico e non esegue i lavori.",
      icon: Calculator,
      gradient: "from-orange-500 to-amber-500",
      bgGradient: "from-orange-500/10 to-amber-500/5"
    },
    {
      question: "Cosa succede dopo aver ricevuto la stima?",
      answer: "Ricevi via email un capitolato dettagliato e una stima dei costi. Puoi utilizzarla per confrontare altri preventivi o, se vuoi, possiamo metterti in contatto con imprese qualificate nella tua zona. Nessun impegno!",
      icon: Clock,
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-500/10 to-pink-500/5"
    },
    {
      question: "I miei dati sono al sicuro?",
      answer: "Assolutamente sì. I tuoi documenti e dati personali sono protetti con crittografia avanzata e utilizzati solo per generare la tua stima personalizzata. Non condividiamo mai i tuoi dati con terze parti senza il tuo consenso esplicito.",
      icon: Shield,
      gradient: "from-indigo-500 to-blue-500",
      bgGradient: "from-indigo-500/10 to-blue-500/5"
    },
    {
      question: "Funziona per ogni tipo di ristrutturazione?",
      answer: "Sì! Dal semplice rifacimento bagno alla ristrutturazione completa, dall'efficientamento energetico alle modifiche strutturali. L'AI è addestrata su tutti i principali tipi di lavori edilizi.",
      icon: Calculator,
      gradient: "from-red-500 to-orange-500",
      bgGradient: "from-red-500/10 to-orange-500/5"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <section className="py-20 bg-gradient-to-b from-secondary/20 to-background relative overflow-hidden">
      
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.08),rgba(255,255,255,0))]"></div>
      
      <div className="container relative">
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16 space-y-4"
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-foreground leading-tight">
            Domande
            <span className="block bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Frequenti
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Tutto quello che devi sapere su HomeBuildAI
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="max-w-4xl mx-auto space-y-4"
        >
          {faqs.map((faq, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="overflow-hidden rounded-2xl border border-border/40 hover:border-primary/20 transition-all duration-300 hover:shadow-xl shadow-md bg-white/80 backdrop-blur-sm group cursor-pointer">
                <button
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-secondary/30 transition-all duration-300 group"
                  onClick={() => handleFAQClick(index)}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${faq.gradient} flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-md relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-white/10"></div>
                      <faq.icon className="h-5 w-5 text-white relative z-10" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300 pr-4">
                        {faq.question}
                      </h3>
                    </div>
                  </div>
                  
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0"
                  >
                    <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center group-hover:bg-primary/10 transition-colors duration-300">
                      <ChevronDown 
                        className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors duration-300" 
                      />
                    </div>
                  </motion.div>
                </button>
                
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="overflow-hidden"
                      onMouseEnter={() => {
                        if (timerRef.current) {
                          clearTimeout(timerRef.current);
                        }
                      }}
                      onMouseLeave={() => {
                        startAutoCloseTimer();
                      }}
                    >
                      <div className="px-6 pb-6">
                        <div className={`rounded-xl p-4 border-l-4 bg-gradient-to-r ${faq.bgGradient} border-primary/50 shadow-inner`}>
                          <motion.p 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, duration: 0.3 }}
                            className="text-foreground/80 leading-relaxed text-base font-medium"
                          >
                            {faq.answer}
                          </motion.p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Small Email Contact Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="max-w-sm mx-auto mt-16"
        >
          <div className="space-y-5">
            
            {/* Title with Icon */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <MessageCircle className="h-4 w-4 text-gray-600" />
                <h3 className="text-xl font-bold text-foreground">
                  Hai altre domande?
                </h3>
              </div>
              <p className="text-gray-600 text-sm">
                Scrivici una email per ricevere assistenza
              </p>
            </div>
            
            {/* Info Box - Compact */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-4 space-y-3 text-center">
              <div className="flex items-center justify-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-gray-600" />
                <span className="font-semibold text-gray-700 text-sm">
                  Tempo di risposta
                </span>
              </div>
              
              <div className="space-y-1">
                <div className="text-xl font-bold text-gray-800">
                  24 ore
                </div>
                <p className="text-gray-600 text-xs">
                  Per risposte complete alle tue domande
                </p>
              </div>
            </div>
            
            {/* Email Information - Compact */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
              <p className="text-gray-700 text-sm mb-2">
                Scrivici a:
              </p>
              <div className="text-base font-medium text-gray-900 bg-gray-50 rounded-md py-2 px-3 border border-gray-300/50">
                support@homebuildai.site
              </div>
              <p className="text-gray-500 text-xs mt-2">
                Rispondiamo entro 24 ore nei giorni lavorativi
              </p>
            </div>
            
          </div>
        </motion.div>
        
      </div>
    </section>
  );
};

export default FAQSection;