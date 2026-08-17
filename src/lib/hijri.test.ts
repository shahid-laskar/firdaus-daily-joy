import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { hijriParts, hijriLabel, islamicMarker, HIJRI_MONTH_NAMES } from "./hijri";

describe("Hijri Calendar Foundation", () => {
  test("HIJRI_MONTH_NAMES contains all 12 canonical months", () => {
    assert.equal(HIJRI_MONTH_NAMES.length, 12);
    assert.equal(HIJRI_MONTH_NAMES[0], "Muharram");
    assert.equal(HIJRI_MONTH_NAMES[1], "Safar");
    assert.equal(HIJRI_MONTH_NAMES[2], "Rabi al-Awwal");
    assert.equal(HIJRI_MONTH_NAMES[3], "Rabi al-Thani");
    assert.equal(HIJRI_MONTH_NAMES[4], "Jumada al-Awwal");
    assert.equal(HIJRI_MONTH_NAMES[5], "Jumada al-Thani");
    assert.equal(HIJRI_MONTH_NAMES[6], "Rajab");
    assert.equal(HIJRI_MONTH_NAMES[7], "Sha'ban");
    assert.equal(HIJRI_MONTH_NAMES[8], "Ramadan");
    assert.equal(HIJRI_MONTH_NAMES[9], "Shawwal");
    assert.equal(HIJRI_MONTH_NAMES[10], "Dhu al-Qi'dah");
    assert.equal(HIJRI_MONTH_NAMES[11], "Dhu al-Hijjah");
  });

  test("August 17, 2026 formats to 4 Rabi al-Awwal 1448 AH", () => {
    const d = new Date(Date.UTC(2026, 7, 17, 12, 0, 0));
    const parts = hijriParts(d);
    assert.ok(parts, "parts should not be null");
    assert.equal(parts.day, 4);
    assert.equal(parts.month, 3);
    assert.equal(parts.monthName, "Rabi al-Awwal");
    assert.equal(parts.year, 1448);

    const label = hijriLabel(d);
    assert.equal(label, "4 Rabi al-Awwal 1448 AH");
  });

  test("August 16 and August 18, 2026 format correctly", () => {
    const d16 = new Date(Date.UTC(2026, 7, 16, 12, 0, 0));
    assert.equal(hijriLabel(d16), "3 Rabi al-Awwal 1448 AH");

    const d18 = new Date(Date.UTC(2026, 7, 18, 12, 0, 0));
    assert.equal(hijriLabel(d18), "5 Rabi al-Awwal 1448 AH");
  });

  test("Ramadan 1447 AH detection and markers", () => {
    // 1 Ramadan 1447 falls on approx Feb 18, 2026
    const dRamadan1 = new Date(Date.UTC(2026, 1, 18, 12, 0, 0));
    const parts = hijriParts(dRamadan1);
    assert.ok(parts);
    assert.equal(parts.month, 9);
    assert.equal(parts.monthName, "Ramadan");
    assert.equal(parts.year, 1447);
    assert.equal(islamicMarker(dRamadan1), "Ramadan begins");
  });

  test("handles invalid dates gracefully", () => {
    const invalid = new Date("invalid date string");
    assert.equal(hijriParts(invalid), null);
    assert.equal(hijriLabel(invalid), "");
    assert.equal(islamicMarker(invalid), null);
  });
});
