import { useQuery } from "@tanstack/react-query";
import { getTripsByOrderId } from "@/services/trip";

export const useTripsByOrder = (orderId: number) =>
  useQuery({
    queryKey: ["trips", "order", orderId],
    queryFn: () => getTripsByOrderId(orderId),
  });
