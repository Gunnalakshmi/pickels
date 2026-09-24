import React from 'react';
import { ShieldCheck, Heart, Sparkles, Award } from 'lucide-react';

export const HeritageStory: React.FC<{ onShopNow: () => void }> = ({ onShopNow }) => {
  return (
    <section style={{ maxWidth: '1280px', margin: '40px auto', padding: '0 14px' }}>
      <div style={{
        background: 'linear-gradient(135deg, #faf3ec 0%, #f4ede4 100%)',
        borderRadius: 'var(--radius-lg)',
        padding: 'clamp(24px, 5vw, 48px) clamp(16px, 4vw, 36px)',
        border: '1px solid var(--border-subtle)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
        gap: '30px',
        alignItems: 'center',
      }}>
        <div>
          <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            The ASHOK PICKLES Promise
          </span>
          <h2 style={{ fontSize: 'clamp(22px, 4vw, 30px)', color: 'var(--text-primary)', margin: '8px 0 14px 0' }}>
            Why Nothing Beats Traditional Grandma’s Recipe
          </h2>
          <p style={{ fontSize: '14px', lineHeight: '1.7', color: 'var(--text-secondary)', marginBottom: '18px' }}>
            Most commercial supermarket pickles use cheap palm oil, artificial colorings, and excess synthetic acetic acid. At ASHOK PICKLES, our pickles are aged in traditional glazed ceramic barnis (Jaadis), using pure wood-pressed gingelly or kachi ghani mustard oil.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
              <span style={{ color: 'var(--curry-green)' }}>✓</span> Cold-Pressed Virgin Oils
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
              <span style={{ color: 'var(--curry-green)' }}>✓</span> Zero Added Chemicals
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
              <span style={{ color: 'var(--curry-green)' }}>✓</span> Guntur & Degi Mirch
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
              <span style={{ color: 'var(--curry-green)' }}>✓</span> FSSAI Certified Safe
            </div>
          </div>

          <button onClick={onShopNow} className="btn-primary" style={{ padding: '12px 26px', fontSize: '14px' }}>
            Taste the Heritage
          </button>
        </div>

        <div style={{ position: 'relative' }}>
          <img
            src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=80"
            alt="Traditional Indian Spice Preparation"
            style={{ width: '100%', height: 'clamp(200px, 40vw, 340px)', objectFit: 'cover', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)' }}
          />
        </div>
      </div>
    </section>
  );
};
