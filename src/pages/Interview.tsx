import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams, useNavigate } from "react-router-dom";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Interview() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [showForceComplete, setShowForceComplete] = useState(false);
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const id = searchParams.get("leadId");
    if (!id) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "ID progetto mancante. Torna alla pagina di upload.",
      });
      navigate("/upload");
      return;
    }
    setLeadId(id);
    setMessages([
      {
        role: "assistant",
        content:
          "Ciao! Sono il consulente AI di BuildHomeAI. Ti farò alcune domande per capire meglio il tuo progetto di ristrutturazione. Iniziamo: che tipo di immobile devi ristrutturare?",
      },
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !leadId) return;

    const userMessage: Message = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke(
        "ai-interview-v2",
        {
          body: {
            leadId,
            messages: newMessages,
          },
        }
      );

      if (error) throw error;

      const aiMessage: Message = {
        role: "assistant",
        content: data.response,
      };
      setMessages((prev) => [...prev, aiMessage]);

      if (data.interview_complete) {
        setIsComplete(true);
        toast({
          title: "Intervista completata!",
          description: "Prepariamo ora il tuo capitolato.",
        });
        setTimeout(() => {
          navigate(`/contact-verification?leadId=${leadId}`);
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Errore di comunicazione",
        description: "Riprova a inviare il messaggio.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      <Header />

      <main className="flex-1 pt-6 pb-10 px-4 flex justify-center">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Section */}
          <Card className="lg:col-span-2 p-6 shadow-lg rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold">Chat con il Consulente AI</h2>
            </div>

            {/* Messages */}
            <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-2 rounded-lg">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${
                    m.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-xl text-sm leading-relaxed shadow-sm ${
                      m.role === "user"
                        ? "bg-primary text-white"
                        : "bg-slate-100 text-slate-900"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 text-slate-700 p-3 rounded-xl flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Sta scrivendo...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            {!isComplete && (
              <div className="mt-4 flex gap-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Scrivi la tua risposta..."
                  disabled={isLoading}
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") sendMessage();
                  }}
                />
                <Button
                  variant="hero"
                  disabled={!input.trim() || isLoading}
                  onClick={sendMessage}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            )}

            {isComplete && (
              <div className="mt-4 p-4 bg-green-50 rounded-xl text-center border border-green-200">
                <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="font-semibold text-green-700">
                  Intervista completata!
                </p>
                <p className="text-green-600 text-sm">
                  Stiamo preparando il tuo capitolato...
                </p>
              </div>
            )}
          </Card>

          {/* Sidebar */}
          <Card className="p-5 rounded-2xl shadow-md h-fit bg-blue-50 border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Suggerimenti</h3>
            <ul className="text-blue-800 text-sm space-y-2">
              <li>• Sii specifico nelle risposte</li>
              <li>• Chiedi chiarimenti sui termini tecnici</li>
              <li>• L'intervista dura 5-10 minuti</li>
            </ul>
          </Card>
        </div>
      </main>
    </div>
  );
}