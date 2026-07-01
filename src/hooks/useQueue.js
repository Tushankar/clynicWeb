import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import { api, API_URL, getAuthToken } from '@/lib/api/client';

// One shared socket connection for the whole app. The Clerk token is sent in the
// handshake so the server can scope staff notif/chat rooms to the verified identity
// (the server never trusts client-supplied clinicId/userId for those rooms).
let socket = null;
export function getSocket() {
  if (!socket) {
    socket = io(API_URL, {
      transports: ['websocket'],
      autoConnect: true,
      auth: (cb) => getAuthToken().then((token) => cb({ token })).catch(() => cb({})),
    });
  }
  return socket;
}

/**
 * Authenticated reception queue: REST snapshot (full names) + live refetch on
 * Socket.IO 'queue:update'. (TV uses the socket payload directly — see useTvQueue.)
 */
export function useQueue(branchId, clinicId) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ['queue', branchId],
    queryFn: () => api.get('/api/queue', { params: { branchId } }),
    enabled: !!branchId,
  });

  useEffect(() => {
    if (!branchId || !clinicId) return undefined;
    const s = getSocket();
    const join = () => s.emit('queue:join', { clinicId, branchId });
    if (s.connected) join();
    s.on('connect', join);
    const onUpdate = () => qc.invalidateQueries({ queryKey: ['queue', branchId] });
    s.on('queue:update', onUpdate);
    return () => {
      s.off('connect', join);
      s.off('queue:update', onUpdate);
      s.emit('queue:leave', { clinicId, branchId });
    };
  }, [branchId, clinicId, qc]);

  return query;
}

function useQueueMutation(fn) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['queue'] });
      qc.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

export const useCallNext = () => useQueueMutation((body) => api.post('/api/queue/call-next', body));
export const useCompleteEntry = () => useQueueMutation((id) => api.post(`/api/queue/${id}/complete`));
export const useSkipEntry = () => useQueueMutation((id) => api.post(`/api/queue/${id}/skip`));
