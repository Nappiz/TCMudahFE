import assert from "node:assert/strict";

const { getSettingsAccessView } = await import(
  // @ts-expect-error Node's strip-types runner resolves the explicit extension.
  "./settingsPageLogic.ts"
);

assert.equal(getSettingsAccessView(true, null, null), "loading");
assert.equal(getSettingsAccessView(false, null, "Gagal memuat"), "error");
assert.equal(getSettingsAccessView(false, true, "Gagal memuat"), "error");
assert.equal(getSettingsAccessView(false, false, null), "denied");
assert.equal(getSettingsAccessView(false, true, null), "ready");
