import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { useFeature } from './usePlan';
import { useRole } from './useRole';
import { getSocket } from './useQueue';

/** Joins the clinic's notification socket rooms and keeps the feed + unread count live. */
function useStaffSocket(active) {
  const { clinicId, userId } = useRole();
  const qc = useQueryClient();
  useEffect(() => {
    if (!active || !clinicId) return undefined;
    const s = getSocket();
    const join = () => s.emit('staff:join', { clinicId, userId });
    if (s.connected) join();
    s.on('connect', join);
    const onNotif = () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    };
    s.on('notification:new', onNotif);
    return () => {
      s.off('connect', join);
      s.off('notification:new', onNotif);
    };
  }, [active, clinicId, userId, qc]);
}

export function useNotifications() {
  const enabled = useFeature('NOTIFICATION_CENTER');
  useStaffSocket(enabled);
  const feed = useQuery({ queryKey: ['notifications', 'feed'], queryFn: () => api.get('/api/notifications'), enabled });
  const unread = useQuery({ queryKey: ['notifications', 'unread'], queryFn: () => api.get('/api/notifications/unread-count'), enabled });
  return { feed, unread, enabled };
}

export function useMarkNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.post(`/api/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useMarkAllNotifications() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post('/api/notifications/read-all'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}
