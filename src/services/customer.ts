import { apiClient } from "./api";
import type { Customer, CustomerRequest } from "@/types";
import type { PagedResponse } from "@/types";

export const getCustomer = (id: number) =>
  apiClient.get<Customer>(`/customers/${id}`).then((res) => res.data);

export const createCustomer = (data: CustomerRequest) =>
  apiClient.post<Customer>("/customers", data).then((res) => res.data);

export const getCustomers = (page: number, size: number) =>
  apiClient
    .get<PagedResponse<Customer>>("/customers", { params: { page, size } })
    .then((res) => res.data);

export const updateCustomer = (id: number, data: CustomerRequest) =>
  apiClient.put<Customer>(`/customers/${id}`, data).then((res) => res.data);

export const deleteCustomer = (id: number) =>
  apiClient.delete(`/customers/${id}`);
