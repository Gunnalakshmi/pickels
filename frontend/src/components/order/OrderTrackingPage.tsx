import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, Truck, PackageCheck, AlertCircle, ArrowLeft, Printer, RefreshCw, XCircle, ShieldCheck, MapPin, Check } from 'lucide-react';
import { Order, InvoiceDetails } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

interface OrderTrackingPageProps {
  orderId: string;
  onBackToHome: () => void;
  onReorder: (order: Order) => void;
}

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({ orderId, onBackToHome, onReorder }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [invoice, setInvoice] = useState<InvoiceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const { showToast } = useToast();

  const fetchOrder = async () => {
    try {
      const res = await api.getOrder(orderId);
      if (res.success && res.order) {
        setOrder(res.order);
        setInvoice(res.order.invoice);
      }
    } catch (err: any) {
      showToast(err.message || 'Error loading order.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const handleCancelOrder = async () => {
    if (!cancelReason) {
      showToast('Please provide a reason for cancellation.', 'error');
      return;
    }
    setCancelling(true);
    try {
      const res = await api.cancelOrder(orderId, cancelReason);
      if (res.success) {
        showToast('Order cancelled successfully.', 'success');
        setCancelModalOpen(false);
        fetchOrder();
      }
    } catch (err: any) {
      showToast(err.message || 'Could not cancel order.', 'error');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px', color: 'var(--text-muted)' }}>
        <p style={{ fontSize: '16px' }}>Loading your pickle order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ maxWidth: '600px', margin: '80px auto', textAlign: 'center', padding: '30px' }}>
        <h2>Order Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>We couldn't locate details for this order ID.</p>
        <button onClick={onBackToHome} className="btn-primary" style={{ marginTop: '20px' }}>
          Back to Store
        </button>
      </div>
    );
  }

  const orderStages = [
    { label: 'Order Placed', desc: 'Order received by kitchen' },
    { label: 'Payment Confirmed', desc: 'Transaction verified' },
    { label: 'Processing', desc: 'Fresh stone packing & sealing' },
    { label: 'Packed', desc: 'Tamper-proof jar sealed' },
    { label: 'Shipped', desc: 'Handed to courier express' },
    { label: 'Out for Delivery', desc: 'With local courier rider' },
    { label: 'Delivered', desc: 'Delivered at your doorstep' },
  ];

  const getStageIndex = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('placed')) return 0;
    if (s.includes('payment') || s.includes('confirmed')) return 1;
    if (s.includes('processing')) return 2;
    if (s.includes('packed')) return 3;
    if (s.includes('shipped')) return 4;
    if (s.includes('out for delivery')) return 5;
    if (s.includes('delivered')) return 6;
    return 1;
  };

  const currentStageIdx = getStageIndex(order.order_status);
  const isCancelled = order.order_status === 'Cancelled';

  return (
    <div style={{ maxWidth: '1000px', margin: '30px auto', padding: '0 20px 80px 20px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <button
          onClick={onBackToHome}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)' }}
        >
          <ArrowLeft size={16} />
          <span>Continue Shopping</span>
        </button>

        <button
          onClick={() => setIsInvoiceOpen(true)}
          className="btn-outline"
          style={{ padding: '8px 16px', fontSize: '13px' }}
        >
          <Printer size={16} />
          <span>Download GST Tax Invoice</span>
        </button>
      </div>

      {/* Main Order Card */}
      <div className="glass-card" style={{ padding: '28px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '18px', marginBottom: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '24px' }}>🏺</span>
              <h2 style={{ fontSize: '20px', color: 'var(--text-primary)' }}>Order #{order.order_number}</h2>
              <span style={{
                background: isCancelled ? '#ffebee' : order.order_status === 'Delivered' ? 'var(--curry-green-light)' : 'var(--primary-light)',
                color: isCancelled ? '#c62828' : order.order_status === 'Delivered' ? 'var(--curry-green)' : 'var(--primary)',
                fontSize: '12px',
                fontWeight: '700',
                padding: '3px 10px',
                borderRadius: 'var(--radius-full)',
              }}>
                {order.order_status}
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Placed on {new Date(order.created_at).toLocaleString('en-IN', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary)' }}>
              ₹{order.total_amount}
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Paid via {order.payment_method} ({order.payment_status})
            </span>
          </div>
        </div>

        {/* Live Timeline Tracker */}
        {!isCancelled ? (
          <div style={{ margin: '28px 0' }}>
            <h4 style={{ fontSize: '15px', color: 'var(--text-primary)', marginBottom: '16px' }}>Live Order Tracking</h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${orderStages.length}, 1fr)`,
              position: 'relative',
              gap: '4px',
            }}>
              {orderStages.map((stg, idx) => {
                const isCompleted = idx <= currentStageIdx;
                const isCurrent = idx === currentStageIdx;
                return (
                  <div key={stg.label} style={{ textAlign: 'center', position: 'relative' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: isCompleted ? 'var(--primary)' : 'var(--bg-muted)',
                      color: isCompleted ? '#ffffff' : 'var(--text-muted)',
                      margin: '0 auto 8px auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '13px',
                      fontWeight: '700',
                      boxShadow: isCurrent ? '0 0 0 4px rgba(198, 40, 40, 0.2)' : 'none',
                    }}>
                      {isCompleted ? <Check size={16} /> : idx + 1}
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: isCurrent ? '700' : '500', color: isCompleted ? 'var(--text-primary)' : 'var(--text-muted)', lineHeight: '1.2' }}>
                      {stg.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{ padding: '16px', background: '#ffebee', borderRadius: '8px', border: '1px solid #ffcdd2', margin: '20px 0', color: '#c62828' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <XCircle size={20} />
              <strong>This order has been cancelled</strong>
            </div>
            {order.cancellation_reason && (
              <p style={{ fontSize: '13px', marginTop: '6px' }}>Reason: {order.cancellation_reason}</p>
            )}
          </div>
        )}

        {/* Courier & Delivery Partner Info */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', background: 'var(--bg-main)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginTop: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
              <Truck size={14} />
              <span>Logistics Partner</span>
            </div>
            <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '4px' }}>
              {order.delivery_partner || 'BlueDart Express'}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Tracking ID: <strong>{order.tracking_number || 'BD-IN-9823411'}</strong>
            </p>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
              <MapPin size={14} />
              <span>Shipping Destination</span>
            </div>
            <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '4px' }}>
              {order.shipping_address_snapshot?.full_name} ({order.shipping_address_snapshot?.phone})
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {order.shipping_address_snapshot?.house_flat}, {order.shipping_address_snapshot?.street}, {order.shipping_address_snapshot?.city}, {order.shipping_address_snapshot?.pincode}
            </p>
          </div>
        </div>

        {/* Items in Order */}
        <div style={{ marginTop: '24px' }}>
          <h4 style={{ fontSize: '15px', color: 'var(--text-primary)', marginBottom: '12px' }}>Items in this Delivery</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {order.items?.map((item) => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#fff', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {item.image && <img src={item.image} alt={item.product_name} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }} />}
                  <div>
                    <h5 style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{item.product_name}</h5>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Pack: {item.variant_weight} | Qty: {item.quantity} | {item.fssai_info || 'FSSAI Certified'}
                    </p>
                  </div>
                </div>
                <strong style={{ fontSize: '15px', color: 'var(--primary)' }}>₹{item.total_price}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Order Actions */}
        <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          {!isCancelled && ['Order Placed', 'Payment Confirmed', 'Processing'].includes(order.order_status) && (
            <button
              onClick={() => setCancelModalOpen(true)}
              style={{ padding: '8px 16px', borderRadius: 'var(--radius-full)', border: '1px solid #c62828', color: '#c62828', fontSize: '13px', fontWeight: '600' }}
            >
              Cancel Order
            </button>
          )}

          <button
            onClick={() => onReorder(order)}
            className="btn-primary"
            style={{ padding: '8px 20px', fontSize: '13px' }}
          >
            <RefreshCw size={14} />
            <span>Reorder Pickles</span>
          </button>
        </div>
      </div>

      {/* INVOICE MODAL (PRINTABLE) */}
      {isInvoiceOpen && invoice && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '20px',
        }}>
          <div className="animate-slide-up" style={{
            background: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            maxWidth: '780px',
            width: '100%',
            maxHeight: '92vh',
            overflowY: 'auto',
            padding: '32px',
            boxShadow: 'var(--shadow-lg)',
            position: 'relative',
          }}>
            <button
              onClick={() => setIsInvoiceOpen(false)}
              className="no-print"
              style={{ position: 'absolute', top: '16px', right: '16px', color: 'var(--text-muted)' }}
            >
              <XCircle size={24} />
            </button>

            {/* Printable Tax Invoice Container */}
            <div id="printable-invoice">
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #1c1412', paddingBottom: '16px', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '26px', color: '#b71c1c', textTransform: 'uppercase' }}>
                    🌶️ ASHOK PICKLES
                  </h2>
                  <p style={{ fontSize: '12px', color: '#555', marginTop: '2px' }}>{invoice.store.address}</p>
                  <p style={{ fontSize: '12px', color: '#555' }}>Email: {invoice.store.email} | Phone: {invoice.store.phone}</p>
                  <p style={{ fontSize: '12px', fontWeight: '700', color: '#1c1412', marginTop: '4px' }}>
                    FSSAI Lic. No: {invoice.store.fssaiLicenseNo} | GSTIN: {invoice.store.gstin}
                  </p>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ background: '#b71c1c', color: '#fff', fontSize: '12px', fontWeight: '800', padding: '3px 10px', borderRadius: '4px', textTransform: 'uppercase' }}>
                    Tax Invoice
                  </span>
                  <h3 style={{ fontSize: '16px', marginTop: '8px' }}>{invoice.invoiceNumber}</h3>
                  <p style={{ fontSize: '12px', color: '#555' }}>Date: {invoice.invoiceDate}</p>
                  <p style={{ fontSize: '12px', color: '#555' }}>Order: #{invoice.orderNumber}</p>
                </div>
              </div>

              {/* Buyer Details */}
              <div style={{ marginBottom: '20px', padding: '12px', background: '#faf7f2', borderRadius: '6px' }}>
                <h4 style={{ fontSize: '13px', color: '#1c1412', marginBottom: '4px' }}>Bill To / Ship To:</h4>
                <p style={{ fontSize: '13px', fontWeight: '700' }}>{invoice.customer.name}</p>
                <p style={{ fontSize: '12px', color: '#555' }}>Phone: {invoice.customer.phone}</p>
                <p style={{ fontSize: '12px', color: '#555' }}>
                  {invoice.customer.shippingAddress.house_flat}, {invoice.customer.shippingAddress.street}, {invoice.customer.shippingAddress.city} - {invoice.customer.shippingAddress.pincode}
                </p>
              </div>

              {/* Items Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '20px' }}>
                <thead>
                  <tr style={{ background: '#f0e6dc', borderBottom: '1px solid #dcc8b8' }}>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Item Description</th>
                    <th style={{ padding: '8px', textAlign: 'center' }}>HSN</th>
                    <th style={{ padding: '8px', textAlign: 'center' }}>Pack</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Qty</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Unit Price (₹)</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Total (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((it, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f0e6dc' }}>
                      <td style={{ padding: '8px' }}>
                        <strong>{it.productName}</strong>
                        <div style={{ fontSize: '10px', color: '#777' }}>{it.fssaiInfo}</div>
                      </td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>{it.hsnCode}</td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>{it.weight}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>{it.quantity}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>₹{it.unitPrice}</td>
                      <td style={{ padding: '8px', textAlign: 'right', fontWeight: '700' }}>₹{it.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals & Tax Split */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #1c1412', paddingTop: '12px' }}>
                <div style={{ maxWidth: '360px', fontSize: '11px', color: '#666' }}>
                  <p><strong>Declaration:</strong></p>
                  <p>{invoice.fssaiNotice}</p>
                  <p style={{ marginTop: '6px' }}>Payment Mode: {invoice.paymentMethod} ({invoice.paymentStatus})</p>
                </div>

                <div style={{ width: '260px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Subtotal:</span>
                    <span>₹{invoice.financials.subtotal}</span>
                  </div>
                  {invoice.financials.discountAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2e7d32' }}>
                      <span>Discount:</span>
                      <span>-₹{invoice.financials.discountAmount}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Delivery Charge:</span>
                    <span>₹{invoice.financials.deliveryFee}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#777' }}>
                    <span>CGST (2.5%):</span>
                    <span>₹{invoice.financials.taxBreakdown.cgst}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#777' }}>
                    <span>SGST (2.5%):</span>
                    <span>₹{invoice.financials.taxBreakdown.sgst}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '800', color: '#b71c1c', borderTop: '1px solid #1c1412', paddingTop: '6px', marginTop: '4px' }}>
                    <span>Grand Total:</span>
                    <span>₹{invoice.financials.totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Print Button */}
            <div className="no-print" style={{ marginTop: '24px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => window.print()}
                className="btn-primary"
                style={{ padding: '10px 20px', fontSize: '13px' }}
              >
                <Printer size={16} />
                <span>Print Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {cancelModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '20px',
        }}>
          <div className="animate-slide-up" style={{
            background: '#ffffff',
            borderRadius: 'var(--radius-md)',
            maxWidth: '440px',
            width: '100%',
            padding: '24px',
            boxShadow: 'var(--shadow-lg)',
          }}>
            <h3 style={{ fontSize: '17px', color: '#c62828', marginBottom: '8px' }}>Cancel Order #{order.order_number}?</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Please tell us why you wish to cancel this pickle order:
            </p>
            <textarea
              rows={3}
              required
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Ordered by mistake, Need to change address, etc."
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '13px', marginBottom: '14px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setCancelModalOpen(false)}
                style={{ padding: '8px 16px', borderRadius: 'var(--radius-full)', background: 'var(--bg-muted)', fontSize: '13px' }}
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                style={{ padding: '8px 18px', borderRadius: 'var(--radius-full)', background: '#c62828', color: '#fff', fontSize: '13px', fontWeight: '700' }}
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
