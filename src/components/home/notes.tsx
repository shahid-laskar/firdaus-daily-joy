import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, BookOpen, PenLine, Pin, Plus, Search, Trash2 } from "lucide-react";
import { Action, EmptyState, Section } from "@/components/veedu/primitives";
import { readStore, todayKey, uid, useStore, writeStore } from "@/lib/store";
import { useExperience } from "@/lib/theme-provider";

export type Note = { id: string; title: string; body: string; updated: string; pinned?: boolean };

/** PROTOTYPE — Notes becomes many notes instead of one shared textarea. */
export function Notes() {
  const { experience } = useExperience();
  const [notes, setNotes] = useStore<Note[]>("notesList", []);
  const [openId, setOpenId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  // Carry the old single note across, once.
  useEffect(() => {
    const legacy = readStore<string>("notes", "");
    if (legacy.trim() && readStore<Note[]>("notesList", []).length === 0) {
      writeStore<Note[]>("notesList", [
        { id: uid(), title: "Family scratchpad", body: legacy, updated: todayKey(), pinned: true },
      ]);
      writeStore("notes", "");
    }
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...notes]
      .filter((n) => !q || `${n.title} ${n.body}`.toLowerCase().includes(q))
      .sort(
        (a, b) => Number(!!b.pinned) - Number(!!a.pinned) || b.updated.localeCompare(a.updated),
      );
  }, [notes, query]);

  const open = notes.find((n) => n.id === openId) ?? null;

  function patch(id: string, next: Partial<Note>) {
    setNotes(notes.map((n) => (n.id === id ? { ...n, ...next, updated: todayKey() } : n)));
  }

  function create() {
    const note: Note = { id: uid(), title: "", body: "", updated: todayKey() };
    setNotes([note, ...notes]);
    setOpenId(note.id);
  }

  if (experience === "vibrant") {
    if (open) {
      return (
        <div className="space-y-6" data-tone="task">
          {/* ── Note Editor Header ── */}
          <div className="tile tile-vivid bloom-in p-4 sm:p-5 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setOpenId(null)}
              className="btn-quiet press inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold"
            >
              <ArrowLeft className="size-3.5" />
              All Notes
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => patch(open.id, { pinned: !open.pinned })}
                className={`press inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                  open.pinned
                    ? "bg-[var(--tone,var(--space-accent))] text-[oklch(0.995_0.008_70)]"
                    : "bg-card/70 border border-border/70 text-ink-soft hover:text-foreground"
                }`}
              >
                <Pin className={`size-3.5 ${open.pinned ? "rotate-45" : ""}`} />
                <span>{open.pinned ? "Pinned" : "Pin"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setNotes(notes.filter((n) => n.id !== open.id));
                  setOpenId(null);
                }}
                className="icon-btn press size-8 text-ink-faint hover:text-destructive"
                title="Delete note"
                aria-label="Delete note"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>

          {/* ── Editor Canvas ── */}
          <div className="tile bloom-in border border-border/70 p-5 sm:p-6 space-y-4">
            <input
              value={open.title}
              onChange={(e) => patch(open.id, { title: e.target.value })}
              placeholder="Note Title…"
              className="w-full bg-transparent text-xl sm:text-2xl font-bold placeholder:text-ink-faint/40 outline-none text-foreground"
            />
            <textarea
              value={open.body}
              onChange={(e) => patch(open.id, { body: e.target.value })}
              rows={14}
              placeholder="Write thoughts, family reminders, recipes, ideas or codes…"
              className="w-full resize-none rounded-xl border border-border/40 bg-card/40 p-4 text-[0.95rem] leading-relaxed outline-none focus:border-[var(--tone,var(--space-accent))]/50 transition-colors"
            />
            <div className="flex items-center justify-between text-xs text-ink-faint pt-1 border-t border-border/40">
              <span>Auto-saved · Edited {open.updated}</span>
              <span className="numeric">{open.body.length} characters</span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-8" data-tone="task">
        {/* ── Notes Header Banner ── */}
        <section aria-label="Notes header" className="space-y-4">
          <div className="tile tile-vivid bloom-in p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-[color-mix(in_oklab,var(--tone,var(--space-accent))_15%,transparent)] grid place-items-center flex-none">
                <BookOpen className="size-6 text-[var(--tone,var(--space-accent))]" />
              </div>
              <div>
                <p className="eyebrow" style={{ color: "var(--tone)" }}>
                  Family Notebook & Scratchpad
                </p>
                <h2 className="title-md text-[1.1rem] mt-0.5">
                  {notes.length === 0
                    ? "Keep thoughts and memories"
                    : `${notes.length} note${notes.length === 1 ? "" : "s"} in your household book`}
                </h2>
                <p className="text-ink-soft text-xs mt-0.5">
                  Keep codes, lists, instructions, and shared thoughts organized in one place.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={create}
              className="btn-solid press inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold self-end sm:self-center"
            >
              <Plus className="size-4" />
              New Note
            </button>
          </div>

          {/* Search bar */}
          {notes.length > 2 && (
            <div className="relative">
              <Search className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search notes by title or content…"
                className="control w-full pl-10 pr-4 py-2 text-sm h-[40px]"
              />
            </div>
          )}
        </section>

        {/* ── Notes Grid / List ── */}
        {visible.length === 0 ? (
          <div className="empty-field bloom-in">
            <span className="text-3xl leading-none">📝</span>
            <p className="title-md mt-3">No notes yet</p>
            <p className="text-ink-soft mt-1 max-w-sm mx-auto text-xs leading-relaxed">
              Keep codes, lists, quotes, and half-thoughts in neat family notes instead of one long page.
            </p>
            <div className="mt-5">
              <button
                type="button"
                onClick={create}
                className="btn-solid press inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold"
              >
                <PenLine className="size-4" />
                Write the first one
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {visible.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => setOpenId(n.id)}
                className="tile bloom-in border border-border/70 p-4 sm:p-5 text-left hover:border-[var(--tone,var(--space-accent))]/50 transition-all cursor-pointer space-y-2 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="title-md text-[1rem] truncate flex items-center gap-1.5">
                    {n.pinned && (
                      <Pin className="size-3.5 text-[var(--tone,var(--space-accent))] rotate-45 shrink-0" />
                    )}
                    <span>{n.title || "Untitled Note"}</span>
                  </h3>
                  <span className="numeric text-ink-faint text-xs shrink-0">{n.updated}</span>
                </div>
                <p className="text-ink-soft text-xs line-clamp-2 leading-relaxed">
                  {n.body.replace(/\n/g, " ") || "Empty note"}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (open) {
    return (
      <Section
        eyebrow={`Edited ${open.updated}`}
        title="Note"
        aside={
          <div className="flex items-center gap-2">
            <button
              onClick={() => patch(open.id, { pinned: !open.pinned })}
              className={`text-xs ${open.pinned ? "text-space" : "text-ink-faint hover:text-foreground"}`}
            >
              {open.pinned ? "Pinned" : "Pin"}
            </button>
            <Action onClick={() => setOpenId(null)}>Back</Action>
          </div>
        }
      >
        <input
          value={open.title}
          onChange={(e) => patch(open.id, { title: e.target.value })}
          placeholder="Title"
          className="display-lg w-full bg-transparent outline-none"
        />
        <textarea
          value={open.body}
          onChange={(e) => patch(open.id, { body: e.target.value })}
          rows={14}
          placeholder="Write it down before it's gone."
          className="focus:border-space/60 mt-4 w-full resize-none rounded-2xl border border-transparent bg-[linear-gradient(transparent_calc(2rem_-_1px),var(--rule)_calc(2rem_-_1px))] bg-[size:100%_2rem] p-4 text-[0.95rem] leading-8 outline-none"
        />
        <div className="mt-3 flex items-center justify-between">
          <span className="text-ink-faint text-xs">Saved as you type</span>
          <button
            onClick={() => {
              setNotes(notes.filter((n) => n.id !== open.id));
              setOpenId(null);
            }}
            className="text-ink-faint hover:text-destructive text-xs"
          >
            Delete note
          </button>
        </div>
      </Section>
    );
  }

  return (
    <Section
      eyebrow="Shared"
      title="Notes"
      aside={
        <Action variant="solid" onClick={create}>
          New note
        </Action>
      }
    >
      {notes.length > 2 && (
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search notes"
          className="border-border/70 focus:border-space mb-5 w-full rounded-xl border bg-transparent px-3.5 py-2 text-sm outline-none"
        />
      )}
      {visible.length === 0 ? (
        <EmptyState
          glyph="◇"
          headline="No notes yet"
          body="Keep codes, lists and half-thoughts in separate notes instead of one long page."
          action={
            <Action variant="solid" onClick={create}>
              Write the first one
            </Action>
          }
        />
      ) : (
        <ul className="divide-border/70 divide-y">
          {visible.map((n) => (
            <li key={n.id}>
              <button onClick={() => setOpenId(n.id)} className="w-full py-3.5 text-left">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="title-md truncate">
                    {n.pinned && <span className="text-space mr-1.5">•</span>}
                    {n.title || "Untitled"}
                  </p>
                  <span className="text-ink-faint numeric shrink-0 text-xs">{n.updated}</span>
                </div>
                <p className="text-muted-foreground mt-0.5 line-clamp-1 text-sm">
                  {n.body.replace(/\n/g, " ") || "Empty"}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
