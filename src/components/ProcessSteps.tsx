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
      color: "text-blue-600",
      iconBg: "bg-blue-100"
    },
    {
      icon: MessageSquare,
      title: "Chat guidata con l'AI",
      description: "Ti facciamo le domande giuste. Niente termini complicati, tutto spiegato in modo semplice.",
      time: "3 min",
      color: "text-emerald-600",
      iconBg: "bg-emerald-100"
    },
    {
      icon: FileText,
      title: "Condividi i tuoi riferimenti",
      description: "Chiediamo i tuoi dati per personalizzare il preventivo ed offrirti fornitori certificati, ovunque tu sia!",
      time: "30 sec",
      color: "text-violet-600",
      iconBg: "bg-violet-100"
    },
    {
      icon: Download,
      title: "Stima pronta!",
      description: "Capitolato dettagliato basato su oltre 15.000 preventivi reali. Direttamente nella tua email.",
      time: "Subito",
      color: "text-amber-600",
      iconBg: "bg-amber-100"
    }
  ];

  return (
    <section id="come-funziona" className="py-20 bg-gray-50 relative overflow-hidden scroll-mt-24">
      
      <div className="container relative max-w-6xl">
        
        {/* Professional Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 mb-6">
            <span className="text-sm font-medium text-gray-600">PROCESSO</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
            La tua bussola nelle ristrutturazioni!
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
            Segui pochi passaggi chiari e ottieni una stima accurata in pochissimo tempo.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="relative max-w-5xl mx-auto">
          
          {/* Timeline Connector */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300">
            <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 bg-gradient-to-r from-blue-500/20 via-emerald-500/20 to-amber-500/20 blur-sm"></div>
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                
                {/* Step Number */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-10 h-10 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-full flex items-center justify-center shadow-sm z-10">
                  {index + 1}
                </div>

                {/* Step Card */}
                <Card className="p-8 text-center rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-300">
                  
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-xl ${step.iconBg} mx-auto mb-6 flex items-center justify-center border border-gray-100`}>
                    <step.icon className={`h-8 w-8 ${step.color}`} />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {step.title}
                  </h3>

                  <div className="inline-flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full mb-4 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                    {step.time}
                  </div>

                  <p className="text-gray-600 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Time Summary */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-20 max-w-md mx-auto"
        >
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center shadow-sm">
            <p className="text-gray-600 text-sm uppercase tracking-wider font-medium mb-2">
              Tempo totale stimato
            </p>
            <div className="text-3xl font-bold text-gray-900 mb-3">
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