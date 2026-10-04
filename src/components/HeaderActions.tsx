import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { LogOut, Settings } from "lucide-react";
import { useAuth, useIsAdmin } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

type HeaderActionsProps = {
  /** Clases del contenedor: permite cambiar el layout (desktop horizontal / móvil vertical). */
  className?: string;
  /** Se ejecuta tras cada acción (por ejemplo, cerrar el menú móvil). */
  onAction?: () => void;
};

/**
 * Acciones del header (Admin / Sign In / Salir / Get Started).
 * Se reutiliza en desktop y en el menú móvil para que el comportamiento sea idéntico.
 */
const HeaderActions = ({ className = "", onAction }: HeaderActionsProps) => {
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin(user?.id);

  return (
    <div className={className}>
      {isAdmin && (
        <Button variant="ghost" size="sm" asChild onClick={onAction}>
          <Link to="/admin/prompts"><Settings className="mr-1 h-4 w-4" />Admin</Link>
        </Button>
      )}
      {user ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            supabase.auth.signOut();
            onAction?.();
          }}
        >
          <LogOut className="mr-1 h-4 w-4" />Salir
        </Button>
      ) : (
        <Button variant="ghost" asChild onClick={onAction}>
          <Link to="/auth">Sign In</Link>
        </Button>
      )}
      <Button variant="hero" onClick={onAction}>Get Started</Button>
    </div>
  );
};

export default HeaderActions;
