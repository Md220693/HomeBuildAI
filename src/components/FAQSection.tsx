import { useState } from "react";
import { ChevronDown, Shield, Clock, Calculator, HelpCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "È davvero gratuito?",
      answer: "Sì, completamente gratuito! HomeBuildAI ti fornisce stime e capitolati senza costi nascosti. Guadagniamo solo se decidi di collaborare con le nostre imprese partner, ma non c'è alcun obbligo.",
      icon: Shield
    },
    {
      question: "Quanto sono accurate le vostre stime?",
      answer: "Le nostre stime sono basate su oltre 15.000 preventivi reali del mercato edilizio italiano. L'AI analizza migliaia di variabili per offrirti stime precise, tipicamente con uno scarto del 10-15% rispetto ai prezzi finali di mercato.",
      icon: Calculator
    },
    {
      question: "Cosa succede dopo aver ricevuto la stima?",
      answer: "Ricevi via email un capitolato dettagliato e una stima dei costi. Puoi utilizzarla per confrontare altri preventivi o, se vuoi, possiamo metterti in contatto con imprese qualificate nella tua zona. Nessun impegno!",
      icon: Clock
    },
    {
      question: "Devo caricare necessariamente planimetrie e foto?",
      answer: "No! L'AI può lavorare anche con una semplice descrizione del tuo progetto. Ovviamente, più informazioni fornisci (planimetrie, foto, dettagli), più precisa sarà la stima.",
      icon: HelpCircle
    },
    {
      question: "I miei dati sono al sicuro?",
      answer: "Assolutamente sì. I tuoi documenti e dati personali sono protetti con crittografia avanzata e utilizzati solo per generare la tua stima personalizzata. Non condividiamo mai i tuoi dati con terze parti senza il tuo consenso esplicito.",
      icon: Shield
    },
    {
      question: "Funziona per ogni tipo di ristrutturazione?",
      answer: "Sì! Dal semplice rifacimento bagno alla ristrutturazione completa, dall'efficientamento energetico alle modifiche strutturali. L'AI è addestrata su tutti i principali tipi di lavori edilizi.",
      icon: Calculator
    }
  ];

  return (
    <section className="py-24 bg-gradient-subtle">
      <div className="container">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Domande frequenti
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Tutto quello che devi sapere su HomeBuildAI. <br />
            <span className="text-accent font-medium">Hai altre domande? Contattaci!</span>
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <Card key={index} className="overflow-hidden shadow-card hover:shadow-elegant transition-smooth border-none bg-card/50 backdrop-blur-sm">
              <button
                className="w-full p-6 text-left flex items-center justify-between hover:bg-accent/5 transition-smooth group"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-accent rounded-lg flex items-center justify-center group-hover:scale-110 transition-smooth">
                    <faq.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-smooth">
                    {faq.question}
                  </h3>
                </div>
                <ChevronDown 
                  className={`h-5 w-5 text-muted-foreground transition-smooth group-hover:text-primary ${
                    openIndex === index ? 'rotate-180' : ''
                  }`} 
                />
              </button>
              
              {openIndex === index && (
                <div className="px-6 pb-6 pl-20">
                  <div className="bg-accent/5 rounded-lg p-4 border-l-4 border-accent">
                    <p className="text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-4 bg-primary/5 rounded-2xl p-6 border border-primary/10">
            <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
              <HelpCircle className="h-6 w-6 text-white" />
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-foreground mb-1">Hai altre domande?</h4>
              <p className="text-sm text-muted-foreground">Contattaci e ti risponderemo subito</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;