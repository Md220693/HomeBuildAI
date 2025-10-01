import { Shield, Clock, Calculator, Users } from "lucide-react";
import { Card } from "@/components/ui/card";

const BenefitsSection = () => {
  const benefits = [
  {
    icon: Clock,
    title: "Da settimane a 5 minuti",
    description: "Ottieni stima + capitolato + contatti fornitori in 5 minuti invece di settimane di ricerche e chiamate",
    number: "5",
    label: "minuti vs settimane"
  },
  {
    icon: Calculator,
    title: "Ristrutturazione trasparente", 
    description: "Stima + capitolato + fornitori qualificati. Basato su migliaia di preventivi reali, niente sorprese",
    number: "15.000+",
    label: "preventivi analizzati"
  },
  {
    icon: Users,
    title: "Imprese partner verificate",
    description: "Ricevi contatti solo da imprese qualificate della tua zona, già interessate al tuo progetto",
    number: "500+",
    label: "imprese partner"
  },
  {
    icon: Shield,
    title: "100% gratuito, nessun impegno",
    description: "Stima gratuita, capitolato gratuito, contatti gratuiti. Decidi tu se e quando procedere",
    number: "0€",
    label: "sempre gratuito"
  }
  ];

  return (
    <section id="vantaggi" className="py-24 bg-background">
      <div className="container">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Perché scegliere HomeBuildAI
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Il tuo <strong className="text-accent">alleato intelligente</strong> che unisce AI avanzata, 
            competenza del settore edilizio e una rete di professionisti verificati
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {benefits.map((benefit, index) => (
            <Card key={index} className="group p-8 hover:scale-105">
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  <div className="bg-accent rounded-lg p-4 group-hover:scale-110 transition-smooth">
                    <benefit.icon className="h-8 w-8 text-white" />
                  </div>
                </div>
                
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-smooth">
                      {benefit.title}
                    </h3>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl font-bold text-accent">{benefit.number}</span>
                      <span className="text-sm text-muted-foreground">{benefit.label}</span>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        {/* Social proof section */}
        <div className="mt-20 text-center">
          <div className="inline-flex items-center gap-8 bg-accent/5 rounded-2xl p-8 border border-accent/10">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">15.000+</div>
              <div className="text-sm text-muted-foreground">Preventivi analizzati</div>
            </div>
            <div className="w-px h-12 bg-border"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent mb-1">500+</div>
              <div className="text-sm text-muted-foreground">Imprese partner</div>
            </div>
            <div className="w-px h-12 bg-border"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">5 min</div>
              <div className="text-sm text-muted-foreground">Tempo medio</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;