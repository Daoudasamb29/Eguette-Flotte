import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/api/supabase";

export function useOrders(livreurId) {
  return useQuery({
    queryKey: ["orders", livreurId],
    queryFn: () => supabase.getOrders(livreurId),
    enabled: !!livreurId,
    refetchInterval: 30000,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, status }) => supabase.updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["commissions"] });
    },
  });
}
