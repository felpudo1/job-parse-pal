import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Database, Circle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const DBStatsBadge = () => {
  const { data: stats, error } = useQuery({
    queryKey: ['cv-stats'],
    queryFn: async () => {
      const { count, error } = await (supabase as any)
        .from('cv_analyses')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    },
    refetchInterval: 30000,
  });

  const handleClick = () => {
    toast({
      title: "Database Info",
      description: (
        <div className="space-y-1">
          <p>User: mendoza.pedro10</p>
          <p>Project: jobparse</p>
        </div>
      ),
    });
  };

  // El badge solo se muestra cuando la BD falla. Si está online, no se renderiza.
  if (!error) return null;

  return (
    <Badge
      variant="secondary"
      className="gap-2 cursor-pointer hover:bg-secondary/80 transition-colors"
      onClick={handleClick}
    >
      <div className="flex items-center gap-1">
        <Circle className="h-2 w-2 fill-red-500 text-red-500" />
        <span className="text-xs font-medium">Error</span>
      </div>
      <div className="h-3 w-px bg-border" />
      <div className="flex items-center gap-1.5">
        <Database className="h-3 w-3" />
        <span className="text-xs font-medium">Sin BD</span>
      </div>
    </Badge>
  );
};

export default DBStatsBadge;
