import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CartItem, CartSummary } from '../types';
import { api } from '../services/api';
import { useToast } from './ToastContext';
import { useLocation } from './LocationContext';

interface AppliedCouponState {
  code: string;
  description: string;
  discountAmount: number;
}

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  summary: CartSummary;
  isDrawerOpen: boolean;
  isLoading: boolean;
  appliedCoupon: AppliedCouponState | null;
  setIsDrawerOpen: (open: boolean) => void;
  addToCart: (productId: string, variantId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  refreshCart: () => Promise<void>;
}

const defaultSummary: CartSummary = {
  subtotal: 0,
  totalMrp: 0,
  mrpSavings: 0,
  deliveryFee: 50,
  isFreeDelivery: false,
  amountNeededForFreeDelivery: 499,
  freeDeliveryThreshold: 499,
  estimatedGst: 0,
  finalTotal: 0,
};

const CartContext = createContext<CartContextValue>({} as any);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [summary, setSummary] = useState<CartSummary>(defaultSummary);
  const [itemCount, setItemCount] = useState<number>(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCouponState | null>(null);

  const { showToast } = useToast();
  const { pincode } = useLocation();

  const refreshCart = useCallback(async () => {
    try {
      const res = await api.getCart(pincode);
      if (res.success) {
        setItems(res.items);
        setItemCount(res.itemCount);
        
        let finalTot = res.summary.finalTotal;
        let discount = 0;

        if (appliedCoupon) {
          discount = appliedCoupon.discountAmount;
          finalTot = Math.max(0, finalTot - discount);
        }

        setSummary({
          ...res.summary,
          finalTotal: finalTot,
        });
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
    }
  }, [pincode, appliedCoupon]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (productId: string, variantId: string, quantity: number = 1) => {
    setIsLoading(true);
    try {
      const res = await api.addToCart(productId, variantId, quantity);
      if (res.success) {
        showToast('Added to cart! 🌶️', 'success');
        await refreshCart();
        setIsDrawerOpen(true);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to add item to cart.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      await api.updateCartQuantity(itemId, quantity);
      await refreshCart();
    } catch (err: any) {
      showToast(err.message || 'Failed to update quantity.', 'error');
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      await api.removeFromCart(itemId);
      showToast('Item removed from cart.', 'info');
      await refreshCart();
    } catch (err: any) {
      showToast(err.message || 'Failed to remove item.', 'error');
    }
  };

  const clearCart = async () => {
    try {
      await api.clearCart();
      setAppliedCoupon(null);
      await refreshCart();
    } catch (err: any) {
      showToast(err.message || 'Failed to clear cart.', 'error');
    }
  };

  const applyCoupon = async (code: string) => {
    try {
      const res = await api.validateCoupon(code, summary.subtotal);
      if (res.success && res.coupon) {
        setAppliedCoupon({
          code: res.coupon.code,
          description: res.coupon.description,
          discountAmount: res.coupon.discountAmount,
        });
        showToast(res.message, 'success');
        return { success: true, message: res.message };
      }
      return { success: false, message: 'Invalid coupon' };
    } catch (err: any) {
      showToast(err.message || 'Could not apply coupon.', 'error');
      return { success: false, message: err.message };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon removed.', 'info');
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        summary,
        isDrawerOpen,
        isLoading,
        appliedCoupon,
        setIsDrawerOpen,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        applyCoupon,
        removeCoupon,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
