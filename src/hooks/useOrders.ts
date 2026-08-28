import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getOrder,
  assignOrder,
  createOrder,
  getOrders,
} from "@/services/order";
import type { AssignmentRequest, OrderRequest, OrderStatus } from "@/types";

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
      queryClient.invalidateQueries({ queryKey: ["orders", "list"] });
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
};

export const useOrders = (page: number, status?: OrderStatus, size = 10) =>
  useQuery({
    queryKey: ["orders", "list", page, size, status],
    queryFn: () => getOrders(page, size, status),
    placeholderData: (prev) => prev,
  });

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: OrderRequest) => createOrder(data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["orders", "list"] }),
  });
};
