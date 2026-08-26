import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getDrivers,
  createDriver,
  updateDriverStatus,
} from "@/services/driver";
import type { DriverRequest, DriverStatus } from "@/types";

export const useDrivers = (page: number, status?: DriverStatus, size = 10) =>
  useQuery({
    queryKey: ["drivers", page, size, status],
    queryFn: () => getDrivers(page, size, status),
    placeholderData: (prev) => prev,
  });

export const useCreateDriver = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DriverRequest) => createDriver(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["drivers"] }),
  });
};

export const useUpdateDriverStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: DriverStatus }) =>
      updateDriverStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["drivers"] }),
  });
};
