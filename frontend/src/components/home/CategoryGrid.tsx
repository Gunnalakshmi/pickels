import React from 'react';
import { Category } from '../../types';
import { ArrowRight } from 'lucide-react';

interface CategoryGridProps {
  categories: Category[];
  onSelectCategory: (categorySlug: string) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ categories, onSelectCategory }) => {
  return (
    <section style={{ maxWidth: '1280px', margin: '60px auto 0 auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            Handcrafted Flavors
          </span>
          <h2 style={{ fontSize: '28px', color: 'var(--text-primary)', marginTop: '4px' }}>
            Explore Pickle Categories
          </h2>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '16px',
      }}>
        {categories.map((cat) => (
          <div
            key={cat.id}
            onClick={() => onSelectCategory(cat.slug)}
            className="glass-card"
            style={{
              padding: '16px',
              textAlign: 'center',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }}
          >
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              overflow: 'hidden',
              marginBottom: '12px',
              border: '2px solid var(--border-medium)',
              background: '#faf4ee',
            }}>
              <img
                src={cat.image_url}
                alt={cat.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <h4 style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '2px' }}>
              {cat.name}
            </h4>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {cat.product_count || 1} Varieties
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};
