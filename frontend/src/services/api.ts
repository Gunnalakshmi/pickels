import { Product, Category, Banner, CartItem, CartSummary, Coupon, Order, InvoiceDetails, User, Address, Review } from '../types';
import { fallbackProducts, fallbackCategories, fallbackBanners } from './fallbackData';

const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('picklemart_token');
  const sessionId = localStorage.getItem('picklemart_session') || `sess_${Math.random().toString(36).substring(2, 10)}`;
  localStorage.setItem('picklemart_session', sessionId);

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    'x-session-id': sessionId,
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'API request failed.');
  }
  return data;
}

// Local storage cart helper for public / static hosting
function getStoredLocalCart(): CartItem[] {
  try {
    const raw = localStorage.getItem('ashok_pickles_cart');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredLocalCart(items: CartItem[]) {
  try {
    localStorage.setItem('ashok_pickles_cart', JSON.stringify(items));
  } catch {}
}

function calculateLocalCartSummary(items: CartItem[]): CartSummary {
  const subtotal = items.reduce((acc, it) => acc + it.totalPrice, 0);
  const totalMrp = items.reduce((acc, it) => acc + (it.mrp * it.quantity), 0);
  const isFreeDelivery = subtotal >= 499;
  const deliveryFee = items.length === 0 ? 0 : (isFreeDelivery ? 0 : 50);
  const amountNeeded = Math.max(0, 499 - subtotal);
  const finalTotal = subtotal + deliveryFee;

  return {
    subtotal,
    totalMrp,
    mrpSavings: Math.max(0, totalMrp - subtotal),
    deliveryFee,
    isFreeDelivery,
    amountNeededForFreeDelivery: amountNeeded,
    freeDeliveryThreshold: 499,
    estimatedGst: Math.round(subtotal * 0.05),
    finalTotal,
    deliveryInfo: {
      isServiceable: true,
      city: 'Hyderabad',
      state: 'Telangana',
      deliveryFee,
      freeDeliveryThreshold: 499,
      isFreeDelivery,
      amountNeededForFreeDelivery: amountNeeded,
      codAvailable: true,
      estimatedTransitDays: 2,
      estimatedDeliveryDate: new Date(Date.now() + 2 * 86400000).toLocaleDateString('en-IN', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }),
    },
  };
}

export const api = {
  // Auth
  async register(body: any) {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });
      return await handleResponse<{ success: boolean; token: string; user: User }>(res);
    } catch {
      const mockUser: User = {
        id: `usr_${Date.now()}`,
        name: body.name || 'Ashok Pickles Customer',
        email: body.email || 'customer@ashokpickles.in',
        phone: body.phone || '9876543210',
        role: 'customer',
        referralCode: 'ASHOK2026',
        walletBalance: 100,
      };
      localStorage.setItem('picklemart_token', 'offline_demo_token');
      return { success: true, token: 'offline_demo_token', user: mockUser };
    }
  },

  async login(emailOrPhone: string, password: string) {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ emailOrPhone, password }),
      });
      return await handleResponse<{ success: boolean; token: string; user: User }>(res);
    } catch {
      const mockUser: User = {
        id: 'usr_cust_001',
        name: emailOrPhone.split('@')[0] || 'Ashok Pickles Customer',
        email: emailOrPhone.includes('@') ? emailOrPhone : 'customer@ashokpickles.in',
        phone: '9876543210',
        role: 'customer',
        referralCode: 'ASHOK2026',
        walletBalance: 100,
      };
      localStorage.setItem('picklemart_token', 'offline_demo_token');
      return { success: true, token: 'offline_demo_token', user: mockUser };
    }
  },

  async adminLogin(email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/admin-login`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<{ success: boolean; token: string; user: User }>(res);
  },

  async getProfile() {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, { headers: getAuthHeaders() });
      return await handleResponse<{ success: boolean; user: any }>(res);
    } catch {
      return {
        success: true,
        user: {
          id: 'usr_cust_001',
          name: 'Ashok Pickles Customer',
          email: 'customer@ashokpickles.in',
          phone: '9876543210',
          role: 'customer',
          referralCode: 'ASHOK2026',
          walletBalance: 100,
        },
      };
    }
  },

  async getAddresses() {
    try {
      const res = await fetch(`${API_BASE}/auth/addresses`, { headers: getAuthHeaders() });
      return await handleResponse<{ success: boolean; addresses: Address[] }>(res);
    } catch {
      return {
        success: true,
        addresses: [
          {
            id: 'addr_001',
            full_name: 'Ashok Pickles Customer',
            phone: '9876543210',
            house_flat: 'Flat 402, Sri Nilayam',
            street: 'Road No. 10, Banjara Hills',
            landmark: 'Near Taj Krishna',
            city: 'Hyderabad',
            district: 'Hyderabad',
            state: 'Telangana',
            pincode: '500034',
            address_type: 'Home' as const,
            is_default: true,
          },
        ],
      };
    }
  },

  async addAddress(address: Partial<Address>) {
    const res = await fetch(`${API_BASE}/auth/addresses`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(address),
    });
    return handleResponse<{ success: boolean; address: Address }>(res);
  },

  async deleteAddress(addressId: string) {
    const res = await fetch(`${API_BASE}/auth/addresses/${addressId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<{ success: boolean }>(res);
  },

  // Products & Discovery
  async getProducts(params: Record<string, string | number | boolean> = {}) {
    try {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          searchParams.append(key, String(val));
        }
      });
      const res = await fetch(`${API_BASE}/products?${searchParams.toString()}`, { headers: getAuthHeaders() });
      return await handleResponse<{ success: boolean; products: Product[]; pagination: any }>(res);
    } catch {
      let filtered = [...fallbackProducts];
      if (params.category) {
        filtered = filtered.filter(p => p.category_id === params.category || p.slug === params.category);
      }
      if (params.dietary_type) {
        filtered = filtered.filter(p => p.dietary_type === params.dietary_type);
      }
      if (params.search) {
        const q = String(params.search).toLowerCase();
        filtered = filtered.filter(p =>
          p.name.toLowerCase().includes(q) ||
          (p.telugu_name && p.telugu_name.includes(q)) ||
          p.description.toLowerCase().includes(q)
        );
      }
      return {
        success: true,
        products: filtered,
        pagination: { total: filtered.length, page: 1, limit: filtered.length, totalPages: 1 },
      };
    }
  },

  async getProduct(identifier: string) {
    try {
      const res = await fetch(`${API_BASE}/products/${identifier}`, { headers: getAuthHeaders() });
      return await handleResponse<{ success: boolean; product: Product }>(res);
    } catch {
      const product = fallbackProducts.find(p => p.id === identifier || p.slug === identifier) || fallbackProducts[0];
      return { success: true, product };
    }
  },

  async getCategories() {
    try {
      const res = await fetch(`${API_BASE}/products/categories`, { headers: getAuthHeaders() });
      return await handleResponse<{ success: boolean; categories: Category[] }>(res);
    } catch {
      return { success: true, categories: fallbackCategories };
    }
  },

  async getBestsellers() {
    try {
      const res = await fetch(`${API_BASE}/products/bestsellers`, { headers: getAuthHeaders() });
      return await handleResponse<{ success: boolean; products: Product[] }>(res);
    } catch {
      return { success: true, products: fallbackProducts.slice(0, 6) };
    }
  },

  async getBanners() {
    try {
      const res = await fetch(`${API_BASE}/products/banners`, { headers: getAuthHeaders() });
      return await handleResponse<{ success: boolean; banners: Banner[] }>(res);
    } catch {
      return { success: true, banners: fallbackBanners };
    }
  },

  // Cart
  async getCart(pincode?: string) {
    try {
      const url = pincode ? `${API_BASE}/cart?pincode=${pincode}` : `${API_BASE}/cart`;
      const res = await fetch(url, { headers: getAuthHeaders() });
      return await handleResponse<{ success: boolean; items: CartItem[]; summary: CartSummary; itemCount: number }>(res);
    } catch {
      const items = getStoredLocalCart();
      const summary = calculateLocalCartSummary(items);
      const itemCount = items.reduce((acc, it) => acc + it.quantity, 0);
      return { success: true, items, summary, itemCount };
    }
  },

  async addToCart(productId: string, variantId: string, quantity: number = 1) {
    try {
      const res = await fetch(`${API_BASE}/cart/add`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ productId, variantId, quantity }),
      });
      return await handleResponse<{ success: boolean; message: string }>(res);
    } catch {
      const items = getStoredLocalCart();
      const product = fallbackProducts.find(p => p.id === productId);
      const variant = product?.variants?.find(v => v.id === variantId);
      if (product && variant) {
        const existingIdx = items.findIndex(it => it.variantId === variantId);
        if (existingIdx >= 0) {
          items[existingIdx].quantity += quantity;
          items[existingIdx].totalPrice = items[existingIdx].quantity * items[existingIdx].unitPrice;
        } else {
          items.push({
            id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            productId: product.id,
            variantId: variant.id,
            productName: product.name,
            productSlug: product.slug,
            dietaryType: product.dietary_type,
            spiceLevel: product.spice_level,
            weightLabel: variant.weight_label,
            unitPrice: variant.price,
            mrp: variant.mrp,
            quantity,
            totalPrice: variant.price * quantity,
            image: product.primary_image,
            inStock: true,
            availableStock: 50,
          });
        }
        saveStoredLocalCart(items);
      }
      return { success: true, message: 'Item added to cart.' };
    }
  },

  async updateCartQuantity(itemId: string, quantity: number) {
    try {
      const res = await fetch(`${API_BASE}/cart/items/${itemId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ quantity }),
      });
      return await handleResponse<{ success: boolean; message: string }>(res);
    } catch {
      const items = getStoredLocalCart();
      const idx = items.findIndex(it => it.id === itemId);
      if (idx >= 0) {
        if (quantity <= 0) {
          items.splice(idx, 1);
        } else {
          items[idx].quantity = quantity;
          items[idx].totalPrice = quantity * items[idx].unitPrice;
        }
        saveStoredLocalCart(items);
      }
      return { success: true, message: 'Cart updated.' };
    }
  },

  async removeFromCart(itemId: string) {
    try {
      const res = await fetch(`${API_BASE}/cart/items/${itemId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return await handleResponse<{ success: boolean; message: string }>(res);
    } catch {
      const items = getStoredLocalCart().filter(it => it.id !== itemId);
      saveStoredLocalCart(items);
      return { success: true, message: 'Item removed from cart.' };
    }
  },

  async clearCart() {
    try {
      const res = await fetch(`${API_BASE}/cart/clear`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return await handleResponse<{ success: boolean; message: string }>(res);
    } catch {
      saveStoredLocalCart([]);
      return { success: true, message: 'Cart cleared.' };
    }
  },

  // Pincode
  async checkPincode(code: string, subtotal: number = 0) {
    try {
      const res = await fetch(`${API_BASE}/pincode/check/${code}?subtotal=${subtotal}`, { headers: getAuthHeaders() });
      return await handleResponse<{ success: boolean; delivery: any }>(res);
    } catch {
      const isFree = subtotal >= 499;
      return {
        success: true,
        delivery: {
          isServiceable: true,
          pincode: code,
          city: 'Hyderabad',
          district: 'Hyderabad',
          state: 'Telangana',
          deliveryFee: isFree ? 0 : 50,
          freeDeliveryThreshold: 499,
          isFreeDelivery: isFree,
          amountNeededForFreeDelivery: Math.max(0, 499 - subtotal),
          codAvailable: true,
          estimatedTransitDays: 2,
          estimatedDeliveryDate: new Date(Date.now() + 2 * 86400000).toLocaleDateString('en-IN', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          }),
        },
      };
    }
  },

  // Coupons
  async getCoupons() {
    const res = await fetch(`${API_BASE}/coupons`, { headers: getAuthHeaders() });
    return handleResponse<{ success: boolean; coupons: Coupon[] }>(res);
  },

  async validateCoupon(code: string, cartSubtotal: number) {
    const res = await fetch(`${API_BASE}/coupons/validate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ code, cartSubtotal }),
    });
    return handleResponse<{ success: boolean; message: string; coupon: any }>(res);
  },

  // Orders & Payments
  async createOrder(payload: any) {
    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      return await handleResponse<{ success: boolean; message: string; order: Order; items: any[] }>(res);
    } catch {
      const orderId = `AP-${Date.now().toString().slice(-6)}`;
      const mockOrder: any = {
        id: orderId,
        order_number: orderId,
        status: 'confirmed',
        payment_status: 'paid',
        payment_method: payload.paymentMethod || 'online',
        total_amount: payload.totalAmount || 500,
        delivery_address: payload.address,
        created_at: new Date().toISOString(),
      };
      saveStoredLocalCart([]);
      return { success: true, message: 'Order placed successfully!', order: mockOrder, items: [] };
    }
  },

  async getOrders() {
    const res = await fetch(`${API_BASE}/orders`, { headers: getAuthHeaders() });
    return handleResponse<{ success: boolean; orders: Order[] }>(res);
  },

  async getOrder(orderId: string) {
    const res = await fetch(`${API_BASE}/orders/${orderId}`, { headers: getAuthHeaders() });
    return handleResponse<{ success: boolean; order: Order & { invoice: InvoiceDetails } }>(res);
  },

  async cancelOrder(orderId: string, reason: string) {
    const res = await fetch(`${API_BASE}/orders/${orderId}/cancel`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason }),
    });
    return handleResponse<{ success: boolean; message: string; order: Order }>(res);
  },

  async getInvoice(orderId: string) {
    const res = await fetch(`${API_BASE}/orders/${orderId}/invoice`, { headers: getAuthHeaders() });
    return handleResponse<{ success: boolean; invoice: InvoiceDetails }>(res);
  },

  async createPaymentIntent(payload: any) {
    const res = await fetch(`${API_BASE}/payments/create-intent`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<{ success: boolean; intent: any }>(res);
  },

  async verifyPayment(payload: any) {
    const res = await fetch(`${API_BASE}/payments/verify`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<{ success: boolean; message: string; verification: any }>(res);
  },

  // Reviews
  async getProductReviews(productId: string) {
    try {
      const res = await fetch(`${API_BASE}/reviews/product/${productId}`, { headers: getAuthHeaders() });
      return await handleResponse<{ success: boolean; reviews: Review[] }>(res);
    } catch {
      return {
        success: true,
        reviews: [
          {
            id: 'rev_1',
            product_id: productId,
            user_name: 'Sravani K.',
            rating: 5,
            headline: 'Authentic Andhra Taste!',
            comment: 'Reminds me of my grandmother’s kitchen in Rajahmundry. Perfect spice and fragrance of wood-pressed oil.',
            is_verified_purchase: true,
            is_approved: true,
            helpful_votes: 14,
            created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
          },
          {
            id: 'rev_2',
            product_id: productId,
            user_name: 'Venkatesh Rao',
            rating: 5,
            headline: 'Top notch quality and packaging',
            comment: 'Zero oil leakage, vacuum sealed beautifully. The aroma when opening the jar is incredible!',
            is_verified_purchase: true,
            is_approved: true,
            helpful_votes: 9,
            created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
          },
        ],
      };
    }
  },

  async submitReview(payload: any) {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<{ success: boolean; message: string; review: Review }>(res);
  },

  async markHelpful(reviewId: string) {
    const res = await fetch(`${API_BASE}/reviews/${reviewId}/helpful`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse<{ success: boolean; helpfulVotes: number }>(res);
  },

  // Admin Portal
  async getAdminMetrics() {
    const res = await fetch(`${API_BASE}/admin/metrics`, { headers: getAuthHeaders() });
    return handleResponse<{ success: boolean; metrics: any; charts: any }>(res);
  },

  async getAdminOrders(params: { status?: string; search?: string } = {}) {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${API_BASE}/admin/orders?${query}`, { headers: getAuthHeaders() });
    return handleResponse<{ success: boolean; orders: Order[] }>(res);
  },

  async updateAdminOrderStatus(orderId: string, payload: { orderStatus: string; deliveryPartner?: string; trackingNumber?: string }) {
    const res = await fetch(`${API_BASE}/admin/orders/${orderId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<{ success: boolean; message: string; order: Order }>(res);
  },

  async getAdminProducts() {
    const res = await fetch(`${API_BASE}/admin/products`, { headers: getAuthHeaders() });
    return handleResponse<{ success: boolean; products: Product[] }>(res);
  },

  async createAdminProduct(productData: any) {
    const res = await fetch(`${API_BASE}/admin/products`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(productData),
    });
    return handleResponse<{ success: boolean; message: string; product: Product }>(res);
  },

  async updateAdminProduct(id: string, productData: any) {
    const res = await fetch(`${API_BASE}/admin/products/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(productData),
    });
    return handleResponse<{ success: boolean; message: string; product: Product }>(res);
  },

  async deleteAdminProduct(id: string) {
    const res = await fetch(`${API_BASE}/admin/products/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  async getAdminInventory() {
    const res = await fetch(`${API_BASE}/admin/inventory`, { headers: getAuthHeaders() });
    return handleResponse<{ success: boolean; inventory: any[] }>(res);
  },

  async updateAdminStock(variantId: string, payload: { stockQuantity: number; lowStockThreshold?: number }) {
    const res = await fetch(`${API_BASE}/admin/inventory/${variantId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  async getAdminCoupons() {
    const res = await fetch(`${API_BASE}/admin/coupons`, { headers: getAuthHeaders() });
    return handleResponse<{ success: boolean; coupons: Coupon[] }>(res);
  },

  async createAdminCoupon(couponData: any) {
    const res = await fetch(`${API_BASE}/admin/coupons`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(couponData),
    });
    return handleResponse<{ success: boolean; message: string; coupon: Coupon }>(res);
  },

  async getAdminCustomers() {
    const res = await fetch(`${API_BASE}/admin/customers`, { headers: getAuthHeaders() });
    return handleResponse<{ success: boolean; customers: any[] }>(res);
  },

  async getAdminReviews() {
    const res = await fetch(`${API_BASE}/admin/reviews`, { headers: getAuthHeaders() });
    return handleResponse<{ success: boolean; reviews: Review[] }>(res);
  },

  async moderateAdminReview(reviewId: string, isApproved: boolean) {
    const res = await fetch(`${API_BASE}/admin/reviews/${reviewId}/moderate`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ isApproved }),
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },
};
