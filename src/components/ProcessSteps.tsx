import { Upload, MessageSquare, FileText, Download } from "lucide-react";
import { Card } from "@/components/ui/card";

const ProcessSteps = () => {
  const steps = [
    {
      icon: Upload,
      title: "Carica planimetria + foto",
      description: "Carica la planimetria dell'immobile e almeno 4-6 foto di tutte le stanze (obbligatorio)",
      time: "2 min",
      color: "accent"
    },
    {
      icon: MessageSquare,
      title: "Chat guidata con l'AI",
      description: "Ti facciamo le domande giuste. Niente termini complicati, tutto spiegato in modo semplice.",
      time: "3 min", 
      color: "primary"
    },
    {
      icon: FileText,
      title: "I tuoi contatti",
      description: "Solo nome ed email per ricevere il tuo capitolato personalizzato. Nessun impegno.",
      time: "30 sec",
      color: "accent"
    },
    {
      icon: Download,
      title: "Stima pronta!",
      description: "Capitolato dettagliato basato su oltre 15.000 preventivi reali. Direttamente nella tua email.",
      time: "Subito",
      color: "primary"
    }
  ];

  return (
    <section id="come-funziona" className="py-24 bg-gradient-subtle">
      <div className="container">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Come funziona HomeBuildAI
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Un processo semplice che ti porta dalla confusione alla chiarezza in soli <strong className="text-accent">5 minuti</strong>
          </p>
        </div>
        
        <div className="relative">
          {/* Progress line */}
          <div className="hidden lg:block absolute top-24 left-1/2 transform -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-accent via-primary to-accent opacity-30"></div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <Card className="p-8 text-center shadow-card hover:shadow-elegant transition-smooth border-none bg-card/50 backdrop-blur-sm group hover:scale-105">
                  {/* Step number */}
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm shadow-lg">
                    {index + 1}
                  </div>
                  
                  <div className={`bg-gradient-${step.color} rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-smooth shadow-lg`}>
                    <step.icon className="h-10 w-10 text-white" />
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-2">
                        {step.title}
                      </h3>
                      <div className="inline-flex items-center gap-1 bg-accent/10 text-accent font-medium px-3 py-1 rounded-full text-sm">
                        ⏱️ {step.time}
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
        
        {/* CTA section */}
        <div className="text-center mt-16">
          <p className="text-lg text-muted-foreground mb-6">
            Totale: <span className="text-2xl font-bold text-primary">5 minuti</span> per avere chiarezza sul tuo progetto
          </p>
        </div>
      </div>
    </section>
  );
};

export default ProcessSteps;