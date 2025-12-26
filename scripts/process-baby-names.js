const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Configuration
const RAW_DATA_DIR = path.join(__dirname, '../data/raw');
const OUTPUT_DIR = path.join(__dirname, '../public/data');
const MIN_TOTAL_OCCURRENCES = 50; // Filter out very rare names

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Process baby names from Excel file
 * @param {string} filePath - Path to Excel file
 * @param {string} gender - 'boys' or 'girls'
 * @returns {Object} - Name data by year: { "Oliver": { "1996": 4532, ... }, ... }
 */
function processBabyNamesFile(filePath, gender) {
  console.log(`\nProcessing ${gender} names from: ${filePath}`);

  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    console.log(`Please download the data file and place it in data/raw/`);
    return null;
  }

  const workbook = XLSX.readFile(filePath);
  const nameData = {};

  // Try to find the data sheet (common sheet names in ONS files)
  const possibleSheetNames = [
    'Table 1', // Common ONS format
    'Boys', 'Girls', // Gender-specific sheets
    gender.charAt(0).toUpperCase() + gender.slice(1), // Capitalized gender
    'Data', 'Names', // Generic names
    workbook.SheetNames[0] // Fallback to first sheet
  ];

  let dataSheet = null;
  for (const sheetName of possibleSheetNames) {
    if (workbook.Sheets[sheetName]) {
      dataSheet = workbook.Sheets[sheetName];
      console.log(`Found data in sheet: ${sheetName}`);
      break;
    }
  }

  if (!dataSheet) {
    console.error(`Could not find data sheet. Available sheets: ${workbook.SheetNames.join(', ')}`);
    console.error(`You may need to manually adjust the sheet name in the script.`);
    return null;
  }

  // Convert sheet to JSON
  const data = XLSX.utils.sheet_to_json(dataSheet);
  console.log(`Found ${data.length} rows of data`);

  // Process each row
  // Expected columns: Year, Name, Count (or similar)
  // Note: ONS format may vary, so we try to detect column names
  let processedRows = 0;

  data.forEach((row, index) => {
    // Try to identify columns (case-insensitive)
    const name = row.Name || row.name || row.NAME;
    const year = row.Year || row.year || row.YEAR || row.Period || row.period;
    const count = row.Count || row.count || row.COUNT || row.Number || row.number || row.Occurrences;

    // Skip rows without required data
    if (!name || !year || !count) {
      if (index < 5) { // Only log first few to avoid spam
        console.log(`Skipping row ${index}: missing data`, row);
      }
      return;
    }

    // Normalize name (trim, handle case)
    const normalizedName = String(name).trim();
    const yearStr = String(year);
    const countNum = parseInt(count);

    if (!normalizedName || isNaN(countNum) || countNum <= 0) {
      return;
    }

    // Initialize name entry if it doesn't exist
    if (!nameData[normalizedName]) {
      nameData[normalizedName] = {};
    }

    // Add or update count for this year
    nameData[normalizedName][yearStr] = countNum;
    processedRows++;
  });

  console.log(`Processed ${processedRows} valid rows`);
  console.log(`Found ${Object.keys(nameData).length} unique names`);

  // Filter out names with too few total occurrences
  const filteredData = {};
  let filteredCount = 0;

  for (const [name, years] of Object.entries(nameData)) {
    const totalOccurrences = Object.values(years).reduce((sum, count) => sum + count, 0);

    if (totalOccurrences >= MIN_TOTAL_OCCURRENCES) {
      filteredData[name] = years;
    } else {
      filteredCount++;
    }
  }

  console.log(`Filtered out ${filteredCount} rare names (< ${MIN_TOTAL_OCCURRENCES} total occurrences)`);
  console.log(`Final dataset: ${Object.keys(filteredData).length} names`);

  return filteredData;
}

/**
 * Main processing function
 */
function main() {
  console.log('=== Baby Names Data Processing ===\n');
  console.log(`Looking for data files in: ${RAW_DATA_DIR}`);
  console.log(`Output will be saved to: ${OUTPUT_DIR}\n`);

  // Try to process historical file first (contains both genders)
  const historicalFile = path.join(RAW_DATA_DIR, 'baby-names-historical.xlsx');

  if (fs.existsSync(historicalFile)) {
    console.log('Found historical dataset file');

    // Process both genders from historical file
    // Note: You may need to adjust this based on actual file structure
    const workbook = XLSX.readFile(historicalFile);
    console.log('Available sheets:', workbook.SheetNames.join(', '));
    console.log('\nPlease note: You may need to manually adjust sheet names in the script');
    console.log('based on the actual structure of your downloaded file.\n');
  }

  // Process separate files for boys and girls
  const boysFile = path.join(RAW_DATA_DIR, 'baby-names-boys.xlsx');
  const girlsFile = path.join(RAW_DATA_DIR, 'baby-names-girls.xlsx');

  const boysData = processBabyNamesFile(boysFile, 'boys');
  const girlsData = processBabyNamesFile(girlsFile, 'girls');

  // Save results
  if (boysData) {
    const outputPath = path.join(OUTPUT_DIR, 'baby-names-boys.json');
    fs.writeFileSync(outputPath, JSON.stringify(boysData, null, 2));
    console.log(`\n✓ Boys data saved to: ${outputPath}`);

    // Calculate file size
    const stats = fs.statSync(outputPath);
    console.log(`  File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  }

  if (girlsData) {
    const outputPath = path.join(OUTPUT_DIR, 'baby-names-girls.json');
    fs.writeFileSync(outputPath, JSON.stringify(girlsData, null, 2));
    console.log(`\n✓ Girls data saved to: ${outputPath}`);

    // Calculate file size
    const stats = fs.statSync(outputPath);
    console.log(`  File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  }

  if (!boysData && !girlsData) {
    console.error('\n✗ No data files found!');
    console.error('\nPlease download the data files first:');
    console.error('1. See DATA_SOURCES.md for download instructions');
    console.error('2. Place the files in data/raw/');
    console.error('3. Run this script again\n');
    process.exit(1);
  }

  console.log('\n=== Processing Complete ===\n');
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { processBabyNamesFile };
