// src/pages/notifications/NotificationsPage.tsx
import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { useAuth } from "@/context/AuthContext";
import { useNotifications, useMarkAsRead } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
  const { user } = useAuth();
  const { data: notifications, isLoading } = useNotifications(
    user?.role ?? "DISPATCHER",
  );
  const markAsRead = useMarkAsRead();

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-semibold">Notifications</h1>

      <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : notifications && notifications.length > 0 ? (
          <ul className="divide-y divide-border">
            {notifications.map((n) => (
              <li
                key={n.id}
                className={cn(
                  "flex items-start gap-3 py-3",
                  !n.read && "bg-accent/40 -mx-4 px-4",
                )}
              >
                <Bell className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                {!n.read && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => markAsRead.mutate(n.id)}
                    disabled={markAsRead.isPending}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="No notifications"
            description="You're all caught up."
          />
        )}
      </div>
    </div>
  );
}
