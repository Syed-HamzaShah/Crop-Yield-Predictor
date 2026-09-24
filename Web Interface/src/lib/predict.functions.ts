import { createServerFn } from "@tanstack/react-start";
import { allVariables, variableKeys } from "./variables";

export type PredictionResult = {
  yield: number;
  unit: string;
  confidence: number;
  latencyMs: number;
  modelVersion: string;
  drivers: { label: string; value: string }[];
};

function validate(input: unknown): Record<string, number> {
  if (typeof input !== "object" || input === null) {
    throw new Error("Prediction inputs are missing.");
  }
  const raw = input as Record<string, unknown>;
  const out: Record<string, number> = {};

  for (const spec of allVariables) {
    const value = raw[spec.key];
    const num = typeof value === "string" ? Number(value) : value;
    if (typeof num !== "number" || !Number.isFinite(num)) {
      throw new Error(`${spec.label} must be a number.`);
    }
    if (num < spec.min || num > spec.max) {
      throw new Error(
        `${spec.label} must be between ${spec.min} and ${spec.max} ${spec.unit}.`,
      );
    }
    out[spec.key] = num;
  }
  return out;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
/** Bell-shaped response: 1 at the optimum, falling off with width. */
const optimum = (v: number, opt: number, width: number) =>
  Math.exp(-1 * (((v - opt) / width) ** 2));

function score(v: Record<string, number>) {
  // Light capture drives potential biomass.
  const canopy = 0.55 * v['ndvi_mean']! + 0.45 * v['fpar_mean']!;
  const radiation = clamp(v['rad_mean']! / 450, 0.35, 1.15);
  const potential = 15.5 * canopy * radiation;

  // Thermal suitability.
  const thermal =
    optimum(v['tavg_mean']!, 18.5, 8) *
    (1 - 0.35 * clamp((v['tmax_max']! - 32) / 14, 0, 1)) *
    (1 - 0.25 * clamp((-2 - v['tmin_min']!) / 14, 0, 1)) *
    (1 - 0.18 * clamp((v['tavg_std']! - 4) / 10, 0, 1));

  // Water supply vs demand.
  const water =
    optimum(v['prec_sum']!, 680, 420) *
    (1 - 0.3 * clamp((v['vpd_mean']! - 1.2) / 3.5, 0, 1)) *
    (1 + 0.12 * clamp(v['cwb_sum']! / 400, -1, 1)) *
    (1 - 0.18 * clamp((v['prec_max']! - 120) / 180, 0, 1)) *
    (1 - 0.12 * clamp((v['prec_std']! - 40) / 140, 0, 1)) *
    (1 - 0.12 * clamp((v['et0_mean']! - 70) / 120, 0, 1));

  // Soil capacity to store and deliver water.
  const soil =
    (0.65 + 0.35 * clamp(v['awc']! / 28, 0, 1.2)) *
    optimum(v['bulk_density']!, 1.32, 0.42) *
    (1 - 0.06 * (v['drainage_class']! - 2)) *
    optimum(v['rsm_mean']!, 34, 22) *
    optimum(v['ssm_mean']!, 30, 26);

  // Season-long instability penalties.
  const stability =
    1 -
    0.22 * clamp(v['ndvi_std']! / 0.35, 0, 1) -
    0.14 * clamp(v['fpar_std']! / 0.35, 0, 1) -
    0.1 * clamp(v['rsm_std']! / 20, 0, 1) -
    0.08 * clamp(v['ssm_std']! / 22, 0, 1) -
    0.08 * clamp(v['rad_std']! / 220, 0, 1);

  // Mild latitude and regional-scale adjustment.
  const geo =
    optimum(Math.abs(v['latitude']!), 42, 34) *
    (1 - 0.05 * clamp((v['region_area']! - 2500) / 2500, 0, 1));

  const raw =
    potential *
    clamp(thermal, 0.05, 1.2) *
    clamp(water, 0.05, 1.25) *
    clamp(soil, 0.1, 1.25) *
    clamp(stability, 0.3, 1) *
    clamp(geo, 0.4, 1.05);

  const yieldValue = clamp(raw, 0.2, 14);

  const agreement =
    (clamp(thermal, 0, 1) + clamp(water, 0, 1) + clamp(soil, 0, 1) + clamp(stability, 0, 1)) / 4;
  const confidence = Math.round(clamp(58 + 40 * agreement, 45, 97));

  return { yieldValue, confidence };
}

export const predictYield = createServerFn({ method: "POST" })
  .inputValidator(validate)
  .handler(async ({ data }): Promise<PredictionResult> => {
    const startedAt = Date.now();
    const { yieldValue, confidence } = score(data);

    return {
      yield: Math.round(yieldValue * 100) / 100,
      unit: "t/ha",
      confidence,
      latencyMs: Math.max(1, Date.now() - startedAt),
      modelVersion: "agronomic-v2.4",
      drivers: [
        { label: "Mean temperature", value: `${data['tavg_mean']} °C` },
        { label: "Total precipitation", value: `${data['prec_sum']} mm` },
        { label: "Root-zone moisture", value: `${data['rsm_mean']} %` },
        { label: "NDVI mean", value: `${data['ndvi_mean']}` },
      ],
    };
  });

export { variableKeys };
