import React, { useState, useEffect } from 'react';
import { ProductFilters } from '../components/product/ProductFilters';
import { ProductCard } from '../components/product/ProductCard';
import { Product, Category } from '../types';
import { api } from '../services/api';
import { Filter, ArrowUpDown, Loader2 } from 'lucide-react';

interface ProductsPageProps {
  initialCategory?: string;
  onSelectProduct: (product: Product) => void;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({ initialCategory, onSelectProduct }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [filters, setFilters] = useState({
    category: initialCategory || 'all',
    dietary: 'all',
    spice: 'all',
    region: 'all',
    minPrice: '',
    maxPrice: '',
    inStockOnly: false,
    sort: 'popular',
  });

  useEffect(() => {
    if (initialCategory) {
      setFilters(prev => ({ ...prev, category: initialCategory }));
    }
  }, [initialCategory]);

  useEffect(() => {
    api.getCategories().then(res => {
      if (res.success) setCategories(res.categories);
    });
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await api.getProducts({
          category: filters.category === 'all' ? '' : filters.category,
          dietary: filters.dietary === 'all' ? '' : filters.dietary,
          spice: filters.spice === 'all' ? '' : filters.spice,
          region: filters.region === 'all' ? '' : filters.region,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          inStockOnly: filters.inStockOnly,
          sort: filters.sort,
        });

        if (res.success) {
          setProducts(res.products);
        }
      } catch (err) {
        console.error('Products fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [filters]);

  const handleResetFilters = () => {
    setFilters({
      category: 'all',
      dietary: 'all',
      spice: 'all',
      region: 'all',
      minPrice: '',
      maxPrice: '',
      inStockOnly: false,
      sort: 'popular',
    });
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '30px auto', padding: '0 20px 80px 20px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', color: 'var(--text-primary)' }}>
            {filters.category !== 'all'
              ? `${categories.find(c => c.slug === filters.category)?.name || 'Pickle'} Selection`
              : 'All Authentic Indian Pickles'}
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Showing {products.length} handcrafted recipes
          </p>
        </div>

        {/* Sort & Mobile Filter Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="btn-outline"
            style={{ padding: '8px 14px', fontSize: '13px' }}
          >
            <Filter size={16} />
            <span>Filters</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fff', border: '1.5px solid var(--border-medium)', borderRadius: 'var(--radius-sm)', padding: '6px 12px' }}>
            <ArrowUpDown size={14} color="var(--text-muted)" />
            <select
              value={filters.sort}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}
            >
              <option value="popular">Most Popular</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest Arrivals</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Layout: Sidebar Filters + Products Grid */}
      <div style={{ display: 'flex', gap: '28px', alignItems: 'flex-start' }}>
        {/* Left Filter Sidebar */}
        <div style={{ width: '270px', flexShrink: 0 }} className={showMobileFilters ? '' : 'hidden-mobile'}>
          <ProductFilters
            categories={categories}
            filters={filters}
            onChange={setFilters}
            onReset={handleResetFilters}
          />
        </div>

        {/* Right Products Grid */}
        <div style={{ flex: 1 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
              <Loader2 size={28} className="spin" style={{ margin: '0 auto 12px auto' }} />
              <p>Fetching freshly prepared pickles...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '42px', marginBottom: '10px' }}>🌶️</div>
              <h3 style={{ fontSize: '18px', color: 'var(--text-primary)' }}>No Pickles Found Matching Filters</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Try relaxing the price or spice filter criteria.
              </p>
              <button onClick={handleResetFilters} className="btn-primary" style={{ marginTop: '16px', padding: '8px 20px', fontSize: '13px' }}>
                Reset All Filters
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '20px',
            }}>
              {products.map(prod => (
                <ProductCard key={prod.id} product={prod} onSelect={onSelectProduct} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
