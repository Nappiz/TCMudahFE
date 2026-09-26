type SettingsMap = Record<string, string>;

export type CheckoutSettings = {
  bank_name: string;
  bank_account: string;
  bank_holder: string;
  group_link: string;
};

const API_BASE = "/api";

async function readError(response: Response): Promise<string> {
  try {
    const body = await response.json();
    if (typeof body?.detail === "string") return body.detail;
  } catch {
    // Fall back to the status text below.
  }
  return response.statusText || "Request failed";
}

async function fetchSettings(
  path: string,
  keys: string[],
): Promise<SettingsMap> {
  const params = new URLSearchParams();
  for (const key of keys) params.append("keys", key);

  const response = await fetch(`${API_BASE}${path}?${params.toString()}`, {
    credentials: "include",
    cache: "no-store",
  });
  if (!response.ok) throw new Error(await readError(response));
  return (await response.json()) as SettingsMap;
}

export function fetchPublicSettings(keys: string[]): Promise<SettingsMap> {
  return fetchSettings("/settings", keys);
}

export function fetchAdminSettings(keys: string[]): Promise<SettingsMap> {
  return fetchSettings("/admin/settings", keys);
}

export async function updateSetting(
  key: string,
  value: string,
): Promise<{ key: string; value: string }> {
  const response = await fetch(
    `${API_BASE}/settings/${encodeURIComponent(key)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ value }),
    },
  );
  if (!response.ok) throw new Error(await readError(response));
  return (await response.json()) as { key: string; value: string };
}

export async function updateCheckoutSettings(
  settings: CheckoutSettings,
): Promise<Record<string, string>> {
  const response = await fetch(`${API_BASE}/admin/settings/checkout`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(settings),
  });
  if (!response.ok) throw new Error(await readError(response));
  return (await response.json()) as Record<string, string>;
}
