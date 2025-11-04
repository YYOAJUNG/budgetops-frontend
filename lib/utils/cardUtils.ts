/**
 * 카드 관련 유틸리티 함수
 */

export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'jcb' | 'diners' | 'discover' | 'unknown';

/**
 * 카드 번호로 브랜드 감지
 */
export function detectCardBrand(cardNumber: string): CardBrand {
  const cleaned = cardNumber.replace(/\s/g, '');

  if (/^4/.test(cleaned)) return 'visa';
  if (/^5[1-5]/.test(cleaned) || /^2(2[2-9]|[3-6]|7[0-1]|720)/.test(cleaned)) return 'mastercard';
  if (/^3[47]/.test(cleaned)) return 'amex';
  if (/^35(2[89]|[3-8])/.test(cleaned)) return 'jcb';
  if (/^3(0[0-5]|[68])/.test(cleaned)) return 'diners';
  if (/^6(011|5)/.test(cleaned)) return 'discover';

  return 'unknown';
}

/**
 * 카드 브랜드 표시 이름
 */
export function getCardBrandName(brand: CardBrand): string {
  const brandNames: Record<CardBrand, string> = {
    visa: 'Visa',
    mastercard: 'Mastercard',
    amex: 'American Express',
    jcb: 'JCB',
    diners: 'Diners Club',
    discover: 'Discover',
    unknown: '카드',
  };
  return brandNames[brand];
}

/**
 * 카드 번호 포맷팅 (4자리마다 공백)
 */
export function formatCardNumber(cardNumber: string): string {
  return cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ');
}

/**
 * 카드 번호 언포맷팅 (숫자만 추출)
 */
export function unformatCardNumber(cardNumber: string): string {
  return cardNumber.replace(/\D/g, '');
}
