
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardTab from "./dashboard-tab";
import FindRideTab from "./find-ride-tab";
import OfferRideTab from "./offer-ride-tab";
import NotificationsTab from "./notifications-tab";

export default function DashboardPage() {
  return (
    <Tabs defaultValue="dashboard" className="flex flex-col flex-1">
      <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        <TabsTrigger value="find-ride">Find Ride</TabsTrigger>
        <TabsTrigger value="offer-ride">Offer Ride</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>
      <TabsContent value="dashboard" className="mt-4 flex-1">
        <DashboardTab />
      </TabsContent>
      <TabsContent value="find-ride" className="mt-4 flex-1">
        <FindRideTab />
      </TabsContent>
      <TabsContent value="offer-ride" className="mt-4 flex-1">
        <OfferRideTab />
      </TabsContent>
      <TabsContent value="notifications" className="mt-4 flex-1">
        <NotificationsTab />
      </TabsContent>
    </Tabs>
  );
}
