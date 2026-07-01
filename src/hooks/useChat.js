import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { useFeature } from './usePlan';
import { useRole } from './useRole';
import { getSocket } from './useQueue';

export function useStaffDirectory() {
  const enabled = useFeature('INTERNAL_CHAT');
  return useQuery({ queryKey: ['chat', 'staff'], queryFn: () => api.get('/api/chat/staff'), enabled });
}

export function useConversation(withStaffId) {
  const qc = useQueryClient();
  const { clinicId, userId } = useRole();
  const query = useQuery({
    queryKey: ['chat', 'conv', withStaffId],
    queryFn: () => api.get('/api/chat', { params: { withStaffId } }),
    enabled: !!withStaffId,
  });

  useEffect(() => {
    if (!clinicId || !withStaffId) return undefined;
    const s = getSocket();
    const join = () => s.emit('staff:join', { clinicId, userId });
    if (s.connected) join();
    s.on('connect', join);
    const onMsg = (m) => {
      if (m.fromStaffId === withStaffId || m.toStaffId === withStaffId) qc.invalidateQueries({ queryKey: ['chat', 'conv', withStaffId] });
      qc.invalidateQueries({ queryKey: ['chat', 'unread'] });
    };
    s.on('chat:message', onMsg);
    return () => {
      s.off('connect', join);
      s.off('chat:message', onMsg);
    };
  }, [clinicId, userId, withStaffId, qc]);

  return query;
}

export function useSendChat() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ toStaffId, body, fromName }) => api.post('/api/chat', { toStaffId, body, fromName }),
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ['chat', 'conv', v.toStaffId] }),
  });
}

export function useChatUnread() {
  const enabled = useFeature('INTERNAL_CHAT');
  return useQuery({ queryKey: ['chat', 'unread'], queryFn: () => api.get('/api/chat/unread-count'), enabled });
}
