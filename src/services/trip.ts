import { apiClient } from "./api";
import type { AddEventRequest, StartTripRequest, Trip } from "@/types";

export const getTripsByOrderId = (orderId: number) =>
  apiClient
    .get<Trip[]>("/trips", { params: { orderId } })
    .then((res) => res.data);

export const startTrip = (data: StartTripRequest) =>
  apiClient.post<Trip>("/trips", data).then((res) => res.data);

export const addTripEvent = (tripId: string, data: AddEventRequest) =>
  apiClient.post<Trip>(`/trips/${tripId}/events`, data).then((res) => res.data);

export const uploadProofOfDelivery = (tripId: string, file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return apiClient
    .post<Trip>(`/trips/${tripId}/proof-of-delivery`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res.data);
};

export const completeTrip = (tripId: string) =>
  apiClient.patch<Trip>(`/trips/${tripId}/complete`).then((res) => res.data);
