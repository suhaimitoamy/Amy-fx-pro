import test from "node:test";
import assert from "node:assert/strict";

await import("../app/src/main/assets/apps/shared/amyfx-info-tip.js");
const InfoTip = globalThis.AmyInfoTip;

test("createInfoTipMarkup escapes quotes/HTML and returns accessible button", () => {
  const html = InfoTip.createInfoTipMarkup('Catat hasil "Win" & <Loss>', { label: "Info performa" });
  assert.match(html, /class="amy-info-btn"/);
  assert.match(html, /data-info-tip="Catat hasil &quot;Win&quot; &amp; &lt;Loss&gt;"/);
  assert.match(html, /aria-label="Info performa"/);
  assert.match(html, /aria-expanded="false"/);
  assert.equal(InfoTip.createInfoTipMarkup("   "), "");
});

test("computePopoverPosition clamps horizontally on narrow mobile viewport", () => {
  const leftEdge = InfoTip.computePopoverPosition(
    { left: 10, top: 100, bottom: 118, width: 18 },
    { width: 280, height: 70 },
    { width: 360, height: 800 }
  );
  assert.equal(leftEdge.left, 12);
  assert.equal(leftEdge.placement, "bottom");
  assert.equal(leftEdge.top, 126);

  const rightEdge = InfoTip.computePopoverPosition(
    { left: 335, top: 100, bottom: 118, width: 18 },
    { width: 280, height: 70 },
    { width: 360, height: 800 }
  );
  assert.equal(rightEdge.left, 360 - 280 - 12);
});

test("computePopoverPosition flips above anchor near viewport bottom", () => {
  const nearBottom = InfoTip.computePopoverPosition(
    { left: 180, top: 760, bottom: 778, width: 18 },
    { width: 240, height: 90 },
    { width: 390, height: 844 }
  );
  assert.equal(nearBottom.placement, "top");
  assert.equal(nearBottom.top, 760 - 90 - 8);
});
