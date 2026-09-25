import { r as __toESM } from "../_runtime.mjs";
import { E as isRedirect, g as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as createServerFn, i as TSS_SERVER_FUNCTION } from "./createServerFn-CIHAFgYl.mjs";
import { n as defaultValues, r as variableGroups, t as allVariables } from "./variables-BBll6Uin.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { t as getServerFnById } from "../__23tanstack-start-server-fn-resolver-t1Lt1M-l.mjs";
import { a as MapPin, c as FlaskConical, d as ChevronDown, i as Pin, l as Droplets, n as Satellite, o as Leaf, r as RotateCcw, s as Gauge, t as ThermometerSun, u as Crosshair } from "../_libs/lucide-react.mjs";
import { t as Slot } from "../_libs/radix-ui__react-slot.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BXSs2_l_.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function useServerFn(serverFn) {
	const router = useRouter();
	return import_react.useCallback(async (...args) => {
		try {
			const res = await serverFn(...args);
			if (isRedirect(res)) throw res;
			return res;
		} catch (err) {
			if (isRedirect(err)) {
				err.options._fromLocation = router.stores.location.get();
				return router.navigate(router.resolveRedirect(err).options);
			}
			throw err;
		}
	}, [router, serverFn]);
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
			destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
			outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
			secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
			ghost: "hover:bg-accent hover:text-accent-foreground",
			link: "text-primary underline-offset-4 hover:underline"
		},
		size: {
			default: "h-9 px-4 py-2",
			sm: "h-8 rounded-md px-3 text-xs",
			lg: "h-10 rounded-md px-8",
			icon: "h-9 w-9"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
function validate(input) {
	if (typeof input !== "object" || input === null) throw new Error("Prediction inputs are missing.");
	const raw = input;
	const out = {};
	for (const spec of allVariables) {
		const value = raw[spec.key];
		const num = typeof value === "string" ? Number(value) : value;
		if (typeof num !== "number" || !Number.isFinite(num)) throw new Error(`${spec.label} must be a number.`);
		if (num < spec.min || num > spec.max) throw new Error(`${spec.label} must be between ${spec.min} and ${spec.max} ${spec.unit}.`);
		out[spec.key] = num;
	}
	return out;
}
/** Bell-shaped response: 1 at the optimum, falling off with width. */
var predictYield = createServerFn({ method: "POST" }).inputValidator(validate).handler(createSsrRpc("a0c9dbc61f8a4c3dc10b9bf882aadbab4f1f5bf304ad8ba31c7a5c0c5c1bf8a7"));
var toFieldValues = (nums) => Object.fromEntries(Object.entries(nums).map(([k, v]) => [k, String(v)]));
var impactKeys = /* @__PURE__ */ new Set([
	"tavg_mean",
	"prec_sum",
	"ndvi_mean"
]);
var locationMeta = {
	icon: MapPin,
	accent: "text-ochre",
	wash: "bg-ochre/8",
	border: "border-ochre/25"
};
var groupMeta = [
	locationMeta,
	{
		icon: ThermometerSun,
		accent: "text-rust",
		wash: "bg-rust/8",
		border: "border-rust/25"
	},
	{
		icon: Droplets,
		accent: "text-sky",
		wash: "bg-sky/8",
		border: "border-sky/25"
	},
	{
		icon: FlaskConical,
		accent: "text-teal",
		wash: "bg-teal/8",
		border: "border-teal/25"
	},
	{
		icon: Satellite,
		accent: "text-violet",
		wash: "bg-violet/8",
		border: "border-violet/25"
	}
];
function fieldError(spec, raw) {
	if (raw.trim() === "") return "Required";
	const num = Number(raw);
	if (!Number.isFinite(num)) return "Must be a number";
	if (num < spec.min || num > spec.max) return `${spec.min} to ${spec.max}`;
	return null;
}
function FieldControl({ spec, raw, error, featured, onChange }) {
	const sliderValue = Number.isFinite(Number(raw)) ? Math.min(spec.max, Math.max(spec.min, Number(raw))) : spec.default;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: featured ? "rounded-lg border border-ochre/25 bg-ochre/8 p-4" : "border-t border-line/60 py-3 first:border-t-0",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						htmlFor: spec.key,
						className: featured ? "text-[15px] font-semibold text-ink" : "text-[13px] font-medium text-ink",
						children: spec.label
					}), featured ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-0.5 text-xs text-inksoft",
						children: "High-impact model driver"
					}) : null]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: `group flex shrink-0 items-baseline gap-1 border-b px-1 py-0.5 font-mono transition-colors focus-within:border-ochre ${error ? "border-rust text-rust" : "border-line text-ink"}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						id: spec.key,
						type: "number",
						inputMode: "decimal",
						min: spec.min,
						max: spec.max,
						step: spec.step,
						value: raw,
						"aria-invalid": Boolean(error),
						onChange: (event) => onChange(event.target.value),
						className: "w-16 bg-transparent text-right text-[13px] font-medium outline-none"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[10px] text-inksoft",
						children: spec.unit
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				type: "range",
				"aria-label": `${spec.label} slider`,
				min: spec.min,
				max: spec.max,
				step: spec.step,
				value: sliderValue,
				onChange: (event) => onChange(event.target.value),
				className: "mt-3 w-full"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-1.5 flex justify-between text-[10px] text-inksoft",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: error ?? spec.help }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "font-mono",
					children: [
						spec.min,
						"—",
						spec.max
					]
				})]
			})
		]
	});
}
function GaugeChart({ value, confidence }) {
	const safe = Math.min(value ?? 0, 12);
	const angle = -90 + safe / 12 * 180;
	const spread = Math.max(.45, safe * (1 - confidence / 100));
	const low = Math.max(0, safe - spread);
	const high = Math.min(12, safe + spread);
	const arcPoint = (v, r) => {
		const a = Math.PI + v / 12 * Math.PI;
		return [100 + r * Math.cos(a), 100 + r * Math.sin(a)];
	};
	const [lx, ly] = arcPoint(low, 73);
	const [hx, hy] = arcPoint(high, 73);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative mx-auto w-full max-w-[270px]",
		"aria-label": `Yield gauge ${value?.toFixed(2) ?? "not calculated"} tonnes per hectare`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			viewBox: "0 0 200 122",
			className: "w-full overflow-visible",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M25 100 A75 75 0 0 1 62.5 35",
					fill: "none",
					stroke: "var(--rust)",
					strokeWidth: "13",
					opacity: ".8"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M62.5 35 A75 75 0 0 1 137.5 35",
					fill: "none",
					stroke: "var(--ochre)",
					strokeWidth: "13",
					opacity: ".8"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M137.5 35 A75 75 0 0 1 175 100",
					fill: "none",
					stroke: "var(--moss)",
					strokeWidth: "13",
					opacity: ".9"
				}),
				value !== null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: `M ${lx} ${ly} A73 73 0 0 1 ${hx} ${hy}`,
					fill: "none",
					stroke: "var(--paper)",
					strokeWidth: "5",
					strokeLinecap: "round",
					opacity: ".55"
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", {
					className: "needle",
					style: {
						transform: `rotate(${angle}deg)`,
						transformOrigin: "100px 100px"
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						x1: "100",
						y1: "100",
						x2: "100",
						y2: "36",
						stroke: "var(--paper)",
						strokeWidth: "2"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "100",
					cy: "100",
					r: "6",
					fill: "var(--paper)"
				}),
				[
					0,
					4,
					8,
					12
				].map((tick) => {
					const [x, y] = arcPoint(tick, 91);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
						x: x.toFixed(3),
						y: y.toFixed(3),
						fill: "var(--paper)",
						opacity: ".72",
						fontSize: "8",
						textAnchor: "middle",
						children: tick
					}, tick);
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "-mt-2 flex justify-center gap-3 text-[9px] font-medium uppercase text-paper/70",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Poor" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Average" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Good" })
			]
		})]
	});
}
function Index() {
	const [values, setValues] = (0, import_react.useState)(() => toFieldValues(defaultValues));
	const [result, setResult] = (0, import_react.useState)(null);
	const [history, setHistory] = (0, import_react.useState)([]);
	const [pending, setPending] = (0, import_react.useState)(false);
	const [formError, setFormError] = (0, import_react.useState)(null);
	const [touched, setTouched] = (0, import_react.useState)(false);
	const runPredict = useServerFn(predictYield);
	const errors = (0, import_react.useMemo)(() => Object.fromEntries(allVariables.flatMap((spec) => {
		const error = fieldError(spec, values[spec.key] ?? "");
		return error ? [[spec.key, error]] : [];
	})), [values]);
	const validCount = allVariables.length - Object.keys(errors).length;
	const handleReset = () => {
		setValues(toFieldValues(defaultValues));
		setResult(null);
		setFormError(null);
		setTouched(false);
	};
	const handlePredict = async () => {
		setTouched(true);
		if (Object.keys(errors).length) {
			setFormError("Some values are outside their valid range. Fix the highlighted fields.");
			return;
		}
		setFormError(null);
		setPending(true);
		try {
			const payload = Object.fromEntries(allVariables.map((variable) => [variable.key, Number(values[variable.key])]));
			const prediction = await runPredict({ data: payload });
			setResult(prediction);
			setHistory((previous) => [{
				id: Date.now(),
				value: prediction.yield,
				confidence: prediction.confidence,
				at: (/* @__PURE__ */ new Date()).toLocaleTimeString([], {
					hour: "2-digit",
					minute: "2-digit"
				}),
				latitude: values["latitude"] ?? "—",
				pinned: false
			}, ...previous].slice(0, 4));
		} catch (error) {
			setFormError(error instanceof Error && error.message ? error.message : "The prediction service is unavailable. Please try again.");
		} finally {
			setPending(false);
		}
	};
	const pinned = history.filter((entry) => entry.pinned).slice(0, 2);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-paper pb-24 font-grotesk text-ink xl:pb-0",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "sticky top-0 z-30 border-b border-line/80 bg-paper/90 backdrop-blur-xl",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid size-9 place-items-center rounded-md bg-ink text-paper",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Leaf, { size: 18 })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display text-2xl leading-none",
							children: "YieldForecast"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[10px] font-semibold uppercase tracking-widest text-inksoft",
							children: "Field station · v2.4"
						})] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-end gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "hidden items-center gap-1 rounded-full border border-line bg-panel/70 p-1 text-[11px] sm:flex",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex items-center gap-1.5 rounded-full bg-moss/12 px-2.5 py-1 text-moss",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 rounded-full bg-moss" }), "Model online"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "px-2 text-inksoft",
										children: ["Lat ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "font-mono text-ink",
											children: [values["latitude"] || "—", "°"]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "px-2 text-inksoft",
										children: ["Season ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-mono text-ink",
											children: "2024"
										})]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								onClick: handleReset,
								className: "border-line bg-panel",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, {}), "Reset"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								onClick: handlePredict,
								disabled: pending,
								className: "bg-ochre text-paper hover:bg-ochredeep",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gauge, {}), pending ? "Predicting…" : "Predict yield"]
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto grid max-w-[1500px] grid-cols-1 gap-6 px-4 py-6 sm:px-6 xl:grid-cols-[minmax(0,1fr)_390px]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 space-y-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-end justify-between gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-semibold uppercase tracking-widest text-ochredeep",
								children: "Model parameters"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-1 font-display text-3xl sm:text-4xl",
								children: "Field conditions"
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-right",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-mono text-sm font-semibold",
									children: [
										validCount,
										"/",
										allVariables.length
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-inksoft",
									children: "values ready"
								})]
							})]
						}),
						formError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							role: "alert",
							className: "rounded-md border border-rust/30 bg-rust/8 px-4 py-3 text-sm text-rust",
							children: formError
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "rounded-lg border border-ochre/25 bg-panel p-4 shadow-[0_14px_40px_-32px_var(--ink)] sm:p-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-4 flex items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid size-9 place-items-center rounded-md bg-ochre/12 text-ochredeep",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crosshair, { size: 18 })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[10px] font-semibold uppercase tracking-widest text-ochredeep",
									children: "Highest influence"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "font-display text-2xl",
									children: "Primary yield drivers"
								})] })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid gap-3 lg:grid-cols-3",
								children: allVariables.filter((spec) => impactKeys.has(spec.key)).map((spec) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldControl, {
									spec,
									raw: values[spec.key] ?? "",
									error: touched ? errors[spec.key] : void 0,
									featured: true,
									onChange: (next) => setValues((previous) => ({
										...previous,
										[spec.key]: next
									}))
								}, spec.key))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-3",
							children: variableGroups.map((group, index) => {
								const meta = groupMeta[index] ?? locationMeta;
								const Icon = meta.icon;
								const fields = group.variables.filter((spec) => !impactKeys.has(spec.key));
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
									open: index < 2,
									className: `group overflow-hidden rounded-lg border bg-panel shadow-[0_14px_40px_-34px_var(--ink)] ${meta.border}`,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", {
										className: "flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4 sm:px-5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: `grid size-9 place-items-center rounded-md ${meta.wash} ${meta.accent}`,
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { size: 18 })
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: `text-[10px] font-semibold ${meta.accent}`,
												children: group.index
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
												className: "font-display text-xl leading-tight",
												children: group.title
											})] })]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "font-mono text-[10px] text-inksoft",
												children: [
													fields.length,
													" inputs · ",
													group.unitHint
												]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-4 text-inksoft transition-transform group-open:rotate-180" })]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "grid border-t border-line/70 px-4 pb-2 sm:grid-cols-2 sm:gap-x-6 sm:px-5",
										children: fields.map((spec) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldControl, {
											spec,
											raw: values[spec.key] ?? "",
											error: touched ? errors[spec.key] : void 0,
											onChange: (next) => setValues((previous) => ({
												...previous,
												[spec.key]: next
											}))
										}, spec.key))
									})]
								}, group.title);
							})
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
					className: "self-start xl:sticky xl:top-[84px]",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "overflow-hidden rounded-lg border border-ink/10 bg-canvas text-paper shadow-2xl",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "border-b border-paper/10 bg-glass px-5 py-5 backdrop-blur-xl sm:px-6",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[11px] font-semibold uppercase tracking-widest text-paper/75",
											children: "Live forecast"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "rounded-full border border-moss/40 bg-moss/15 px-2 py-1 text-[10px] font-semibold uppercase text-moss",
											children: pending ? "Running" : result ? "Updated" : "Ready"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-3 flex items-end gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-mono text-5xl font-medium leading-none sm:text-6xl",
											children: result ? result.yield.toFixed(2) : "—"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "mb-1 font-mono text-sm text-paper/80",
											children: "t/ha"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-xs text-paper/70",
										children: result ? `${result.modelVersion} · ${result.latencyMs} ms` : "Set field conditions and run the model"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "px-5 py-5 sm:px-6",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GaugeChart, {
									value: result?.yield ?? null,
									confidence: result?.confidence ?? 0
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-5 rounded-md border border-paper/15 bg-paper/5 p-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs font-medium text-paper/80",
												children: "Confidence interval"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "font-mono text-lg font-semibold",
												children: [result?.confidence ?? "—", "%"]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-2 h-1.5 overflow-hidden rounded-full bg-paper/15",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "h-full bg-moss transition-all",
												style: { width: `${result?.confidence ?? 0}%` }
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-2 text-[11px] leading-relaxed text-paper/70",
											children: "The pale gauge band shows the likely yield range around the estimate."
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "border-t border-paper/10 px-5 py-5 sm:px-6",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mb-3 text-[11px] font-semibold uppercase tracking-widest text-paper/75",
									children: "Key model inputs"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
									className: "space-y-2.5",
									children: (result?.drivers ?? [
										{
											label: "Mean temperature",
											value: `${values["tavg_mean"]} °C`
										},
										{
											label: "Total precipitation",
											value: `${values["prec_sum"]} mm`
										},
										{
											label: "Root-zone moisture",
											value: `${values["rsm_mean"]} %`
										},
										{
											label: "NDVI mean",
											value: `${values["ndvi_mean"]}`
										}
									]).map((driver) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-[13px] text-paper/80",
											children: driver.label
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
											className: "font-mono text-[13px] font-medium text-paper",
											children: driver.value
										})]
									}, driver.label))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "border-t border-paper/10 px-5 py-5 sm:px-6",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[11px] font-semibold uppercase tracking-widest text-paper/75",
											children: "Scenario comparison"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[10px] text-paper/65",
											children: "Pin up to 2"
										})]
									}),
									pinned.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-3 grid grid-cols-2 gap-2",
										children: pinned.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-md border border-ochre/35 bg-ochre/10 p-3",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "text-[10px] text-paper/70",
													children: [
														"Lat ",
														entry.latitude,
														"°"
													]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "mt-1 font-mono text-lg font-semibold",
													children: entry.value.toFixed(2)
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "text-[10px] text-paper/70",
													children: [entry.confidence, "% confidence"]
												})
											]
										}, entry.id))
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-3 text-xs leading-relaxed text-paper/70",
										children: "Run forecasts, then pin two to compare side by side."
									}),
									history.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
										className: "mt-3 divide-y divide-paper/10",
										children: history.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
											className: "flex items-center justify-between gap-3 py-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "font-mono text-xs",
												children: [entry.value.toFixed(2), " t/ha"]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "ml-2 text-[10px] text-paper/65",
												children: entry.at
											})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "icon",
												variant: "ghost",
												"aria-label": entry.pinned ? "Unpin prediction" : "Pin prediction",
												title: entry.pinned ? "Unpin prediction" : "Pin prediction",
												disabled: !entry.pinned && pinned.length >= 2,
												onClick: () => setHistory((previous) => previous.map((item) => item.id === entry.id ? {
													...item,
													pinned: !item.pinned
												} : item)),
												className: `size-7 text-paper hover:bg-paper/10 hover:text-paper ${entry.pinned ? "bg-ochre/20 text-ochre" : ""}`,
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pin, {})
											})]
										}, entry.id))
									}) : null
								]
							})
						]
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "fixed inset-x-0 bottom-0 z-40 flex items-center justify-between border-t border-paper/10 bg-canvas px-4 py-3 text-paper xl:hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[10px] font-semibold uppercase tracking-widest text-paper/65",
					children: "Predicted yield"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "font-mono text-xl font-semibold",
					children: [
						result ? result.yield.toFixed(2) : "—",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-paper/70",
							children: "t/ha"
						})
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: handlePredict,
					disabled: pending,
					className: "bg-ochre text-paper hover:bg-ochredeep",
					children: pending ? "Predicting…" : "Predict yield"
				})]
			})
		]
	});
}
//#endregion
export { Index as component };
