import { Shield, Clock, Calculator, Users } from "lucide-react";
import { Card } from "@/components/ui/card";

const BenefitsSection = () => {
  const benefits = [
    {
      icon: Shield,
      title: "Consulenza professionale",
      description: "Analisi dettagliata basata su esperti del settore e algoritmi AI avanzati"
    },
    {
      icon: Clock,
      title: "Risparmia tempo",
      description: "Ottieni in minuti quello che richiederebbe giorni di consulenze tradizionali"
    },
    {
      icon: Calculator,
      title: "Stime accurate",
      description: "Range di costi realistici basati su database aggiornati del mercato"
    },
    {
      icon: Users,
      title: "Network di fornitori",
      description: "Accesso diretto a professionisti qualificati nella tua zona"
    }
  ];

  return (
    <section id="vantaggi" className="py-20 bg-background">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Perché scegliere BuildHomeAI
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            La tecnologia AI al servizio della tua ristrutturazione
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {benefits.map((benefit, index) => (
            <Card key={index} className="p-8 shadow-card hover:shadow-elegant transition-smooth border-l-4 border-l-accent">
              <div className="flex items-start space-x-4">
                <div className="bg-gradient-accent rounded-lg p-3 flex-shrink-0">
                  <benefit.icon className="h-6 w-6 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;