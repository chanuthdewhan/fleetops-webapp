import { apiClient } from "./api";
import type { Trip } from "@/types";

export const getTripsByOrderId = (orderId: number) =>
  apiClient
    .get<Trip[]>("/trips", { params: { orderId } })
    .then((res) => res.data);
