import { Home, User, Users } from "lucide-react";
import {
  type FamilyMember,
  getCanonicalFamilyRole,
  useSelectedMember,
} from "@/lib/family-model";
import { useStore } from "@/lib/store";
import { useExperience } from "@/lib/theme-provider";

export function MemberSelector({ className = "" }: { className?: string }) {
  const { experience } = useExperience();
  const [family] = useStore<FamilyMember[]>("family", []);
  const [selectedMemberId, setSelectedMemberId, activeMember] = useSelectedMember();

  if (family.length === 0) {
    return null;
  }

  const isVibrant = experience === "vibrant";

  if (isVibrant) {
    return (
      <div className={`no-scrollbar -mx-2 overflow-x-auto px-2 py-1 ${className}`}>
        <div
          role="tablist"
          aria-label="Family Perspective"
          className="flex w-max items-center gap-1.5 rounded-full bg-[color-mix(in_oklab,var(--card)_80%,transparent)] p-1 border border-border/60"
        >
          {/* Household option */}
          <button
            type="button"
            role="tab"
            aria-selected={selectedMemberId === undefined}
            onClick={() => setSelectedMemberId(undefined)}
            className={`press relative flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedMemberId === undefined
                ? "bg-[var(--space-accent)] text-[oklch(0.995_0.008_70)] shadow-[0_4px_14px_-6px_color-mix(in_oklab,var(--space-accent)_90%,transparent)]"
                : "text-ink-soft hover:text-foreground hover:bg-[color-mix(in_oklab,var(--space-accent)_8%,transparent)]"
            }`}
          >
            <Home className="size-3.5" />
            <span>Household</span>
          </button>

          {/* Individual family members */}
          {family.map((m) => {
            const isSelected = selectedMemberId === m.id;
            const canonicalRole = getCanonicalFamilyRole(m.role);
            return (
              <button
                key={m.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setSelectedMemberId(m.id)}
                className={`press relative flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[var(--space-accent)] text-[oklch(0.995_0.008_70)] shadow-[0_4px_14px_-6px_color-mix(in_oklab,var(--space-accent)_90%,transparent)]"
                    : "text-ink-soft hover:text-foreground hover:bg-[color-mix(in_oklab,var(--space-accent)_8%,transparent)]"
                }`}
              >
                <span
                  className="size-2 rounded-full flex-none"
                  style={{
                    backgroundColor: m.color || (canonicalRole === "child" ? "#3b82f6" : "#10b981"),
                  }}
                />
                <span>{m.name}</span>
                {canonicalRole === "child" && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[0.65rem] font-bold ${
                      isSelected ? "bg-white/20 text-white" : "bg-black/5 dark:bg-white/10 text-ink-faint"
                    }`}
                  >
                    Child
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Calm Experience (Default)
  return (
    <div className={`no-scrollbar -mx-2 overflow-x-auto px-2 ${className}`}>
      <div
        role="tablist"
        aria-label="Family Perspective"
        className="flex w-max items-center gap-1 border-b border-border/50 pb-1"
      >
        <button
          type="button"
          role="tab"
          aria-selected={selectedMemberId === undefined}
          onClick={() => setSelectedMemberId(undefined)}
          className={`press flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition-colors cursor-pointer ${
            selectedMemberId === undefined
              ? "bg-space-soft/70 font-semibold text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-space-soft/30"
          }`}
        >
          <Home className="size-3" />
          <span>Household</span>
        </button>

        {family.map((m) => {
          const isSelected = selectedMemberId === m.id;
          const canonicalRole = getCanonicalFamilyRole(m.role);
          return (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => setSelectedMemberId(m.id)}
              className={`press flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition-colors cursor-pointer ${
                isSelected
                  ? "bg-space-soft/70 font-semibold text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-space-soft/30"
              }`}
            >
              <span
                className="size-1.5 rounded-full flex-none"
                style={{
                  backgroundColor: m.color || (canonicalRole === "child" ? "#3b82f6" : "#10b981"),
                }}
              />
              <span>{m.name}</span>
              {canonicalRole === "child" && (
                <span className="text-[0.65rem] text-muted-foreground opacity-80">(Child)</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
