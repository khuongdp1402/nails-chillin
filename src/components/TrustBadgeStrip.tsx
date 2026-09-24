import '../styles/hero.css';
import React from 'react';
import { ShieldCheck, Clock, Palette, Award } from 'lucide-react';
import { Squiggle } from './Squiggle';

const BADGES = [
  { icon: ShieldCheck, label: 'Vệ sinh, an toàn' },
  { icon: Clock, label: 'Màu bền 3–4 tuần' },
  { icon: Palette, label: 'Hàng trăm mẫu để chọn' },
  { icon: Award, label: 'Thợ tay nghề cao' },
];

/** Four trust items; rendered inside the footer's ombre section. */
export const TrustBadgeStrip: React.FC = () => (
  <div className="hx-trust">
    {BADGES.map(({ icon: Icon, label }, i) => (
      <React.Fragment key={label}>
        {i > 0 && <Squiggle vertical className="hx-trust-sep" />}
        <div className="hx-trust-item">
          <Icon size={18} />
          <span>{label}</span>
        </div>
      </React.Fragment>
    ))}
  </div>
);
