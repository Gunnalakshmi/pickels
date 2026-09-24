import { Request, Response } from 'express';
import { db } from '../database/db';

export class CouponController {
  public async getAvailableCoupons(req: Request, res: Response) {
    try {
      const coupons = db.getStore('coupons').filter(c => c.is_active);
      return res.json({ success: true, coupons });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  public async validateCoupon(req: Request, res: Response) {
    try {
      const { code, cartSubtotal } = req.body;
      if (!code) {
        return res.status(400).json({ success: false, message: 'Please provide coupon code.' });
      }

      const coupons = db.getStore('coupons');
      const cpn = coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase() && c.is_active);

      if (!cpn) {
        return res.status(404).json({ success: false, message: 'Invalid or expired coupon code.' });
      }

      const subtotal = Number(cartSubtotal) || 0;
      if (subtotal < Number(cpn.min_order_value)) {
        return res.status(400).json({
          success: false,
          message: `Minimum order value of ₹${cpn.min_order_value} required for coupon ${cpn.code}. Add ₹${Number(cpn.min_order_value) - subtotal} more to avail!`,
        });
      }

      let discountAmount = 0;
      if (cpn.discount_type === 'percentage') {
        const rawDiscount = (subtotal * Number(cpn.discount_value)) / 100;
        discountAmount = cpn.max_discount_amount ? Math.min(rawDiscount, Number(cpn.max_discount_amount)) : rawDiscount;
      } else {
        discountAmount = Math.min(subtotal, Number(cpn.discount_value));
      }

      return res.json({
        success: true,
        message: `Coupon ${cpn.code} applied! You save ₹${discountAmount.toFixed(2)}`,
        coupon: {
          code: cpn.code,
          description: cpn.description,
          discountType: cpn.discount_type,
          discountAmount,
          finalAmount: Math.max(0, subtotal - discountAmount),
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}

export const couponController = new CouponController();
