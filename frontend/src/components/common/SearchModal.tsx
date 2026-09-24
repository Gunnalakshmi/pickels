import React, { useState, useEffect } from 'react';
import { Search, X, Flame, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { Product } from '../../types';
import { api } from '../../services/api';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  onNavigateToCategory: (categorySlug: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onSelectProduct, onNavigateToCategory }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const popularTags = [
    { label: 'Andhra Avakaya', q: 'Avakaya' },
    { label: 'Gongura Pachadi', q: 'Gongura' },
    { label: 'Boneless Chicken', q: 'Chicken' },
    { label: 'Coastal Prawns', q: 'Prawn' },
    { label: 'Banarasi Chilli', q: 'Banarasi' },
    { label: 'Desi Garlic', q: 'Garlic' },
    { label: 'Sun Dried Lemon', q: 'Lemon' },
    { label: 'Combo Boxes', q: 'Combo' },
  ];

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.getProducts({ search: query.trim(), limit: 8 });
        if (res.success) {
          setResults(res.products);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.65)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: '60px',
      zIndex: 1000,
      padding: '20px',
    }}>
      <div className="animate-slide-up" style={{
        background: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        maxWidth: '640px',
        width: '100%',
        boxShadow: 'var(--shadow-lg)',
        overflow: 'hidden',
      }}>
        {/* Search Input Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-subtle)',
        }}>
          <Search size={22} color="var(--primary)" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by pickle name, region, spice, or ingredient..."
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '16px',
              fontWeight: '500',
              color: 'var(--text-primary)',
            }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ color: 'var(--text-muted)' }}>
              <X size={18} />
            </button>
          )}
          <button onClick={onClose} style={{ padding: '6px 12px', borderRadius: '8px', background: 'var(--bg-muted)', fontSize: '13px', fontWeight: '600' }}>
            Esc
          </button>
        </div>

        {/* Popular Tags */}
        <div style={{ padding: '16px 24px', background: 'var(--bg-main)', borderBottom: '1px solid var(--border-subtle)' }}>
          <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Trending Searches
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {popularTags.map(tag => (
              <button
                key={tag.label}
                onClick={() => setQuery(tag.q)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-full)',
                  background: '#ffffff',
                  border: '1px solid var(--border-medium)',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>🔥</span>
                <span>{tag.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Live Search Results */}
        <div style={{ maxHeight: '380px', overflowY: 'auto', padding: '12px 24px' }}>
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '30px', color: 'var(--text-muted)' }}>
              <Loader2 size={20} className="spin" />
              <span>Finding authentic pickles...</span>
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>No pickles found for "{query}"</p>
              <p style={{ fontSize: '13px', marginTop: '4px' }}>Try searching for "Avakaya", "Chicken", "Garlic" or "Mango"</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {results.map(prod => (
                <div
                  key={prod.id}
                  onClick={() => { onSelectProduct(prod); onClose(); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '10px',
                    borderRadius: 'var(--radius-md)',
                    background: '#ffffff',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'var(--primary-light)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.background = '#ffffff'; }}
                >
                  <img
                    src={prod.primary_image}
                    alt={prod.name}
                    style={{ width: '54px', height: '54px', objectFit: 'cover', borderRadius: '8px' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className={prod.dietary_type === 'non-veg' ? 'badge-nonveg' : 'badge-veg'}>
                        <span className={prod.dietary_type === 'non-veg' ? 'badge-nonveg-triangle' : 'badge-veg-dot'} />
                      </span>
                      <h4 style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{prod.name}</h4>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {prod.regional_style} • ⭐ {prod.rating} ({prod.review_count} reviews)
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--primary)' }}>
                      ₹{prod.base_price}
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--curry-green)', fontWeight: '700' }}>
                      {prod.discount_percentage}% OFF
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
