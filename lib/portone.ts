/**
 * PortOne 결제 유틸리티
 * 카카오페이 간편결제 연동
 */

const STORE_ID = process.env.NEXT_PUBLIC_PORTONE_STORE_ID || 'imp12345678';

declare global {
  interface Window {
    IMP?: {
      init: (storeId: string) => void;
      request_pay: (params: any, callback: (response: any) => void) => void;
    };
  }
}

export interface PaymentResult {
  success: boolean;
  impUid?: string;
  customerUid?: string;
  errorMsg?: string;
}

/**
 * 카카오페이 결제 수단 등록 (0원 결제)
 */
export async function registerPaymentMethod(
  customerUid: string,
  buyerName: string,
  buyerEmail: string
): Promise<PaymentResult> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.IMP) {
      resolve({
        success: false,
        errorMsg: 'PortOne SDK가 로드되지 않았습니다.',
      });
      return;
    }

    window.IMP.init(STORE_ID);

    window.IMP.request_pay(
      {
        pg: 'kakaopay',
        pay_method: 'card',
        merchant_uid: `billing_${Date.now()}`,
        name: '카카오페이 결제 수단 등록',
        amount: 0,
        buyer_email: buyerEmail,
        buyer_name: buyerName,
        customer_uid: customerUid,
      },
      (response: any) => {
        console.log('[PortOne] 카카오페이 응답:', response);

        if (response.success) {
          resolve({
            success: true,
            impUid: response.imp_uid,
            customerUid: customerUid,
          });
        } else {
          resolve({
            success: false,
            errorMsg: response.error_msg || '결제 수단 등록에 실패했습니다.',
          });
        }
      }
    );
  });
}

/**
 * 실제 결제 진행 (토큰 구매용)
 */
export interface PaymentRequest {
  orderName: string;
  amount: number;
  orderUid: string;
  buyerName?: string;
  buyerEmail?: string;
}

/**
 * 일회성 결제 (카카오페이)
 */
export async function requestPayment(request: PaymentRequest): Promise<PaymentResult> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.IMP) {
      resolve({
        success: false,
        errorMsg: 'PortOne SDK가 로드되지 않았습니다.',
      });
      return;
    }

    window.IMP.init(STORE_ID);

    window.IMP.request_pay(
      {
        pg: 'kakaopay',
        pay_method: 'card',
        merchant_uid: request.orderUid,
        name: request.orderName,
        amount: request.amount,
        buyer_email: request.buyerEmail,
        buyer_name: request.buyerName,
      },
      (response: any) => {
        console.log('[PortOne] 일회성 결제 응답:', response);

        if (response.success) {
          resolve({
            success: true,
            impUid: response.imp_uid,
          });
        } else {
          resolve({
            success: false,
            errorMsg: response.error_msg || '결제에 실패했습니다.',
          });
        }
      }
    );
  });
}

/**
 * 주문 고유번호 생성
 */
export function generateOrderUid(prefix: string = 'ORDER'): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}
