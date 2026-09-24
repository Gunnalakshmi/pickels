import React, { useState, useEffect } from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { VegNonVegToggle } from '../components/common/VegNonVegToggle';
import { ProductCard } from '../components/product/ProductCard';
import { CustomerReviewsCarousel } from '../components/home/CustomerReviewsCarousel';
import { HeritageStory } from '../components/home/HeritageStory';
import { Product } from '../types';
import { api } from '../services/api';
import { Loader2 } from 'lucide-react';

interface HomePageProps {
  onSelectProduct: (product: Product) => void;
  onNavigate: (page: string, param?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onSelectProduct, onNavigate }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [dietarySelection, setDietarySelection] = useState<'veg' | 'non-veg'>('veg');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllProducts = async () => {
      setLoading(true);
      try {
        const res = await api.getProducts({ limit: 50 });
        if (res.success) {
          setProducts(res.products);
        }
      } catch (err) {
        console.error('Failed to load products on home page:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllProducts();
  }, []);

  const vegProducts = products.filter(p => p.dietary_type === 'veg');
  const nonVegProducts = products.filter(p => p.dietary_type === 'non-veg');
  const displayedProducts = dietarySelection === 'veg' ? vegProducts : nonVegProducts;

  return (
    <div>
      {/* Hero Section */}
      <HeroSection
        onShopNow={() => {
          const el = document.getElementById('pickle-catalog-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onExploreCombos={() => {
          setDietarySelection('non-veg');
          const el = document.getElementById('pickle-catalog-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Main Catalog Section with Veg/Non-Veg Toggle */}
      <section
        id="pickle-catalog-section"
        style={{
          maxWidth: '1280px',
          margin: '40px auto 0 auto',
          padding: '0 20px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
          <span style={{
            fontSize: '13px',
            fontWeight: '800',
            color: '#b71c1c',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}>
            Handcrafted Traditional Pickles
          </span>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '32px',
            fontWeight: '900',
            color: 'var(--text-primary)',
            marginTop: '6px',
          }}>
            {dietarySelection === 'veg' ? '100% Vegetarian Pickles' : 'Authentic Non-Vegetarian Pickles'}
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '600px', margin: '4px auto 0 auto' }}>
            {dietarySelection === 'veg'
              ? 'Handmade raw mango, gongura, amla, and country vegetable pickles steeped in cold-pressed virgin sesame oil.'
              : 'Slow-cooked juicy chicken, tender mutton, coastal prawns, and sea fish pickles in rich Guntur chilli spices.'}
          </p>
        </div>

        {/* Clear Veg / Non-Veg Toggle */}
        <VegNonVegToggle
          selected={dietarySelection}
          onChange={(type) => setDietarySelection(type)}
          vegCount={vegProducts.length || 15}
          nonVegCount={nonVegProducts.length || 15}
        />

        {/* 4-Column Responsive Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
            <Loader2 size={32} className="spin" style={{ margin: '0 auto 12px auto', color: 'var(--primary)' }} />
            <p style={{ fontWeight: '600' }}>Fetching freshly prepared pickles from our kitchen...</p>
          </div>
        ) : (
          <div className="product-grid-4col" style={{ marginTop: '28px' }}>
            {displayedProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onSelect={onSelectProduct}
              />
            ))}
          </div>
        )}
      </section>

      {/* Heritage Story */}
      <HeritageStory
        onShopNow={() => {
          const el = document.getElementById('pickle-catalog-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Verified Customer Reviews Carousel */}
      <CustomerReviewsCarousel />
    </div>
  );
};
