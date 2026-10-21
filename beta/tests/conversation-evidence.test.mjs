import assert from "node:assert/strict";
import { test } from "node:test";
import { analysableContributions } from "../src/lib/conversation-evidence.ts";

test("analysis receives only participant Contribute and Share messages", () => {
  const messages = [
    { sender: "participant", confidentiality: "PRIVATE", content: "private statement" },
    { sender: "fielded", confidentiality: "CONTRIBUTE", content: "AI response" },
    { sender: "participant", confidentiality: "CONTRIBUTE", content: "contributed statement" },
    { sender: "participant", confidentiality: "SHARE", content: "shared statement" },
  ];
  assert.deepEqual(analysableContributions(messages).map(({ content }) => content), [
    "contributed statement",
    "shared statement",
  ]);
});

test("private-only dialogue has no analysable contribution", () => {
  assert.deepEqual(analysableContributions([
    { sender: "participant", confidentiality: "PRIVATE", content: "private statement" },
  ]), []);
});
