const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Configuration
const RAW_DATA_DIR = path.join(__dirname, '../data/raw');
const OUTPUT_DIR = path.join(__dirname, '../public/data');
const CURRENT_YEAR = 2025;
const START_YEAR = 1996; // ONS baby names data starts from 1996

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Process life tables from Excel file
 * @param {string} filePath - Path to Excel file
 * @returns {Object} - Life table data by gender
 */
function processLifeTablesFile(filePath) {
  console.log(`\nProcessing life tables from: ${filePath}`);

  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    console.log(`Please download the data file and place it in data/raw/`);
    return null;
  }

  const workbook = XLSX.readFile(filePath);
  console.log('Available sheets:', workbook.SheetNames.join(', '));

  // Life tables typically have separate sheets for males and females
  const lifeTableData = {
    male: {},
    female: {}
  };

  // Process each gender
  for (const gender of ['male', 'female']) {
    console.log(`\nProcessing ${gender} life tables...`);

    // Try to find the sheet for this gender
    const possibleSheetNames = [
      `${gender}s`, // "males", "females"
      gender.charAt(0).toUpperCase() + gender.slice(1), // "Male", "Female"
      `${gender} cohort`, // "male cohort", "female cohort"
      gender.toUpperCase(), // "MALE", "FEMALE"
      `Table ${gender === 'male' ? '1' : '2'}` // Common ONS format
    ];

    let dataSheet = null;
    let sheetName = null;

    for (const name of possibleSheetNames) {
      if (workbook.Sheets[name]) {
        dataSheet = workbook.Sheets[name];
        sheetName = name;
        console.log(`Found ${gender} data in sheet: ${name}`);
        break;
      }
    }

    if (!dataSheet) {
      console.warn(`Could not find ${gender} life table sheet`);
      console.warn(`You may need to manually specify the sheet name in the script`);
      continue;
    }

    // Convert sheet to JSON
    const data = XLSX.utils.sheet_to_json(dataSheet);
    console.log(`Found ${data.length} rows of data`);

    // Process life table data
    // Expected columns: Year (or birth cohort), Age, lx (survivors per 100,000), qx (mortality rate), etc.
    // We need lx values by birth year and age

    // Group data by birth year
    const yearData = {};

    data.forEach((row, index) => {
      // Try to identify columns (case-insensitive)
      const year = row.Year || row.year || row.YEAR || row['Birth year'] || row.Cohort || row.cohort;
      const age = row.Age || row.age || row.AGE || row.x;
      const lx = row.lx || row.LX || row.Lx || row['lx (survivors)'] || row.Survivors;

      // Skip rows without required data
      if (year === undefined || age === undefined || lx === undefined) {
        if (index < 5) {
          console.log(`Skipping row ${index}: missing data`, { year, age, lx });
        }
        return;
      }

      const yearNum = parseInt(year);
      const ageNum = parseInt(age);
      const lxNum = parseFloat(lx);

      // Only process years we care about (1996-2024)
      if (yearNum < START_YEAR || yearNum > CURRENT_YEAR || isNaN(ageNum) || isNaN(lxNum)) {
        return;
      }

      // Initialize year array if it doesn't exist
      if (!yearData[yearNum]) {
        yearData[yearNum] = [];
      }

      // Store survival probability for this age
      // lx is typically per 100,000 births, so we normalize to 0-1
      const survivalProbability = lxNum / 100000;
      yearData[yearNum][ageNum] = survivalProbability;
    });

    // Fill in missing ages with interpolation or defaults
    for (const [year, ages] of Object.entries(yearData)) {
      // Ensure we have data for ages 0-100
      for (let age = 0; age <= 100; age++) {
        if (ages[age] === undefined) {
          // If we're missing data, try to interpolate or use a default
          if (age === 0) {
            ages[age] = 1.0; // Age 0 should have 100% survival
          } else if (ages[age - 1] !== undefined) {
            // Use previous age's value with slight decline
            ages[age] = Math.max(0, ages[age - 1] - 0.001);
          } else {
            // Fallback: approximate based on typical mortality
            ages[age] = Math.max(0, 1.0 - (age * 0.01));
          }
        }
      }
    });

    lifeTableData[gender] = yearData;
    console.log(`Processed ${Object.keys(yearData).length} years for ${gender}`);
  }

  return lifeTableData;
}

/**
 * Generate simplified life tables if ONS data is unavailable
 * This uses a simplified mortality model based on average UK life expectancy
 */
function generateSimplifiedLifeTables() {
  console.log('\nGenerating simplified life tables...');
  console.log('Note: This is an approximation. For best results, use actual ONS data.\n');

  const lifeTableData = {
    male: {},
    female: {}
  };

  // Simplified mortality model parameters
  // Based on average UK life expectancy: ~79 for males, ~83 for females
  const params = {
    male: { lifeExpectancy: 79 },
    female: { lifeExpectancy: 83 }
  };

  for (const gender of ['male', 'female']) {
    const { lifeExpectancy } = params[gender];

    for (let year = START_YEAR; year <= CURRENT_YEAR; year++) {
      const survivalProbabilities = [];

      for (let age = 0; age <= 100; age++) {
        // Simplified Gompertz–Makeham law of mortality
        // Higher survival for younger ages, declining as age approaches life expectancy
        let survival;

        if (age === 0) {
          survival = 0.995; // 99.5% infant survival
        } else if (age < 10) {
          survival = 0.995 - (age * 0.0001); // Very low childhood mortality
        } else {
          // Exponential decline after childhood
          const ageFactor = age / lifeExpectancy;
          survival = Math.exp(-Math.pow(ageFactor, 4));
        }

        survivalProbabilities[age] = Math.max(0, Math.min(1, survival));
      }

      lifeTableData[gender][year] = survivalProbabilities;
    }

    console.log(`Generated ${CURRENT_YEAR - START_YEAR + 1} years of ${gender} life tables`);
  }

  return lifeTableData;
}

/**
 * Main processing function
 */
function main() {
  console.log('=== Life Tables Data Processing ===\n');
  console.log(`Looking for data files in: ${RAW_DATA_DIR}`);
  console.log(`Output will be saved to: ${OUTPUT_DIR}\n`);

  const lifeTablesFile = path.join(RAW_DATA_DIR, 'life-tables.xlsx');

  let lifeTableData = null;

  if (fs.existsSync(lifeTablesFile)) {
    lifeTableData = processLifeTablesFile(lifeTablesFile);
  }

  // Fallback to simplified model if no data file found
  if (!lifeTableData || (!lifeTableData.male && !lifeTableData.female)) {
    console.log('\n⚠️  No life table data file found');
    console.log('Using simplified mortality model instead');
    console.log('For more accurate results, download ONS life tables (see DATA_SOURCES.md)\n');

    lifeTableData = generateSimplifiedLifeTables();
  }

  // Save results
  if (lifeTableData.male) {
    const outputPath = path.join(OUTPUT_DIR, 'life-tables-male.json');
    fs.writeFileSync(outputPath, JSON.stringify(lifeTableData.male, null, 2));
    console.log(`\n✓ Male life tables saved to: ${outputPath}`);

    const stats = fs.statSync(outputPath);
    console.log(`  File size: ${(stats.size / 1024).toFixed(2)} KB`);
  }

  if (lifeTableData.female) {
    const outputPath = path.join(OUTPUT_DIR, 'life-tables-female.json');
    fs.writeFileSync(outputPath, JSON.stringify(lifeTableData.female, null, 2));
    console.log(`\n✓ Female life tables saved to: ${outputPath}`);

    const stats = fs.statSync(outputPath);
    console.log(`  File size: ${(stats.size / 1024).toFixed(2)} KB`);
  }

  console.log('\n=== Processing Complete ===\n');
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { processLifeTablesFile, generateSimplifiedLifeTables };
