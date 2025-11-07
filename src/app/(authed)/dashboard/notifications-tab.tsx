
"use client";

import { useState, useEffect, useTransition } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";
import { Notification } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Check, X, Car, Bell } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getNotifications, updateRideRequest } from "../ride/actions";

export default function NotificationsTab() {
  const { user, token } = useUser();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchNotifications = async () => {
    if (!user || !token) return;

    try {
      const fetchedNotifs = await getNotifications(token);
      const formattedNotifs = fetchedNotifs.map((n: any) => ({
        id: n.id,
        userId: n.user_id,
        read: n.read,
        message: n.message,
        timestamp: new Date(n.created_at),
        type: n.type,
        data: {
          rideId: n.data.ride_id,
          requesterId: n.data.requester_id,
          requesterName: n.data.requester_name,
          requesterAvatar: n.data.requester_avatar,
          status: n.data.status,
          requestId: n.data.request_id
        }
      })).sort((a: Notification, b: Notification) => b.timestamp.getTime() - a.timestamp.getTime());
      setNotifications(formattedNotifs);
    } catch (error) {
      toast({ title: "Error", description: "Could not fetch notifications.", variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user, token]);

  const handleRequestUpdate = (notification: Notification, status: 'accepted' | 'rejected') => {
    startTransition(async () => {
        if (!token) {
            toast({ title: "Error", description: "Authentication token not found.", variant: "destructive" });
            return;
        }

      try {
        await updateRideRequest(notification.data.rideId, notification.data.requestId, status, token);
        toast({ title: `Request ${status === 'accepted' ? 'Approved' : 'Declined'}` });
        fetchNotifications(); // Refresh notifications
      } catch (error) {
        toast({ title: "Error", description: `Failed to ${status === 'accepted' ? 'approve' : 'decline'} request.`, variant: "destructive" });
      }
    });
  };

  const renderRideRequest = (notification: Notification) => {
      return (
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex items-start gap-4">
                  <Avatar className="h-10 w-10 border">
                      <AvatarImage src={notification.data.requesterAvatar} alt={notification.data.requesterName} />
                      <AvatarFallback>{notification.data.requesterName?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                    </p>
                  </div>
              </div>
              {notification.data.status === 'pending' ? (
                <div className="flex gap-2 flex-shrink-0 self-end sm:self-auto">
                    <Button size="sm" variant="outline" onClick={() => handleRequestUpdate(notification, 'accepted')} disabled={isPending}><Check className="mr-1 h-4 w-4"/>Approve</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleRequestUpdate(notification, 'rejected')} disabled={isPending}><X className="mr-1 h-4 w-4"/>Decline</Button>
                </div>
              ) : (
                <p className="text-sm font-medium text-muted-foreground capitalize self-end sm:self-auto">{notification.data.status}</p>
              )}
          </div>
      )
  };

  const renderRideUpdate = (notification: Notification) => {
      return (
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
           <div className="flex items-start gap-4">
              <Avatar className="h-10 w-10 border">
                  <Car className="h-5 w-5 m-auto text-primary" />
              </Avatar>
              <div>
                <p className="text-sm font-medium">{notification.message}</p>
                <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                </p>
              </div>
          </div>
      </div>
      )
  };

  const renderNotification = (notification: Notification) => {
      switch(notification.type) {
          case 'ride-request': return renderRideRequest(notification);
          case 'ride-update': return renderRideUpdate(notification);
          default: return <p>{notification.message}</p>;
      }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          Here are your latest updates and ride requests.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {notifications.length > 0 ? (
            <div className="space-y-6">
                {notifications.map(n => (
                    <div key={n.id} className="pb-6 border-b last:border-b-0 last:pb-0">
                       {renderNotification(n)}
                    </div>
                ))}
            </div>
        ) : (
            <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
                <Bell className="mx-auto h-12 w-12" />
                <p className="mt-4 font-semibold">No new notifications.</p>
                 <p className="text-sm">Check back later for updates on your rides.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
