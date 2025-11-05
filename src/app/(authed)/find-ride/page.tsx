
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { rides } from "@/lib/data";
import { format } from "date-fns";
import { Car, Users, Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import AiAssistantForm from "./ai-assistant-form";
import { useToast } from "@/hooks/use-toast";

export default function FindRidePage() {
  const { toast } = useToast();
  const availableRides = rides.filter((ride) => ride.status === "upcoming" && ride.availableSeats > 0);

  const handleRequestJoin = (rideId: string) => {
    toast({
      title: "Request Sent!",
      description: "Your request to join the ride has been sent to the driver.",
    });
    console.log("Requested to join ride:", rideId);
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
                        {availableRides.map((ride) => (
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
                                <Button onClick={() => handleRequestJoin(ride.id)}>Request Join</Button>
                            </div>
                            </CardHeader>
                            <CardContent className="flex justify-between items-center text-sm">
                            <div className="flex flex-col gap-2 text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span>{format(ride.departureTime, "E, MMM d 'at' h:mm a")}</span>
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
                        ))}
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
