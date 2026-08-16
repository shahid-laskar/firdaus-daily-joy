/**
 * Central Experience registry for Firdaus.
 *
 * An Experience is an archetype that guides layout composition, visual hierarchy,
 * typography personality, component presentation, and motion language.
 *
 * It is orthogonal to a Color Theme (which primarily dictates palette tokens).
 * - Calm: default handcrafted paper-and-ink materiality, editorial serif type, quiet thread.
 * - Vibrant: modern aurora gradients, geometric display typography, life-area tonal voices.
 */

export type ExperienceId = "calm" | "vibrant";

export interface ExperienceDefinition {
  id: ExperienceId;
  name: string;
  tagline: string;
  description: string;
}

export const DEFAULT_EXPERIENCE: ExperienceId = "calm";

export const experiences: ExperienceDefinition[] = [
  {
    id: "calm",
    name: "Calm",
    tagline: "Handcrafted Paper & Thread",
    description:
      "Handcrafted paper-and-ink ground, editorial serif typography, quiet accents, and a chronological daily spine.",
  },
  {
    id: "vibrant",
    name: "Vibrant",
    tagline: "Dawn Bloom & Tonal Bento",
    description:
      "Expressive auroras, modern geometric typography, life-area tonal voices, and modular bento tiles.",
  },
];

export function isExperienceId(value: unknown): value is ExperienceId {
  return value === "calm" || value === "vibrant";
}
