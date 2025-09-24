import { Shield, Clock, Calculator, Users } from "lucide-react";
import { Card } from "@/components/ui/card";

const BenefitsSection = () => {
  const benefits = [
    {
      icon: Shield,
      title: "Stime basate su dati reali",
      description: "Modelli AI addestrati su migliaia di preventivi del settore edilizio"
    },
    {
      icon: Clock,
      title: "Decidi con consapevolezza",
      description: "Perfetto quando compri casa e vuoi capire se conviene ristrutturarla"
    },
    {
      icon: Calculator,
      title: "Verifica i prezzi",
      description: "Confronta preventivi ricevuti con le nostre stime di mercato"
    },
    {
      icon: Users,
      title: "Partner qualificati",
      description: "Accesso diretto a imprese affidabili nella tua zona per realizzare i lavori"
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
            AI + competenza del settore edilizio + rete partner qualificati
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