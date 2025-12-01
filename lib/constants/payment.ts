/**
 * 결제 관련 상수
 */

// 테스트 사용자 정보
export const TEST_USER = {
  name: '테스트 사용자',
  email: 'test@example.com',
};

// 결제 에러 메시지
export const PAYMENT_ERRORS = {
  BILLING_KEY_FAILED: '결제 수단 등록에 실패했습니다.',
  PAYMENT_FAILED: '결제에 실패했습니다.',
  PLAN_CHANGE_FAILED: '플랜 변경 중 오류가 발생했습니다.',
  TOKEN_PURCHASE_FAILED: '토큰 구매 중 오류가 발생했습니다.',
} as const;

// 결제 성공 메시지
export const PAYMENT_SUCCESS = {
  PLAN_CHANGED: '플랜이 변경되었습니다.',
  TOKEN_PURCHASED: (amount: number) => `토큰 ${amount}개 구매가 완료되었습니다!`,
} as const;
