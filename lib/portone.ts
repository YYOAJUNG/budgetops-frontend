/**
 * PortOne 결제 유틸리티
 * 실제 결제 연동 시 @portone/browser-sdk/v2 사용
 */

// import * as PortOne from '@portone/browser-sdk/v2';

const STORE_ID = process.env.NEXT_PUBLIC_PORTONE_STORE_ID || 'imp12345678';
const CHANNEL_KEY = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY || 'channel-key-1234';

export interface PaymentRequest {
  orderName: string;
  amount: number;
  orderUid: string;
  buyerName?: string;
  buyerEmail?: string;
}

export interface PaymentResult {
  success: boolean;
  impUid?: string;
  errorMsg?: string;
}

/**
 * 일반 결제 요청 (일회성 결제)
 */
export async function requestPayment(request: PaymentRequest): Promise<PaymentResult> {
  try {
    // Mock: 실제 PortOne 연동 시 주석 해제
    // const response = await PortOne.requestPayment({
    //   storeId: STORE_ID,
    //   channelKey: CHANNEL_KEY,
    //   paymentId: request.orderUid,
    //   orderName: request.orderName,
    //   totalAmount: request.amount,
    //   currency: 'CURRENCY_KRW',
    //   payMethod: 'CARD',
    //   customer: {
    //     fullName: request.buyerName,
    //     email: request.buyerEmail,
    //   },
    // });

    // Mock 응답 (테스트용)
    console.log('[PortOne Mock] Payment requested:', request);
    return {
      success: true,
      impUid: `billing_mock_${Date.now()}`,
    };
  } catch (error) {
    console.error('Payment error:', error);
    return {
      success: false,
      errorMsg: '결제 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 정기 결제 등록 (빌링키 발급)
 */
export async function issueBillingKey(
  customerUid: string,
  buyerName?: string,
  buyerEmail?: string
): Promise<PaymentResult> {
  try {
    // Mock: 실제 PortOne 연동 시 주석 해제
    // const response = await PortOne.requestIssueBillingKey({
    //   storeId: STORE_ID,
    //   channelKey: CHANNEL_KEY,
    //   billingKeyMethod: 'CARD',
    //   customer: {
    //     customerId: customerUid,
    //     fullName: buyerName,
    //     email: buyerEmail,
    //   },
    //   issueId: `BILLING-${Date.now()}`,
    //   issueName: '정기 결제 등록',
    // });

    // Mock 응답 (테스트용)
    console.log('[PortOne Mock] Billing key issued:', { customerUid, buyerName, buyerEmail });
    return {
      success: true,
      impUid: `billing_mock_${Date.now()}`,
    };
  } catch (error) {
    console.error('Billing key error:', error);
    return {
      success: false,
      errorMsg: '결제 수단 등록 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 주문 번호 생성
 */
export function generateOrderUid(prefix: string = 'ORDER'): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}
