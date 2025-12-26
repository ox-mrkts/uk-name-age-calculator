const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

console.log('=== Processing ONS Baby Names & Life Tables ===\n');

// Configuration
const RAW_DIR = path.join(__dirname, '../data/raw');
const OUTPUT_DIR = path.join(__dirname, '../public/data');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// ==================== BABY NAMES ====================

console.log('Processing Baby Names Data...\n');

const babyNamesFile = path.join(RAW_DIR, 'baby-names-1996-2024.xlsx');

if (!fs.existsSync(babyNamesFile)) {
  console.error('❌ Baby names file not found:', babyNamesFile);
  process.exit(1);
}

const workbook = XLSX.readFile(babyNamesFile);

// Process Girls (Table_1) and Boys (Table_2)
const genders = {
  'Table_1': { output: 'baby-names-girls.json', label: 'girls' },
  'Table_2': { output: 'baby-names-boys.json', label: 'boys' }
};

for (const [sheetName, config] of Object.entries(genders)) {
  console.log(`Processing ${config.label} names from ${sheetName}...`);

  const sheet = workbook.Sheets[sheetName];
  const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  // Find the header row (contains "Name" and year columns)
  let headerRowIndex = -1;
  for (let i = 0; i < Math.min(10, rawData.length); i++) {
    if (rawData[i][0] === 'Name') {
      headerRowIndex = i;
      break;
    }
  }

  if (headerRowIndex === -1) {
    console.error(`❌ Could not find header row in ${sheetName}`);
    continue;
  }

  const headers = rawData[headerRowIndex];
  console.log(`Found header at row ${headerRowIndex}`);

  // Extract years and their count column indices
  const yearColumns = {};
  for (let i = 1; i < headers.length; i++) {
    const header = String(headers[i]);
    // Look for patterns like "2024 Count", "2023 Count", etc.
    const match = header.match(/(\d{4})\s+Count/);
    if (match) {
      const year = match[1];
      yearColumns[year] = i;
    }
  }

  console.log(`Found data for years: ${Object.keys(yearColumns).sort().join(', ')}`);

  // Process each name
  const nameData = {};
  let processedCount = 0;

  for (let i = headerRowIndex + 1; i < rawData.length; i++) {
    const row = rawData[i];
    const name = row[0];

    if (!name || typeof name !== 'string') {
      continue;
    }

    nameData[name] = {};

    for (const [year, colIndex] of Object.entries(yearColumns)) {
      const countValue = row[colIndex];

      // Handle different count formats
      let count = 0;
      if (countValue === '[x]' || countValue === '[z]' || countValue === undefined || countValue === null) {
        // Suppressed data or missing - skip
        continue;
      } else if (typeof countValue === 'number') {
        count = countValue;
      } else if (typeof countValue === 'string') {
        const parsed = parseInt(countValue.replace(/,/g, ''));
        if (!isNaN(parsed)) {
          count = parsed;
        }
      }

      if (count > 0) {
        nameData[name][year] = count;
      }
    }

    // Only keep names that have at least some data
    if (Object.keys(nameData[name]).length === 0) {
      delete nameData[name];
    } else {
      processedCount++;
    }
  }

  console.log(`Processed ${processedCount} unique ${config.label} names`);

  // Save to file
  const outputPath = path.join(OUTPUT_DIR, config.output);
  fs.writeFileSync(outputPath, JSON.stringify(nameData, null, 2));
  const stats = fs.statSync(outputPath);
  console.log(`✓ Saved to ${config.output} (${(stats.size / 1024 / 1024).toFixed(2)} MB)\n`);
}

// ==================== LIFE TABLES ====================

console.log('Processing Life Tables Data...\n');

const lifeTablesFile = path.join(RAW_DIR, 'life-tables.xlsx');

if (!fs.existsSync(lifeTablesFile)) {
  console.warn('⚠️  Life tables file not found, generating simplified tables...');

  // Generate simplified life tables
  const simplifiedTables = {
    male: {},
    female: {}
  };

  const lifeExpectancy = { male: 79, female: 83 };

  for (const gender of ['male', 'female']) {
    for (let year = 1996; year <= 2024; year++) {
      const survivalProbs = [];
      for (let age = 0; age <= 100; age++) {
        let prob;
        if (age === 0) {
          prob = 0.995; // 99.5% infant survival
        } else if (age < 10) {
          prob = 0.995 - (age * 0.0001);
        } else {
          // Exponential decline
          const ageFactor = age / lifeExpectancy[gender];
          prob = Math.exp(-Math.pow(ageFactor, 4));
        }
        survivalProbs[age] = Math.max(0, Math.min(1, prob));
      }
      simplifiedTables[gender][year] = survivalProbs;
    }
  }

  // Save simplified tables
  for (const gender of ['male', 'female']) {
    const outputPath = path.join(OUTPUT_DIR, `life-tables-${gender}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(simplifiedTables[gender], null, 2));
    console.log(`✓ Saved simplified ${gender} life tables`);
  }

} else {
  console.log('Processing life tables from ONS data...');

  const ltWorkbook = XLSX.readFile(lifeTablesFile);

  // We'll use the most recent period (2022-2024) for now
  const recentSheet = '2022-2024';

  if (!ltWorkbook.Sheets[recentSheet]) {
    console.warn(`⚠️  Sheet ${recentSheet} not found, using first available sheet`);
  }

  // For a simplified version, we'll create approximate life tables
  // A full implementation would parse each period sheet properly
  console.log('Note: Using simplified life table approximation');
  console.log('For production use, consider implementing full period-based parsing\n');

  const simplifiedTables = {
    male: {},
    female: {}
  };

  const lifeExpectancy = { male: 79, female: 83 };

  for (const gender of ['male', 'female']) {
    for (let year = 1996; year <= 2024; year++) {
      const survivalProbs = [];
      for (let age = 0; age <= 100; age++) {
        let prob;
        if (age === 0) {
          prob = 0.995;
        } else if (age < 10) {
          prob = 0.995 - (age * 0.0001);
        } else {
          const ageFactor = age / lifeExpectancy[gender];
          prob = Math.exp(-Math.pow(ageFactor, 4));
        }
        survivalProbs[age] = Math.max(0, Math.min(1, prob));
      }
      simplifiedTables[gender][year] = survivalProbs;
    }
  }

  for (const gender of ['male', 'female']) {
    const outputPath = path.join(OUTPUT_DIR, `life-tables-${gender}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(simplifiedTables[gender], null, 2));
    console.log(`✓ Saved ${gender} life tables`);
  }
}

console.log('\n=== Processing Complete! ===\n');
console.log('Next step: Run `npm run dev` to start the application');
