import { useMemo, useState } from "react";
import { Action, EmptyState, Field, Meter, Section, Tick } from "@/components/veedu/primitives";
import { RecurrenceField, RepeatChip } from "@/components/veedu/recurrence-field";
import { type Recurrence, isRepeating, nextOccurrence, occursOn } from "@/lib/recurrence";
import { todayKey, uid, useStore } from "@/lib/store";

export type Task = {
  id: string;
  title: string;
  list: string;
  time?: string;
  done: boolean;
  date: string;
  recur?: Recurrence;
  completions?: string[];
};
const LISTS = ["General", "Shopping", "Work", "Home"];

/** A repeating task is "done" only for the day you're looking at. */
export function isTaskDone(t: Task, iso = todayKey()) {
  return isRepeating(t.recur) ? (t.completions ?? []).includes(iso) : t.done;
}

export function Tasks() {
  const [tasks, setTasks] = useStore<Task[]>("tasks", []);
  const [list, setList] = useState("General");
  const [filter, setFilter] = useState<"all" | "today" | "done">("all");
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [recur, setRecur] = useState<Recurrence>({ freq: "none", start: todayKey() });
  const today = todayKey();

  const visible = tasks.filter((t) => {
    if (t.list !== list) return false;
    const done = isTaskDone(t, today);
    if (filter === "done") return done;
    if (filter === "today") return !done && (isRepeating(t.recur) ? occursOn(t.recur, today) : t.date <= today);
    return true;
  });

  function toggle(t: Task) {
    setTasks(
      tasks.map((x) => {
        if (x.id !== t.id) return x;
        if (!isRepeating(x.recur)) return { ...x, done: !x.done };
        const days = x.completions ?? [];
        return {
          ...x,
          completions: days.includes(today) ? days.filter((d) => d !== today) : [...days, today],
        };
      }),
    );
  }

  return (
    <Section eyebrow="Household" title="Tasks">
      <div className="mb-4 flex flex-wrap items-center gap-1.5">
        {LISTS.map((l) => (
          <button
            key={l}
            onClick={() => setList(l)}
            className={`press rounded-full px-3 py-1 text-[0.78rem] ${
              l === list ? "bg-space-soft text-foreground" : "text-muted-foreground"
            }`}
          >
            {l}
          </button>
        ))}
        <span className="bg-rule mx-1 h-4 w-px" />
        {(["all", "today", "done"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`press rounded-full px-2.5 py-1 text-[0.72rem] capitalize ${
              f === filter ? "text-foreground underline decoration-[var(--space-accent)] decoration-2 underline-offset-4" : "text-ink-faint"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim()) return;
          setTasks([
            {
              id: uid(),
              title: title.trim(),
              list,
              time,
              done: false,
              date: today,
              recur: { ...recur },
              completions: [],
            },
            ...tasks,
          ]);
          setTitle("");
          setTime("");
          setRecur({ freq: "none", start: today });
        }}
        className="mb-6 space-y-3"
      >
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Field
              label="Add to this list"
              value={title}
              placeholder="Something to take care of…"
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <input
            type="time"
            aria-label="Due time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="border-border/80 numeric h-[42px] rounded-xl border bg-transparent px-2.5 text-sm"
          />
          <Action type="submit" variant="solid" className="h-[42px]">
            Add
          </Action>
        </div>
        <RecurrenceField value={recur} onChange={setRecur} compact />
      </form>

      {visible.length === 0 ? (
        <EmptyState
          glyph="⌂"
          headline="Nothing waiting here"
          body={`Your ${list.toLowerCase()} list is clear. Add the next thing when it comes to mind.`}
        />
      ) : (
        <ul className="thread space-y-1">
          {visible.map((t) => {
            const done = isTaskDone(t, today);
            const next = isRepeating(t.recur) ? nextOccurrence(t.recur, today) : null;
            return (
              <li key={t.id} data-done={done} className="thread-node group flex items-start gap-3 py-2.5">
                <Tick done={done} label={t.title} onToggle={() => toggle(t)} />
                <div className="min-w-0 flex-1">
                  <p className={`text-[0.95rem] ${done ? "text-ink-faint line-through" : ""}`}>{t.title}</p>
                  <p className="text-ink-faint numeric text-xs">
                    {[t.time, next && next !== today ? `next ${next}` : null].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <RepeatChip recur={t.recur} />
                  <button
                    onClick={() => setTasks(tasks.filter((x) => x.id !== t.id))}
                    aria-label={`Remove ${t.title}`}
                    className="text-ink-faint hover:text-destructive text-xs opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100"
                  >
                    Remove
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Section>
  );
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SLOTS = ["Breakfast", "Lunch", "Dinner"];
type Plan = Record<string, string>;

export function Meals() {
  const [plan, setPlan] = useStore<Plan>("meals", {});
  const [lastPlan, setLastPlan] = useStore<Plan>("lastMeals", {});
  const [recipes, setRecipes] = useStore<{ id: string; name: string; items: string }[]>("recipes", []);
  const [name, setName] = useState("");
  const [items, setItems] = useState("");

  return (
    <div className="space-y-10">
      <Section 
        eyebrow="This week" 
        title="Meal plan"
        aside={
          <div className="flex items-center gap-3">
            {Object.keys(lastPlan).length > 0 && Object.keys(plan).length === 0 && (
              <button onClick={() => setPlan(lastPlan)} className="text-xs text-space hover:text-space-dark transition">Copy last week</button>
            )}
            {Object.keys(plan).length > 0 && (
              <button onClick={() => { if(confirm("Clear the entire week?")) { setLastPlan(plan); setPlan({}); } }} className="text-xs text-ink-faint hover:text-destructive transition">Clear week</button>
            )}
          </div>
        }
      >
        <datalist id="saved-recipes">
          {recipes.map(r => <option key={r.id} value={r.name} />)}
        </datalist>
        <div className="overflow-x-auto no-scrollbar -mx-5 px-5">
          <table className="w-full min-w-[560px] border-separate border-spacing-y-1">
            <thead>
              <tr>
                <th className="eyebrow w-20 text-left"> </th>
                {SLOTS.map((s) => (
                  <th key={s} className="eyebrow text-left">
                    {s}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map((d) => {
                const isToday = d === ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date().getDay()];
                return (
                  <tr key={d} className={isToday ? "bg-space-soft/30 rounded-lg" : ""}>
                    <td className={`font-display pr-3 text-sm rounded-l-lg py-1 pl-2 ${isToday ? "text-foreground font-semibold" : "text-ink-soft"}`}>{d}</td>
                    {SLOTS.map((s, i) => (
                      <td key={s} className={`pr-2 ${i === SLOTS.length - 1 ? 'rounded-r-lg' : ''}`}>
                        <input
                          aria-label={`${d} ${s}`}
                          list="saved-recipes"
                          value={plan[`${d}-${s}`] ?? ""}
                          placeholder="—"
                          onChange={(e) => setPlan({ ...plan, [`${d}-${s}`]: e.target.value })}
                          className={`w-full border-b bg-transparent py-1.5 text-sm outline-none transition-colors ${
                            isToday ? "border-border/80 focus:border-space" : "border-border/50 focus:border-space"
                          }`}
                        />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>

      <Section eyebrow="Repository" title="Recipes">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            setRecipes([{ id: uid(), name: name.trim(), items }, ...recipes]);
            setName("");
            setItems("");
          }}
          className="mb-5 grid gap-2 sm:grid-cols-[1fr_1.4fr_auto] sm:items-end"
        >
          <Field label="Dish" value={name} onChange={(e) => setName(e.target.value)} />
          <Field
            label="Ingredients (comma separated)"
            value={items}
            onChange={(e) => setItems(e.target.value)}
          />
          <Action type="submit" variant="solid" className="h-[42px]">
            Save
          </Action>
        </form>
        {recipes.length === 0 ? (
          <EmptyState
            glyph="✧"
            headline="No recipes yet"
            body="Save the meals your family actually eats — grocery lists build themselves from here."
          />
        ) : (
          <ul className="divide-border/70 divide-y">
            {recipes.map((r) => (
              <li key={r.id} className="flex items-baseline justify-between gap-4 py-3">
                <div>
                  <p className="title-md">{r.name}</p>
                  <p className="text-muted-foreground text-xs">{r.items || "No ingredients noted"}</p>
                </div>
                <button
                  onClick={() => setRecipes(recipes.filter((x) => x.id !== r.id))}
                  className="text-ink-faint hover:text-destructive text-xs"
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

type Grocery = { id: string; name: string; got: boolean };

export function GroceryList() {
  const [items, setItems] = useStore<Grocery[]>("grocery", []);
  const [plan] = useStore<Plan>("meals", {});
  const [recipes] = useStore<{ id: string; name: string; items: string }[]>("recipes", []);
  const [draft, setDraft] = useState("");

  const remaining = items.filter((i) => !i.got).length;

  function generate() {
    const planned = new Set(Object.values(plan).map((v) => v.trim().toLowerCase()).filter(Boolean));
    const derived: string[] = [];
    recipes.forEach((r) => {
      if (planned.has(r.name.trim().toLowerCase())) {
        r.items.split(",").forEach((i) => i.trim() && derived.push(i.trim()));
      }
    });
    const existing = new Set(items.map((i) => i.name.toLowerCase()));
    const fresh = [...new Set(derived)]
      .filter((d) => !existing.has(d.toLowerCase()))
      .map((name) => ({ id: uid(), name, got: false }));
    setItems([...fresh, ...items]);
  }

  return (
    <Section
      eyebrow="Shopping"
      title="Grocery"
      aside={<Action onClick={generate}>From meal plan</Action>}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!draft.trim()) return;
          setItems([{ id: uid(), name: draft.trim(), got: false }, ...items]);
          setDraft("");
        }}
        className="mb-5"
      >
        <Field
          label="Add item"
          value={draft}
          placeholder="Rice, onions, olive oil…"
          onChange={(e) => setDraft(e.target.value)}
        />
      </form>
      {items.length === 0 ? (
        <EmptyState
          glyph="◦"
          headline="The basket is empty"
          body="Add what's missing, or let Firdous read this week's meal plan and fill it for you."
          action={<Action variant="solid" onClick={generate}>Build from meal plan</Action>}
        />
      ) : (
        <>
          <p className="text-muted-foreground mb-3 text-xs">
            {remaining} of {items.length} still to pick up
          </p>
          <ul className="space-y-0.5">
            {items.map((i) => (
              <li key={i.id} className="group flex items-center gap-3 py-2">
                <Tick
                  done={i.got}
                  label={i.name}
                  onToggle={() => setItems(items.map((x) => (x.id === i.id ? { ...x, got: !x.got } : x)))}
                />
                <span className={`flex-1 text-[0.95rem] ${i.got ? "text-ink-faint line-through" : ""}`}>
                  {i.name}
                </span>
                <button
                  onClick={() => setItems(items.filter((x) => x.id !== i.id))}
                  className="text-ink-faint hover:text-destructive text-xs opacity-0 group-hover:opacity-100"
                  aria-label={`Remove ${i.name}`}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </Section>
  );
}

type Kid = { id: string; name: string; age: string; chores: { id: string; title: string; done: boolean; recur?: Recurrence; completions?: string[] }[] };

export function isChoreDone(c: Kid["chores"][0], iso = todayKey()) {
  return isRepeating(c.recur) ? (c.completions ?? []).includes(iso) : c.done;
}

export function Kids() {
  const [kids, setKids] = useStore<Kid[]>("kids", []);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");

  return (
    <Section eyebrow="Family" title="Kids">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          setKids([...kids, { id: uid(), name: name.trim(), age, chores: [] }]);
          setName("");
          setAge("");
        }}
        className="mb-6 grid gap-2 sm:grid-cols-[1fr_100px_auto] sm:items-end"
      >
        <Field label="Child" value={name} onChange={(e) => setName(e.target.value)} />
        <Field label="Age" value={age} onChange={(e) => setAge(e.target.value)} />
        <Action type="submit" variant="solid" className="h-[42px]">
          Add
        </Action>
      </form>

      {kids.length === 0 ? (
        <EmptyState
          glyph="❋"
          headline="No little ones added"
          body="Add a child to track activities, chores and the small wins worth noticing."
        />
      ) : (
        <div className="space-y-8">
          {kids.map((k) => (
            <div key={k.id}>
              <div className="mb-3 flex items-baseline justify-between">
                <h3 className="title-md">
                  {k.name}
                  {k.age && <span className="text-ink-faint text-sm font-normal"> · {k.age}</span>}
                </h3>
                <button
                  onClick={() => setKids(kids.filter((x) => x.id !== k.id))}
                  className="text-ink-faint hover:text-destructive text-xs"
                >
                  Remove
                </button>
              </div>
              <ChoreList
                kid={k}
                onChange={(chores) => setKids(kids.map((x) => (x.id === k.id ? { ...x, chores } : x)))}
              />
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

function ChoreList({ kid, onChange }: { kid: Kid; onChange: (c: Kid["chores"]) => void }) {
  const [draft, setDraft] = useState("");
  const today = todayKey();
  return (
    <div className="thread">
      {kid.chores.map((c) => {
        const done = isChoreDone(c, today);
        return (
          <div key={c.id} data-done={done} className="thread-node flex items-center gap-3 py-2 group">
            <Tick
              done={done}
              label={c.title}
              onToggle={() =>
                onChange(
                  kid.chores.map((x) => {
                    if (x.id !== c.id) return x;
                    if (!isRepeating(x.recur)) return { ...x, done: !x.done };
                    const days = x.completions ?? [];
                    return {
                      ...x,
                      completions: days.includes(today) ? days.filter((d) => d !== today) : [...days, today],
                    };
                  })
                )
              }
            />
            <span className={`flex-1 text-[0.95rem] ${done ? "text-ink-faint line-through" : ""}`}>{c.title}</span>
            <button
              onClick={() => onChange(kid.chores.filter((x) => x.id !== c.id))}
              className="text-ink-faint hover:text-destructive text-xs opacity-0 transition group-hover:opacity-100"
            >
              Remove
            </button>
          </div>
        );
      })}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!draft.trim()) return;
          onChange([...kid.chores, { id: uid(), title: draft.trim(), done: false, recur: { freq: "daily", start: todayKey() }, completions: [] }]);
          setDraft("");
        }}
        className="thread-node py-2"
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add an activity or chore"
          className="text-ink-faint placeholder:text-ink-faint focus:text-foreground w-full bg-transparent text-sm outline-none"
        />
      </form>
    </div>
  );
}

export function Deeds() {
  const [deeds, setDeeds] = useStore<{ id: string; who: string; what: string; date: string }[]>("deeds", []);
  const [who, setWho] = useState("");
  const [what, setWhat] = useState("");

  return (
    <Section eyebrow="Noticed" title="Good deeds">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!what.trim()) return;
          setDeeds([{ id: uid(), who: who.trim() || "Family", what: what.trim(), date: todayKey() }, ...deeds]);
          setWhat("");
        }}
        className="mb-6 grid gap-2 sm:grid-cols-[120px_1fr_auto] sm:items-end"
      >
        <Field label="Who" value={who} onChange={(e) => setWho(e.target.value)} />
        <Field label="What they did" value={what} onChange={(e) => setWhat(e.target.value)} />
        <Action type="submit" variant="solid" className="h-[42px]">
          Record
        </Action>
      </form>
      {deeds.length === 0 ? (
        <EmptyState
          glyph="✧"
          headline="Nothing recorded yet"
          body="Small kindnesses are easy to forget. Write one down and it stays."
        />
      ) : (
        <ul className="thread">
          {deeds.map((d) => (
            <li key={d.id} data-active="true" className="thread-node py-3">
              <p className="text-[0.95rem]">{d.what}</p>
              <p className="text-ink-faint numeric text-xs">
                {d.who} · {d.date}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

/* Calendar and Notes now live in ./calendar.tsx and ./notes.tsx — richer versions of both. */

export function TodayGlance() {
  const [tasks] = useStore<Task[]>("tasks", []);
  const [grocery] = useStore<Grocery[]>("grocery", []);
  const done = tasks.filter((t) => t.done).length;
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <Eyebrowed label="Tasks completed" value={`${done}/${tasks.length || 0}`} />
        <Meter value={tasks.length ? (done / tasks.length) * 100 : 0} />
      </div>
      <div>
        <Eyebrowed label="Grocery picked up" value={`${grocery.filter((g) => g.got).length}/${grocery.length || 0}`} />
        <Meter value={grocery.length ? (grocery.filter((g) => g.got).length / grocery.length) * 100 : 0} />
      </div>
    </div>
  );
}

function Eyebrowed({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-2 flex items-baseline justify-between">
      <span className="eyebrow">{label}</span>
      <span className="numeric font-display text-lg">{value}</span>
    </div>
  );
}
