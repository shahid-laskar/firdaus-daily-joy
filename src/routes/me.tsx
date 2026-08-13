import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/veedu/shell";
import { SubTabs } from "@/components/veedu/primitives";
import { Cycle, Habits, Health, Journal, SelfCare } from "@/components/me/modules";

export const Route = createFileRoute("/me")({
  head: () => ({
    meta: [
      { title: "Me — your private corner of Veedu" },
      {
        name: "description",
        content:
          "Check in with yourself, keep habits, write a private journal and track health — quietly, on your own device.",
      },
      { property: "og:title", content: "Me — your private corner of Veedu" },
      {
        property: "og:description",
        content: "Mood check-ins, habits, journaling, health and cycle tracking, kept private.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MePage,
});

const TABS = [
  { id: "care", label: "Self care" },
  { id: "habits", label: "Habits" },
  { id: "journal", label: "Journal" },
  { id: "health", label: "Health" },
  { id: "cycle", label: "Cycle" },
];

function MePage() {
  const [tab, setTab] = useState("care");
  return (
    <Shell space="me">
      <div className="mb-8">
        <SubTabs tabs={TABS} value={tab} onChange={setTab} />
      </div>
      {tab === "care" && <SelfCare />}
      {tab === "habits" && <Habits />}
      {tab === "journal" && <Journal />}
      {tab === "health" && <Health />}
      {tab === "cycle" && <Cycle />}
    </Shell>
  );
}
