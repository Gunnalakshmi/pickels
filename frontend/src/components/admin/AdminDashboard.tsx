import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Boxes,
  Tag,
  MessageSquare,
  Users,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Filter,
  ArrowUpRight,
  ExternalLink,
  Loader2,
  ArrowLeft,
  X,
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Order, Product, Category, Coupon, Review } from '../../types';

interface AdminDashboardProps {
  onExitAdmin: () => void;
  onViewStore: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onExitAdmin, onViewStore }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'inventory' | 'coupons' | 'reviews' | 'customers'>('overview');
  const [metrics, setMetrics] = useState<any>(null);
  const [charts, setCharts] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { showToast } = useToast();

  // Modals
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // New Product Form State (with all required FSSAI & compliance fields)
  const [productForm, setProductForm] = useState({
    name: '',
    categoryId: 'cat_mango',
    description: '',
    subtitle: '',
    regionalStyle: 'Andhra Pradesh',
    dietaryType: 'veg',
    spiceLevel: 'spicy',
    oilType: 'Cold-Pressed Til Oil',
    basePrice: 199,
    baseMrp: 260,
    imageUrl: 'https://images.unsplash.com/photo-1589135233689-d5615a200f68?w=800&auto=format&fit=crop&q=80',
    isFeatured: true,
    isBestseller: true,
    fssaiLicenseNo: '10021042000889',
    ingredients: 'Raw Mango, Cold-Pressed Gingelly Oil, Guntur Red Chilli Powder, Mustard, Salt, Fenugreek, Asafoetida.',
    storageInstructions: 'Store in cool dry place. Keep a layer of oil on top.',
    shelfLife: '12 Months',
  });

  // New Coupon Form State
  const [couponForm, setCouponForm] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: 15,
    minOrderValue: 499,
    maxDiscountAmount: 150,
    expiryDays: 60,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [mRes, oRes, pRes, iRes, cRes, rRes, uRes] = await Promise.all([
        api.getAdminMetrics(),
        api.getAdminOrders(),
        api.getAdminProducts(),
        api.getAdminInventory(),
        api.getAdminCoupons(),
        api.getAdminReviews(),
        api.getAdminCustomers(),
      ]);

      if (mRes.success) {
        setMetrics(mRes.metrics);
        setCharts(mRes.charts);
      }
      if (oRes.success) setOrders(oRes.orders);
      if (pRes.success) setProducts(pRes.products);
      if (iRes.success) setInventory(iRes.inventory);
      if (cRes.success) setCoupons(cRes.coupons);
      if (rRes.success) setReviews(rRes.reviews);
      if (uRes.success) setCustomers(uRes.customers);
    } catch (err: any) {
      showToast(err.message || 'Error fetching admin metrics.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await api.updateAdminOrderStatus(orderId, { orderStatus: newStatus });
      if (res.success) {
        showToast(`Order status updated to "${newStatus}"`, 'success');
        setOrders(orders.map(o => (o.id === orderId ? { ...o, order_status: newStatus } : o)));
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update order status.', 'error');
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        const res = await api.updateAdminProduct(editingProduct.id, productForm);
        if (res.success) {
          showToast('Product updated successfully.', 'success');
        }
      } else {
        const res = await api.createAdminProduct(productForm);
        if (res.success) {
          showToast('New pickle product added to catalog!', 'success');
        }
      }
      setProductModalOpen(false);
      setEditingProduct(null);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Error saving product.', 'error');
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createAdminCoupon(couponForm);
      if (res.success) {
        showToast(`Coupon ${couponForm.code} created!`, 'success');
        setCouponModalOpen(false);
        loadData();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to create coupon.', 'error');
    }
  };

  const handleStockUpdate = async (variantId: string, currentStock: number) => {
    const newStockStr = prompt('Enter new stock quantity for this variant:', String(currentStock));
    if (newStockStr !== null) {
      const newStock = parseInt(newStockStr, 10);
      if (!isNaN(newStock)) {
        await api.updateAdminStock(variantId, { stockQuantity: newStock });
        showToast('Stock quantity updated.', 'success');
        loadData();
      }
    }
  };

  const handleReviewModerate = async (reviewId: string, isApproved: boolean) => {
    try {
      await api.moderateAdminReview(reviewId, isApproved);
      showToast(isApproved ? 'Review approved.' : 'Review hidden.', 'info');
      setReviews(reviews.map(r => (r.id === reviewId ? { ...r, is_approved: isApproved } : r)));
    } catch (err: any) {
      showToast(err.message || 'Error moderating review.', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4ede4' }}>
      {/* Sidebar Navigation */}
      <aside style={{
        width: '260px',
        background: '#1c1412',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        borderRight: '1px solid #291e1a',
        position: 'sticky',
        top: 0,
        height: '100vh',
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px', paddingLeft: '8px' }}>
          <span style={{ fontSize: '26px' }}>🛡️</span>
          <div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', color: '#ffb300', textTransform: 'uppercase' }}>
              ASHOK PICKLES Admin
            </h3>
            <span style={{ fontSize: '11px', color: '#a5d6a7', fontWeight: '700' }}>SuperAdmin Portal</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
          {[
            { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
            { id: 'orders', label: 'Orders Management', icon: ShoppingBag, badge: metrics?.pendingOrdersCount },
            { id: 'products', label: 'Product Catalog', icon: Package },
            { id: 'inventory', label: 'Inventory & Stock', icon: Boxes, badge: metrics?.lowStockCount, badgeColor: '#c62828' },
            { id: 'coupons', label: 'Discounts & Coupons', icon: Tag },
            { id: 'reviews', label: 'Review Moderation', icon: MessageSquare },
            { id: 'customers', label: 'Customer Insights', icon: Users },
          ].map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: isActive ? '#ffffff' : '#b8a59f',
                  background: isActive ? 'linear-gradient(90deg, #c62828 0%, #b71c1c 100%)' : 'transparent',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon size={17} color={isActive ? '#ffb300' : '#b8a59f'} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span style={{
                    background: item.badgeColor || '#ffb300',
                    color: item.badgeColor ? '#fff' : '#1c1412',
                    fontSize: '10px',
                    fontWeight: '800',
                    padding: '2px 6px',
                    borderRadius: '10px',
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div style={{ borderTop: '1px solid #291e1a', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={onViewStore}
            style={{
              padding: '10px',
              borderRadius: 'var(--radius-sm)',
              background: '#291e1a',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <ExternalLink size={14} />
            <span>Open Customer Storefront</span>
          </button>
          <button
            onClick={onExitAdmin}
            style={{
              padding: '8px',
              color: '#ff8a80',
              fontSize: '12px',
              textAlign: 'center',
            }}
          >
            Sign Out Admin
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
        {/* Top Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '24px', color: 'var(--text-primary)' }}>
              {activeTab === 'overview' && 'Executive Commerce Dashboard'}
              {activeTab === 'orders' && 'Order Processing & Fulfilment'}
              {activeTab === 'products' && 'Pickle Catalog & Compliance Manager'}
              {activeTab === 'inventory' && 'Real-Time Inventory & Stock'}
              {activeTab === 'coupons' && 'Coupon & Promotional Engine'}
              {activeTab === 'reviews' && 'Customer Review Moderation'}
              {activeTab === 'customers' && 'Customer Directory'}
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Live real-time operational status for ASHOK PICKLES
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {activeTab === 'products' && (
              <button
                onClick={() => { setEditingProduct(null); setProductModalOpen(true); }}
                className="btn-primary"
                style={{ padding: '8px 16px', fontSize: '13px' }}
              >
                <Plus size={16} />
                <span>Add New Pickle</span>
              </button>
            )}
            {activeTab === 'coupons' && (
              <button
                onClick={() => setCouponModalOpen(true)}
                className="btn-primary"
                style={{ padding: '8px 16px', fontSize: '13px' }}
              >
                <Plus size={16} />
                <span>Create Coupon</span>
              </button>
            )}
          </div>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && metrics && (
          <div>
            {/* KPI Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '28px' }}>
              <div className="glass-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>
                  <span>Total Revenue</span>
                  <TrendingUp size={16} color="var(--curry-green)" />
                </div>
                <div style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)', marginTop: '8px' }}>
                  ₹{metrics.totalRevenue.toLocaleString('en-IN')}
                </div>
                <span style={{ fontSize: '11px', color: 'var(--curry-green)', fontWeight: '600' }}>
                  +18.4% from last week
                </span>
              </div>

              <div className="glass-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>
                  <span>Total Orders</span>
                  <ShoppingBag size={16} color="var(--primary)" />
                </div>
                <div style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)', marginTop: '8px' }}>
                  {metrics.totalOrders}
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {metrics.pendingOrdersCount} pending dispatch
                </span>
              </div>

              <div className="glass-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>
                  <span>Pickle Jars Sold</span>
                  <Package size={16} color="var(--secondary)" />
                </div>
                <div style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)', marginTop: '8px' }}>
                  {metrics.totalProductsSold || 48} Units
                </div>
                <span style={{ fontSize: '11px', color: 'var(--curry-green)', fontWeight: '600' }}>
                  Avakaya & Gongura leading
                </span>
              </div>

              <div className="glass-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>
                  <span>Low Stock Alert</span>
                  <AlertTriangle size={16} color="#c62828" />
                </div>
                <div style={{ fontSize: '26px', fontWeight: '800', color: metrics.lowStockCount > 0 ? '#c62828' : 'var(--text-primary)', marginTop: '8px' }}>
                  {metrics.lowStockCount} Variants
                </div>
                <span style={{ fontSize: '11px', color: metrics.lowStockCount > 0 ? '#c62828' : 'var(--text-muted)' }}>
                  {metrics.lowStockCount > 0 ? 'Requires replenishment' : 'All stocks healthy'}
                </span>
              </div>
            </div>

            {/* Charts & Breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
              {/* 7-Day Revenue Trend */}
              <div className="glass-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '16px', color: 'var(--text-primary)', marginBottom: '16px' }}>
                  7-Day Sales Trend (₹ INR)
                </h3>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '180px', paddingTop: '20px', gap: '10px' }}>
                  {charts?.salesTrend?.map((day: any) => {
                    const max = Math.max(...charts.salesTrend.map((d: any) => d.revenue || 100));
                    const heightPercent = Math.max(15, Math.round((day.revenue / max) * 100));
                    return (
                      <div key={day.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--primary)' }}>
                          ₹{day.revenue}
                        </span>
                        <div style={{
                          width: '100%',
                          height: `${heightPercent}%`,
                          background: 'linear-gradient(180deg, #c62828 0%, #e65100 100%)',
                          borderRadius: '6px 6px 0 0',
                          transition: 'height 0.3s ease',
                        }} />
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {day.label.split(' ')[0]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Category Sales Distribution */}
              <div className="glass-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '16px', color: 'var(--text-primary)', marginBottom: '16px' }}>
                  Category Volume Distribution
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {charts?.categorySales?.slice(0, 5).map((cat: any) => (
                    <div key={cat.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                        <strong>{cat.name}</strong>
                        <span>{cat.unitsSold} jars sold</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: 'var(--bg-muted)', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(100, cat.unitsSold * 4)}%`, height: '100%', background: 'var(--primary)' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border-medium)', textAlign: 'left' }}>
                    <th style={{ padding: '10px' }}>Order #</th>
                    <th style={{ padding: '10px' }}>Customer</th>
                    <th style={{ padding: '10px' }}>Amount</th>
                    <th style={{ padding: '10px' }}>Payment</th>
                    <th style={{ padding: '10px' }}>Current Status</th>
                    <th style={{ padding: '10px' }}>Update Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(ord => (
                    <tr key={ord.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '12px 10px', fontWeight: '700' }}>
                        {ord.order_number}
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {new Date(ord.created_at).toLocaleDateString('en-IN')}
                        </div>
                      </td>
                      <td style={{ padding: '10px' }}>
                        <strong>{ord.shipping_address_snapshot?.full_name || ord.customerName}</strong>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {ord.shipping_address_snapshot?.phone || ord.customerPhone} ({ord.shipping_address_snapshot?.city})
                        </div>
                      </td>
                      <td style={{ padding: '10px', fontWeight: '700', color: 'var(--primary)' }}>
                        ₹{ord.total_amount}
                      </td>
                      <td style={{ padding: '10px' }}>
                        <span style={{ fontSize: '11px', background: 'var(--bg-muted)', padding: '2px 6px', borderRadius: '4px', fontWeight: '600' }}>
                          {ord.payment_method} ({ord.payment_status})
                        </span>
                      </td>
                      <td style={{ padding: '10px' }}>
                        <span style={{
                          background: ord.order_status === 'Delivered' ? 'var(--curry-green-light)' : ord.order_status === 'Cancelled' ? '#ffebee' : 'var(--primary-light)',
                          color: ord.order_status === 'Delivered' ? 'var(--curry-green)' : ord.order_status === 'Cancelled' ? '#c62828' : 'var(--primary)',
                          fontSize: '11px',
                          fontWeight: '700',
                          padding: '3px 8px',
                          borderRadius: '4px',
                        }}>
                          {ord.order_status}
                        </span>
                      </td>
                      <td style={{ padding: '10px' }}>
                        <select
                          value={ord.order_status}
                          onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            border: '1px solid var(--border-medium)',
                            fontSize: '12px',
                            fontWeight: '600',
                          }}
                        >
                          <option>Order Placed</option>
                          <option>Payment Confirmed</option>
                          <option>Processing</option>
                          <option>Packed</option>
                          <option>Shipped</option>
                          <option>Out for Delivery</option>
                          <option>Delivered</option>
                          <option>Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: PRODUCTS CATALOG & FSSAI */}
        {activeTab === 'products' && (
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border-medium)', textAlign: 'left' }}>
                    <th style={{ padding: '10px' }}>Pickle Details</th>
                    <th style={{ padding: '10px' }}>Category</th>
                    <th style={{ padding: '10px' }}>Region</th>
                    <th style={{ padding: '10px' }}>Price (500g)</th>
                    <th style={{ padding: '10px' }}>FSSAI Info</th>
                    <th style={{ padding: '10px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(prod => (
                    <tr key={prod.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '12px 10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img
                          src={prod.primary_image || (prod.images && prod.images[0]?.image_url)}
                          alt={prod.name}
                          style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '6px' }}
                        />
                        <div>
                          <strong>{prod.name}</strong>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            ⭐ {prod.rating} ({prod.review_count} reviews)
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '10px' }}>{prod.category_name || 'Pickle'}</td>
                      <td style={{ padding: '10px' }}>
                        <span style={{ fontSize: '11px', background: 'var(--bg-muted)', padding: '2px 6px', borderRadius: '4px' }}>
                          {prod.regional_style}
                        </span>
                      </td>
                      <td style={{ padding: '10px', fontWeight: '700', color: 'var(--primary)' }}>
                        ₹{prod.base_price}
                      </td>
                      <td style={{ padding: '10px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                        Lic: <strong>{prod.compliance?.fssai_license_no || '10021042000889'}</strong>
                      </td>
                      <td style={{ padding: '10px' }}>
                        <span style={{
                          background: prod.is_active ? 'var(--curry-green-light)' : '#ffebee',
                          color: prod.is_active ? 'var(--curry-green)' : '#c62828',
                          fontSize: '11px',
                          fontWeight: '700',
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}>
                          {prod.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: INVENTORY & STOCK */}
        {activeTab === 'inventory' && (
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border-medium)', textAlign: 'left' }}>
                    <th style={{ padding: '10px' }}>Variant Name</th>
                    <th style={{ padding: '10px' }}>SKU</th>
                    <th style={{ padding: '10px' }}>Current Stock</th>
                    <th style={{ padding: '10px' }}>Threshold</th>
                    <th style={{ padding: '10px' }}>Stock Alert</th>
                    <th style={{ padding: '10px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map(inv => (
                    <tr key={inv.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '10px', fontWeight: '600' }}>{inv.variantName}</td>
                      <td style={{ padding: '10px', fontSize: '12px', color: 'var(--text-muted)' }}>{inv.sku}</td>
                      <td style={{ padding: '10px', fontWeight: '700' }}>{inv.stock_quantity} Units</td>
                      <td style={{ padding: '10px' }}>{inv.low_stock_threshold}</td>
                      <td style={{ padding: '10px' }}>
                        {inv.isLowStock ? (
                          <span style={{ background: '#ffebee', color: '#c62828', fontSize: '11px', fontWeight: '700', padding: '2px 6px', borderRadius: '4px' }}>
                            ⚠️ LOW STOCK
                          </span>
                        ) : (
                          <span style={{ background: 'var(--curry-green-light)', color: 'var(--curry-green)', fontSize: '11px', fontWeight: '700', padding: '2px 6px', borderRadius: '4px' }}>
                            ✓ In Stock
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '10px' }}>
                        <button
                          onClick={() => handleStockUpdate(inv.variant_id, inv.stock_quantity)}
                          className="btn-outline"
                          style={{ padding: '4px 10px', fontSize: '11px' }}
                        >
                          Modify Stock
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: COUPONS */}
        {activeTab === 'coupons' && (
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {coupons.map(cpn => (
                <div key={cpn.id} style={{ padding: '18px', background: '#fff', borderRadius: '8px', border: '1.5px dashed var(--secondary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <strong style={{ fontSize: '18px', color: 'var(--primary)', letterSpacing: '1px' }}>{cpn.code}</strong>
                    <span style={{ background: 'var(--curry-green-light)', color: 'var(--curry-green)', fontSize: '11px', fontWeight: '700', padding: '2px 6px', borderRadius: '4px' }}>
                      Active
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{cpn.description}</p>
                  <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <div>Min Order: <strong>₹{cpn.min_order_value}</strong></div>
                    <div>Discount: <strong>{cpn.discount_type === 'percentage' ? `${cpn.discount_value}%` : `₹${cpn.discount_value}`}</strong></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: REVIEWS MODERATION */}
        {activeTab === 'reviews' && (
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {reviews.map(rev => (
                <div key={rev.id} style={{ padding: '16px', background: '#fff', borderRadius: '8px', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <strong>{rev.user_name}</strong>
                      <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '600' }}>on {rev.productName}</span>
                      <span style={{ fontSize: '12px' }}>⭐ {rev.rating}/5</span>
                    </div>
                    {rev.headline && <h5 style={{ fontSize: '13px', marginBottom: '2px' }}>{rev.headline}</h5>}
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{rev.comment}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleReviewModerate(rev.id, true)}
                      style={{ padding: '4px 10px', borderRadius: '4px', background: 'var(--curry-green-light)', color: 'var(--curry-green)', fontSize: '11px', fontWeight: '700' }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReviewModerate(rev.id, false)}
                      style={{ padding: '4px 10px', borderRadius: '4px', background: '#ffebee', color: '#c62828', fontSize: '11px', fontWeight: '700' }}
                    >
                      Hide
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: CUSTOMERS */}
        {activeTab === 'customers' && (
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border-medium)', textAlign: 'left' }}>
                    <th style={{ padding: '10px' }}>Customer Name</th>
                    <th style={{ padding: '10px' }}>Contact</th>
                    <th style={{ padding: '10px' }}>Total Orders</th>
                    <th style={{ padding: '10px' }}>Lifetime Spend</th>
                    <th style={{ padding: '10px' }}>Referral Code</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '10px', fontWeight: '700' }}>{c.name}</td>
                      <td style={{ padding: '10px' }}>{c.email} • {c.phone}</td>
                      <td style={{ padding: '10px' }}>{c.totalOrders} Orders</td>
                      <td style={{ padding: '10px', fontWeight: '700', color: 'var(--primary)' }}>₹{c.totalSpend}</td>
                      <td style={{ padding: '10px', fontSize: '12px' }}>{c.referralCode || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* ADD/EDIT PRODUCT MODAL */}
      {productModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '20px',
        }}>
          <div className="animate-slide-up" style={{
            background: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            maxWidth: '680px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px',
            position: 'relative',
          }}>
            <button onClick={() => setProductModalOpen(false)} style={{ position: 'absolute', top: '18px', right: '18px' }}>
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '16px' }}>
              {editingProduct ? 'Edit Pickle Product' : 'Add New Handcrafted Pickle'}
            </h3>

            <form onSubmit={handleSaveProduct} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Pickle Name *</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="e.g. Royal Hyderabadi Mutton Pickle"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Category</label>
                <select
                  value={productForm.categoryId}
                  onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                >
                  <option value="cat_mango">Mango Pickle</option>
                  <option value="cat_chicken">Chicken Pickle</option>
                  <option value="cat_gongura">Gongura Pickle</option>
                  <option value="cat_prawn">Prawn Pickle</option>
                  <option value="cat_garlic">Garlic Pickle</option>
                  <option value="cat_lemon">Lemon Pickle</option>
                  <option value="cat_combos">Combo Packs</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Regional Style</label>
                <input
                  type="text"
                  required
                  value={productForm.regionalStyle}
                  onChange={(e) => setProductForm({ ...productForm, regionalStyle: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Base Price (₹ for 500g) *</label>
                <input
                  type="number"
                  required
                  value={productForm.basePrice}
                  onChange={(e) => setProductForm({ ...productForm, basePrice: Number(e.target.value) })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Base MRP (₹) *</label>
                <input
                  type="number"
                  required
                  value={productForm.baseMrp}
                  onChange={(e) => setProductForm({ ...productForm, baseMrp: Number(e.target.value) })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Product Image URL</label>
                <input
                  type="url"
                  value={productForm.imageUrl}
                  onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>FSSAI License Number</label>
                <input
                  type="text"
                  required
                  value={productForm.fssaiLicenseNo}
                  onChange={(e) => setProductForm({ ...productForm, fssaiLicenseNo: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Complete Ingredients</label>
                <textarea
                  rows={2}
                  value={productForm.ingredients}
                  onChange={(e) => setProductForm({ ...productForm, ingredients: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  style={{ padding: '8px 16px', borderRadius: 'var(--radius-full)', background: 'var(--bg-muted)', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '8px 20px', fontSize: '13px' }}
                >
                  Save Pickle Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE COUPON MODAL */}
      {couponModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '20px',
        }}>
          <div className="animate-slide-up" style={{
            background: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            maxWidth: '440px',
            width: '100%',
            padding: '28px',
            position: 'relative',
          }}>
            <button onClick={() => setCouponModalOpen(false)} style={{ position: 'absolute', top: '18px', right: '18px' }}>
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '16px' }}>
              Create Promotional Coupon
            </h3>

            <form onSubmit={handleCreateCoupon} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SPICY20"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '13px', textTransform: 'uppercase' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Discount Value (% or Flat ₹) *</label>
                <input
                  type="number"
                  required
                  value={couponForm.discountValue}
                  onChange={(e) => setCouponForm({ ...couponForm, discountValue: Number(e.target.value) })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Minimum Order (₹)</label>
                <input
                  type="number"
                  value={couponForm.minOrderValue}
                  onChange={(e) => setCouponForm({ ...couponForm, minOrderValue: Number(e.target.value) })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ marginTop: '10px', padding: '12px' }}
              >
                Create Active Coupon
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
