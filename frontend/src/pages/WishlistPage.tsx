import React from 'react';
import { useWishlist } from '../context/WishlistContext';
import { ProductCard } from '../components/product/ProductCard';
import { Product } from '../types';
import { Heart, ArrowRight } from 'lucide-react';

interface WishlistPageProps {
  onSelectProduct: (product: Product) => void;
  onExplore: () => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({ onSelectProduct, onExplore }) => {
  const { wishlist } = useWishlist();

  return (
    <div style={{ maxWidth: '1280px', margin: '30px auto', padding: '0 20px 80px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
        <Heart size={24} color="var(--primary)" fill="var(--primary)" />
        <h1 style={{ fontSize: '28px', color: 'var(--text-primary)' }}>Your Saved Pickles ({wishlist.length})</h1>
      </div>

      {wishlist.length === 0 ? (
        <div className="glass-card" style={{ padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>❤️</div>
          <h3 style={{ fontSize: '20px', color: 'var(--text-primary)' }}>Your Wishlist is Empty</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '400px', margin: '8px auto 20px auto' }}>
            Tap the heart icon on any pickle recipe to save it for quick reordering later.
          </p>
          <button onClick={onExplore} className="btn-primary" style={{ padding: '12px 28px', fontSize: '14px' }}>
            <span>Explore Pickles</span>
            <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '24px',
        }}>
          {wishlist.map(prod => (
            <ProductCard key={prod.id} product={prod} onSelect={onSelectProduct} />
          ))}
        </div>
      )}
    </div>
  );
};
