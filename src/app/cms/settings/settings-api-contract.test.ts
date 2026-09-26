import {
  fetchAdminSettings,
  fetchPublicSettings,
  updateSetting,
} from "../../../../lib/settings";

const publicSettings: Promise<Record<string, string>> = fetchPublicSettings([
  "maintenance_mode",
]);
const adminSettings: Promise<Record<string, string>> = fetchAdminSettings([
  "checkout_bank_name",
]);
const updatedSetting: Promise<{ key: string; value: string }> = updateSetting(
  "maintenance_mode",
  "false",
);

void publicSettings;
void adminSettings;
void updatedSetting;
