import '../styles/hero.css';
import React from 'react';
import { ShieldCheck, Clock, Palette, Award } from 'lucide-react';
import { useReveal } from '../hooks/useReveal';

const BADGES = [
  { icon: ShieldCheck, label: 'Vệ sinh, an toàn' },
  { icon: Clock, label: 'Màu bền 3–4 tuần' },
  { icon: Palette, label: 'Hàng trăm mẫu để chọn' },
  { icon: Award, label: 'Thợ tay nghề cao' },
];

export const TrustBadgeStrip: React.FC = () => {
  const ref = useReveal<HTMLElement>();
  return (
    <section ref={ref} className="hx-trust">
      <div className="container hx-container hx-trust-grid">
        {BADGES.map(({ icon: Icon, label }) => (
          <div key={label} className="hx-trust-item">
            <Icon size={18} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
};
