import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload as UploadIcon, FileText, Image, X, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";

interface UploadedFile {
  file: File;
  id: string;
  type: 'planimetria' | 'foto';
}

const Upload = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const { toast } = useToast();

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

  const planimetrie = uploadedFiles.filter(f => f.type === 'planimetria');
  const foto = uploadedFiles.filter(f => f.type === 'foto');
  
  const canProceed = planimetrie.length >= 1 && foto.length >= 4;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <main className="container py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Carica i tuoi file
            </h1>
            <p className="text-xl text-muted-foreground">
              Serve almeno 1 planimetria e minimo 4 foto per iniziare l'analisi
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Upload Planimetrie */}
            <Card className="p-6">
              <div className="text-center mb-4">
                <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Planimetrie</h2>
                <p className="text-muted-foreground mb-4">
                  Almeno 1 planimetria (PDF, JPG, PNG)
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
                  Minimo 4 foto dell'immobile (JPG, PNG)
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

          <div className="text-center">
            <Button 
              variant="hero" 
              size="xl" 
              disabled={!canProceed}
              className="disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continua con l'intervista AI
            </Button>
            
            {!canProceed && (
              <p className="text-muted-foreground mt-4">
                Carica almeno 1 planimetria e 4 foto per continuare
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Upload;