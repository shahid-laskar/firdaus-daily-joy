import { useMemo, useState } from "react";
import { Action, EmptyState, Field, Meter, Section } from "@/components/veedu/primitives";
import { todayKey, useNow, useStore } from "@/lib/store";
import { usePrayers } from "./modules";
import {
  calculateSuhurIftar,
  useRamadanCharity,
  useRamadanKhatm,
  useRamadanMode,
  useTaraweeh,
} from "@/lib/ramadan";

export function RamadanModeView() {
  const { isActive, ramadanDay, override, setOverride } = useRamadanMode();
  const prayers = usePrayers();
  const now = useNow(30_000);
  const today = todayKey();

  const fajrTime = prayers.find((p) => p.id === "fajr")?.time ?? "05:00";
  const maghribTime = prayers.find((p) => p.id === "maghrib")?.time ?? "18:30";

  const suhurIftar = useMemo(
    () => calculateSuhurIftar(fajrTime, maghribTime, now ?? new Date()),
    [fajrTime, maghribTime, now]
  );

  const [fasts, setFasts] = useStore<Record<string, "obligatory" | "voluntary">>("fasting", {});
  const isFastingToday = Boolean(fasts[today]);

  const { taraweehLog, logTaraweeh } = useTaraweeh();
  const taraweehToday = taraweehLog[today];

  const { khatm, toggleJuz, progressPercentage, completedCount } = useRamadanKhatm();
  const { charityLog, addCharity, removeCharity } = useRamadanCharity();

  const [charityTitle, setCharityTitle] = useState("");
  const [charityAmount, setCharityAmount] = useState("");
  const [charityCategory, setCharityCategory] = useState<
    "sadaqah" | "zakat_fitr" | "food" | "good_deed"
  >("sadaqah");

  return (
    <div className="space-y-10 rise">
      {/* 1. Suhur & Iftar Hero */}
      <section className="rounded-2xl border border-border/80 bg-space-soft/30 p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="eyebrow flex items-center gap-1.5">
              <span>🌙</span>
              <span>{ramadanDay ? `Ramadan Day ${ramadanDay}` : "Ramadan Mubarak"}</span>
            </span>
            <h2 className="display-lg mt-1">{suhurIftar.countdownText}</h2>
          </div>
          <button
            onClick={() => setOverride(!override)}
            className="press text-[0.72rem] text-muted-foreground hover:text-foreground px-2.5 py-1 rounded-full border border-border bg-background"
          >
            {override ? "Preview active" : "Enable preview"}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="rounded-xl border border-border/70 bg-card p-4">
            <p className="eyebrow text-ink-faint">Suhur / Fajr Cutoff</p>
            <p className="numeric text-2xl sm:text-3xl font-display font-semibold mt-1">
              {suhurIftar.suhurTime}
            </p>
            <p className="text-ink-faint text-xs mt-0.5">Stop eating before azan</p>
          </div>
          <div className="rounded-xl border border-border/70 bg-card p-4">
            <p className="eyebrow text-ink-faint">Iftar / Maghrib</p>
            <p className="numeric text-2xl sm:text-3xl font-display font-semibold mt-1">
              {suhurIftar.iftarTime}
            </p>
            <p className="text-ink-faint text-xs mt-0.5">Break fast at sunset</p>
          </div>
        </div>

        {/* Duas */}
        <div className="pt-2 border-t border-border/60 space-y-4">
          <div>
            <p className="text-xs font-semibold text-foreground">Iftar Dua</p>
            <p className="arabic text-xl sm:text-2xl mt-1.5 leading-relaxed" dir="rtl">
              {suhurIftar.iftarDua.ar}
            </p>
            <p className="text-xs text-muted-foreground italic mt-1">
              {suhurIftar.iftarDua.transliteration}
            </p>
            <p className="text-xs text-ink-soft mt-0.5">{suhurIftar.iftarDua.en}</p>
          </div>
        </div>
      </section>

      {/* 2. Fasting & Taraweeh Daily Log */}
      <Section eyebrow="Daily worship" title="Fast & Qiyam">
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Fasting Card */}
          <div className="rounded-xl border border-border p-4 space-y-3 bg-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="title-md">Today's Fast</p>
                <p className="text-xs text-muted-foreground">{today}</p>
              </div>
              <button
                onClick={() => {
                  const next = { ...fasts };
                  if (isFastingToday) delete next[today];
                  else next[today] = "obligatory";
                  setFasts(next);
                }}
                className={`press px-3 py-1.5 rounded-full text-xs font-medium border ${
                  isFastingToday
                    ? "bg-space text-background border-transparent"
                    : "bg-background text-muted-foreground border-border hover:text-foreground"
                }`}
              >
                {isFastingToday ? "✓ Fasted" : "Mark fasted"}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              {isFastingToday
                ? "Fasting logged for today. May Allah accept your worship."
                : "Tap to record your fast for today."}
            </p>
          </div>

          {/* Taraweeh Card */}
          <div className="rounded-xl border border-border p-4 space-y-3 bg-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="title-md">Taraweeh / Qiyam</p>
                <p className="text-xs text-muted-foreground">
                  {taraweehToday ? `${taraweehToday.rakahs} Rak'ahs (${taraweehToday.location})` : "Not logged yet"}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[8, 20].map((rakahs) => (
                <button
                  key={rakahs}
                  onClick={() => logTaraweeh(today, rakahs, "masjid")}
                  className={`press px-2.5 py-1 rounded-lg text-xs font-medium border ${
                    taraweehToday?.rakahs === rakahs
                      ? "bg-space text-background border-transparent"
                      : "bg-background text-muted-foreground border-border hover:text-foreground"
                  }`}
                >
                  {rakahs} Rak'ahs (Masjid)
                </button>
              ))}
              <button
                onClick={() => logTaraweeh(today, 8, "home")}
                className={`press px-2.5 py-1 rounded-lg text-xs font-medium border ${
                  taraweehToday?.location === "home"
                    ? "bg-space text-background border-transparent"
                    : "bg-background text-muted-foreground border-border hover:text-foreground"
                }`}
              >
                Home
              </button>
            </div>
          </div>
        </div>
      </Section>

      {/* 3. Ramadan Quran Khatm Planner */}
      <Section eyebrow="Khatm journey" title="Quran Completion">
        <div className="space-y-4">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="title-md">{completedCount} of 30 Juz Completed</p>
              <p className="text-xs text-muted-foreground">
                {ramadanDay
                  ? completedCount >= ramadanDay
                    ? `On track (Day ${ramadanDay} · ${completedCount} completed)`
                    : `${ramadanDay - completedCount} Juz behind target for Day ${ramadanDay}`
                  : "Track all 30 Juz during Ramadan"}
              </p>
            </div>
            <span className="numeric text-sm font-semibold text-space">{progressPercentage}%</span>
          </div>

          <Meter value={progressPercentage} />

          <div className="grid grid-cols-6 sm:grid-cols-10 gap-1.5 pt-2">
            {[...Array(30)].map((_, idx) => {
              const juzNum = idx + 1;
              const isDone = khatm.completedJuz.includes(juzNum);
              return (
                <button
                  key={juzNum}
                  onClick={() => toggleJuz(juzNum)}
                  className={`press aspect-square rounded-lg border text-xs font-medium flex flex-col items-center justify-center transition-colors ${
                    isDone
                      ? "bg-space text-background border-transparent font-semibold"
                      : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-space-soft/50"
                  }`}
                  title={`Juz ${juzNum} ${isDone ? "(Completed)" : "(Tap to complete)"}`}
                >
                  <span className="text-[0.6rem] opacity-70">J</span>
                  <span>{juzNum}</span>
                </button>
              );
            })}
          </div>
        </div>
      </Section>

      {/* 4. Charity & Good Deeds */}
      <Section eyebrow="Deeds & Giving" title="Ramadan Charity">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!charityTitle.trim()) return;
            const amt = charityAmount ? parseFloat(charityAmount) : undefined;
            addCharity(charityTitle, amt, charityCategory);
            setCharityTitle("");
            setCharityAmount("");
          }}
          className="mb-6 grid gap-2 sm:grid-cols-[1fr_100px_130px_auto] sm:items-end border border-border p-4 rounded-xl"
        >
          <Field
            label="Good deed / Charity"
            value={charityTitle}
            placeholder="e.g. Iftar sponsorship, Sadaqah…"
            onChange={(e) => setCharityTitle(e.target.value)}
          />
          <Field
            label="Amount (₹)"
            type="number"
            value={charityAmount}
            placeholder="0"
            onChange={(e) => setCharityAmount(e.target.value)}
          />
          <div className="space-y-1.5">
            <label className="text-foreground/80 block text-[0.8rem] font-semibold tracking-wide">
              Category
            </label>
            <select
              value={charityCategory}
              onChange={(e) => setCharityCategory(e.target.value as any)}
              className="w-full rounded-lg border border-border bg-background px-2.5 py-2 text-xs"
            >
              <option value="sadaqah">Sadaqah</option>
              <option value="zakat_fitr">Zakat al-Fitr</option>
              <option value="food">Feeding Fasting</option>
              <option value="good_deed">Good Deed</option>
            </select>
          </div>
          <Action type="submit" variant="solid" className="h-[38px]">
            Record
          </Action>
        </form>

        {charityLog.length === 0 ? (
          <EmptyState
            glyph="❋"
            headline="No charity entries yet"
            body="Record small acts of daily generosity, feeding the fasting, and Zakat al-Fitr."
          />
        ) : (
          <ul className="thread">
            {charityLog.map((c) => (
              <li key={c.id} className="thread-node group flex items-baseline justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="text-[0.95rem] font-medium text-foreground">{c.title}</p>
                  <p className="text-ink-faint text-xs mt-0.5">
                    {c.date} · <span className="capitalize">{c.category.replace("_", " ")}</span>
                    {c.amount !== undefined && ` · ₹${c.amount}`}
                  </p>
                </div>
                <button
                  onClick={() => removeCharity(c.id)}
                  className="text-ink-faint hover:text-destructive text-xs opacity-0 group-hover:opacity-100"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}
