import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, ShieldCheck, Sparkles, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useLocation } from '../../context/LocationContext';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onProceedToCheckout }) => {
  const { items, summary, isDrawerOpen, setIsDrawerOpen, updateQuantity, removeItem, appliedCoupon, applyCoupon, removeCoupon } = useCart();
  const { city, pincode } = useLocation();
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  if (!isDrawerOpen) return null;

  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = codeToApply || couponInput;
    if (!code) return;
    setCouponLoading(true);
    await applyCoupon(code);
    setCouponLoading(false);
    setCouponInput('');
  };

  const freeDeliveryProgress = Math.min(100, Math.round((summary.subtotal / summary.freeDeliveryThreshold) * 100));

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      justifyContent: 'flex-end',
      zIndex: 1000,
    }}>
      <div className="animate-slide-up" style={{
        background: '#ffffff',
        width: '100%',
        maxWidth: '460px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-lg)',
        position: 'relative',
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '18px', color: 'var(--text-primary)' }}>Your Pickle Basket</h3>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>({items.length} items)</span>
          </div>
          <button
            onClick={() => setIsDrawerOpen(false)}
            style={{ padding: '6px', color: 'var(--text-muted)', borderRadius: '50%' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Free Delivery Progress Bar */}
        <div style={{ padding: '12px 20px', background: 'var(--bg-main)', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>
            {summary.isFreeDelivery ? (
              <span style={{ color: 'var(--curry-green)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Check size={14} /> Congratulations! You unlocked <strong>FREE Delivery</strong> across India!
              </span>
            ) : (
              <span style={{ color: 'var(--secondary)' }}>
                Add <strong>₹{summary.amountNeededForFreeDelivery}</strong> more for <strong>FREE Delivery</strong>!
              </span>
            )}
            <span>₹{summary.subtotal} / ₹{summary.freeDeliveryThreshold}</span>
          </div>
          <div style={{ width: '100%', height: '6px', background: 'var(--border-subtle)', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{
              width: `${freeDeliveryProgress}%`,
              height: '100%',
              background: summary.isFreeDelivery ? 'var(--curry-green)' : 'var(--primary-gradient)',
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>

        {/* Item List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏺</div>
              <h4 style={{ fontSize: '16px', color: 'var(--text-primary)', marginBottom: '4px' }}>Your pickle basket is empty</h4>
              <p style={{ fontSize: '13px', marginBottom: '20px' }}>Explore authentic handcrafted pickles and pachadis.</p>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="btn-primary"
                style={{ padding: '10px 24px', fontSize: '13px' }}
              >
                Explore Pickles
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-main)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <img
                  src={item.image}
                  alt={item.productName}
                  style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '8px' }}
                />

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '6px' }}>
                    <h5 style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.3' }}>{item.productName}</h5>
                    <button
                      onClick={() => removeItem(item.id)}
                      style={{ color: 'var(--text-muted)', padding: '2px' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '4px 0' }}>
                    <span style={{ fontSize: '11px', background: '#fff', border: '1px solid var(--border-medium)', padding: '1px 6px', borderRadius: '4px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                      {item.weightLabel}
                    </span>
                  </div>

                  <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--primary)' }}>
                      ₹{item.totalPrice}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-full)', background: '#fff' }}>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        style={{ padding: '4px 8px', color: 'var(--text-secondary)' }}
                      >
                        <Minus size={12} />
                      </button>
                      <span style={{ fontSize: '12px', fontWeight: '700', minWidth: '18px', textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        style={{ padding: '4px 8px', color: 'var(--text-secondary)' }}
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Checkout Summary */}
        {items.length > 0 && (
          <div style={{
            padding: '16px 20px',
            background: '#ffffff',
            borderTop: '1px solid var(--border-subtle)',
            boxShadow: '0 -4px 16px rgba(0,0,0,0.05)',
          }}>
            {/* Coupon Box */}
            <div style={{ marginBottom: '14px' }}>
              {appliedCoupon ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--curry-green-light)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--curry-green-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Tag size={15} color="var(--curry-green)" />
                    <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--curry-green)' }}>
                      {appliedCoupon.code} (₹{appliedCoupon.discountAmount} SAVED)
                    </span>
                  </div>
                  <button onClick={removeCoupon} style={{ fontSize: '11px', color: '#c62828', fontWeight: '700' }}>
                    Remove
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Enter Coupon (e.g. FIRST50)"
                    style={{ flex: 1, padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border-medium)', fontSize: '13px', textTransform: 'uppercase' }}
                  />
                  <button
                    onClick={() => handleApplyCoupon()}
                    disabled={couponLoading || !couponInput}
                    className="btn-outline"
                    style={{ padding: '0 14px', fontSize: '12px' }}
                  >
                    Apply
                  </button>
                </div>
              )}

              {/* Quick Coupon Chips */}
              {!appliedCoupon && (
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                  {['FIRST50', 'PICKLE10', 'SPICY100'].map(cpn => (
                    <button
                      key={cpn}
                      onClick={() => handleApplyCoupon(cpn)}
                      style={{ fontSize: '11px', color: 'var(--primary)', background: 'var(--primary-light)', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}
                    >
                      +{cpn}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Price Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Item Subtotal:</span>
                <span>₹{summary.subtotal}</span>
              </div>
              {appliedCoupon && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--curry-green)', fontWeight: '600' }}>
                  <span>Coupon Savings ({appliedCoupon.code}):</span>
                  <span>-₹{appliedCoupon.discountAmount}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Delivery Fee ({city}):</span>
                <span>{summary.isFreeDelivery ? <strong style={{ color: 'var(--curry-green)' }}>FREE</strong> : `₹${summary.deliveryFee}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px', marginTop: '4px' }}>
                <span>To Pay (Incl. GST):</span>
                <span style={{ color: 'var(--primary)' }}>₹{summary.finalTotal}</span>
              </div>
            </div>

            {/* Proceed to Checkout CTA */}
            <button
              onClick={() => {
                setIsDrawerOpen(false);
                onProceedToCheckout();
              }}
              className="btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '15px' }}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
