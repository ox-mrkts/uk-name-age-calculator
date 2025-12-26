# Data Sources for UK Name Age Calculator

This document provides instructions for downloading the required datasets from the Office for National Statistics (ONS).

## Required Data Files

### 1. Baby Names Data (England & Wales)

You need to download baby name statistics for both boys and girls from 1996-2024.

#### Option A: Historical Dataset (Recommended - Single Download)
**URL**: [Baby names in England and Wales: from 1996](https://www.ons.gov.uk/peoplepopulationandcommunity/birthsdeathsandmarriages/livebirths/datasets/babynamesinenglandandwalesfrom1996)

**Steps**:
1. Visit the URL above
2. Scroll down to find the most recent dataset (should be "2024" or latest year)
3. Download the Excel file (usually named something like "babynames1996to2024.xlsx")
4. Save it to `data/raw/` in this project directory
5. Rename it to `baby-names-historical.xlsx` for consistency

**File Structure**: The Excel file typically has separate sheets for:
- Boys' names by year
- Girls' names by year
- Each sheet contains columns: Rank, Name, Count, Year (or similar)

#### Option B: Separate Annual Files
If you prefer individual files:

**Boys Names**: https://www.ons.gov.uk/peoplepopulationandcommunity/birthsdeathsandmarriages/livebirths/datasets/babynamesenglandandwalesbabynamesstatisticsboys

**Girls Names**: https://www.ons.gov.uk/peoplepopulationandcommunity/birthsdeathsandmarriages/livebirths/datasets/babynamesenglandandwalesbabynamesstatisticsgirls

Download the Excel files and save them to `data/raw/` as:
- `baby-names-boys.xlsx`
- `baby-names-girls.xlsx`

### 2. Life Tables Data (England & Wales)

Life tables provide mortality rates and survival probabilities needed to estimate how many people from each birth year are still alive.

#### Primary Source
**URL**: [National life tables: England and Wales](https://www.ons.gov.uk/peoplepopulationandcommunity/birthsdeathsandmarriages/lifeexpectancies/datasets/nationallifetablesenglandandwalesreferencetables)

**Steps**:
1. Visit the URL above
2. Look for the most recent "National life tables" dataset
3. Download the Excel file (usually covers 1980-2023 or similar range)
4. Save it to `data/raw/life-tables.xlsx`

**What to look for**:
- You need the "lx" column (number of survivors at exact age x per 100,000 born)
- Data should cover birth cohorts from 1996-2024
- Separate tables for males and females

#### Alternative Source (If primary unavailable)
**URL**: [Single-year life tables: England and Wales](https://www.ons.gov.uk/peoplepopulationandcommunity/birthsdeathsandmarriages/lifeexpectancies/bulletins/pastandprojecteddatafromtheperiodandcohortlifetables/1981to2070)

## Directory Structure After Download

Your `data/raw/` directory should look like this:

```
data/
└── raw/
    ├── baby-names-historical.xlsx  (or separate boys/girls files)
    └── life-tables.xlsx
```

## Data Coverage

- **Geographic**: England & Wales only (Scotland and Northern Ireland have separate statistics)
- **Time Period**: 1996-2024 (ONS digital records begin in 1996)
- **Update Frequency**: ONS typically releases new baby name data annually in August/September

## Data Quality Notes

From ONS documentation:
- Records from 1996 onwards are based on actual birth registrations
- Very rare names (typically <3 occurrences) are excluded for privacy
- Variant spellings are treated as separate names (e.g., "Mohammed", "Muhammad", "Mohamed")

## Processing the Data

Once you've downloaded the files:

1. Verify the files are in `data/raw/`
2. Run the data processing script:
   ```bash
   npm run process-data
   ```

This will:
- Parse the Excel files
- Extract baby name counts by year and gender
- Extract survival probabilities from life tables
- Generate JSON files in `public/data/` for use by the web application

## Troubleshooting

**Problem**: Can't find the download link
- ONS occasionally reorganizes their website
- Search for "ONS baby names England Wales" or "ONS life tables" on their site
- The data should be freely available without registration

**Problem**: Excel file format is different than expected
- Check the `scripts/process-baby-names.js` and `scripts/process-life-tables.js` files
- You may need to adjust the sheet names or column references
- Open the Excel file to inspect its structure

**Problem**: Data doesn't go back to 1996
- Earlier years might be in a separate historical dataset
- Check the "Datasets related to Baby names" section on the ONS page

## Attribution

When using this data, please credit:
- **Office for National Statistics** (ONS)
- Dataset: "Baby names in England and Wales"
- Dataset: "National life tables, England and Wales"
- Licensed under the Open Government Licence v3.0

## Last Updated

This guide was created on 2025-12-26. If links are broken, visit:
- Main ONS site: https://www.ons.gov.uk/
- Search for: "baby names England Wales" and "life tables England Wales"
