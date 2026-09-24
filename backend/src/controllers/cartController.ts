import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/db';
import { deliveryService } from '../services/deliveryService';
import { config } from '../config/env';

export class CartController {
  private getOrCreateCart(userId?: string, sessionId?: string) {
    const carts = db.getStore('cart');
    let userCart = carts.find(c => (userId && c.user_id === userId) || (sessionId && c.session_id === sessionId));

    if (!userCart) {
      userCart = {
        id: `cart_${uuidv4().slice(0, 8)}`,
        user_id: userId || null,
        session_id: sessionId || `sess_${uuidv4().slice(0, 10)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      carts.push(userCart);
    }
    return userCart;
  }

  public async getCart(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const sessionId = req.headers['x-session-id'] as string;
      const pincode = (req.query.pincode as string) || '';

      const cart = this.getOrCreateCart(userId, sessionId);
      const cartItems = db.getStore('cart_items').filter(i => i.cart_id === cart.id);
      const products = db.getStore('products');
      const variants = db.getStore('product_variants');
      const images = db.getStore('product_images');
      const inventory = db.getStore('inventory');

      let subtotal = 0;
      let totalMrp = 0;

      const items = cartItems.map(item => {
        const product = products.find(p => p.id === item.product_id);
        const variant = variants.find(v => v.id === item.variant_id);
        const img = images.find(i => i.product_id === item.product_id && i.is_primary) || images.find(i => i.product_id === item.product_id);
        const inv = inventory.find(i => i.variant_id === item.variant_id);

        const unitPrice = variant ? Number(variant.price) : Number(item.unit_price);
        const mrp = variant ? Number(variant.mrp) : unitPrice;
        const itemSubtotal = unitPrice * item.quantity;
        const itemMrpTotal = mrp * item.quantity;

        subtotal += itemSubtotal;
        totalMrp += itemMrpTotal;

        return {
          id: item.id,
          productId: item.product_id,
          variantId: item.variant_id,
          productName: product?.name || 'Pickle',
          productSlug: product?.slug || '',
          dietaryType: product?.dietary_type || 'veg',
          spiceLevel: product?.spice_level || 'medium',
          weightLabel: variant?.weight_label || '500g',
          unitPrice,
          mrp,
          quantity: item.quantity,
          totalPrice: itemSubtotal,
          image: img?.image_url,
          inStock: inv ? inv.stock_quantity >= item.quantity : true,
          availableStock: inv ? inv.stock_quantity : 0,
        };
      });

      const deliveryInfo = await deliveryService.checkPincode(pincode, subtotal);
      const mrpSavings = Math.max(0, totalMrp - subtotal);
      const deliveryFee = items.length === 0 ? 0 : deliveryInfo.deliveryFee;

      // 5% GST calculation
      const taxRate = config.store.defaultGstRate;
      const gstAmount = Math.round((subtotal * (taxRate / 100)) * 100) / 100;
      const finalTotal = subtotal + deliveryFee;

      return res.json({
        success: true,
        cartId: cart.id,
        sessionId: cart.session_id,
        items,
        itemCount: items.reduce((acc, cur) => acc + cur.quantity, 0),
        summary: {
          subtotal,
          totalMrp,
          mrpSavings,
          deliveryFee,
          isFreeDelivery: deliveryInfo.isFreeDelivery,
          amountNeededForFreeDelivery: deliveryInfo.amountNeededForFreeDelivery,
          freeDeliveryThreshold: deliveryInfo.freeDeliveryThreshold,
          estimatedGst: gstAmount,
          finalTotal,
          deliveryInfo,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  public async addToCart(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const sessionId = (req.headers['x-session-id'] as string) || (req.body.sessionId as string);
      const { productId, variantId, quantity = 1 } = req.body;

      if (!productId || !variantId) {
        return res.status(400).json({ success: false, message: 'Product and weight variant are required.' });
      }

      // Check stock
      const inventory = db.getStore('inventory');
      const inv = inventory.find(i => i.variant_id === variantId);
      if (inv && inv.stock_quantity < quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${inv.stock_quantity} units available in stock.`,
        });
      }

      const cart = this.getOrCreateCart(userId, sessionId);
      const cartItems = db.getStore('cart_items');
      const variants = db.getStore('product_variants');
      const variant = variants.find(v => v.id === variantId);

      const existingItem = cartItems.find(i => i.cart_id === cart.id && i.variant_id === variantId);

      if (existingItem) {
        const newQty = existingItem.quantity + quantity;
        if (inv && inv.stock_quantity < newQty) {
          return res.status(400).json({
            success: false,
            message: `Cannot add more. Reached available stock limit of ${inv.stock_quantity}.`,
          });
        }
        existingItem.quantity = newQty;
        existingItem.updated_at = new Date().toISOString();
      } else {
        cartItems.push({
          id: `item_${uuidv4().slice(0, 8)}`,
          cart_id: cart.id,
          product_id: productId,
          variant_id: variantId,
          quantity,
          unit_price: variant ? Number(variant.price) : 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Pickle added to cart!',
        cartId: cart.id,
        sessionId: cart.session_id,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  public async updateQuantity(req: Request, res: Response) {
    try {
      const { itemId } = req.params;
      const { quantity } = req.body;

      const cartItems = db.getStore('cart_items');
      const itemIndex = cartItems.findIndex(i => i.id === itemId);

      if (itemIndex === -1) {
        return res.status(404).json({ success: false, message: 'Cart item not found.' });
      }

      if (quantity <= 0) {
        cartItems.splice(itemIndex, 1);
        return res.json({ success: true, message: 'Item removed from cart.' });
      }

      // Check inventory
      const inv = db.getStore('inventory').find(i => i.variant_id === cartItems[itemIndex].variant_id);
      if (inv && inv.stock_quantity < quantity) {
        return res.status(400).json({
          success: false,
          message: `Stock limit reached. Only ${inv.stock_quantity} units available.`,
        });
      }

      cartItems[itemIndex].quantity = quantity;
      cartItems[itemIndex].updated_at = new Date().toISOString();

      return res.json({ success: true, message: 'Quantity updated.' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  public async removeFromCart(req: Request, res: Response) {
    try {
      const { itemId } = req.params;
      const cartItems = db.getStore('cart_items');
      const filtered = cartItems.filter(i => i.id !== itemId);
      db.setStore('cart_items', filtered);
      return res.json({ success: true, message: 'Item removed from cart.' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  public async clearCart(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const sessionId = req.headers['x-session-id'] as string;
      const cart = this.getOrCreateCart(userId, sessionId);

      const cartItems = db.getStore('cart_items').filter(i => i.cart_id !== cart.id);
      db.setStore('cart_items', cartItems);

      return res.json({ success: true, message: 'Cart cleared.' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}

export const cartController = new CartController();
