import React from 'react';
import { ShieldCheck, Clock, Palette, Award } from 'lucide-react';

const BADGES = [
  { icon: ShieldCheck, label: 'Vệ Sinh & An Toàn' },
  { icon: Clock, label: 'Bền Màu Lâu Dài' },
  { icon: Palette, label: 'Đa Dạng Mẫu Thiết Kế' },
  { icon: Award, label: 'Chuyên Gia Tay Nghề Cao' },
];

export const TrustBadgeStrip: React.FC = () => {
  return (
    <section className="trust-badge-strip">
      <div className="container trust-badge-grid">
        {BADGES.map(({ icon: Icon, label }) => (
          <div key={label} className="trust-badge-item">
            <Icon size={18} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
};
