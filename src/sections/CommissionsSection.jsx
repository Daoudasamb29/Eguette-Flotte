import { motion } from "framer-motion";
import { ProgressRing } from "@/components/ProgressRing";
import { useCommissions, getPeriodInfo } from "@/hooks/useCommissions";
import { useAuth } from "@/contexts/AuthContext";

export function CommissionsSection() {
  const { livreur } = useAuth();
  const { data: commissions, isLoading } = useCommissions(livreur?.id);
  const info = getPeriodInfo(commissions);

  const renderPeriodCard = (title, period, data) => {
    const isCurrent = info.currentPeriod === period;
    const isComplete = data.count >= data.target;
    const remaining = data.target - data.count;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: period === "matin" ? 0.15 : 0.2 }}
        className={`relative rounded-xl p-3 border transition-all ${
          isCurrent
            ? "bg-brand-surface-hover border-brand-orange/30"
            : "bg-brand-surface border-brand-border"
        }`}
      >
        {isCurrent && (
          <div className="absolute -top-1.5 left-3 px-2 py-0.5 rounded-full bg-brand-orange text-white text-[10px] font-medium">
            En cours
          </div>
        )}

        <div className="flex items-center justify-between mt-1">
          <div className="flex-1">
            <p className="text-xs font-medium text-brand-text-secondary mb-1">
              {title}
            </p>
            <p className="text-sm font-semibold text-brand-text">
              {data.count}/{data.target} courses
            </p>
            <p className="text-xs text-brand-text-secondary mt-0.5">
              {data.amount.toLocaleString()} FCFA
            </p>
            <p className={`text-[11px] mt-1.5 font-medium ${
              isComplete ? "text-brand-green" : "text-brand-orange"
            }`}>
              {isComplete
                ? "🎉 Palier atteint !"
                : `Encore ${remaining} course${remaining > 1 ? "s" : ""}`}
            </p>
          </div>
          <ProgressRing
            current={data.count}
            target={data.target}
            size={56}
            strokeWidth={4}
          />
        </div>
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <div className="px-4 py-3">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-32 bg-brand-border rounded" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-28 bg-brand-border rounded-xl" />
            <div className="h-28 bg-brand-border rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1 }}
      className="px-4 py-3"
    >
      <h2 className="text-sm font-semibold text-brand-text mb-3">
        💰 Commissions du jour
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {renderPeriodCard("Matin (10h-21h)", "matin", info.matin)}
        {renderPeriodCard("Soir (21h-7h)", "soir", info.soir)}
      </div>
    </motion.section>
  );
}
