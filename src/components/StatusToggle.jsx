import { motion } from "framer-motion";
import { Power } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUpdateStatus } from "@/hooks/useStatus";
import { toast } from "sonner";

export function StatusToggle() {
  const { livreur, refreshLivreur } = useAuth();
  const updateStatus = useUpdateStatus();

  const isActive = livreur?.en_service || false;

  const handleToggle = async () => {
    if (!livreur?.id) return;

    try {
      await updateStatus.mutateAsync({
        livreurId: livreur.id,
        enService: !isActive,
      });
      await refreshLivreur();
      toast.success(isActive ? "Vous êtes hors service" : "Vous êtes en service !", {
        description: isActive
          ? "Vous ne recevrez plus de commandes."
          : "Vous pouvez maintenant recevoir des commandes.",
      });
    } catch (error) {
      toast.error("Erreur", {
        description: "Impossible de changer le statut. Réessayez.",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 }}
      className="px-4 py-3"
    >
      <button
        onClick={handleToggle}
        disabled={updateStatus.isPending}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-300 active:scale-[0.98] ${
          isActive
            ? "bg-brand-green/10 border-brand-green/30 shadow-glow-green"
            : "bg-brand-surface border-brand-border hover:border-brand-border-hover"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
              isActive ? "bg-brand-green text-white" : "bg-brand-border text-brand-text-secondary"
            }`}
          >
            <Power size={18} />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-brand-text">
              {isActive ? "En service" : "Hors service"}
            </p>
            <p className="text-xs text-brand-text-secondary">
              {isActive
                ? "Vous recevez des commandes"
                : "Activez pour recevoir des commandes"}
            </p>
          </div>
        </div>

        {/* Toggle switch */}
        <div
          className={`w-12 h-7 rounded-full p-0.5 transition-all duration-300 ${
            isActive ? "bg-brand-green" : "bg-brand-border"
          }`}
        >
          <motion.div
            className="w-6 h-6 rounded-full bg-white shadow-md"
            animate={{ x: isActive ? 20 : 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        </div>
      </button>
    </motion.div>
  );
}
