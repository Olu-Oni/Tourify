"use client";

import React, { ReactNode, useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  // track active sidebar tab
  const [active, setActive] = useState<"tours" | "analytics" | "settings">("analytics");

  return (
    <div className="flex min-h-screen">
      {/* <DashboardSidebar active={active} setActive={setActive} /> */}
      <main className="flex-1">{children}</main>
    </div>
  );
}