import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function useNotifications() {
  const queryClient = useQueryClient();
  const [unreadCount, setUnreadCount] = useState(0);

  const { data: notifications = [], refetch: refetchNotifications } = useQuery({
    queryKey: ['/api/notifications'],
  });

  // Update unread count whenever notifications change
  useEffect(() => {
    if (notifications && Array.isArray(notifications)) {
      const count = notifications.filter((notification: any) => !notification.isRead).length;
      setUnreadCount(count);
    }
  }, [notifications]);

  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('POST', `/api/notifications/read/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/notifications/read-all', { userId: 1 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
  });

  const markAsRead = (id: number) => {
    markAsReadMutation.mutate(id);
  };

  const markAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refetchNotifications,
    isLoading: false,
  };
}
