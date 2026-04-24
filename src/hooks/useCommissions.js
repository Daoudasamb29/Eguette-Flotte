import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/api/supabase";

export function useCommissions(livreurId) {
  return useQuery({
    queryKey: ["commissions", livreurId],
    queryFn: () => supabase.getCommissions(livreurId),
    enabled: !!livreurId,
    refetchInterval: 30000,
  });
}

export function getCurrentPeriod() {
  const hour = new Date().getHours();
  // Matin : 10h - 21h, Soir : 21h - 07h
  if (hour >= 10 && hour < 21) {
    return "matin";
  }
  return "soir";
}

export function getPeriodInfo(commissions) {
  const currentPeriod = getCurrentPeriod();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayCommissions = commissions?.filter((c) => {
    const cDate = new Date(c.date || c.created_at);
    cDate.setHours(0, 0, 0, 0);
    return cDate.getTime() === today.getTime();
  }) || [];

  const matinCount = todayCommissions.filter((c) => {
    const h = new Date(c.date || c.created_at).getHours();
    return h >= 10 && h < 21;
  }).length;

  const soirCount = todayCommissions.filter((c) => {
    const h = new Date(c.date || c.created_at).getHours();
    return h >= 21 || h < 7;
  }).length;

  const matinAmount = todayCommissions
    .filter((c) => {
      const h = new Date(c.date || c.created_at).getHours();
      return h >= 10 && h < 21;
    })
    .reduce((sum, c) => sum + (c.montant || 0), 0);

  const soirAmount = todayCommissions
    .filter((c) => {
      const h = new Date(c.date || c.created_at).getHours();
      return h >= 21 || h < 7;
    })
    .reduce((sum, c) => sum + (c.montant || 0), 0);

  return {
    currentPeriod,
    matin: { count: matinCount, target: 5, amount: matinAmount },
    soir: { count: soirCount, target: 5, amount: soirAmount },
  };
}
