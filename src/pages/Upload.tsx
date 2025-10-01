import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload as UploadIcon, FileText, Image, X, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface UploadedFile {
  file: File;
  id: string;
  type: 'planimetria' | 'foto';
}

const Upload = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [skipFiles, setSkipFiles] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFileUpload = (files: FileList | null, type: 'planimetria' | 'foto') => {
    if (!files) return;

    const validFiles = Array.from(files).filter(file => {
      const isValidType = type === 'planimetria' 
        ? file.type.includes('pdf') || file.type.includes('image')
        : file.type.includes('image');
      
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB max
      
      if (!isValidType) {
        toast({
          variant: "destructive",
          title: "Formato file non supportato",
          description: `${file.name} non è nel formato corretto`
        });
        return false;
      }
      
      if (!isValidSize) {
        toast({
          variant: "destructive", 
          title: "File troppo grande",
          description: `${file.name} supera il limite di 10MB`
        });
        return false;
      }
      
      return true;
    });

    const newFiles = validFiles.map(file => ({
      file,
      id: `${Date.now()}-${Math.random()}`,
      type
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
    
    if (newFiles.length > 0) {
      toast({
        title: "File caricati con successo",
        description: `${newFiles.length} file${newFiles.length > 1 ? '' : ''} aggiunt${newFiles.length > 1 ? 'i' : 'o'}`
      });
    }
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const uploadFileToSupabase = async (file: File, folder: string): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error } = await supabase.storage
      .from('leads-uploads')
      .upload(filePath, file);

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    return filePath;
  };

  const handleProceedWithAI = async () => {
    if (!canProceed) return;
    
    setIsUploading(true);
    
    try {
      let planimetriaUrl: string | null = null;
      const fotoUrls: string[] = [];

      // Upload planimetria only if available
      if (planimetrie.length > 0) {
        const planimetriaFile = planimetrie[0].file;
        planimetriaUrl = await uploadFileToSupabase(planimetriaFile, 'planimetrie');
        
        if (!planimetriaUrl) {
          throw new Error('Errore nel caricamento della planimetria');
        }
      }

      // Upload foto only if available
      if (foto.length > 0) {
        for (const fotoFile of foto) {
          const fotoUrl = await uploadFileToSupabase(fotoFile.file, 'foto');
          if (!fotoUrl) {
            throw new Error(`Errore nel caricamento della foto ${fotoFile.file.name}`);
          }
          fotoUrls.push(fotoUrl);
        }
      }

      // Create lead in database
      const { data: lead, error } = await supabase
        .from('leads')
        .insert({
          status: 'new',
          planimetria_url: planimetriaUrl,
          foto_urls: fotoUrls.length > 0 ? fotoUrls : null
        })
        .select()
        .single();

      if (error) {
        throw new Error('Errore nel salvataggio del progetto');
      }

      toast({
        title: skipFiles ? "Procediamo con l'intervista!" : "File caricati con successo!",
        description: skipFiles 
          ? "L'AI raccoglierà tutte le informazioni tramite l'intervista"
          : "Procediamo con l'intervista AI per analizzare il tuo progetto"
      });

      // Navigate to interview page with leadId
      navigate(`/interview?leadId=${lead.id}`);
      
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        variant: "destructive",
        title: "Errore nel caricamento",
        description: error instanceof Error ? error.message : "Riprova più tardi"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const planimetrie = uploadedFiles.filter(f => f.type === 'planimetria');
  const foto = uploadedFiles.filter(f => f.type === 'foto');
  
  const hasMinimumFiles = foto.length >= 4 || planimetrie.length >= 1;
  const canProceed = hasMinimumFiles || skipFiles;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <main className="container py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Carica foto e planimetria (opzionale)
            </h1>
            <p className="text-xl text-muted-foreground mb-4">
              Carica almeno 4 foto o 1 planimetria per una stima più accurata. Puoi anche proseguire senza caricare file se preferisci.
            </p>
            <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 text-sm text-foreground/80">
              <p className="mb-2"><strong>Formati supportati:</strong> PDF, JPG, PNG per planimetrie; JPG, PNG per foto.</p>
              <p className="mb-2"><strong>Per migliori risultati:</strong> Carica foto con luce naturale e planimetria chiara. Più materiale fornisci, più accurata sarà la stima.</p>
              <p><strong>Privacy:</strong> I tuoi dati restano privati e non saranno condivisi senza il tuo consenso.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Upload Planimetrie */}
            <Card className="p-6">
              <div className="text-center mb-4">
                <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Planimetrie</h2>
                <p className="text-muted-foreground mb-4">
                  Opzionale - Consigliata (PDF, JPG, PNG)
                </p>
              </div>
              
              <label className="block">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileUpload(e.target.files, 'planimetria')}
                  className="hidden"
                />
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-smooth cursor-pointer">
                  <UploadIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">
                    Clicca per selezionare i file
                  </p>
                </div>
              </label>

              {planimetrie.length > 0 && (
                <div className="mt-4 space-y-2">
                  {planimetrie.map((uploaded) => (
                    <div key={uploaded.id} className="flex items-center justify-between p-2 bg-secondary rounded">
                      <span className="text-sm text-foreground truncate">
                        {uploaded.file.name}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(uploaded.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-4 flex items-center">
                {planimetrie.length >= 1 ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-muted-foreground mr-2" />
                )}
                <span className={`text-sm ${planimetrie.length >= 1 ? 'text-green-600' : 'text-muted-foreground'}`}>
                  {planimetrie.length} di 1+ richieste
                </span>
              </div>
            </Card>

            {/* Upload Foto */}
            <Card className="p-6">
              <div className="text-center mb-4">
                <Image className="h-12 w-12 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Foto</h2>
                <p className="text-muted-foreground mb-4">
                  Opzionale - Consigliate almeno 4 foto (JPG, PNG)
                </p>
              </div>
              
              <label className="block">
                <input
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png"
                  onChange={(e) => handleFileUpload(e.target.files, 'foto')}
                  className="hidden"
                />
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-smooth cursor-pointer">
                  <UploadIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">
                    Clicca per selezionare le foto
                  </p>
                </div>
              </label>

              {foto.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {foto.map((uploaded) => (
                    <div key={uploaded.id} className="relative group">
                      <div className="aspect-square bg-secondary rounded flex items-center justify-center">
                        <Image className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-smooth"
                        onClick={() => removeFile(uploaded.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                      <p className="text-xs text-center mt-1 truncate">
                        {uploaded.file.name}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-4 flex items-center">
                {foto.length >= 4 ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-muted-foreground mr-2" />
                )}
                <span className={`text-sm ${foto.length >= 4 ? 'text-green-600' : 'text-muted-foreground'}`}>
                  {foto.length} di 4+ richieste
                </span>
              </div>
            </Card>
          </div>

          {/* Checkbox per saltare l'upload */}
          <Card className="p-6 mb-8 bg-muted/30">
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="skip-files" 
                checked={skipFiles}
                onCheckedChange={(checked) => setSkipFiles(checked as boolean)}
                disabled={isUploading}
              />
              <div className="flex-1">
                <label 
                  htmlFor="skip-files" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Non ho foto o planimetria disponibili
                </label>
                <p className="text-sm text-muted-foreground mt-1">
                  Prosegui direttamente con l'intervista AI. L'AI raccoglierà tutte le informazioni necessarie tramite domande dettagliate.
                </p>
              </div>
            </div>
            
            {skipFiles && (
              <div className="mt-4 flex items-start space-x-2 bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-foreground/80">
                  <p className="font-medium text-orange-600 mb-1">Nota importante</p>
                  <p>Senza foto o planimetria, la stima potrebbe essere meno accurata. L'AI farà più domande durante l'intervista per compensare la mancanza di materiale visivo.</p>
                </div>
              </div>
            )}
          </Card>

          <div className="text-center">
            <Button 
              variant="hero" 
              size="xl" 
              disabled={!canProceed || isUploading}
              onClick={handleProceedWithAI}
              className="disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Caricamento in corso...
                </>
              ) : skipFiles ? (
                "Inizia l'intervista AI"
              ) : (
                "Continua con l'intervista AI"
              )}
            </Button>
            
            {!canProceed && !isUploading && (
              <p className="text-muted-foreground mt-4">
                Carica almeno 4 foto o 1 planimetria, oppure seleziona l'opzione per proseguire senza file
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Upload;