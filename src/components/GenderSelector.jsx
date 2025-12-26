/**
 * GenderSelector Component
 *
 * Radio button selector for choosing Male or Female
 */
export default function GenderSelector({ selectedGender, onChange }) {
  const genders = [
    { value: 'male', label: 'Male', emoji: '♂' },
    { value: 'female', label: 'Female', emoji: '♀' }
  ];

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm font-medium text-gray-700">Gender:</span>

      <div className="flex gap-3">
        {genders.map(({ value, label, emoji }) => (
          <label
            key={value}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer transition-all ${
              selectedGender === value
                ? 'border-blue-500 bg-blue-50 text-blue-900'
                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
            }`}
          >
            <input
              type="radio"
              name="gender"
              value={value}
              checked={selectedGender === value}
              onChange={(e) => onChange(e.target.value)}
              className="sr-only"
              aria-label={label}
            />
            <span className="text-lg" aria-hidden="true">{emoji}</span>
            <span className="font-medium">{label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
