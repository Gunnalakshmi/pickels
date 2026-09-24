import React, { useState } from 'react';
import { Search, MapPin, ShoppingBag, Heart, User, ShieldCheck, Sparkles, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useLocation } from '../../context/LocationContext';

interface NavbarProps {
  onOpenSearch: () => void;
  onOpenAuth: () => void;
  onNavigate: (page: string, param?: string) => void;
  currentPage: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSearch, onOpenAuth, onNavigate, currentPage }) => {
  const { user, isAdmin, logout } = useAuth();
  const { itemCount, setIsDrawerOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const { city, pincode, setPincodeModalOpen } = useLocation();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 90 }}>
      {/* Top Banner Announcement */}
      <div style={{
        background: 'linear-gradient(90deg, #7f0000 0%, #b71c1c 50%, #e65100 100%)',
        color: '#ffffff',
        padding: '6px 12px',
        fontSize: '11px',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        textAlign: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={13} color="#ffb300" />
          <span><strong>100% Handcrafted Pickles</strong> with Cold-Pressed Virgin Oils</span>
        </div>
        <span style={{ opacity: 0.6 }} className="hidden-mobile">|</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} className="hidden-mobile">
          <ShieldCheck size={13} color="#a5d6a7" />
          <span>FSSAI Certified Food Quality | <strong>Free Delivery above ₹499</strong></span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className="glass-header" style={{ padding: '10px 16px', transition: 'all 0.2s ease', background: 'rgba(255, 255, 255, 0.96)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}>
          {/* Logo & Brand Name: ASHOK PICKLES */}
          <div
            onClick={() => onNavigate('home')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', userSelect: 'none', flexShrink: 0 }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #b71c1c 0%, #e65100 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              boxShadow: '0 4px 12px rgba(183, 28, 28, 0.3)',
            }}>
              🌶️
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '20px',
                  fontWeight: '900',
                  letterSpacing: '0.3px',
                  color: '#b71c1c',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}>
                  ASHOK PICKLES
                </span>
              </div>
              <p className="desktop-only" style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', letterSpacing: '0.3px', marginTop: '-2px' }}>
                Authentic Taste. Delivered To Your Door.
              </p>
            </div>
          </div>

          {/* Location / Pincode Badge (Desktop only) */}
          <button
            type="button"
            className="desktop-only"
            onClick={() => setPincodeModalOpen(true)}
            style={{
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-muted)',
              border: '1px solid var(--border-subtle)',
              fontSize: '13px',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >
            <MapPin size={16} color="var(--primary)" />
            <div style={{ textAlign: 'left', lineHeight: '1.2' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>Deliver to</span>
              <strong style={{ color: 'var(--text-primary)' }}>{city} ({pincode})</strong>
            </div>
            <ChevronDown size={14} color="var(--text-muted)" />
          </button>

          {/* Search Trigger Bar (Desktop) */}
          <div
            onClick={onOpenSearch}
            className="desktop-only"
            style={{
              flex: '1',
              maxWidth: '460px',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 18px',
              background: '#ffffff',
              borderRadius: 'var(--radius-full)',
              border: '1.5px solid var(--border-medium)',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <Search size={18} color="var(--primary)" />
            <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              Search Avakaya, Gongura, Chicken Pickle, Garlic...
            </span>
          </div>

          {/* Right Action Icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            {/* Mobile Search Button */}
            <button
              type="button"
              onClick={onOpenSearch}
              className="mobile-only"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'var(--bg-muted)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-subtle)',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              title="Search Pickles"
            >
              <Search size={18} color="var(--text-primary)" />
            </button>

            {/* Wishlist (Desktop only) */}
            <button
              type="button"
              onClick={() => onNavigate('wishlist')}
              className="desktop-only"
              style={{
                position: 'relative',
                padding: '10px',
                borderRadius: '50%',
                background: currentPage === 'wishlist' ? 'var(--primary-light)' : 'transparent',
                color: currentPage === 'wishlist' ? 'var(--primary)' : 'var(--text-primary)',
                border: 'none',
                cursor: 'pointer',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Saved Wishlist"
            >
              <Heart size={22} fill={wishlistCount > 0 ? '#d32f2f' : 'none'} color={wishlistCount > 0 ? '#d32f2f' : 'currentColor'} />
              {wishlistCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  background: 'var(--primary)',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: '700',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: 'var(--radius-full)',
                background: 'linear-gradient(135deg, #c62828 0%, #b71c1c 100%)',
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '13px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-spice)',
              }}
            >
              <ShoppingBag size={18} />
              <span className="desktop-only">Cart</span>
              {itemCount > 0 && (
                <span style={{
                  background: '#ffffff',
                  color: 'var(--primary)',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: '800',
                }}>
                  {itemCount}
                </span>
              )}
            </button>

            {/* User Account / Login Button (Desktop only) */}
            <div className="desktop-only" style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => (user ? setIsUserMenuOpen(!isUserMenuOpen) : onNavigate('login'))}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-full)',
                  background: user ? 'var(--bg-muted)' : '#ffffff',
                  border: '1.5px solid var(--border-medium)',
                  fontSize: '14px',
                  fontWeight: '700',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: 'var(--primary-gradient)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                }}>
                  {user ? user.name.charAt(0).toUpperCase() : <User size={14} />}
                </div>
                <span>{user ? user.name.split(' ')[0] : 'Sign In'}</span>
                {user && <ChevronDown size={14} color="var(--text-muted)" />}
              </button>

              {/* User Dropdown Menu if Logged In */}
              {isUserMenuOpen && user && (
                <div
                  className="animate-fade-in"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '240px',
                    background: '#ffffff',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                    border: '1px solid var(--border-subtle)',
                    padding: '8px 0',
                    zIndex: 200,
                  }}
                >
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
                    <p style={{ fontWeight: '800', fontSize: '15px', color: 'var(--text-primary)' }}>{user.name}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{user.email || user.phone}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => { setIsUserMenuOpen(false); onNavigate('account'); }}
                    style={{ width: '100%', padding: '10px 16px', textAlign: 'left', fontSize: '13px', color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    My Account & Orders
                  </button>

                  <button
                    type="button"
                    onClick={() => { setIsUserMenuOpen(false); onNavigate('wishlist'); }}
                    style={{ width: '100%', padding: '10px 16px', textAlign: 'left', fontSize: '13px', color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Saved Wishlist ({wishlistCount})
                  </button>

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => { setIsUserMenuOpen(false); onNavigate('admin'); }}
                      style={{
                        width: '100%',
                        padding: '10px 16px',
                        textAlign: 'left',
                        fontSize: '13px',
                        color: '#b71c1c',
                        fontWeight: '700',
                        background: '#ffebee',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      ⚡ Admin Portal
                    </button>
                  )}

                  <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '4px 0' }} />

                  <button
                    type="button"
                    onClick={() => { setIsUserMenuOpen(false); logout(); }}
                    style={{ width: '100%', padding: '10px 16px', textAlign: 'left', fontSize: '13px', color: '#c62828', fontWeight: '700', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
