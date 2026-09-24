import React, { useState, useEffect } from 'react';
import { ShieldCheck, MapPin, CheckCircle2, CreditCard, QrCode, Building2, Truck, ArrowLeft, ArrowRight, Lock, Check, Loader2, Sparkles, Tag } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { useToast } from '../../context/ToastContext';
import { Address } from '../../types';
import { api } from '../../services/api';

interface CheckoutPageProps {
  onBackToCart: () => void;
  onOrderSuccess: (orderId: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onBackToCart, onOrderSuccess }) => {
  const { items, summary, appliedCoupon, clearCart } = useCart();
  const { user } = useAuth();
  const { city, pincode, state, estimatedTransitDays } = useLocation();
  const { showToast } = useToast();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');

  // Address Form State
  const [addressForm, setAddressForm] = useState({
    full_name: user?.name || '',
    phone: user?.phone || '',
    house_flat: '',
    street: '',
    landmark: '',
    city: city || 'Hyderabad',
    district: city || 'Hyderabad',
    state: state || 'Telangana',
    pincode: pincode || '500034',
    address_type: 'Home' as 'Home' | 'Work' | 'Other',
  });

  // Payment Method State
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'NETBANKING' | 'COD'>('UPI');
  const [selectedBank, setSelectedBank] = useState('HDFC');
  const [isProcessing, setIsProcessing] = useState(false);
  const [upiCountdown, setUpiCountdown] = useState(300);

  useEffect(() => {
    // Fetch saved addresses if logged in
    if (user) {
      api.getAddresses().then(res => {
        if (res.success && res.addresses.length > 0) {
          setSavedAddresses(res.addresses);
          const def = res.addresses.find(a => a.is_default) || res.addresses[0];
          setSelectedAddressId(def.id);
          setAddressForm({
            full_name: def.full_name,
            phone: def.phone,
            house_flat: def.house_flat,
            street: def.street,
            landmark: def.landmark || '',
            city: def.city,
            district: def.district || def.city,
            state: def.state,
            pincode: def.pincode,
            address_type: def.address_type,
          });
        }
      });
    }
  }, [user]);

  // UPI Timer
  useEffect(() => {
    let timer: any;
    if (step === 3 && paymentMethod === 'UPI' && upiCountdown > 0) {
      timer = setInterval(() => setUpiCountdown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, paymentMethod, upiCountdown]);

  const handleAddressSelect = (addr: Address) => {
    setSelectedAddressId(addr.id);
    setAddressForm({
      full_name: addr.full_name,
      phone: addr.phone,
      house_flat: addr.house_flat,
      street: addr.street,
      landmark: addr.landmark || '',
      city: addr.city,
      district: addr.district || addr.city,
      state: addr.state,
      pincode: addr.pincode,
      address_type: addr.address_type,
    });
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressForm.full_name || !addressForm.phone || !addressForm.house_flat || !addressForm.street || !addressForm.pincode) {
      showToast('Please fill all required delivery address details.', 'error');
      return;
    }
    setStep(2);
  };

  const handleExecutePaymentAndOrder = async (shouldFail: boolean = false) => {
    setIsProcessing(true);

    try {
      // 1. Create order
      const orderPayload = {
        shippingAddress: addressForm,
        paymentMethod,
        couponCode: appliedCoupon?.code,
        items: items.map(i => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
          productName: i.productName,
        })),
        notes: 'Handle with care - Glass Pickle Jar',
      };

      const orderRes = await api.createOrder(orderPayload);
      if (!orderRes.success) {
        throw new Error(orderRes.message || 'Failed to place order.');
      }

      const createdOrder = orderRes.order;

      // 2. If payment is online, simulate gateway intent & verification
      if (paymentMethod !== 'COD') {
        const intentRes = await api.createPaymentIntent({
          orderId: createdOrder.id,
          amount: createdOrder.total_amount,
          paymentMethod,
          customer: {
            name: addressForm.full_name,
            email: user?.email || 'customer@ashokpickles.in',
            phone: addressForm.phone,
          },
        });

        const verifyRes = await api.verifyPayment({
          orderId: createdOrder.id,
          gatewayOrderId: intentRes.intent?.gatewayOrderId || `gw_ord_${Date.now()}`,
          gatewayPaymentId: `pay_${Date.now()}`,
          paymentMethod,
          shouldFail,
        });

        if (!verifyRes.success) {
          throw new Error(verifyRes.message || 'Payment simulation failed.');
        }
      }

      // 3. Clear cart and celebrate
      await clearCart();

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#c62828', '#e65100', '#ffb300', '#2e7d32'],
      });

      showToast('Order Placed Successfully! 🥒🎉', 'success');
      onOrderSuccess(createdOrder.id);
    } catch (err: any) {
      showToast(err.message || 'Payment or order failed.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '30px auto', padding: '0 20px 80px 20px' }}>
      {/* Header & Steps Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <button
          onClick={() => (step > 1 ? setStep((step - 1) as any) : onBackToCart())}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)' }}
        >
          <ArrowLeft size={16} />
          <span>{step === 1 ? 'Back to Cart' : 'Previous Step'}</span>
        </button>

        {/* 3-Step Breadcrumbs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {[
            { num: 1, label: 'Delivery Address' },
            { num: 2, label: 'Order Summary' },
            { num: 3, label: 'Payment' },
          ].map((s, idx) => (
            <React.Fragment key={s.num}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: step >= s.num ? 'var(--primary)' : 'var(--border-medium)',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {step > s.num ? <Check size={14} /> : s.num}
                </div>
                <span style={{ fontSize: '13px', fontWeight: step === s.num ? '700' : '500', color: step === s.num ? 'var(--primary)' : 'var(--text-muted)' }} className="hidden-mobile">
                  {s.label}
                </span>
              </div>
              {idx < 2 && <div style={{ width: '20px', height: '2px', background: step > s.num ? 'var(--primary)' : 'var(--border-subtle)' }} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
        {/* Left Column: Active Step Form */}
        <div style={{ flex: 1.4 }}>
          {/* STEP 1: Address */}
          {step === 1 && (
            <div className="glass-card" style={{ padding: '26px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                <MapPin size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '18px', color: 'var(--text-primary)' }}>1. Delivery Address in India</h3>
              </div>

              {/* Saved Addresses Selector */}
              {savedAddresses.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
                    Select Saved Address
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                    {savedAddresses.map(addr => (
                      <div
                        key={addr.id}
                        onClick={() => handleAddressSelect(addr)}
                        style={{
                          padding: '12px',
                          borderRadius: '8px',
                          border: `2px solid ${selectedAddressId === addr.id ? 'var(--primary)' : 'var(--border-subtle)'}`,
                          background: selectedAddressId === addr.id ? 'var(--primary-light)' : '#ffffff',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <strong style={{ fontSize: '13px' }}>{addr.full_name}</strong>
                          <span style={{ fontSize: '10px', background: 'var(--bg-muted)', padding: '2px 6px', borderRadius: '4px', fontWeight: '600' }}>
                            {addr.address_type}
                          </span>
                        </div>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{addr.house_flat}, {addr.street}</p>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{addr.city}, {addr.pincode}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Address Input Form */}
              <form onSubmit={handleStep1Submit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      Receiver's Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={addressForm.full_name}
                      onChange={(e) => setAddressForm({ ...addressForm, full_name: e.target.value })}
                      placeholder="e.g. Ramesh Kumar"
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      10-Digit Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                      placeholder="98765 43210"
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      Flat / House No. / Building *
                    </label>
                    <input
                      type="text"
                      required
                      value={addressForm.house_flat}
                      onChange={(e) => setAddressForm({ ...addressForm, house_flat: e.target.value })}
                      placeholder="Flat 402, Sai Residency"
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      Street / Colony / Area *
                    </label>
                    <input
                      type="text"
                      required
                      value={addressForm.street}
                      onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                      placeholder="Road No 12, Banjara Hills"
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      City / Town *
                    </label>
                    <input
                      type="text"
                      required
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '13px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      6-Digit PIN Code *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={addressForm.pincode}
                      onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '13px', fontWeight: '700' }}
                    />
                  </div>
                </div>

                {/* Address Tag */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Address Type:
                  </label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {(['Home', 'Work', 'Other'] as const).map(type => (
                      <button
                        type="button"
                        key={type}
                        onClick={() => setAddressForm({ ...addressForm, address_type: type })}
                        style={{
                          padding: '6px 14px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '12px',
                          fontWeight: '600',
                          background: addressForm.address_type === type ? 'var(--primary)' : 'var(--bg-muted)',
                          color: addressForm.address_type === type ? '#ffffff' : 'var(--text-secondary)',
                        }}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ marginTop: '12px', padding: '14px' }}
                >
                  <span>Deliver to this Address</span>
                  <ArrowRight size={18} />
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: Order Summary & Review */}
          {step === 2 && (
            <div className="glass-card" style={{ padding: '26px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle2 size={20} color="var(--primary)" />
                  <h3 style={{ fontSize: '18px', color: 'var(--text-primary)' }}>2. Review Your Pickle Order</h3>
                </div>
                <button
                  onClick={() => setStep(1)}
                  style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '700' }}
                >
                  Change Address
                </button>
              </div>

              {/* Delivery Destination Snippet */}
              <div style={{ padding: '12px 16px', background: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border-subtle)', marginBottom: '18px' }}>
                <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
                  Deliver to: {addressForm.full_name} ({addressForm.phone})
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {addressForm.house_flat}, {addressForm.street}, {addressForm.city}, {addressForm.state} - {addressForm.pincode}
                </p>
                <p style={{ fontSize: '11px', color: 'var(--curry-green)', fontWeight: '700', marginTop: '4px' }}>
                  🚚 Estimated Delivery: <strong>{estimatedTransitDays} Business Days</strong> via Express Food Logistics
                </p>
              </div>

              {/* Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                {items.map(item => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', background: '#fff', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img src={item.image} alt={item.productName} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }} />
                      <div>
                        <h5 style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{item.productName}</h5>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Pack: {item.weightLabel} | Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <strong style={{ fontSize: '14px', color: 'var(--primary)' }}>₹{item.totalPrice}</strong>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setStep(3)}
                className="btn-primary"
                style={{ width: '100%', padding: '14px' }}
              >
                <span>Proceed to Payment</span>
                <ArrowRight size={18} />
              </button>
            </div>
          )}

          {/* STEP 3: Payment Gateway Simulator */}
          {step === 3 && (
            <div className="glass-card" style={{ padding: '26px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Lock size={20} color="var(--primary)" />
                  <h3 style={{ fontSize: '18px', color: 'var(--text-primary)' }}>3. Select Payment Method</h3>
                </div>
                <div style={{ background: 'var(--accent-gold-soft)', color: '#b76e00', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>
                  TEST MODE ACTIVE 🛡️
                </div>
              </div>

              {/* Payment Tabs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '22px' }}>
                {[
                  { id: 'UPI', label: 'UPI / QR', icon: QrCode },
                  { id: 'CARD', label: 'Card', icon: CreditCard },
                  { id: 'NETBANKING', label: 'NetBanking', icon: Building2 },
                  { id: 'COD', label: 'Cash on Delivery', icon: Truck },
                ].map(pm => {
                  const Icon = pm.icon;
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMethod(pm.id as any)}
                      style={{
                        padding: '12px 6px',
                        borderRadius: 'var(--radius-sm)',
                        border: `2px solid ${paymentMethod === pm.id ? 'var(--primary)' : 'var(--border-medium)'}`,
                        background: paymentMethod === pm.id ? 'var(--primary-light)' : '#ffffff',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Icon size={20} color={paymentMethod === pm.id ? 'var(--primary)' : 'var(--text-secondary)'} />
                      <span style={{ fontSize: '12px', fontWeight: '700', color: paymentMethod === pm.id ? 'var(--primary)' : 'var(--text-primary)' }}>
                        {pm.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* UPI Screen */}
              {paymentMethod === 'UPI' && (
                <div style={{ textAlign: 'center', padding: '20px', background: '#faf6f2', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)' }}>
                  <div style={{ display: 'inline-block', padding: '12px', background: '#fff', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', marginBottom: '12px' }}>
                    {/* Simulated Authentic Indian QR Code Visual */}
                    <div style={{ width: '160px', height: '160px', background: '#ffffff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--primary)' }}>
                      <QrCode size={110} color="#1c1412" />
                      <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--primary)', marginTop: '4px' }}>SCAN TO PAY ₹{summary.finalTotal}</span>
                    </div>
                  </div>

                  <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
                    Scan with any UPI App: Google Pay, PhonePe, Paytm, Cred
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    UPI ID: <strong>ashokpickles@icici</strong> | Expiring in: <span style={{ color: 'var(--primary)', fontWeight: '700' }}>{formatTimer(upiCountdown)}</span>
                  </p>

                  <div style={{ marginTop: '16px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    {['Google Pay', 'PhonePe', 'Paytm', 'BHIM'].map(app => (
                      <span key={app} style={{ fontSize: '11px', background: '#fff', border: '1px solid var(--border-subtle)', padding: '3px 8px', borderRadius: '4px', fontWeight: '600' }}>
                        {app}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Card Screen */}
              {paymentMethod === 'CARD' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px', background: '#faf6f2', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Card Number</label>
                    <input type="text" placeholder="4111 2222 3333 4444" defaultValue="4111 2222 3333 4444" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '13px' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Valid Thru</label>
                      <input type="text" placeholder="MM/YY" defaultValue="12/28" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '13px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>CVV</label>
                      <input type="password" placeholder="123" defaultValue="123" maxLength={4} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '13px' }} />
                    </div>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>🔒 256-Bit SSL Encrypted Indian Payment Simulation</p>
                </div>
              )}

              {/* NetBanking Screen */}
              {paymentMethod === 'NETBANKING' && (
                <div style={{ padding: '16px', background: '#faf6f2', borderRadius: 'var(--radius-md)' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>Select Popular Bank:</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Kotak Bank', 'Punjab National Bank'].map(bank => (
                      <button
                        key={bank}
                        type="button"
                        onClick={() => setSelectedBank(bank)}
                        style={{
                          padding: '10px 6px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600',
                          border: `1.5px solid ${selectedBank === bank ? 'var(--primary)' : 'var(--border-medium)'}`,
                          background: selectedBank === bank ? 'var(--primary-light)' : '#ffffff',
                          color: selectedBank === bank ? 'var(--primary)' : 'var(--text-primary)',
                        }}
                      >
                        {bank}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* COD Screen */}
              {paymentMethod === 'COD' && (
                <div style={{ padding: '16px', background: '#faf6f2', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <Truck size={32} color="var(--primary)" style={{ margin: '0 auto 8px auto' }} />
                  <h4 style={{ fontSize: '15px', color: 'var(--text-primary)' }}>Cash / UPI on Delivery</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    You can pay the delivery executive via Cash or scan dynamic UPI QR upon arrival at your doorstep.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleExecutePaymentAndOrder(false)}
                  className="btn-primary"
                  style={{ width: '100%', padding: '15px', fontSize: '16px' }}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={18} className="spin" />
                      <span>Processing Payment & Packing Pickles...</span>
                    </>
                  ) : (
                    <>
                      <Lock size={18} />
                      <span>Pay ₹{summary.finalTotal} & Confirm Order</span>
                    </>
                  )}
                </button>

                {/* Simulate Failure Button for developer testing */}
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleExecutePaymentAndOrder(true)}
                  style={{
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    textAlign: 'center',
                    background: 'transparent',
                    textDecoration: 'underline',
                    padding: '4px',
                  }}
                >
                  Test Scenario: Simulate Payment Failure
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Order Price Summary Card */}
        <div style={{ flex: 1 }}>
          <div className="glass-card" style={{ padding: '22px', position: 'sticky', top: '100px' }}>
            <h3 style={{ fontSize: '16px', color: 'var(--text-primary)', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
              Order Price Breakdown
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Item Subtotal ({items.reduce((sum, i) => sum + i.quantity, 0)} items):</span>
                <span>₹{summary.subtotal}</span>
              </div>

              {summary.mrpSavings > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--curry-green)' }}>
                  <span>MRP Catalog Discount:</span>
                  <span>-₹{summary.mrpSavings}</span>
                </div>
              )}

              {appliedCoupon && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--curry-green)', fontWeight: '700' }}>
                  <span>Promo Code ({appliedCoupon.code}):</span>
                  <span>-₹{appliedCoupon.discountAmount}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Delivery Charge:</span>
                <span>{summary.isFreeDelivery ? <strong style={{ color: 'var(--curry-green)' }}>FREE</strong> : `₹${summary.deliveryFee}`}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '12px' }}>
                <span>Estimated GST (5% Food Grade):</span>
                <span>₹{summary.estimatedGst} (Included)</span>
              </div>

              <div style={{ borderTop: '2px solid var(--border-subtle)', paddingTop: '12px', marginTop: '6px', display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>
                <span>Final Payable:</span>
                <span style={{ color: 'var(--primary)' }}>₹{summary.finalTotal}</span>
              </div>
            </div>

            {/* FSSAI Guarantee */}
            <div style={{ marginTop: '20px', padding: '12px', background: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} color="var(--curry-green)" />
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                <strong>ASHOK PICKLES Certified Pure</strong>. Zero adulteration, cold-pressed oils.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
