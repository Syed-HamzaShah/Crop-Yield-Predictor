# Implementation Plan: Incrementally Add Remaining Countries with 1 GB File Size Guard

## Goal
Incrementally add data for the remaining countries (**USA (`US`)** and **Brazil (`BR`)**) one by one to `combined_yield_features.csv`. After each country is processed and merged, inspect the resulting CSV file size:
- If the file size exceeds **1 GB (1,073,741,824 bytes)**, immediately stop adding further countries.
- If the file size remains under 1 GB, proceed to the next country.

Follow the exact 64-feature season-aware spatio-temporal schema established in the existing dataset.

---

## Technical Context & Constraints

### 1. Data Volume & RAM Constraints
- **Current Dataset:** 41 countries, 111,122 rows, 51.5 MB on disk.
- **Remaining Countries:**
  - **Country 1: USA (`US`)**
    - `maize`: 61,703 yield records, ~2.0 GB raw meteo, ~894 MB soil moisture.
    - `wheat`: 49,602 yield records, ~2.0 GB raw meteo, ~885 MB soil moisture.
    - Expected added rows: ~111,305 rows (~51.5 MB addition $\rightarrow$ cumulative ~103 MB).
  - **Country 2: Brazil (`BR`)**
    - `wheat`: 39,265 yield records, ~3.0 GB raw meteo, ~1.3 GB soil moisture.
    - `maize`: 230,602 yield records, ~3.2 GB raw meteo, ~1.4 GB soil moisture.
    - Expected added rows: ~269,867 rows (~125 MB addition $\rightarrow$ cumulative ~228 MB).
- **Available RAM:** The machine has ~2.2 GB free physical RAM. Loading a 3.2 GB raw CSV directly into pandas will cause an Out Of Memory (OOM) crash.
- **Solution:** Implement a chunked streaming aggregator (`chunksize=1,000,000`) using running summary statistics (`count`, `sum`, `sum_sq`, `min`, `max`) per `(adm_id, harvest_year)`. This keeps peak memory under 400 MB while producing exact statistical parity with pandas' standard aggregation.

---

## User Review Required

> [!IMPORTANT]
> **Processing Sequence:**
> 1. **Step 1:** Process **USA (`US`)** across Maize and Wheat.
>    - Append to dataset.
>    - Save and check CSV size.
>    - If size $\ge$ 1 GB, stop. Otherwise, continue.
> 2. **Step 2:** Process **Brazil (`BR`)** across Wheat and Maize.
>    - Append to dataset.
>    - Save and check CSV size.
>    - If size $\ge$ 1 GB, stop.
> 
> Expected final cumulative size after both countries is ~228 MB, well below the 1 GB ceiling, meaning all available CY-Bench countries can be safely incorporated.

> [!NOTE]
> **Output Files Updated:**
> - `c:\Users\Hamza\Downloads\cybench-data\combined_yield_features.csv` (active workspace)
> - `C:\Users\Hamza\Desktop\YP\all_countries_yield_data\combined_yield_features.csv`
> - `C:\Users\Hamza\Desktop\YP\combined_yield_features_all_countries.csv`

---

## Proposed Changes

### ETL Pipeline Enhancement
#### [MODIFY] [combine_all_countries.py](file:///c:/Users/Hamza/Downloads/cybench-data/combine_all_countries.py)
- Refactor `aggregate_ts` to use chunked streaming aggregation for large time-series files (meteo, soil moisture, ndvi, fpar), safely bounding RAM to $< 400\text{ MB}$.
- Add an incremental country-by-country pipeline:
  1. Load existing base `combined_yield_features.csv`.
  2. For each country to add:
     - Process each crop for the country.
     - Append the new country rows to the combined dataset.
     - Deduplicate on `(crop, country, adm_id, harvest_year)`.
     - Save to CSV.
     - Check file size. If `size >= 1_073_741_824` bytes (1 GB), print alert and halt immediately.
     - Sync copies to Desktop destinations.

---

## Verification Plan

### Automated Verification
1. **File Size Check:** Measure and display file size after each country addition, asserting adherence to the $< 1\text{ GB}$ threshold.
2. **Schema Integrity:** Verify all 64 columns match the exact column names, order, and data types of the existing file.
3. **Primary Key Uniqueness:** Verify zero duplicate `(crop, country, adm_id, harvest_year)` combinations.
4. **Data Completeness & Completeness Check:** Verify that US (~111k rows) and BR (~270k rows) are fully represented with non-null spatial and calendar metadata.
