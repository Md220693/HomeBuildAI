import { Upload, MessageSquare, FileText, Download } from "lucide-react";
import { Card } from "@/components/ui/card";

const ProcessSteps = () => {
  const steps = [
    {
      icon: Upload,
      title: "1. Carica planimetria e foto",
      description: "Almeno 1 planimetria (PDF/JPG/PNG) e minimo 4 foto dell'immobile"
    },
    {
      icon: MessageSquare,
      title: "2. Rispondi alle domande guidate",
      description: "L'AI ti spiega i termini tecnici e traduce le tue risposte in un capitolato"
    },
    {
      icon: FileText,
      title: "3. Inserisci i tuoi dati",
      description: "Nome, cognome, email, telefono per ricevere il capitolato"
    },
    {
      icon: Download,
      title: "4. Ottieni stima affidabile",
      description: "Capitolato PDF basato su migliaia di preventivi reali"
    }
  ];

  return (
    <section id="come-funziona" className="py-20 bg-gradient-subtle">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Come funziona BuildHomeAI
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Processo semplice e guidato per ottenere stima e capitolato personalizzati
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <Card key={index} className="p-6 text-center shadow-card hover:shadow-elegant transition-smooth">
              <div className="bg-gradient-primary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <step.icon className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {step.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProcessSteps;