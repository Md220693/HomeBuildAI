import { Shield, Clock, Calculator, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

const BenefitsSection = () => {
  const benefits = [
    {
      icon: Clock,
      title: "Da settimane a 5 minuti",
      description: "Ottieni stima + capitolato + contatti fornitori in 5 minuti invece di settimane di ricerche e chiamate",
      number: "5",
      label: "minuti vs settimane",
      gradient: "from-orange-500 to-amber-500",
      bgGradient: "from-orange-500/10 to-amber-500/5"
    },
    {
      icon: Calculator,
      title: "Ristrutturazione trasparente", 
      description: "Stima + capitolato + fornitori qualificati. Basato su migliaia di preventivi reali, niente sorprese",
      number: "15.000+",
      label: "preventivi analizzati",
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-500/10 to-cyan-500/5"
    },
    {
      icon: Users,
      title: "Imprese partner verificate",
      description: "Ricevi contatti solo da imprese qualificate della tua zona, già interessate al tuo progetto",
      number: "500+",
      label: "imprese partner",
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-500/10 to-emerald-500/5"
    },
    {
      icon: Shield,
      title: "100% gratuito, nessun impegno",
      description: "Stima gratuita, capitolato gratuito, contatti gratuiti. Decidi tu se e quando procedere",
      number: "0€",
      label: "sempre gratuito",
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-500/10 to-pink-500/5"
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
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <section id="vantaggi" className="py-20 bg-gradient-to-b from-background to-secondary/20 relative overflow-hidden scroll-mt-24">
      
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.08),rgba(255,255,255,0))]"></div>
      
      <div className="container relative">
        
        {/* Header Section - Same as FAQ */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16 space-y-4"
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-foreground leading-tight">
            Perché scegliere
            <span className="block bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              HomeBuildAI
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Il tuo <strong className="text-accent font-semibold">alleato intelligente</strong> che unisce AI avanzata, 
            competenza del settore edilizio e una rete di professionisti verificati
          </p>
        </motion.div>
        
        {/* Benefits Grid - Same sizing as FAQ */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto"
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
            >
              <Card className="group p-6 hover:scale-[1.02] transition-all duration-300 rounded-2xl border border-border/40 hover:border-primary/20 bg-white/80 backdrop-blur-sm hover:shadow-xl shadow-md cursor-pointer overflow-hidden relative">
                
                {/* Animated Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${benefit.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                
                <div className="relative z-10 flex items-start space-x-4">
                  
                  {/* Icon Container - Same size as FAQ */}
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${benefit.gradient} flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-md relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-white/10"></div>
                      <benefit.icon className="h-5 w-5 text-white relative z-10" />
                    </div>
                  </div>
                  
                  {/* Content - Same text sizes as FAQ */}
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                        {benefit.title}
                      </h3>
                      
                      {/* Number Display */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl font-black bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent group-hover:from-primary group-hover:to-primary/70 transition-all duration-300">
                          {benefit.number}
                        </span>
                        <span className="text-xs text-muted-foreground font-medium bg-muted/50 px-2 py-1 rounded-full">
                          {benefit.label}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground leading-relaxed text-base group-hover:text-foreground/80 transition-colors duration-300">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
        
        {/* Social Proof Section - With colors restored */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-6 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl p-6 border border-border/40 shadow-lg backdrop-blur-sm">
            
            <div className="text-center group">
              <div className="text-2xl lg:text-2xl font-black bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                15.000+
              </div>
              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Preventivi analizzati</div>
            </div>
            
            <div className="w-px h-12 bg-gradient-to-b from-transparent via-border to-transparent"></div>
            
            <div className="text-center group">
              <div className="text-2xl lg:text-2xl font-black bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                500+
              </div>
              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Imprese partner</div>
            </div>
            
            <div className="w-px h-12 bg-gradient-to-b from-transparent via-border to-transparent"></div>
            
            <div className="text-center group">
              <div className="text-2xl lg:text-2xl font-black bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                5 min
              </div>
              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Tempo medio</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default BenefitsSection;