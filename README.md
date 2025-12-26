# UK Name Age Calculator

A web application that estimates the age distribution of people with a given name in England & Wales, using official Office for National Statistics (ONS) data.

Inspired by [Randal Olson's US Name Age Calculator](https://name-age-calculator.randalolson.com/), adapted for UK demographic data.

## Features

- 📊 **Visual age distribution** - See births per year and estimated living population
- 📈 **Key statistics** - Median age, total living population, peak birth year
- 🔍 **Smart search** - Autocomplete suggestions as you type
- 📱 **Responsive design** - Works on desktop, tablet, and mobile
- 🎨 **Modern UI** - Clean, accessible interface built with Next.js and TailwindCSS

## Screenshot

[Add a screenshot here after running the app]

## Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Clone or navigate to the project**:
   ```bash
   cd uk-name-age-calculator
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Download ONS data**:

   See [DATA_SOURCES.md](DATA_SOURCES.md) for detailed instructions.

   Quick summary:
   - Download baby names data (boys and girls) from [ONS Baby Names](https://www.ons.gov.uk/peoplepopulationandcommunity/birthsdeathsandmarriages/livebirths/datasets/babynamesinenglandandwalesfrom1996)
   - Download life tables from [ONS Life Tables](https://www.ons.gov.uk/peoplepopulationandcommunity/birthsdeathsandmarriages/lifeexpectancies/datasets/nationallifetablesenglandandwalesreferencetables)
   - Place Excel files in `data/raw/`:
     - `baby-names-boys.xlsx`
     - `baby-names-girls.xlsx`
     - `life-tables.xlsx`

4. **Process the data**:
   ```bash
   npm run process-data
   ```

   This converts the Excel files to JSON format in `public/data/`.

5. **Run the development server**:
   ```bash
   npm run dev
   ```

6. **Open your browser**:

   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
uk-name-age-calculator/
├── public/
│   └── data/              # Processed JSON data files
├── src/
│   ├── components/        # React components
│   │   ├── NameAgeChart.jsx
│   │   ├── NameSearchInput.jsx
│   │   ├── GenderSelector.jsx
│   │   └── StatsDisplay.jsx
│   ├── lib/               # Utility functions
│   │   ├── calculations.js
│   │   ├── dataLoader.js
│   │   └── utils.js
│   ├── pages/             # Next.js pages
│   │   ├── index.jsx      # Main calculator page
│   │   ├── about.jsx      # About/methodology page
│   │   └── _app.jsx       # Next.js app wrapper
│   └── styles/
│       └── globals.css    # Global styles
├── scripts/               # Data processing scripts
│   ├── process-baby-names.js
│   └── process-life-tables.js
├── data/
│   └── raw/               # Downloaded Excel files (gitignored)
├── DATA_SOURCES.md        # Data download instructions
└── README.md              # This file
```

## Available Scripts

- **`npm run dev`** - Start development server
- **`npm run build`** - Build for production
- **`npm run start`** - Start production server
- **`npm run process-data`** - Process ONS data files (Excel → JSON)

## Data Sources

All data comes from the UK Office for National Statistics (ONS):

1. **Baby Names**: [Baby names in England and Wales: from 1996](https://www.ons.gov.uk/peoplepopulationandcommunity/birthsdeathsandmarriages/livebirths/datasets/babynamesinenglandandwalesfrom1996)

2. **Life Tables**: [National life tables: England and Wales](https://www.ons.gov.uk/peoplepopulationandcommunity/birthsdeathsandmarriages/lifeexpectancies/datasets/nationallifetablesenglandandwalesreferencetables)

Data is licensed under the [Open Government Licence v3.0](http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/).

## How It Works

1. **Birth Data**: For each year from 1996-2024, we know how many babies were given a particular name

2. **Survival Probabilities**: Using ONS life tables, we estimate how many of those people are still alive today based on their current age

3. **Age Distribution**: Combining these gives us the estimated age distribution of living people with that name

4. **Statistics**: We calculate median age, peak birth year, and other metrics from this distribution

## Methodology

The calculation process:

```javascript
For each birth year (1996-2024):
  1. Get number of births for that name and year
  2. Calculate current age (2025 - birth year)
  3. Get survival probability from life tables
  4. Estimate living = births × survival probability
```

See the [About page](http://localhost:3000/about) for detailed methodology and limitations.

## Tech Stack

- **Framework**: Next.js 14 (React 18)
- **Styling**: TailwindCSS 3
- **Charts**: Recharts 2
- **Data Processing**: Node.js with xlsx library
- **Deployment**: Vercel-ready (or any Node.js hosting)

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub

2. Import the repository in [Vercel](https://vercel.com)

3. Vercel will automatically detect Next.js and deploy

4. **Important**: Make sure the processed JSON data files in `public/data/` are committed to your repository

### Deploy to Other Platforms

The app is a standard Next.js application and can be deployed to:

- Netlify
- AWS Amplify
- Railway
- Any Node.js hosting service

Just make sure to:
1. Run `npm run build` to create production build
2. Include the `public/data/` directory with processed JSON files

## Limitations

- **Geographic coverage**: England & Wales only (Scotland and Northern Ireland not included)
- **Time period**: Data only goes back to 1996 (vs 1880 for the US version)
- **Migration**: Doesn't account for people moving in/out of England & Wales
- **Rare names**: Very rare names may be excluded by ONS for privacy
- **Spelling variants**: Different spellings are treated as separate names

## Contributing

Contributions are welcome! Some ideas:

- Add support for Scotland and Northern Ireland data
- Implement name comparison mode
- Add "popular in year X" search
- Improve mobile UX
- Add dark mode
- Create shareable links

## Credits

- **Original concept**: [Dr. Randal S. Olson](https://www.randalolson.com/) - [US Name Age Calculator](https://name-age-calculator.randalolson.com/)
- **Data source**: Office for National Statistics (ONS)
- **UK adaptation**: Your name here

## License

This project is open source. The ONS data is licensed under the Open Government Licence v3.0.

## Support

If you encounter issues:

1. Check that you've downloaded and processed the ONS data correctly
2. Make sure all dependencies are installed (`npm install`)
3. Check the browser console for error messages
4. See DATA_SOURCES.md for data download instructions

## Future Enhancements

Potential features to add:

- [ ] Regional breakdown (if data available)
- [ ] Name popularity timeline
- [ ] Compare multiple names
- [ ] Export chart as image
- [ ] Share results via URL
- [ ] Dark mode
- [ ] API endpoint
- [ ] Mobile app

---

Made with Next.js, React, and Recharts
