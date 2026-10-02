export type VariableSpec = {
  key: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  default: number;
  help: string;
};

export type VariableGroup = {
  index: string;
  title: string;
  unitHint: string;
  variables: VariableSpec[];
};

// ---------------------------------------------------------------------------
// Crop type (categorical — not a VariableSpec, handled separately in the UI)
// ---------------------------------------------------------------------------

export const cropOptions = [
  { value: "maize",        label: "Maize",        icon: "🌽" },
  { value: "wheat",        label: "Wheat",        icon: "🌾" },
  { value: "winter_wheat", label: "Winter Wheat", icon: "❄️" },
] as const;

export type CropValue = (typeof cropOptions)[number]["value"];
export const defaultCrop: CropValue = "maize";

// Default feature values per crop — drawn from training-data means
export const defaultValuesByCrop: Record<CropValue, Record<string, number>> = {
  maize: {
    latitude: -1.3,
    longitude: -45.3,
    region_area: 3398,
    awc: 12.1,
    bulk_density: 1.41,
    drainage_class: 5,
    tavg_mean: 21.7,
    tavg_std: 3.3,
    tmin_min: 7.3,
    tmax_max: 33.5,
    prec_sum: 697,
    prec_max: 35,
    prec_std: 6.7,
    rad_mean: 18120361,
    rad_std: 5202904,
    et0_mean: 3.97,
    vpd_mean: 17.4,
    cwb_sum: -105,
    ndvi_mean: 0.64,
    ndvi_std: 0.09,
    fpar_mean: 59.7,
    fpar_std: 8.9,
    ssm_mean: 5.95,
    ssm_std: 0.60,
    rsm_mean: 297.8,
    rsm_std: 21.6,
  },
  wheat: {
    latitude: -18.2,
    longitude: -28.0,
    region_area: 4134,
    awc: 12.2,
    bulk_density: 1.38,
    drainage_class: 5,
    tavg_mean: 18.0,
    tavg_std: 4.2,
    tmin_min: 1.0,
    tmax_max: 35.2,
    prec_sum: 449,
    prec_max: 31,
    prec_std: 6.8,
    rad_mean: 16329138,
    rad_std: 5555638,
    et0_mean: 3.42,
    vpd_mean: 16.9,
    cwb_sum: -59,
    ndvi_mean: 0.56,
    ndvi_std: 0.07,
    fpar_mean: 51.9,
    fpar_std: 7.6,
    ssm_mean: 6.16,
    ssm_std: 0.48,
    rsm_mean: 317.1,
    rsm_std: 13.5,
  },
  winter_wheat: {
    latitude: 42.0,
    longitude: -56.4,
    region_area: 5525,
    awc: 14.0,
    bulk_density: 1.48,
    drainage_class: 5,
    tavg_mean: 13.7,
    tavg_std: 8.1,
    tmin_min: -5.5,
    tmax_max: 31.7,
    prec_sum: 452,
    prec_max: 28,
    prec_std: 5.4,
    rad_mean: 18283499,
    rad_std: 6733054,
    et0_mean: 3.54,
    vpd_mean: 13.3,
    cwb_sum: -148,
    ndvi_mean: 0.54,
    ndvi_std: 0.12,
    fpar_mean: 47.7,
    fpar_std: 13.4,
    ssm_mean: 5.84,
    ssm_std: 0.40,
    rsm_mean: 287.8,
    rsm_std: 17.2,
  },
};

// ---------------------------------------------------------------------------
// Variable groups — ranges derived from actual training data statistics
// ---------------------------------------------------------------------------

export const variableGroups: VariableGroup[] = [
  {
    index: "01",
    title: "Location & region",
    unitHint: "° · km²",
    variables: [
      {
        key: "latitude",
        label: "Latitude",
        unit: "°",
        min: -60,
        max: 70,
        step: 0.1,
        default: 3.4,
        help: "North–south position of the field",
      },
      {
        key: "longitude",
        label: "Longitude",
        unit: "°",
        min: -180,
        max: 180,
        step: 0.1,
        default: -44.7,
        help: "East–west position of the field",
      },
      {
        key: "region_area",
        label: "Region area",
        unit: "km²",
        min: 20,
        max: 2000000,
        step: 10,
        default: 3848,
        help: "Size of the surrounding growing region",
      },
    ],
  },
  {
    index: "02",
    title: "Climate & temperature",
    unitHint: "°C · hPa",
    variables: [
      {
        key: "tmin_min",
        label: "Minimum temperature",
        unit: "°C",
        min: -40,
        max: 25,
        step: 0.1,
        default: 2.7,
        help: "Coldest temperature of the season",
      },
      {
        key: "tmax_max",
        label: "Maximum temperature",
        unit: "°C",
        min: 15,
        max: 50,
        step: 0.1,
        default: 32.9,
        help: "Hottest temperature of the season",
      },
      {
        key: "tavg_mean",
        label: "Mean temperature",
        unit: "°C",
        min: 0,
        max: 35,
        step: 0.1,
        default: 19.9,
        help: "Average temperature across the season",
      },
      {
        key: "tavg_std",
        label: "Temperature variability",
        unit: "°C",
        min: 0,
        max: 15,
        step: 0.1,
        default: 4.3,
        help: "How much temperature swings day to day",
      },
      {
        key: "vpd_mean",
        label: "Vapour pressure deficit",
        unit: "hPa",
        min: 4,
        max: 65,
        step: 0.1,
        default: 16.7,
        help: "How dry the air is — higher means more crop stress",
      },
    ],
  },
  {
    index: "03",
    title: "Water & precipitation",
    unitHint: "mm",
    variables: [
      {
        key: "prec_sum",
        label: "Total precipitation",
        unit: "mm",
        min: 0,
        max: 3500,
        step: 1,
        default: 622,
        help: "Rainfall accumulated over the season",
      },
      {
        key: "prec_max",
        label: "Peak precipitation",
        unit: "mm",
        min: 0,
        max: 300,
        step: 1,
        default: 32,
        help: "Largest single rainfall event",
      },
      {
        key: "prec_std",
        label: "Rainfall variability",
        unit: "mm",
        min: 0,
        max: 45,
        step: 0.1,
        default: 6.5,
        help: "How unevenly rain was spread through the season",
      },
      {
        key: "et0_mean",
        label: "Reference evapotranspiration",
        unit: "mm/day",
        min: 1,
        max: 9,
        step: 0.01,
        default: 3.82,
        help: "Water demand of the atmosphere (mm per day)",
      },
      {
        key: "cwb_sum",
        label: "Climatic water balance",
        unit: "mm",
        min: -1600,
        max: 2800,
        step: 1,
        default: -106,
        help: "Rainfall minus water demand — negative means drought",
      },
    ],
  },
  {
    index: "04",
    title: "Soil & moisture",
    unitHint: "g/cm³ · mm",
    variables: [
      {
        key: "awc",
        label: "Available water capacity",
        unit: "%",
        min: 5,
        max: 40,
        step: 0.1,
        default: 12.4,
        help: "How much water the soil can hold for the crop",
      },
      {
        key: "bulk_density",
        label: "Bulk density",
        unit: "g/cm³",
        min: 0.5,
        max: 1.8,
        step: 0.01,
        default: 1.41,
        help: "How compacted the soil is",
      },
      {
        key: "drainage_class",
        label: "Drainage class",
        unit: "1–6",
        min: 1,
        max: 6,
        step: 1,
        default: 5,
        help: "1 well drained to 6 very poorly drained",
      },
      {
        key: "ssm_mean",
        label: "Surface soil moisture",
        unit: "m³/m³",
        min: 0.5,
        max: 9,
        step: 0.01,
        default: 5.96,
        help: "Average volumetric moisture in the top soil layer",
      },
      {
        key: "ssm_std",
        label: "Surface moisture variability",
        unit: "m³/m³",
        min: 0,
        max: 2.5,
        step: 0.01,
        default: 0.55,
        help: "How much top-layer moisture fluctuates",
      },
      {
        key: "rsm_mean",
        label: "Root-zone soil moisture",
        unit: "mm",
        min: 40,
        max: 460,
        step: 1,
        default: 299,
        help: "Average moisture where roots draw water (mm column)",
      },
      {
        key: "rsm_std",
        label: "Root-zone variability",
        unit: "mm",
        min: 0,
        max: 95,
        step: 0.1,
        default: 19.8,
        help: "How much root-zone moisture fluctuates",
      },
    ],
  },
  {
    index: "05",
    title: "Remote sensing & radiation",
    unitHint: "index · J/m²/day",
    variables: [
      {
        key: "ndvi_mean",
        label: "NDVI mean",
        unit: "index",
        min: 0,
        max: 1,
        step: 0.001,
        default: 0.612,
        help: "Greenness of the canopy — 0 bare, 1 dense",
      },
      {
        key: "ndvi_std",
        label: "NDVI variability",
        unit: "index",
        min: 0,
        max: 0.3,
        step: 0.001,
        default: 0.091,
        help: "How uneven canopy greenness was",
      },
      {
        key: "fpar_mean",
        label: "FPAR mean",
        unit: "%",
        min: 0,
        max: 95,
        step: 0.1,
        default: 56.6,
        help: "Fraction of photosynthetically active radiation absorbed (0–95%)",
      },
      {
        key: "fpar_std",
        label: "FPAR variability",
        unit: "%",
        min: 0,
        max: 35,
        step: 0.1,
        default: 9.5,
        help: "How much light capture varied",
      },
      {
        key: "rad_mean",
        label: "Solar radiation mean",
        unit: "J/m²/day",
        min: 8000000,
        max: 28000000,
        step: 10000,
        default: 17910492,
        help: "Average daily solar radiation reaching the field",
      },
      {
        key: "rad_std",
        label: "Radiation variability",
        unit: "J/m²/day",
        min: 0,
        max: 10000000,
        step: 10000,
        default: 5513280,
        help: "How much solar radiation varied over the season",
      },
    ],
  },
];

export const allVariables: VariableSpec[] = variableGroups.flatMap((g) => g.variables);

export const variableKeys = allVariables.map((v) => v.key);

export const defaultValues: Record<string, number> = Object.fromEntries(
  allVariables.map((v) => [v.key, v.default]),
);

export const specByKey: Record<string, VariableSpec> = Object.fromEntries(
  allVariables.map((v) => [v.key, v]),
);

export const YIELD_SCALE_MAX = 12;
