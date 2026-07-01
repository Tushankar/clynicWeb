import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useNotifications, useMarkNotification, useMarkAllNotifications } from '@/hooks/useNotifications';
import { fmtDateTime } from '@/lib/format';

/** In-app notification bell (top bar). Plan-gated — hidden unless NOTIFICATION_CENTER unlocked. */
export function NotificationBell() {
  const { feed, unread, enabled } = useNotifications();
  const markAll = useMarkAllNotifications();
  const markOne = useMarkNotification();
  const navigate = useNavigate();
  if (!enabled) return null;

  const items = feed.data?.items || [];
  const count = unread.data?.count || 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          {count > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-destructive-foreground">
              {count > 9 ? '9+' : count}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <span className="text-sm font-medium">Notifications</span>
          {count > 0 && (
            <button onClick={() => markAll.mutate()} className="text-caption text-primary hover:underline">
              Mark all read
            </button>
          )}
        </div>
        <div className="max-h-80 overflow-auto">
          {items.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">No notifications yet</div>
          ) : (
            items.map((n) => (
              <button
                key={n._id}
                onClick={() => {
                  if (!n.read) markOne.mutate(n._id);
                  if (n.link) navigate(n.link);
                }}
                className={`block w-full border-b px-3 py-2 text-left text-sm last:border-0 hover:bg-accent ${n.read ? '' : 'bg-primary/5'}`}
              >
                <div className={n.read ? 'text-muted-foreground' : 'font-medium'}>{n.message}</div>
                <div className="text-caption text-muted-foreground">{fmtDateTime(n.createdAt)}</div>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
