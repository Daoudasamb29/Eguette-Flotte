import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/api/supabase";

export function useUpdateStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ livreurId, enService }) =>
      supabase.updateLivreurStatus(livreurId, enService),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["livreur"] });
    },
  });
}
