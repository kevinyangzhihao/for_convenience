
import React from 'react';

interface PreferenceSliderProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  icon: string;
}

export const PreferenceSlider: React.FC<PreferenceSliderProps> = ({ label, value, onChange, icon }) => {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <i className={`${icon} text-indigo-500`}></i>
          {label}
        </label>
        <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{value}/10</span>
      </div>
      <input
        type="range"
        min="0"
        max="10"
        step="1"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
      />
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-gray-400">Not Important</span>
        <span className="text-[10px] text-gray-400">Critical</span>
      </div>
    </div>
  );
};
