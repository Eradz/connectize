import assert from "node:assert/strict";
import test from "node:test";

import { createPDFDocument } from "../src/lib/generatePDF.js";

test("creates a non-empty PDF document from post content", () => {
  const document = createPDFDocument(
    "Quarterly update",
    "Connectize generated this report from a post body."
  );
  const bytes = document.output("arraybuffer");

  assert.ok(bytes instanceof ArrayBuffer);
  assert.ok(bytes.byteLength > 500);
  assert.equal(document.getNumberOfPages(), 1);
});