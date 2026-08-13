import { i as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { h as useStore, r as Field, t as Action } from "./store-BUFgMFPj.mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/onboarding-DZmdw30U.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function OnboardingPage() {
	const navigate = useNavigate();
	const [profile, setProfile] = useStore("profile", {
		name: "",
		city: "Kozhikode",
		gender: ""
	});
	const [localProfile, setLocalProfile] = (0, import_react.useState)(profile);
	const handleSubmit = (e) => {
		e.preventDefault();
		if (!localProfile.name || !localProfile.city || !localProfile.gender) return;
		setProfile(localProfile);
		navigate({ to: "/" });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-space": "home",
		className: "relative z-[1] flex min-h-dvh flex-col justify-center px-6 py-16",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto w-full max-w-sm",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-10 flex items-center gap-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: "/logo.jpg",
						alt: "Firdous Logo",
						className: "size-10 object-cover rounded-xl shadow-sm"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "display-lg",
					children: "Welcome to Firdous"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted-foreground mt-2 text-sm leading-relaxed",
					children: "Let's personalize your experience. Your location helps us tailor your experience, and gender helps us activate specific features like female-only cycle tracking."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: handleSubmit,
					className: "mt-8 space-y-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Your Name",
							value: localProfile.name,
							onChange: (e) => setLocalProfile({
								...localProfile,
								name: e.target.value
							}),
							placeholder: "How should Firdous greet you?"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Location (City/Country)",
							value: localProfile.city,
							onChange: (e) => setLocalProfile({
								...localProfile,
								city: e.target.value
							}),
							placeholder: "e.g. Kozhikode, India"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "text-foreground/80 block text-[0.8rem] font-semibold tracking-wide",
								children: "Gender"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setLocalProfile({
										...localProfile,
										gender: "female"
									}),
									className: "press flex items-center justify-center rounded-lg border py-2.5 text-sm",
									style: {
										background: localProfile.gender === "female" ? "var(--space-accent-soft)" : "transparent",
										borderColor: localProfile.gender === "female" ? "var(--space-accent)" : "var(--rule)"
									},
									children: "Female"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setLocalProfile({
										...localProfile,
										gender: "male"
									}),
									className: "press flex items-center justify-center rounded-lg border py-2.5 text-sm",
									style: {
										background: localProfile.gender === "male" ? "var(--space-accent-soft)" : "transparent",
										borderColor: localProfile.gender === "male" ? "var(--space-accent)" : "var(--rule)"
									},
									children: "Male"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Action, {
							type: "submit",
							variant: "solid",
							className: "w-full mt-4",
							children: "Continue"
						})
					]
				})
			]
		})
	});
}
//#endregion
export { OnboardingPage as component };
