import React, { useState, useEffect } from 'react';
import { User, MapPin, Package, Heart, Gift, Bell, HelpCircle, Plus, Trash2, Copy, Check, ExternalLink, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../context/ToastContext';
import { Address, Order, Product } from '../../types';
import { api } from '../../services/api';
import { ProductCard } from '../product/ProductCard';

interface MyAccountPageProps {
  onSelectOrder: (orderId: string) => void;
  onSelectProduct: (product: Product) => void;
}

export const MyAccountPage: React.FC<MyAccountPageProps> = ({ onSelectOrder, onSelectProduct }) => {
  const { user, logout } = useAuth();
  const { wishlist } = useWishlist();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'wishlist' | 'referral' | 'support'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [copied, setCopied] = useState(false);

  // Address form
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddr, setNewAddr] = useState({
    full_name: user?.name || '',
    phone: user?.phone || '',
    house_flat: '',
    street: '',
    city: 'Hyderabad',
    district: 'Hyderabad',
    state: 'Telangana',
    pincode: '500034',
    address_type: 'Home' as any,
  });

  // Support Ticket Form
  const [supportCategory, setSupportCategory] = useState('Order Inquiry');
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSubmitted, setSupportSubmitted] = useState(false);

  useEffect(() => {
    if (user) {
      // Fetch Orders
      api.getOrders().then(res => {
        if (res.success) setOrders(res.orders);
        setLoadingOrders(false);
      });

      // Fetch Addresses
      api.getAddresses().then(res => {
        if (res.success) setAddresses(res.addresses);
      });
    }
  }, [user]);

  const handleCopyReferral = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(`Use my code ${user.referralCode} to get ₹50 off on ASHOK PICKLES! https://ashokpickles.in`);
      setCopied(true);
      showToast('Referral link copied to clipboard! 🎁', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.addAddress(newAddr);
      if (res.success) {
        showToast('Address added successfully!', 'success');
        setAddresses([...addresses, res.address]);
        setShowAddressForm(false);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to add address.', 'error');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      const res = await api.deleteAddress(id);
      if (res.success) {
        showToast('Address removed.', 'info');
        setAddresses(addresses.filter(a => a.id !== id));
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to remove address.', 'error');
    }
  };

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSupportSubmitted(true);
    showToast('Support ticket submitted! Ticket #TKT-88231', 'success');
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '30px auto', padding: '0 20px 80px 20px' }}>
      {/* Profile Overview Card */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'var(--primary-gradient)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '26px',
            fontWeight: '800',
            boxShadow: 'var(--shadow-spice)',
          }}>
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontSize: '20px', color: 'var(--text-primary)' }}>{user?.name}</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{user?.email} • {user?.phone}</p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px' }}>
                Pickle Lover Member
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ padding: '12px 18px', background: 'var(--accent-gold-soft)', borderRadius: 'var(--radius-md)', border: '1px solid #ffe082', textAlign: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#b76e00', textTransform: 'uppercase' }}>Pickle Wallet</span>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#795548' }}>₹{user?.walletBalance || 100}</div>
          </div>
          <button onClick={logout} style={{ padding: '8px 16px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-medium)', fontSize: '13px', fontWeight: '600', color: 'var(--primary)' }}>
            Sign Out
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', marginBottom: '24px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
        {[
          { id: 'orders', label: 'My Orders', icon: Package, count: orders.length },
          { id: 'addresses', label: 'Saved Addresses', icon: MapPin, count: addresses.length },
          { id: 'wishlist', label: 'Saved Pickles', icon: Heart, count: wishlist.length },
          { id: 'referral', label: 'Refer & Earn ₹100', icon: Gift },
          { id: 'support', label: 'Help & Support', icon: HelpCircle },
        ].map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              style={{
                padding: '10px 18px',
                borderRadius: 'var(--radius-full)',
                fontSize: '13px',
                fontWeight: '600',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: isActive ? 'var(--primary)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={16} />
              <span>{t.label}</span>
              {t.count !== undefined && (
                <span style={{
                  background: isActive ? 'rgba(255,255,255,0.25)' : 'var(--bg-muted)',
                  color: isActive ? '#fff' : 'var(--text-primary)',
                  fontSize: '11px',
                  padding: '1px 6px',
                  borderRadius: '10px',
                }}>
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: ORDERS */}
      {activeTab === 'orders' && (
        <div>
          {loadingOrders ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading orders...</p>
          ) : orders.length === 0 ? (
            <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '42px', marginBottom: '10px' }}>📦</div>
              <h3 style={{ fontSize: '18px', color: 'var(--text-primary)' }}>No Orders Placed Yet</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Your order history will appear here once you purchase handcrafted pickles.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {orders.map(ord => (
                <div key={ord.id} className="glass-card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px', marginBottom: '14px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong style={{ fontSize: '15px' }}>Order #{ord.order_number}</strong>
                        <span style={{
                          background: ord.order_status === 'Delivered' ? 'var(--curry-green-light)' : 'var(--primary-light)',
                          color: ord.order_status === 'Delivered' ? 'var(--curry-green)' : 'var(--primary)',
                          fontSize: '11px',
                          fontWeight: '700',
                          padding: '2px 8px',
                          borderRadius: '4px',
                        }}>
                          {ord.order_status}
                        </span>
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Placed on {new Date(ord.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary)' }}>
                        ₹{ord.total_amount}
                      </span>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{ord.payment_method} • {ord.payment_status}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                    {ord.items?.map(it => (
                      <div key={it.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
                        <span>{it.product_name} ({it.variant_weight}) x {it.quantity}</span>
                        <strong>₹{it.total_price}</strong>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button
                      onClick={() => onSelectOrder(ord.id)}
                      className="btn-outline"
                      style={{ padding: '6px 14px', fontSize: '12px' }}
                    >
                      Track Live & Invoice
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ADDRESSES */}
      {activeTab === 'addresses' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '17px', color: 'var(--text-primary)' }}>Manage Delivery Addresses</h3>
            <button
              onClick={() => setShowAddressForm(!showAddressForm)}
              className="btn-primary"
              style={{ padding: '8px 16px', fontSize: '13px' }}
            >
              <Plus size={16} />
              <span>Add New Address</span>
            </button>
          </div>

          {showAddressForm && (
            <div className="glass-card" style={{ padding: '20px', marginBottom: '20px' }}>
              <h4 style={{ fontSize: '15px', marginBottom: '12px' }}>New Address Details</h4>
              <form onSubmit={handleAddAddress} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={newAddr.full_name}
                  onChange={(e) => setNewAddr({ ...newAddr, full_name: e.target.value })}
                  style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                />
                <input
                  type="tel"
                  required
                  placeholder="Phone Number"
                  value={newAddr.phone}
                  onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                  style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                />
                <input
                  type="text"
                  required
                  placeholder="Flat/House No."
                  value={newAddr.house_flat}
                  onChange={(e) => setNewAddr({ ...newAddr, house_flat: e.target.value })}
                  style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                />
                <input
                  type="text"
                  required
                  placeholder="Street / Colony"
                  value={newAddr.street}
                  onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                  style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                />
                <input
                  type="text"
                  required
                  placeholder="City"
                  value={newAddr.city}
                  onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                  style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                />
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="PIN Code"
                  value={newAddr.pincode}
                  onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                  style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                />
                <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(false)}
                    style={{ padding: '8px 16px', borderRadius: 'var(--radius-full)', background: 'var(--bg-muted)', fontSize: '13px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ padding: '8px 18px', fontSize: '13px' }}
                  >
                    Save Address
                  </button>
                </div>
              </form>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {addresses.map(addr => (
              <div key={addr.id} className="glass-card" style={{ padding: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '14px' }}>{addr.full_name}</strong>
                  <span style={{ fontSize: '10px', background: 'var(--bg-muted)', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>
                    {addr.address_type}
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{addr.house_flat}, {addr.street}</p>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{addr.city}, {addr.state} - {addr.pincode}</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Phone: {addr.phone}</p>
                <div style={{ marginTop: '12px', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => handleDeleteAddress(addr.id)}
                    style={{ color: '#c62828', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Trash2 size={13} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: WISHLIST */}
      {activeTab === 'wishlist' && (
        <div>
          {wishlist.length === 0 ? (
            <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '42px', marginBottom: '10px' }}>❤️</div>
              <h3 style={{ fontSize: '18px', color: 'var(--text-primary)' }}>Your Wishlist is Empty</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Save your favorite pickles to order them whenever you crave authentic spicy flavors!
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
              {wishlist.map(prod => (
                <ProductCard key={prod.id} product={prod} onSelect={onSelectProduct} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: REFERRAL DASHBOARD */}
      {activeTab === 'referral' && (
        <div className="glass-card" style={{ padding: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--accent-gold-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Gift size={24} color="#b76e00" />
            </div>
            <div>
              <h3 style={{ fontSize: '20px', color: 'var(--text-primary)' }}>Refer a Friend & Earn ₹100</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Share authentic Indian pickle love! Your friend gets ₹50 on signup, and you receive ₹100 upon their first completed delivery.
              </p>
            </div>
          </div>

          <div style={{ padding: '20px', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', border: '1.5px dashed var(--secondary)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '14px', margin: '20px 0' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Your Unique Referral Code</span>
              <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--primary)', letterSpacing: '1px' }}>
                {user?.referralCode || 'ROHAN100'}
              </div>
            </div>

            <button
              onClick={handleCopyReferral}
              className="btn-primary"
              style={{ padding: '10px 20px', fontSize: '13px' }}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span>{copied ? 'Copied!' : 'Copy Referral Link'}</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '24px' }}>
            <div style={{ padding: '14px', background: '#fff', borderRadius: '8px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
              <span style={{ fontSize: '22px', fontWeight: '800', color: 'var(--primary)' }}>2</span>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Friends Invited</p>
            </div>
            <div style={{ padding: '14px', background: '#fff', borderRadius: '8px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
              <span style={{ fontSize: '22px', fontWeight: '800', color: 'var(--curry-green)' }}>₹100</span>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Wallet Rewards Earned</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SUPPORT */}
      {activeTab === 'support' && (
        <div className="glass-card" style={{ padding: '30px' }}>
          <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '6px' }}>ASHOK PICKLES Customer Helpdesk</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Need help with a delivery, jar packaging, or flavor guidance? Send us a ticket and our food support team will respond within 4 hours.
          </p>

          {supportSubmitted ? (
            <div style={{ padding: '20px', background: 'var(--curry-green-light)', borderRadius: '8px', border: '1px solid var(--curry-green-border)', color: 'var(--curry-green)', textAlign: 'center' }}>
              <Check size={28} style={{ margin: '0 auto 8px auto' }} />
              <h4 style={{ fontSize: '16px' }}>Support Ticket Created!</h4>
              <p style={{ fontSize: '13px', marginTop: '4px' }}>Ticket #TKT-88231. Our representative will contact you shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSupportSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '580px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Category</label>
                <select
                  value={supportCategory}
                  onChange={(e) => setSupportCategory(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                >
                  <option>Order Inquiry</option>
                  <option>Delivery Delay</option>
                  <option>Jar Packaging & Quality Concern</option>
                  <option>Refund & Cancellation Request</option>
                  <option>General Food Feedback</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Inquiring about BlueDart delivery tracking"
                  value={supportSubject}
                  onChange={(e) => setSupportSubject(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Message Details</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Please describe your query in detail..."
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ padding: '12px', fontSize: '14px' }}>
                Submit Support Request
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
