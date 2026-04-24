import { motion, AnimatePresence } from "framer-motion";
import { Phone, Package, CheckCircle, Bike, ClipboardList } from "lucide-react";
import { useOrders, useUpdateOrderStatus } from "@/hooks/useOrders";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const statusLabels = {
  nouvelle: "Nouvelle",
  en_preparation: "En préparation",
  en_route: "En route",
  livree: "Livrée",
  annulee: "Annulée",
};

const statusColors = {
  nouvelle: "bg-brand-warning/20 text-brand-warning",
  en_preparation: "bg-brand-warning/20 text-brand-warning",
  en_route: "bg-brand-orange/20 text-brand-orange",
  livree: "bg-brand-green/20 text-brand-green",
  annulee: "bg-brand-danger/20 text-brand-danger",
};

export function ActiveOrdersSection() {
  const { livreur } = useAuth();
  const { data: orders, isLoading } = useOrders(livreur?.id);
  const updateOrder = useUpdateOrderStatus();

  const activeOrders = orders?.filter(
    (o) => o.statut !== "livree" && o.statut !== "annulee"
  ) || [];

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateOrder.mutateAsync({ orderId, status: newStatus });
      const label = newStatus === "en_route" ? "En route" : "Livrée";
      toast.success(`Commande ${label.toLowerCase()} !`, {
        description: `La commande a été mise à jour.`,
      });
    } catch (error) {
      toast.error("Erreur", {
        description: "Impossible de mettre à jour la commande.",
      });
    }
  };

  const getNextAction = (status) => {
    if (status === "nouvelle" || status === "en_preparation") {
      return { label: "En route", icon: Bike, nextStatus: "en_route", variant: "orange" };
    }
    if (status === "en_route") {
      return { label: "Livrée", icon: CheckCircle, nextStatus: "livree", variant: "green" };
    }
    return null;
  };

  const formatPhone = (phone) => {
    if (!phone) return "";
    return phone.replace(/\s/g, "");
  };

  if (isLoading) {
    return (
      <div className="px-4 py-3">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-40 bg-brand-border rounded" />
          <div className="h-48 bg-brand-border rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="px-4 py-3"
    >
      <div className="flex items-center gap-2 mb-3">
        <Package size={16} className="text-brand-orange" />
        <h2 className="text-sm font-semibold text-brand-text">
          Commandes actives
        </h2>
        <span className="ml-auto text-xs font-medium text-brand-text-secondary bg-brand-border px-2 py-0.5 rounded-full">
          {activeOrders.length}
        </span>
      </div>

      {activeOrders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-8 text-center"
        >
          <div className="w-14 h-14 rounded-full bg-brand-green/10 flex items-center justify-center mb-3">
            <CheckCircle size={24} className="text-brand-green" />
          </div>
          <p className="text-sm font-medium text-brand-text">
            Aucune commande en attente
          </p>
          <p className="text-xs text-brand-text-secondary mt-1">
            Les nouvelles commandes apparaîtront ici
          </p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {activeOrders.map((order) => {
              const action = getNextAction(order.statut);
              const montant = (order.total_montant || 0) + (order.frais_livraison || 0);

              return (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -100, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="bg-brand-surface border border-brand-border rounded-xl p-4 space-y-3"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-brand-orange/20 flex items-center justify-center">
                        <span className="text-xs font-bold text-brand-orange">
                          {(order.client_nom || "?")[0]?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-brand-text">
                          {order.client_nom || "Client"}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                        statusColors[order.statut] || "bg-brand-border text-brand-text-secondary"
                      }`}
                    >
                      {statusLabels[order.statut] || order.statut}
                    </span>
                  </div>

                  {/* Phone */}
                  {order.client_telephone && (
                    <a
                      href={`tel:${formatPhone(order.client_telephone)}`}
                      className="flex items-center gap-2 text-sm text-brand-orange hover:text-brand-orange-hover transition-colors active:opacity-70"
                    >
                      <Phone size={14} />
                      <span>{order.client_telephone}</span>
                    </a>
                  )}

                  {/* Address */}
                  {order.adresse_livraison && (
                    <p className="text-xs text-brand-text-secondary flex items-start gap-1.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5 text-brand-text-tertiary">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {order.adresse_livraison}
                    </p>
                  )}

                  {/* Items */}
                  {order.produits && (
                    <p className="text-xs text-brand-text-secondary">
                      🍽️ {order.produits}
                    </p>
                  )}

                  {/* Notes */}
                  {order.notes && (
                    <p className="text-xs text-brand-text-secondary italic flex items-start gap-1.5">
                      <ClipboardList size={14} className="flex-shrink-0 text-brand-text-tertiary" />
                      {order.notes}
                    </p>
                  )}

                  {/* Amount */}
                  <div className="pt-2 border-t border-brand-border">
                    <p className="text-xs text-brand-text-secondary">
                      À collecter :
                    </p>
                    <p className="text-lg font-bold text-brand-orange">
                      {montant.toLocaleString()} FCFA
                    </p>
                  </div>

                  {/* Action Button */}
                  {action && (
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleStatusUpdate(order.id, action.nextStatus)}
                      disabled={updateOrder.isPending}
                      className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] ${
                        action.variant === "green"
                          ? "bg-brand-green text-white hover:bg-brand-green-hover shadow-glow-green"
                          : "bg-brand-orange text-white hover:bg-brand-orange-hover shadow-glow"
                      }`}
                    >
                      <action.icon size={16} />
                      {action.label}
                    </motion.button>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </motion.section>
  );
}
