import React from 'react';
import { Home, Grid, Search, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

interface MobileNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onOpenSearch: () => void;
  onOpenAuth: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentPage, onNavigate, onOpenSearch, onOpenAuth }) => {
  const { itemCount, setIsDrawerOpen } = useCart();
  const { user } = useAuth();

  return (
    <div className="mobile-nav-bar">
      <button
        type="button"
        onClick={() => onNavigate('home')}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px',
          color: currentPage === 'home' ? 'var(--primary)' : 'var(--text-muted)',
          fontSize: '11px',
          fontWeight: '600',
        }}
      >
        <Home size={20} />
        <span>Home</span>
      </button>

      <button
        onClick={() => onNavigate('products')}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px',
          color: currentPage === 'products' ? 'var(--primary)' : 'var(--text-muted)',
          fontSize: '11px',
          fontWeight: '600',
        }}
      >
        <Grid size={20} />
        <span>Pickles</span>
      </button>

      <button
        onClick={onOpenSearch}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px',
          color: 'var(--text-muted)',
          fontSize: '11px',
          fontWeight: '600',
        }}
      >
        <Search size={20} />
        <span>Search</span>
      </button>

      <button
        onClick={() => setIsDrawerOpen(true)}
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px',
          color: 'var(--text-muted)',
          fontSize: '11px',
          fontWeight: '600',
        }}
      >
        <ShoppingBag size={20} />
        <span>Cart</span>
        {itemCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-4px',
            right: '4px',
            background: 'var(--primary)',
            color: '#fff',
            fontSize: '10px',
            fontWeight: '700',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {itemCount}
          </span>
        )}
      </button>

      <button
        onClick={() => (user ? onNavigate('account') : onOpenAuth())}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px',
          color: currentPage === 'account' ? 'var(--primary)' : 'var(--text-muted)',
          fontSize: '11px',
          fontWeight: '600',
        }}
      >
        <User size={20} />
        <span>{user ? 'Account' : 'Sign In'}</span>
      </button>
    </div>
  );
};
