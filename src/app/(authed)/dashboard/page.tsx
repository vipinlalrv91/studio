import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { mockUser, rides } from "@/lib/data";
import { format } from "date-fns";
import { Car, Leaf, MapPin, Users, Clock, RadioTower } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const upcomingRide = rides.find(
    (ride) =>
      (ride.driver.id === mockUser.id ||
        ride.passengers.some((p) => p.id === mockUser.id)) &&
      ride.status === "upcoming"
  );
  const activeRide = rides.find(
    (ride) =>
      (ride.driver.id === mockUser.id ||
        ride.passengers.some((p) => p.id === mockUser.id)) &&
      ride.status === "active"
  );
  const hostedRides = rides.filter((ride) => ride.driver.id === mockUser.id).length;
  const ecoPoints = hostedRides * 10 + rides.filter(r => r.passengers.some(p => p.id === mockUser.id)).length * 5;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Welcome back, {mockUser.name}!</CardTitle>
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
                     <Button asChild>
                        <Link href={`/ride/${activeRide.id}/track`} className="flex items-center gap-2">
                            <RadioTower className="h-4 w-4" />
                            Track Live
                        </Link>
                    </Button>
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
                  <Car className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground space-y-2">
                     <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4" />
                      <span>{format(upcomingRide.departureTime, "PPpp")}</span>
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
