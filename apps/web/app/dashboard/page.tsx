"use client";

import React, { useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import AnalyticsView from "@/components/analytics-view";
import ToursList from "@/components/ToursList";
import Settings from "@/components/Settings";
import { Toaster } from "sonner";

export default function Dashboard() {
  const [active, setActive] = useState<"tours" | "analytics" | "settings">("analytics");

  return (
    <>
      <Toaster position="top-right" />
      <div className="flex w-full min-h-screen">
        <DashboardSidebar active={active} setActive={setActive} />

        <div className="flex-1 p-6">
          {active === "analytics" && <AnalyticsView />}
          {active === "tours" && <ToursList />}
          {active === "settings" && <Settings />}
        </div>
      </div>
    </>
  );
}

