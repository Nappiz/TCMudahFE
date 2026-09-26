"use client";

import { usePathname } from "next/navigation";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import { fetchPublicSettings } from "../../../lib/settings";
import MaintenanceScreen from "../MaintenanceScreen";
import {
  isMaintenanceBypassPath,
  shouldShowMaintenance,
} from "./maintenanceGateLogic";

export {
  isMaintenanceBypassPath,
  shouldShowMaintenance,
} from "./maintenanceGateLogic";

const DEFAULT_MESSAGE =
  "Situs sedang dalam maintenance. Silakan coba lagi nanti.";
const REFRESH_INTERVAL_MS = 30_000;

type MaintenanceGateProps = {
  children: ReactNode;
};

export default function MaintenanceGate({ children }: MaintenanceGateProps) {
  const pathname = usePathname() || "/";
  const [state, setState] = useState({
    enabled: false,
    message: DEFAULT_MESSAGE,
    requestFailed: false,
  });

  const refresh = useCallback(async () => {
    if (isMaintenanceBypassPath(pathname)) {
      setState((current) => ({ ...current, requestFailed: false }));
      return;
    }

    try {
      const settings = await fetchPublicSettings([
        "maintenance_mode",
        "maintenance_message",
      ]);
      setState({
        enabled: settings.maintenance_mode === "true",
        message: settings.maintenance_message || DEFAULT_MESSAGE,
        requestFailed: false,
      });
    } catch {
      setState((current) => ({
        ...current,
        enabled: false,
        requestFailed: true,
      }));
    }
  }, [pathname]);

  useEffect(() => {
    void refresh();

    const handleFocus = () => {
      void refresh();
    };
    window.addEventListener("focus", handleFocus);
    const interval = window.setInterval(() => {
      void refresh();
    }, REFRESH_INTERVAL_MS);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.clearInterval(interval);
    };
  }, [refresh]);

  if (shouldShowMaintenance(pathname, state.enabled, state.requestFailed)) {
    return <MaintenanceScreen message={state.message} />;
  }

  return <>{children}</>;
}
