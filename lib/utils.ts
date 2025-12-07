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
  // -0을 0으로 변환 (Object.is를 사용하여 -0을 정확히 감지)
  const normalizedAmount = Object.is(amount, -0) ? 0 : amount;
  
  if (currency === 'KRW') {
    // 한국 원화는 "1,000원" 형태로 표시
    const formatted = new Intl.NumberFormat('ko-KR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(normalizedAmount);
    const result = `${formatted}원`;
    // "-0원" 또는 "-0,000원" 같은 경우를 "0원"으로 변경 (0으로 시작하는 음수는 모두 0으로 처리)
    return result.replace(/^-0/, '0');
  } else {
    // USD는 "$1,000" 형태로 표시
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(normalizedAmount);
    // "-$0" 같은 경우를 "$0"으로 변경
    return formatted.replace(/^-/, '');
  }
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num)
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
}

/**
 * 날짜를 KST(한국 표준시)로 변환하여 날짜만 표시
 * @param dateString ISO 8601 형식의 날짜 문자열
 * @returns "YYYY.MM.DD" 형식의 문자열
 */
/**
 * 날짜를 KST(한국 표준시)로 변환하여 날짜만 표시
 * @param dateString ISO 8601 형식의 날짜 문자열
 * @returns "YYYY.MM.DD" 형식의 문자열
 */
export function formatDateKST(dateString: string): string {
  try {
    // 타임존 정보가 없으면 'Z'를 추가해서 UTC로 명시
    let utcString = dateString.trim();
    // 'T' 이후 부분에서 타임존 정보 확인
    const tIndex = utcString.indexOf('T');
    if (tIndex > 0 && !utcString.endsWith('Z')) {
      const afterT = utcString.substring(tIndex + 1);
      // 'T' 이후에 '+' 또는 '-' (오프셋) 또는 'Z'가 없으면 'Z' 추가
      if (!afterT.includes('+') && !afterT.includes('-') && !afterT.includes('Z')) {
        utcString = utcString + 'Z';
      }
    }
    
    // UTC 시간으로 파싱
    const date = new Date(utcString);
    
    // UTC 시간에 9시간을 더해서 KST로 변환 (KST = UTC + 9)
    const kstDate = new Date(date.getTime() + (9 * 60 * 60 * 1000));
    
    // UTC 메서드를 사용해서 KST 날짜 추출 (이미 9시간을 더했으므로)
    const year = kstDate.getUTCFullYear();
    const month = String(kstDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(kstDate.getUTCDate()).padStart(2, '0');
    
    return `${year}.${month}.${day}`;
  } catch (error) {
    console.error('날짜 포맷팅 오류:', error);
    return dateString;
  }
}

/**
 * 날짜를 KST(한국 표준시)로 변환하여 날짜와 시간 표시
 * @param dateString ISO 8601 형식의 날짜 문자열 또는 null
 * @returns "YYYY.MM.DD HH:mm" 형식의 문자열 또는 "-"
 */
export function formatDateTimeKST(dateString: string | null): string {
  if (!dateString) return '-';
  
  try {
    // 타임존 정보가 없으면 'Z'를 추가해서 UTC로 명시
    let utcString = dateString.trim();
    // 'T' 이후 부분에서 타임존 정보 확인
    const tIndex = utcString.indexOf('T');
    if (tIndex > 0 && !utcString.endsWith('Z')) {
      const afterT = utcString.substring(tIndex + 1);
      // 'T' 이후에 '+' 또는 '-' (오프셋) 또는 'Z'가 없으면 'Z' 추가
      if (!afterT.includes('+') && !afterT.includes('-') && !afterT.includes('Z')) {
        utcString = utcString + 'Z';
      }
    }
    
    // UTC 시간으로 파싱
    const date = new Date(utcString);
    
    // UTC 시간에 9시간을 더해서 KST로 변환 (KST = UTC + 9)
    const kstDate = new Date(date.getTime() + (9 * 60 * 60 * 1000));
    
    // UTC 메서드를 사용해서 KST 시간 추출 (이미 9시간을 더했으므로)
    const year = kstDate.getUTCFullYear();
    const month = String(kstDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(kstDate.getUTCDate()).padStart(2, '0');
    const hour = String(kstDate.getUTCHours()).padStart(2, '0');
    const minute = String(kstDate.getUTCMinutes()).padStart(2, '0');
    
    return `${year}.${month}.${day} ${hour}:${minute}`;
  } catch (error) {
    console.error('날짜 포맷팅 오류:', error);
    return '-';
  }
}

/**
 * 간단한 형태의 통화 포맷팅 (예: "1.2M원", "500K원")
 */
export function formatCurrencyCompact(amount: number, currency: 'KRW' | 'USD' = 'KRW'): string {
  const normalizedAmount = Object.is(amount, -0) ? 0 : amount;
  const absAmount = Math.abs(normalizedAmount);
  
  if (currency === 'KRW') {
    if (absAmount >= 100000000) {
      // 1억 이상: "1.2억원"
      return `${(normalizedAmount / 100000000).toFixed(1)}억원`;
    } else if (absAmount >= 10000) {
      // 1만 이상: "1.2만원"
      return `${(normalizedAmount / 10000).toFixed(1)}만원`;
    } else if (absAmount >= 1000) {
      // 1천 이상: "1.2천원"
      return `${(normalizedAmount / 1000).toFixed(1)}천원`;
    } else {
      return `${Math.round(normalizedAmount)}원`;
    }
  } else {
    // USD
    if (absAmount >= 1000000) {
      return `$${(normalizedAmount / 1000000).toFixed(1)}M`;
    } else if (absAmount >= 1000) {
      return `$${(normalizedAmount / 1000).toFixed(1)}K`;
    } else {
      return `$${Math.round(normalizedAmount)}`;
    }
  }
}

/**
 * HHI (Herfindahl-Hirschman Index) 계산
 * 시장 집중도를 측정하는 지수: Σ(시장점유율²) × 100
 * @param amounts 각 공급자의 금액 배열
 * @returns HHI 값 (0 ~ 10000)
 */
export function calculateHHI(amounts: number[]): number {
  if (amounts.length === 0) return 0;
  
  const total = amounts.reduce((sum, amount) => sum + amount, 0);
  if (total === 0) return 0;
  
  // 각 공급자의 시장점유율을 계산하고 제곱한 후 합산
  const hhi = amounts.reduce((sum, amount) => {
    const marketShare = (amount / total) * 100; // 퍼센트로 변환
    return sum + (marketShare * marketShare);
  }, 0);
  
  return hhi;
}

