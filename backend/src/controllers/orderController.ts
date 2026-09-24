import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/db';
import { deliveryService } from '../services/deliveryService';
import { invoiceService } from '../services/invoiceService';
import { notificationService } from '../services/notificationService';
import { config } from '../config/env';

export class OrderController {
  public async createOrder(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const {
        shippingAddress,
        paymentMethod = 'UPI',
        couponCode,
        items,
        notes,
      } = req.body;

      if (!shippingAddress || !shippingAddress.pincode || !shippingAddress.full_name) {
        return res.status(400).json({
          success: false,
          message: 'Valid delivery address with PIN code is required.',
        });
      }

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Your order must contain at least one pickle item.',
        });
      }

      const products = db.getStore('products');
      const variants = db.getStore('product_variants');
      const inventory = db.getStore('inventory');
      const compliance = db.getStore('compliance_information');

      let subtotal = 0;
      const verifiedOrderItems: any[] = [];

      // Validate items & check inventory
      for (const reqItem of items) {
        const product = products.find(p => p.id === reqItem.productId);
        const variant = variants.find(v => v.id === reqItem.variantId);
        if (!product || !variant) {
          return res.status(400).json({
            success: false,
            message: `Product or variant not found: ${reqItem.productName || reqItem.productId}`,
          });
        }

        const inv = inventory.find(i => i.variant_id === variant.id);
        const qty = parseInt(reqItem.quantity, 10) || 1;

        if (inv && inv.stock_quantity < qty) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${product.name} (${variant.weight_label}). Only ${inv.stock_quantity} available.`,
          });
        }

        const unitPrice = Number(variant.price);
        const lineTotal = unitPrice * qty;
        subtotal += lineTotal;

        const comp = compliance.find(c => c.product_id === product.id);

        verifiedOrderItems.push({
          id: `ord_item_${uuidv4().slice(0, 8)}`,
          productId: product.id,
          variantId: variant.id,
          productName: product.name,
          variantWeight: variant.weight_label,
          sku: variant.sku,
          unitPrice,
          quantity: qty,
          totalPrice: lineTotal,
          fssaiInfo: comp ? `FSSAI Lic: ${comp.fssai_license_no}` : `FSSAI Lic: ${config.store.fssaiNumber}`,
        });
      }

      // Calculate Coupon Discount
      let discountAmount = 0;
      let appliedCoupon: any = null;
      if (couponCode) {
        const coupons = db.getStore('coupons');
        const cpn = coupons.find(c => c.code.toUpperCase() === couponCode.trim().toUpperCase() && c.is_active);
        if (cpn && subtotal >= Number(cpn.min_order_value)) {
          if (cpn.discount_type === 'percentage') {
            const rawDiscount = (subtotal * Number(cpn.discount_value)) / 100;
            discountAmount = cpn.max_discount_amount ? Math.min(rawDiscount, Number(cpn.max_discount_amount)) : rawDiscount;
          } else {
            discountAmount = Math.min(subtotal, Number(cpn.discount_value));
          }
          appliedCoupon = cpn;
          cpn.used_count = (cpn.used_count || 0) + 1;
        }
      }

      // Calculate Delivery Fee
      const deliveryCalc = await deliveryService.checkPincode(shippingAddress.pincode, subtotal);
      const deliveryFee = deliveryCalc.deliveryFee;

      // GST Calculation
      const taxableValue = subtotal - discountAmount;
      const gstAmount = Math.round((taxableValue * (config.store.defaultGstRate / 100)) * 100) / 100;
      const totalAmount = Math.max(0, subtotal - discountAmount + deliveryFee);

      // Decrement Inventory
      for (const item of verifiedOrderItems) {
        const inv = inventory.find(i => i.variant_id === item.variantId);
        if (inv) {
          inv.stock_quantity = Math.max(0, inv.stock_quantity - item.quantity);
          inv.updated_at = new Date().toISOString();
        }
      }

      // Generate Order ID & Number
      const orderId = `ord_${uuidv4().slice(0, 10)}`;
      const orderNumber = `PKL-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

      const newOrder = {
        id: orderId,
        order_number: orderNumber,
        user_id: userId || null,
        address_id: shippingAddress.id || null,
        shipping_address_snapshot: shippingAddress,
        subtotal,
        discount_amount: discountAmount,
        coupon_code: appliedCoupon ? appliedCoupon.code : null,
        delivery_fee: deliveryFee,
        tax_amount: gstAmount,
        total_amount: totalAmount,
        order_status: paymentMethod === 'COD' ? 'Order Placed' : 'Payment Confirmed',
        payment_status: paymentMethod === 'COD' ? 'Pending' : 'Paid',
        payment_method: paymentMethod,
        delivery_partner: 'BlueDart / Delhivery Express',
        tracking_number: `TRK-${Math.floor(10000000 + Math.random() * 90000000)}`,
        estimated_delivery_date: new Date(Date.now() + deliveryCalc.estimatedTransitDays * 86400000).toISOString(),
        delivered_at: null,
        cancelled_at: null,
        cancellation_reason: null,
        notes: notes || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const orders = db.getStore('orders');
      orders.unshift(newOrder);

      // Save Order Items
      const orderItemsStore = db.getStore('order_items');
      for (const vItem of verifiedOrderItems) {
        orderItemsStore.push({
          id: vItem.id,
          order_id: orderId,
          product_id: vItem.productId,
          variant_id: vItem.variantId,
          product_name: vItem.productName,
          variant_weight: vItem.variantWeight,
          sku: vItem.sku,
          unit_price: vItem.unitPrice,
          quantity: vItem.quantity,
          total_price: vItem.totalPrice,
          fssai_info: vItem.fssaiInfo,
          created_at: new Date().toISOString(),
        });
      }

      // Clear User Cart
      if (userId) {
        const cart = db.getStore('cart').find(c => c.user_id === userId);
        if (cart) {
          const cartItems = db.getStore('cart_items').filter(i => i.cart_id !== cart.id);
          db.setStore('cart_items', cartItems);
        }

        // Send Order Notification
        await notificationService.sendNotification({
          userId,
          title: `Order Confirmed: #${orderNumber}`,
          message: `Your delicious authentic pickles are being freshly packed! Tracking ID: ${newOrder.tracking_number}`,
          type: 'order_update',
          actionUrl: `/orders/${orderId}`,
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Order created successfully!',
        order: newOrder,
        items: verifiedOrderItems,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  public async getOrders(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const orders = db.getStore('orders').filter(o => o.user_id === userId);
      const orderItems = db.getStore('order_items');
      const images = db.getStore('product_images');

      const enrichedOrders = orders.map(order => {
        const items = orderItems.filter(i => i.order_id === order.id).map(item => {
          const img = images.find(im => im.product_id === item.product_id && im.is_primary) || images.find(im => im.product_id === item.product_id);
          return {
            ...item,
            image: img?.image_url,
          };
        });
        return {
          ...order,
          items,
        };
      });

      return res.json({ success: true, orders: enrichedOrders });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  public async getOrderById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const isAdmin = req.user?.role === 'admin';

      const orders = db.getStore('orders');
      const order = orders.find(o => o.id === id || o.order_number === id);

      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found.' });
      }

      if (!isAdmin && order.user_id && order.user_id !== userId) {
        return res.status(403).json({ success: false, message: 'Access denied to this order.' });
      }

      const orderItems = db.getStore('order_items').filter(i => i.order_id === order.id);
      const images = db.getStore('product_images');
      const items = orderItems.map(item => {
        const img = images.find(im => im.product_id === item.product_id && im.is_primary) || images.find(im => im.product_id === item.product_id);
        return {
          ...item,
          image: img?.image_url,
        };
      });

      const invoice = invoiceService.generateInvoice(order.id);

      return res.json({
        success: true,
        order: {
          ...order,
          items,
          invoice,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  public async cancelOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const userId = req.user?.id;

      const orders = db.getStore('orders');
      const order = orders.find(o => o.id === id || o.order_number === id);

      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found.' });
      }

      if (order.user_id !== userId && req.user?.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Unauthorized.' });
      }

      if (['Shipped', 'Out for Delivery', 'Delivered'].includes(order.order_status)) {
        return res.status(400).json({
          success: false,
          message: `Cannot cancel order at '${order.order_status}' stage. You may request a return upon delivery.`,
        });
      }

      order.order_status = 'Cancelled';
      order.cancellation_reason = reason || 'Customer requested cancellation.';
      order.cancelled_at = new Date().toISOString();
      order.updated_at = new Date().toISOString();

      // Restore Inventory
      const orderItems = db.getStore('order_items').filter(i => i.order_id === order.id);
      const inventory = db.getStore('inventory');
      for (const item of orderItems) {
        const inv = inventory.find(i => i.variant_id === item.variant_id);
        if (inv) {
          inv.stock_quantity += item.quantity;
        }
      }

      return res.json({ success: true, message: 'Order cancelled successfully.', order });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  public async getInvoice(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const invoice = invoiceService.generateInvoice(id);
      if (!invoice) {
        return res.status(404).json({ success: false, message: 'Invoice not found for this order.' });
      }
      return res.json({ success: true, invoice });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}

export const orderController = new OrderController();
