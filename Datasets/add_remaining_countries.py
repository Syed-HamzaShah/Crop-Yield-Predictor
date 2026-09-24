"""
add_remaining_countries.py

Incrementally processes and adds remaining countries (US, BR) one by one to
combined_yield_features.csv with a 1 GB file size safeguard.

Uses memory-bounded chunked streaming aggregation for large time-series layers
to keep RAM usage strictly below 400 MB.
"""

import os
import sys
import time
import gc
import shutil
import numpy as np
import pandas as pd

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

DATA_ROOT = r"c:\Users\Hamza\Downloads\cybench-data"
PRIMARY_CSV = os.path.join(DATA_ROOT, "combined_yield_features.csv")
DESKTOP_DIR = r"C:\Users\Hamza\Desktop\YP\all_countries_yield_data"
DESKTOP_CSV = os.path.join(DESKTOP_DIR, "combined_yield_features.csv")
CONVENIENCE_CSV = r"C:\Users\Hamza\Desktop\YP\combined_yield_features_all_countries.csv"

MAX_FILE_SIZE_BYTES = 1024 * 1024 * 1024  # 1 GB = 1,073,741,824 bytes
CHUNK_SIZE = 1_000_000

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


def chunked_aggregate(fpath, cal, agg_spec, chunksize=CHUNK_SIZE):
    """
    Stream large time-series CSV in chunks, computing exact seasonal summary
    statistics per (adm_id, harvest_year) with bounded memory.
    """
    cols = [c for c in agg_spec.keys()]
    total_cnt = None
    total_sum = None
    total_sum_sq = None
    total_min = None
    total_max = None

    if not os.path.exists(fpath):
        return pd.DataFrame(columns=["adm_id", "harvest_year"])

    chunk_num = 0
    for chunk in pd.read_csv(fpath, chunksize=chunksize):
        chunk_num += 1
        req_cols = ["adm_id", "date"] + [c for c in cols if c in chunk.columns]
        chunk = chunk[req_cols]
        
        # Parse date to year and doy
        dt = pd.to_datetime(chunk["date"].astype(str), format="%Y%m%d")
        chunk["_year"] = dt.dt.year
        chunk["_doy"] = dt.dt.dayofyear
        
        # Season alignment via crop calendar
        chunk = chunk.merge(cal[["adm_id", "sos", "eos"]], on="adm_id", how="left").dropna(subset=["sos", "eos"])
        if len(chunk) == 0:
            continue
            
        normal = chunk["sos"] <= chunk["eos"]
        cross = ~normal
        
        # Normal season
        norm_df = chunk[normal & (chunk["_doy"] >= chunk["sos"]) & (chunk["_doy"] <= chunk["eos"])].copy()
        norm_df["harvest_year"] = norm_df["_year"]
        
        # Cross-year season
        cy_df = chunk[cross]
        cy_late = cy_df[cy_df["_doy"] >= cy_df["sos"]].copy()
        cy_late["harvest_year"] = cy_late["_year"] + 1
        cy_early = cy_df[cy_df["_doy"] <= cy_df["eos"]].copy()
        cy_early["harvest_year"] = cy_early["_year"]
        
        sub = pd.concat([norm_df, cy_late, cy_early], ignore_index=True)
        if len(sub) == 0:
            continue
            
        sub_cols = [c for c in cols if c in sub.columns]
        grp = sub.groupby(["adm_id", "harvest_year"])[sub_cols]
        c_cnt = grp.count()
        c_sum = grp.sum()
        c_min = grp.min()
        c_max = grp.max()
        
        sub_sq = sub[["adm_id", "harvest_year"] + sub_cols].copy()
        for c in sub_cols:
            sub_sq[c] = sub_sq[c] ** 2
        c_sum_sq = sub_sq.groupby(["adm_id", "harvest_year"])[sub_cols].sum()
        
        if total_cnt is None:
            total_cnt, total_sum, total_sum_sq, total_min, total_max = c_cnt, c_sum, c_sum_sq, c_min, c_max
        else:
            total_cnt = total_cnt.add(c_cnt, fill_value=0)
            total_sum = total_sum.add(c_sum, fill_value=0)
            total_sum_sq = total_sum_sq.add(c_sum_sq, fill_value=0)
            total_min = pd.concat([total_min, c_min]).groupby(level=["adm_id", "harvest_year"]).min()
            total_max = pd.concat([total_max, c_max]).groupby(level=["adm_id", "harvest_year"]).max()
            
    if total_cnt is None or len(total_cnt) == 0:
        return pd.DataFrame(columns=["adm_id", "harvest_year"])
        
    out_cols = {}
    for col, funcs in agg_spec.items():
        if col not in total_cnt.columns:
            continue
        c = total_cnt[col]
        s = total_sum[col]
        s2 = total_sum_sq[col]
        mn = total_min[col]
        mx = total_max[col]
        
        mean = s / c
        var = np.maximum(0.0, (s2 - (s**2) / c) / np.maximum(1, c - 1))
        std = np.sqrt(var)
        std[c <= 1] = np.nan
        
        for f in funcs:
            out_name = f"{col}_{f}"
            if f == "mean":
                out_cols[out_name] = mean
            elif f == "min":
                out_cols[out_name] = mn
            elif f == "max":
                out_cols[out_name] = mx
            elif f == "sum":
                out_cols[out_name] = s
            elif f == "std":
                out_cols[out_name] = std
                
    res = pd.DataFrame(out_cols).reset_index()
    return res


def process_crop_country(crop, country):
    """Process a single crop-country combination into a standardized DataFrame."""
    t0 = time.time()
    print(f"  -> [{crop.upper():<5} | {country}] Starting layer joins ...", flush=True)

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
    loc_cols = ["adm_id", "latitude", "longitude"]
    if "region_area" in loc.columns:
        loc_cols.append("region_area")
    loc = loc[loc_cols].drop_duplicates("adm_id")
    if "region_area" not in loc.columns:
        loc["region_area"] = np.nan

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

    # Time-series layers using memory-bounded chunked aggregation
    print(f"     * Aggregating Meteo ... ", end="", flush=True)
    tm0 = time.time()
    meteo_agg = chunked_aggregate(filepath(crop, country, "meteo"), cal, METEO_AGG)
    print(f"done ({time.time()-tm0:.1f}s, {len(meteo_agg):,} rows)")
    gc.collect()

    print(f"     * Aggregating NDVI ... ", end="", flush=True)
    tn0 = time.time()
    ndvi_agg = chunked_aggregate(filepath(crop, country, "ndvi"), cal, NDVI_AGG)
    print(f"done ({time.time()-tn0:.1f}s, {len(ndvi_agg):,} rows)")
    gc.collect()

    print(f"     * Aggregating FPAR ... ", end="", flush=True)
    tf0 = time.time()
    fpar_agg = chunked_aggregate(filepath(crop, country, "fpar"), cal, FPAR_AGG)
    print(f"done ({time.time()-tf0:.1f}s, {len(fpar_agg):,} rows)")
    gc.collect()

    print(f"     * Aggregating Soil Moisture ... ", end="", flush=True)
    ts0 = time.time()
    sm_agg = chunked_aggregate(filepath(crop, country, "soil_moisture"), cal, SM_AGG)
    print(f"done ({time.time()-ts0:.1f}s, {len(sm_agg):,} rows)")
    gc.collect()

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
    print(f"  -> Finished [{crop.upper():<5} | {country}] in {elapsed:.1f}s ({len(df):,} rows)\n")
    return df


def sync_copies(src_path):
    """Synchronize output CSV to desktop and convenience paths."""
    os.makedirs(DESKTOP_DIR, exist_ok=True)
    print(f"  Syncing to: {DESKTOP_CSV} ...")
    shutil.copyfile(src_path, DESKTOP_CSV)
    print(f"  Syncing to: {CONVENIENCE_CSV} ...")
    shutil.copyfile(src_path, CONVENIENCE_CSV)


def main():
    start_total = time.time()
    print("=" * 70)
    print("INCREMENTAL COUNTRY ADDITION WITH 1 GB FILE SIZE SAFEGUARD")
    print("=" * 70)

    # 1. Load existing combined dataset
    if not os.path.exists(PRIMARY_CSV):
        raise FileNotFoundError(f"Base file not found: {PRIMARY_CSV}")

    print(f"Loading base dataset: {PRIMARY_CSV} ...")
    combined = pd.read_csv(PRIMARY_CSV)
    init_rows = len(combined)
    init_size = os.path.getsize(PRIMARY_CSV)
    existing_countries = sorted(combined["country"].unique().tolist())
    print(f"Loaded {init_rows:,} rows across {len(existing_countries)} countries.")
    print(f"Current file size: {init_size:,} bytes ({init_size / (1024*1024):.2f} MB / {init_size / (1024**3):.4f} GB)")

    # 2. Identify remaining countries to add
    countries_to_add = ["US", "BR"]
    # Filter out any already present
    countries_to_add = [c for c in countries_to_add if c not in existing_countries]
    print(f"Countries to add one by one: {countries_to_add}")
    print(f"File size limit: {MAX_FILE_SIZE_BYTES:,} bytes (1.00 GB)\n")

    for c_idx, country in enumerate(countries_to_add, 1):
        print(f"\n{'=' * 70}")
        print(f"STEP {c_idx}/{len(countries_to_add)}: PROCESSING COUNTRY -> {country}")
        print(f"{'=' * 70}")
        
        country_dfs = []
        # Find which crops exist for this country
        crops_available = []
        for crop in ["maize", "wheat"]:
            c_dir = os.path.join(DATA_ROOT, crop, country)
            if os.path.isdir(c_dir):
                crops_available.append(crop)
                
        print(f"Available crops for {country}: {crops_available}")
        for crop in crops_available:
            df_crop = process_crop_country(crop, country)
            country_dfs.append(df_crop)

        if not country_dfs:
            print(f"No data found for {country}, skipping.")
            continue

        country_combined = pd.concat(country_dfs, ignore_index=True)
        country_rows = len(country_combined)
        print(f"Successfully processed {country}: {country_rows:,} total rows across crops {crops_available}")

        # Merge with master combined dataset
        print(f"Appending {country} ({country_rows:,} rows) to existing dataset ({len(combined):,} rows) ...")
        combined = pd.concat([combined, country_combined], ignore_index=True)
        combined["harvest_year"] = combined["harvest_year"].astype(int)

        # Deduplicate on primary keys
        key_cols = ["crop", "country", "adm_id", "harvest_year"]
        dupes = combined.duplicated(subset=key_cols).sum()
        if dupes > 0:
            print(f"Dropping {dupes:,} duplicate key rows...")
            combined = combined.drop_duplicates(subset=key_cols, keep="first")

        # Save updated CSV to primary location
        print(f"Writing updated dataset to: {PRIMARY_CSV} ...")
        combined.to_csv(PRIMARY_CSV, index=False)

        # Check file size against 1 GB guard
        curr_size = os.path.getsize(PRIMARY_CSV)
        curr_mb = curr_size / (1024 * 1024)
        curr_gb = curr_size / (1024 ** 3)
        pct_limit = (curr_size / MAX_FILE_SIZE_BYTES) * 100

        print(f"\n{'-' * 60}")
        print(f"FILE SIZE STATUS AFTER ADDING {country}:")
        print(f"  Rows count     : {len(combined):,} (+{country_rows:,})")
        print(f"  File size      : {curr_size:,} bytes ({curr_mb:.2f} MB / {curr_gb:.4f} GB)")
        print(f"  Threshold limit: {MAX_FILE_SIZE_BYTES:,} bytes (1.00 GB)")
        print(f"  Capacity used  : {pct_limit:.2f}%")
        print(f"{'-' * 60}")

        # Synchronize copies
        sync_copies(PRIMARY_CSV)

        if curr_size >= MAX_FILE_SIZE_BYTES:
            print("\n" + "!" * 70)
            print(f"WARNING: File size has exceeded the 1 GB ceiling ({curr_size:,} >= {MAX_FILE_SIZE_BYTES:,})!")
            print(f"Stopping country addition as requested.")
            print("!" * 70 + "\n")
            break
        else:
            print(f"-> File size is well within the 1 GB limit. Safe to proceed.\n")

    total_time = time.time() - start_total
    print("\n" + "=" * 70)
    print("FINAL SUMMARY OF UPDATED DATASET")
    print("=" * 70)
    print(f"Total processing time: {total_time:.1f}s ({total_time/60:.2f} minutes)")
    print(f"Final Primary CSV    : {PRIMARY_CSV}")
    print(f"Final File Size      : {os.path.getsize(PRIMARY_CSV):,} bytes ({os.path.getsize(PRIMARY_CSV)/(1024*1024):.2f} MB)")
    print(f"Total rows           : {len(combined):,} (started with {init_rows:,})")
    print(f"Total columns        : {len(combined.columns)}")
    print(f"Total unique countries: {combined['country'].nunique()}")
    print(f"Countries list       : {sorted(combined['country'].unique().tolist())}")
    print(f"Unique crops         : {combined['crop'].unique().tolist()}")
    print(f"Harvest years range  : {combined['harvest_year'].min()} - {combined['harvest_year'].max()}")
    print("\nTop 15 Countries by Row Count:")
    print(combined.groupby("country").size().sort_values(ascending=False).head(15).to_string())
    print("\nMissing values top 10 columns (%):")
    print((combined.isnull().mean() * 100).sort_values(ascending=False).head(10).round(2).to_string())
    print("\nPipeline completed successfully.")


if __name__ == "__main__":
    main()
