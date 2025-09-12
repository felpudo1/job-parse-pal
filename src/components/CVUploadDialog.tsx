import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Import PDF and DOCX libraries
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set PDF.js worker
GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

interface ExtractedData {
  nombre?: string;
  apellidos?: string;
  fechaNacimiento?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  nacionalidad?: string;
  experienciaLaboral?: Array<{
    empresa: string;
    puesto: string;
    fechaInicio: string;
    fechaFin: string;
    descripcion: string;
  }>;
  educacion?: Array<{
    institucion: string;
    titulo: string;
    fechaInicio: string;
    fechaFin: string;
  }>;
  habilidades?: string[];
  idiomas?: Array<{
    idioma: string;
    nivel: string;
  }>;
}

const CVUploadDialog = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [error, setError] = useState<string>("");
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await getDocument({ data: arrayBuffer }).promise;
    let text = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      text += pageText + ' ';
    }
    
    return text;
  };

  const extractTextFromDOCX = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    const fileType = file.type;
    
    if (fileType === 'application/pdf') {
      return await extractTextFromPDF(file);
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return await extractTextFromDOCX(file);
    } else if (fileType === 'text/plain') {
      return await file.text();
    } else {
      throw new Error('Formato de archivo no soportado. Use PDF, DOCX o TXT.');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];
      
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Formato de archivo no soportado. Use PDF, DOCX o TXT.');
        return;
      }
      
      setFile(selectedFile);
      setError("");
      setExtractedData(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError('Por favor seleccione un archivo');
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      // Extract text from file
      const cvText = await extractTextFromFile(file);
      
      if (!cvText.trim()) {
        throw new Error('No se pudo extraer texto del archivo');
      }

      // Call the edge function to analyze the CV
      const { data, error } = await supabase.functions.invoke('analyze-cv', {
        body: { cvText }
      });

      if (error) {
        throw new Error(error.message || 'Error al analizar el CV');
      }

      if (data.success) {
        setExtractedData(data.data);
        toast({
          title: "CV Analizado Exitosamente",
          description: "Los datos han sido extraídos correctamente",
        });
      } else {
        throw new Error(data.error || 'Error desconocido');
      }
    } catch (err: any) {
      console.error('Error analyzing CV:', err);
      setError(err.message || 'Error al procesar el archivo');
      toast({
        title: "Error",
        description: err.message || 'Error al procesar el archivo',
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setExtractedData(null);
    setError("");
    setIsProcessing(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" variant="hero" className="group">
          <Upload className="mr-2 h-5 w-5" />
          Start Analyzing CVs
          <svg className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Analizar CV con IA</DialogTitle>
          <DialogDescription>
            Sube tu CV en formato PDF, DOCX o TXT para extraer automáticamente la información clave
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {!extractedData ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Subir CV
                </CardTitle>
                <CardDescription>
                  Formatos soportados: PDF, DOCX, TXT (máximo 10MB)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="cv-file">Seleccionar archivo</Label>
                  <Input
                    id="cv-file"
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileChange}
                    className="mt-1"
                  />
                </div>
                
                {file && (
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm">{file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                )}
                
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}
                
                <Button 
                  onClick={handleAnalyze} 
                  disabled={!file || isProcessing}
                  className="w-full"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analizando CV...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Analizar CV
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  Datos Extraídos
                </CardTitle>
                <CardDescription>
                  Información extraída automáticamente del CV
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="font-semibold mb-3">Información Personal</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Nombre</Label>
                      <Input value={extractedData.nombre || ""} readOnly className="mt-1" />
                    </div>
                    <div>
                      <Label>Apellidos</Label>
                      <Input value={extractedData.apellidos || ""} readOnly className="mt-1" />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input value={extractedData.email || ""} readOnly className="mt-1" />
                    </div>
                    <div>
                      <Label>Teléfono</Label>
                      <Input value={extractedData.telefono || ""} readOnly className="mt-1" />
                    </div>
                    <div>
                      <Label>Fecha de Nacimiento</Label>
                      <Input value={extractedData.fechaNacimiento || ""} readOnly className="mt-1" />
                    </div>
                    <div>
                      <Label>Nacionalidad</Label>
                      <Input value={extractedData.nacionalidad || ""} readOnly className="mt-1" />
                    </div>
                  </div>
                  {extractedData.direccion && (
                    <div className="mt-4">
                      <Label>Dirección</Label>
                      <Input value={extractedData.direccion} readOnly className="mt-1" />
                    </div>
                  )}
                </div>

                {/* Skills */}
                {extractedData.habilidades && extractedData.habilidades.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Habilidades</h3>
                    <div className="flex flex-wrap gap-2">
                      {extractedData.habilidades.map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Languages */}
                {extractedData.idiomas && extractedData.idiomas.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Idiomas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {extractedData.idiomas.map((lang, index) => (
                        <div key={index} className="flex justify-between p-2 border rounded">
                          <span>{lang.idioma}</span>
                          <span className="text-muted-foreground">{lang.nivel}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button onClick={resetForm} variant="outline">
                    Analizar Otro CV
                  </Button>
                  <Button onClick={() => setOpen(false)}>
                    Cerrar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CVUploadDialog;