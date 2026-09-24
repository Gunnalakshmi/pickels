import React, { useState } from 'react';
import { MapPin, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useLocation } from '../../context/LocationContext';

export const PincodeModal: React.FC = () => {
  const { pincode, isPincodeModalOpen, setPincodeModalOpen, updatePincode } = useLocation();
  const [inputPin, setInputPin] = useState(pincode);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  if (!isPincodeModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    const res = await updatePincode(inputPin);
    setLoading(false);
    setFeedback(res);
    if (res.success) {
      setTimeout(() => {
        setPincodeModalOpen(false);
      }, 900);
    }
  };

  const quickPincodes = [
    { city: 'Hyderabad', pin: '500034' },
    { city: 'Bengaluru', pin: '560001' },
    { city: 'Mumbai', pin: '400001' },
    { city: 'New Delhi', pin: '110001' },
    { city: 'Chennai', pin: '600001' },
    { city: 'Kolkata', pin: '700001' },
  ];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
    }}>
      <div className="animate-slide-up" style={{
        background: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        maxWidth: '460px',
        width: '100%',
        padding: '28px',
        boxShadow: 'var(--shadow-lg)',
        position: 'relative',
      }}>
        <button
          onClick={() => setPincodeModalOpen(false)}
          style={{ position: 'absolute', top: '20px', right: '20px', color: 'var(--text-muted)' }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MapPin size={22} color="var(--primary)" />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', color: 'var(--text-primary)' }}>Select Delivery Location</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Check serviceable PIN code and delivery timeline</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              maxLength={6}
              value={inputPin}
              onChange={(e) => setInputPin(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 6-digit PIN code (e.g. 500034)"
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--border-medium)',
                fontSize: '15px',
                outline: 'none',
                fontWeight: '600',
              }}
            />
            <button
              type="submit"
              disabled={loading || inputPin.length !== 6}
              className="btn-primary"
              style={{ padding: '0 22px', opacity: inputPin.length === 6 ? 1 : 0.6 }}
            >
              {loading ? <Loader2 size={18} className="spin" /> : 'Check'}
            </button>
          </div>

          {feedback && (
            <div style={{
              marginTop: '14px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: feedback.success ? 'var(--curry-green-light)' : 'var(--primary-light)',
              color: feedback.success ? 'var(--curry-green)' : 'var(--primary)',
            }}>
              {feedback.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{feedback.message}</span>
            </div>
          )}
        </form>

        {/* Popular Cities */}
        <div style={{ marginTop: '24px' }}>
          <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Popular Delivery Hubs
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {quickPincodes.map(item => (
              <button
                key={item.pin}
                onClick={() => { setInputPin(item.pin); updatePincode(item.pin); setPincodeModalOpen(false); }}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--bg-muted)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  fontWeight: '500',
                }}
              >
                {item.city} ({item.pin})
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
