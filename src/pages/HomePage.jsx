import { motion } from "framer-motion";
import { Bike, MapPin } from "lucide-react";
import { Header } from "@/components/Header";
import { StatusToggle } from "@/components/StatusToggle";
import { CommissionsSection } from "@/sections/CommissionsSection";
import { ActiveOrdersSection } from "@/sections/ActiveOrdersSection";
import { HistorySection } from "@/sections/HistorySection";
import { useAuth } from "@/contexts/AuthContext";

export function HomePage() {
  const { livreur } = useAuth();
  const isActive = livreur?.en_service || false;

  return (
    <div className="min-h-screen bg-brand-bg max-w-[480px] mx-auto relative">
      {/* Header */}
      <Header />

      {/* Status Toggle */}
      <StatusToggle />

      {/* Divider */}
      <div className="mx-4 h-px bg-brand-border my-1" />

      {!isActive ? (
        /* Offline State */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center px-8 py-16 text-center"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="w-20 h-20 rounded-2xl bg-brand-surface border border-brand-border flex items-center justify-center mb-5"
          >
            <Bike size={36} className="text-brand-text-tertiary" />
          </motion.div>
          <h2 className="text-base font-semibold text-brand-text mb-2">
            Vous n&apos;êtes pas en service
          </h2>
          <p className="text-sm text-brand-text-secondary max-w-[260px]">
            Activez le bouton &quot;En service&quot; en haut de la page pour commencer à recevoir des commandes.
          </p>

          {/* Decorative map placeholder */}
          <div className="mt-8 w-full max-w-[280px] h-40 rounded-xl bg-brand-surface border border-brand-border overflow-hidden relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <MapPin size={24} className="text-brand-text-tertiary mx-auto mb-2" />
                <p className="text-xs text-brand-text-tertiary">
                  Votre zone de livraison
                </p>
              </div>
            </div>
            {/* Decorative grid pattern */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `
                  linear-gradient(to right, #E8EAF0 1px, transparent 1px),
                  linear-gradient(to bottom, #E8EAF0 1px, transparent 1px)
                `,
                backgroundSize: "20px 20px",
              }}
            />
          </div>
        </motion.div>
      ) : (
        /* Active State */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <CommissionsSection />

          {/* Divider */}
          <div className="mx-4 h-px bg-brand-border my-1" />

          <ActiveOrdersSection />

          {/* Divider */}
          <div className="mx-4 h-px bg-brand-border my-1" />

          <HistorySection />
        </motion.div>
      )}
    </div>
  );
}
