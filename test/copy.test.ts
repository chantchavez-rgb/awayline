import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { composeReply, present } from "../lib/copy";
import { endOfDayIso } from "../lib/time";

const now = Date.parse("2026-11-06T20:00:00.000Z");

describe("status copy", () => {
  it("writes a reply with the reason, return time, and name", () => {
    const reply = composeReply(
      {
        active: true,
        reason: "driving",
        note: "",
        until: "2026-11-06T23:00:00.000Z",
        timeZone: "America/Los_Angeles",
        name: "Z",
      },
      now,
    );
    assert.ok(reply);
    assert.match(reply, /I'm driving and can't answer right now\./);
    assert.match(reply, /Back 3:00\sPM/);
    assert.match(reply, /— Z$/);
  });

  it("lets a note replace the stock line", () => {
    const reply = composeReply(
      {
        active: true,
        reason: "driving",
        note: "On the 101.",
        until: null,
        timeZone: "America/Los_Angeles",
        name: "",
      },
      now,
    );
    assert.equal(reply, "On the 101.");
  });

  it("stays quiet when the end time has passed", () => {
    const view = present(
      {
        active: true,
        reason: "meeting",
        note: "",
        until: "2026-11-06T18:00:00.000Z",
        timeZone: "America/Los_Angeles",
        name: "",
      },
      now,
    );
    assert.equal(view.live, false);
    assert.equal(view.reply, null);
  });

  it("ends the day at 11:59pm in the owner's zone", () => {
    assert.equal(endOfDayIso(new Date(now), "America/Los_Angeles"), "2026-11-07T07:59:00.000Z");
  });
});
