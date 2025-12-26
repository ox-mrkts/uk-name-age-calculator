import { useState, useEffect } from 'react';
import Head from 'next/head';
import NameAgeChart from '../components/NameAgeChart';
import NameSearchInput from '../components/NameSearchInput';
import GenderSelector from '../components/GenderSelector';
import StatsDisplay from '../components/StatsDisplay';
import { loadAllData, getNameData, nameExists } from '../lib/dataLoader';
import { calculateAgeDistribution, calculateStats } from '../lib/calculations';
import { suggestGender } from '../lib/utils';

export default function Home() {
  // State
  const [gender, setGender] = useState('male');
  const [searchedName, setSearchedName] = useState('');
  const [distribution, setDistribution] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Data
  const [maleData, setMaleData] = useState(null);
  const [femaleData, setFemaleData] = useState(null);

  // Load data on component mount
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const [maleDataset, femaleDataset] = await Promise.all([
          loadAllData('male'),
          loadAllData('female')
        ]);

        setMaleData(maleDataset);
        setFemaleData(femaleDataset);
        setDataLoaded(true);
      } catch (err) {
        console.error('Error loading data:', err);
        setError(
          'Failed to load data files. Please ensure you have processed the ONS data. ' +
          'See DATA_SOURCES.md for instructions.'
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Handle name search
  const handleNameSearch = (name) => {
    if (!name || !dataLoaded) {
      return;
    }

    const currentData = gender === 'male' ? maleData : femaleData;
    const otherData = gender === 'male' ? femaleData : maleData;

    // Check if name exists in current gender dataset
    if (!nameExists(name, gender, currentData.babyNames)) {
      // Check other gender
      if (nameExists(name, gender === 'male' ? 'female' : 'male', otherData.babyNames)) {
        setError(
          `"${name}" was not found in ${gender} names, but exists in ${
            gender === 'male' ? 'female' : 'male'
          } names. ` +
          `Try switching the gender selector.`
        );
        return;
      }

      setError(
        `"${name}" was not found in the dataset. ` +
        `Please check the spelling or try a different name. ` +
        `Note: Very rare names may not be included in the data.`
      );
      return;
    }

    setError(null);

    // Get name data
    const nameData = getNameData(name, currentData.babyNames);

    if (!nameData) {
      setError(`No data found for "${name}"`);
      return;
    }

    // Calculate distribution
    const ageDistribution = calculateAgeDistribution(
      name,
      gender,
      nameData,
      currentData.lifeTables
    );

    // Calculate statistics
    const statistics = calculateStats(ageDistribution);

    setSearchedName(name);
    setDistribution(ageDistribution);
    setStats(statistics);
  };

  // Handle gender change
  const handleGenderChange = (newGender) => {
    setGender(newGender);

    // Re-calculate if we have a searched name
    if (searchedName) {
      const newData = newGender === 'male' ? maleData : femaleData;

      // Check if name exists in new gender
      if (nameExists(searchedName, newGender, newData.babyNames)) {
        const nameData = getNameData(searchedName, newData.babyNames);
        const ageDistribution = calculateAgeDistribution(
          searchedName,
          newGender,
          nameData,
          newData.lifeTables
        );
        const statistics = calculateStats(ageDistribution);

        setDistribution(ageDistribution);
        setStats(statistics);
        setError(null);
      } else {
        setError(
          `"${searchedName}" was not found in ${newGender} names. ` +
          `Try searching for a different name.`
        );
        setDistribution([]);
        setStats(null);
      }
    }
  };

  const currentData = gender === 'male' ? maleData : femaleData;

  return (
    <>
      <Head>
        <title>UK Name Age Calculator - England & Wales</title>
        <meta
          name="description"
          content="Estimate the age distribution of people with a given name in England & Wales using ONS data"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <header className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
              UK Name Age Calculator
            </h1>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Discover the age distribution of people with a given name in England & Wales
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Based on Office for National Statistics (ONS) data, 1996-2024
            </p>
          </header>

          {/* Main Content Card */}
          <div className="bg-white rounded-xl shadow-xl p-6 md:p-8">
            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Loading data...</p>
              </div>
            )}

            {/* Error State - Data Loading */}
            {!loading && error && !dataLoaded && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-800 font-medium mb-2">Error Loading Data</p>
                <p className="text-red-700 text-sm">{error}</p>
                <div className="mt-4 text-left bg-white p-4 rounded border border-red-200">
                  <p className="font-medium text-gray-900 mb-2">To fix this issue:</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                    <li>Download ONS data files (see DATA_SOURCES.md)</li>
                    <li>Place files in <code className="bg-gray-100 px-1 rounded">data/raw/</code></li>
                    <li>Run <code className="bg-gray-100 px-1 rounded">npm run process-data</code></li>
                    <li>Refresh this page</li>
                  </ol>
                </div>
              </div>
            )}

            {/* Main Interface */}
            {!loading && dataLoaded && (
              <>
                {/* Search Controls */}
                <div className="space-y-4 mb-8">
                  <NameSearchInput
                    onSubmit={handleNameSearch}
                    babyNamesData={currentData?.babyNames}
                    placeholder="Enter a name (e.g., Oliver, Emily)..."
                  />

                  <GenderSelector
                    selectedGender={gender}
                    onChange={handleGenderChange}
                  />
                </div>

                {/* Error State - Name Not Found */}
                {error && dataLoaded && (
                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-6">
                    <p className="text-yellow-800 text-sm">{error}</p>
                  </div>
                )}

                {/* Chart */}
                <div className="mb-6">
                  <NameAgeChart
                    data={distribution}
                    name={searchedName}
                    gender={gender}
                  />
                </div>

                {/* Statistics */}
                {stats && (
                  <StatsDisplay stats={stats} name={searchedName} />
                )}

                {/* Help Text */}
                {!searchedName && !error && (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-lg">👆 Enter a name above to get started</p>
                    <p className="text-sm mt-2">Try popular names like Oliver, Olivia, Mohammed, or Emily</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <footer className="mt-8 text-center text-sm text-gray-600">
            <p className="mb-2">
              Data source:{' '}
              <a
                href="https://www.ons.gov.uk/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Office for National Statistics (ONS)
              </a>
            </p>
            <p className="mb-2">
              <a
                href="/about"
                className="text-blue-600 hover:underline"
              >
                About this calculator
              </a>
              {' • '}
              <a
                href="https://name-age-calculator.randalolson.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                US version by Randal Olson
              </a>
            </p>
            <p className="text-xs text-gray-500">
              Made with Next.js and Recharts
            </p>
          </footer>
        </div>
      </main>
    </>
  );
}
