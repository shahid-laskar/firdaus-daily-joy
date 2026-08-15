import { useEffect, useMemo, useRef, useState } from "react";
import { Action, EmptyState, Field, Meter, Section, Tick } from "@/components/veedu/primitives";
import { todayKey, uid, useNow, useStore } from "@/lib/store";
import { VERSES, verseOfDay } from "@/lib/verses";
import { getWeekRange } from "@/lib/intelligence";
import { calculateSalahAnalytics } from "@/lib/salah-intelligence";

import { Coordinates, CalculationMethod, PrayerTimes, Madhab } from "adhan";

export function usePrayers(date = new Date()) {
  const [profile] = useStore("profile", {
    name: "",
    city: "Kozhikode",
    gender: "",
    lat: 11.2588,
    lng: 75.7804,
    madhab: "shafi",
    method: "MuslimWorldLeague",
  });

  return useMemo(() => {
    const pLat = profile.lat ?? 11.2588;
    const pLng = profile.lng ?? 75.7804;
    const pMethod = profile.method ?? "MuslimWorldLeague";
    const pMadhab = profile.madhab ?? "shafi";

    const coordinates = new Coordinates(pLat, pLng);
    let params = (CalculationMethod as any)[pMethod]
      ? (CalculationMethod as any)[pMethod]()
      : CalculationMethod.MuslimWorldLeague();
    params.madhab = pMadhab === "hanafi" ? Madhab.Hanafi : Madhab.Shafi;

    const prayerTimes = new PrayerTimes(coordinates, date, params);

    const formatTime = (d: Date) => {
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
    };

    return [
      { id: "fajr", name: "Fajr", time: formatTime(prayerTimes.fajr) },
      { id: "dhuhr", name: "Dhuhr", time: formatTime(prayerTimes.dhuhr) },
      { id: "asr", name: "Asr", time: formatTime(prayerTimes.asr) },
      { id: "maghrib", name: "Maghrib", time: formatTime(prayerTimes.maghrib) },
      { id: "isha", name: "Isha", time: formatTime(prayerTimes.isha) },
    ];
  }, [profile, date.toISOString().slice(0, 10)]);
}

type SalahLog = Record<string, Record<string, "ontime" | "late">>;

export function useSalah() {
  return useStore<SalahLog>("salah", {});
}

function minutes(t: string) {
  const [h = 0, m = 0] = t.split(":").map(Number);
  return h * 60 + m;
}

export function useNextPrayer() {
  const now = useNow(15000);
  const prayers = usePrayers(now || new Date());
  return useMemo(() => {
    if (!now) return null;
    const cur = now.getHours() * 60 + now.getMinutes();
    const next = prayers.find((p) => minutes(p.time) > cur) ?? prayers[0]!;
    let diff = minutes(next.time) - cur;
    if (diff < 0) diff += 24 * 60;
    return { next, hours: Math.floor(diff / 60), mins: diff % 60 };
  }, [now, prayers]);
}

export function DeenHero() {
  const [log] = useSalah();
  const [profile] = useStore("profile", { name: "", city: "Kozhikode" });
  const countdown = useNextPrayer();
  const today = log[todayKey()] ?? {};
  const count = Object.keys(today).length;
  const isFriday = new Date().getDay() === 5;

  return (
    <header className="rise mb-10">
      <p className="eyebrow">{profile.city}</p>
      <h1 className="display-xl mt-3">
        {countdown ? (
          <>
            {countdown.next.name} in{" "}
            <span className="numeric text-space">
              {countdown.hours > 0 ? `${countdown.hours}h ` : ""}
              {countdown.mins}m
            </span>
          </>
        ) : (
          "Peace be upon you"
        )}
      </h1>
      <p className="text-muted-foreground mt-3 text-sm">
        {count} of 5 logged today · {countdown?.next.time ?? "—"}
      </p>
      {isFriday && (
        <p className="border-space/50 text-ink-soft mt-5 border-l-2 pl-4 text-sm italic">
          It's Friday — a good time for Surah Al-Kahf.
        </p>
      )}
    </header>
  );
}

export function DailyVerse() {
  const today = verseOfDay();
  const [offset, setOffset] = useState(0);
  const index = (VERSES.indexOf(today) + offset + VERSES.length * 2) % VERSES.length;
  const verse = VERSES[index]!;
  const [copied, setCopied] = useState(false);
  return (
    <section className="rise border-border/70 border-y py-8">
      <p className="eyebrow mb-5">{offset === 0 ? "Verse of the day" : "Another verse"}</p>
      <p className="arabic text-[1.9rem] leading-[2.4]">{verse.ar}</p>
      <p className="text-ink-soft mt-5 text-[1.02rem] leading-relaxed">{verse.en}</p>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-ink-faint text-xs tracking-wide">{verse.ref}</span>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setOffset(offset + 1)}
            className="text-ink-faint hover:text-foreground text-xs"
          >
            Another
          </button>
          {offset !== 0 && (
            <button
              onClick={() => setOffset(0)}
              className="text-ink-faint hover:text-foreground text-xs"
            >
              Today's
            </button>
          )}
          <button
            onClick={() => {
              navigator.clipboard?.writeText(`${verse.ar}\n\n${verse.en}\n— ${verse.ref}`);
              setCopied(true);
              setTimeout(() => setCopied(false), 1600);
            }}
            className="text-ink-faint hover:text-foreground text-xs"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
    </section>
  );
}

export function Salah() {
  const [log, setLog] = useSalah();
  const today = log[todayKey()] ?? {};
  const prayers = usePrayers();
  const week = useMemo(() => getWeekRange(new Date()), []);
  const analytics = useMemo(() => calculateSalahAnalytics(log, week), [log, week]);

  function mark(id: string, state: "ontime" | "late") {
    const day = { ...(log[todayKey()] ?? {}) };
    if (day[id] === state) delete day[id];
    else day[id] = state;
    setLog({ ...log, [todayKey()]: day });
  }

  return (
    <div className="space-y-10">
      <Section eyebrow="Today" title="Salah">
        <ul className="thread">
          {prayers.map((p) => {
            const state = today[p.id];
            return (
              <li
                key={p.id}
                data-done={!!state}
                className="thread-node flex items-center gap-3 py-3"
              >
                <Tick done={!!state} label={p.name} onToggle={() => mark(p.id, "ontime")} />
                <div className="flex-1">
                  <p className={`title-md ${state ? "text-ink-faint" : ""}`}>{p.name}</p>
                  <p className="text-ink-faint numeric text-xs">{p.time}</p>
                </div>
                <button
                  onClick={() => mark(p.id, "late")}
                  className={`press rounded-full px-2.5 py-1 text-[0.7rem] ${
                    state === "late" ? "bg-space-soft text-foreground" : "text-ink-faint"
                  }`}
                >
                  Late
                </button>
              </li>
            );
          })}
        </ul>
      </Section>

      <Section
        eyebrow="Last seven days"
        title="Consistency"
        aside={
          analytics.totalLogged > 0 ? (
            <span className="text-ink-faint numeric text-xs">
              {analytics.totalLogged}/35 logged · {Math.round(analytics.onTimePercentage)}% on time
            </span>
          ) : undefined
        }
      >
        <div className="grid grid-cols-7 gap-2">
          {week.map((d) => {
            const day = log[d] ?? {};
            return (
              <div key={d} className="text-center">
                <div className="flex flex-col gap-1">
                  {prayers.map((p) => {
                    const s = day[p.id];
                    return (
                      <span
                        key={p.id}
                        title={`${p.name} — ${s ?? "missed"}`}
                        className="h-2.5 rounded-[3px]"
                        style={{
                          background:
                            s === "ontime"
                              ? "var(--space-accent)"
                              : s === "late"
                                ? "var(--space-accent-soft)"
                                : "var(--muted)",
                        }}
                      />
                    );
                  })}
                </div>
                <p className="text-ink-faint mt-2 text-[0.62rem]">{d.slice(8)}</p>
              </div>
            );
          })}
        </div>
      </Section>
    </div>
  );
}

const PHRASES = ["SubhanAllah", "Alhamdulillah", "Allahu Akbar", "Astaghfirullah"];
const TARGETS = [33, 100, 1000];

export function Tasbih() {
  const [phrase, setPhrase] = useState(PHRASES[0]);
  const [target, setTarget] = useState(33);
  const [count, setCount] = useState(0);
  const [haptic, setHaptic] = useState(true);
  const done = count >= target;
  const r = 74;
  const circ = 2 * Math.PI * r;

  function tap() {
    setCount((c) => Math.min(target, c + 1));
    if (haptic && typeof navigator !== "undefined") navigator.vibrate?.(8);
  }

  return (
    <Section eyebrow="Dhikr" title="Tasbih">
      <div className="flex flex-wrap gap-1.5">
        {PHRASES.map((p) => (
          <button
            key={p}
            onClick={() => {
              setPhrase(p);
              setCount(0);
            }}
            className={`press rounded-full px-3 py-1 text-[0.78rem] ${
              p === phrase ? "bg-space-soft text-foreground" : "text-muted-foreground"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      <button
        onClick={tap}
        aria-label={`Count ${phrase}. ${count} of ${target}`}
        className="press mx-auto mt-8 block"
      >
        <svg viewBox="0 0 180 180" className="size-56 sm:size-64">
          <circle cx="90" cy="90" r={r} fill="none" stroke="var(--muted)" strokeWidth="6" />
          <circle
            cx="90"
            cy="90"
            r={r}
            fill="none"
            stroke="var(--space-accent)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ - (Math.min(count, target) / target) * circ}
            transform="rotate(-90 90 90)"
            style={{ transition: "stroke-dashoffset 260ms cubic-bezier(.2,.8,.2,1)" }}
          />
          {[...Array(target <= 100 ? target : 20)].map((_, i, arr) => {
            const a = (i / arr.length) * Math.PI * 2 - Math.PI / 2;
            return (
              <circle
                key={i}
                cx={90 + Math.cos(a) * (r - 16)}
                cy={90 + Math.sin(a) * (r - 16)}
                r="1.6"
                fill={i < (count / target) * arr.length ? "var(--space-accent)" : "var(--rule)"}
              />
            );
          })}
          <text
            x="90"
            y="92"
            textAnchor="middle"
            className="numeric"
            style={{ fontFamily: "var(--font-display)", fontSize: 40, fill: "var(--foreground)" }}
          >
            {count}
          </text>
          <text
            x="90"
            y="112"
            textAnchor="middle"
            style={{ fontSize: 9, letterSpacing: 2, fill: "var(--ink-faint)" }}
          >
            OF {target}
          </text>
        </svg>
      </button>

      <p className="text-ink-soft mt-2 text-center text-sm">
        {done ? "Complete — may it be accepted." : `Tap the ring for ${phrase}`}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        {TARGETS.map((t) => (
          <button
            key={t}
            onClick={() => {
              setTarget(t);
              setCount(0);
            }}
            className={`press numeric rounded-full px-3 py-1 text-[0.78rem] ${
              t === target ? "bg-space-soft text-foreground" : "text-muted-foreground"
            }`}
          >
            {t}
          </button>
        ))}
        <Action onClick={() => setCount(0)}>Reset</Action>
        <Action onClick={() => setHaptic(!haptic)}>
          {haptic ? "Feedback on" : "Feedback off"}
        </Action>
      </div>
    </Section>
  );
}

const SURAHS = [
  {
    n: 1,
    name: "Al-Fatihah",
    meaning: "The Opening",
    ayahs: [
      {
        n: 1,
        ar: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
        en: "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
      },
      {
        n: 2,
        ar: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
        en: "All praise is due to Allah, Lord of the worlds.",
      },
      {
        n: 3,
        ar: "الرَّحْمَٰنِ الرَّحِيمِ",
        en: "The Entirely Merciful, the Especially Merciful.",
      },
      { n: 4, ar: "مَالِكِ يَوْمِ الدِّينِ", en: "Sovereign of the Day of Recompense." },
      {
        n: 5,
        ar: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
        en: "It is You we worship and You we ask for help.",
      },
      { n: 6, ar: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ", en: "Guide us to the straight path." },
      {
        n: 7,
        ar: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
        en: "The path of those upon whom You have bestowed favour, not of those who have earned Your anger, nor of those who go astray.",
      },
    ],
  },
  {
    n: 112,
    name: "Al-Ikhlas",
    meaning: "Sincerity",
    ayahs: [
      { n: 1, ar: "قُلْ هُوَ اللَّهُ أَحَدٌ", en: "Say, He is Allah, One." },
      { n: 2, ar: "اللَّهُ الصَّمَدُ", en: "Allah, the Eternal Refuge." },
      { n: 3, ar: "لَمْ يَلِدْ وَلَمْ يُولَدْ", en: "He neither begets nor is born." },
      { n: 4, ar: "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ", en: "Nor is there to Him any equivalent." },
    ],
  },
  {
    n: 113,
    name: "Al-Falaq",
    meaning: "The Daybreak",
    ayahs: [
      {
        n: 1,
        ar: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ",
        en: "Say, I seek refuge in the Lord of daybreak.",
      },
      { n: 2, ar: "مِن شَرِّ مَا خَلَقَ", en: "From the evil of that which He created." },
      {
        n: 3,
        ar: "وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ",
        en: "And from the evil of darkness when it settles.",
      },
      {
        n: 4,
        ar: "وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ",
        en: "And from the evil of the blowers in knots.",
      },
      {
        n: 5,
        ar: "وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ",
        en: "And from the evil of an envier when he envies.",
      },
    ],
  },
];

export function Quran() {
  const [openSurah, setOpenSurah] = useState<number | null>(null);
  const [bookmarks, setBookmarks] = useStore<string[]>("quran-bookmarks", []);
  const [translation, setTranslation] = useStore("quran-translation", true);
  const [sessions, setSessions] = useStore<
    { id: string; surah: string; range: string; mins: string; date: string }[]
  >("quran-log", []);
  const [form, setForm] = useState({ surah: "", range: "", mins: "" });
  const surah = SURAHS.find((s) => s.n === openSurah);

  if (surah) {
    return (
      <div className="rise">
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => setOpenSurah(null)}
            className="text-ink-soft hover:text-foreground text-sm"
          >
            ← Surahs
          </button>
          <button
            onClick={() => setTranslation(!translation)}
            className="text-ink-faint hover:text-foreground text-xs"
          >
            {translation ? "Arabic only" : "Show translation"}
          </button>
        </div>

        <div className="mb-10 text-center">
          <p className="eyebrow">Surah {surah.n}</p>
          <h1 className="display-lg mt-2">{surah.name}</h1>
          <p className="text-ink-faint text-sm">{surah.meaning}</p>
        </div>

        <div dir="rtl" className="space-y-8">
          {surah.ayahs.map((a) => {
            const key = `${surah.n}:${a.n}`;
            const marked = bookmarks.includes(key);
            return (
              <article key={a.n} className="group">
                <p className="arabic text-[1.75rem] sm:text-[2rem]">
                  {a.ar}
                  <span className="text-ink-faint mr-2 inline-grid size-7 place-items-center rounded-full border border-[var(--rule)] align-middle text-[0.7rem]">
                    {a.n}
                  </span>
                </p>
                {translation && (
                  <p dir="ltr" className="text-ink-soft mt-3 text-[0.95rem] leading-relaxed">
                    {a.en}
                  </p>
                )}
                <div
                  dir="ltr"
                  className="mt-3 flex gap-3 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100"
                >
                  <button
                    onClick={() =>
                      setBookmarks(
                        marked ? bookmarks.filter((b) => b !== key) : [...bookmarks, key],
                      )
                    }
                    className="text-ink-faint hover:text-foreground text-xs"
                  >
                    {marked ? "Bookmarked" : "Bookmark"}
                  </button>
                  <button
                    onClick={() => navigator.clipboard?.writeText(`${a.ar}\n${a.en}`)}
                    className="text-ink-faint hover:text-foreground text-xs"
                  >
                    Copy
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <Section eyebrow="Read" title="Quran">
        <div className="divide-border/70 divide-y">
          {SURAHS.map((s) => (
            <button
              key={s.n}
              onClick={() => setOpenSurah(s.n)}
              className="group flex w-full items-center gap-4 py-4 text-left"
            >
              <span className="text-ink-faint numeric w-6 text-sm">{s.n}</span>
              <span className="flex-1">
                <span className="title-md block">{s.name}</span>
                <span className="text-ink-faint text-xs">{s.meaning}</span>
              </span>
              <span className="arabic text-ink-soft text-lg">{s.ayahs.length} آيات</span>
            </button>
          ))}
        </div>
        {bookmarks.length > 0 && (
          <p className="text-ink-faint mt-4 text-xs">{bookmarks.length} bookmarked ayah(s)</p>
        )}
      </Section>

      <Section eyebrow="Reading log" title="Sessions">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.surah.trim()) return;
            setSessions([{ id: uid(), ...form, date: todayKey() }, ...sessions]);
            setForm({ surah: "", range: "", mins: "" });
          }}
          className="mb-5 grid gap-2 sm:grid-cols-[1fr_1fr_90px_auto] sm:items-end"
        >
          <Field
            label="Surah"
            value={form.surah}
            onChange={(e) => setForm({ ...form, surah: e.target.value })}
          />
          <Field
            label="Ayah range"
            value={form.range}
            onChange={(e) => setForm({ ...form, range: e.target.value })}
          />
          <Field
            label="Minutes"
            value={form.mins}
            onChange={(e) => setForm({ ...form, mins: e.target.value })}
          />
          <Action type="submit" variant="solid" className="h-[42px]">
            Log
          </Action>
        </form>
        {sessions.length === 0 ? (
          <EmptyState
            glyph="☾"
            headline="No sessions logged"
            body="Log what you read today — even a few ayahs are worth keeping track of."
          />
        ) : (
          <ul className="thread">
            {sessions.map((s) => (
              <li key={s.id} className="thread-node py-3">
                <p className="text-[0.95rem]">
                  {s.surah} <span className="text-ink-faint">{s.range}</span>
                </p>
                <p className="text-ink-faint numeric text-xs">
                  {s.date} · {s.mins || "—"} min
                </p>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

const DUAS = [
  {
    ar: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً",
    en: "Our Lord, give us good in this world and good in the Hereafter.",
    when: "Anytime",
  },
  {
    ar: "اللَّهُمَّ بِاسْمِكَ أَمُوتُ وَأَحْيَا",
    en: "O Allah, in Your name I die and I live.",
    when: "Before sleep",
  },
  {
    ar: "بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ",
    en: "In the name of Allah, I place my trust in Allah.",
    when: "Leaving home",
  },
  {
    ar: "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا",
    en: "O Allah, I ask You for beneficial knowledge.",
    when: "Studying",
  },
];

export function Duas() {
  return (
    <Section eyebrow="Adhkar" title="Duas">
      <div className="space-y-8">
        {DUAS.map((d) => (
          <article key={d.en} className="border-border/70 border-b pb-8 last:border-0">
            <p className="eyebrow mb-3">{d.when}</p>
            <p className="arabic text-[1.55rem]">{d.ar}</p>
            <p className="text-ink-soft mt-3 text-[0.95rem] leading-relaxed">{d.en}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}

export function Hifz() {
  const [items, setItems] = useStore<{ id: string; surah: string; pct: number }[]>("hifz", []);
  const [surah, setSurah] = useState("");
  return (
    <Section eyebrow="Memorisation" title="Hifz">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!surah.trim()) return;
          setItems([...items, { id: uid(), surah: surah.trim(), pct: 0 }]);
          setSurah("");
        }}
        className="mb-6 grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end"
      >
        <Field label="Surah in progress" value={surah} onChange={(e) => setSurah(e.target.value)} />
        <Action type="submit" variant="solid" className="h-[42px]">
          Track
        </Action>
      </form>
      {items.length === 0 ? (
        <EmptyState
          glyph="◈"
          headline="Nothing in progress"
          body="Add a surah you're memorising and move it forward a little each day."
        />
      ) : (
        <div className="space-y-6">
          {items.map((i) => (
            <div key={i.id}>
              <div className="mb-2 flex items-baseline justify-between">
                <p className="title-md">{i.surah}</p>
                <span className="numeric text-ink-soft text-sm">{i.pct}%</span>
              </div>
              <Meter value={i.pct} />
              <div className="mt-2 flex gap-2">
                <Action
                  onClick={() =>
                    setItems(
                      items.map((x) =>
                        x.id === i.id ? { ...x, pct: Math.max(0, x.pct - 10) } : x,
                      ),
                    )
                  }
                >
                  −10%
                </Action>
                <Action
                  onClick={() =>
                    setItems(
                      items.map((x) =>
                        x.id === i.id ? { ...x, pct: Math.min(100, x.pct + 10) } : x,
                      ),
                    )
                  }
                >
                  +10%
                </Action>
              </div>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

export function Fasting() {
  const [fasts, setFasts] = useStore<Record<string, "obligatory" | "voluntary">>("fasting", {});
  const days = [...Array(28)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (27 - i));
    return d.toISOString().slice(0, 10);
  });
  return (
    <Section eyebrow="Last four weeks" title="Fasting">
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((d) => {
          const s = fasts[d];
          return (
            <button
              key={d}
              onClick={() => {
                const next = { ...fasts };
                if (s === "voluntary") next[d] = "obligatory";
                else if (s === "obligatory") delete next[d];
                else next[d] = "voluntary";
                setFasts(next);
              }}
              aria-label={`${d} ${s ?? "not fasted"}`}
              className="press numeric grid aspect-square place-items-center rounded-lg border text-[0.68rem]"
              style={{
                background:
                  s === "obligatory"
                    ? "var(--space-accent)"
                    : s === "voluntary"
                      ? "var(--space-accent-soft)"
                      : "transparent",
                color: s === "obligatory" ? "var(--background)" : "var(--ink-faint)",
                borderColor: s ? "transparent" : "var(--rule)",
              }}
            >
              {d.slice(8)}
            </button>
          );
        })}
      </div>
      <p className="text-ink-faint mt-4 text-xs">Tap once for voluntary, twice for obligatory.</p>
    </Section>
  );
}

export function Qibla() {
  const [heading, setHeading] = useState<number | null>(null);
  const qibla = 293;
  const ref = useRef(false);

  useEffect(() => {
    function onOrient(e: DeviceOrientationEvent) {
      if (e.alpha != null) setHeading(e.alpha);
    }
    window.addEventListener("deviceorientation", onOrient);
    return () => window.removeEventListener("deviceorientation", onOrient);
  }, []);

  async function request() {
    const anyDO = DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<string>;
    };
    if (anyDO.requestPermission) await anyDO.requestPermission();
    ref.current = true;
  }

  const rotation = heading == null ? qibla : qibla - heading;

  return (
    <Section eyebrow="Direction" title="Qibla">
      <div className="mx-auto mt-4 w-fit">
        <svg viewBox="0 0 200 200" className="size-64">
          <circle cx="100" cy="100" r="92" fill="none" stroke="var(--rule)" />
          <circle cx="100" cy="100" r="70" fill="none" stroke="var(--rule)" strokeDasharray="2 6" />
          {["N", "E", "S", "W"].map((d, i) => {
            const a = (i * 90 - 90) * (Math.PI / 180);
            return (
              <text
                key={d}
                x={100 + Math.cos(a) * 82}
                y={100 + Math.sin(a) * 82 + 4}
                textAnchor="middle"
                style={{ fontSize: 10, letterSpacing: 1, fill: "var(--ink-faint)" }}
              >
                {d}
              </text>
            );
          })}
          <g
            style={{
              transform: `rotate(${rotation}deg)`,
              transformOrigin: "100px 100px",
              transition: "transform 400ms cubic-bezier(.2,.8,.2,1)",
            }}
          >
            <line
              x1="100"
              y1="100"
              x2="100"
              y2="26"
              stroke="var(--space-accent)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="100" cy="24" r="6" fill="var(--space-accent)" />
          </g>
          <circle cx="100" cy="100" r="3" fill="var(--ink)" />
        </svg>
      </div>
      <p className="text-muted-foreground mt-4 text-center text-sm">
        {heading == null
          ? "Holding steady at the compass bearing for Mecca."
          : `Facing ${Math.round(heading)}° — turn until the marker points up.`}
      </p>
      {heading == null && (
        <div className="mt-4 flex justify-center">
          <Action onClick={request}>Use device compass</Action>
        </div>
      )}
    </Section>
  );
}
