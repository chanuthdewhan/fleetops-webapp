import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addTripEvent,
  completeTrip,
  getTripsByOrderId,
  startTrip,
  uploadProofOfDelivery,
} from "@/services/trip";
import type { AddEventRequest, StartTripRequest } from "@/types/tripTypes";

export const useTripsByOrder = (orderId: number) =>
  useQuery({
    queryKey: ["trips", "order", orderId],
    queryFn: () => getTripsByOrderId(orderId),
  });

export const useStartTrip = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: StartTripRequest) => startTrip(data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["trips", "order", vars.orderId],
      });
    },
  });
};

export const useAddTripEvent = (orderId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tripId, data }: { tripId: string; data: AddEventRequest }) =>
      addTripEvent(tripId, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["trips", "order", orderId] }),
  });
};

export const useUploadProof = (orderId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tripId, file }: { tripId: string; file: File }) =>
      uploadProofOfDelivery(tripId, file),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["trips", "order", orderId] }),
  });
};

export const useCompleteTrip = (orderId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tripId: string) => completeTrip(tripId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips", "order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["orders", orderId] });
    },
  });
};
