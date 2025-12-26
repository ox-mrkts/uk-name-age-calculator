import Head from 'next/head';
import Link from 'next/link';

export default function About() {
  return (
    <>
      <Head>
        <title>About - UK Name Age Calculator</title>
        <meta
          name="description"
          content="Learn about the methodology and data sources behind the UK Name Age Calculator"
        />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              About the UK Name Age Calculator
            </h1>
            <Link href="/" className="text-blue-600 hover:underline">
              ← Back to Calculator
            </Link>
          </header>

          {/* Content */}
          <div className="bg-white rounded-xl shadow-xl p-8 space-y-8">
            {/* What is this */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">What is this?</h2>
              <p className="text-gray-700 mb-3">
                The UK Name Age Calculator estimates the age distribution of people with a given name
                in England & Wales. It's based on the excellent{' '}
                <a
                  href="https://name-age-calculator.randalolson.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Name Age Calculator
                </a>
                {' '}by Dr. Randal S. Olson, adapted for UK demographic data.
              </p>
              <p className="text-gray-700">
                Enter a name and gender, and the calculator will show you:
              </p>
              <ul className="list-disc list-inside text-gray-700 mt-2 ml-4 space-y-1">
                <li>How many people with that name were born each year</li>
                <li>Estimated number of people with that name still alive today</li>
                <li>The median age of someone with that name</li>
                <li>The most popular year for that name</li>
              </ul>
            </section>

            {/* Methodology */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Methodology</h2>

              <h3 className="text-xl font-semibold text-gray-900 mb-2">Data Sources</h3>
              <div className="space-y-3 mb-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <p className="font-medium text-gray-900">Baby Names Data (1996-2024)</p>
                  <p className="text-sm text-gray-700">
                    From the Office for National Statistics (ONS) "Baby names in England and Wales" dataset.
                    Covers births from 1996 to 2024 with exact counts.
                  </p>
                  <a
                    href="https://www.ons.gov.uk/peoplepopulationandcommunity/birthsdeathsandmarriages/livebirths/datasets/babynamesinenglandandwalesfrom1996"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View ONS Baby Names Data →
                  </a>
                </div>

                <div className="border-l-4 border-orange-400 pl-4">
                  <p className="font-medium text-gray-900">Historical Rankings (1904-1994)</p>
                  <p className="text-sm text-gray-700">
                    From the ONS "Top 100 baby names: historical data" dataset.
                    Rankings at 10-year intervals for the top 100 names. Birth counts are estimated from rankings.
                  </p>
                  <a
                    href="https://www.ons.gov.uk/peoplepopulationandcommunity/birthsdeathsandmarriages/livebirths/datasets/babynamesenglandandwalestop100babynameshistoricaldata"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View ONS Historical Rankings →
                  </a>
                </div>

                <div className="border-l-4 border-blue-500 pl-4">
                  <p className="font-medium text-gray-900">Life Tables</p>
                  <p className="text-sm text-gray-700">
                    From the ONS "National life tables: England and Wales" dataset.
                    Provides survival probabilities by age and birth year.
                  </p>
                  <a
                    href="https://www.ons.gov.uk/peoplepopulationandcommunity/birthsdeathsandmarriages/lifeexpectancies/datasets/nationallifetablesenglandandwalesreferencetables"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View ONS Life Tables →
                  </a>
                </div>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-2">Calculation Process</h3>

              <h4 className="text-lg font-semibold text-gray-900 mb-2 mt-4">Modern Data (1996-2024)</h4>
              <ol className="list-decimal list-inside text-gray-700 space-y-2 ml-4">
                <li>
                  <span className="font-medium">Count births:</span> For each year from 1996-2024,
                  we know exactly how many babies were given a particular name.
                </li>
                <li>
                  <span className="font-medium">Apply mortality rates:</span> Using life tables,
                  we estimate how many of those people are still alive today based on their current age.
                </li>
                <li>
                  <span className="font-medium">Calculate statistics:</span> We compute the median age,
                  total living population, and other metrics from this distribution.
                </li>
              </ol>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-blue-900">
                  <span className="font-medium">Example:</span> If 1,000 babies named "Oliver" were born in 2000,
                  and the survival probability for 25-year-olds (born in 2000) is 99.5%, we estimate
                  that approximately 995 of them are still alive in 2025.
                </p>
              </div>

              <h4 className="text-lg font-semibold text-gray-900 mb-2 mt-6">Historical Data (1904-1994)</h4>
              <p className="text-gray-700 mb-3">
                For the top 100 most popular names, we extend the data back to 1904 using ONS historical rankings.
                However, this data has important limitations:
              </p>
              <ol className="list-decimal list-inside text-gray-700 space-y-2 ml-4">
                <li>
                  <span className="font-medium">Rankings only:</span> ONS historical data provides rankings
                  at 10-year intervals (1904, 1914, 1924... 1994), not actual birth counts.
                </li>
                <li>
                  <span className="font-medium">Estimated counts:</span> We estimate birth counts based on the
                  historical ranking position. Higher-ranked names are assigned higher estimated counts.
                </li>
                <li>
                  <span className="font-medium">Top 100 only:</span> Historical estimates are only available
                  for names that appeared in the top 100 during those decades.
                </li>
                <li>
                  <span className="font-medium">Interpolation:</span> For years between the 10-year intervals,
                  we interpolate estimated values.
                </li>
              </ol>

              <div className="bg-orange-50 border border-orange-300 rounded-lg p-4 mt-4">
                <p className="text-sm text-orange-900 font-medium mb-2">
                  ⚠️ Important: Historical Data is Estimated
                </p>
                <p className="text-sm text-orange-900">
                  Pre-1996 data is based on statistical estimates from historical rankings, not actual birth records.
                  These estimates should be considered approximate indicators of name popularity trends rather than
                  precise demographic data. Modern data (1996-2024) uses exact ONS birth registration counts and
                  is significantly more accurate.
                </p>
              </div>
            </section>

            {/* Limitations */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Limitations & Assumptions</h2>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-yellow-600 mr-2">⚠️</span>
                  <span>
                    <span className="font-medium">Geographic coverage:</span> England & Wales only.
                    Scotland and Northern Ireland have separate statistics.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-600 mr-2">⚠️</span>
                  <span>
                    <span className="font-medium">Historical data limitations:</span> Pre-1996 data (1904-1994)
                    is estimated from historical rankings, not actual counts. Only available for top 100 names
                    at 10-year intervals. Modern data (1996-2024) uses exact birth counts and is more accurate.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-600 mr-2">⚠️</span>
                  <span>
                    <span className="font-medium">Migration ignored:</span> We don't account for people
                    moving in or out of England & Wales.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-600 mr-2">⚠️</span>
                  <span>
                    <span className="font-medium">Rare names excluded:</span> Very rare names
                    (typically fewer than 3 occurrences) are excluded for privacy reasons by ONS.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-600 mr-2">⚠️</span>
                  <span>
                    <span className="font-medium">Spelling variants:</span> Different spellings are
                    treated as separate names (e.g., "Mohammed", "Muhammad", "Mohamed").
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-600 mr-2">⚠️</span>
                  <span>
                    <span className="font-medium">Estimates only:</span> Life tables use average mortality rates.
                    Actual survival rates vary by many factors not captured in this model.
                  </span>
                </li>
              </ul>
            </section>

            {/* Technical Details */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Technical Details</h2>
              <p className="text-gray-700 mb-3">
                This calculator is built with:
              </p>
              <ul className="list-disc list-inside text-gray-700 ml-4 space-y-1">
                <li><span className="font-medium">Next.js 14</span> - React framework</li>
                <li><span className="font-medium">Recharts</span> - Data visualization library</li>
                <li><span className="font-medium">TailwindCSS</span> - Styling</li>
                <li><span className="font-medium">Node.js</span> - Data processing scripts</li>
              </ul>

              <p className="text-gray-700 mt-4">
                The source code is available on GitHub (if you've made it public).
                Data processing happens offline using Excel files from ONS, converted to JSON for web use.
              </p>
            </section>

            {/* Credits */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Credits & Attribution</h2>
              <div className="space-y-3">
                <p className="text-gray-700">
                  <span className="font-medium">Inspired by:</span>{' '}
                  <a
                    href="https://name-age-calculator.randalolson.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    US Name Age Calculator
                  </a>
                  {' '}by Dr. Randal S. Olson
                </p>

                <p className="text-gray-700">
                  <span className="font-medium">Data:</span> Office for National Statistics (ONS)
                  <br />
                  <span className="text-sm">
                    Licensed under the{' '}
                    <a
                      href="http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Open Government Licence v3.0
                    </a>
                  </span>
                </p>
              </div>
            </section>

            {/* Contact */}
            <section className="border-t pt-6">
              <p className="text-center text-gray-600">
                <Link href="/" className="text-blue-600 hover:underline font-medium">
                  ← Back to Calculator
                </Link>
              </p>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
