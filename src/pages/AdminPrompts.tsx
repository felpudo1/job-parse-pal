import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, useIsAdmin } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PromptTemplate {
  id: string;
  name: string;
  action: string;
  llm: string;
  system_content: string;
  user_template: string;
  temperature: number;
  is_active: boolean;
  updated_at: string;
}

const AdminPrompts = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, checking } = useIsAdmin(user?.id);
  const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth", { replace: true });
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    supabase
      .from("prompt_templates")
      .select("*")
      .order("action")
      .order("llm")
      .then(({ data, error }) => {
        if (error) toast({ title: "Error cargando prompts", description: error.message, variant: "destructive" });
        else setPrompts(data || []);
        setLoading(false);
      });
  }, [isAdmin, toast]);

  const updateField = (id: string, field: keyof PromptTemplate, value: any) => {
    setPrompts((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const savePrompt = async (p: PromptTemplate) => {
    setSavingId(p.id);
    const { error } = await supabase
      .from("prompt_templates")
      .update({
        name: p.name,
        system_content: p.system_content,
        user_template: p.user_template,
        temperature: p.temperature,
        is_active: p.is_active,
      })
      .eq("id", p.id);
    setSavingId(null);
    if (error) toast({ title: "Error guardando", description: error.message, variant: "destructive" });
    else toast({ title: "Guardado", description: `${p.name} actualizado` });
  };

  if (authLoading || checking) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Acceso denegado</CardTitle>
            <CardDescription>Necesitás rol de administrador para acceder a esta sección.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")}><ArrowLeft className="mr-2 h-4 w-4" />Volver</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Editor de Prompts</h1>
            <p className="text-muted-foreground">Afiná los prompts del análisis de CV. Usá <code className="bg-muted px-1 rounded">{`{{cvText}}`}</code> como placeholder.</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/")}><ArrowLeft className="mr-2 h-4 w-4" />Inicio</Button>
        </div>

        {loading ? (
          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
        ) : (
          prompts.map((p) => (
            <Card key={p.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">{p.action}</span>
                      <span className="text-xs px-2 py-1 bg-secondary rounded">{p.llm}</span>
                      {p.name}
                    </CardTitle>
                    <CardDescription>Última edición: {new Date(p.updated_at).toLocaleString()}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`active-${p.id}`} className="text-sm">Activo</Label>
                    <Switch id={`active-${p.id}`} checked={p.is_active} onCheckedChange={(v) => updateField(p.id, "is_active", v)} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Nombre</Label>
                  <Input value={p.name} onChange={(e) => updateField(p.id, "name", e.target.value)} />
                </div>
                <div>
                  <Label>System prompt</Label>
                  <Textarea rows={4} value={p.system_content} onChange={(e) => updateField(p.id, "system_content", e.target.value)} />
                </div>
                <div>
                  <Label>User template (usar {`{{cvText}}`})</Label>
                  <Textarea rows={10} className="font-mono text-xs" value={p.user_template} onChange={(e) => updateField(p.id, "user_template", e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Temperatura ({p.temperature})</Label>
                    <Input type="number" min={0} max={2} step={0.1} value={p.temperature} onChange={(e) => updateField(p.id, "temperature", parseFloat(e.target.value))} />
                  </div>
                </div>
                <Button onClick={() => savePrompt(p)} disabled={savingId === p.id}>
                  {savingId === p.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Guardar cambios
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminPrompts;
