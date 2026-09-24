import { Request, Response } from 'express';
import { paymentService } from '../services/paymentService';
import { db } from '../database/db';

export class PaymentController {
  public async createPaymentIntent(req: Request, res: Response) {
    try {
      const { orderId, amount, paymentMethod, customer } = req.body;

      if (!orderId || !amount || !paymentMethod) {
        return res.status(400).json({
          success: false,
          message: 'Order ID, amount, and payment method are required.',
        });
      }

      const intent = await paymentService.createPaymentIntent({
        orderId,
        amount,
        paymentMethod,
        customer: customer || {
          name: 'Customer',
          email: 'customer@picklemart.in',
          phone: '9876543210',
        },
      });

      return res.json({
        success: true,
        intent,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  public async verifyPayment(req: Request, res: Response) {
    try {
      const { orderId, gatewayOrderId, gatewayPaymentId, paymentMethod, shouldFail } = req.body;

      const verification = await paymentService.verifyPayment(
        gatewayOrderId,
        gatewayPaymentId,
        paymentMethod,
        shouldFail
      );

      if (!verification.success) {
        return res.status(400).json({
          success: false,
          message: verification.errorMessage || 'Payment verification failed.',
          verification,
        });
      }

      // Update Order & Payment record
      if (orderId) {
        const orders = db.getStore('orders');
        const order = orders.find(o => o.id === orderId || o.order_number === orderId);
        if (order) {
          order.payment_status = 'Paid';
          order.order_status = 'Payment Confirmed';
          order.updated_at = new Date().toISOString();
        }

        const payments = db.getStore('payments');
        payments.push({
          id: `pay_${Date.now()}`,
          order_id: orderId,
          gateway_order_id: gatewayOrderId,
          gateway_payment_id: verification.gatewayPaymentId,
          payment_method: paymentMethod,
          amount: order ? order.total_amount : 0,
          status: 'Success',
          created_at: new Date().toISOString(),
        });
      }

      return res.json({
        success: true,
        message: 'Payment verified successfully.',
        verification,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}

export const paymentController = new PaymentController();
