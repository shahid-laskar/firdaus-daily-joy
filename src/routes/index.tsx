import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/veedu/shell";
import { SubTabs, Section, Meter } from "@/components/veedu/primitives";
import {
  Deeds,
  FamilyCalendar,
  GroceryList,
  Kids,
  Meals,
  Notes,
  Tasks,
} from "@/components/home/modules";
import { useNextPrayer, useSalah } from "@/components/deen/modules";
import { todayKey, useNow, useStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Firdous — a handcrafted home for everyday life" },
      {
        name: "description",
        content:
          "Firdous brings family life, prayer, money and personal wellbeing into one calm, beautifully made daily companion.",
      },
      { property: "og:title", content: "Firdous — a handcrafted home for everyday life" },
      {
        property: "og:description",
        content:
          "Family, Deen, budget and wellbeing in one quiet daily companion. Offline-first, private by default.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

const TABS = [
  { id: "today", label: "Today" },
  { id: "tasks", label: "Tasks" },
  { id: "meals", label: "Meals" },
  { id: "grocery", label: "Grocery" },
  { id: "kids", label: "Kids" },
  { id: "deeds", label: "Deeds" },
  { id: "calendar", label: "Calendar" },
  { id: "notes", label: "Notes" },
];

function greeting(h: number) {
  if (h < 5) return "Still awake";
  if (h < 12) return "Good morning";
  if (h < 16) return "Good afternoon";
  if (h < 20) return "Good evening";
  return "Winding down";
}

function Today() {
  const now = useNow(60_000);
  const [profile] = useStore("profile", { name: "", city: "Kozhikode" });
  const [tasks] = useStore<{ id: string; title: string; done: boolean; time?: string; date: string }[]>("tasks", []);
  const [grocery] = useStore<{ id: string; got: boolean }[]>("grocery", []);
  const [events] = useStore<{ id: string; title: string; date: string }[]>("events", []);
  const [meals] = useStore<Record<string, string>>("meals", {});
  const [salah] = useSalah();
  const countdown = useNextPrayer();

  const hour = now?.getHours() ?? 8;
  const open = tasks.filter((t) => !t.done);
  const doneCount = tasks.length - open.length;
  const todayEvents = events.filter((e) => e.date === todayKey());
  const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][now?.getDay() ?? 1];
  const dinner = meals[`${dayName}-Dinner`];
  const prayed = Object.keys(salah[todayKey()] ?? {}).length;
  const leftToBuy = grocery.filter((g) => !g.got).length;

  return (
    <div className="space-y-12">
      <header className="rise">
        <p className="eyebrow">
          {now?.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" }) ?? " "}
        </p>
        <h1 className="display-xl mt-3">
          {greeting(hour)}
          {profile.name ? `, ${profile.name}` : ""}.
        </h1>
        <p className="text-muted-foreground mt-4 max-w-md text-[0.98rem] leading-relaxed">
          {open.length === 0 && todayEvents.length === 0
            ? "Nothing is asking for you right now. That is allowed."
            : `${open.length} thing${open.length === 1 ? "" : "s"} waiting${
                todayEvents.length ? ` · ${todayEvents.length} on the calendar` : ""
              }.`}
        </p>
      </header>

      {/* The thread — Firdous's signature: today read as one line, not a grid of cards */}
      <section className="thread rise space-y-1">
        <ThreadItem
          active
          label="Next prayer"
          value={countdown ? `${countdown.next.name} · ${countdown.next.time}` : "—"}
          detail={countdown ? `in ${countdown.hours ? `${countdown.hours}h ` : ""}${countdown.mins}m · ${prayed}/5 logged` : undefined}
          to="/deen"
        />
        {open.slice(0, 3).map((t) => (
          <ThreadItem key={t.id} label="Waiting" value={t.title} detail={t.time} />
        ))}
        {todayEvents.map((e) => (
          <ThreadItem key={e.id} label="Today" value={e.title} to="/" />
        ))}
        {dinner && <ThreadItem label="Dinner" value={dinner} detail="From this week's plan" />}
        {leftToBuy > 0 && (
          <ThreadItem label="Grocery" value={`${leftToBuy} still to pick up`} />
        )}
        {doneCount > 0 && (
          <ThreadItem done label="Behind you" value={`${doneCount} finished today`} />
        )}
      </section>

      <Section eyebrow="How today looks" title="Progress">
        <div className="grid gap-6 sm:grid-cols-3">
          <Stat label="Tasks" value={`${doneCount}/${tasks.length}`} pct={tasks.length ? (doneCount / tasks.length) * 100 : 0} />
          <Stat label="Salah" value={`${prayed}/5`} pct={(prayed / 5) * 100} />
          <Stat
            label="Grocery"
            value={`${grocery.length - leftToBuy}/${grocery.length}`}
            pct={grocery.length ? ((grocery.length - leftToBuy) / grocery.length) * 100 : 0}
          />
        </div>
      </Section>
    </div>
  );
}

function Stat({ label, value, pct }: { label: string; value: string; pct: number }) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="eyebrow">{label}</span>
        <span className="numeric font-display text-lg">{value}</span>
      </div>
      <Meter value={pct} />
    </div>
  );
}

function ThreadItem({
  label,
  value,
  detail,
  active,
  done,
  to,
}: {
  label: string;
  value: string;
  detail?: string | undefined;
  active?: boolean | undefined;
  done?: boolean | undefined;
  to?: string | undefined;
}) {
  const body = (
    <div className="py-3">
      <p className="eyebrow">{label}</p>
      <p className={`mt-0.5 text-[1.02rem] ${done ? "text-ink-faint" : ""}`}>{value}</p>
      {detail && <p className="text-ink-faint numeric mt-0.5 text-xs">{detail}</p>}
    </div>
  );
  return (
    <div className="thread-node" data-active={active ? "true" : undefined} data-done={done ? "true" : undefined}>
      {to === "/deen" ? (
        <Link to="/deen" className="block">
          {body}
        </Link>
      ) : (
        body
      )}
    </div>
  );
}

function HomePage() {
  const [tab, setTab] = useState("today");
  return (
    <Shell space="home">
      <div className="mb-8">
        <SubTabs tabs={TABS} value={tab} onChange={setTab} />
      </div>
      {tab === "today" && <Today />}
      {tab === "tasks" && <Tasks />}
      {tab === "meals" && <Meals />}
      {tab === "grocery" && <GroceryList />}
      {tab === "kids" && <Kids />}
      {tab === "deeds" && <Deeds />}
      {tab === "calendar" && <FamilyCalendar />}
      {tab === "notes" && <Notes />}
    </Shell>
  );
}
