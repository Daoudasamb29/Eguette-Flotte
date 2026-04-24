import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Les variables d\'environnement Supabase sont manquantes. Vérifiez votre fichier .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── Types TypeScript ───

export type Livreur = {
  id: string;
  nom_complet: string;
  telephone: string;
  en_service: boolean;
  created_at: string;
  restaurant_id: string;
  equipe: 'Matin' | 'Soir';
  updated_at: string;
};

export type Commande = {
  id: string;
  client_nom: string;
  client_telephone: string;
  adresse_livraison: string;
  created_at: string;
  restaurant_id: string;
  plats: string;
  montant_repas: number;
  equipe: 'Matin' | 'Soir';
  updated_at: string;
  statut: 'nouvelle' | 'en_preparation' | 'en_route' | 'livree' | 'annulee';
  livreur_id: string;
  notes: string | null;
  zone: string | null;
  livree_at: string | null;
};

export type CommissionJournaliere = {
  id: string;
  livreur_id: string;
  date_activite: string;
  nb_courses: number;
  montant_commission: number;
  payee: boolean;
};

export type UserRole = {
  id: string;
  user_id: string;
  role: 'admin' | 'gestionnaire' | 'livreur';
};

// ─── Helpers ───

/**
 * Retourne le montant total d'une commande.
 * Note : pas de frais_livraison dans le schéma, donc retourne montant_repas.
 */
export function getCommandeTotal(commande: Commande): number {
  return commande.montant_repas;
}

/**
 * Formate un montant en FCFA avec espaces comme séparateurs de milliers.
 * Exemple : 15000 → "15 000 FCFA"
 */
export function formatFCFA(montant: number): string {
  if (montant === null || montant === undefined) return '0 FCFA';
  const formatted = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(montant);
  return `${formatted} FCFA`;
}

/**
 * Récupère le profil livreur associé à un user_id.
 * 
 * Stratégie :
 * 1. D'abord via une colonne user_id (si elle existe sur la table livreurs)
 * 2. Sinon via l'email de l'utilisateur connecté (fallback)
 * 
 * ⚠️ Si votre table `livreurs` n'a pas de colonne `user_id`,
 * vous devrez lier les livreurs via l'email ou ajouter cette colonne.
 */
export async function getLivreurProfile(userId: string): Promise<Livreur | null> {
  // Tentative 1 : chercher par user_id directement (si la colonne existe)
  const { data: byUserId, error: err1 } = await supabase
    .from('livreurs')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (byUserId) return byUserId as Livreur;

  // Tentative 2 : récupérer l'email de l'utilisateur auth, puis chercher par téléphone/email
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return null;

  const userEmail = userData.user.email;

  // Si vous stockez l'email dans la colonne telephone ou une autre colonne, adaptez ici
  const { data: byEmail, error: err2 } = await supabase
    .from('livreurs')
    .select('*')
    .eq('telephone', userEmail) // ou .eq('email', userEmail) si vous avez une colonne email
    .maybeSingle();

  if (byEmail) return byEmail as Livreur;

  console.warn('Aucun livreur trouvé pour l\'utilisateur:', userId);
  return null;
}
