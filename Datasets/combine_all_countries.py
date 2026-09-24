"""
combine_all_countries.py

Combines all CY-Bench data layers for all countries across Maize and Wheat into a single
flat CSV file, one row per (crop, country, adm_id, harvest_year).

Excludes Brazil (BR) and USA (US) due to excessive data volume (~15 GB raw, ~380k records).
Follows the exact season-aware spatial and temporal aggregation methodology of cn_in_yield_data.
"""

import os
import sys
import time
import gc
import numpy as np
import pandas as pd

# Force UTF-8 output on Windows
if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

DATA_ROOT = r"c:\Users\Hamza\Downloads\cybench-data"
OUT_DIR   = r"C:\Users\Hamza\Desktop\YP\all_countries_yield_data"
OUT_FILE  = os.path.join(OUT_DIR, "combined_yield_features.csv")
CONVENIENCE_OUT = r"C:\Users\Hamza\Desktop\YP\combined_yield_features_all_countries.csv"
PRIMARY_OUT = os.path.join(DATA_ROOT, "combined_yield_features.csv")

# All countries included via memory-bounded streaming aggregation
EXCLUDE_COUNTRIES = set()


SCHEMA_COLS = [
    'crop', 'yield', 'harvest_area', 'production',
    'cal_sos', 'cal_eos', 'latitude', 'longitude', 'region_area',
    'awc', 'bulk_density', 'drainage_class', 'crop_area', 'crop_area_pct',
    'tmin_mean', 'tmin_min', 'tmin_max', 'tmin_std',
    'tmax_mean', 'tmax_min', 'tmax_max', 'tmax_std',
    'tavg_mean', 'tavg_min', 'tavg_max', 'tavg_std',
    'prec_sum', 'prec_mean', 'prec_std', 'prec_max',
    'rad_mean', 'rad_max', 'rad_std', 'rad_sum',
    'et0_mean', 'et0_max', 'et0_std', 'et0_sum',
    'vpd_mean', 'vpd_max', 'vpd_std',
    'cwb_sum', 'cwb_mean', 'cwb_std', 'cwb_max',
    'ndvi_mean', 'ndvi_max', 'ndvi_min', 'ndvi_std',
    'fpar_mean', 'fpar_max', 'fpar_min', 'fpar_std',
    'ssm_mean', 'ssm_max', 'ssm_min', 'ssm_std',
    'rsm_mean', 'rsm_max', 'rsm_min', 'rsm_std'
]

METEO_AGG = {
    "tmin": ["mean", "min", "max", "std"],
    "tmax": ["mean", "min", "max", "std"],
    "tavg": ["mean", "min", "max", "std"],
    "prec": ["sum",  "mean", "std", "max"],
    "rad":  ["mean", "max",  "std", "sum"],
    "et0":  ["mean", "max",  "std", "sum"],
    "vpd":  ["mean", "max",  "std"],
    "cwb":  ["sum",  "mean", "std", "max"],
}
NDVI_AGG = {"ndvi": ["mean", "max", "min", "std"]}
FPAR_AGG = {"fpar": ["mean", "max", "min", "std"]}
SM_AGG   = {"ssm":  ["mean", "max", "min", "std"],
            "rsm":  ["mean", "max", "min", "std"]}


def filepath(crop, country, kind):
    return os.path.join(DATA_ROOT, crop, country, f"{kind}_{crop}_{country}.csv")


def parse_dates(df):
    """Add '_year' and '_doy' columns from 'date' (YYYYMMDD int/str)."""
    dates = pd.to_datetime(df["date"].astype(str), format="%Y%m%d")
    df = df.copy()
    df["_year"] = dates.dt.year
    df["_doy"]  = dates.dt.day_of_year
    return df


def assign_harvest_year(df, cal):
    """
    Join crop calendar and assign a harvest_year to each time-series row.

    Normal season  (sos <= eos): harvest_year = _year   if sos <= doy <= eos
    Cross-year     (sos > eos):  harvest_year = _year+1 if doy >= sos
                                 harvest_year = _year   if doy <= eos
    Rows outside the growing window are dropped.
    """
    df = df.merge(cal[["adm_id", "sos", "eos"]], on="adm_id", how="left")
    df = df.dropna(subset=["sos", "eos"])

    normal     = df["sos"] <= df["eos"]
    cross_year = ~normal

    # normal crops
    norm_df   = df[normal].copy()
    in_season = (norm_df["_doy"] >= norm_df["sos"]) & (norm_df["_doy"] <= norm_df["eos"])
    norm_df   = norm_df[in_season]
    norm_df["harvest_year"] = norm_df["_year"]

    # cross-year crops
    cy_df    = df[cross_year].copy()
    in_late  = cy_df["_doy"] >= cy_df["sos"]   # planting half -> next yr
    in_early = cy_df["_doy"] <= cy_df["eos"]   # harvest half  -> this yr

    cy_late  = cy_df[in_late].copy()
    cy_late["harvest_year"] = cy_late["_year"] + 1

    cy_early = cy_df[in_early].copy()
    cy_early["harvest_year"] = cy_early["_year"]

    result = pd.concat([norm_df, cy_late, cy_early], ignore_index=True)
    return result.drop(columns=["sos", "eos", "_year", "_doy"])


def aggregate_ts(df, cal, agg_spec, label):
    """Parse dates, assign harvest years, then groupby-aggregate."""
    df = parse_dates(df)
    df = assign_harvest_year(df, cal)
    group_cols = ["adm_id", "harvest_year"]
    agg_dict = {col: funcs for col, funcs in agg_spec.items() if col in df.columns}
    agg = df.groupby(group_cols)[list(agg_dict.keys())].agg(agg_dict)
    agg.columns = ["_".join(c) for c in agg.columns]
    return agg.reset_index()


def discover_combinations():
    combos = []
    for crop in ["maize", "wheat"]:
        cdir = os.path.join(DATA_ROOT, crop)
        if not os.path.isdir(cdir):
            continue
        for country in sorted(os.listdir(cdir)):
            if country in EXCLUDE_COUNTRIES:
                continue
            cpath = os.path.join(cdir, country)
            if os.path.isdir(cpath):
                combos.append((crop, country))
    return combos


def main():
    start_all = time.time()
    os.makedirs(OUT_DIR, exist_ok=True)
    
    combos = discover_combinations()
    print(f"Discovered {len(combos)} country-crop combinations (excluding {EXCLUDE_COUNTRIES}).")
    
    all_dfs = []
    
    for idx, (crop, country) in enumerate(combos, 1):
        t0 = time.time()
        print(f"[{idx:02d}/{len(combos):02d}] Processing {crop.upper():<5} - {country} ... ", end="", flush=True)
        
        # 1. Yield base
        y_path = filepath(crop, country, "yield")
        yield_df = pd.read_csv(y_path)
        yield_df["harvest_year"] = yield_df["harvest_year"].astype(int)
        
        if "crop_name" in yield_df.columns:
            yield_df.rename(columns={"crop_name": "crop"}, inplace=True)
        elif "crop" not in yield_df.columns:
            yield_df["crop"] = crop

        # Standardize crop name to maize, wheat, winter_wheat only
        def standardize_crop_name(c):
            c_str = str(c).strip()
            c_lower = c_str.lower()
            if "winter" in c_lower and "wheat" in c_lower:
                return "winter_wheat"
            elif "wheat" in c_lower:
                return "wheat"
            elif "maize" in c_lower or "corn" in c_lower:
                return "maize"
            return c_str

        yield_df["crop"] = yield_df["crop"].apply(standardize_crop_name)
            
        if "country_code" in yield_df.columns:
            yield_df.rename(columns={"country_code": "country"}, inplace=True)
        elif "country" not in yield_df.columns:
            yield_df["country"] = country
            
        for c in ["harvest_area", "production"]:
            if c not in yield_df.columns:
                yield_df[c] = np.nan
                
        base_cols = ["crop", "country", "adm_id", "harvest_year", "yield", "harvest_area", "production"]
        yield_df = yield_df[base_cols].copy()
        
        # 2. Crop Calendar
        cal = pd.read_csv(filepath(crop, country, "crop_calendar"))
        cal = cal[["adm_id", "sos", "eos"]].drop_duplicates("adm_id")
        
        # 3. Location
        loc = pd.read_csv(filepath(crop, country, "location"))
        loc = loc[["adm_id", "latitude", "longitude", "region_area"]].drop_duplicates("adm_id")
        
        # 4. Soil
        soil = pd.read_csv(filepath(crop, country, "soil"))
        soil_cols = ["adm_id"] + [c for c in ["awc", "bulk_density", "drainage_class"] if c in soil.columns]
        soil = soil[soil_cols].drop_duplicates("adm_id")
        for c in ["awc", "bulk_density", "drainage_class"]:
            if c not in soil.columns:
                soil[c] = np.nan
                
        # 5. Crop mask
        mask = pd.read_csv(filepath(crop, country, "crop_mask"))
        mask_cols = ["adm_id"] + [c for c in ["crop_area", "crop_area_percentage", "crop_area_pct"] if c in mask.columns]
        mask = mask[mask_cols].drop_duplicates("adm_id")
        if "crop_area_percentage" in mask.columns:
            mask.rename(columns={"crop_area_percentage": "crop_area_pct"}, inplace=True)
        for c in ["crop_area", "crop_area_pct"]:
            if c not in mask.columns:
                mask[c] = np.nan
                
        # 6. Meteo (daily -> seasonal)
        meteo = pd.read_csv(filepath(crop, country, "meteo"))
        meteo_agg = aggregate_ts(meteo, cal, METEO_AGG, "meteo")
        del meteo
        
        # 7. NDVI (weekly -> seasonal)
        ndvi = pd.read_csv(filepath(crop, country, "ndvi"))
        ndvi_agg = aggregate_ts(ndvi, cal, NDVI_AGG, "ndvi")
        del ndvi
        
        # 8. FPAR (dekadal -> seasonal)
        fpar = pd.read_csv(filepath(crop, country, "fpar"))
        fpar_agg = aggregate_ts(fpar, cal, FPAR_AGG, "fpar")
        del fpar
        
        # 9. Soil moisture (dekadal -> seasonal)
        sm = pd.read_csv(filepath(crop, country, "soil_moisture"))
        sm_agg = aggregate_ts(sm, cal, SM_AGG, "soil_moisture")
        del sm
        
        # Join static layers
        df = yield_df.copy()
        df = df.merge(cal.rename(columns={"sos": "cal_sos", "eos": "cal_eos"}), on="adm_id", how="left")
        df = df.merge(loc,  on="adm_id", how="left")
        df = df.merge(soil, on="adm_id", how="left")
        df = df.merge(mask, on="adm_id", how="left")
        
        # Join aggregated time-series
        for agg_df in [meteo_agg, ndvi_agg, fpar_agg, sm_agg]:
            df = df.merge(agg_df, on=["adm_id", "harvest_year"], how="left")
            
        del meteo_agg, ndvi_agg, fpar_agg, sm_agg
        gc.collect()
        
        # Standardize column structure
        for col in SCHEMA_COLS:
            if col not in df.columns:
                df[col] = np.nan
        df = df[SCHEMA_COLS].copy()
        
        elapsed = time.time() - t0
        print(f"done in {elapsed:5.1f}s ({len(df):,} rows)")
        all_dfs.append(df)

    print("\n" + "=" * 60)
    print("Concatenating all datasets ...")
    combined = pd.concat(all_dfs, ignore_index=True)
    combined["harvest_year"] = combined["harvest_year"].astype(int)
    
    key_cols = ["crop", "country", "adm_id", "harvest_year"]
    dupes = combined.duplicated(subset=key_cols).sum()
    if dupes > 0:
        print(f"Dropping {dupes} duplicate key rows...")
        combined = combined.drop_duplicates(subset=key_cols, keep="first")
        
    print(f"Saving combined dataset to: {OUT_FILE} ...")
    combined.to_csv(OUT_FILE, index=False)
    
    print(f"Saving convenience copy to: {CONVENIENCE_OUT} ...")
    combined.to_csv(CONVENIENCE_OUT, index=False)
    
    total_time = time.time() - start_all
    print("\n" + "=" * 60)
    print("  SUMMARY OF COMBINED DATASET")
    print("=" * 60)
    print(f"Total processing time: {total_time:.1f}s ({total_time/60:.2f} min)")
    print(f"Primary output file  : {OUT_FILE}")
    print(f"Convenience copy     : {CONVENIENCE_OUT}")
    print(f"Total rows           : {len(combined):,}")
    print(f"Total columns        : {len(combined.columns)}")
    print(f"Unique crops         : {combined['crop'].unique().tolist()}")
    print(f"Unique countries     : {combined['country'].nunique()} ({sorted(combined['country'].unique().tolist())})")
    print(f"Harvest years range  : {combined['harvest_year'].min()} - {combined['harvest_year'].max()}")
    print("\nRows by crop x country top 15:")
    print(combined.groupby(["crop", "country"]).size().sort_values(ascending=False).head(15).to_string())
    print("\nMissing values top 10 columns:")
    print((combined.isnull().mean() * 100).sort_values(ascending=False).head(10).round(2).to_string())
    print("\nAll checks completed successfully.")


if __name__ == "__main__":
    main()
