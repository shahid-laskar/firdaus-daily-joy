import { useMemo } from "react";
import { Area, AreaChart, Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { EmptyState, Section } from "@/components/veedu/primitives";
import { useStore } from "@/lib/store";

type Metrics = Record<string, { water: number; weight: string; sleep: string }>;

const iso = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};

/** PROTOTYPE — the logging that already happens, finally given back as a picture. */
export function Trends() {
  const [metrics] = useStore<Metrics>("health", {});
  const [habits] = useStore<{ id: string; name: string; days: string[] }[]>("habits", []);

  const data = useMemo(
    () =>
      [...Array(14)].map((_, i) => {
        const day = iso(-(13 - i));
        const m = metrics[day];
        return {
          day: day.slice(8),
          water: m?.water ?? 0,
          sleep: Number(m?.sleep ?? 0),
          weight: Number(m?.weight ?? 0) || null,
          habits: habits.filter((h) => h.days.includes(day)).length,
        };
      }),
    [metrics, habits],
  );

  const logged = data.filter((d) => d.water || d.sleep || d.weight).length;
  const avgWater = (data.reduce((s, d) => s + d.water, 0) / 14).toFixed(1);
  const avgSleep = (data.reduce((s, d) => s + d.sleep, 0) / Math.max(1, data.filter((d) => d.sleep).length)).toFixed(1);

  if (logged === 0) {
    return (
      <Section eyebrow="Two weeks" title="Trends">
        <EmptyState glyph="◇" headline="Nothing to draw yet" body="Log water, sleep or weight for a few days and the shape of the fortnight appears here." />
      </Section>
    );
  }

  const axis = { stroke: "var(--ink-faint)", fontSize: 10 } as const;
  const tooltip = {
    contentStyle: {
      background: "var(--card)",
      border: "1px solid var(--rule)",
      borderRadius: 12,
      fontSize: 12,
    },
  };

  return (
    <div className="space-y-10">
      <Section eyebrow="Last 14 days" title="Water">
        <p className="text-muted-foreground mb-4 text-sm">Averaging {avgWater} glasses a day.</p>
        <div className="h-[150px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="day" tickLine={false} axisLine={false} {...axis} />
              <YAxis width={22} tickLine={false} axisLine={false} {...axis} />
              <Tooltip {...tooltip} />
              <Bar dataKey="water" radius={[4, 4, 0, 0]} fill="var(--space-accent)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Section>

      <Section eyebrow="Last 14 days" title="Sleep">
        <p className="text-muted-foreground mb-4 text-sm">Averaging {avgSleep} hours a night.</p>
        <div className="h-[150px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <XAxis dataKey="day" tickLine={false} axisLine={false} {...axis} />
              <YAxis width={22} domain={[0, 10]} tickLine={false} axisLine={false} {...axis} />
              <Tooltip {...tooltip} />
              <Area
                dataKey="sleep"
                type="monotone"
                stroke="var(--space-accent)"
                fill="var(--space-accent-soft)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Section>

      <Section eyebrow="Last 14 days" title="Weight">
        <div className="h-[150px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="day" tickLine={false} axisLine={false} {...axis} />
              <YAxis width={34} domain={["auto", "auto"]} tickLine={false} axisLine={false} {...axis} />
              <Tooltip {...tooltip} />
              <Line dataKey="weight" type="monotone" dot={false} connectNulls stroke="var(--brass)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Section>

      {habits.length > 0 && (
        <Section eyebrow="Last 14 days" title="Habits kept">
          <div className="h-[130px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis dataKey="day" tickLine={false} axisLine={false} {...axis} />
                <YAxis width={22} allowDecimals={false} tickLine={false} axisLine={false} {...axis} />
                <Tooltip {...tooltip} />
                <Bar dataKey="habits" radius={[4, 4, 0, 0]} fill="var(--leaf)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-ink-faint mt-3 text-xs">Out of {habits.length} tracked habits.</p>
        </Section>
      )}
    </div>
  );
}
