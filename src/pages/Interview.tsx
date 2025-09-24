import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams, useNavigate } from "react-router-dom";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const Interview = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(null);
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const id = searchParams.get('leadId');
    if (!id) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "ID progetto mancante. Torna alla pagina di upload."
      });
      navigate('/upload');
      return;
    }
    
    setLeadId(id);
    
    // Start with AI greeting
    setMessages([{
      role: 'assistant',
      content: 'Ciao! Sono il consulente AI di BuildHomeAI. Ti farò alcune domande per capire meglio il tuo progetto di ristrutturazione e fornirti un capitolato personalizzato. Iniziamo: che tipo di immobile devi ristrutturare?'
    }]);
  }, [searchParams, toast, navigate]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !leadId) return;

    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-interview', {
        body: {
          leadId,
          messages: newMessages
        }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      const aiMessage: Message = { role: 'assistant', content: data.response };
      setMessages(prev => [...prev, aiMessage]);

      // Check if interview is complete
      if (data.interview_complete) {
        setIsComplete(true);
        toast({
          title: "Intervista completata!",
          description: "Tutte le informazioni sono state raccolte. Procediamo con la generazione del capitolato.",
        });
        
        // Navigate to next step after 2 seconds
        setTimeout(() => {
          // Navigate to capitolato generation page
          navigate(`/capitolato?leadId=${leadId}`);
        }, 3000);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: "destructive",
        title: "Errore di comunicazione",
        description: "Si è verificato un errore. Riprova."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <main className="container py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Intervista AI per la Ristrutturazione
            </h1>
            <p className="text-xl text-muted-foreground">
              Il nostro consulente AI ti guiderà per raccogliere tutte le informazioni necessarie
            </p>
          </div>

          <Card className="p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold">Chat con il Consulente AI</h2>
              {isComplete && <CheckCircle className="h-6 w-6 text-green-600 ml-auto" />}
            </div>
            
            {/* Messages */}
            <div className="space-y-4 mb-6 min-h-[400px] max-h-[500px] overflow-y-auto">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground ml-4'
                        : 'bg-secondary text-secondary-foreground mr-4'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-secondary text-secondary-foreground p-4 rounded-lg mr-4">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Il consulente sta scrivendo...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            {!isComplete && (
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Scrivi la tua risposta..."
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  variant="hero"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            )}

            {isComplete && (
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-green-800 font-semibold">Intervista completata!</p>
                <p className="text-green-700 text-sm">
                  Stiamo preparando il tuo capitolato personalizzato...
                </p>
              </div>
            )}
          </Card>

          {/* Info sidebar */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Suggerimenti</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Sii specifico nelle risposte per ottenere un capitolato più accurato</li>
              <li>• Non esitare a chiedere chiarimenti sui termini tecnici</li>
              <li>• L'intervista richiede circa 5-10 minuti</li>
            </ul>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Interview;