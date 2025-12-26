import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getGenderColors, formatNumber } from '../lib/utils';

/**
 * NameAgeChart Component
 *
 * Displays age distribution visualization with:
 * - Black line: Number of births per year
 * - Shaded area: Estimated living population (adjusted for mortality)
 */
export default function NameAgeChart({ data, name, gender }) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-gray-500 text-lg">
          No data available. Please enter a name to see the visualization.
        </p>
      </div>
    );
  }

  const colors = getGenderColors(gender);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

      return (
        <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-3">
          <p className="font-semibold text-gray-900 mb-2">Year {data.year}</p>
          <p className="text-sm text-gray-700">
            <span className="font-medium">Births:</span> {formatNumber(data.births)}
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-medium">Est. Living:</span> {formatNumber(data.living)}
          </p>
          <p className="text-sm text-gray-500">
            <span className="font-medium">Current Age:</span> {data.age} years
          </p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900">
          Age Distribution: {name}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Black line shows births per year, shaded area shows estimated living population
        </p>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart
          data={data}
          margin={{ top: 10, right: 30, left: 20, bottom: 50 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

          <XAxis
            dataKey="year"
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            label={{
              value: 'Birth Year',
              position: 'insideBottom',
              offset: -40,
              style: { fontSize: '14px', fill: '#374151' }
            }}
            tick={{ fill: '#6b7280' }}
          />

          <YAxis
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            label={{
              value: 'Population',
              angle: -90,
              position: 'insideLeft',
              style: { fontSize: '14px', fill: '#374151' }
            }}
            tick={{ fill: '#6b7280' }}
            tickFormatter={(value) => {
              if (value >= 1000) {
                return `${(value / 1000).toFixed(0)}k`;
              }
              return value;
            }}
          />

          <Tooltip content={<CustomTooltip />} />

          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="line"
          />

          {/* Shaded area for estimated living population */}
          <Area
            type="monotone"
            dataKey="living"
            fill={colors.primary}
            fillOpacity={0.3}
            stroke="none"
            name="Estimated Living"
            animationDuration={1000}
          />

          {/* Black line for births per year */}
          <Line
            type="monotone"
            dataKey="births"
            stroke="#000000"
            strokeWidth={2}
            dot={false}
            name="Births per Year"
            animationDuration={1000}
          />
        </ComposedChart>
      </ResponsiveContainer>

      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>
          Data source: Office for National Statistics (ONS)
          <br />
          England & Wales, 1996-2024
        </p>
      </div>
    </div>
  );
}
