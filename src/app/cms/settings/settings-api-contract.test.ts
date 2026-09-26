import {
  fetchAdminSettings,
  fetchPublicSettings,
  updateCheckoutSettings,
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
const updatedCheckout: Promise<Record<string, string>> = updateCheckoutSettings(
  {
    bank_name: "BCA",
    bank_account: "123",
    bank_holder: "TC Mudah",
    group_link: "",
  },
);

void publicSettings;
void adminSettings;
void updatedSetting;
void updatedCheckout;
