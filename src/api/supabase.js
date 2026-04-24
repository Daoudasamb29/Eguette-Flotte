// Client API Supabase pour Eguette Flotte
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const IS_MOCK = !SUPABASE_URL || !SUPABASE_ANON_KEY;

// Données de démonstration
const MOCK_LIVREUR = {
  id: "mock-livreur-1",
  user_id: "mock-user-1",
  nom: "Amadou Diallo",
  nom_complet: "Amadou Diallo",
  telephone: "77 123 45 67",
  en_service: true,
  created_at: new Date().toISOString(),
};

const MOCK_ORDERS = [
  {
    id: "cmd-001",
    livreur_id: "mock-livreur-1",
    client_nom: "Fatou Ndiaye",
    client_telephone: "77 234 56 78",
    adresse_livraison: "Sicap Baobab, Villa 12",
    produits: "2x Thiéboudienne, 1x Yassa Poulet",
    notes: "Sonner à l'interphone",
    total_montant: 4500,
    frais_livraison: 500,
    statut: "en_preparation",
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "cmd-002",
    livreur_id: "mock-livreur-1",
    client_nom: "Moussa Sow",
    client_telephone: "76 345 67 89",
    adresse_livraison: "Mermoz, Rue 23, Immeuble B",
    produits: "1x Dibi, 1x Attiéké",
    notes: "",
    total_montant: 3500,
    frais_livraison: 500,
    statut: "en_route",
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
];

const MOCK_COMMISSIONS = [
  { id: 1, livreur_id: "mock-livreur-1", date: new Date().toISOString(), montant: 500, periode: "matin" },
  { id: 2, livreur_id: "mock-livreur-1", date: new Date(Date.now() - 1800000).toISOString(), montant: 500, periode: "matin" },
  { id: 3, livreur_id: "mock-livreur-1", date: new Date(Date.now() - 3600000).toISOString(), montant: 500, periode: "matin" },
];

const MOCK_HISTORY = [
  {
    id: "cmd-003",
    livreur_id: "mock-livreur-1",
    client_nom: "Aminata Fall",
    adresse_livraison: "Ouakam, Route des Almadies",
    total_montant: 5000,
    frais_livraison: 500,
    statut: "livree",
    date_livraison: new Date(Date.now() - 7200000).toISOString(),
    updated_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "cmd-004",
    livreur_id: "mock-livreur-1",
    client_nom: "Ibrahima Kane",
    adresse_livraison: "Plateau, Avenue Lamblin",
    total_montant: 7500,
    frais_livraison: 500,
    statut: "livree",
    date_livraison: new Date(Date.now() - 10800000).toISOString(),
    updated_at: new Date(Date.now() - 10800000).toISOString(),
  },
];

class SupabaseClient {
  constructor() {
    this.baseUrl = SUPABASE_URL;
    this.apiKey = SUPABASE_ANON_KEY;
    this.token = localStorage.getItem("eguette_token") || null;
    if (IS_MOCK) {
      console.log("[Eguette] Mode démo activé - Supabase non configuré");
    }
  }

  getHeaders() {
    const headers = {
      "Content-Type": "application/json",
      "apikey": this.apiKey,
    };
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async signIn(email, password) {
    if (IS_MOCK) {
      await new Promise((r) => setTimeout(r, 800));
      const mockUser = {
        id: "mock-user-1",
        email: email,
        user_metadata: { full_name: "Amadou Diallo" },
      };
      this.token = "mock-token";
      localStorage.setItem("eguette_token", "mock-token");
      localStorage.setItem("eguette_user", JSON.stringify(mockUser));
      return { user: mockUser, access_token: "mock-token" };
    }

    const response = await fetch(`${this.baseUrl}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": this.apiKey,
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Email ou mot de passe incorrect");
    }

    const data = await response.json();
    this.token = data.access_token;
    localStorage.setItem("eguette_token", data.access_token);
    localStorage.setItem("eguette_user", JSON.stringify(data.user));
    return data;
  }

  async signOut() {
    if (!IS_MOCK) {
      await fetch(`${this.baseUrl}/auth/v1/logout`, {
        method: "POST",
        headers: this.getHeaders(),
      });
    }
    this.token = null;
    localStorage.removeItem("eguette_token");
    localStorage.removeItem("eguette_user");
    localStorage.removeItem("eguette_remember");
  }

  getUser() {
    const userStr = localStorage.getItem("eguette_user");
    return userStr ? JSON.parse(userStr) : null;
  }

  async getLivreurProfile(userId) {
    if (IS_MOCK) {
      await new Promise((r) => setTimeout(r, 400));
      return { ...MOCK_LIVREUR };
    }

    const response = await fetch(
      `${this.baseUrl}/rest/v1/livreurs?user_id=eq.${userId}&select=*`,
      { headers: this.getHeaders() }
    );
    if (!response.ok) throw new Error("Impossible de récupérer le profil");
    const data = await response.json();
    return data[0] || null;
  }

  async getOrders(livreurId) {
    if (IS_MOCK) {
      await new Promise((r) => setTimeout(r, 500));
      const stored = localStorage.getItem("eguette_mock_orders");
      if (stored) return JSON.parse(stored);
      const allOrders = [...MOCK_ORDERS, ...MOCK_HISTORY];
      localStorage.setItem("eguette_mock_orders", JSON.stringify(allOrders));
      return allOrders;
    }

    const response = await fetch(
      `${this.baseUrl}/rest/v1/orders?livreur_id=eq.${livreurId}&select=*`,
      { headers: this.getHeaders() }
    );
    if (!response.ok) throw new Error("Impossible de récupérer les commandes");
    return response.json();
  }

  async updateOrderStatus(orderId, status) {
    if (IS_MOCK) {
      await new Promise((r) => setTimeout(r, 400));
      const stored = localStorage.getItem("eguette_mock_orders");
      const orders = stored ? JSON.parse(stored) : [...MOCK_ORDERS, ...MOCK_HISTORY];
      const updated = orders.map((o) =>
        o.id === orderId ? { ...o, statut: status, updated_at: new Date().toISOString(), date_livraison: status === "livree" ? new Date().toISOString() : o.date_livraison } : o
      );
      localStorage.setItem("eguette_mock_orders", JSON.stringify(updated));
      return { success: true };
    }

    const response = await fetch(
      `${this.baseUrl}/functions/v1/update-order-status`,
      {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({ order_id: orderId, status }),
      }
    );
    if (!response.ok) throw new Error("Impossible de mettre à jour le statut");
    return response.json();
  }

  async updateLivreurStatus(livreurId, enService) {
    if (IS_MOCK) {
      await new Promise((r) => setTimeout(r, 300));
      MOCK_LIVREUR.en_service = enService;
      return { success: true };
    }

    const response = await fetch(
      `${this.baseUrl}/rest/v1/livreurs?id=eq.${livreurId}`,
      {
        method: "PATCH",
        headers: this.getHeaders(),
        body: JSON.stringify({ en_service: enService }),
      }
    );
    if (!response.ok) throw new Error("Impossible de mettre à jour le statut");
    return response.json();
  }

  async getCommissions(livreurId) {
    if (IS_MOCK) {
      await new Promise((r) => setTimeout(r, 400));
      return [...MOCK_COMMISSIONS];
    }

    const response = await fetch(
      `${this.baseUrl}/rest/v1/commissions_livreurs?livreur_id=eq.${livreurId}&select=*`,
      { headers: this.getHeaders() }
    );
    if (!response.ok) throw new Error("Impossible de récupérer les commissions");
    return response.json();
  }
}

export const supabase = new SupabaseClient();
