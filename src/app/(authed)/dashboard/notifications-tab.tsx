
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
import { notifications as mockNotifications, users, rides as mockRides, Ride, Notification } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Check, X, Car, Info, RadioTower, Bell } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function NotificationsTab() {
  const { user } = useUser();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [rides, setRides] = useState<Ride[]>([]);

  const refreshState = () => {
    if (!user) return;
    const storedNotifications = localStorage.getItem('notifications');
    const storedRides = localStorage.getItem('rides');

    const allNotifications: Notification[] = storedNotifications 
        ? JSON.parse(storedNotifications).map((n: any) => ({...n, timestamp: new Date(n.timestamp)}))
        : mockNotifications;
    
    const userNotifications = allNotifications
        .filter((n: Notification) => n.userId === user.id)
        .sort((a: Notification, b: Notification) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    setNotifications(userNotifications);
    setRides(storedRides ? JSON.parse(storedRides).map((r: any) => ({...r, departureTime: new Date(r.departureTime)})) : mockRides);
  };

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'rides' || e.key === 'notifications') {
            refreshState();
        }
    };

    refreshState();
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, [user]);

  const markNotificationsAsRead = () => {
    if (!user) return;
    const allNotifs: Notification[] = JSON.parse(localStorage.getItem('notifications') || '[]').map((n: any) => ({...n, timestamp: new Date(n.timestamp)}));
    const updatedNotifs = allNotifs.map(n => n.userId === user.id ? { ...n, read: true } : n);
    localStorage.setItem('notifications', JSON.stringify(updatedNotifs));
    window.dispatchEvent(new Event('storage'));
  };

  useEffect(() => {
    // When the component mounts, mark notifications as read.
    markNotificationsAsRead();
  }, [user]);

  const handleApprove = (notification: Notification) => {
    const { rideId, requesterId } = notification.data;
    const allRides: Ride[] = JSON.parse(localStorage.getItem('rides') || '[]').map(r => ({...r, departureTime: new Date(r.departureTime)}));
    const rideIndex = allRides.findIndex(r => r.id === rideId);
    const requester = users.find(u => u.id === requesterId);

    if (rideIndex !== -1 && requester && allRides[rideIndex].availableSeats > 0) {
        allRides[rideIndex].passengers.push(requester);
        allRides[rideIndex].availableSeats--;
        localStorage.setItem('rides', JSON.stringify(allRides));

        const approvalNotif: Notification = {
            id: `n${Date.now()}`,
            userId: requesterId,
            read: false,
            message: `Your request for the ride to ${allRides[rideIndex].destination} was approved!`,
            timestamp: new Date(),
            type: 'ride-update',
            data: { rideId, status: 'approved' }
        };

        const allNotifs: Notification[] = JSON.parse(localStorage.getItem('notifications') || '[]');
        const updatedNotifs = allNotifs.map(n => n.id === notification.id ? {...n, data: {...n.data, status: 'approved'}} : n);
        updatedNotifs.push(approvalNotif);
        localStorage.setItem('notifications', JSON.stringify(updatedNotifs));

        window.dispatchEvent(new Event('storage'));
        toast({ title: "Request Approved!", description: `${requester.name} has been added to your ride.` });
    } else {
        toast({ title: "Approval Failed", description: "The ride is full or the request is invalid.", variant: "destructive" });
    }
  };

  const handleDecline = (notification: Notification) => {
     const { rideId, requesterId } = notification.data;
     const allRides: Ride[] = JSON.parse(localStorage.getItem('rides') || '[]').map(r => ({...r, departureTime: new Date(r.departureTime)}));
     const ride = allRides.find(r => r.id === rideId);

     if (ride) {
        const declineNotif: Notification = {
            id: `n${Date.now()}`,
            userId: requesterId,
            read: false,
            message: `Your request for the ride to ${ride.destination} was declined.`,
            timestamp: new Date(),
            type: 'ride-update',
            data: { rideId, status: 'declined' }
        };

        const allNotifs: Notification[] = JSON.parse(localStorage.getItem('notifications') || '[]');
        const updatedNotifs = allNotifs.map(n => n.id === notification.id ? {...n, data: {...n.data, status: 'declined'}} : n);
        updatedNotifs.push(declineNotif);
        localStorage.setItem('notifications', JSON.stringify(updatedNotifs));

        window.dispatchEvent(new Event('storage'));
        toast({ title: "Request Declined" });
     }
  };

  const renderRideRequest = (notification: Notification) => {
      const requester = users.find(u => u.id === notification.data.requesterId);
      if (!requester) return null;

      return (
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex items-start gap-4">
                  <Avatar className="h-10 w-10 border">
                      <AvatarImage src={requester.avatarUrl} alt={requester.name} />
                      <AvatarFallback>{requester.name.charAt(0)}</AvatarFallback>
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
                    <Button size="sm" variant="outline" onClick={() => handleApprove(notification)}><Check className="mr-1 h-4 w-4"/>Approve</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDecline(notification)}><X className="mr-1 h-4 w-4"/>Decline</Button>
                </div>
              ) : (
                <p className="text-sm font-medium text-muted-foreground capitalize self-end sm:self-auto">{notification.data.status}</p>
              )}
          </div>
      )
  };

  const renderRideUpdate = (notification: Notification) => {
      const ride = rides.find(r => r.id === notification.data.rideId);
      const isRideStarted = notification.message.includes('has started');

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
          {isRideStarted && ride && (
              <Button asChild size="sm" variant="outline" className="self-end sm:self-auto">
                  <Link href={`/ride/${ride.id}/track`}>
                      <RadioTower className="mr-2 h-4 w-4"/>
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
