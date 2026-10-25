import assert from "node:assert/strict";
import test from "node:test";
import { leadUploadError } from "../lib/leadAttachments.ts";

test("a short-form upload accepts a few photos and a pdf", () => {
  assert.equal(
    leadUploadError([
      { name: "kitchen.jpg", type: "image/jpeg", size: 200_000 },
      { name: "plan.pdf", type: "application/pdf", size: 1_000_000 },
    ]),
    null,
  );
});

test("a short-form upload rejects the wrong kind, too many, and oversized files", () => {
  assert.match(leadUploadError([{ name: "notes.exe", type: "application/octet-stream", size: 100 }]) || "", /photo, plan, or PDF/);
  assert.match(
    leadUploadError([
      { name: "a.jpg", type: "image/jpeg", size: 10 },
      { name: "b.jpg", type: "image/jpeg", size: 10 },
      { name: "c.jpg", type: "image/jpeg", size: 10 },
      { name: "d.jpg", type: "image/jpeg", size: 10 },
    ]) || "",
    /up to 3/,
  );
  assert.match(leadUploadError([{ name: "big.pdf", type: "application/pdf", size: 7 * 1024 * 1024 }]) || "", /under 6 MB/);
});
