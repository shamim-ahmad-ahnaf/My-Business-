import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  X, 
  Check, 
  Delete, 
  RotateCcw, 
  Copy, 
  CheckCheck,
  Scale,
  Coins,
  Percent
} from 'lucide-react';
import { evaluateExpression } from '../utils/calculator';
import { toBengaliNumber } from '../utils/formatters';

export interface InputCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply?: (result: number) => void;
  initialValue?: number | string;
  title?: string;
  unitPresets?: 'weight' | 'money' | 'percentage' | 'none';
  suffix?: string;
}

export const InputCalculatorModal: React.FC<InputCalculatorModalProps> = ({
  isOpen,
  onClose,
  onApply,
  initialValue = 0,
  title = 'হিসাব ক্যালকুলেটর',
  unitPresets = 'none',
  suffix = ''
}) => {
  const [expression, setExpression] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Initialize with initialValue when opened
  useEffect(() => {
    if (isOpen) {
      const num = typeof initialValue === 'number' ? initialValue : parseFloat(initialValue);
      if (!isNaN(num) && num !== 0) {
        setExpression(String(num));
      } else {
        setExpression('');
      }
      setCopied(false);
    }
  }, [isOpen, initialValue]);

  if (!isOpen) return null;

  // Running live evaluated result
  const calculatedResult = expression.trim() !== '' ? evaluateExpression(expression) : 0;

  // Keypad clicks
  const handleKeyClick = (val: string) => {
    setExpression(prev => {
      // Prevent double operators
      if (['+', '-', '×', '÷'].includes(val)) {
        if (!prev) return '0' + val;
        const lastChar = prev.slice(-1);
        if (['+', '-', '×', '÷'].includes(lastChar)) {
          return prev.slice(0, -1) + val;
        }
      }
      // Prevent double decimal points in current number
      if (val === '.') {
        const parts = prev.split(/[+\-×÷]/);
        const currentPart = parts[parts.length - 1];
        if (currentPart.includes('.')) return prev;
        if (!currentPart) return prev + '0.';
      }
      return prev + val;
    });
  };

  const handleBackspace = () => {
    setExpression(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setExpression('');
  };

  const handleEqual = () => {
    if (!expression) return;
    const res = evaluateExpression(expression);
    setExpression(String(res));
  };

  const handleQuickAdd = (amount: number) => {
    setExpression(prev => {
      if (!prev || prev === '0') return String(amount);
      const currentRes = evaluateExpression(prev);
      const newTotal = currentRes + amount;
      return String(Math.round(newTotal * 100) / 100);
    });
  };

  const handlePercentage = (percent: number) => {
    setExpression(prev => {
      if (!prev) return '0';
      const currentRes = evaluateExpression(prev);
      const discounted = currentRes * (1 - percent / 100);
      return String(Math.round(discounted * 100) / 100);
    });
  };

  const handleApply = () => {
    const finalVal = calculatedResult;
    if (onApply) {
      onApply(finalVal);
    }
    onClose();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(String(calculatedResult));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      
      {/* Click outside to close */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full sm:max-w-sm bg-white dark:bg-stone-900 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[92vh] z-10">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-stone-100 dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                {title}
              </h3>
              <p className="text-[10px] text-stone-500 dark:text-stone-400">
                {unitPresets === 'weight' ? 'ওজন হিসাব (কেজি, পাল্লা, মণ)' : 
                 unitPresets === 'money' ? 'টাকা ও বকেয়া হিসাব' : 'সহজ ডিজিটাল ক্যালকুলেটর'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleCopy}
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
              title="ফলাফল কপি করুন"
            >
              {copied ? <CheckCheck className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-500 hover:text-rose-600 dark:text-stone-400 dark:hover:text-rose-400 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
              title="বন্ধ করুন"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Display Screen */}
        <div className="p-3.5 bg-stone-900 text-white select-none">
          {/* Expression line */}
          <div className="text-right text-xs text-stone-400 font-mono h-5 overflow-x-auto scrollbar-none whitespace-nowrap">
            {expression || '০'}
          </div>

          {/* Large Result Line */}
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xs text-emerald-400 font-medium">
              ফলাফল {suffix && `(${suffix})`}:
            </span>
            <div className="text-right">
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400 tracking-tight">
                {toBengaliNumber(calculatedResult)} {suffix}
              </div>
              <div className="text-[11px] font-mono text-stone-400">
                = {calculatedResult.toLocaleString('en-US', { maximumFractionDigits: 4 })}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Produce Shortcuts Bar (আড়তের বিশেষ বোতাম) */}
        {unitPresets === 'weight' && (
          <div className="px-3 py-2 bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-100 dark:border-emerald-900/60 flex items-center justify-between gap-1 overflow-x-auto text-[11px]">
            <span className="text-emerald-800 dark:text-emerald-300 font-semibold text-[10px] shrink-0 flex items-center gap-1">
              <Scale className="w-3 h-3" />
              <span>একক:</span>
            </span>
            <button
              type="button"
              onClick={() => handleQuickAdd(1)}
              className="px-2 py-1 rounded bg-white dark:bg-stone-800 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold active:scale-95 shadow-2xs"
            >
              +১ কেজি
            </button>
            <button
              type="button"
              onClick={() => handleQuickAdd(5)}
              className="px-2 py-1 rounded bg-white dark:bg-stone-800 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold active:scale-95 shadow-2xs"
              title="১ পাল্লা = ৫ কেজি"
            >
              +৫ (পাল্লা)
            </button>
            <button
              type="button"
              onClick={() => handleQuickAdd(40)}
              className="px-2 py-1 rounded bg-white dark:bg-stone-800 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold active:scale-95 shadow-2xs"
              title="১ মণ = ৪০ কেজি"
            >
              +৪০ (মণ)
            </button>
            <button
              type="button"
              onClick={() => handleQuickAdd(50)}
              className="px-2 py-1 rounded bg-white dark:bg-stone-800 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold active:scale-95 shadow-2xs"
              title="১ বস্তা = ৫০ কেজি"
            >
              +৫০ (বস্তা)
            </button>
          </div>
        )}

        {unitPresets === 'money' && (
          <div className="px-3 py-2 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-100 dark:border-amber-900/60 flex items-center justify-between gap-1 overflow-x-auto text-[11px]">
            <span className="text-amber-800 dark:text-amber-300 font-semibold text-[10px] shrink-0 flex items-center gap-1">
              <Coins className="w-3 h-3" />
              <span>নোট:</span>
            </span>
            <button
              type="button"
              onClick={() => handleQuickAdd(50)}
              className="px-2 py-1 rounded bg-white dark:bg-stone-800 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-bold active:scale-95 shadow-2xs"
            >
              +৫০৳
            </button>
            <button
              type="button"
              onClick={() => handleQuickAdd(100)}
              className="px-2 py-1 rounded bg-white dark:bg-stone-800 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-bold active:scale-95 shadow-2xs"
            >
              +১০০৳
            </button>
            <button
              type="button"
              onClick={() => handleQuickAdd(500)}
              className="px-2 py-1 rounded bg-white dark:bg-stone-800 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-bold active:scale-95 shadow-2xs"
            >
              +৫০০৳
            </button>
            <button
              type="button"
              onClick={() => handleQuickAdd(1000)}
              className="px-2 py-1 rounded bg-white dark:bg-stone-800 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-bold active:scale-95 shadow-2xs"
            >
              +১,০০০৳
            </button>
            <button
              type="button"
              onClick={() => handlePercentage(5)}
              className="px-2 py-1 rounded bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 font-bold active:scale-95 shadow-2xs"
              title="৫% ছাড় / কমিশন বাদ"
            >
              -৫%
            </button>
          </div>
        )}

        {/* Keypad Buttons Grid */}
        <div className="p-3 grid grid-cols-4 gap-2 bg-stone-50 dark:bg-stone-900/60 select-none">
          
          {/* Row 1 */}
          <button
            type="button"
            onClick={handleClear}
            className="h-11 rounded-xl bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/60 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 font-bold text-sm active:scale-95 transition-transform flex items-center justify-center"
          >
            AC
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="h-11 rounded-xl bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold text-sm active:scale-95 transition-transform flex items-center justify-center"
            title="মুছুন"
          >
            <Delete className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleKeyClick('%')}
            className="h-11 rounded-xl bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold text-sm active:scale-95 transition-transform"
          >
            %
          </button>
          <button
            type="button"
            onClick={() => handleKeyClick('÷')}
            className="h-11 rounded-xl bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 font-bold text-lg active:scale-95 transition-transform"
          >
            ÷
          </button>

          {/* Row 2 */}
          <button
            type="button"
            onClick={() => handleKeyClick('7')}
            className="h-11 rounded-xl bg-white hover:bg-stone-100 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-900 dark:text-stone-100 font-bold text-base shadow-2xs active:scale-95 transition-transform"
          >
            7
          </button>
          <button
            type="button"
            onClick={() => handleKeyClick('8')}
            className="h-11 rounded-xl bg-white hover:bg-stone-100 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-900 dark:text-stone-100 font-bold text-base shadow-2xs active:scale-95 transition-transform"
          >
            8
          </button>
          <button
            type="button"
            onClick={() => handleKeyClick('9')}
            className="h-11 rounded-xl bg-white hover:bg-stone-100 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-900 dark:text-stone-100 font-bold text-base shadow-2xs active:scale-95 transition-transform"
          >
            9
          </button>
          <button
            type="button"
            onClick={() => handleKeyClick('×')}
            className="h-11 rounded-xl bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 font-bold text-lg active:scale-95 transition-transform"
          >
            ×
          </button>

          {/* Row 3 */}
          <button
            type="button"
            onClick={() => handleKeyClick('4')}
            className="h-11 rounded-xl bg-white hover:bg-stone-100 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-900 dark:text-stone-100 font-bold text-base shadow-2xs active:scale-95 transition-transform"
          >
            4
          </button>
          <button
            type="button"
            onClick={() => handleKeyClick('5')}
            className="h-11 rounded-xl bg-white hover:bg-stone-100 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-900 dark:text-stone-100 font-bold text-base shadow-2xs active:scale-95 transition-transform"
          >
            5
          </button>
          <button
            type="button"
            onClick={() => handleKeyClick('6')}
            className="h-11 rounded-xl bg-white hover:bg-stone-100 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-900 dark:text-stone-100 font-bold text-base shadow-2xs active:scale-95 transition-transform"
          >
            6
          </button>
          <button
            type="button"
            onClick={() => handleKeyClick('-')}
            className="h-11 rounded-xl bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 font-bold text-lg active:scale-95 transition-transform"
          >
            -
          </button>

          {/* Row 4 */}
          <button
            type="button"
            onClick={() => handleKeyClick('1')}
            className="h-11 rounded-xl bg-white hover:bg-stone-100 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-900 dark:text-stone-100 font-bold text-base shadow-2xs active:scale-95 transition-transform"
          >
            1
          </button>
          <button
            type="button"
            onClick={() => handleKeyClick('2')}
            className="h-11 rounded-xl bg-white hover:bg-stone-100 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-900 dark:text-stone-100 font-bold text-base shadow-2xs active:scale-95 transition-transform"
          >
            2
          </button>
          <button
            type="button"
            onClick={() => handleKeyClick('3')}
            className="h-11 rounded-xl bg-white hover:bg-stone-100 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-900 dark:text-stone-100 font-bold text-base shadow-2xs active:scale-95 transition-transform"
          >
            3
          </button>
          <button
            type="button"
            onClick={() => handleKeyClick('+')}
            className="h-11 rounded-xl bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 font-bold text-lg active:scale-95 transition-transform"
          >
            +
          </button>

          {/* Row 5 */}
          <button
            type="button"
            onClick={() => handleKeyClick('0')}
            className="h-11 rounded-xl bg-white hover:bg-stone-100 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-900 dark:text-stone-100 font-bold text-base shadow-2xs active:scale-95 transition-transform"
          >
            0
          </button>
          <button
            type="button"
            onClick={() => handleKeyClick('00')}
            className="h-11 rounded-xl bg-white hover:bg-stone-100 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-900 dark:text-stone-100 font-bold text-sm shadow-2xs active:scale-95 transition-transform"
          >
            00
          </button>
          <button
            type="button"
            onClick={() => handleKeyClick('.')}
            className="h-11 rounded-xl bg-white hover:bg-stone-100 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-900 dark:text-stone-100 font-bold text-base shadow-2xs active:scale-95 transition-transform"
          >
            .
          </button>
          <button
            type="button"
            onClick={handleEqual}
            className="h-11 rounded-xl bg-stone-300 hover:bg-stone-400 dark:bg-stone-700 dark:hover:bg-stone-600 text-stone-900 dark:text-stone-100 font-bold text-lg active:scale-95 transition-transform"
          >
            =
          </button>

        </div>

        {/* Action Buttons: Apply & Cancel */}
        <div className="p-3 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-3 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-semibold transition-colors"
          >
            বাতিল
          </button>

          {onApply && (
            <button
              type="button"
              onClick={handleApply}
              className="flex-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>ইনপুট করুন ({toBengaliNumber(calculatedResult)})</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
