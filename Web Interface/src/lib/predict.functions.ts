import { createServerFn } from "@tanstack/react-start";
import { allVariables, variableKeys, cropOptions, type CropValue } from "./variables";

export type PredictionResult = {
  yield: number;
  unit: string;
  confidence: number;
  latencyMs: number;
  modelVersion: string;
  crop: string;
  drivers: { label: string; value: string }[];
};

// ---------------------------------------------------------------------------
// API configuration
// ---------------------------------------------------------------------------

/** Base URL for the Python FastAPI prediction server. */
const API_BASE =
  (typeof process !== "undefined" && process.env["PREDICT_API_URL"]) ||
  "http://localhost:8000";

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validate(input: unknown): { features: Record<string, number>; crop: CropValue } {
  if (typeof input !== "object" || input === null) {
    throw new Error("Prediction inputs are missing.");
  }
  const raw = input as Record<string, unknown>;

  // Validate crop
  const crop = raw["crop"] as string;
  const validCrops = cropOptions.map((c) => c.value);
  if (!crop || !validCrops.includes(crop as CropValue)) {
    throw new Error(`Crop must be one of: ${validCrops.join(", ")}.`);
  }

  // Validate numeric features
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
  return { features: out, crop: crop as CropValue };
}

// ---------------------------------------------------------------------------
// Server function — calls the Python FastAPI backend
// ---------------------------------------------------------------------------

export const predictYield = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => {
    const { features, crop } = validate(raw);
    return { features, crop };
  })
  .handler(async ({ data }): Promise<PredictionResult> => {
    const { features, crop } = data;

    const payload = { crop, ...features };

    let response: Response;
    try {
      response = await fetch(`${API_BASE}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      throw new Error(
        "Cannot reach the prediction server. Make sure the Python API is running on port 8000.",
      );
    }

    if (!response.ok) {
      let detail = `API error ${response.status}`;
      try {
        const body = (await response.json()) as { detail?: string };
        if (body.detail) detail = String(body.detail);
      } catch {
        /* ignore */
      }
      throw new Error(detail);
    }

    const body = (await response.json()) as {
      yield_value: number;
      unit: string;
      confidence: number;
      latency_ms: number;
      model_version: string;
      crop: string;
      drivers: { label: string; value: string }[];
    };

    return {
      yield: body.yield_value,
      unit: body.unit,
      confidence: body.confidence,
      latencyMs: body.latency_ms,
      modelVersion: body.model_version,
      crop: body.crop,
      drivers: body.drivers,
    };
  });

export { variableKeys };
