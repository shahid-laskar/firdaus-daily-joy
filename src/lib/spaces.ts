import { Flower2, Home, Moon, Wallet, type LucideIcon } from "lucide-react";

export type SpaceId = "home" | "deen" | "budget" | "me";

export interface SpaceItem {
  id: SpaceId;
  to: string;
  label: string;
  glyph: string;
  icon: LucideIcon;
}

export const SPACES: readonly SpaceItem[] = [
  { id: "home", to: "/", label: "Home", glyph: "⌂", icon: Home },
  { id: "deen", to: "/deen", label: "Deen", glyph: "☾", icon: Moon },
  { id: "budget", to: "/budget", label: "Budget", glyph: "◈", icon: Wallet },
  { id: "me", to: "/me", label: "Me", glyph: "❋", icon: Flower2 },
] as const;
