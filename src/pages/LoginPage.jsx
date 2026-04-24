import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Bike } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { user, signIn, initialized } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (initialized && user) {
      navigate("/", { replace: true });
    }
  }, [initialized, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    setIsLoading(true);
    try {
      const result = await signIn(email.trim(), password);
      if (remember) {
        localStorage.setItem("eguette_remember", "true");
      }
      if (!result.livreur) {
        toast.error("Accès réservé aux livreurs", {
          description: "Votre compte n'est pas associé à un profil livreur.",
        });
        return;
      }
      toast.success("Connexion réussie !");
      navigate("/", { replace: true });
    } catch (error) {
      toast.error("Échec de la connexion", {
        description: error.message || "Email ou mot de passe incorrect.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center px-6 safe-top safe-bottom">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm space-y-8"
      >
        {/* Logo */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-orange to-brand-orange-hover shadow-glow"
          >
            <Bike size={40} className="text-white" />
          </motion.div>

          <div>
            <img
              src="/logo-blanc.png"
              alt="Eguette"
              className="h-10 w-auto mx-auto object-contain"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xl font-bold text-brand-text mt-2"
            >
              Flotte
            </motion.h1>
          </div>
          <p className="text-sm text-brand-text-secondary">
            Espace livreur
          </p>
        </div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="space-y-3">
            {/* Email */}
            <div className="relative">
              <Mail
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-tertiary"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Adresse email"
                className="w-full h-12 pl-10 pr-4 rounded-xl bg-brand-surface border border-brand-border text-brand-text placeholder:text-brand-text-tertiary text-sm focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/30 transition-all"
                required
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-tertiary"
              />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mot de passe"
                className="w-full h-12 pl-10 pr-10 rounded-xl bg-brand-surface border border-brand-border text-brand-text placeholder:text-brand-text-tertiary text-sm focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/30 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-text-tertiary hover:text-brand-text-secondary transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <label className="flex items-center gap-2 cursor-pointer">
            <div
              className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                remember
                  ? "bg-brand-orange border-brand-orange"
                  : "border-brand-border bg-brand-surface"
              }`}
              onClick={() => setRemember(!remember)}
            >
              {remember && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
            <span className="text-xs text-brand-text-secondary select-none">
              Rester connecté
            </span>
          </label>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={isLoading}
            whileTap={{ scale: 0.98 }}
            className="w-full h-12 rounded-xl bg-brand-orange text-white font-semibold text-sm hover:bg-brand-orange-hover transition-colors shadow-glow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
              />
            ) : (
              "Se connecter"
            )}
          </motion.button>
        </motion.form>
      </motion.div>
    </div>
  );
}
