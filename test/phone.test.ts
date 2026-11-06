import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatPhone, normalizePhone, phoneFromParam } from "../lib/phone";

describe("phone numbers", () => {
  it("accepts a US number with punctuation", () => {
    assert.equal(normalizePhone("(415) 555-0134"), "+14155550134");
  });

  it("accepts 10 digits and a leading 1", () => {
    assert.equal(normalizePhone("4155550134"), "+14155550134");
    assert.equal(normalizePhone("1 415 555 0134"), "+14155550134");
  });

  it("keeps an international number that already has a plus", () => {
    assert.equal(normalizePhone("+44 20 7946 0958"), "+442079460958");
  });

  it("rejects numbers that are too short", () => {
    assert.equal(normalizePhone("123"), null);
    assert.equal(normalizePhone(""), null);
  });

  it("reads a number from a status link", () => {
    assert.equal(phoneFromParam("14155550134"), "+14155550134");
    assert.equal(phoneFromParam("4155550134"), "+14155550134");
  });

  it("formats US numbers for display", () => {
    assert.equal(formatPhone("+14155550134"), "+1 (415) 555-0134");
  });
});
