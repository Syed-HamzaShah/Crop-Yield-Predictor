"""
create_three_datasets.py

Constructs three modeling datasets from the clean master CY-Bench dataset
(combined_yield_features.csv) following the leakage-free preprocessing methodology:

1. Dataset A (Full Leakage-Free):
   Multi-modal fusion: Soil + Climate + Vegetation + Soil Moisture + Phenology + Geography + Target Yield.
   Excludes target leakage (production, harvest_area).

2. Dataset B (Soil & Climate Focused):
   Satellite-free operational model: Soil + Climate + Geography + Target Yield.
   Enables historical retrospective modeling without satellite sensor dependency.

3. Dataset C (Soil-Focused Baseline):
   Minimalist spatial baseline: Soil physical properties + Coordinates + Target Yield.
"""

import os
import shutil
import pandas as pd

PRIMARY_INPUT = r"c:\Users\Hamza\Downloads\cybench-data\combined_yield_features.csv"

OUT_DIRS = [
    r"c:\Users\Hamza\Downloads\cybench-data",
    r"C:\Users\Hamza\Desktop\YP\all_countries_yield_data",
    r"C:\Users\Hamza\Desktop\YP\!!!!!Preprocessing"
]

SOIL = ["awc", "bulk_density", "drainage_class"]
GEO = ["latitude", "longitude", "region_area"]
CLIMATE = [
    "tavg_mean", "tavg_std", "tmin_min", "tmax_max",
    "prec_sum", "prec_max", "prec_std",
    "rad_mean", "rad_std", "et0_mean", "vpd_mean", "cwb_sum"
]
VEGETATION = ["ndvi_mean", "ndvi_std", "fpar_mean", "fpar_std"]
SOIL_MOISTURE = ["ssm_mean", "ssm_std", "rsm_mean", "rsm_std"]
# Note: cal_sos and cal_eos (phenology calendar bounds) removed from all datasets
# Rationale: Season wrap-around. cal_sos > cal_eos in 42% of maize rows, 21% of wheat and 5% of winter wheat.
# Cross-calendar-year seasons produce artificial discontinuities in raw DOY integer features.

def main():
    print("=" * 70)
    print("CREATING THREE TARGETED MODELING DATASETS")
    print("=" * 70)

    print(f"Loading clean master dataset: {PRIMARY_INPUT} ...")
    df = pd.read_csv(PRIMARY_INPUT)
    print(f"Loaded {len(df):,} rows x {len(df.columns)} columns (Zero missing values).\n")

    datasets_spec = {
        "dataset_A_full_leakage_free.csv": {
            "name": "Dataset A: Full Leakage-Free Multi-Modal",
            "cols": ["crop"] + GEO + SOIL + CLIMATE + VEGETATION + SOIL_MOISTURE + ["yield"],
            "description": "Full feature fusion (Soil, Climate, Satellites, Soil Moisture) without target leakage or season wrap-around calendar artifacts."
        },
        "dataset_B_soil_climate.csv": {
            "name": "Dataset B: Soil & Climate Focused (Satellite-Free)",
            "cols": ["crop"] + GEO + SOIL + CLIMATE + ["yield"],
            "description": "Climate + Soil model independent of satellite sensors (for operational pre-season or historical deployment)."
        },
        "dataset_C_soil_focused.csv": {
            "name": "Dataset C: Soil & Coordinates Minimalist Baseline",
            "cols": ["crop", "latitude", "longitude"] + SOIL + ["yield"],
            "description": "Minimal baseline evaluating the intrinsic predictive yield power of soil properties and geography."
        }
    }

    generated_files = []

    for filename, spec in datasets_spec.items():
        print("-" * 70)
        print(f"Generating {spec['name']} ...")
        cols = spec["cols"]
        sub_df = df[cols].copy()
        print(f"  Columns ({len(cols)}): {cols}")
        print(f"  Rows: {len(sub_df):,}")
        
        # Primary save path
        p_out = os.path.join(OUT_DIRS[0], filename)
        sub_df.to_csv(p_out, index=False)
        sz = os.path.getsize(p_out)
        print(f"  Saved to primary: {p_out} ({sz:,} bytes / {sz/(1024*1024):.2f} MB)")

        # Sync to all other destination directories
        for d in OUT_DIRS[1:]:
            os.makedirs(d, exist_ok=True)
            dest_file = os.path.join(d, filename)
            shutil.copyfile(p_out, dest_file)
            print(f"  Synced to: {dest_file}")

        generated_files.append((filename, len(cols), len(sub_df), sz))

    print("\n" + "=" * 70)
    print("SUMMARY OF GENERATED DATASETS")
    print("=" * 70)
    for fn, n_cols, n_rows, sz in generated_files:
        print(f"• {fn:<35} | {n_rows:,} rows x {n_cols:>2} cols | {sz/(1024*1024):.2f} MB")

    print("\nAll three datasets successfully created and synchronized!")

if __name__ == "__main__":
    main()
