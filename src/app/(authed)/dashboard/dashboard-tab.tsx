
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
import { Ride, rides as mockRides } from "@/lib/data";
import { format } from "date-fns";
import { Car, Leaf, RadioTower, Clock, PlayCircle, XCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/hooks/use-user";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState, useTransition, useEffect } from "react";
import { startRide } from "../ride/actions";

export default function DashboardTab() {
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [rides, setRides] = useState<Ride[]>([]);

  const refreshState = () => {
    startTransition(() => {
       const storedRides = localStorage.getItem("rides");
       if (storedRides) {
          setRides(JSON.parse(storedRides).map((r: any) => ({...r, departureTime: new Date(r.departureTime)})));
       } else {
          setRides(mockRides);
       }
    });
  }

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'rides') {
        refreshState();
      }
    };

    refreshState(); // Initial load
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleStartRide = async (rideId: string) => {
    const result = await startRide(rideId);
    if (result.success) {
        const updatedRides = JSON.parse(JSON.stringify(rides));
        const rideIndex = updatedRides.findIndex((r: Ride) => r.id === rideId);
        
        if (rideIndex !== -1) {
            updatedRides[rideIndex].status = 'active';
            localStorage.setItem("rides", JSON.stringify(updatedRides));
            window.dispatchEvent(new Event('storage'));
            toast({
                title: "Ride Started!",
                description: "Passengers have been notified.",
            });
        } else {
            toast({ title: "Error", description: "Ride not found", variant: "destructive" });
        }
    } else {
        toast({ title: "Error", description: result.error, variant: "destructive" });
    }
};

  const handleCancelSpot = async (rideId: string) => {
      if (!user) return;
      const updatedRides = JSON.parse(JSON.stringify(rides));
      const rideIndex = updatedRides.findIndex((r: Ride) => r.id === rideId);

      if (rideIndex !== -1) {
        const passengerIndex = updatedRides[rideIndex].passengers.findIndex((p:any) => p.id === user.id);
        if (passengerIndex !== -1) {
            updatedRides[rideIndex].passengers.splice(passengerIndex, 1);
            updatedRides[rideIndex].availableSeats += 1;
            localStorage.setItem("rides", JSON.stringify(updatedRides));
            window.dispatchEvent(new Event('storage'));
            toast({ title: "Spot Canceled", description: "You have been removed from the ride." });
        } else {
             toast({ title: "Error", description: "You are not on this ride.", variant: "destructive" });
        }
      } else {
          toast({ title: "Error", description: "Ride not found.", variant: "destructive" });
      }
  }

  const handleCancelRide = async (rideId: string) => {
    const updatedRides = JSON.parse(JSON.stringify(rides));
    const rideIndex = updatedRides.findIndex((r: Ride) => r.id === rideId);

    if (rideIndex !== -1) {
        updatedRides[rideIndex].status = 'completed'; // Or 'canceled' if we add that status
        localStorage.setItem("rides", JSON.stringify(updatedRides));
        window.dispatchEvent(new Event('storage'));
        toast({ title: "Ride Canceled", description: "The ride has been canceled." });
    } else {
        toast({ title: "Error", description: "Could not cancel the ride.", variant: "destructive" });
    }
  }
  
  if (!user) return null;

  const upcomingRide = rides.find(
    (ride) =>
      (ride.driver.id === user.id ||
        ride.passengers.some((p) => p.id === user.id)) &&
      ride.status === "upcoming"
  );
  const activeRide = rides.find(
    (ride) =>
      (ride.driver.id === user.id ||
        ride.passengers.some((p) => p.id === user.id)) &&
      ride.status === "active"
  );
  const hostedRides = rides.filter((ride) => ride.driver.id === user.id).length;
  const ecoPoints = hostedRides * 10 + rides.filter(r => r.passengers.some(p => p.id === user.id)).length * 5;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Welcome back, {user.name}!</CardTitle>
          <CardDescription>
            Here's your carpooling summary. Let's make today's commute greener.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {activeRide ? (
            <div>
              <h3 className="text-lg font-semibold mb-2">Active Ride</h3>
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                      <CardTitle className="text-base font-medium">
                        {activeRide.startLocation} to {activeRide.destination}
                      </CardTitle>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Avatar className="h-6 w-6 mr-2 border">
                          <AvatarImage src={activeRide.driver.avatarUrl} alt={activeRide.driver.name} />
                          <AvatarFallback>{activeRide.driver.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>Driver: {activeRide.driver.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button asChild>
                          <Link href={`/ride/${activeRide.id}/track`}>
                              <RadioTower className="mr-2" />
                              Track Live
                          </Link>
                      </Button>
                      {user.id === activeRide.driver.id && (
                        <Button variant="destructive" onClick={() => handleCancelRide(activeRide.id)} disabled={isPending}>
                          <AlertTriangle className="mr-2" />
                          Cancel Ride
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </div>
          ) : upcomingRide ? (
            <div>
              <h3 className="text-lg font-semibold mb-2">Your Next Ride</h3>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base font-medium">
                    {upcomingRide.startLocation} to {upcomingRide.destination}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {user.id === upcomingRide.driver.id ? (
                      <Button onClick={() => handleStartRide(upcomingRide.id)} disabled={isPending}>
                        <PlayCircle className="mr-2" />
                        Start Ride
                      </Button>
                    ) : (
                       <Button variant="destructive" onClick={() => handleCancelSpot(upcomingRide.id)} disabled={isPending}>
                        <XCircle className="mr-2"/>
                        Cancel Spot
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground space-y-2">
                     <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4" />
                      <span>{format(new Date(upcomingRide.departureTime), "PPpp")}</span>
                    </div>
                    <div className="flex items-center">
                      <Avatar className="h-6 w-6 mr-2 border">
                        <AvatarImage src={upcomingRide.driver.avatarUrl} alt={upcomingRide.driver.name} />
                        <AvatarFallback>{upcomingRide.driver.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>Driver: {upcomingRide.driver.name}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="mb-4">No upcoming rides. Time to plan your next trip!</p>
              <div className="flex gap-4 justify-center">
                <Button asChild>
                    <Link href="/find-ride">Find a Ride</Link>
                </Button>
                <Button asChild variant="secondary">
                    <Link href="/offer-ride">Offer a Ride</Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <div className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Rides Hosted</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hostedRides}</div>
            <p className="text-xs text-muted-foreground">Total rides as a driver</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Eco-Points</CardTitle>
            <Leaf className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ecoPoints}</div>
            <p className="text-xs text-muted-foreground">Your contribution to a greener planet</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
