"use client";

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";
import { notifications as mockNotifications, users, rides, Notification } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Check, X, Car, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function NotificationsPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (user) {
      // In a real app, you'd fetch this. Here we filter the mock data.
      const userNotifications = mockNotifications
        .filter(n => n.userId === user.id)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      setNotifications(userNotifications);
    }
  }, [user]);

  const handleApprove = (notificationId: string, rideId: string, requesterId: string) => {
    const ride = rides.find(r => r.id === rideId);
    const requester = users.find(u => u.id === requesterId);
    
    if (ride && requester && ride.availableSeats > 0) {
      ride.passengers.push(requester);
      ride.availableSeats--;
      
      const notif = mockNotifications.find(n => n.id === notificationId);
      if (notif) notif.data.status = 'approved';

      // Notify the requester
      mockNotifications.push({
        id: `n${mockNotifications.length + 1}`,
        userId: requester.id,
        read: false,
        message: `Your request to join the ride to ${ride.destination} has been approved.`,
        timestamp: new Date(),
        type: 'ride-update',
        data: { rideId: ride.id, status: 'approved' }
      });
      
      toast({ title: "Request Approved!", description: `${requester.name} has been added to your ride.` });
      // Refresh notifications state
       setNotifications(prev => prev.map(n => n.id === notificationId ? {...n, data: {...n.data, status: 'approved'}} : n));
    } else {
        toast({ title: "Approval Failed", description: "The ride is full or the request is invalid.", variant: "destructive" });
    }
  };

  const handleDecline = (notificationId: string, rideId: string, requesterId: string) => {
     const ride = rides.find(r => r.id === rideId);
     const requester = users.find(u => u.id === requesterId);

     if (ride && requester) {
        const notif = mockNotifications.find(n => n.id === notificationId);
        if (notif) notif.data.status = 'declined';

        // Notify the requester
        mockNotifications.push({
            id: `n${mockNotifications.length + 1}`,
            userId: requester.id,
            read: false,
            message: `Your request to join the ride to ${ride.destination} has been declined.`,
            timestamp: new Date(),
            type: 'ride-update',
            data: { rideId: ride.id, status: 'declined' }
        });

        toast({ title: "Request Declined" });
        // Refresh notifications state
        setNotifications(prev => prev.map(n => n.id === notificationId ? {...n, data: {...n.data, status: 'declined'}} : n));
     }
  };

  const renderRideRequest = (notification: Notification) => {
      const requester = users.find(u => u.id === notification.data.requesterId);
      if (!requester) return null;

      return (
          <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                  <Avatar className="h-10 w-10">
                      <AvatarImage src={requester.avatarUrl} alt={requester.name} />
                      <AvatarFallback>{requester.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                    </p>
                  </div>
              </div>
              {notification.data.status === 'pending' ? (
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleApprove(notification.id, notification.data.rideId, notification.data.requesterId)}><Check className="h-4 w-4 mr-1"/>Approve</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDecline(notification.id, notification.data.rideId, notification.data.requesterId)}><X className="h-4 w-4 mr-1"/>Decline</Button>
                </div>
              ) : (
                <p className="text-sm font-medium text-muted-foreground">{notification.data.status === 'approved' ? 'Approved' : 'Declined'}</p>
              )}
          </div>
      )
  };

  const renderRideUpdate = (notification: Notification) => (
       <div className="flex items-start gap-4">
          <Info className="h-10 w-10 text-primary" />
          <div>
            <p className="text-sm">{notification.message}</p>
            <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
            </p>
          </div>
      </div>
  );

  const renderNotification = (notification: Notification) => {
      switch(notification.type) {
          case 'ride-request': return renderRideRequest(notification);
          case 'ride-update': return renderRideUpdate(notification);
          default: return null;
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
                    <div key={n.id}>
                       {renderNotification(n)}
                    </div>
                ))}
            </div>
        ) : (
            <div className="text-center py-10 text-muted-foreground">
                <Car className="mx-auto h-12 w-12" />
                <p className="mt-4">No new notifications.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
