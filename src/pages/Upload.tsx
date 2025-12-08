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
          title: "Formato non supportato",
          description: `Il formato di ${file.name} non è valido`
        });
        return false;
      }
      
      if (!isValidSize) {
        toast({
          variant: "destructive", 
          title: "File troppo grande",
          description: `${file.name} supera 10MB`
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
        title: "File caricati",
        description: `${newFiles.length} file aggiunti`
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

      if (planimetrie.length > 0) {
        const planimetriaFile = planimetrie[0].file;
        planimetriaUrl = await uploadFileToSupabase(planimetriaFile, 'planimetrie');
        
        if (!planimetriaUrl) {
          throw new Error('Errore caricamento planimetria');
        }
      }

      if (foto.length > 0) {
        for (const fotoFile of foto) {
          const fotoUrl = await uploadFileToSupabase(fotoFile.file, 'foto');
          if (fotoUrl) {
            fotoUrls.push(fotoUrl);
          }
        }
      }

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

      if (error) throw error;

      toast({
        title: skipFiles ? "Iniziamo l'intervista!" : "File caricati",
        description: "Procediamo con l'analisi AI"
      });

      navigate(`/interview?leadId=${lead.id}`);
      
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Riprova più tardi"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const planimetrie = uploadedFiles.filter(f => f.type === 'planimetria');
  const foto = uploadedFiles.filter(f => f.type === 'foto');
  
  const hasMinimumFiles = foto.length >= 4 || planimetrie.length >= 1;
  const canProceed = hasMinimumFiles || skipFiles;

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
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="container py-8">
        <div className="max-w-5xl mx-auto">
          {/* Professional Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8 space-y-4"
          >
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Carica documenti
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
              Per una stima accurata, carica planimetrie o foto dell'immobile. 
              Oppure procedi direttamente con l'intervista AI.
            </p>
            
            {/* Progress Indicators - Professional Style */}
            <div className="flex justify-center gap-4 mt-6">
              <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${
                planimetrie.length >= 1 
                  ? 'border-green-200 bg-green-50 text-green-700' 
                  : 'border-gray-200 bg-gray-50 text-gray-500'
              }`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                  planimetrie.length >= 1 ? 'bg-green-500 text-white' : 'bg-gray-300'
                }`}>
                  {planimetrie.length >= 1 ? '✓' : '1'}
                </div>
                <span className="font-medium text-sm">Planimetria</span>
              </div>
              
              <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${
                foto.length >= 4 
                  ? 'border-green-200 bg-green-50 text-green-700' 
                  : 'border-gray-200 bg-gray-50 text-gray-500'
              }`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                  foto.length >= 4 ? 'bg-green-500 text-white' : 'bg-gray-300'
                }`}>
                  {foto.length >= 4 ? '✓' : '4'}
                </div>
                <span className="font-medium text-sm">Foto</span>
              </div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* Planimetrie Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6 border border-gray-200 hover:border-gray-300 transition-colors">
                <div className="text-center mb-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <h2 className="text-lg font-semibold mb-1">Planimetrie</h2>
                  <p className="text-gray-500 text-xs">
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
                    className={`border border-dashed rounded-lg p-6 text-center transition-all cursor-pointer ${
                      isDragging 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, 'planimetria')}
                  >
                    <CloudUpload className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm font-medium mb-1">Trascina le planimetrie</p>
                    <p className="text-gray-500 text-xs">
                      o clicca per selezionare
                    </p>
                  </div>
                </label>

                <AnimatePresence>
                  {planimetrie.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 space-y-2"
                    >
                      <h3 className="font-medium text-sm text-gray-700">Planimetrie caricate:</h3>
                      {planimetrie.map((uploaded) => (
                        <motion.div 
                          key={uploaded.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg group hover:bg-gray-100"
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
                            <span className="text-xs font-medium truncate">
                              {uploaded.file.name}
                            </span>
                            <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                              {(uploaded.file.size / 1024 / 1024).toFixed(1)}MB
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(uploaded.id)}
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>

            {/* Foto Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 border border-gray-200 hover:border-gray-300 transition-colors">
                <div className="text-center mb-4">
                  <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Image className="h-5 w-5 text-emerald-600" />
                  </div>
                  <h2 className="text-lg font-semibold mb-1">Foto immobile</h2>
                  <p className="text-gray-500 text-xs">
                    JPG, PNG • Max 10MB • Minimo 4 foto
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
                    className={`border border-dashed rounded-lg p-6 text-center transition-all cursor-pointer ${
                      isDragging 
                        ? 'border-emerald-500 bg-emerald-50' 
                        : 'border-gray-300 hover:border-emerald-500 hover:bg-emerald-50'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, 'foto')}
                  >
                    <CloudUpload className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm font-medium mb-1">Trascina le foto</p>
                    <p className="text-gray-500 text-xs">
                      o clicca per selezionare
                    </p>
                  </div>
                </label>

                <AnimatePresence>
                  {foto.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4"
                    >
                      <h3 className="font-medium text-sm text-gray-700 mb-2">
                        Foto caricate ({foto.length}/4+)
                      </h3>
                      <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                        {foto.map((uploaded) => (
                          <motion.div 
                            key={uploaded.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden"
                          >
                            {uploaded.previewUrl ? (
                              <img 
                                src={uploaded.previewUrl} 
                                alt={uploaded.file.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Image className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                            
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                              <Button
                                variant="secondary"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => window.open(uploaded.previewUrl, '_blank')}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => removeFile(uploaded.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                            
                            <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[10px] p-1 truncate">
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

          {/* Skip Option */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-4 mb-6 bg-gray-50 border border-gray-200">
              <div className="flex items-start space-x-3">
                <Checkbox 
                  id="skip-files" 
                  checked={skipFiles}
                  onCheckedChange={(checked) => setSkipFiles(checked as boolean)}
                  disabled={isUploading}
                  className="mt-0.5 data-[state=checked]:bg-blue-600"
                />
                <div className="flex-1">
                  <label 
                    htmlFor="skip-files" 
                    className="text-sm font-medium cursor-pointer block mb-1"
                  >
                    Procedi senza file
                  </label>
                  <p className="text-gray-600 text-xs">
                    Non hai foto o planimetria? L'AI raccoglierà informazioni tramite intervista.
                  </p>
                  
                  {skipFiles && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 flex items-start space-x-2 bg-amber-50 border border-amber-200 rounded-lg p-3"
                    >
                      <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div className="text-xs">
                        <p className="font-medium text-amber-700 mb-0.5">Nota</p>
                        <p className="text-gray-700">
                          Senza materiale visivo, la stima potrebbe essere meno accurata.
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
              size="lg" 
              disabled={!canProceed || isUploading}
              onClick={handleProceedWithAI}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg px-8 py-4 font-semibold hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Caricamento...
                </>
              ) : skipFiles ? (
                "Inizia intervista AI"
              ) : (
                "Analizza con AI"
              )}
            </Button>
            
            {!canProceed && !isUploading && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-gray-500 text-xs mt-3 flex items-center justify-center gap-1"
              >
                <AlertCircle className="h-3 w-3" />
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