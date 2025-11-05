
"use client";

import { useState, useEffect, useTransition, useRef } from "react";
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
import { Car, Users, Clock, Check, Hourglass, X, LocateFixed } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import AiAssistantForm from "../components/ai-assistant-form";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user";
import Map from "@/components/map"; 

export default function FindRideTab() {
  const { toast } = useToast();
  const { user } = useUser();
  const [isPending, startTransition] = useTransition();
  const [currentRides, setCurrentRides] = useState<Ride[]>([]);
  const [currentNotifications, setCurrentNotifications] = useState<Notification[]>([]);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isLive, setIsLive] = useState(false);
  const watchId = useRef<number | null>(null);

  useEffect(() => {
    const getLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                setUserLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude
                });
            }, () => {
                setUserLocation({ lat: 34.052235, lng: -118.243683 }); 
                toast({ title: "Location access denied.", description: "Showing default location.", variant: "destructive" });
            });
        } else {
            setUserLocation({ lat: 34.052235, lng: -118.243683 });
            toast({ title: "Geolocation not supported.", description: "Showing default location." });
        }
    };

    getLocation();

    return () => {
        if (watchId.current) {
            navigator.geolocation.clearWatch(watchId.current);
        }
    };

  }, [toast]);

  useEffect(() => {
    if (isLive) {
      watchId.current = navigator.geolocation.watchPosition(position => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      });
    } else {
      if (watchId.current) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
    }
  }, [isLive]);
  
  const refreshState = () => {
    startTransition(() => {
      const storedNotifications = localStorage.getItem('notifications');
      // Forcibly clear local storage for rides to ensure new data structure is used.
      // This is a temporary fix for development. In a real app, you'd handle this with a migration.
      localStorage.removeItem('rides');
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

    refreshState();
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

  const availableRides = currentRides.filter((ride) => ride.status === "upcoming" && ride.availableSeats > 0 && ride.driver.id !== user.id && ride.startLocationCoords);

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

  const mapMarkers = [
    ...(userLocation ? [{
      lat: userLocation.lat,
      lng: userLocation.lng,
      title: "You are here",
      icon: {
        url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
      }
    }] : []),
    ...availableRides.map(ride => ({
      lat: ride.startLocationCoords.lat,
      lng: ride.startLocationCoords.lng,
      title: `${ride.startLocation} to ${ride.destination}`
    }))
  ];

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-3 relative">
        <Card className="h-[calc(100vh-220px)]">
          <CardContent className="h-full p-0 rounded-lg overflow-hidden">
           {userLocation ? (
              <Map 
                apiKey={apiKey || ''} 
                lat={userLocation.lat} 
                lng={userLocation.lng} 
                zoom={12} 
                markers={mapMarkers}
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-muted">
                <p className="text-muted-foreground">Getting your location...</p>
              </div>
            )}
          </CardContent>
        </Card>
        <Button 
          onClick={() => setIsLive(!isLive)} 
          variant={isLive ? "destructive" : "secondary"} 
          className="absolute top-4 right-4 z-10"
        >
          <LocateFixed className="mr-2 h-4 w-4" />
          {isLive ? "Stop Live" : "Go Live"}
        </Button>
      </div>
      <div className="lg:col-span-2 space-y-6">
        <AiAssistantForm />
        <Card>
            <CardHeader>
                <CardTitle>Find a Ride</CardTitle>
                <CardDescription>Browse available rides.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4 max-h-[calc(100vh-420px)] overflow-y-auto">
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
    </div>
  );
}
