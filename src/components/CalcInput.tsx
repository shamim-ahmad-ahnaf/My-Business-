import React, { useState } from 'react';
import { Calculator } from 'lucide-react';
import { InputCalculatorModal } from './InputCalculatorModal';

export interface CalcInputProps {
  value: number | string;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number | string;
  placeholder?: string;
  label?: string;
  unitPresets?: 'weight' | 'money' | 'percentage' | 'none';
  suffix?: string;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  name?: string;
  title?: string;
  calcTitle?: string;
  helperText?: string;
  autoFocus?: boolean;
  align?: 'left' | 'center' | 'right';
}

export const CalcInput: React.FC<CalcInputProps> = ({
  value,
  onChange,
  min,
  max,
  step = 'any',
  placeholder = '০',
  label,
  unitPresets = 'none',
  suffix,
  className = '',
  inputClassName = '',
  disabled = false,
  required = false,
  id,
  name,
  calcTitle,
  helperText,
  autoFocus = false,
  align = 'left'
}) => {
  const [showCalc, setShowCalc] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '') {
      onChange(0);
      return;
    }
    const parsed = parseFloat(raw);
    onChange(isNaN(parsed) ? 0 : parsed);
  };

  const handleApplyCalc = (result: number) => {
    onChange(result);
  };

  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right font-mono'
  };

  return (
    <div className={`relative flex flex-col ${className}`}>
      {label && (
        <div className="flex items-center justify-between mb-1">
          <label htmlFor={id} className="text-xs font-semibold text-stone-700 dark:text-stone-300">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
          <button
            type="button"
            onClick={() => setShowCalc(true)}
            className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 font-medium flex items-center gap-1 active:scale-95 transition-transform"
            title="ক্যালকুলেটর খুলুন"
          >
            <Calculator className="w-3 h-3" />
            <span>ক্যালকুলেটর</span>
          </button>
        </div>
      )}

      <div className="relative flex items-center">
        <input
          id={id}
          name={name}
          type="number"
          min={min}
          max={max}
          step={step}
          value={value === 0 ? '' : value}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoFocus={autoFocus}
          className={`w-full py-1.5 pl-3 pr-10 text-xs sm:text-sm rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-stone-900 dark:text-stone-100 disabled:opacity-60 transition-colors ${alignmentClasses[align]} ${inputClassName}`}
        />

        {/* Small attached Calculator button inside the right of the input */}
        <div className="absolute right-1 flex items-center gap-1">
          {suffix && (
            <span className="text-[11px] text-stone-400 select-none pr-0.5">
              {suffix}
            </span>
          )}
          <button
            type="button"
            onClick={() => setShowCalc(true)}
            className="p-1.5 text-stone-400 hover:text-emerald-600 dark:text-stone-400 dark:hover:text-emerald-400 hover:bg-stone-100 dark:hover:bg-stone-700/80 rounded-md transition-colors active:scale-95"
            title="ক্যালকুলেটরে হিসাব করুন"
            aria-label="ক্যালকুলেটরে হিসাব করুন"
          >
            <Calculator className="w-4 h-4 text-emerald-600/80 dark:text-emerald-400/80" />
          </button>
        </div>
      </div>

      {helperText && (
        <span className="text-[10px] text-stone-400 mt-0.5">
          {helperText}
        </span>
      )}

      {/* Interactive Calculator Popup */}
      <InputCalculatorModal
        isOpen={showCalc}
        onClose={() => setShowCalc(false)}
        onApply={handleApplyCalc}
        initialValue={value}
        title={calcTitle || label || 'হিসাব ক্যালকুলেটর'}
        unitPresets={unitPresets}
        suffix={suffix}
      />
    </div>
  );
};
