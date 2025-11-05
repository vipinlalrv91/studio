
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Ride, rides as mockRides } from "@/lib/data";
import MapComponent from "./map";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";

export default function TrackRidePage({ params }: { params: { id: string } }) {
  const [ride, setRide] = useState<Ride | undefined>(undefined);

  useEffect(() => {
    const storedRides = localStorage.getItem("rides");
    const allRides: Ride[] = storedRides ? JSON.parse(storedRides).map((r: any) => ({...r, departureTime: new Date(r.departureTime)})) : mockRides;
    const currentRide = allRides.find((r) => r.id === params.id);
    setRide(currentRide);
  }, [params.id]);


  if (!ride) {
    // You might want a loading state here
    return <div>Loading ride details...</div>;
  }
  
  return (
    <div className="grid gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Live Ride Tracking</CardTitle>
                <CardDescription>
                You are tracking the ride from {ride.startLocation} to {ride.destination}.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <MapComponent ride={ride} />
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Ride Details</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12 border">
                        <AvatarImage src={ride.driver.avatarUrl} alt={ride.driver.name} />
                        <AvatarFallback>{ride.driver.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold">{ride.driver.name}</p>
                        <p className="text-sm text-muted-foreground">Driver</p>
                    </div>
                </div>
                 <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="font-semibold">Vehicle</p>
                        <p className="text-muted-foreground">Tesla Model 3</p>
                    </div>
                    <div>
                        <p className="font-semibold">License Plate</p>
                        <p className="text-muted-foreground">ABC-1234</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
