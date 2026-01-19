import { useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import type { Notification } from "@shared/schema";

function formatTime(ts: string | Date) {
  const d = typeof ts === "string" ? new Date(ts) : ts;
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function getNotificationLink(n: Notification): string {
  // Keep links simple and role-agnostic
  if (n.type === "admin_new_quote" || n.type === "lead_purchased") return "/admin/dashboard";
  if (n.type === "new_lead" || n.type === "lead_price_drop") return "/subcontractor/portal";
  return "/";
}

export function NotificationsBell() {
  const { isAuthenticated } = useAuth();

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    enabled: isAuthenticated,
    refetchInterval: 30_000,
  });

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/notifications/${id}/mark-read`, {});
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  if (!isAuthenticated) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" data-testid="button-notifications">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span
              className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center"
              aria-label={`${unreadCount} unread notifications`}
              data-testid="badge-notifications-unread"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-96 p-0">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="font-semibold">Notifications</div>
          <div className="text-xs text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
          </div>
        </div>

        <div className="max-h-[420px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">No notifications yet.</div>
          ) : (
            notifications.slice(0, 25).map((n) => {
              const href = getNotificationLink(n);
              return (
                <div
                  key={n.id}
                  className={`p-4 border-b last:border-b-0 ${n.read ? "bg-background" : "bg-primary/5"}`}
                  data-testid={`notification-${n.id}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium text-sm truncate">{n.title}</div>
                      <div className="text-sm text-muted-foreground mt-1">{n.message}</div>
                      <div className="text-xs text-muted-foreground mt-2">{formatTime(n.createdAt as any)}</div>
                      <div className="mt-2">
                        <a className="text-xs text-primary underline" href={href}>
                          Open
                        </a>
                      </div>
                    </div>
                    {!n.read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => markReadMutation.mutate(n.id)}
                        disabled={markReadMutation.isPending}
                        title="Mark as read"
                        data-testid={`button-mark-read-${n.id}`}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

