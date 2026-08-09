import assert from "node:assert/strict";
import test from "node:test";

import {
  PROFILE_COMPLETION_MESSAGE,
  PROFILE_COMPLETION_ROUTE,
  createProfileCompletionRedirect,
} from "../src/lib/profileCompletion.js";

const createHarness = () => {
  const notifications = [];
  const navigations = [];
  const scheduled = [];
  const handler = createProfileCompletionRedirect({
    notify: (message, options) => notifications.push({ message, options }),
    navigate: (url) => navigations.push(url),
    schedule: (callback, delay) => scheduled.push({ callback, delay }),
  });
  return { handler, navigations, notifications, scheduled };
};

test("ignores unrelated API errors", () => {
  const harness = createHarness();

  assert.equal(harness.handler({ code: "permission_denied" }), false);
  assert.equal(harness.notifications.length, 0);
  assert.equal(harness.scheduled.length, 0);
});

test("shows profile guidance and schedules the profile redirect", () => {
  const harness = createHarness();

  assert.equal(harness.handler({ code: "profile_incomplete" }), true);
  assert.equal(harness.notifications[0].message, PROFILE_COMPLETION_MESSAGE);
  assert.equal(harness.notifications[0].options.action.label, "Complete profile");
  assert.equal(harness.scheduled[0].delay, 1200);

  harness.notifications[0].options.action.onClick();
  harness.scheduled[0].callback();
  assert.deepEqual(harness.navigations, [
    PROFILE_COMPLETION_ROUTE,
    PROFILE_COMPLETION_ROUTE,
  ]);
});

test("uses the backend detail and suppresses duplicate prompts", () => {
  const harness = createHarness();
  const response = { code: "profile_incomplete", detail: "Add both names." };

  assert.equal(harness.handler(response), true);
  assert.equal(harness.handler(response), true);
  assert.equal(harness.notifications.length, 1);
  assert.equal(harness.notifications[0].message, "Add both names.");
  assert.equal(harness.scheduled.length, 1);
});