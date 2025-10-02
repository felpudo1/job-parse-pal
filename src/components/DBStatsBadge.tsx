import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Database } from "lucide-react";

const DBStatsBadge = () => {
  const { data: stats } = useQuery({
    queryKey: ['cv-stats'],
    queryFn: async () => {
      const { count, error } = await (supabase as any)
        .from('cv_analyses')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  return (
    <Badge variant="secondary" className="gap-1.5">
      <Database className="h-3 w-3" />
      <span className="text-xs font-medium">
        {stats !== undefined ? `${stats} CVs` : 'Loading...'}
      </span>
    </Badge>
  );
};

export default DBStatsBadge;
