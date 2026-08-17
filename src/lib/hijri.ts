/** Hijri dates for the unified calendar. */

const FMT = "en-u-ca-islamic-umalqura";

export const HIJRI_MONTH_NAMES = [
  "Muharram",
  "Safar",
  "Rabi al-Awwal",
  "Rabi al-Thani",
  "Jumada al-Awwal",
  "Jumada al-Thani",
  "Rajab",
  "Sha'ban",
  "Ramadan",
  "Shawwal",
  "Dhu al-Qi'dah",
  "Dhu al-Hijjah",
] as const;

export function hijriParts(
  d: Date,
): { day: number; month: number; monthName: string; year: number } | null {
  try {
    const parts = new Intl.DateTimeFormat(FMT, {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    }).formatToParts(d);
    const get = (t: string) => Number(parts.find((p) => p.type === t)?.value?.replace(/\D/g, ""));
    const day = get("day");
    const month = get("month");
    const year = get("year");

    if (!day || !month || !year || month < 1 || month > 12) return null;

    const monthName = HIJRI_MONTH_NAMES[month - 1];
    return { day, month, monthName, year };
  } catch {
    return null;
  }
}

export function hijriLabel(d: Date): string {
  const p = hijriParts(d);
  return p ? `${p.day} ${p.monthName} ${p.year} AH` : "";
}

/** A small, non-exhaustive set of dates worth surfacing quietly. */
export function islamicMarker(d: Date): string | null {
  const p = hijriParts(d);
  if (!p) return null;
  if (p.month === 9 && p.day === 1) return "Ramadan begins";
  if (p.month === 9 && p.day === 27) return "Laylat al-Qadr (likely)";
  if (p.month === 10 && p.day === 1) return "Eid al-Fitr";
  if (p.month === 12 && p.day === 9) return "Day of Arafah";
  if (p.month === 12 && p.day === 10) return "Eid al-Adha";
  if (p.month === 1 && p.day === 10) return "Ashura";
  if (p.month === 1 && p.day === 1) return "Islamic New Year";
  if (d.getDay() === 5) return null;
  return null;
}

