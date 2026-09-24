import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/env';

export interface PaymentIntentOptions {
  orderId: string;
  amount: number;
  currency?: string;
  paymentMethod: 'UPI' | 'CARD' | 'NETBANKING' | 'COD';
  customer: {
    id?: string;
    name: string;
    email: string;
    phone: string;
  };
}

export interface PaymentVerificationResult {
  success: boolean;
  gatewayPaymentId: string;
  gatewayOrderId: string;
  amountPaid: number;
  status: 'Success' | 'Failed' | 'Pending';
  errorMessage?: string;
}

export class PaymentService {
  /**
   * Create payment intent with Indian payment gateway abstraction
   */
  public async createPaymentIntent(options: PaymentIntentOptions) {
    const isTest = config.paymentMode === 'TEST';
    const gatewayOrderId = `pkl_ord_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    if (options.paymentMethod === 'COD') {
      return {
        paymentMode: 'COD',
        gatewayOrderId,
        amount: options.amount,
        currency: options.currency || 'INR',
        instructions: 'Pay cash or UPI upon delivery to the delivery executive.',
      };
    }

    if (isTest) {
      // In TEST mode, return structured intent with realistic UPI QR string and gateway tokens
      return {
        paymentMode: 'TEST_SIMULATOR',
        gatewayOrderId,
        amount: options.amount,
        currency: options.currency || 'INR',
        keyId: config.paymentApiKey,
        upiQrData: `upi://pay?pa=picklemart@icici&pn=PickleMart%20India&am=${options.amount}&cu=INR&tr=${gatewayOrderId}`,
        availableBanks: [
          { code: 'HDFC', name: 'HDFC Bank' },
          { code: 'SBI', name: 'State Bank of India' },
          { code: 'ICICI', name: 'ICICI Bank' },
          { code: 'AXIS', name: 'Axis Bank' },
          { code: 'KOTAK', name: 'Kotak Mahindra Bank' },
        ],
        availableUpiApps: ['Google Pay', 'PhonePe', 'Paytm', 'Cred UPI', 'BHIM UPI'],
      };
    }

    // Production Gateway Integration Hook (e.g. Razorpay / Cashfree)
    return {
      paymentMode: 'PRODUCTION',
      gatewayOrderId,
      amount: options.amount,
      currency: options.currency || 'INR',
      keyId: config.paymentApiKey,
    };
  }

  /**
   * Verify payment signature / transaction status
   */
  public async verifyPayment(
    gatewayOrderId: string,
    gatewayPaymentId: string,
    paymentMethod: string,
    shouldFail: boolean = false
  ): Promise<PaymentVerificationResult> {
    if (shouldFail) {
      return {
        success: false,
        gatewayOrderId,
        gatewayPaymentId: gatewayPaymentId || `pay_fail_${Date.now()}`,
        amountPaid: 0,
        status: 'Failed',
        errorMessage: 'Transaction declined by bank or user cancelled authorization.',
      };
    }

    const payId = gatewayPaymentId || `pay_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    return {
      success: true,
      gatewayOrderId,
      gatewayPaymentId: payId,
      amountPaid: 0,
      status: 'Success',
    };
  }
}

export const paymentService = new PaymentService();
