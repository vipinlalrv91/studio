
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
import { notifications as mockNotifications, users, rides, Ride, Notification } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Check, X, Car, Info, RadioTower } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function NotificationsPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentRides, setCurrentRides] = useState<Ride[]>(rides);

  useEffect(() => {
    if (user) {
      // Load from localStorage on component mount
      const storedNotifications = localStorage.getItem('notifications');
      const storedRides = localStorage.getItem('rides');
      
      const allNotifications = storedNotifications 
        ? JSON.parse(storedNotifications).map((n: any) => ({...n, timestamp: new Date(n.timestamp)}))
        : mockNotifications;

      if (storedRides) {
        setCurrentRides(JSON.parse(storedRides).map((r: any) => ({...r, departureTime: new Date(r.departureTime)})));
      }

      const userNotifications = allNotifications
        .filter((n: Notification) => n.userId === user.id)
        .sort((a: Notification, b: Notification) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setNotifications(userNotifications);
    }
  }, [user]);

  const updateAndStoreNotifications = (newNotifications: Notification[]) => {
      setNotifications(newNotifications.filter(n => n.userId === user?.id).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
      
      const stored = localStorage.getItem('notifications');
      const allNotifs = stored ? JSON.parse(stored) : mockNotifications;
      
      // Update only relevant notifications, don't just overwrite
      const updatedAllNotifs = allNotifs.map((n: Notification) => {
          const updated = newNotifications.find(un => un.id === n.id);
          return updated || n;
      });

      // Add potentially new notifications
      newNotifications.forEach(nn => {
        if (!updatedAllNotifs.find((n: Notification) => n.id === nn.id)) {
          updatedAllNotifs.push(nn);
        }
      });

      localStorage.setItem('notifications', JSON.stringify(updatedAllNotifs));
  }

  const updateAndStoreRides = (newRides: Ride[]) => {
      setCurrentRides(newRides);
      localStorage.setItem('rides', JSON.stringify(newRides));
  }

  const handleApprove = (notificationId: string, rideId: string, requesterId: string) => {
    let ride = currentRides.find(r => r.id === rideId);
    const requester = users.find(u => u.id === requesterId);
    
    if (ride && requester && ride.availableSeats > 0) {
      const updatedRide = {
        ...ride,
        passengers: [...ride.passengers, requester],
        availableSeats: ride.availableSeats - 1,
      };

      const updatedRides = currentRides.map(r => r.id === rideId ? updatedRide : r);
      updateAndStoreRides(updatedRides);
      
      const newNotification: Notification = {
        id: `n${notifications.length + mockNotifications.length + 1}`, // make id more robust
        userId: requester.id,
        read: false,
        message: `Your request to join the ride to ${ride.destination} has been approved.`,
        timestamp: new Date(),
        type: 'ride-update',
        data: { rideId: ride.id, status: 'approved' }
      };

      const stored = localStorage.getItem('notifications');
      const allNotifs = stored ? JSON.parse(stored).map((n: any) => ({...n, timestamp: new Date(n.timestamp)})) : mockNotifications;
      
      const updatedNotifs = allNotifs.map((n: Notification) => 
          n.id === notificationId ? {...n, data: {...n.data, status: 'approved'}} : n
      );
      updatedNotifs.push(newNotification);

      updateAndStoreNotifications(updatedNotifs);
      
      toast({ title: "Request Approved!", description: `${requester.name} has been added to your ride.` });
    } else {
        toast({ title: "Approval Failed", description: "The ride is full or the request is invalid.", variant: "destructive" });
    }
  };

  const handleDecline = (notificationId: string, rideId: string, requesterId: string) => {
     const ride = currentRides.find(r => r.id === rideId);
     const requester = users.find(u => u.id === requesterId);

     if (ride && requester) {
        const newNotification: Notification = {
            id: `n${notifications.length + mockNotifications.length + 1}`,
            userId: requester.id,
            read: false,
            message: `Your request to join the ride to ${ride.destination} has been declined.`,
            timestamp: new Date(),
            type: 'ride-update',
            data: { rideId: ride.id, status: 'declined' }
        };

        const stored = localStorage.getItem('notifications');
        const allNotifs = stored ? JSON.parse(stored).map((n: any) => ({...n, timestamp: new Date(n.timestamp)})) : mockNotifications;
        
        const updatedNotifs = allNotifs.map((n: Notification) => 
            n.id === notificationId ? {...n, data: {...n.data, status: 'declined'}} : n
        );
        updatedNotifs.push(newNotification);
        
        updateAndStoreNotifications(updatedNotifs);

        toast({ title: "Request Declined" });
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
                    <Button size="sm" variant="outline" onClick={() => handleApprove(notification.id, notification.data.rideId, notification.data.requesterId)}><Check className="mr-1 h-4 w-4"/>Approve</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDecline(notification.id, notification.data.rideId, notification.data.requesterId)}><X className="mr-1 h-4 w-4"/>Decline</Button>
                </div>
              ) : (
                <p className="text-sm font-medium text-muted-foreground">{notification.data.status === 'approved' ? 'Approved' : 'Declined'}</p>
              )}
          </div>
      )
  };

  const renderRideUpdate = (notification: Notification) => {
      const ride = currentRides.find(r => r.id === notification.data.rideId);
      const isRideStarted = notification.message.includes('has started');

      return (
        <div className="flex items-start justify-between">
           <div className="flex items-start gap-4">
              {isRideStarted ? <Car className="h-10 w-10 text-primary" /> : <Info className="h-10 w-10 text-primary" />}
              <div>
                <p className="text-sm">{notification.message}</p>
                <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                </p>
              </div>
          </div>
          {isRideStarted && ride && (
              <Button asChild size="sm" variant="outline">
                  <Link href={`/ride/${ride.id}/track`}>
                      <RadioTower className="mr-2"/>
                      Track
                  </Link>
              </Button>
          )}
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
