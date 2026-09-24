export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin';
  referralCode?: string;
  walletBalance?: number;
}

export interface Address {
  id: string;
  user_id?: string;
  full_name: string;
  phone: string;
  house_flat: string;
  street: string;
  landmark?: string;
  city: string;
  district?: string;
  state: string;
  pincode: string;
  address_type: 'Home' | 'Work' | 'Other';
  is_default?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url: string;
  icon_name?: string;
  product_count?: number;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  weight_label: string;
  weight_in_grams: number;
  sku: string;
  price: number;
  mrp: number;
  discount_percentage: number;
  is_default?: boolean;
  stock_quantity?: number;
  is_in_stock?: boolean;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text?: string;
  is_primary?: boolean;
}

export interface ComplianceInfo {
  id: string;
  product_id: string;
  fssai_license_no: string;
  ingredients: string;
  allergens_info?: string;
  nutritional_info?: {
    energy?: string;
    protein?: string;
    carbohydrates?: string;
    fat?: string;
    sodium?: string;
  };
  storage_instructions: string;
  shelf_life: string;
  country_of_origin: string;
  batch_number_format?: string;
  manufacturing_details: string;
  customer_care_details: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id?: string;
  user_name: string;
  rating: number;
  headline?: string;
  comment: string;
  image_url?: string | null;
  is_verified_purchase: boolean;
  is_approved: boolean;
  helpful_votes: number;
  created_at: string;
  productName?: string;
}

export interface Product {
  id: string;
  category_id: string;
  seller_id?: string;
  name: string;
  telugu_name?: string;
  slug: string;
  subtitle?: string;
  description: string;
  regional_style: string;
  dietary_type: 'veg' | 'non-veg';
  spice_level: 'mild' | 'medium' | 'spicy' | 'extra-spicy';
  spice_rating?: number;
  oil_type?: string;
  base_price: number;
  base_mrp: number;
  discount_percentage: number;
  is_featured: boolean;
  is_bestseller: boolean;
  is_new: boolean;
  is_active: boolean;
  rating: number;
  review_count: number;
  category_name?: string;
  primary_image?: string;
  images?: ProductImage[];
  variants?: ProductVariant[];
  compliance?: ComplianceInfo;
  reviews?: Review[];
  related?: Partial<Product>[];
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  badge_text?: string;
  image_url: string;
  button_text: string;
  destination_url: string;
}

export interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  productName: string;
  productSlug: string;
  dietaryType: 'veg' | 'non-veg';
  spiceLevel: string;
  weightLabel: string;
  unitPrice: number;
  mrp: number;
  quantity: number;
  totalPrice: number;
  image?: string;
  inStock: boolean;
  availableStock: number;
}

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

export interface CartSummary {
  subtotal: number;
  totalMrp: number;
  mrpSavings: number;
  deliveryFee: number;
  isFreeDelivery: boolean;
  amountNeededForFreeDelivery: number;
  freeDeliveryThreshold: number;
  estimatedGst: number;
  finalTotal: number;
  deliveryInfo?: DeliveryCalculation;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_value: number;
  max_discount_amount?: number;
  expiry_date: string;
  is_active: boolean;
}

export interface OrderItem {
  id: string;
  product_id: string;
  variant_id: string;
  product_name: string;
  variant_weight: string;
  sku?: string;
  unit_price: number;
  quantity: number;
  total_price: number;
  fssai_info?: string;
  image?: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  shipping_address_snapshot: Address;
  subtotal: number;
  discount_amount: number;
  coupon_code?: string | null;
  delivery_fee: number;
  tax_amount: number;
  total_amount: number;
  order_status: string;
  payment_status: string;
  payment_method: string;
  delivery_partner?: string;
  tracking_number?: string;
  estimated_delivery_date?: string;
  delivered_at?: string | null;
  cancelled_at?: string | null;
  cancellation_reason?: string | null;
  items?: OrderItem[];
  created_at: string;
}

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
    shippingAddress: Address;
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
