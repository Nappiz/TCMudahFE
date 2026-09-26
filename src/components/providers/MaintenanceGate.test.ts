import assert from "node:assert/strict";

const { isMaintenanceBypassPath, shouldShowMaintenance } = await import(
  // @ts-expect-error Node's strip-types runner resolves the explicit extension.
  "./maintenanceGateLogic.ts"
);

assert.equal(isMaintenanceBypassPath("/cms"), true);
assert.equal(isMaintenanceBypassPath("/cms/settings"), true);
assert.equal(isMaintenanceBypassPath("/login"), true);
assert.equal(isMaintenanceBypassPath("/register"), true);
assert.equal(isMaintenanceBypassPath("/peserta"), false);

assert.equal(shouldShowMaintenance("/peserta", true, false), true);
assert.equal(shouldShowMaintenance("/cms", true, false), false);
assert.equal(shouldShowMaintenance("/login", true, false), false);
assert.equal(shouldShowMaintenance("/peserta", true, true), false);
