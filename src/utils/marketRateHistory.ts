import { PriceHistoryPoint, MarketRate, VegetableItem } from '../types';
import { toBengaliNumber } from './formatters';

const BANGLA_SHORT_MONTHS = [
  'জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'
];

const BANGLA_FULL_MONTHS = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

// Simple deterministic hash for consistent pseudo-random price variation based on string seed
function pseudoRandomSeed(seedStr: string): () => number {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  let x = Math.abs(hash) + 12345;
  return () => {
    x = (x * 9301 + 49297) % 233280;
    return x / 233280;
  };
}

/**
 * Generate 30-day realistic historical price series for a produce item.
 * Guarantees that:
 * - Day 30 matches current today's wholesale and retail price.
 * - Day 29 matches yesterday's wholesale price.
 * - Wholesale price and retail price exhibit realistic seasonal produce market drift.
 * - Retail price always maintains a realistic markup above wholesale.
 */
export function generate30DayPriceHistory(
  rate: Pick<MarketRate, 'itemId' | 'itemName' | 'todayWholesaleKg' | 'yesterdayWholesaleKg' | 'todayRetailKg'>,
  daysCount: number = 30
): PriceHistoryPoint[] {
  const seed = pseudoRandomSeed(`${rate.itemId}-30d-price-history`);
  const points: PriceHistoryPoint[] = [];

  const todayWholesale = rate.todayWholesaleKg || 30;
  const todayRetail = rate.todayRetailKg || Math.round(todayWholesale * 1.25);
  const yesterdayWholesale = rate.yesterdayWholesaleKg || todayWholesale;
  const yesterdayRetail = Math.round(todayRetail - (todayWholesale - yesterdayWholesale) * 0.7);

  // We anchor the reference date to today (or latest local date 2026-10-12)
  const now = new Date();
  // Ensure stable reference date if system clock is 2026
  const refDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Work backwards from Day 30 to Day 1
  // We construct a backward random walk from today
  const wholesaleSeries: number[] = new Array(daysCount);
  const retailSeries: number[] = new Array(daysCount);

  // Day 30 (index daysCount - 1) is today
  wholesaleSeries[daysCount - 1] = todayWholesale;
  retailSeries[daysCount - 1] = todayRetail;

  // Day 29 (index daysCount - 2) is yesterday
  if (daysCount >= 2) {
    wholesaleSeries[daysCount - 2] = yesterdayWholesale;
    retailSeries[daysCount - 2] = yesterdayRetail > yesterdayWholesale ? yesterdayRetail : yesterdayWholesale + Math.round(todayRetail - todayWholesale);
  }

  // Pre-calculate natural market drift and gentle volatility
  const volatilityMagnitude = Math.max(1.5, Math.round(todayWholesale * 0.035));
  let curWholesale = yesterdayWholesale;

  for (let i = daysCount - 3; i >= 0; i--) {
    // Produce price cyclical drift (simulating supply surges and seasonal demand waves)
    const sinWave = Math.sin((i / daysCount) * Math.PI * 3);
    const noise = (seed() - 0.48) * volatilityMagnitude * 1.8;
    const step = Math.round(sinWave * 1.2 + noise);

    curWholesale = Math.max(Math.round(todayWholesale * 0.65), curWholesale - step);
    curWholesale = Math.min(Math.round(todayWholesale * 1.35), curWholesale);
    wholesaleSeries[i] = curWholesale;

    // Retail price markup in Kacha Bazar (typically 18% to 35% higher with minimum Tk 5 spread)
    const markupFactor = 1.18 + seed() * 0.14;
    const minSpread = Math.max(5, Math.round(curWholesale * 0.15));
    const calcRetail = Math.max(curWholesale + minSpread, Math.round(curWholesale * markupFactor));
    retailSeries[i] = calcRetail;
  }

  // Build the PriceHistoryPoint array in chronological order (Day 1 -> Day 30)
  for (let i = 0; i < daysCount; i++) {
    const daysAgo = (daysCount - 1) - i;
    const pointDate = new Date(refDate);
    pointDate.setDate(refDate.getDate() - daysAgo);

    const year = pointDate.getFullYear();
    const month = pointDate.getMonth();
    const day = pointDate.getDate();

    const isoDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayBn = toBengaliNumber(day);
    const shortDateBn = `${dayBn} ${BANGLA_SHORT_MONTHS[month]}`;
    const formattedDateBn = `${dayBn} ${BANGLA_FULL_MONTHS[month]}, ${toBengaliNumber(year)}`;

    const wPrice = wholesaleSeries[i];
    const rPrice = retailSeries[i];
    const margin = Math.max(0, rPrice - wPrice);
    const marginPercent = wPrice > 0 ? parseFloat(((margin / wPrice) * 100).toFixed(1)) : 0;

    points.push({
      date: isoDate,
      dayNumber: i + 1,
      formattedDateBn,
      shortDateBn,
      wholesalePrice: wPrice,
      retailPrice: rPrice,
      margin,
      marginPercent
    });
  }

  return points;
}

export interface PriceHistoryStats {
  latestWholesale: number;
  latestRetail: number;
  latestMargin: number;
  latestMarginPercent: number;
  startWholesale: number;
  startRetail: number;
  wholesaleChange: number;
  wholesaleChangePercent: number;
  retailChange: number;
  retailChangePercent: number;
  minWholesale: number;
  maxWholesale: number;
  minRetail: number;
  maxRetail: number;
  avgWholesale: number;
  avgRetail: number;
  avgMargin: number;
  avgMarginPercent: number;
  bestMarginDay: PriceHistoryPoint;
  lowestMarginDay: PriceHistoryPoint;
  trend: 'up' | 'down' | 'stable';
  marketAnalysisBn: string;
}

export function calculatePriceHistoryStats(history: PriceHistoryPoint[]): PriceHistoryStats | null {
  if (!history || history.length === 0) return null;

  const count = history.length;
  const latest = history[count - 1];
  const start = history[0];

  const wholesalePrices = history.map(h => h.wholesalePrice);
  const retailPrices = history.map(h => h.retailPrice);
  const margins = history.map(h => h.margin);

  const minWholesale = Math.min(...wholesalePrices);
  const maxWholesale = Math.max(...wholesalePrices);
  const minRetail = Math.min(...retailPrices);
  const maxRetail = Math.max(...retailPrices);

  const sumWholesale = wholesalePrices.reduce((a, b) => a + b, 0);
  const sumRetail = retailPrices.reduce((a, b) => a + b, 0);
  const sumMargin = margins.reduce((a, b) => a + b, 0);

  const avgWholesale = Math.round(sumWholesale / count);
  const avgRetail = Math.round(sumRetail / count);
  const avgMargin = Math.round(sumMargin / count);
  const avgMarginPercent = avgWholesale > 0 ? parseFloat(((avgMargin / avgWholesale) * 100).toFixed(1)) : 0;

  const wholesaleChange = latest.wholesalePrice - start.wholesalePrice;
  const wholesaleChangePercent = start.wholesalePrice > 0
    ? parseFloat(((wholesaleChange / start.wholesalePrice) * 100).toFixed(1))
    : 0;

  const retailChange = latest.retailPrice - start.retailPrice;
  const retailChangePercent = start.retailPrice > 0
    ? parseFloat(((retailChange / start.retailPrice) * 100).toFixed(1))
    : 0;

  const sortedByMargin = [...history].sort((a, b) => b.margin - a.margin);
  const bestMarginDay = sortedByMargin[0];
  const lowestMarginDay = sortedByMargin[sortedByMargin.length - 1];

  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (wholesaleChangePercent > 3.0) {
    trend = 'up';
  } else if (wholesaleChangePercent < -3.0) {
    trend = 'down';
  }

  // Generate intelligent trading insights based on margin and price volatility
  let marketAnalysisBn = '';
  if (trend === 'up') {
    marketAnalysisBn = `বিগত ৩০ দিনে পাইকারি দর ৳${toBengaliNumber(Math.abs(wholesaleChange))} (${toBengaliNumber(Math.abs(wholesaleChangePercent))}%) বৃদ্ধি পেয়েছে। আড়তে মোকাম থেকে সরবরাহ সীমিত থাকায় খুচরা পর্যায়েও দর সমন্বয়ের পরামর্শ দেওয়া হচ্ছে।`;
  } else if (trend === 'down') {
    marketAnalysisBn = `বিগত ৩০ দিনে পাইকারি দর ৳${toBengaliNumber(Math.abs(wholesaleChange))} (${toBengaliNumber(Math.abs(wholesaleChangePercent))}%) হ্রাস পেয়েছে। কৃষকদের সরবরাহ বৃদ্ধি পাওয়ায় বর্তমানে পাইকারি ও খুচরা মূল্যের ব্যবধানে গড় মুনাফা ৳${toBengaliNumber(avgMargin)}/কেজি পাওয়া যাচ্ছে।`;
  } else {
    marketAnalysisBn = `বিগত ৩০ দিনে এই সবজির বাজারদর অনেকটাই স্থিতিশীল রয়েছে (গড় পাইকারি ৳${toBengaliNumber(avgWholesale)} এবং গড় খুচরা ৳${toBengaliNumber(avgRetail)})। নিয়মিত বিক্রয় মার্জিন বজায় রয়েছে।`;
  }

  return {
    latestWholesale: latest.wholesalePrice,
    latestRetail: latest.retailPrice,
    latestMargin: latest.margin,
    latestMarginPercent: latest.marginPercent,
    startWholesale: start.wholesalePrice,
    startRetail: start.retailPrice,
    wholesaleChange,
    wholesaleChangePercent,
    retailChange,
    retailChangePercent,
    minWholesale,
    maxWholesale,
    minRetail,
    maxRetail,
    avgWholesale,
    avgRetail,
    avgMargin,
    avgMarginPercent,
    bestMarginDay,
    lowestMarginDay,
    trend,
    marketAnalysisBn
  };
}
