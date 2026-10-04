# Week 8 Day 1 Completion & Sign-Off Report (Supporting Sale & Rent)

**Project:** AI Property Valuation & Lead Scoring Platform for Real Estate  
**Stage:** Week 8 Day 1 — Data Understanding, Cleaning, EDA, Feature Engineering & Preprocessing  
**Author:** Senior Machine Learning Engineer & Project Reviewer  
**Date:** 2026-09-29  
**Status:** **100% COMPLETE & VERIFIED**  

---

## 1. Executive Summary

Week 8 Day 1 has been completed in full compliance with the instructor's requirements, specifically supporting **BOTH `purpose = For Sale` (Capital Purchase Price) and `purpose = For Rent` (Monthly Rental Price)** valuation models, alongside the **Lead Scoring (Classification)** platform.

Both datasets have been collected, cleaned, documented in standardized data dictionaries, visually analyzed with 17 high-resolution charts and business insights, engineered with domain-justified features, audited against target leakage, and assembled into Scikit-learn preprocessing pipelines with purpose-stratified 70/15/15 splits.

Every requirement was validated through:
- Automated end-to-end pipeline execution (`python run_day1_pipeline.py` $\rightarrow$ **44/44 checks passed**).
- Automated pytest unit test suite (`pytest tests/test_day1_pipeline.py -v` $\rightarrow$ **25/25 unit tests passed**).

---

## 2. Task-by-Task Implementation Summary

### Task 1 — Data Collection & Documentation
- **Status:** **COMPLETE**
- **Files Created / Updated:**
  - `data/raw/Property.csv` (190,904 rows × 31 cols, immutable raw source)
  - `data/raw/leads_raw.csv` (5,000 rows × 16 cols, synthetic leads)
  - `docs/day1/dataset_a_documentation.md` (complete specification, provenances, issues, dual-model architecture)
  - `docs/day1/dataset_b_documentation.md` (generation formulation, logistic model parameters)
  - `docs/day1/dataset_a_column_plan.csv` (44-column action registry)
  - `data/dictionaries/dataset_a_data_dictionary.csv` (all 44 columns with types, units, sources, issues)
  - `data/dictionaries/dataset_b_data_dictionary.csv` (all 22 columns with definitions and roles)
- **Key Implementation Details:**
  - Sourced full 190,904-row Zameen dataset. Generated 5,000 leads with a realistic 21.8% conversion rate.
  - Documented strict provenance: *Original* (Kaggle), *Derived* (rule/math), and *Synthetic* (domain-augmented).
  - Established `purpose` as the central architectural router key separating Sale and Rental valuation pipelines.

### Task 2 — Data Cleaning
- **Status:** **COMPLETE**
- **Files Created / Updated:**
  - `src/data/load_data.py` (safe raw loader with integrity assertions)
  - `src/data/clean_properties.py` (purpose-aware cleaning pipeline)
  - `src/data/clean_leads.py` (leads validation pipeline)
  - `data/interim/properties_interim.csv` (190,887 rows × 22 cols; both Sale and Rent preserved)
  - `data/processed/properties_clean.csv` (190,827 rows: 126,666 Sale + 64,161 Rent)
  - `data/processed/properties_sale_clean.csv` (126,666 For Sale listings $\ge 50,000$ PKR)
  - `data/processed/properties_rent_clean.csv` (64,161 For Rent listings $\ge 1,000$ PKR)
  - `data/processed/leads_clean.csv` (5,000 validated leads)
  - `reports/day1/cleaning_report.md` (detailed before/after audit table for Sale and Rent)
- **Key Decisions Made:**
  1. *Empty Columns:* 14 empty `Unnamed: 17` to `Unnamed: 30` columns dropped from interim/processed. Raw file untouched.
  2. *Area Normalization:* Regex extracted numeric values and converted `Kanal` to `Marla` ($1\text{ Kanal} = 20\text{ Marla}$). Original text `area` preserved.
  3. *Residential Bedroom/Bath Imputation:* 24,213 residential zero bedrooms and 47,817 residential zero bathrooms treated as unreported data and imputed with median of `(property_type, city)` groups across both Sale and Rent.
  4. *Purpose-Specific Price Validation:*
     - **For Sale:** Price floor of PKR 50,000 enforced (removed 56 corrupt test records: 0, 1, 4, etc.).
     - **For Rent:** Price floor of PKR 1,000 enforced (removed 4 corrupt test records: 0, 27, 40, 54 PKR). Legitimate hostel rooms (PKR 3,000–8,000) fully preserved.
  5. *Coordinate Bounds:* 10 coordinate pairs outside Pakistan bounding box flagged and set to `NaN`.

### Task 3 — Exploratory Data Analysis (EDA)
- **Status:** **COMPLETE**
- **Files Created / Updated:**
  - `run_eda.py` (automated visualization script using Matplotlib and Seaborn)
  - 17 saved PNG figures in `reports/figures/day1/` (`A1` to `A10`, `B1` to `B7`)
  - `reports/day1/eda_insights.md` (every chart paired with a business-actionable insight)
- **Key Business Insights:**
  - *Target Scale Divergence:* Sale prices (median PKR 13.5M) and rental prices (median PKR 45k) differ by ~300×, proving that pooling them into one model is scientifically unsound.
  - *Log-Normality:* $\log_{10}(\text{price})$ yields symmetric Gaussian distributions for both Sale and Rental prices, making log-scale regression mandatory.
  - *Locality Dispersion:* Society within a city matters more than the city itself; premium societies (DHA Phase 6, F-7) command 3× to 5× higher price per Marla than outer zones.
  - *Lead Conversion Driver:* On-site property visits yield a 51.4% conversion rate vs 3.6% without visits (+47.8pp lift).

### Task 4 — Feature Engineering
- **Status:** **COMPLETE**
- **Files Created / Updated:**
  - `src/features/property_features.py` (15 synthetic features + derived ratios, society tiers, temporal quarters)
  - `src/features/lead_features.py` (6 behavioral lead scoring features)
  - `reports/day1/feature_engineering_report.md` (classification into common, sale-specific, and rental-specific)
  - `reports/day1/leakage_report.md` (quarantine rules & leakage verification)
- **Features Created & Classified:**
  - *Common Features:* `area_marla`, `property_age_years`, `property_age_bucket`, `floors`, `covered_area_sqft`, 6 binary amenities, `amenity_score` (0–6), transit distances, `bed_bath_ratio`, `covered_area_ratio`, `society_tier` (`Premium`, `Mid`, `Budget`), `listing_season`.
  - *Sale-Specific Lift:* `corner` and `park_facing` (stronger capital appreciation premium).
  - *Rental-Specific Context:* Portions and Flats comprise 59% of rental inventory (vs 31% of sales); amenity score is essential for tenant qualification.
  - *Lead Scoring:* `engagement_score` (0–12 index), `avg_call_duration_min`, `response_speed_category`, `lead_age_bucket`, `follow_up_intensity`, `budget_match_ratio`.
- **Target Leakage Safeguard:**
  - `price_per_marla` directly includes the target `price`. It is quarantined strictly to EDA and explicitly excluded from all ML estimator feature sets.
  - Identifiers (`property_id`, `page_url`, `lead_id`) are excluded from model training.

### Task 5 — Encoding, Scaling & Splitting
- **Status:** **COMPLETE**
- **Files Created / Updated:**
  - Split CSVs in `data/processed/` (`prop_train.csv`, `prop_val.csv`, `prop_test.csv`, `prop_sale_train.csv`, `prop_sale_val.csv`, `prop_sale_test.csv`, `prop_rent_train.csv`, `prop_rent_val.csv`, `prop_rent_test.csv`, `lead_train.csv`, `lead_val.csv`, `lead_test.csv`)
  - `build_property_pipeline(purpose="sale")` and `build_property_pipeline(purpose="rent")` in `src/features/property_features.py`
  - `build_lead_pipeline()` in `src/features/lead_features.py`
- **Key Implementation Details:**
  - *Splitting:* Evaluated 70/15/15 splits; zero overlapping indices confirmed. Property split is stratified on `purpose` (66.4% Sale / 33.6% Rent preserved across all folds). Lead split is stratified on `converted`.
  - *Locality Encoding Comparison:* Compared One-Hot Encoding (~1,536 sparse columns) against Frequency Encoding and Target Encoding (5-fold out-of-fold cross-validation on log price). Both Frequency and Target encodings are fitted **exclusively on the training split**.
  - *Scaling:* `RobustScaler` applied to skewed property features; `StandardScaler` applied to lead features.

### Reproducible Notebooks & Testing
- **Status:** **COMPLETE**
- **Notebooks Generated:**
  - `notebooks/day1/01_data_understanding.ipynb`
  - `notebooks/day1/02_data_cleaning.ipynb`
  - `notebooks/day1/03_eda.ipynb`
  - `notebooks/day1/04_feature_engineering.ipynb`
  - `notebooks/day1/05_preprocessing_split.ipynb`
- **Automated Test Suite:**
  - `tests/test_day1_pipeline.py` (25 unit tests across cleaning, augmentation, leakage, splitting, and pipeline fitting).

---

## 3. Verification & Validation Results

| Test / Check Group | Count | Status | Notes |
|---|---|---|---|
| Master Pipeline Automated Checks (`run_day1_pipeline.py`) | 44 checks | **44 / 44 PASSED** | All raw, interim, processed, split, and pipeline assertions passed. |
| Pytest Unit Test Suite (`tests/test_day1_pipeline.py`) | 25 tests | **25 / 25 PASSED** | Verified in 32.41s across Sale and Rental datasets. |
| EDA Figures Generated (`reports/figures/day1/`) | 17 charts | **17 / 17 GENERATED** | 10 Property plots (covering Sale and Rent) + 7 Lead plots. |
| Jupyter Notebooks (`notebooks/day1/`) | 5 notebooks | **5 / 5 GENERATED** | Valid JSON schema notebooks covering all Day 1 stages for Sale & Rent. |

---

## 4. Final Dataset Shapes & Target Distributions

| Dataset Split | Rows | Columns | Purpose Breakdown | Target Median / Distribution |
|---|---|---|---|---|
| **Dataset A — Raw (`Property.csv`)** | 190,904 | 31 | Sale: 126,722 / Rent: 64,165 / Null: 17 | Mixed targets |
| **Dataset A — Interim (`properties_interim.csv`)** | 190,887 | 22 | Sale: 126,722 / Rent: 64,165 | Unnamed dropped; purpose cleaned |
| **Dataset A — Processed (`properties_clean.csv`)** | 190,827 | 44 | Sale: 126,666 / Rent: 64,161 | Fully enriched & cleaned |
| **Dataset A — For Sale (`properties_sale_clean.csv`)** | 126,666 | 44 | 100% For Sale | Median PKR 13,500,000 |
| **Dataset A — For Rent (`properties_rent_clean.csv`)** | 64,161 | 44 | 100% For Rent | Median PKR 45,000 |
| **Dataset A — Train (`prop_train.csv`)** | 133,578 | 46 | Sale: 88,665 / Rent: 44,913 (66.4% Sale) | Zero overlap |
| **Dataset A — Validation (`prop_val.csv`)** | 28,624 | 46 | Sale: 19,000 / Rent: 9,624 (66.4% Sale) | Zero overlap |
| **Dataset A — Test (`prop_test.csv`)** | 28,625 | 46 | Sale: 19,001 / Rent: 9,624 (66.4% Sale) | Zero overlap |
| **Dataset B — Raw (`leads_raw.csv`)** | 5,000 | 16 | N/A | Converted: 1,090 (21.8%) |
| **Dataset B — Processed (`leads_clean.csv`)** | 5,000 | 22 | N/A | Converted: 1,090 (21.8%) |
| **Dataset B — Train (`lead_train.csv`)** | 3,500 | 23 | N/A | Converted: 763 (21.8% - Stratified) |
| **Dataset B — Validation (`lead_val.csv`)** | 750 | 23 | N/A | Converted: 164 (21.9% - Stratified) |
| **Dataset B — Test (`lead_test.csv`)** | 750 | 23 | N/A | Converted: 163 (21.7% - Stratified) |

---

## 5. Remaining Limitations & Day 2 Readiness

1. **Synthetic Feature Assumptions:** 15 features in Dataset A (e.g. age, amenities, distances) are synthetic augmentations generated using domain-calibrated distributions. While realistic, they reflect synthetic assumptions rather than surveyor inspections.
2. **Synthetic Lead Data:** Dataset B is synthetic. Real CRM logs from Week 7 voice agents should replace this simulator in future production releases.
3. **Date Format Heterogeneity:** ~48% of raw `date_added` strings in Kaggle could not be parsed via simple datetime parsers due to mixed date separators; temporal features for those records contain NaNs.
4. **Class Imbalance in Day 3:** With a 21.8% positive rate, naive accuracy will be a deceptive metric for lead scoring. Day 3 must benchmark SMOTE, class weights, and precision-recall threshold tuning.

---

## 6. Day 1 Requirements Verdict

| Requirement Area | Status |
|---|---|
| **Task 1 — Data Collection & Documentation** | **COMPLETE** |
| **Task 2 — Data Cleaning (Sale & Rent)** | **COMPLETE** |
| **Task 3 — Exploratory Data Analysis (EDA)** | **COMPLETE** |
| **Task 4 — Feature Engineering** | **COMPLETE** |
| **Task 5 — Encoding, Scaling & Splitting** | **COMPLETE** |
| **Jupyter Notebooks (5 notebooks)** | **COMPLETE** |
| **Automated Testing & QA (Pytest)** | **COMPLETE** |
| **Documentation & Reports** | **COMPLETE** |

**Final Verdict:** Week 8 Day 1 is **FULLY COMPLETE & VERIFIED** across both For Sale and For Rent property valuations. The repository is clean, leak-free, tested, and ready for Day 2.
