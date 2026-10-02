import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  ChevronDown,
  Crosshair,
  Droplets,
  FlaskConical,
  Gauge,
  Leaf,
  MapPin,
  Pin,
  RotateCcw,
  Satellite,
  ThermometerSun,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  YIELD_SCALE_MAX,
  allVariables,
  cropOptions,
  defaultCrop,
  defaultValuesByCrop,
  defaultValues,
  specByKey,
  variableGroups,
  type CropValue,
  type VariableSpec,
} from "@/lib/variables";
import { predictYield, type PredictionResult } from "@/lib/predict.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "YieldForecast — Field Station" },
      {
        name: "description",
        content:
          "An interactive field-station dashboard for crop yield prediction from 27 agronomic measurements.",
      },
      { property: "og:title", content: "YieldForecast — Field Station" },
      {
        property: "og:description",
        content:
          "Explore crop yield predictions from field, climate, soil and satellite measurements.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type FieldValues = Record<string, string>;
type HistoryEntry = {
  id: number;
  value: number;
  confidence: number;
  at: string;
  latitude: string;
  crop: string;
  pinned: boolean;
};

const toFieldValues = (nums: Record<string, number>): FieldValues =>
  Object.fromEntries(Object.entries(nums).map(([k, v]) => [k, String(v)]));

const impactKeys = new Set(["tavg_mean", "prec_sum", "ndvi_mean"]);

const locationMeta = {
  icon: MapPin,
  accent: "text-ochre",
  wash: "bg-ochre/8",
  border: "border-ochre/25",
};
const groupMeta = [
  locationMeta,
  { icon: ThermometerSun, accent: "text-rust", wash: "bg-rust/8", border: "border-rust/25" },
  { icon: Droplets, accent: "text-sky", wash: "bg-sky/8", border: "border-sky/25" },
  { icon: FlaskConical, accent: "text-teal", wash: "bg-teal/8", border: "border-teal/25" },
  { icon: Satellite, accent: "text-violet", wash: "bg-violet/8", border: "border-violet/25" },
];

function fieldError(spec: VariableSpec, raw: string) {
  if (raw.trim() === "") return "Required";
  const num = Number(raw);
  if (!Number.isFinite(num)) return "Must be a number";
  if (num < spec.min || num > spec.max) return `${spec.min} to ${spec.max}`;
  return null;
}

function FieldControl({
  spec,
  raw,
  error,
  featured,
  onChange,
}: {
  spec: VariableSpec;
  raw: string;
  error: string | undefined;
  featured?: boolean;
  onChange: (value: string) => void;
}) {
  const sliderValue = Number.isFinite(Number(raw))
    ? Math.min(spec.max, Math.max(spec.min, Number(raw)))
    : spec.default;
  return (
    <div
      className={
        featured
          ? "rounded-lg border border-ochre/25 bg-ochre/8 p-4"
          : "border-t border-line/60 py-3 first:border-t-0"
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <label
            htmlFor={spec.key}
            className={featured ? "text-[15px] font-semibold text-ink" : "text-[13px] font-medium text-ink"}
          >
            {spec.label}
          </label>
          {featured ? (
            <p className="mt-0.5 text-xs text-inksoft">High-impact model driver</p>
          ) : null}
        </div>
        <label
          className={`group flex shrink-0 items-baseline gap-1 border-b px-1 py-0.5 font-mono transition-colors focus-within:border-ochre ${error ? "border-rust text-rust" : "border-line text-ink"}`}
        >
          <input
            id={spec.key}
            type="number"
            inputMode="decimal"
            min={spec.min}
            max={spec.max}
            step={spec.step}
            value={raw}
            aria-invalid={Boolean(error)}
            onChange={(event) => onChange(event.target.value)}
            className="w-20 bg-transparent text-right text-[13px] font-medium outline-none"
          />
          <span className="text-[10px] text-inksoft">{spec.unit}</span>
        </label>
      </div>
      <input
        type="range"
        aria-label={`${spec.label} slider`}
        min={spec.min}
        max={spec.max}
        step={spec.step}
        value={sliderValue}
        onChange={(event) => onChange(event.target.value)}
        className="mt-3 w-full"
      />
      <div className="mt-1.5 flex justify-between text-[10px] text-inksoft">
        <span>{error ?? spec.help}</span>
        <span className="font-mono">
          {spec.min}—{spec.max}
        </span>
      </div>
    </div>
  );
}

function GaugeChart({ value, confidence }: { value: number | null; confidence: number }) {
  const safe = Math.min(value ?? 0, YIELD_SCALE_MAX);
  const angle = -90 + (safe / YIELD_SCALE_MAX) * 180;
  const spread = Math.max(0.45, safe * (1 - confidence / 100));
  const low = Math.max(0, safe - spread);
  const high = Math.min(YIELD_SCALE_MAX, safe + spread);
  const arcPoint = (v: number, r: number): [number, number] => {
    const a = Math.PI + (v / YIELD_SCALE_MAX) * Math.PI;
    return [100 + r * Math.cos(a), 100 + r * Math.sin(a)];
  };
  const [lx, ly] = arcPoint(low, 73);
  const [hx, hy] = arcPoint(high, 73);
  return (
    <div
      className="relative mx-auto w-full max-w-[270px]"
      aria-label={`Yield gauge ${value?.toFixed(2) ?? "not calculated"} tonnes per hectare`}
    >
      <svg viewBox="0 0 200 122" className="w-full overflow-visible">
        <path d="M25 100 A75 75 0 0 1 62.5 35" fill="none" stroke="var(--rust)" strokeWidth="13" opacity=".8" />
        <path d="M62.5 35 A75 75 0 0 1 137.5 35" fill="none" stroke="var(--ochre)" strokeWidth="13" opacity=".8" />
        <path d="M137.5 35 A75 75 0 0 1 175 100" fill="none" stroke="var(--moss)" strokeWidth="13" opacity=".9" />
        {value !== null ? (
          <path
            d={`M ${lx} ${ly} A73 73 0 0 1 ${hx} ${hy}`}
            fill="none"
            stroke="var(--paper)"
            strokeWidth="5"
            strokeLinecap="round"
            opacity=".55"
          />
        ) : null}
        <g
          className="needle"
          style={{ transform: `rotate(${angle}deg)`, transformOrigin: "100px 100px" }}
        >
          <line x1="100" y1="100" x2="100" y2="36" stroke="var(--paper)" strokeWidth="2" />
        </g>
        <circle cx="100" cy="100" r="6" fill="var(--paper)" />
        {[0, 4, 8, 12].map((tick) => {
          const [x, y] = arcPoint(tick, 91);
          return (
            <text
              key={tick}
              x={x.toFixed(3)}
              y={y.toFixed(3)}
              fill="var(--paper)"
              opacity=".72"
              fontSize="8"
              textAnchor="middle"
            >
              {tick}
            </text>
          );
        })}
      </svg>
      <div className="-mt-2 flex justify-center gap-3 text-[9px] font-medium uppercase text-paper/70">
        <span>Poor</span>
        <span>Average</span>
        <span>Good</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Crop selector component
// ---------------------------------------------------------------------------
function CropSelector({
  value,
  onChange,
}: {
  value: CropValue;
  onChange: (crop: CropValue) => void;
}) {
  return (
    <div className="rounded-lg border border-ochre/30 bg-panel p-4 shadow-[0_14px_40px_-32px_var(--ink)] sm:p-5">
      <div className="mb-3 flex items-center gap-3">
        <div className="grid size-9 place-items-center rounded-md bg-moss/12 text-moss">
          <Leaf size={18} />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-moss">
            Crop type
          </p>
          <h3 className="font-display text-xl leading-tight">Select crop</h3>
        </div>
      </div>
      <div
        className="grid grid-cols-3 gap-2"
        role="group"
        aria-label="Crop type selector"
      >
        {cropOptions.map((opt) => (
          <button
            key={opt.value}
            id={`crop-${opt.value}`}
            type="button"
            aria-pressed={value === opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex flex-col items-center gap-1 rounded-md border px-3 py-3 text-[13px] font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre ${
              value === opt.value
                ? "border-ochre bg-ochre/12 text-ink shadow-sm"
                : "border-line/60 text-inksoft hover:border-ochre/50 hover:bg-ochre/5 hover:text-ink"
            }`}
          >
            <span className="text-xl">{opt.icon}</span>
            <span>{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------
function Index() {
  const [crop, setCrop] = useState<CropValue>(defaultCrop);
  const [values, setValues] = useState<FieldValues>(() =>
    toFieldValues(defaultValuesByCrop[defaultCrop]),
  );
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const runPredict = useServerFn(predictYield);

  const errors = useMemo(
    () =>
      Object.fromEntries(
        allVariables.flatMap((spec) => {
          const error = fieldError(spec, values[spec.key] ?? "");
          return error ? [[spec.key, error]] : [];
        }),
      ),
    [values],
  );
  const validCount = allVariables.length - Object.keys(errors).length;

  const handleCropChange = (newCrop: CropValue) => {
    setCrop(newCrop);
    setValues(toFieldValues(defaultValuesByCrop[newCrop]));
    setResult(null);
    setFormError(null);
    setTouched(false);
  };

  const handleReset = () => {
    setValues(toFieldValues(defaultValuesByCrop[crop]));
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
      const payload: Record<string, unknown> = {
        crop,
        ...Object.fromEntries(allVariables.map((variable) => [variable.key, Number(values[variable.key])])),
      };
      const prediction = await runPredict({ data: payload });
      setResult(prediction);
      setHistory((previous) =>
        [
          {
            id: Date.now(),
            value: prediction.yield,
            confidence: prediction.confidence,
            at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            latitude: values["latitude"] ?? "—",
            crop,
            pinned: false,
          },
          ...previous,
        ].slice(0, 4),
      );
    } catch (error) {
      setFormError(
        error instanceof Error && error.message
          ? error.message
          : "The prediction service is unavailable. Please try again.",
      );
    } finally {
      setPending(false);
    }
  };

  const pinned = history.filter((entry) => entry.pinned).slice(0, 2);
  const currentCropLabel = cropOptions.find((c) => c.value === crop)?.label ?? crop;

  return (
    <div className="min-h-screen bg-paper pb-24 font-grotesk text-ink xl:pb-0">
      <header className="sticky top-0 z-30 border-b border-line/80 bg-paper/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-md bg-ink text-paper">
              <Leaf size={18} />
            </div>
            <div>
              <h1 className="font-display text-2xl leading-none">YieldForecast</h1>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-inksoft">
                Field station · XGBoost-base-v1
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="hidden items-center gap-1 rounded-full border border-line bg-panel/70 p-1 text-[11px] sm:flex">
              <span className="flex items-center gap-1.5 rounded-full bg-moss/12 px-2.5 py-1 text-moss">
                <span className="size-1.5 rounded-full bg-moss" />
                Model online
              </span>
              <span className="px-2 text-inksoft">
                Crop{" "}
                <span className="font-mono text-ink">
                  {cropOptions.find((c) => c.value === crop)?.icon}{" "}
                  {currentCropLabel}
                </span>
              </span>
              <span className="px-2 text-inksoft">
                Lat{" "}
                <span className="font-mono text-ink">
                  {values["latitude"] || "—"}°
                </span>
              </span>
            </div>
            <Button
              variant="outline"
              onClick={handleReset}
              className="border-line bg-panel"
            >
              <RotateCcw />
              Reset
            </Button>
            <Button
              onClick={handlePredict}
              disabled={pending}
              className="bg-ochre text-paper hover:bg-ochredeep"
            >
              <Gauge />
              {pending ? "Predicting…" : "Predict yield"}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1500px] grid-cols-1 gap-6 px-4 py-6 sm:px-6 xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="min-w-0 space-y-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-ochredeep">
                Model parameters
              </p>
              <h2 className="mt-1 font-display text-3xl sm:text-4xl">Field conditions</h2>
            </div>
            <div className="text-right">
              <span className="font-mono text-sm font-semibold">
                {validCount}/{allVariables.length}
              </span>
              <p className="text-xs text-inksoft">values ready</p>
            </div>
          </div>

          {formError ? (
            <p role="alert" className="rounded-md border border-rust/30 bg-rust/8 px-4 py-3 text-sm text-rust">
              {formError}
            </p>
          ) : null}

          {/* Crop selector */}
          <CropSelector value={crop} onChange={handleCropChange} />

          {/* Primary yield drivers */}
          <section className="rounded-lg border border-ochre/25 bg-panel p-4 shadow-[0_14px_40px_-32px_var(--ink)] sm:p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-md bg-ochre/12 text-ochredeep">
                <Crosshair size={18} />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-ochredeep">
                  Highest influence
                </p>
                <h3 className="font-display text-2xl">Primary yield drivers</h3>
              </div>
            </div>
            <div className="grid gap-3 lg:grid-cols-3">
              {allVariables
                .filter((spec) => impactKeys.has(spec.key))
                .map((spec) => (
                  <FieldControl
                    key={spec.key}
                    spec={spec}
                    raw={values[spec.key] ?? ""}
                    error={touched ? errors[spec.key] : undefined}
                    featured
                    onChange={(next) => setValues((previous) => ({ ...previous, [spec.key]: next }))}
                  />
                ))}
            </div>
          </section>

          {/* Variable groups */}
          <div className="space-y-3">
            {variableGroups.map((group, index) => {
              const meta = groupMeta[index] ?? locationMeta;
              const Icon = meta.icon;
              const fields = group.variables.filter((spec) => !impactKeys.has(spec.key));
              return (
                <details
                  key={group.title}
                  open={index < 2}
                  className={`group overflow-hidden rounded-lg border bg-panel shadow-[0_14px_40px_-34px_var(--ink)] ${meta.border}`}
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4 sm:px-5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`grid size-9 place-items-center rounded-md ${meta.wash} ${meta.accent}`}
                      >
                        <Icon size={18} />
                      </div>
                      <div>
                        <span className={`text-[10px] font-semibold ${meta.accent}`}>
                          {group.index}
                        </span>
                        <h3 className="font-display text-xl leading-tight">{group.title}</h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[10px] text-inksoft">
                        {fields.length} inputs · {group.unitHint}
                      </span>
                      <ChevronDown className="size-4 text-inksoft transition-transform group-open:rotate-180" />
                    </div>
                  </summary>
                  <div className="grid border-t border-line/70 px-4 pb-2 sm:grid-cols-2 sm:gap-x-6 sm:px-5">
                    {fields.map((spec) => (
                      <FieldControl
                        key={spec.key}
                        spec={spec}
                        raw={values[spec.key] ?? ""}
                        error={touched ? errors[spec.key] : undefined}
                        onChange={(next) =>
                          setValues((previous) => ({ ...previous, [spec.key]: next }))
                        }
                      />
                    ))}
                  </div>
                </details>
              );
            })}
          </div>
        </div>

        {/* Right panel — results */}
        <aside className="self-start xl:sticky xl:top-[84px]">
          <div className="overflow-hidden rounded-lg border border-ink/10 bg-canvas text-paper shadow-2xl">
            <div className="border-b border-paper/10 bg-glass px-5 py-5 backdrop-blur-xl sm:px-6">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-paper/75">
                  Live forecast
                </span>
                <span className="rounded-full border border-moss/40 bg-moss/15 px-2 py-1 text-[10px] font-semibold uppercase text-moss">
                  {pending ? "Running" : result ? "Updated" : "Ready"}
                </span>
              </div>
              <div className="mt-3 flex items-end gap-2">
                <span className="font-mono text-5xl font-medium leading-none sm:text-6xl">
                  {result ? result.yield.toFixed(2) : "—"}
                </span>
                <span className="mb-1 font-mono text-sm text-paper/80">t/ha</span>
              </div>
              <p className="mt-2 text-xs text-paper/70">
                {result
                  ? `${result.modelVersion} · ${result.latencyMs} ms · ${cropOptions.find((c) => c.value === result.crop)?.label ?? result.crop}`
                  : "Select crop, set field conditions and run the model"}
              </p>
            </div>

            <div className="px-5 py-5 sm:px-6">
              <GaugeChart value={result?.yield ?? null} confidence={result?.confidence ?? 0} />
              <div className="mt-5 rounded-md border border-paper/15 bg-paper/5 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-paper/80">Confidence interval</span>
                  <span className="font-mono text-lg font-semibold">
                    {result?.confidence ?? "—"}%
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-paper/15">
                  <div
                    className="h-full bg-moss transition-all"
                    style={{ width: `${result?.confidence ?? 0}%` }}
                  />
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-paper/70">
                  The pale gauge band shows the likely yield range around the estimate.
                </p>
              </div>
            </div>

            {/* Key model inputs */}
            <div className="border-t border-paper/10 px-5 py-5 sm:px-6">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-paper/75">
                Key model inputs
              </p>
              <dl className="space-y-2.5">
                {(
                  result?.drivers ?? [
                    {
                      label: "Mean temperature",
                      value: `${values["tavg_mean"]} °C`,
                    },
                    {
                      label: "Total precipitation",
                      value: `${values["prec_sum"]} mm`,
                    },
                    {
                      label: "Root-zone moisture",
                      value: `${values["rsm_mean"]} mm`,
                    },
                    {
                      label: "NDVI mean",
                      value: `${values["ndvi_mean"]}`,
                    },
                  ]
                ).map((driver) => (
                  <div key={driver.label} className="flex items-center justify-between gap-3">
                    <dt className="text-[13px] text-paper/80">{driver.label}</dt>
                    <dd className="font-mono text-[13px] font-medium text-paper">{driver.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Scenario comparison / history */}
            <div className="border-t border-paper/10 px-5 py-5 sm:px-6">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-paper/75">
                  Scenario comparison
                </p>
                <span className="text-[10px] text-paper/65">Pin up to 2</span>
              </div>

              {pinned.length ? (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {pinned.map((entry) => (
                    <div
                      key={entry.id}
                      className="rounded-md border border-ochre/35 bg-ochre/10 p-3"
                    >
                      <p className="text-[10px] text-paper/70">
                        {cropOptions.find((c) => c.value === entry.crop)?.label ?? entry.crop} ·
                        Lat {entry.latitude}°
                      </p>
                      <p className="mt-1 font-mono text-lg font-semibold">
                        {entry.value.toFixed(2)}
                      </p>
                      <p className="text-[10px] text-paper/70">{entry.confidence}% confidence</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-xs leading-relaxed text-paper/70">
                  Run forecasts, then pin two to compare side by side.
                </p>
              )}

              {history.length ? (
                <ul className="mt-3 divide-y divide-paper/10">
                  {history.map((entry) => (
                    <li key={entry.id} className="flex items-center justify-between gap-3 py-2">
                      <div>
                        <span className="font-mono text-xs">{entry.value.toFixed(2)} t/ha</span>
                        <span className="ml-2 text-[10px] text-paper/65">{entry.at}</span>
                        <span className="ml-2 text-[10px] text-paper/50">
                          {cropOptions.find((c) => c.value === entry.crop)?.icon}
                        </span>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={entry.pinned ? "Unpin prediction" : "Pin prediction"}
                        title={entry.pinned ? "Unpin prediction" : "Pin prediction"}
                        disabled={!entry.pinned && pinned.length >= 2}
                        onClick={() =>
                          setHistory((previous) =>
                            previous.map((item) =>
                              item.id === entry.id ? { ...item, pinned: !item.pinned } : item,
                            ),
                          )
                        }
                        className={`size-7 text-paper hover:bg-paper/10 hover:text-paper ${entry.pinned ? "bg-ochre/20 text-ochre" : ""}`}
                      >
                        <Pin />
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </aside>
      </main>

      {/* Mobile bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between border-t border-paper/10 bg-canvas px-4 py-3 text-paper xl:hidden">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-paper/65">
            Predicted yield
          </p>
          <p className="font-mono text-xl font-semibold">
            {result ? result.yield.toFixed(2) : "—"}{" "}
            <span className="text-xs text-paper/70">t/ha</span>
          </p>
        </div>
        <Button
          onClick={handlePredict}
          disabled={pending}
          className="bg-ochre text-paper hover:bg-ochredeep"
        >
          {pending ? "Predicting…" : "Predict yield"}
        </Button>
      </div>
    </div>
  );
}