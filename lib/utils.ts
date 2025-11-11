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
  if (currency === 'KRW') {
    // 한국 원화는 "1,000원" 형태로 표시
    const formatted = new Intl.NumberFormat('ko-KR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
    return `${formatted}원`;
  } else {
    // USD는 "$1,000" 형태로 표시
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
    return formatted.replace(/^-/, ''); // "-$0" 같은 경우를 "$0"으로 변경
  }
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num)
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
}

