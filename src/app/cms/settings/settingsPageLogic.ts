export type SettingsAccessView = "loading" | "error" | "denied" | "ready";

export function getSettingsAccessView(
  loading: boolean,
  authorized: boolean | null,
  loadError: string | null,
): SettingsAccessView {
  if (loadError) return "error";
  if (loading || authorized === null) return "loading";
  if (!authorized) return "denied";
  return "ready";
}
