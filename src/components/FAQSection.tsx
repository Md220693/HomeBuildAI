import { useState, useEffect, useRef } from "react";
import { ChevronDown, Shield, Clock, Calculator, HelpCircle, CheckCircle } from "lucide-react";
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
      color: "text-emerald-600",
      iconBg: "bg-emerald-50"
    },
    {
      question: "Posso usare HomeBuildAI senza planimetria?",
      answer: "No, HomeBuildAI richiede planimetrie e foto dell'immobile. Questi documenti sono essenziali per l'analisi AI e la generazione di stime affidabili.",
      icon: HelpCircle,
      color: "text-blue-600",
      iconBg: "bg-blue-50"
    },
    {
      question: "Quanto sono accurate le stime?",
      answer: "Le nostre stime sono basate su migliaia di preventivi reali e algoritmi di AI avanzati. Offriamo una stima indicativa, ma per un preventivo vincolante è necessario un sopralluogo tecnico.",
      icon: Calculator,
      color: "text-amber-600",
      iconBg: "bg-amber-50"
    },
    {
      question: "Cosa succede dopo la stima?",
      answer: "Ricevi via email un capitolato dettagliato e una stima dei costi. Puoi utilizzarla per confrontare altri preventivi o metterti in contatto con imprese qualificate.",
      icon: Clock,
      color: "text-violet-600",
      iconBg: "bg-violet-50"
    },
    {
      question: "I miei dati sono al sicuro?",
      answer: "Assolutamente sì. I tuoi documenti e dati personali sono protetti con crittografia avanzata e utilizzati solo per generare la tua stima personalizzata.",
      icon: Shield,
      color: "text-sky-600",
      iconBg: "bg-sky-50"
    },
    {
      question: "Funziona per ogni tipo di ristrutturazione?",
      answer: "Sì! Dal semplice rifacimento bagno alla ristrutturazione completa, dall'efficientamento energetico alle modifiche strutturali.",
      icon: Calculator,
      color: "text-rose-600",
      iconBg: "bg-rose-50"
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
    <section className="py-20 bg-white relative overflow-hidden">
      
      <div className="container relative max-w-4xl">
        
        {/* Professional Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 mb-6">
            <span className="text-sm font-medium text-gray-600">FAQ</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
            Domande frequenti
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
            Risposte alle domande più comuni sul nostro servizio
          </p>
        </motion.div>

        {/* Clean FAQ Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="space-y-4"
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
            >
              <Card className="overflow-hidden rounded-xl border border-gray-200 bg-white hover:shadow-md transition-all duration-300">
                <button
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50/50 transition-all duration-300"
                  onClick={() => handleFAQClick(index)}
                >
                  <div className="flex items-center gap-4 flex-1">
                    {/* Clean Icon */}
                    <div className={`w-10 h-10 rounded-lg ${faq.iconBg} flex items-center justify-center flex-shrink-0`}>
                      <faq.icon className={`h-5 w-5 ${faq.color}`} />
                    </div>
                    
                    {/* Question */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 pr-4">
                        {faq.question}
                      </h3>
                    </div>
                  </div>
                  
                  {/* Chevron */}
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0"
                  >
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <ChevronDown 
                        className="h-4 w-4 text-gray-600" 
                      />
                    </div>
                  </motion.div>
                </button>
                
                {/* Answer */}
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
                        <div className="rounded-lg bg-gray-50 p-5 border-l-4 border-gray-300">
                          <motion.p 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, duration: 0.3 }}
                            className="text-gray-700 leading-relaxed"
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

        {/* Clean Contact Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-20 max-w-md mx-auto"
        >
          <div className="space-y-6">
            
            {/* Header */}
            <div className="text-center">
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                Altre domande?
              </h3>
              <p className="text-gray-600 text-sm">
                Contattaci per assistenza personalizzata
              </p>
            </div>
            
            {/* Info Box */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <CheckCircle className="h-5 w-5 text-gray-600" />
                <span className="font-medium text-gray-700 text-sm">
                  Tempo di risposta
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="text-2xl font-bold text-gray-900">
                  24 ore
                </div>
                <p className="text-gray-600 text-sm">
                  Per risposte complete e dettagliate
                </p>
              </div>
            </div>
            
            {/* Email */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
              <p className="text-gray-700 text-sm mb-3">
                Scrivici a
              </p>
              <div className="text-gray-900 font-medium bg-gray-50 rounded-lg py-3 px-4 border border-gray-300 text-base">
                info@homebuildai.site
              </div>
              <p className="text-gray-500 text-xs mt-3">
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