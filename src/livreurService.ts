import { supabase, type Commande, type Livreur } from '../lib/supabaseClient';

// ─── Commandes ───

/**
 * Récupère toutes les commandes assignées à un livreur.
 */
export async function getOrdersByLivreur(livreurId: string): Promise<Commande[]> {
  const { data, error } = await supabase
    .from('commandes')
    .select('*')
    .eq('livreur_id', livreurId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erreur getOrdersByLivreur:', error);
    throw new Error(`Impossible de récupérer les commandes: ${error.message}`);
  }

  return (data || []) as Commande[];
}

/**
 * Met à jour le statut d'une commande.
 * Si le nouveau statut est 'livree', met à jour automatiquement livree_at.
 */
export async function updateOrderStatus(
  orderId: string,
  newStatus: Commande['statut']
): Promise<Commande> {
  const updates: Partial<Commande> = {
    statut: newStatus,
    updated_at: new Date().toISOString(),
  };

  if (newStatus === 'livree') {
    updates.livree_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('commandes')
    .update(updates)
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    console.error('Erreur updateOrderStatus:', error);
    throw new Error(`Impossible de mettre à jour le statut: ${error.message}`);
  }

  return data as Commande;
}

// ─── Livreurs ───

/**
 * Active ou désactive un livreur (colonne en_service).
 */
export async function updateLivreurEnService(
  livreurId: string,
  enService: boolean
): Promise<Livreur> {
  const { data, error } = await supabase
    .from('livreurs')
    .update({
      en_service: enService,
      updated_at: new Date().toISOString(),
    })
    .eq('id', livreurId)
    .select()
    .single();

  if (error) {
    console.error('Erreur updateLivreurEnService:', error);
    throw new Error(`Impossible de modifier le statut du livreur: ${error.message}`);
  }

  return data as Livreur;
}

/**
 * Récupère le livreur correspondant à l'utilisateur connecté.
 * 
 * ⚠️ Cette fonction suppose que la table `livreurs` a une colonne `user_id`
 * ou que vous liez via l'email/téléphone. Adaptez selon votre schéma réel.
 */
export async function getLivreurByUserId(userId: string): Promise<Livreur | null> {
  // Stratégie 1 : recherche directe par user_id (si la colonne existe)
  const { data: byUserId, error: err1 } = await supabase
    .from('livreurs')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (byUserId) return byUserId as Livreur;
  if (err1 && err1.code !== 'PGRST204') { // PGRST204 = colonne inexistante
    console.error('Erreur getLivreurByUserId (user_id):', err1);
  }

  // Stratégie 2 : fallback via l'email de l'utilisateur auth
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    console.error('Utilisateur non authentifié');
    return null;
  }

  const userEmail = authData.user.email;
  if (!userEmail) return null;

  const { data: byEmail, error: err2 } = await supabase
    .from('livreurs')
    .select('*')
    .eq('telephone', userEmail) // ou 'email' si vous avez cette colonne
    .maybeSingle();

  if (err2) {
    console.error('Erreur getLivreurByUserId (email):', err2);
    throw new Error(`Erreur lors de la récupération du profil livreur: ${err2.message}`);
  }

  return byEmail as Livreur | null;
}

// ─── Statistiques ───

/**
 * Compte le nombre de commandes livrées aujourd'hui par un livreur.
 */
export async function getCoursesToday(livreurId: string): Promise<number> {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  const { count, error } = await supabase
    .from('commandes')
    .select('*', { count: 'exact', head: true })
    .eq('livreur_id', livreurId)
    .eq('statut', 'livree')
    .gte('livree_at', `${today}T00:00:00`)
    .lte('livree_at', `${today}T23:59:59`);

  if (error) {
    console.error('Erreur getCoursesToday:', error);
    throw new Error(`Impossible de compter les courses: ${error.message}`);
  }

  return count || 0;
}
