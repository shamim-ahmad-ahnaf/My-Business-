import { UnitType } from '../types';

// Convert English digits to Bengali digits
export function toBengaliNumber(val: number | string | undefined | null): string {
  if (val === undefined || val === null || val === '') return '০';
  const banglaDigits: { [key: string]: string } = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯',
    '.': '.', ',': ','
  };
  return val.toString().replace(/[0-9]/g, (w) => banglaDigits[w] || w);
}

// Format currency in Taka with ৳ symbol and Bengali numbers
export function formatTaka(amount: number, useBengaliDigits = true): string {
  const rounded = Math.round(amount);
  const formattedEn = new Intl.NumberFormat('en-IN').format(rounded);
  if (!useBengaliDigits) {
    return `৳${formattedEn}`;
  }
  return `৳${toBengaliNumber(formattedEn)}`;
}

// Convert quantity and unit to KG
export function convertToKg(quantity: number, unit: UnitType): number {
  switch (unit) {
    case 'কেজি':
      return quantity;
    case 'পাল্লা':
      return quantity * 5; // 1 palla = 5 kg
    case 'মণ':
      return quantity * 40; // 1 mon = 40 kg
    case 'বস্তা':
      return quantity * 50; // standard vegetable sack ~ 50 kg
    case 'খাঁচা':
      return quantity * 25; // standard crate ~ 25 kg
    case 'পিস':
      return quantity; // treated as discrete units
    default:
      return quantity;
  }
}

// Convert KG back to a readable compound string (e.g. "২ মণ ৫ কেজি" or "৪৫ কেজি")
export function formatWeight(kg: number): string {
  if (kg >= 40) {
    const mon = Math.floor(kg / 40);
    const remainingKg = Math.round(kg % 40);
    if (remainingKg === 0) {
      return `${toBengaliNumber(mon)} মণ`;
    }
    return `${toBengaliNumber(mon)} মণ ${toBengaliNumber(remainingKg)} কেজি`;
  }
  return `${toBengaliNumber(Math.round(kg * 10) / 10)} কেজি`;
}

// Format Date in Bengali
export function formatBanglaDate(isoString: string, includeTime = false): string {
  try {
    const date = new Date(isoString);
    const months = [
      'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
      'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
    ];
    const day = toBengaliNumber(date.getDate());
    const month = months[date.getMonth()];
    const year = toBengaliNumber(date.getFullYear());

    if (!includeTime) {
      return `${day} ${month}, ${year}`;
    }

    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'অপরাহ্ন' : 'পূর্বাহ্ন';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 becomes 12
    const minStr = minutes < 10 ? `০${toBengaliNumber(minutes)}` : toBengaliNumber(minutes);

    return `${day} ${month}, ${year} (${ampm} ${toBengaliNumber(hours)}:${minStr})`;
  } catch {
    return isoString;
  }
}

// Convert amount to Bengali in-words text
export function amountInBengaliWords(num: number): string {
  const integerPart = Math.floor(Math.abs(num));
  if (integerPart === 0) return 'শূন্য টাকা মাত্র';

  const units = ['', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়', 'দশ',
    'এগারো', 'বারো', 'তেরো', 'চৌদ্দ', 'পনেরো', 'ষোল', 'সতেরো', 'আঠারো', 'উনিশ', 'বিশ',
    'একুশ', 'বাইশ', 'তেইশ', 'চব্বিশ', 'পঁচিশ', 'ছাব্বিশ', 'সাতাশ', 'আটাশ', 'উনত্রিশ', 'ত্রিশ',
    'একত্রিশ', 'বত্রিশ', 'তেত্রিশ', 'চৌত্রিশ', 'পঁয়ত্রিশ', 'ছত্রিশ', 'সাঁইত্রিশ', 'আটত্রিশ', 'উনচল্লিশ', 'চল্লিশ',
    'একচল্লিশ', 'বিয়াল্লিশ', 'তেতাল্লিশ', 'চুয়াল্লিশ', 'পঁয়তাল্লিশ', 'ছেচল্লিশ', 'সাতচল্লিশ', 'আটচল্লিশ', 'উনপঞ্চাশ', 'পঞ্চাশ',
    'একান্ন', 'বায়ান্ন', 'তিপ্পান্ন', 'চুয়ান্ন', 'পঞ্চান্ন', 'ছাপ্পান্ন', 'সাতান্ন', 'আটান্ন', 'উনষাট', 'ষাট',
    'একষট্টি', 'বাষট্টি', 'তেষট্টি', 'চৌষট্টি', 'পঁয়ষট্টি', 'ছেষট্টি', 'সাতষট্টি', 'আটষট্টি', 'উনসত্তর', 'সত্তর',
    'একাত্তর', 'বাহাত্তর', 'তিয়াত্তর', 'চুয়াত্তর', 'পঁচাত্তর', 'ছিয়াত্তর', 'সাতাত্তর', 'আটাত্তর', 'উনাশি', 'আশি',
    'একাশি', 'বিরাশি', 'তিরাশি', 'চুরাশি', 'পঁচাশি', 'ছিয়াশি', 'সাতাশি', 'আটাশি', 'ঊননব্বই', 'নব্বই',
    'একানব্বই', 'বিরানব্বই', 'তিরানব্বই', 'চুরানব্বই', 'পঁচানব্বই', 'ছিয়ানব্বই', 'সাতানব্বই', 'আটানব্বই', 'নিরানব্বই'
  ];

  function convertSubThousand(n: number): string {
    let result = '';
    const hundred = Math.floor(n / 100);
    const rem = n % 100;
    if (hundred > 0) {
      result += (hundred === 1 ? 'একশত ' : units[hundred] + ' শত ');
    }
    if (rem > 0) {
      result += units[rem] + ' ';
    }
    return result;
  }

  let result = '';
  let n = integerPart;

  const crore = Math.floor(n / 10000000);
  n %= 10000000;
  if (crore > 0) {
    result += units[crore] + ' কোটি ';
  }

  const lakh = Math.floor(n / 100000);
  n %= 100000;
  if (lakh > 0) {
    result += units[lakh] + ' লাখ ';
  }

  const thousand = Math.floor(n / 1000);
  n %= 1000;
  if (thousand > 0) {
    result += units[thousand] + ' হাজার ';
  }

  if (n > 0) {
    result += convertSubThousand(n);
  }

  return `${result.trim()} টাকা মাত্র`;
}
