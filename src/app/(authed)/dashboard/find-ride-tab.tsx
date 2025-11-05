
"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Ride, rides as mockRides, notifications as mockNotifications, Notification } from "@/lib/data";
import { format } from "date-fns";
import { Car, Users, Clock, Check, Hourglass, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import AiAssistantForm from "../components/ai-assistant-form";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user";

export default function FindRideTab() {
  const { toast } = useToast();
  const { user } = useUser();
  const [isPending, startTransition] = useTransition();
  const [currentRides, setCurrentRides] = useState<Ride[]>([]);
  const [currentNotifications, setCurrentNotifications] = useState<Notification[]>([]);
  
  const refreshState = () => {
    startTransition(() => {
      const storedNotifications = localStorage.getItem('notifications');
      const storedRides = localStorage.getItem('rides');
      
      setCurrentNotifications(storedNotifications ? JSON.parse(storedNotifications) : mockNotifications);
      setCurrentRides(storedRides ? JSON.parse(storedRides).map((r: any) => ({...r, departureTime: new Date(r.departureTime)})) : mockRides);
    });
  };

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'rides' || e.key === 'notifications') {
            refreshState();
        }
    };

    refreshState(); // Initial load
    window.addEventListener('storage', handleStorageChange);

    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, []);


  const handleRequestJoin = (rideId: string) => {
    if (!user) return;
    const ride = currentRides.find(r => r.id === rideId);
    
    if (ride) {
        const allNotifications = JSON.parse(localStorage.getItem('notifications') || JSON.stringify(mockNotifications));
        
        const existingNotification = allNotifications.find((n: Notification) => n.type === 'ride-request' && n.data.rideId === rideId && n.data.requesterId === user.id);
        if (existingNotification) {
             toast({
                title: "Request already sent!",
                description: "You have already requested to join this ride.",
                variant: "destructive"
            });
            return;
        }

        const newNotification: Notification = {
            id: `n${Date.now()}`,
            userId: ride.driver.id,
            read: false,
            message: `${user.name} wants to join your ride from ${ride.startLocation} to ${ride.destination}.`,
            timestamp: new Date(),
            type: 'ride-request',
            data: { rideId: ride.id, requesterId: user.id, status: 'pending' }
        };
        
        const updatedNotifications = [...allNotifications, newNotification];
        localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
        window.dispatchEvent(new Event('storage'));
        
        toast({
          title: "Request Sent!",
          description: "Your request to join the ride has been sent to the driver.",
        });
    }
  }

  const getRequestStatus = (rideId: string) => {
      if (!user) return null;
      const notification = currentNotifications.find(n => n.type === 'ride-request' && n.data.rideId === rideId && n.data.requesterId === user.id);
      return notification ? notification.data.status : null;
  }

  if (!user) return null;

  const availableRides = currentRides.filter((ride) => ride.status === "upcoming" && ride.availableSeats > 0 && ride.driver.id !== user.id);

  const renderJoinButton = (rideId: string) => {
      const status = getRequestStatus(rideId);
      switch(status) {
          case 'approved':
              return <Button disabled variant="secondary"><Check className="mr-2 h-4 w-4"/> Approved</Button>;
          case 'declined':
              return <Button disabled variant="destructive"><X className="mr-2 h-4 w-4"/> Declined</Button>;
          case 'pending':
              return <Button disabled variant="outline"><Hourglass className="mr-2 h-4 w-4"/> Pending</Button>;
          default:
              return <Button onClick={() => handleRequestJoin(rideId)}>Request Join</Button>;
      }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Find a Ride</CardTitle>
                    <CardDescription>Browse available rides or use the AI assistant to find your perfect match.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {availableRides.length > 0 ? availableRides.map((ride) => (
                        <Card key={ride.id}>
                            <CardHeader>
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                                <div>
                                <CardTitle className="text-lg">{ride.startLocation} &rarr; {ride.destination}</CardTitle>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                    <Avatar className="h-6 w-6 border">
                                    <AvatarImage src={ride.driver.avatarUrl} alt={ride.driver.name} />
                                    <AvatarFallback>{ride.driver.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span>{ride.driver.name}</span>
                                </div>
                                </div>
                                <div className="flex-shrink-0">
                                  {renderJoinButton(ride.id)}
                                </div>
                            </div>
                            </CardHeader>
                            <CardContent className="flex justify-between items-center text-sm">
                              <div className="flex flex-col gap-2 text-muted-foreground">
                                  <div className="flex items-center gap-2">
                                      <Clock className="h-4 w-4" />
                                      <span>{format(new Date(ride.departureTime), "E, MMM d 'at' h:mm a")}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                      <Users className="h-4 w-4" />
                                      <span>{ride.availableSeats} seats available</span>
                                  </div>
                              </div>
                              <Badge variant="secondary" className="hidden sm:inline-flex items-center">
                                  {ride.passengers.length} / {ride.passengers.length + ride.availableSeats} filled
                              </Badge>
                            </CardContent>
                        </Card>
                        )) : (
                            <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
                                <Car className="mx-auto h-12 w-12" />
                                <p className="mt-4 font-semibold">No available rides match your criteria right now.</p>
                                <p className="text-sm">Try offering a ride instead!</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1">
            <AiAssistantForm />
        </div>
    </div>
  );
}
