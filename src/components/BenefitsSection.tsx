import { Shield, Clock, Calculator, Users } from "lucide-react";
import { Card } from "@/components/ui/card";

const BenefitsSection = () => {
  const benefits = [
    {
      icon: Shield,
      title: "Stime affidabili e precise",
      description: "Algoritmi AI addestrati su oltre 15.000 preventivi reali del settore edilizio italiano",
      number: "15.000+",
      label: "preventivi analizzati"
    },
    {
      icon: Clock,
      title: "Decisioni immediate e informate", 
      description: "Perfetto per valutare un acquisto: scopri subito se conviene ristrutturare quella casa",
      number: "5 min",
      label: "per avere chiarezza"
    },
    {
      icon: Calculator,
      title: "Confronta e risparmia",
      description: "Verifica se i preventivi ricevuti sono in linea con i prezzi di mercato reali",
      number: "100%",
      label: "trasparenza sui costi"
    },
    {
      icon: Users,
      title: "Network di professionisti",
      description: "Accesso diretto a imprese qualificate e verificate nella tua zona per realizzare i lavori",
      number: "500+",
      label: "partner qualificati"
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
        
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {benefits.map((benefit, index) => (
            <Card key={index} className="group p-8 shadow-card hover:shadow-elegant transition-smooth border-none bg-card/50 backdrop-blur-sm hover:scale-105">
              <div className="flex items-start space-x-6">
                <div className="relative flex-shrink-0">
                  <div className="bg-gradient-accent rounded-2xl p-4 group-hover:scale-110 transition-smooth shadow-lg">
                    <benefit.icon className="h-8 w-8 text-white" />
                  </div>
                </div>
                
                <div className="flex-1 space-y-4">
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