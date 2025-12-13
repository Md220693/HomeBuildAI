import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import {
  Calculator,
  FileText,
  ShieldCheck,
  Users,
} from "lucide-react";

const PremiumOverview = () => {
  const items = [
    {
      icon: Calculator,
      title: "Preventivo realistico",
      desc: "Basato su dati concreti e prezzi aggiornati. Una stima affidabile per decidere con serenità.",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      icon: FileText,
      title: "Capitolato professionale",
      desc: "Una descrizione completa e ordinata degli interventi, essenziale per lavorare con imprese e tecnici.",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      icon: ShieldCheck,
      title: "Report PDF curato e leggibile",
      desc: "Pensato per presentazioni, comparazioni e pianificazione del budget.",
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
    },
    {
      icon: Users,
      title: "Orientamento verso imprese qualificate",
      desc: "Solo professionisti verificati e realmente interessati al tuo progetto.",
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
  ];

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="container max-w-6xl relative">

        {/* Hero-style Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-5 py-2 mb-6">
            <span className="text-sm font-medium text-gray-600">
              Il tuo progetto merita chiarezza
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-5">
            La tua casa merita eccellenza
          </h2>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed mb-6">
            HomeBuildAI è il modo più moderno e trasparente per valutare il costo della tua ristrutturazione.
            Un’esperienza guidata, professionale e immediata, pensata per chi pretende qualità, precisione e serenità in ogni fase del progetto.
          </p>

          <motion.button
            className="bg-accent text-white px-10 py-4 rounded-xl font-bold hover:bg-accent/90 transition-all duration-300"
            onClick={() => window.scrollTo({ top: 600, behavior: "smooth" })}
          >
            Inizia la tua valutazione
          </motion.button>
        </motion.div>

        {/* Value Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4">
            Ristrutturazioni senza incertezze
          </h3>
          <p className="text-gray-600 max-w-2xl mx-auto mb-4">
            Una tecnologia intelligente che ti offre:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>Visibilità immediata sui costi reali</li>
            <li>Un capitolato chiaro, professionale e personalizzato</li>
            <li>Supporto affidabile nella scelta dell’impresa migliore</li>
            <li>Un approccio raffinato e rigoroso, per chi vuole iniziare con sicurezza</li>
          </ul>
        </motion.div>

        {/* Philosophy Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-center mb-20 px-6"
        >
          <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4">
            La Filosofia
          </h3>
          <p className="text-gray-600 max-w-3xl mx-auto mb-2">
            Ogni grande progetto nasce da una visione chiara. HomeBuildAI combina analisi avanzata, dati reali e sensibilità progettuale per offrirti una visione completa prima ancora di avviare i lavori.
          </p>
          <p className="text-gray-600 max-w-3xl mx-auto font-medium">
            Un unico obiettivo: darti la tranquillità di decidere bene, con informazioni precise, trasparenti e attendibili.
          </p>
        </motion.div>

        {/* What You Receive / Elegant Cards */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-20"
        >
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-8 rounded-xl border border-gray-200 bg-white hover:shadow-md transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.iconBg}`}>
                      <Icon className={`h-5 w-5 ${item.iconColor}`} />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h4>
                      <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Secondary CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4">
            Prenditi 5 minuti. Dai valore al tuo progetto.
          </h3>
          <motion.button
            className="bg-accent text-white px-10 py-4 rounded-xl font-bold hover:bg-accent/90 transition-all duration-300"
            onClick={() => window.scrollTo({ top: 600, behavior: "smooth" })}
          >
            Inizia ora
          </motion.button>
        </motion.div>

      </div>
    </section>
  );
};

export default PremiumOverview;
