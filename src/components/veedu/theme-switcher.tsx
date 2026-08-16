import { useTheme } from "@/lib/theme-provider";
import { themes, type ColorMode, type ThemeDefinition } from "@/lib/themes";
import { experiences, type ExperienceDefinition } from "@/lib/experiences";

function swatchFor(theme: ThemeDefinition, mode: ColorMode) {
  return mode === "dark" ? theme.swatchDark : theme.swatch;
}

/**
 * Experience & theme picker. Drop it anywhere (settings screen, dev toolbar).
 * Writes `data-experience`, `data-theme`, and `.dark` on <html>.
 */
export function ThemeSwitcher({ className = "" }: { className?: string }) {
  const { experience, setExperience, theme, setTheme, mode, toggleMode } = useTheme();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Experience Selection */}
      <div>
        <div className="mb-2.5 flex items-center justify-between">
          <span className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Experience
          </span>
          <span className="text-[11px] text-muted-foreground font-medium">
            Visual & structural style
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {experiences.map((exp: ExperienceDefinition) => {
            const active = exp.id === experience;
            return (
              <button
                key={exp.id}
                type="button"
                onClick={() => setExperience(exp.id)}
                aria-pressed={active}
                className={`press rounded-xl border p-3 text-left transition-all ${
                  active
                    ? "border-primary bg-primary/10 ring-2 ring-primary/30 text-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-border-strong hover:text-foreground"
                }`}
              >
                <span className="flex items-center justify-between text-sm font-semibold text-foreground">
                  <span>{exp.name}</span>
                  {active && <span className="text-xs text-primary font-bold">✓</span>}
                </span>
                <span className="mt-0.5 block text-xs opacity-80 leading-relaxed">
                  {exp.tagline}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Color Palette Theme Selection */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Palette Theme
          </span>
          <button
            type="button"
            onClick={toggleMode}
            className="press rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
          >
            {mode === "dark" ? "Night" : "Day"}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {themes.map((t: ThemeDefinition) => {
            const s = swatchFor(t, mode);
            const active = t.id === theme;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTheme(t.id)}
                aria-pressed={active}
                className={`press rounded-lg border p-2.5 text-left transition-colors ${
                  active
                    ? "border-ring ring-2 ring-ring/40"
                    : "border-border hover:border-border-strong"
                }`}
                style={{ background: s.bg, color: s.fg }}
              >
                <span className="flex items-center gap-1.5">
                  <span
                    className="size-3 rounded-full"
                    style={{ background: s.primary, outline: `1px solid ${s.border}` }}
                  />
                  <span className="size-3 rounded-full" style={{ background: s.accent }} />
                  <span className="size-3 rounded-full" style={{ background: s.border }} />
                </span>
                <span className="mt-1.5 block text-[13px] font-semibold">{t.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

