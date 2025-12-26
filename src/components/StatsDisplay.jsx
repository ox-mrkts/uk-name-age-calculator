import { formatNumber, formatAge, formatYearRange } from '../lib/utils';

/**
 * StatsDisplay Component
 *
 * Displays key statistics about the name's age distribution
 */
export default function StatsDisplay({ stats, name }) {
  if (!stats) {
    return null;
  }

  const { totalLiving, medianAge, peakBirthYear, ageRange, yearRange } = stats;

  const statCards = [
    {
      label: 'Estimated Living',
      value: formatNumber(totalLiving),
      description: `people named ${name} in England & Wales`,
      icon: '👥'
    },
    {
      label: 'Median Age',
      value: `${medianAge} years`,
      description: 'typical age of someone with this name',
      icon: '🎂'
    },
    {
      label: 'Most Popular Year',
      value: peakBirthYear.year,
      description: `${formatNumber(peakBirthYear.births)} births that year`,
      icon: '📈'
    },
    {
      label: 'Age Range',
      value: `${ageRange.lower}-${ageRange.upper} years`,
      description: '10th to 90th percentile',
      icon: '📊'
    }
  ];

  return (
    <div className="w-full mt-8">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Key Statistics</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white border-2 border-gray-200 rounded-lg p-5 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">{card.label}</span>
              <span className="text-2xl" aria-hidden="true">{card.icon}</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {card.value}
            </div>
            <div className="text-xs text-gray-500">
              {card.description}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p>
          Data coverage: {formatYearRange(yearRange.earliest, yearRange.latest)}
          {' • '}
          Source: Office for National Statistics (ONS)
        </p>
      </div>
    </div>
  );
}
