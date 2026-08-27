import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getOrder, assignOrder } from "@/services/order";
import type { AssignmentRequest } from "@/types";

export const useOrder = (id: number) =>
  useQuery({
    queryKey: ["orders", id],
    queryFn: () => getOrder(id),
  });

export const useAssignOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderId,
      data,
    }: {
      orderId: number;
      data: AssignmentRequest;
    }) => assignOrder(orderId, data),
    onSuccess: (_, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: ["orders", orderId] });
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
};
