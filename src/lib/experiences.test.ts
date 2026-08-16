import test from "node:test";
import assert from "node:assert/strict";
import {
  experiences,
  DEFAULT_EXPERIENCE,
  isExperienceId,
  type ExperienceId,
} from "./experiences";

test("Experience Registry Foundation", async (t) => {
  await t.test("default experience is calm", () => {
    assert.equal(DEFAULT_EXPERIENCE, "calm");
  });

  await t.test("isExperienceId validates correctly", () => {
    assert.equal(isExperienceId("calm"), true);
    assert.equal(isExperienceId("vibrant"), true);
    assert.equal(isExperienceId("unknown"), false);
    assert.equal(isExperienceId(null), false);
    assert.equal(isExperienceId(undefined), false);
    assert.equal(isExperienceId(123), false);
  });

  await t.test("experiences registry contains valid Calm and Vibrant definitions", () => {
    assert.equal(experiences.length, 2);
    const calm = experiences.find((e) => e.id === "calm");
    const vibrant = experiences.find((e) => e.id === "vibrant");

    assert.ok(calm);
    assert.equal(calm.name, "Calm");
    assert.ok(calm.tagline.length > 0);
    assert.ok(calm.description.length > 0);

    assert.ok(vibrant);
    assert.equal(vibrant.name, "Vibrant");
    assert.ok(vibrant.tagline.length > 0);
    assert.ok(vibrant.description.length > 0);
  });
});
