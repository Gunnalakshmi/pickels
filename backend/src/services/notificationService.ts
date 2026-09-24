import { db } from '../database/db';
import { v4 as uuidv4 } from 'uuid';

export interface NotificationPayload {
  userId: string;
  title: string;
  message: string;
  type: 'order_update' | 'promo' | 'coupon' | 'system';
  actionUrl?: string;
}

export class NotificationService {
  public async sendNotification(payload: NotificationPayload) {
    const notifications = db.getStore('notifications');
    const newNotif = {
      id: `notif_${uuidv4().slice(0, 8)}`,
      user_id: payload.userId,
      title: payload.title,
      message: payload.message,
      type: payload.type,
      action_url: payload.actionUrl || '/account/orders',
      is_read: false,
      created_at: new Date().toISOString(),
    };
    notifications.unshift(newNotif);
    // In production, this can also trigger SMS/WhatsApp (Fast2SMS/MSG91) or Email (Resend)
    return newNotif;
  }
}

export const notificationService = new NotificationService();
