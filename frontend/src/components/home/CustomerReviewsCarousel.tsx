import React from 'react';
import { Star, ShieldCheck, Heart, Sparkles } from 'lucide-react';

export const CustomerReviewsCarousel: React.FC = () => {
  const reviews = [
    {
      id: 1,
      name: 'Ananya Deshmukh',
      city: 'Pune, Maharashtra',
      pickle: 'Andhra Avakaya Mango Pickle',
      rating: 5,
      comment: 'The pungency of mustard and wood-pressed gingelly oil took me straight back to my grandmother’s kitchen in Guntur. Not a trace of synthetic vinegar!',
    },
    {
      id: 2,
      name: 'Karthik Narayanan',
      city: 'Bengaluru, Karnataka',
      pickle: 'Hyderabadi Boneless Chicken Pickle',
      rating: 5,
      comment: 'Ordered the 1kg pack for our family. Juicy boneless country chicken with balanced spices and curry leaves. Already placed our second order!',
    },
    {
      id: 3,
      name: 'Simran Gill',
      city: 'Chandigarh, Punjab',
      pickle: 'Banarasi Stuffed Red Chilli (Bharwa Mirch)',
      rating: 5,
      comment: 'Plump sun-cured chillies packed with roasted whole spices. Eating this with hot parathas is heavenly. Superb tamper-proof packaging.',
    },
  ];

  return (
    <section style={{ background: '#241c19', color: '#ffffff', padding: 'clamp(40px, 6vw, 60px) clamp(14px, 4vw, 20px)', margin: '40px 0 0 0' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#ffb300', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Voice of Real Pickle Lovers
          </span>
          <h2 style={{ fontSize: 'clamp(24px, 5vw, 32px)', color: '#ffffff', marginTop: '6px' }}>
            Loved Across Indian Homes
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: '20px',
        }}>
          {reviews.map((rev) => (
            <div
              key={rev.id}
              style={{
                background: '#2e2320',
                padding: '24px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #44322c',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', gap: '2px', marginBottom: '12px' }}>
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} size={15} fill="#ffb300" color="#ffb300" />
                  ))}
                </div>
                <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#d7ccc8', fontStyle: 'italic', marginBottom: '16px' }}>
                  "{rev.comment}"
                </p>
              </div>

              <div style={{ borderTop: '1px solid #44322c', paddingTop: '12px' }}>
                <strong style={{ fontSize: '14px', color: '#ffffff', display: 'block' }}>{rev.name}</strong>
                <span style={{ fontSize: '12px', color: '#a1887f' }}>{rev.city} • Verified Buyer</span>
                <div style={{ fontSize: '11px', color: '#ffb300', marginTop: '2px', fontWeight: '600' }}>
                  Bought: {rev.pickle}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
