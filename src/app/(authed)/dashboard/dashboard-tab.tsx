
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
import { Ride } from "@/lib/data";
import { format } from "date-fns";
import { Car, Leaf, RadioTower, Clock, PlayCircle, XCircle, AlertTriangle, PartyPopper } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/hooks/use-user";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState, useTransition, useEffect } from "react";
import { startRide, getRides } from "../ride/actions";

export default function DashboardTab() {
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [rides, setRides] = useState<Ride[]>([]);

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const fetchedRides = await getRides();
        setRides(fetchedRides.map((r: any) => ({...r, id: r.id.toString(), driver: {id: r.driver_id.toString(), name: r.driver_name, avatarUrl: r.driver_avatar}, passengers: [], departureTime: new Date(r.departure_time), startLocation: r.origin, availableSeats: r.available_seats, status: new Date(r.departure_time) < new Date() ? 'completed' : 'upcoming' })));
      } catch (error) {
        toast({
          title: "Error Fetching Rides",
          description: "Could not fetch rides from the server.",
          variant: "destructive",
        });
      }
    };

    fetchRides();
  }, [toast]);

  const handleStartRide = async (rideId: string) => {
    const result = await startRide(rideId);
    if (result.success) {
      const updatedRides = rides.map(r => r.id === rideId ? {...r, status: 'active'} : r)
      setRides(updatedRides)
      toast({
        title: "Ride Started!",
        description: "Passengers have been notified.",
      });
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
  };

  const handleCancelSpot = async (rideId: string) => {
    if (!user) return;
    // This is a placeholder for now, as we don't have the backend endpoint for this yet.
    toast({ title: "Spot Canceled", description: "You have been removed from the ride." });
  }

  const handleCancelRide = async (rideId: string) => {
    const updatedRides = rides.map(r => r.id === rideId ? {...r, status: 'completed'} : r)
    setRides(updatedRides)
    toast({ title: "Ride Canceled", description: "The ride has been canceled." });
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

  const WelcomeHeader = () => (
     <div className="mb-6">
        <h1 className="text-3xl font-bold">Welcome back, {user.name}!</h1>
        <p className="text-muted-foreground">Here's your carpooling summary. Let's make today's commute greener.</p>
      </div>
  )

  const RideInfo = ({ ride, type }: { ride: Ride, type: 'active' | 'upcoming'}) => {
    const isDriver = user.id === ride.driver.id;

    return (
        <Card>
            <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div className="flex flex-col gap-1">
                <CardTitle className="text-lg">
                    {ride.startLocation} to {ride.destination}
                </CardTitle>
                <div className="flex items-center text-sm text-muted-foreground">
                    <Avatar className="h-6 w-6 mr-2 border">
                    <AvatarImage src={ride.driver.avatarUrl} alt={ride.driver.name} />
                    <AvatarFallback>{ride.driver.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>Driver: {ride.driver.name}</span>
                </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    {type === 'active' ? (
                        <>
                            <Button asChild>
                                <Link href={`/ride/${ride.id}/track`}>
                                    <RadioTower className="mr-2 h-4 w-4" />
                                    Track Live
                                </Link>
                            </Button>
                            {isDriver && (
                                <Button variant="destructive" onClick={() => handleCancelRide(ride.id)} disabled={isPending}>
                                <AlertTriangle className="mr-2 h-4 w-4" />
                                Cancel
                                </Button>
                            )}
                        </>
                    ) : (
                        isDriver ? (
                        <Button onClick={() => handleStartRide(ride.id)} disabled={isPending}>
                            <PlayCircle className="mr-2 h-4 w-4" />
                            Start Ride
                        </Button>
                        ) : (
                        <Button variant="destructive" onClick={() => handleCancelSpot(ride.id)} disabled={isPending}>
                            <XCircle className="mr-2 h-4 w-4"/>
                            Cancel Spot
                        </Button>
                        )
                    )}
                 </div>
            </div>
            </CardHeader>
             {type === 'upcoming' && (
                 <CardContent>
                    <div className="text-sm text-muted-foreground space-y-2">
                        <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4" />
                        <span>{format(new Date(ride.departureTime), "PPpp")}</span>
                        </div>
                    </div>
                </CardContent>
             )}
        </Card>
    );
  }

  const NoRides = () => (
      <Card className="text-center py-10">
          <CardContent>
            <PartyPopper className="mx-auto h-12 w-12 text-primary" />
            <h3 className="mt-4 text-lg font-semibold">No upcoming rides!</h3>
            <p className="mt-2 text-sm text-muted-foreground">You have no scheduled or active rides. </p>
            <p className="text-sm text-muted-foreground">Ready to plan your next trip?</p>
          </CardContent>
      </Card>
  )

  return (
    <div className="grid gap-6">
        <WelcomeHeader />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
                {activeRide && (
                    <div>
                        <h3 className="text-xl font-semibold mb-2">Active Ride</h3>
                        <RideInfo ride={activeRide} type="active" />
                    </div>
                )}
                {upcomingRide && (
                     <div>
                        <h3 className="text-xl font-semibold mb-2">Your Next Ride</h3>
                        <RideInfo ride={upcomingRide} type="upcoming" />
                    </div>
                )}
                {!activeRide && !upcomingRide && <NoRides />}
            </div>
            <div className="space-y-6">
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
    </div>
  );
}
