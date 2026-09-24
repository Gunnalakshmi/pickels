import { Request, Response } from 'express';
import { deliveryService } from '../services/deliveryService';

export class PincodeController {
  public async check(req: Request, res: Response) {
    try {
      const { code } = req.params;
      const subtotal = Number(req.query.subtotal) || 0;

      if (!code) {
        return res.status(400).json({ success: false, message: 'PIN code is required.' });
      }

      const info = await deliveryService.checkPincode(code, subtotal);
      return res.json({ success: true, delivery: info });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}

export const pincodeController = new PincodeController();
