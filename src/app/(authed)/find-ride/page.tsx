
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
import AiAssistantForm from "./ai-assistant-form";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user";

export default function FindRidePage() {
  const { toast } = useToast();
  const { user } = useUser();
  const [isPending, startTransition] = useTransition();
  const [currentRides, setCurrentRides] = useState<Ride[]>(mockRides);
  const [currentNotifications, setCurrentNotifications] = useState<Notification[]>(mockNotifications);

  useEffect(() => {
    const storedNotifications = localStorage.getItem('notifications');
    if (storedNotifications) {
      setCurrentNotifications(JSON.parse(storedNotifications).map((n: any) => ({...n, timestamp: new Date(n.timestamp)})));
    }
    const storedRides = localStorage.getItem('rides');
     if (storedRides) {
      setCurrentRides(JSON.parse(storedRides).map((r: any) => ({...r, departureTime: new Date(r.departureTime)})));
    }
  }, [isPending]);

  const updateAndStoreNotifications = (newNotifications: Notification[]) => {
      setCurrentNotifications(newNotifications);
      localStorage.setItem('notifications', JSON.stringify(newNotifications));
      startTransition(() => {});
  }

  if (!user) return null;

  const availableRides = currentRides.filter((ride) => ride.status === "upcoming" && ride.availableSeats > 0 && ride.driver.id !== user.id);

  const handleRequestJoin = (rideId: string) => {
    const ride = currentRides.find(r => r.id === rideId);
    if (ride) {
        const existingNotification = currentNotifications.find(n => n.type === 'ride-request' && n.data.rideId === rideId && n.data.requesterId === user.id);
        if (existingNotification) {
             toast({
                title: "Request already sent!",
                description: "You have already requested to join this ride.",
                variant: "destructive"
            });
            return;
        }

        const newNotification: Notification = {
            id: `n${currentNotifications.length + 1}`,
            userId: ride.driver.id,
            read: false,
            message: `${user.name} wants to join your ride from ${ride.startLocation} to ${ride.destination}.`,
            timestamp: new Date(),
            type: 'ride-request',
            data: { rideId: ride.id, requesterId: user.id, status: 'pending' }
        };
        
        const allNotifications = JSON.parse(localStorage.getItem('notifications') || JSON.stringify(mockNotifications));
        const updatedNotifications = [...allNotifications, newNotification];
        updateAndStoreNotifications(updatedNotifications);
        
        toast({
          title: "Request Sent!",
          description: "Your request to join the ride has been sent to the driver.",
        });
    }
  }

  const getRequestStatus = (rideId: string) => {
      const notification = currentNotifications.find(n => n.type === 'ride-request' && n.data.rideId === rideId && n.data.requesterId === user.id);
      return notification ? notification.data.status : null;
  }

  const renderJoinButton = (rideId: string) => {
      const status = getRequestStatus(rideId);
      switch(status) {
          case 'approved':
              return <Button disabled variant="secondary"><Check className="mr-2"/> Approved</Button>;
          case 'declined':
              return <Button disabled variant="destructive"><X className="mr-2"/> Declined</Button>;
          case 'pending':
              return <Button disabled variant="outline"><Hourglass className="mr-2"/> Pending</Button>;
          default:
              return <Button onClick={() => handleRequestJoin(rideId)}>Request Join</Button>;
      }
  }

  return (
    <div className="grid gap-6 md:grid-cols-12">
        <div className="md:col-span-8">
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
                            <div className="flex justify-between items-start">
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
                                {renderJoinButton(ride.id)}
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
                            <Badge variant="secondary" className="hidden sm:inline-flex">
                                {ride.passengers.length} / {ride.passengers.length + ride.availableSeats} filled
                            </Badge>
                            </CardContent>
                        </Card>
                        )) : (
                            <div className="text-center py-10 text-muted-foreground">
                                <Car className="mx-auto h-12 w-12" />
                                <p className="mt-4">No available rides match your criteria right now.</p>
                                <p>Try offering a ride instead!</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
        <div className="md:col-span-4">
            <AiAssistantForm />
        </div>
    </div>
  );
}
