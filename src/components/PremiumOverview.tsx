import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Calculator, FileText, ShieldCheck, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PremiumOverview = () => {
  const navigate = useNavigate();

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
    <section className="pt-16 pb-8 bg-white">
      <div className="container max-w-6xl">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-5 py-2 mb-5">
            <span className="text-sm font-medium text-gray-600">
              Il tuo progetto merita chiarezza
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-5">
            La tua casa merita eccellenza
          </h2>

          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            HomeBuildAI è il modo più moderno e trasparente per valutare
            il costo della tua ristrutturazione.
          </p>
        </motion.div>

        {/* VALUE GRID */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4">
            Ristrutturazioni senza incertezze
          </h3>

          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            Una tecnologia intelligente che ti offre chiarezza e controllo.
          </p>

          <div className="grid sm:grid-cols-2 gap-5 max-w-4xl mx-auto text-left">
            {[
              {
                title: "Costi chiari fin da subito",
                desc: "Visibilità immediata sui costi reali.",
              },
              {
                title: "Capitolato professionale",
                desc: "Documento strutturato per imprese e tecnici.",
              },
              {
                title: "Scelta dell’impresa guidata",
                desc: "Supporto affidabile nella selezione.",
              },
              {
                title: "Decisioni consapevoli",
                desc: "Approccio rigoroso e senza sorprese.",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.06 }}
                viewport={{ once: true }}
                className="bg-gray-50 border border-gray-200 rounded-xl p-5"
              >
                <h4 className="font-semibold text-gray-900 mb-1">
                  {item.title}
                </h4>
                <p className="text-gray-600 text-sm">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* TESTIMONIAL */}
        <motion.blockquote
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center mb-12"
        >
          <p className="text-lg md:text-xl italic text-gray-800 font-medium">
            “Con HomeBuildAI abbiamo finalmente capito cosa aspettarci dal nostro progetto.
            Preciso, semplice, immediato.”
          </p>
          <span className="block mt-3 text-sm text-gray-500">
            — Francesca & Marco, Milano
          </span>
        </motion.blockquote>

        {/* FEATURE CARDS */}
        <motion.div className="grid md:grid-cols-2 gap-5 max-w-5xl mx-auto mb-10">
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <Card key={index} className="p-7 rounded-xl border">
                <div className="flex gap-4">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${item.iconBg}`}>
                    <Icon className={`h-5 w-5 ${item.iconColor}`} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {item.title}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </motion.div>

        {/* CTA */}
        <motion.div className="text-center">
          <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4">
            Prenditi 5 minuti. Dai valore al tuo progetto.
          </h3>
          <motion.button
            className="bg-accent text-white px-10 py-4 rounded-xl font-bold hover:bg-accent/90"
            onClick={() => navigate("/upload")}
          >
            Inizia ora
          </motion.button>
        </motion.div>

      </div>
    </section>
  );
};

export default PremiumOverview;
