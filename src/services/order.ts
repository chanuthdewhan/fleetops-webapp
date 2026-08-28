import { apiClient } from "./api";
import type {
  Order,
  AssignmentRequest,
  OrderRequest,
  PagedResponse,
  OrderStatus,
} from "@/types";

export const getOrder = (id: number) =>
  apiClient.get<Order>(`/orders/${id}`).then((res) => res.data);

export const assignOrder = (orderId: number, data: AssignmentRequest) =>
  apiClient.post(`/orders/${orderId}/assignment`, data).then((res) => res.data);

export const getOrders = (page: number, size: number, status?: OrderStatus) =>
  apiClient
    .get<PagedResponse<Order>>("/orders", { params: { page, size, status } })
    .then((res) => res.data);

export const createOrder = (data: OrderRequest) =>
  apiClient.post<Order>("/orders", data).then((res) => res.data);
