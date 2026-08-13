import { i as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { s as SubTabs } from "./store-BUFgMFPj.mjs";
import { t as Shell } from "./shell-2TQT_Cpb.mjs";
import { a as Hifz, c as Salah, i as Fasting, l as Tasbih, n as DeenHero, o as Qibla, r as Duas, s as Quran, t as DailyVerse } from "./modules-ajys8qie.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/deen-DyyO3-1D.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var TABS = [
	{
		id: "today",
		label: "Today"
	},
	{
		id: "quran",
		label: "Quran"
	},
	{
		id: "dhikr",
		label: "Dhikr"
	},
	{
		id: "duas",
		label: "Duas"
	},
	{
		id: "hifz",
		label: "Hifz"
	},
	{
		id: "fasting",
		label: "Fasting"
	},
	{
		id: "qibla",
		label: "Qibla"
	}
];
function DeenPage() {
	const [tab, setTab] = (0, import_react.useState)("today");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, {
		space: "deen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-8",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SubTabs, {
					tabs: TABS,
					value: tab,
					onChange: setTab
				})
			}),
			tab === "today" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-12",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeenHero, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Salah, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DailyVerse, {})
				]
			}),
			tab === "quran" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Quran, {}),
			tab === "dhikr" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tasbih, {}),
			tab === "duas" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Duas, {}),
			tab === "hifz" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hifz, {}),
			tab === "fasting" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fasting, {}),
			tab === "qibla" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Qibla, {})
		]
	});
}
//#endregion
export { DeenPage as component };
