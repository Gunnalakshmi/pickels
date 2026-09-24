import { db } from '../database/db';
import { config } from '../config/env';

export interface DeliveryCalculation {
  isServiceable: boolean;
  city?: string;
  state?: string;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  isFreeDelivery: boolean;
  amountNeededForFreeDelivery: number;
  codAvailable: boolean;
  estimatedTransitDays: number;
  estimatedDeliveryDate: string;
}

export class DeliveryService {
  public async checkPincode(pincode: string, cartSubtotal: number = 0): Promise<DeliveryCalculation> {
    const cleanPin = (pincode || '').trim();
    const pincodes = db.getStore('serviceable_pincodes');
    const settings = db.getStore('delivery_settings')[0] || {
      standard_delivery_fee: config.store.standardDeliveryFee,
      free_delivery_threshold: config.store.freeDeliveryThreshold,
      cod_charge: 25.0,
      cod_enabled: true,
      estimated_transit_days: 4,
    };

    const pinRecord = pincodes.find(p => p.pincode === cleanPin && p.is_active);

    const threshold = Number(settings.free_delivery_threshold);
    const standardFee = Number(settings.standard_delivery_fee);
    const isFree = cartSubtotal >= threshold;
    const fee = isFree ? 0 : standardFee;
    const needed = isFree ? 0 : Math.max(0, threshold - cartSubtotal);

    const transitDays = pinRecord ? pinRecord.estimated_days : settings.estimated_transit_days;
    const estDate = new Date(Date.now() + transitDays * 86400000);

    if (!pinRecord) {
      // Default: If pincode is valid 6 digits in India, we can still serve with standard transit days
      const isValid6Digit = /^[1-9][0-9]{5}$/.test(cleanPin);
      return {
        isServiceable: isValid6Digit,
        city: isValid6Digit ? 'All India Standard Delivery' : undefined,
        state: isValid6Digit ? 'India' : undefined,
        deliveryFee: fee,
        freeDeliveryThreshold: threshold,
        isFreeDelivery: isFree,
        amountNeededForFreeDelivery: needed,
        codAvailable: isValid6Digit ? Boolean(settings.cod_enabled) : false,
        estimatedTransitDays: transitDays + 1,
        estimatedDeliveryDate: estDate.toLocaleDateString('en-IN', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }),
      };
    }

    return {
      isServiceable: true,
      city: pinRecord.city,
      state: pinRecord.state,
      deliveryFee: fee,
      freeDeliveryThreshold: threshold,
      isFreeDelivery: isFree,
      amountNeededForFreeDelivery: needed,
      codAvailable: pinRecord.is_cod_available && settings.cod_enabled,
      estimatedTransitDays: pinRecord.estimated_days,
      estimatedDeliveryDate: estDate.toLocaleDateString('en-IN', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }),
    };
  }
}

export const deliveryService = new DeliveryService();
