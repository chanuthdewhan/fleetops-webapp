import { apiClient } from "./api";
import type {
  Driver,
  DriverRequest,
  DriverStatus,
  PagedResponse,
} from "@/types";

export const getDrivers = (page: number, size: number, status?: DriverStatus) =>
  apiClient
    .get<PagedResponse<Driver>>("/drivers", { params: { page, size, status } })
    .then((res) => res.data);

export const createDriver = (data: DriverRequest) =>
  apiClient.post<Driver>("/drivers", data).then((res) => res.data);

export const updateDriverStatus = (id: number, status: DriverStatus) =>
  apiClient
    .patch<Driver>(`/drivers/${id}/status`, { status })
    .then((res) => res.data);
