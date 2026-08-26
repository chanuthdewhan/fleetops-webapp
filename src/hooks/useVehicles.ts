import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getVehicles,
  createVehicle,
  updateVehicleStatus,
} from "@/services/vehicle";
import type { VehicleRequest, VehicleStatus } from "@/types";

export const useVehicles = (page: number, status?: VehicleStatus, size = 10) =>
  useQuery({
    queryKey: ["vehicles", page, size, status],
    queryFn: () => getVehicles(page, size, status),
    placeholderData: (prev) => prev,
  });

export const useCreateVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: VehicleRequest) => createVehicle(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vehicles"] }),
  });
};

export const useUpdateVehicleStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: VehicleStatus }) =>
      updateVehicleStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vehicles"] }),
  });
};
