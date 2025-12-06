import { Upload, MessageSquare, FileText, Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

const ProcessSteps = () => {
  const steps = [
    {
      icon: Upload,
      title: "Carica foto e planimetria",
      description: "Bastano delle foto fatte bene con il tuo smartphone e la planimetria dell'immobile!",
      time: "2 min",
      gradient: "from-primary/20 via-primary/10 to-primary/5",
      iconGradient: "from-primary to-primary/80"
    },
    {
      icon: MessageSquare,
      title: "Chat guidata con l'AI",
      description: "Ti facciamo le domande giuste. Niente termini complicati, tutto spiegato in modo semplice.",
      time: "3 min",
      gradient: "from-blue-500/20 via-blue-500/10 to-blue-500/5",
      iconGradient: "from-blue-500 to-blue-600"
    },
    {
      icon: FileText,
      title: "Condividi i tuoi riferimenti",
      description: "Chiediamo i tuoi dati per personalizzare il preventivo ed offrirti fornitori certificati, ovunque tu sia!",
      time: "30 sec",
      gradient: "from-accent/20 via-accent/10 to-accent/5",
      iconGradient: "from-accent to-accent/80"
    },
    {
      icon: Download,
      title: "Stima pronta!",
      description: "Capitolato dettagliato basato su oltre 15.000 preventivi reali. Direttamente nella tua email.",
      time: "Subito",
      gradient: "from-green-500/20 via-green-500/10 to-green-500/5",
      iconGradient: "from-green-500 to-green-600"
    }
  ];

  return (
    <section id="come-funziona" className="py-20 bg-gradient-to-b from-secondary/20 to-white relative overflow-hidden scroll-mt-24">
      
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.08),rgba(255,255,255,0))]"></div>
      
      <div className="container relative">
        
        {/* Title Section - Same as BenefitsSection */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16 space-y-4"
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-foreground leading-tight">
            La tua bussola 
            <span className="block bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              nelle ristrutturazioni!
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Segui pochi passaggi chiari e ottieni una stima accurata in pochissimo tempo.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative max-w-4xl mx-auto">
          
          {/* Connecting Line for Desktop */}
          <div className="hidden lg:block absolute top-20 left-1/2 -translate-x-1/2 w-4/5 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent rounded-full">
            <div className="h-full w-full bg-gradient-to-r from-primary/30 via-primary to-primary/30 rounded-full animate-pulse"></div>
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true, margin: "-50px" }}
                className="relative group"
              >
                
                {/* Step Number Badge */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-10 h-10 bg-gradient-to-br from-primary to-primary/80 text-white font-bold rounded-full flex items-center justify-center shadow-md z-10 border-2 border-white text-sm">
                  {index + 1}
                </div>

                {/* Card - Same sizing as BenefitsSection */}
                <Card className="p-6 text-center rounded-2xl border border-border/40 hover:border-primary/20 bg-white/80 backdrop-blur-sm hover:shadow-xl shadow-md cursor-pointer overflow-hidden relative">
                  
                  {/* Icon Wrapper - Same size as BenefitsSection */}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.gradient} mx-auto mb-4 flex items-center justify-center border border-border/20 shadow-md group-hover:scale-105 transition-transform duration-300`}>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br ${step.iconGradient} shadow-inner`}>
                      <step.icon className="h-5 w-5 text-white" />
                    </div>
                  </div>

                  {/* Content - Same text sizes as BenefitsSection */}
                  <h3 className="text-lg font-bold mb-2 text-foreground group-hover:text-primary transition-colors duration-300">
                    {step.title}
                  </h3>

                  <div className="inline-flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-1 rounded-full mb-3 font-medium">
                    ⏱️ {step.time}
                  </div>

                  <p className="text-muted-foreground leading-relaxed text-base group-hover:text-foreground/80 transition-colors duration-300">
                    {step.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Total Time Section - Compact like BenefitsSection social proof */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-16 text-center max-w-sm mx-auto"
        >
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center shadow-md">
            <p className="text-gray-700 text-base mb-2">
              Tempo totale stimato
            </p>
            <div className="text-2xl font-black bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">
              Solo 5 minuti
            </div>
            <p className="text-gray-600 text-sm">
              Per avere chiarezza completa sul tuo progetto di ristrutturazione
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProcessSteps;