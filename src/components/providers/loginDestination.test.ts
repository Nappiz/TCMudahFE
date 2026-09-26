import assert from "node:assert/strict";

const { getSafeLoginDestination } = await import(
  // @ts-expect-error Node's strip-types runner resolves the explicit extension.
  "./loginDestination.ts"
);

assert.equal(getSafeLoginDestination("/cms/orders"), "/cms/orders");
assert.equal(getSafeLoginDestination("https://evil.example"), "/");
assert.equal(getSafeLoginDestination("//evil.example"), "/");
assert.equal(getSafeLoginDestination(null), "/");
