# Day 1 Current Work Re-Audit: Supporting Both Sale and Rental Valuation

**Date:** 2026-09-29  
**Auditor:** Senior ML Engineer & Project Reviewer  
**Context:** Important Project Correction — Platform must properly support BOTH `For Sale` and `For Rent` property valuation.  

---

## 1. Executive Summary & Root Cause Analysis

A comprehensive re-audit of the Week 8 project was conducted following the instructor's explicit clarification:
> **"The instructor's requirements cover BOTH `purpose = For Sale` and `purpose = For Rent`. Do NOT interpret the instructor's use of 'sales' as meaning that the valuation task is restricted to For Sale properties. The property valuation platform must properly support both sale and rental valuation."**

In the previous exploratory pass, the project made an overly restrictive assumption: because rental prices (median ~PKR 45,000) and sale prices (median ~PKR 13,500,000) operate on fundamentally different orders of magnitude, the valuation pipeline filtered down exclusively to `For Sale` listings (126,666 rows), treating rental records merely as interim artifacts.

**The Correction:**  
Real estate clients use the AI platform for two distinct valuation queries:
1. **Capital Asset Valuation:** *"Mera ghar kitne ka bikega?"* $\rightarrow$ Predict fair market purchase price in PKR.
2. **Rental Yield Valuation:** *"Is flat ka mahana kiraya kitna hona chahiye?"* $\rightarrow$ Predict fair monthly rental rate in PKR.

Pooling these two targets into a single undifferentiated regression model would produce severe heteroscedasticity, massive relative error distortion, and incorrect valuation estimates. The correct machine learning architecture is a **dual-model routing architecture**, where incoming properties are routed by `purpose` to dedicated Sale or Rental valuation pipelines, sharing common spatial, structural, and amenity feature representations.

---

## 2. Re-Audit of Existing Repository Artifacts

| Component / File | Current Status | For-Sale-Only Assumption Identified | Required Action |
|---|---|---|---|
| `data/raw/Property.csv` | **COMPLETE & IMMUTABLE** | None. Raw file contains all 190,904 rows (126,722 Sale, 64,165 Rent, 17 missing purpose). | **KEEP UNTOUCHED**. Maintain raw provenance. |
| `data/raw/leads_raw.csv` | **COMPLETE** | None. 5,000 synthetic leads with 21.8% conversion rate. | **KEEP**. Meets all requirements. |
| `src/data/clean_properties.py` | **NEEDS UPDATE** | Applied PKR 50,000 price floor and returned only `df_sale` as processed modeling output. | **UPDATE**. Implement separate price floor for rent (PKR 1,000); output both `df_sale` (126,666) and `df_rent` (64,161), plus unified `df_clean` (190,827). |
| `src/features/property_features.py` | **NEEDS UPDATE** | Feature pipelines and splits were fitted only on the `df_sale` subset. | **UPDATE**. Support dual preprocessing pipelines (`purpose='sale'` and `purpose='rent'`) and stratified 70/15/15 splits across both purposes. |
| `src/utils/validation.py` | **NEEDS UPDATE** | Asserted only For Sale subset properties and sale price floor. | **UPDATE**. Add explicit assertions for rental records, rental price floor, and dual split integrity. |
| `run_day1_pipeline.py` | **NEEDS UPDATE** | Saved only sale processed subsets and split only sale records. | **UPDATE**. Generate canonical processed files for both Sale and Rent, split both, fit both pipelines. |
| `run_eda.py` | **NEEDS UPDATE** | Visualizations focused only on sale prices. | **UPDATE**. Include comparative sale vs rental distributions and rental price-per-marla metrics. |
| `reports/day1/cleaning_report.md` | **NEEDS UPDATE** | Documented cleaning actions only for sale properties. | **UPDATE**. Detail rental cleaning (investigation of low rents, PKR 1,000 floor, 64,161 rows). |
| `reports/day1/eda_insights.md` | **NEEDS UPDATE** | Insights discussed only sale prices. | **UPDATE**. Add rental yield and tenant demand insights. |
| `reports/day1/feature_engineering_report.md` | **NEEDS UPDATE** | Did not classify features as common, sale-specific, or rental-specific. | **UPDATE**. Classify all features across both valuation targets. |
| `reports/day1/leakage_report.md` | **NEEDS UPDATE** | Discussed leakage only in the context of sale price. | **UPDATE**. Document leakage safeguards for both sale price and rental price. |
| `docs/day1/dataset_a_documentation.md` | **NEEDS UPDATE** | Framed regression task as For Sale only. | **UPDATE**. Document both Sale and Rent cohorts, target statistics, and dual-model architecture. |
| `data/dictionaries/dataset_a_data_dictionary.csv` | **NEEDS UPDATE** | Stated `purpose` was for filtering only. | **UPDATE**. Clarify `purpose` is a routing key for dual valuation models. |
| `notebooks/day1/` (01 to 05) | **NEEDS UPDATE** | Notebooks 02, 04, and 05 assumed sale-only modeling. | **UPDATE**. Walk through data understanding, cleaning, EDA, feature engineering, and splitting for BOTH Sale and Rent. |
| `tests/test_day1_pipeline.py` | **NEEDS UPDATE** | Unit tests asserted sale prices only. | **UPDATE**. Add tests verifying rental price validation, rental splits, and dual pipeline fitting. |
| `README.md` | **NEEDS UPDATE** | Described valuation as sale-only. | **UPDATE**. Update project overview, dataset counts, and dual-model architecture. |
| `docs/day1/day1_completion_report.md` | **NEEDS UPDATE** | Final report referenced sale-only counts (126,666 rows). | **UPDATE**. Update with complete 190,827-row scope (126,666 Sale + 64,161 Rent). |

---

## 3. Scientific Justification for Dual-Model Architecture

| Architectural Strategy | Advantages | Fatal Flaws | Decision |
|---|---|---|---|
| **Approach 1: Single Pooled Model with `purpose` Dummy** | Single model to train and deploy. | **Scientifically Invalid.** Sale prices average ~PKR 25M; rental prices average ~PKR 90k. Residual errors in sale prices ($\pm \text{PKR } 2\text{M}$) completely dwarf the entire rental range ($10\text{k}\text{--}200\text{k}$ PKR). Severe heteroscedasticity corrupts gradient descent. | **REJECTED** |
| **Approach 2: Dual Dedicated Models with Router (Chosen)** | Mathematically sound; zero cross-target variance contamination; allows objective loss tuning (e.g. MAPE on rent, Huber on luxury sales); reflects real-world agency workflows. | Requires maintaining two estimators in Day 2. | **ACCEPTED & IMPLEMENTED** |

---

## 4. Corrected Data Volumes

- **Raw Property Dataset:** 190,904 listings (31 columns).
- **Interim Property Dataset:** 190,887 listings (17 missing purpose rows dropped; 14 empty Unnamed columns dropped).
- **Cleaned For Sale Subset:** 126,666 listings (price floor: PKR 50,000; 56 corrupt rows removed).
- **Cleaned For Rent Subset:** 64,161 listings (price floor: PKR 1,000; 4 corrupt rows removed).
- **Total Cleaned Property Dataset:** **190,827 listings** (44 columns).
- **Dataset B (Leads):** 5,000 records (21.8% conversion rate, 22 columns).
