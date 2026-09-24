import { db } from '../database/db';
import { config } from '../config/env';

export interface InvoiceDetails {
  invoiceNumber: string;
  invoiceDate: string;
  orderNumber: string;
  orderDate: string;
  store: {
    name: string;
    address: string;
    email: string;
    phone: string;
    fssaiLicenseNo: string;
    gstin: string;
  };
  customer: {
    name: string;
    phone: string;
    shippingAddress: any;
  };
  items: Array<{
    productName: string;
    weight: string;
    hsnCode: string;
    fssaiInfo: string;
    unitPrice: number;
    quantity: number;
    total: number;
  }>;
  financials: {
    subtotal: number;
    discountAmount: number;
    deliveryFee: number;
    taxBreakdown: {
      cgst: number;
      sgst: number;
      igst: number;
      totalGst: number;
    };
    totalAmount: number;
  };
  paymentMethod: string;
  paymentStatus: string;
  fssaiNotice: string;
}

export class InvoiceService {
  public generateInvoice(orderId: string): InvoiceDetails | null {
    const orders = db.getStore('orders');
    const order = orders.find(o => o.id === orderId || o.order_number === orderId);
    if (!order) return null;

    const orderItems = db.getStore('order_items').filter(i => i.order_id === order.id);
    const taxRate = config.store.defaultGstRate; // 5% GST on packaged pickles

    // Calculate tax split: CGST 2.5% + SGST 2.5% (or IGST 5%)
    const taxableValue = Number(order.subtotal) - Number(order.discount_amount);
    const gstTotal = Math.round((taxableValue * (taxRate / 100)) * 100) / 100;
    const cgst = Math.round((gstTotal / 2) * 100) / 100;
    const sgst = gstTotal - cgst;

    return {
      invoiceNumber: `INV-${order.order_number.replace('PKL-', '')}`,
      invoiceDate: new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      orderNumber: order.order_number,
      orderDate: new Date(order.created_at).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      store: {
        name: config.store.name,
        address: 'Plot 45, Food Processing Hub, Gachibowli, Hyderabad, Telangana - 500032',
        email: config.store.email,
        phone: config.store.phone,
        fssaiLicenseNo: config.store.fssaiNumber,
        gstin: config.store.gstin,
      },
      customer: {
        name: order.shipping_address_snapshot?.full_name || 'Valued Customer',
        phone: order.shipping_address_snapshot?.phone || '',
        shippingAddress: order.shipping_address_snapshot,
      },
      items: orderItems.map(item => ({
        productName: item.product_name,
        weight: item.variant_weight,
        hsnCode: '20019000',
        fssaiInfo: item.fssai_info || `FSSAI Lic: ${config.store.fssaiNumber}`,
        unitPrice: Number(item.unit_price),
        quantity: Number(item.quantity),
        total: Number(item.total_price),
      })),
      financials: {
        subtotal: Number(order.subtotal),
        discountAmount: Number(order.discount_amount || 0),
        deliveryFee: Number(order.delivery_fee || 0),
        taxBreakdown: {
          cgst,
          sgst,
          igst: 0,
          totalGst: gstTotal,
        },
        totalAmount: Number(order.total_amount),
      },
      paymentMethod: order.payment_method,
      paymentStatus: order.payment_status,
      fssaiNotice: 'Certified under Food Safety and Standards Authority of India (FSSAI). 100% Traditional Recipe with zero synthetic additives.',
    };
  }
}

export const invoiceService = new InvoiceService();
