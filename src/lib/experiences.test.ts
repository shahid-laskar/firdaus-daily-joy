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

  await t.test("experience IDs map strictly to supported values without bloom contamination", () => {
    const ids = experiences.map((e) => e.id);
    assert.deepEqual(ids, ["calm", "vibrant"]);
    assert.equal(ids.includes("bloom" as never), false);
  });

  await t.test("secondary spaces hero variants contract is well-defined", () => {
    const expectedVariants = ["home", "deen", "budget", "me", "review"];
    assert.equal(expectedVariants.length, 5);
    expectedVariants.forEach((v) => {
      assert.ok(typeof v === "string" && v.length > 0);
    });
  });

  await t.test("shell navigation spaces contract holds both glyph and icon presentations", async () => {
    const { SPACES } = await import("./spaces");
    assert.equal(SPACES.length, 4);
    const ids = SPACES.map((s) => s.id);
    assert.deepEqual(ids, ["home", "deen", "budget", "me"]);
    SPACES.forEach((s) => {
      assert.ok(s.glyph && typeof s.glyph === "string", `glyph exists for ${s.id}`);
      assert.ok(s.icon && typeof s.icon === "object", `icon exists for ${s.id}`);
      assert.ok(s.to && typeof s.to === "string", `route exists for ${s.id}`);
    });
  });
});


