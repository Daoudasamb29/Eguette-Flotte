import { motion } from "framer-motion";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function Header() {
  const { livreur, signOut } = useAuth();

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between px-4 py-3"
    >
      {/* Logo */}
      <div className="flex-shrink-0">
        <img
          src="/logo-blanc.png"
          alt="Eguette"
          className="h-8 w-auto object-contain"
          onError={(e) => {
            e.target.style.display = "none";
            e.target.nextSibling.style.display = "flex";
          }}
        />
        <div
          className="hidden items-center justify-center h-8 px-3 rounded-lg bg-brand-orange text-white font-bold text-sm"
        >
          EGUETTE
        </div>
      </div>

      {/* Profile */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-orange to-brand-orange/70 flex items-center justify-center text-white text-xs font-bold">
            {getInitials(livreur?.nom_complet || livreur?.nom)}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-medium text-brand-text leading-tight">
              {livreur?.nom_complet || livreur?.nom || "Livreur"}
            </p>
            <div className="flex items-center gap-1">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  livreur?.en_service ? "bg-brand-green" : "bg-brand-text-secondary"
                }`}
              />
              <span className="text-[10px] text-brand-text-secondary">
                {livreur?.en_service ? "En service" : "Hors service"}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={signOut}
          className="ml-2 p-2 rounded-lg text-brand-text-secondary hover:text-brand-danger hover:bg-brand-danger/10 transition-colors active:scale-95"
          aria-label="Déconnexion"
        >
          <LogOut size={16} />
        </button>
      </div>
    </motion.header>
  );
}
