import { Shield, Clock, Calculator, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

const BenefitsSection = () => {
  const benefits = [
    {
      icon: Clock,
      title: "Da settimane a 5 minuti",
      description: "Ottieni stima, capitolato e contatti con fornitori in soli 5 minuti invece di settimane di ricerche.",
      number: "5",
      label: "minuti vs settimane",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      iconBg: "bg-blue-100"
    },
    {
      icon: Calculator,
      title: "Trasparenza nei costi", 
      description: "Stime dettagliate basate su migliaia di preventivi reali, senza sorprese nascoste.",
      number: "15.000+",
      label: "preventivi analizzati",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      iconBg: "bg-emerald-100"
    },
    {
      icon: Users,
      title: "Partner qualificati",
      description: "Network di imprese certificate nella tua zona, già interessate al tuo progetto.",
      number: "500+",
      label: "imprese partner",
      color: "text-violet-600",
      bgColor: "bg-violet-50",
      iconBg: "bg-violet-100"
    },
    {
      icon: Shield,
      title: "Senza impegno",
      description: "Servizio completamente gratuito. Decidi autonomamente se e quando procedere.",
      number: "0€",
      label: "costo iniziale",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      iconBg: "bg-amber-100"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
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
    <section id="vantaggi" className="py-20 bg-white relative overflow-hidden scroll-mt-24">
      
      {/* Minimal background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-white"></div>
      
      <div className="container relative max-w-6xl">
        
        {/* Professional Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 mb-6">
            <span className="text-sm font-medium text-gray-600">VANTAGGI</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
            Perché scegliere HomeBuildAI
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
            La soluzione intelligente che unisce tecnologia avanzata e competenza settoriale
          </p>
        </motion.div>
        
        {/* Clean Benefits Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto"
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
            >
              <Card className="group p-8 hover:border-gray-300 transition-all duration-300 rounded-xl border border-gray-200 bg-white hover:shadow-md cursor-pointer overflow-hidden">
                
                <div className="relative z-10">
                  
                  {/* Clean Icon */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`w-12 h-12 rounded-lg ${benefit.iconBg} flex items-center justify-center`}>
                      <benefit.icon className={`h-6 w-6 ${benefit.color}`} />
                    </div>
                    
                    {/* Number Display */}
                    <div>
                      <div className={`text-2xl font-bold ${benefit.color}`}>
                        {benefit.number}
                      </div>
                      <div className="text-xs text-gray-500 font-medium">
                        {benefit.label}
                      </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {benefit.title}
                    </h3>
                    
                    <p className="text-gray-600 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
        
        {/* Minimal Social Proof */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <div className="inline-flex items-center divide-x divide-gray-300 bg-white border border-gray-200 rounded-lg px-8 py-6 shadow-sm">
            
            <div className="text-center px-6">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                15.000+
              </div>
              <div className="text-sm text-gray-600">Preventivi analizzati</div>
            </div>
            
            <div className="text-center px-6">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                500+
              </div>
              <div className="text-sm text-gray-600">Imprese partner</div>
            </div>
            
            <div className="text-center px-6">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                5 min
              </div>
              <div className="text-sm text-gray-600">Tempo medio</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default BenefitsSection;