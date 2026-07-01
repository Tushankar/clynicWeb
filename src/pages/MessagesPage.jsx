import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Send, MessageSquare } from 'lucide-react';
import { PageHeader, EmptyState, LoadingSkeleton } from '@/components/primitives';
import { FeatureGate } from '@/components/FeatureGate';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useRole } from '@/hooks/useRole';
import { useStaffDirectory, useConversation, useSendChat } from '@/hooks/useChat';
import { fmtTime } from '@/lib/format';
import { toastApiError } from '@/lib/toast';

export default function MessagesPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Messages" description="Quick internal chat between reception and doctors." />
      <FeatureGate feature="INTERNAL_CHAT"><MessagesInner /></FeatureGate>
    </div>
  );
}

function MessagesInner() {
  const { user } = useUser();
  const { userId } = useRole();
  const dir = useStaffDirectory();
  const staff = dir.data?.items || [];
  const [withId, setWithId] = useState('');
  const conv = useConversation(withId);
  const send = useSendChat();
  const [body, setBody] = useState('');
  const endRef = useRef(null);

  const messages = conv.data?.items || [];
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const submit = async () => {
    if (!body.trim() || !withId) return;
    try {
      await send.mutateAsync({ toStaffId: withId, body, fromName: user?.fullName || 'Me' });
      setBody('');
    } catch (e) {
      toastApiError(e);
    }
  };

  if (dir.isLoading) return <LoadingSkeleton lines={5} />;

  return (
    <div className="grid gap-4 lg:grid-cols-[16rem_1fr]">
      {/* Directory */}
      <Card className="overflow-hidden">
        <div className="border-b px-3 py-2 text-sm font-medium">Team</div>
        {staff.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">No teammates found for this clinic.</p>
        ) : (
          <ul>
            {staff.map((s) => (
              <li key={s.userId}>
                <button
                  onClick={() => setWithId(s.userId)}
                  className={cn('flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent', withId === s.userId && 'bg-accent')}
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                    {(s.name || '?').slice(0, 1).toUpperCase()}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{s.name || s.userId}</span>
                    <span className="block text-caption capitalize text-muted-foreground">{(s.role || '').replace('org:', '')}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Conversation */}
      <Card className="flex h-[60vh] flex-col">
        {!withId ? (
          <EmptyState icon={MessageSquare} title="Pick a teammate" description="Select someone on the left to start chatting." />
        ) : (
          <>
            <div className="flex-1 space-y-2 overflow-auto p-4">
              {conv.isLoading ? (
                <LoadingSkeleton lines={4} />
              ) : messages.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No messages yet. Say hello.</p>
              ) : (
                messages.map((m) => {
                  const mine = m.fromStaffId === userId;
                  return (
                    <div key={m._id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                      <div className={cn('max-w-[75%] rounded-lg px-3 py-2 text-sm', mine ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                        <div>{m.body}</div>
                        <div className={cn('mt-0.5 text-[10px]', mine ? 'text-primary-foreground/70' : 'text-muted-foreground')}>{fmtTime(m.createdAt)}</div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={endRef} />
            </div>
            <form
              className="flex gap-2 border-t p-3"
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
            >
              <Input value={body} onChange={(e) => setBody(e.target.value)} placeholder="Type a message…" />
              <Button type="submit" size="icon" disabled={!body.trim() || send.isPending} aria-label="Send"><Send className="h-4 w-4" /></Button>
            </form>
          </>
        )}
      </Card>
    </div>
  );
}
