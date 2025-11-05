
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardTab from "./dashboard-tab";
import FindRideTab from "./find-ride-tab";
import OfferRideTab from "./offer-ride-tab";
import NotificationsTab from "./notifications-tab";

export default function DashboardPage() {
  return (
    <Tabs defaultValue="dashboard">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        <TabsTrigger value="find-ride">Find Ride</TabsTrigger>
        <TabsTrigger value="offer-ride">Offer Ride</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>
      <TabsContent value="dashboard">
        <DashboardTab />
      </TabsContent>
      <TabsContent value="find-ride">
        <FindRideTab />
      </TabsContent>
      <TabsContent value="offer-ride">
        <OfferRideTab />
      </TabsContent>
      <TabsContent value="notifications">
        <NotificationsTab />
      </TabsContent>
    </Tabs>
  );
}
