import React from 'react';
import { ShieldCheck, Award, Truck, Lock, Phone, Mail, MapPin } from 'lucide-react';

export const Footer: React.FC<{ onNavigate: (page: string, param?: string) => void }> = ({ onNavigate }) => {
  return (
    <footer style={{ background: '#1c1412', color: '#ffffff', marginTop: '60px', borderTop: '4px solid #c62828' }}>
      {/* Value Badges Banner */}
      <div style={{ background: '#291e1a', borderBottom: '1px solid #3e2e28', padding: '30px 20px' }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#3e2e28', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award color="#ffb300" size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '15px', color: '#ffffff' }}>100% Traditional Recipe</h4>
              <p style={{ fontSize: '12px', color: '#b8a59f' }}>Authentic stone-pounded pickles</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#3e2e28', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck color="#4caf50" size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '15px', color: '#ffffff' }}>FSSAI Certified Safe</h4>
              <p style={{ fontSize: '12px', color: '#b8a59f' }}>Lic. #10021042000889</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#3e2e28', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Truck color="#29b6f6" size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '15px', color: '#ffffff' }}>Pan-India Fast Delivery</h4>
              <p style={{ fontSize: '12px', color: '#b8a59f' }}>Free delivery above ₹499</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#3e2e28', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Lock color="#ab47bc" size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '15px', color: '#ffffff' }}>Safe & Secure Payments</h4>
              <p style={{ fontSize: '12px', color: '#b8a59f' }}>UPI, Cards, NetBanking & COD</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '50px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '40px' }}>
        {/* Col 1: Brand Info */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <span style={{ fontSize: '28px' }}>🌶️</span>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', fontWeight: '900', color: '#ffb300', textTransform: 'uppercase' }}>
              ASHOK PICKLES
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#b8a59f', lineHeight: '1.7', marginBottom: '16px' }}>
            Preserving Andhra and Telangana culinary heritage jar by jar. Handcrafted by master pickle artisans with wood-pressed virgin sesame oil, sun-dried Guntur chillies, and traditional earthenware maturation.
          </p>
          <div style={{
            display: 'inline-block',
            background: 'rgba(255, 179, 0, 0.1)',
            border: '1px solid rgba(255, 179, 0, 0.3)',
            borderRadius: '8px',
            padding: '8px 12px',
            fontSize: '12px',
            color: '#ffb300',
          }}>
            🏛️ FSSAI Central License: 10021042000889
          </div>
        </div>

        {/* Col 2: Categories */}
        <div>
          <h4 style={{ fontSize: '16px', color: '#ffffff', marginBottom: '16px', borderBottom: '2px solid #c62828', paddingBottom: '6px', display: 'inline-block' }}>
            Authentic Specialities
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#b8a59f' }}>
            <li><button onClick={() => onNavigate('home')} style={{ color: 'inherit', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}>Avakaya (Mango Pickle) - ఆవకాయ</button></li>
            <li><button onClick={() => onNavigate('home')} style={{ color: 'inherit', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}>Gongura Pickle - గోంగూర పచ్చడి</button></li>
            <li><button onClick={() => onNavigate('home')} style={{ color: 'inherit', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}>Boneless Chicken Pickle - చికెన్ పచ్చడి</button></li>
            <li><button onClick={() => onNavigate('home')} style={{ color: 'inherit', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}>Tender Mutton Pickle - మటన్ పచ్చడి</button></li>
            <li><button onClick={() => onNavigate('home')} style={{ color: 'inherit', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}>Coastal Prawn Pickle - రొయ్యల పచ్చడి</button></li>
          </ul>
        </div>

        {/* Col 3: Customer Care & Regulatory */}
        <div>
          <h4 style={{ fontSize: '16px', color: '#ffffff', marginBottom: '16px', borderBottom: '2px solid #e65100', paddingBottom: '6px', display: 'inline-block' }}>
            Compliance & Support
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: '#b8a59f' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Phone size={16} color="#ffb300" />
              <span>+91 98765 43210 (Mon-Sat, 9AM-7PM)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={16} color="#ffb300" />
              <span>support@ashokpickles.in</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <MapPin size={16} color="#ffb300" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>Plot 45, Food Park, Gachibowli, Hyderabad, Telangana - 500032</span>
            </div>
            <div style={{ fontSize: '12px', color: '#8d7b75', marginTop: '6px' }}>
              GSTIN: 36AAACP1234M1Z5 | Food Safety Compliant
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div style={{ background: '#120d0b', borderTop: '1px solid #291e1a', padding: '16px 20px', textAlign: 'center', fontSize: '12px', color: '#8d7b75' }}>
        <p>© {new Date().getFullYear()} ASHOK PICKLES. All rights reserved. Handcrafted with authentic taste in India.</p>
      </div>
    </footer>
  );
};
