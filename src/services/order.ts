import { apiClient } from "./api";
import type { Order, AssignmentRequest } from "@/types";

export const getOrder = (id: number) =>
  apiClient.get<Order>(`/orders/${id}`).then((res) => res.data);

export const assignOrder = (orderId: number, data: AssignmentRequest) =>
  apiClient.post(`/orders/${orderId}/assignment`, data).then((res) => res.data);
