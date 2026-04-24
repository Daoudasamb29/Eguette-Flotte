import { motion, AnimatePresence } from "framer-motion";
import { Clock, PackageCheck } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export function HistorySection() {
  const { livreur } = useAuth();
  const { data: orders, isLoading } = useOrders(livreur?.id);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayDeliveries = orders?.filter((o) => {
    if (o.statut !== "livree") return false;
    const orderDate = new Date(o.date_livraison || o.updated_at);
    orderDate.setHours(0, 0, 0, 0);
    return orderDate.getTime() === today.getTime();
  }) || [];

  const formatTime = (dateStr) => {
    try {
      return format(new Date(dateStr), "HH:mm", { locale: fr });
    } catch {
      return "";
    }
  };

  if (isLoading) {
    return (
      <div className="px-4 py-3">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-32 bg-brand-border rounded" />
          <div className="h-16 bg-brand-border rounded-xl" />
          <div className="h-16 bg-brand-border rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="px-4 py-3 pb-8"
    >
      <div className="flex items-center gap-2 mb-3">
        <Clock size={16} className="text-brand-text-secondary" />
        <h2 className="text-sm font-semibold text-brand-text">
          Historique du jour
        </h2>
        <span className="ml-auto text-xs font-medium text-brand-text-secondary bg-brand-border px-2 py-0.5 rounded-full">
          {todayDeliveries.length}
        </span>
      </div>

      {todayDeliveries.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-6 text-center"
        >
          <div className="w-12 h-12 rounded-full bg-brand-border flex items-center justify-center mb-2">
            <PackageCheck size={20} className="text-brand-text-tertiary" />
          </div>
          <p className="text-xs text-brand-text-secondary">
            Aucune livraison aujourd&apos;hui
          </p>
        </motion.div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {todayDeliveries.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between bg-brand-surface border border-brand-border rounded-xl px-3 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-green/15 flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-brand-text">
                      {order.client_nom || "Client"}
                    </p>
                    <p className="text-[11px] text-brand-text-secondary">
                      {order.adresse_livraison || "Adresse non spécifiée"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-brand-green">
                    {(order.total_montant || 0).toLocaleString()} FCFA
                  </p>
                  <p className="text-[11px] text-brand-text-secondary">
                    {formatTime(order.date_livraison || order.updated_at)}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.section>
  );
}
