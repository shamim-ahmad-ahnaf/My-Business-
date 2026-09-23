import React, { useState } from 'react';
import { Calculator } from 'lucide-react';
import { InputCalculatorModal } from './InputCalculatorModal';

export const FloatingCalculator: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Action Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-18 sm:bottom-6 right-4 sm:right-6 z-30 p-3 sm:p-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-900/30 flex items-center justify-center active:scale-95 transition-all hover:scale-105 border-2 border-white dark:border-stone-800"
        title="দ্রুত হিসাব ক্যালকুলেটর"
        aria-label="দ্রুত হিসাব ক্যালকুলেটর"
      >
        <Calculator className="w-5 h-5 sm:w-6 sm:h-6" />
        <span className="sr-only">ক্যালকুলেটর</span>
      </button>

      {/* Calculator Modal */}
      <InputCalculatorModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="আড়ত হিসাব ক্যালকুলেটর"
        unitPresets="weight"
        suffix="৳/কেজি"
      />
    </>
  );
};
