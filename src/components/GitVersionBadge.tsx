import { Badge } from "@/components/ui/badge";
import { GitBranch, Calendar, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";

/**
 * GitVersionBadge - Muestra la versión actual del proyecto desde GitHub
 * 
 * Muestra información del último commit:
 * - Hash corto del commit
 * - Fecha y hora del deploy/commit
 * 
 * Similar al DBStatsBadge pero para versionado de GitHub
 */
const GitVersionBadge = () => {
  // Información del build - se establece en build time
  const buildInfo = {
    hash: import.meta.env.VITE_COMMIT_HASH || 'local',
    date: import.meta.env.VITE_BUILD_DATE || new Date().toISOString(),
    branch: import.meta.env.VITE_GIT_BRANCH || 'main',
  };

  // Formatear la fecha para mostrar en formato legible
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  // Formatear la hora para mostrar
  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    } catch {
      return 'N/A';
    }
  };

  // Mostrar información completa al hacer click
  const handleClick = () => {
    toast({
      title: "Información de Versión",
      description: (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            <span className="font-mono text-xs">
              {buildInfo.hash.substring(0, 7)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="text-xs">
              {formatDate(buildInfo.date)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="text-xs">
              {formatTime(buildInfo.date)}
            </span>
          </div>
          <div className="text-xs text-muted-foreground pt-2 border-t">
            Branch: {buildInfo.branch}
          </div>
        </div>
      ),
    });
  };

  return (
    <Badge 
      variant="outline" 
      className="gap-2 cursor-pointer hover:bg-accent/50 transition-colors"
      onClick={handleClick}
    >
      <div className="flex items-center gap-1.5">
        <GitBranch className="h-3 w-3" />
        <span className="text-xs font-mono font-medium">
          {buildInfo.hash.substring(0, 7)}
        </span>
      </div>
      <div className="h-3 w-px bg-border" />
      <div className="flex items-center gap-1">
        <Calendar className="h-3 w-3" />
        <span className="text-xs">
          {formatDate(buildInfo.date)}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <Clock className="h-3 w-3" />
        <span className="text-xs">
          {formatTime(buildInfo.date)}
        </span>
      </div>
    </Badge>
  );
};

export default GitVersionBadge;

