import { apiClient } from "./api";
import type {
  Vehicle,
  VehicleRequest,
  VehicleStatus,
  PagedResponse,
} from "@/types";

export const getVehicles = (
  page: number,
  size: number,
  status?: VehicleStatus,
) =>
  apiClient
    .get<
      PagedResponse<Vehicle>
    >("/vehicles", { params: { page, size, status } })
    .then((res) => res.data);

export const createVehicle = (data: VehicleRequest) =>
  apiClient.post<Vehicle>("/vehicles", data).then((res) => res.data);

export const updateVehicleStatus = (id: number, status: VehicleStatus) =>
  apiClient
    .patch<Vehicle>(`/vehicles/${id}/status`, { status })
    .then((res) => res.data);
