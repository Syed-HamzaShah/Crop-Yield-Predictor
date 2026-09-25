import { c as createServerFn, i as TSS_SERVER_FUNCTION } from "./createServerFn-CIHAFgYl.mjs";
import { t as allVariables } from "./variables-BBll6Uin.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/predict.functions-Dbfnv_X6.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
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
var clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
/** Bell-shaped response: 1 at the optimum, falling off with width. */
var optimum = (v, opt, width) => Math.exp(-1 * ((v - opt) / width) ** 2);
function score(v) {
	const canopy = .55 * v["ndvi_mean"] + .45 * v["fpar_mean"];
	const radiation = clamp(v["rad_mean"] / 450, .35, 1.15);
	const potential = 15.5 * canopy * radiation;
	const thermal = optimum(v["tavg_mean"], 18.5, 8) * (1 - .35 * clamp((v["tmax_max"] - 32) / 14, 0, 1)) * (1 - .25 * clamp((-2 - v["tmin_min"]) / 14, 0, 1)) * (1 - .18 * clamp((v["tavg_std"] - 4) / 10, 0, 1));
	const water = optimum(v["prec_sum"], 680, 420) * (1 - .3 * clamp((v["vpd_mean"] - 1.2) / 3.5, 0, 1)) * (1 + .12 * clamp(v["cwb_sum"] / 400, -1, 1)) * (1 - .18 * clamp((v["prec_max"] - 120) / 180, 0, 1)) * (1 - .12 * clamp((v["prec_std"] - 40) / 140, 0, 1)) * (1 - .12 * clamp((v["et0_mean"] - 70) / 120, 0, 1));
	const soil = (.65 + .35 * clamp(v["awc"] / 28, 0, 1.2)) * optimum(v["bulk_density"], 1.32, .42) * (1 - .06 * (v["drainage_class"] - 2)) * optimum(v["rsm_mean"], 34, 22) * optimum(v["ssm_mean"], 30, 26);
	const stability = 1 - .22 * clamp(v["ndvi_std"] / .35, 0, 1) - .14 * clamp(v["fpar_std"] / .35, 0, 1) - .1 * clamp(v["rsm_std"] / 20, 0, 1) - .08 * clamp(v["ssm_std"] / 22, 0, 1) - .08 * clamp(v["rad_std"] / 220, 0, 1);
	const geo = optimum(Math.abs(v["latitude"]), 42, 34) * (1 - .05 * clamp((v["region_area"] - 2500) / 2500, 0, 1));
	const yieldValue = clamp(potential * clamp(thermal, .05, 1.2) * clamp(water, .05, 1.25) * clamp(soil, .1, 1.25) * clamp(stability, .3, 1) * clamp(geo, .4, 1.05), .2, 14);
	const agreement = (clamp(thermal, 0, 1) + clamp(water, 0, 1) + clamp(soil, 0, 1) + clamp(stability, 0, 1)) / 4;
	return {
		yieldValue,
		confidence: Math.round(clamp(58 + 40 * agreement, 45, 97))
	};
}
var predictYield_createServerFn_handler = createServerRpc({
	id: "a0c9dbc61f8a4c3dc10b9bf882aadbab4f1f5bf304ad8ba31c7a5c0c5c1bf8a7",
	name: "predictYield",
	filename: "src/lib/predict.functions.ts"
}, (opts) => predictYield.__executeServer(opts));
var predictYield = createServerFn({ method: "POST" }).inputValidator(validate).handler(predictYield_createServerFn_handler, async ({ data }) => {
	const startedAt = Date.now();
	const { yieldValue, confidence } = score(data);
	return {
		yield: Math.round(yieldValue * 100) / 100,
		unit: "t/ha",
		confidence,
		latencyMs: Math.max(1, Date.now() - startedAt),
		modelVersion: "agronomic-v2.4",
		drivers: [
			{
				label: "Mean temperature",
				value: `${data["tavg_mean"]} °C`
			},
			{
				label: "Total precipitation",
				value: `${data["prec_sum"]} mm`
			},
			{
				label: "Root-zone moisture",
				value: `${data["rsm_mean"]} %`
			},
			{
				label: "NDVI mean",
				value: `${data["ndvi_mean"]}`
			}
		]
	};
});
//#endregion
export { predictYield_createServerFn_handler };
