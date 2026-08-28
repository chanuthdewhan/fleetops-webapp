import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getNotifications, markAsRead } from "@/services/notification";

export const useNotifications = (recipientRole: string) =>
  useQuery({
    queryKey: ["notifications", recipientRole],
    queryFn: () => getNotifications(recipientRole),
    refetchInterval: 5000, // poll every 5s - the "live feed" feel
  });

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markAsRead(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
};
