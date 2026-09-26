const BYPASS_PATHS = ["/cms", "/login", "/register"];

export function isMaintenanceBypassPath(pathname: string): boolean {
  return BYPASS_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export function shouldShowMaintenance(
  pathname: string,
  enabled: boolean,
  requestFailed: boolean,
): boolean {
  return enabled && !requestFailed && !isMaintenanceBypassPath(pathname);
}
