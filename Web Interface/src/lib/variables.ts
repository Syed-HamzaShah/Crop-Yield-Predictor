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
        max: 60,
        step: 0.1,
        default: 41.2,
        help: "North–south position of the field",
      },
      {
        key: "longitude",
        label: "Longitude",
        unit: "°",
        min: -180,
        max: 180,
        step: 0.1,
        default: 2.4,
        help: "East–west position of the field",
      },
      {
        key: "region_area",
        label: "Region area",
        unit: "km²",
        min: 1,
        max: 5000,
        step: 1,
        default: 1240,
        help: "Size of the surrounding growing region",
      },
    ],
  },
  {
    index: "02",
    title: "Climate & temperature",
    unitHint: "°C · kPa",
    variables: [
      {
        key: "tmin_min",
        label: "Minimum temperature",
        unit: "°C",
        min: -20,
        max: 30,
        step: 0.1,
        default: 2.4,
        help: "Coldest temperature of the season",
      },
      {
        key: "tmax_max",
        label: "Maximum temperature",
        unit: "°C",
        min: 0,
        max: 50,
        step: 0.1,
        default: 34.1,
        help: "Hottest temperature of the season",
      },
      {
        key: "tavg_mean",
        label: "Mean temperature",
        unit: "°C",
        min: 0,
        max: 40,
        step: 0.1,
        default: 18.6,
        help: "Average temperature across the season",
      },
      {
        key: "tavg_std",
        label: "Temperature variability",
        unit: "°C",
        min: 0,
        max: 15,
        step: 0.1,
        default: 5.2,
        help: "How much temperature swings day to day",
      },
      {
        key: "vpd_mean",
        label: "Vapour pressure deficit",
        unit: "kPa",
        min: 0,
        max: 6,
        step: 0.01,
        default: 1.42,
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
        max: 2000,
        step: 1,
        default: 642,
        help: "Rainfall accumulated over the season",
      },
      {
        key: "prec_max",
        label: "Peak precipitation",
        unit: "mm",
        min: 0,
        max: 300,
        step: 1,
        default: 118,
        help: "Largest single rainfall event",
      },
      {
        key: "prec_std",
        label: "Rainfall variability",
        unit: "mm",
        min: 0,
        max: 200,
        step: 0.1,
        default: 41.7,
        help: "How unevenly rain was spread through the season",
      },
      {
        key: "et0_mean",
        label: "Reference evapotranspiration",
        unit: "mm",
        min: 0,
        max: 200,
        step: 0.1,
        default: 58.3,
        help: "Water demand of the atmosphere",
      },
      {
        key: "cwb_sum",
        label: "Climatic water balance",
        unit: "mm",
        min: -800,
        max: 800,
        step: 1,
        default: 184,
        help: "Rainfall minus water demand — negative means drought",
      },
    ],
  },
  {
    index: "04",
    title: "Soil & moisture",
    unitHint: "g/cm³ · %",
    variables: [
      {
        key: "awc",
        label: "Available water capacity",
        unit: "%",
        min: 0,
        max: 40,
        step: 0.1,
        default: 22.8,
        help: "How much water the soil can hold for the crop",
      },
      {
        key: "bulk_density",
        label: "Bulk density",
        unit: "g/cm³",
        min: 0.8,
        max: 2,
        step: 0.01,
        default: 1.35,
        help: "How compacted the soil is",
      },
      {
        key: "drainage_class",
        label: "Drainage class",
        unit: "1–5",
        min: 1,
        max: 5,
        step: 1,
        default: 3,
        help: "1 well drained to 5 poorly drained",
      },
      {
        key: "ssm_mean",
        label: "Surface soil moisture",
        unit: "%",
        min: 0,
        max: 60,
        step: 0.1,
        default: 31.5,
        help: "Average moisture in the top soil layer",
      },
      {
        key: "ssm_std",
        label: "Surface moisture variability",
        unit: "%",
        min: 0,
        max: 30,
        step: 0.1,
        default: 6.1,
        help: "How much top-layer moisture fluctuates",
      },
      {
        key: "rsm_mean",
        label: "Root-zone soil moisture",
        unit: "%",
        min: 0,
        max: 60,
        step: 0.1,
        default: 34.8,
        help: "Average moisture where roots draw water",
      },
      {
        key: "rsm_std",
        label: "Root-zone variability",
        unit: "%",
        min: 0,
        max: 30,
        step: 0.1,
        default: 4.3,
        help: "How much root-zone moisture fluctuates",
      },
    ],
  },
  {
    index: "05",
    title: "Remote sensing & radiation",
    unitHint: "index · W/m²",
    variables: [
      {
        key: "ndvi_mean",
        label: "NDVI mean",
        unit: "index",
        min: 0,
        max: 1,
        step: 0.01,
        default: 0.62,
        help: "Greenness of the canopy — 0 bare, 1 dense",
      },
      {
        key: "ndvi_std",
        label: "NDVI variability",
        unit: "index",
        min: 0,
        max: 0.5,
        step: 0.01,
        default: 0.11,
        help: "How uneven canopy greenness was",
      },
      {
        key: "fpar_mean",
        label: "FPAR mean",
        unit: "index",
        min: 0,
        max: 1,
        step: 0.01,
        default: 0.55,
        help: "Share of sunlight captured by leaves",
      },
      {
        key: "fpar_std",
        label: "FPAR variability",
        unit: "index",
        min: 0,
        max: 0.5,
        step: 0.01,
        default: 0.09,
        help: "How much light capture varied",
      },
      {
        key: "rad_mean",
        label: "Solar radiation mean",
        unit: "W/m²",
        min: 0,
        max: 1000,
        step: 1,
        default: 421,
        help: "Average sunlight energy reaching the field",
      },
      {
        key: "rad_std",
        label: "Radiation variability",
        unit: "W/m²",
        min: 0,
        max: 300,
        step: 1,
        default: 64,
        help: "How much sunlight varied over the season",
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
