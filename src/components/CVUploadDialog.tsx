import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Import DOCX library
import mammoth from 'mammoth';

// PDF.js se cargará dinámicamente para compatibilidad con Vercel

interface ExtractedData {
  nombre?: string;
  apellidos?: string;
  fechaNacimiento?: string;
  edad?: number;
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

interface CVAnalysis {
  fortalezas: string[];
  debilidades: string[];
  recomendaciones: string[];
  puntuacion: {
    general: number;
    experiencia: number;
    educacion: number;
    habilidades: number;
  };
  resumen: string;
}

const CVUploadDialog = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [analysis, setAnalysis] = useState<CVAnalysis | null>(null);
  const [currentView, setCurrentView] = useState<'upload' | 'data' | 'analysis'>('upload');
  const [error, setError] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [selectedLLM, setSelectedLLM] = useState<'gemini' | 'perplexity'>('gemini');
  const { toast } = useToast();

  const extractTextFromPDF = async (file: File): Promise<string> => {
    // Cargar PDF.js desde CDN para evitar problemas de bundling con Vite
    // @ts-ignore - PDF.js se carga globalmente
    if (!window.pdfjsLib) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.min.mjs';
        script.type = 'module';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }
    
    // @ts-ignore - PDF.js cargado globalmente
    const pdfjsLib = window.pdfjsLib || (await import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.min.mjs'));
    
    // Configurar worker desde CDN
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs`;
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
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
        body: { cvText, llm: selectedLLM }
      });

      if (error) {
        throw new Error(error.message || 'Error al analizar el CV');
      }

      if (data.success) {
        setExtractedData(data.data);
        setCurrentView('data');
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

  const handleAnalyzeCV = async () => {
    if (!extractedData) return;
    
    setIsProcessing(true);
    setError("");

    try {
      const { data, error } = await supabase.functions.invoke('analyze-cv', {
        body: { 
          cvText: JSON.stringify(extractedData),
          action: 'analyze',
          llm: selectedLLM
        }
      });

      if (error) {
        throw new Error(error.message || 'Error al analizar el CV');
      }

      if (data.success) {
        setAnalysis(data.analysis);
        setCurrentView('analysis');
        toast({
          title: "Análisis Completado",
          description: "El análisis del CV ha sido generado",
        });
      } else {
        throw new Error(data.error || 'Error desconocido');
      }
    } catch (err: any) {
      console.error('Error analyzing CV:', err);
      setError(err.message || 'Error al analizar el CV');
      toast({
        title: "Error",
        description: err.message || 'Error al analizar el CV',
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setExtractedData(null);
    setAnalysis(null);
    setCurrentView('upload');
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
          {currentView === 'upload' ? (
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
                  <Label>Seleccionar archivo</Label>
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.add("border-primary", "bg-primary/5");
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.classList.remove("border-primary", "bg-primary/5");
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove("border-primary", "bg-primary/5");
                      const droppedFile = e.dataTransfer.files?.[0];
                      if (droppedFile) {
                        const allowedTypes = [
                          "application/pdf",
                          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                          "text/plain"
                        ];
                        if (!allowedTypes.includes(droppedFile.type)) {
                          setError("Formato de archivo no soportado. Use PDF, DOCX o TXT.");
                          return;
                        }
                        setFile(droppedFile);
                        setError("");
                        setExtractedData(null);
                      }
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-1 flex flex-col items-center justify-center gap-2 p-8 border-2 border-dashed border-muted-foreground/30 rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors group"
                  >
                    <div className="rounded-full bg-primary/10 p-3 group-hover:bg-primary/20 transition-colors">
                      <Upload className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      Hacé clic para seleccionar o arrastrá tu CV aquí
                    </p>
                    <p className="text-xs text-muted-foreground">PDF, DOCX o TXT (máximo 10MB)</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.docx,.txt"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="llm-select">Modelo de IA</Label>
                  <Select value={selectedLLM} onValueChange={(value: 'gemini' | 'perplexity') => setSelectedLLM(value)}>
                    <SelectTrigger id="llm-select" className="mt-1">
                      <SelectValue placeholder="Selecciona un modelo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gemini">Gemini (Google)</SelectItem>
                      <SelectItem value="perplexity">Perplexity AI</SelectItem>
                    </SelectContent>
                  </Select>
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
          ) : currentView === 'data' ? (
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
                      <Label>Edad</Label>
                      <Input value={extractedData.edad ? `${extractedData.edad} años` : ""} readOnly className="mt-1" />
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
                  <Button 
                    onClick={handleAnalyzeCV} 
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generando Análisis...
                      </>
                    ) : (
                      "Ver Análisis del CV"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  Análisis del CV
                </CardTitle>
                <CardDescription>
                  Evaluación completa y recomendaciones personalizadas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {analysis && (
                  <>
                    {/* Score Overview */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-primary">{analysis.puntuacion.general}/10</div>
                        <div className="text-sm text-muted-foreground">General</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-primary">{analysis.puntuacion.experiencia}/10</div>
                        <div className="text-sm text-muted-foreground">Experiencia</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-primary">{analysis.puntuacion.educacion}/10</div>
                        <div className="text-sm text-muted-foreground">Educación</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-primary">{analysis.puntuacion.habilidades}/10</div>
                        <div className="text-sm text-muted-foreground">Habilidades</div>
                      </div>
                    </div>

                    {/* Summary */}
                    <div>
                      <h3 className="font-semibold mb-3">Resumen</h3>
                      <p className="text-muted-foreground leading-relaxed">{analysis.resumen}</p>
                    </div>

                    {/* Strengths */}
                    {analysis.fortalezas && analysis.fortalezas.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3 text-green-600">Fortalezas</h3>
                        <ul className="space-y-2">
                          {analysis.fortalezas.map((strength, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Weaknesses */}
                    {analysis.debilidades && analysis.debilidades.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3 text-orange-600">Áreas de Mejora</h3>
                        <ul className="space-y-2">
                          {analysis.debilidades.map((weakness, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{weakness}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Recommendations */}
                    {analysis.recomendaciones && analysis.recomendaciones.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3 text-blue-600">Recomendaciones</h3>
                        <ul className="space-y-2">
                          {analysis.recomendaciones.map((recommendation, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <svg className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                              </svg>
                              <span className="text-sm">{recommendation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}

                <div className="flex gap-2">
                  <Button onClick={() => setCurrentView('data')} variant="outline">
                    Ver Datos
                  </Button>
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