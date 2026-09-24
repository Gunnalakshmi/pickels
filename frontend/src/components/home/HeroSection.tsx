import React from 'react';
import { ArrowRight, ShieldCheck, Award, Sparkles, Flame, Heart } from 'lucide-react';

interface HeroSectionProps {
  onShopNow: () => void;
  onExploreCombos: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onShopNow, onExploreCombos }) => {
  return (
    <section style={{
      position: 'relative',
      background: 'linear-gradient(135deg, #241c19 0%, #1c1412 100%)',
      color: '#ffffff',
      padding: 'clamp(32px, 5vw, 60px) clamp(14px, 4vw, 24px) clamp(40px, 6vw, 70px) clamp(14px, 4vw, 24px)',
      overflow: 'hidden',
      borderBottom: '4px solid var(--primary)',
    }}>
      {/* Subtle Background Glow Elements */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '10%',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(198, 40, 40, 0.25) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        left: '5%',
        width: '350px',
        height: '350px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255, 179, 0, 0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
        gap: '32px',
        alignItems: 'center',
        position: 'relative',
        zIndex: 2,
      }}>
        {/* Left Column: Headlines & CTAs */}
        <div>
          {/* Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 179, 0, 0.12)',
            border: '1px solid rgba(255, 179, 0, 0.35)',
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            color: '#ffb300',
            fontSize: '12px',
            fontWeight: '700',
            marginBottom: '16px',
            maxWidth: '100%',
          }}>
            <Sparkles size={15} style={{ flexShrink: 0 }} />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Heritage Stone-Pounded Pickles</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.1rem, 5vw, 3.6rem)',
            lineHeight: '1.18',
            fontWeight: '800',
            color: '#ffffff',
            marginBottom: '16px',
          }}>
            Authentic Indian Pickles <br />
            <span style={{
              background: 'linear-gradient(90deg, #ff8f00 0%, #ff5722 50%, #d32f2f 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Delivered To Your Door
            </span>
          </h1>

          <p style={{
            fontSize: '15px',
            lineHeight: '1.65',
            color: '#d7ccc8',
            maxWidth: '520px',
            marginBottom: '26px',
          }}>
            Handcrafted with wood-pressed virgin sesame and mustard oils, sun-dried Guntur chillies, and traditional earthen maturation. 100% Homemade taste across India.
          </p>

          {/* Action Buttons */}
          <div className="hero-cta-group">
            <button
              onClick={onShopNow}
              className="btn-primary"
              style={{ padding: '13px 26px', fontSize: '15px' }}
            >
              <span>Shop Pickles</span>
              <ArrowRight size={18} />
            </button>

            <button
              onClick={onExploreCombos}
              style={{
                padding: '13px 24px',
                borderRadius: 'var(--radius-full)',
                border: '1.5px solid #ffb300',
                color: '#ffb300',
                fontSize: '15px',
                fontWeight: '700',
                background: 'rgba(255, 179, 0, 0.08)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
              }}
            >
              <span>Explore Non-Veg Pickles</span>
              <span>🌶️</span>
            </button>
          </div>

          {/* Metrics / Assurance Badges */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            borderTop: '1px solid rgba(255,255,255,0.12)',
            paddingTop: '18px',
          }}>
            <div>
              <div style={{ fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: '800', color: '#ffb300' }}>100%</div>
              <p style={{ fontSize: '11px', color: '#a1887f' }}>Homemade & Pure</p>
            </div>
            <div>
              <div style={{ fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: '800', color: '#a5d6a7' }}>FSSAI</div>
              <p style={{ fontSize: '11px', color: '#a1887f' }}>Govt. Certified</p>
            </div>
            <div>
              <div style={{ fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: '800', color: '#ff8a80' }}>50k+</div>
              <p style={{ fontSize: '11px', color: '#a1887f' }}>Pickle Lovers</p>
            </div>
          </div>
        </div>

        {/* Right Column: Hero Visual Card */}
        <div style={{ position: 'relative' }}>
          <div style={{
            position: 'relative',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
            border: '2px solid rgba(255, 179, 0, 0.3)',
          }}>
            <img
              src="/pickle_jar_hero.jpg"
              alt="Authentic Indian Pickle Jar"
              style={{ width: '100%', height: 'clamp(230px, 45vw, 420px)', objectFit: 'cover' }}
            />

            {/* Floating Pickle Highlight Card */}
            <div style={{
              position: 'absolute',
              bottom: '12px',
              left: '12px',
              right: '12px',
              background: 'rgba(28, 20, 18, 0.92)',
              backdropFilter: 'blur(10px)',
              borderRadius: '14px',
              padding: '12px 14px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
            }}>
              <div>
                <span style={{ fontSize: '10px', fontWeight: '700', color: '#ffb300', textTransform: 'uppercase' }}>
                  Andhra Avakaya & Gongura
                </span>
                <h4 style={{ fontSize: '13px', color: '#ffffff', marginTop: '2px' }}>
                  Aromatic Wood-Pressed Sesame Tadka
                </h4>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <span style={{ fontSize: '16px', fontWeight: '800', color: '#ff8a80' }}>From ₹160</span>
                <span style={{ fontSize: '10px', color: '#a5d6a7', display: 'block' }}>Free Delivery ₹499+</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
