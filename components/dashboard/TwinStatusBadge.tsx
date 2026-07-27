"use client";

import { useEffect, useState } from "react";

type TwinStatus = "online" | "offline" | "paused" | "degraded";

const STATUS_CONFIG: Record<TwinStatus, { label: string; dotColor: string; textColor: string; bgColor: string }> = {
  online: {
    label: "Twin Active",
    dotColor: "bg-green-500",
    textColor: "text-green-700",
    bgColor: "bg-green-50",
  },
  offline: {
    label: "Twin Offline",
    dotColor: "bg-red-500",
    textColor: "text-red-700",
    bgColor: "bg-red-50",
  },
  paused: {
    label: "Twin Paused",
    dotColor: "bg-yellow-500",
    textColor: "text-yellow-700",
    bgColor: "bg-yellow-50",
  },
  degraded: {
    label: "Degraded",
    dotColor: "bg-orange-500",
    textColor: "text-orange-700",
    bgColor: "bg-orange-50",
  },
};

export default function TwinStatusBadge() {
  const [status, setStatus] = useState<TwinStatus>("online");

  useEffect(() => {
    // Check twin status via API
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setStatus("offline");
        } else {
          setStatus("online");
        }
      })
      .catch(() => setStatus("offline"));
  }, []);

  const config = STATUS_CONFIG[status];

  return (
    <div className={`hidden sm:flex items-center gap-2 rounded-full ${config.bgColor} px-2.5 py-1`}>
      <span className={`h-2 w-2 rounded-full ${config.dotColor} ${status === "online" ? "animate-pulse" : ""}`} />
      <span className={`font-medium text-xs ${config.textColor}`}>{config.label}</span>
    </div>
  );
}
