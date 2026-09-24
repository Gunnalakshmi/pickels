import React from 'react';
import { Category } from '../../types';
import { Filter, RotateCcw, Flame } from 'lucide-react';

interface FiltersState {
  category: string;
  dietary: string;
  spice: string;
  region: string;
  minPrice: string;
  maxPrice: string;
  inStockOnly: boolean;
  sort: string;
}

interface ProductFiltersProps {
  categories: Category[];
  filters: FiltersState;
  onChange: (filters: FiltersState) => void;
  onReset: () => void;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({ categories, filters, onChange, onReset }) => {
  const regions = [
    { label: 'All Regions', val: 'all' },
    { label: 'Andhra Pradesh', val: 'Andhra' },
    { label: 'Kerala Coastal', val: 'Kerala' },
    { label: 'Rajasthan', val: 'Rajasthan' },
    { label: 'Punjab', val: 'Punjab' },
    { label: 'Banaras / UP', val: 'Banaras' },
  ];

  const spiceLevels = [
    { label: 'All Spices', val: 'all' },
    { label: 'Mild', val: 'mild' },
    { label: 'Medium', val: 'medium' },
    { label: 'Spicy', val: 'spicy' },
    { label: 'Extra Spicy 🔥', val: 'extra-spicy' },
  ];

  return (
    <div className="glass-card" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={18} color="var(--primary)" />
          <h3 style={{ fontSize: '16px', color: 'var(--text-primary)' }}>Filters</h3>
        </div>
        <button
          onClick={onReset}
          style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--primary)', fontWeight: '600' }}
        >
          <RotateCcw size={13} />
          <span>Reset</span>
        </button>
      </div>

      {/* Dietary Toggle (Veg vs Non-Veg) */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '8px' }}>
          Dietary Preference
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { label: 'All', val: 'all' },
            { label: 'Veg Only 🟢', val: 'veg' },
            { label: 'Non-Veg 🔴', val: 'non-veg' },
          ].map(d => (
            <button
              key={d.val}
              onClick={() => onChange({ ...filters, dietary: d.val })}
              style={{
                flex: 1,
                padding: '6px 8px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
                fontWeight: '600',
                background: filters.dietary === d.val ? 'var(--primary)' : 'var(--bg-muted)',
                color: filters.dietary === d.val ? '#ffffff' : 'var(--text-secondary)',
                border: `1px solid ${filters.dietary === d.val ? 'var(--primary)' : 'var(--border-subtle)'}`,
              }}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '8px' }}>
          Categories
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
            <input
              type="radio"
              name="cat"
              checked={filters.category === 'all' || !filters.category}
              onChange={() => onChange({ ...filters, category: 'all' })}
            />
            <span>All Categories</span>
          </label>
          {categories.map(c => (
            <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="cat"
                checked={filters.category === c.slug}
                onChange={() => onChange({ ...filters, category: c.slug })}
              />
              <span>{c.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Spice Level */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '8px' }}>
          Spice Intensity
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {spiceLevels.map(s => (
            <label key={s.val} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="spice"
                checked={filters.spice === s.val}
                onChange={() => onChange({ ...filters, spice: s.val })}
              />
              <span>{s.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Regional Style */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '8px' }}>
          Regional Origin
        </label>
        <select
          value={filters.region}
          onChange={(e) => onChange({ ...filters, region: e.target.value })}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            border: '1.5px solid var(--border-medium)',
            fontSize: '13px',
            outline: 'none',
          }}
        >
          {regions.map(r => (
            <option key={r.val} value={r.val}>{r.label}</option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '8px' }}>
          Price Range (₹)
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => onChange({ ...filters, minPrice: e.target.value })}
            style={{ width: '50%', padding: '6px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '13px' }}
          />
          <span>-</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => onChange({ ...filters, maxPrice: e.target.value })}
            style={{ width: '50%', padding: '6px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '13px' }}
          />
        </div>
      </div>

      {/* In-Stock Toggle */}
      <div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) => onChange({ ...filters, inStockOnly: e.target.checked })}
          />
          <span>In-Stock Pickles Only</span>
        </label>
      </div>
    </div>
  );
};
