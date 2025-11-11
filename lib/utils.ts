import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * USD를 KRW로 변환 (환율: 약 1,350원, 실시간 환율 API 연동 가능)
 */
export function convertUsdToKrw(usdAmount: number): number {
  // TODO: 실시간 환율 API 연동 가능
  const exchangeRate = 1350; // USD to KRW 환율
  return usdAmount * exchangeRate;
}

/**
 * KRW를 USD로 변환
 */
export function convertKrwToUsd(krwAmount: number): number {
  const exchangeRate = 1350; // USD to KRW 환율
  return krwAmount / exchangeRate;
}

/**
 * 통화 변환 (USD <-> KRW)
 */
export function convertCurrency(
  amount: number,
  fromCurrency: 'KRW' | 'USD',
  toCurrency: 'KRW' | 'USD'
): number {
  if (fromCurrency === toCurrency) {
    return amount;
  }
  if (fromCurrency === 'USD' && toCurrency === 'KRW') {
    return convertUsdToKrw(amount);
  }
  if (fromCurrency === 'KRW' && toCurrency === 'USD') {
    return convertKrwToUsd(amount);
  }
  return amount;
}

export function formatCurrency(amount: number, currency: 'KRW' | 'USD' = 'KRW'): string {
  // 0일 때는 "-" 기호 없이 표시
  if (amount === 0) {
    const formatted = new Intl.NumberFormat(currency === 'KRW' ? 'ko-KR' : 'en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(0);
    // "-₩0" 또는 "-$0" 같은 경우를 "₩0" 또는 "$0"으로 변경
    return formatted.replace(/^-/, '');
  }
  return new Intl.NumberFormat(currency === 'KRW' ? 'ko-KR' : 'en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num)
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
}

