import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface LoginPageProps {
  onBackToHome: () => void;
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onBackToHome, onLoginSuccess }) => {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { login } = useAuth();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!emailOrPhone.trim()) {
      setErrorMessage('Please enter your email address or mobile number.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      await login(emailOrPhone.trim(), password);
      showToast('Welcome to ASHOK PICKLES! 🌶️', 'success');
      onLoginSuccess();
    } catch (err: any) {
      const msg = err.message || 'Invalid credentials. Please verify your email/phone and password.';
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      background: 'radial-gradient(circle at 50% 20%, rgba(255, 179, 0, 0.08) 0%, rgba(198, 40, 40, 0.03) 60%, transparent 100%)',
    }}>
      <div style={{
        maxWidth: '460px',
        width: '100%',
        background: '#ffffff',
        borderRadius: '20px',
        padding: '40px 36px',
        boxShadow: '0 20px 40px rgba(50, 25, 15, 0.08)',
        border: '1.5px solid var(--border-subtle)',
      }}>
        {/* Back Link */}
        <button
          type="button"
          onClick={onBackToHome}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            fontWeight: '600',
            color: 'var(--text-muted)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            marginBottom: '20px',
            padding: 0,
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Store</span>
        </button>

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #b71c1c 0%, #e65100 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '30px',
            margin: '0 auto 14px auto',
            boxShadow: '0 6px 16px rgba(183, 28, 28, 0.35)',
          }}>
            🌶️
          </div>

          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '28px',
            fontWeight: '900',
            letterSpacing: '0.5px',
            color: '#b71c1c',
            textTransform: 'uppercase',
            marginBottom: '4px',
          }}>
            ASHOK PICKLES
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '600' }}>
            Sign in to access your orders & account
          </p>
        </div>

        {/* Error Alert if any */}
        {errorMessage && (
          <div style={{
            background: '#ffebee',
            border: '1px solid #ef9a9a',
            color: '#c62828',
            padding: '12px 14px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: '500',
            marginBottom: '20px',
          }}>
            {errorMessage}
          </div>
        )}

        {/* Sign In Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Email or Phone Input */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>
              Email Address or Mobile Number
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={18}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '14px', top: '14px' }}
              />
              <input
                type="text"
                required
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                placeholder="e.g. name@example.com or 9876543210"
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
                  borderRadius: '10px',
                  border: '1.5px solid var(--border-medium)',
                  fontSize: '14px',
                  outline: 'none',
                  background: '#faf9f7',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border-medium)')}
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={18}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '14px', top: '14px' }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={{
                  width: '100%',
                  padding: '12px 42px 12px 42px',
                  borderRadius: '10px',
                  border: '1.5px solid var(--border-medium)',
                  fontSize: '14px',
                  outline: 'none',
                  background: '#faf9f7',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border-medium)')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '12px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  padding: '2px',
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              marginTop: '10px',
              padding: '14px',
              fontSize: '15px',
              fontWeight: '700',
              borderRadius: '10px',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            {loading ? (
              <span>Signing in...</span>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Security & Authenticity Trust Seal */}
        <div style={{
          marginTop: '28px',
          paddingTop: '20px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          fontSize: '12px',
          color: 'var(--text-muted)',
          textAlign: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <ShieldCheck size={16} color="#2e7d32" />
            <span style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>
              256-Bit SSL Encrypted & Secure
            </span>
          </div>
          <p>
            FSSAI License: 10021042000889 | Official Store
          </p>
        </div>
      </div>
    </div>
  );
};
