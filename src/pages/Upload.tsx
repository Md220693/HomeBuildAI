import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload as UploadIcon, FileText, Image, X, CheckCircle, Loader2, AlertCircle, CloudUpload, Eye, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface UploadedFile {
  file: File;
  id: string;
  type: 'planimetria' | 'foto';
  previewUrl?: string;
}

const Upload = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [skipFiles, setSkipFiles] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
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

    const newFiles = validFiles.map(file => {
      let previewUrl: string | undefined;
      if (file.type.includes('image')) {
        previewUrl = URL.createObjectURL(file);
      }
      
      return {
        file,
        id: `${Date.now()}-${Math.random()}`,
        type,
        previewUrl
      };
    });

    setUploadedFiles(prev => [...prev, ...newFiles]);
    
    if (newFiles.length > 0) {
      toast({
        title: "File caricati con successo",
        description: `${newFiles.length} file${newFiles.length > 1 ? '' : ''} aggiunt${newFiles.length > 1 ? 'i' : 'o'}`
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent, type: 'planimetria' | 'foto') => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files, type);
  };

  const removeFile = (id: string) => {
    const fileToRemove = uploadedFiles.find(f => f.id === id);
    if (fileToRemove?.previewUrl) {
      URL.revokeObjectURL(fileToRemove.previewUrl);
    }
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

      // Create lead in database with skip_files flag and initial renovation_scope
      const { data: lead, error } = await supabase
        .from('leads')
        .insert({
          status: 'new',
          planimetria_url: planimetriaUrl,
          foto_urls: fotoUrls.length > 0 ? fotoUrls : null,
          skip_files: skipFiles,
          renovation_scope: 'unknown'
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

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      uploadedFiles.forEach(file => {
        if (file.previewUrl) {
          URL.revokeObjectURL(file.previewUrl);
        }
      });
    };
  }, [uploadedFiles]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Header />
      
      <main className="container py-12">
        <div className="max-w-6xl mx-auto">
          {/* Enhanced Header Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12 space-y-6"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Carica i tuoi documenti
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Per una stima più accurata, carica <strong className="text-accent">planimetrie o foto</strong> dell'immobile. 
              Oppure prosegui direttamente con l'intervista AI.
            </p>
            
            {/* Progress Indicators */}
            <div className="flex flex-wrap justify-center gap-6 mt-8">
              <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 ${
                planimetrie.length >= 1 
                  ? 'border-green-500 bg-green-500/10 text-green-600' 
                  : 'border-border bg-background text-muted-foreground'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  planimetrie.length >= 1 ? 'bg-green-500 text-white' : 'bg-muted'
                }`}>
                  {planimetrie.length >= 1 ? <CheckCircle className="w-4 h-4" /> : '1'}
                </div>
                <span className="font-semibold">Planimetria</span>
              </div>
              
              <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 ${
                foto.length >= 4 
                  ? 'border-green-500 bg-green-500/10 text-green-600' 
                  : 'border-border bg-background text-muted-foreground'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  foto.length >= 4 ? 'bg-green-500 text-white' : 'bg-muted'
                }`}>
                  {foto.length >= 4 ? <CheckCircle className="w-4 h-4" /> : '4'}
                </div>
                <span className="font-semibold">Foto</span>
              </div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Upload Planimetrie */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-8 hover:shadow-lg transition-shadow duration-300 border-2">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Planimetrie</h2>
                  <p className="text-muted-foreground">
                    PDF, JPG, PNG • Max 10MB
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
                  <div 
                    className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer ${
                      isDragging 
                        ? 'border-primary bg-primary/5 scale-105' 
                        : 'border-border hover:border-primary hover:bg-primary/5'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, 'planimetria')}
                  >
                    <CloudUpload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">Trascina le planimetrie qui</p>
                    <p className="text-muted-foreground text-sm">
                      o clicca per selezionare i file
                    </p>
                  </div>
                </label>

                <AnimatePresence>
                  {planimetrie.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6 space-y-3"
                    >
                      <h3 className="font-semibold text-foreground">Planimetrie caricate:</h3>
                      {planimetrie.map((uploaded) => (
                        <motion.div 
                          key={uploaded.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="flex items-center justify-between p-3 bg-secondary rounded-xl group hover:bg-secondary/80 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                            <span className="text-sm font-medium truncate">
                              {uploaded.file.name}
                            </span>
                            <span className="text-xs text-muted-foreground flex-shrink-0">
                              {(uploaded.file.size / 1024 / 1024).toFixed(1)}MB
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(uploaded.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>

            {/* Upload Foto */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-8 hover:shadow-lg transition-shadow duration-300 border-2">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Image className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Foto dell'immobile</h2>
                  <p className="text-muted-foreground">
                    JPG, PNG • Max 10MB • Minimo 4 foto consigliate
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
                  <div 
                    className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer ${
                      isDragging 
                        ? 'border-primary bg-primary/5 scale-105' 
                        : 'border-border hover:border-primary hover:bg-primary/5'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, 'foto')}
                  >
                    <CloudUpload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">Trascina le foto qui</p>
                    <p className="text-muted-foreground text-sm">
                      o clicca per selezionare i file
                    </p>
                  </div>
                </label>

                <AnimatePresence>
                  {foto.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6"
                    >
                      <h3 className="font-semibold text-foreground mb-3">
                        Foto caricate ({foto.length}/4+):
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                        {foto.map((uploaded) => (
                          <motion.div 
                            key={uploaded.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="relative group aspect-square bg-secondary rounded-xl overflow-hidden"
                          >
                            {uploaded.previewUrl ? (
                              <img 
                                src={uploaded.previewUrl} 
                                alt={uploaded.file.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Image className="h-8 w-8 text-muted-foreground" />
                              </div>
                            )}
                            
                            {/* File info overlay */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <Button
                                variant="secondary"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => window.open(uploaded.previewUrl, '_blank')}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => removeFile(uploaded.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                            
                            {/* File name badge */}
                            <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 truncate">
                              {uploaded.file.name}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          </div>

          {/* Skip Files Option */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 mb-8 bg-muted/30 border-2">
              <div className="flex items-start space-x-4">
                <Checkbox 
                  id="skip-files" 
                  checked={skipFiles}
                  onCheckedChange={(checked) => setSkipFiles(checked as boolean)}
                  disabled={isUploading}
                  className="mt-1 data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                />
                <div className="flex-1">
                  <label 
                    htmlFor="skip-files" 
                    className="text-lg font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer block mb-2"
                  >
                    Procedi senza caricare file
                  </label>
                  <p className="text-muted-foreground">
                    Non hai foto o planimetria disponibili? L'AI raccoglierà tutte le informazioni necessarie tramite un'intervista dettagliata.
                  </p>
                  
                  {skipFiles && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 flex items-start space-x-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4"
                    >
                      <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-semibold text-amber-600 mb-1">Nota importante</p>
                        <p className="text-foreground/80">
                          Senza materiale visivo, la stima potrebbe essere meno accurata. L'AI farà domande più dettagliate durante l'intervista per compensare.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <Button 
              size="xl" 
              disabled={!canProceed || isUploading}
              onClick={handleProceedWithAI}
              className="bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent text-white shadow-2xl rounded-2xl px-12 py-6 font-bold group transition-all duration-300 hover:scale-105 hover:shadow-3xl border-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  Caricamento in corso...
                </>
              ) : skipFiles ? (
                "Inizia l'intervista AI"
              ) : (
                "Analizza con l'AI"
              )}
            </Button>
            
            {!canProceed && !isUploading && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-muted-foreground mt-4 flex items-center justify-center gap-2"
              >
                <AlertCircle className="h-4 w-4" />
                Carica almeno 4 foto o 1 planimetria, oppure seleziona l'opzione per proseguire senza file
              </motion.p>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Upload;