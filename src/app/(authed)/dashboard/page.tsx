
"use client";

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardTab from "./dashboard-tab";
import FindRideTab from "./find-ride-tab";
import OfferRideTab from "./offer-ride-tab";
import NotificationsTab from "./notifications-tab";

function DashboardPageContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'dashboard';

  const renderTabContent = () => {
    switch (tab) {
      case 'find-ride':
        return <FindRideTab />;
      case 'offer-ride':
        return <OfferRideTab />;
      case 'notifications':
        return <NotificationsTab />;
      default:
        return <DashboardTab />;
    }
  };

  return <>{renderTabContent()}</>;
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardPageContent />
    </Suspense>
  );
}
