import { apiClient } from "./api";
import type { Notification } from "@/types";

export const getNotifications = (recipientRole: string, read?: boolean) =>
  apiClient
    .get<Notification[]>("/notifications", { params: { recipientRole, read } })
    .then((res) => res.data);

export const markAsRead = (id: string) =>
  apiClient
    .patch<Notification>(`/notifications/${id}/read`)
    .then((res) => res.data);
