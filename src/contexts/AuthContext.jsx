import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/api/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [livreur, setLivreur] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = supabase.getUser();
        if (storedUser) {
          setUser(storedUser);
          const profile = await supabase.getLivreurProfile(storedUser.id);
          setLivreur(profile);
        }
      } catch (error) {
        console.error("Auth init error:", error);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };
    initAuth();
  }, []);

  const signIn = async (email, password) => {
    const data = await supabase.signIn(email, password);
    setUser(data.user);
    const profile = await supabase.getLivreurProfile(data.user.id);
    setLivreur(profile);
    return { user: data.user, livreur: profile };
  };

  const signOut = async () => {
    await supabase.signOut();
    setUser(null);
    setLivreur(null);
  };

  const refreshLivreur = async () => {
    if (!user) return;
    const profile = await supabase.getLivreurProfile(user.id);
    setLivreur(profile);
    return profile;
  };

  const value = {
    user,
    livreur,
    loading,
    initialized,
    signIn,
    signOut,
    refreshLivreur,
    setLivreur,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }
  return context;
}
